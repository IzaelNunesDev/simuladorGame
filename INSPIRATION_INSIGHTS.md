# Inspiration Notes

Base analisada: `inspiration/Geographical-Adventures-main`

Objetivo deste documento:
- entender como o projeto de referência organiza fisica, camera, mar, terreno, atmosfera e ciclo dia/noite
- separar o que vale reaproveitar como logica/arquitetura
- evitar copiar shaders/assets diretamente

## Resumo Executivo

O projeto de referencia nao tenta fazer uma simulacao aerodinamica completa. Ele ganha qualidade percebida com uma combinacao muito eficiente de:
- controle de voo simplificado, mas coerente com um planeta esferico
- altitude tratada como estado escalar separado da posicao angular no planeta
- camera com modos claros e FOV dependente da velocidade
- lookup de terreno via mapa processado na GPU, em vez de recalcular geometria inteira na CPU
- oceano geometricamente simples, com riqueza vinda do shader
- iluminacao dia/noite orientada por sistema solar e materiais parametrizados
- culling/LOD e divisao em chunks para segurar custo de render

Insight principal:
o “segredo” deles nao e um shader isolado. E a divisao do problema em camadas simples:
1. locomocao sobre esfera
2. altura/terreno consultados por lookup barato
3. camera e FOV reforcando sensacao de voo
4. shading vendendo atmosfera/oceano/noite

## Arquivos Mais Relevantes

Controle/fisica:
- `Assets/Scripts/Game/Player/Player.cs`
- `Assets/Scripts/Game/Player/GameCamera.cs`
- `Assets/Scripts/Game/Terrain Lookup/WorldLookup.cs`
- `Assets/Scripts/Game/Misc/GeoMaths.cs`

Terreno/oceano:
- `Assets/Scripts/Generation/Terrain/TerrainGenerator.cs`
- `Assets/Scripts/Generation/Terrain/OceanGenerator.cs`
- `Assets/Scripts/Generation/Terrain/TerrainHeightProcessor.cs`
- `Assets/Scripts/Generation/Terrain/SimpleLodSystem.cs`

Iluminacao/tempo:
- `Assets/Scripts/Game/Solar System/SolarSystemManager.cs`
- `Assets/Scripts/Game/Solar System/Sun.cs`
- `Assets/Scripts/Game/Misc/RenderSettingsController.cs`

Shading de referencia:
- `Assets/Scripts/Shaders/Game/Terrain.shader`
- `Assets/Scripts/Shaders/Game/Ocean.shader`
- `Assets/Scripts/Shader Common/Shading.hlsl`
- `Assets/Scripts/Shader Common/Triplanar.hlsl`
- `Assets/Scripts/Shader Common/SimplexNoise.hlsl`

## Como Eles Fazem o Controle/Fisica

Fonte: `Player.cs`

Eles usam um modelo de voo arcade, mas muito legivel:
- yaw gira o aviao ao redor de `gravityUp`
- pitch nao “empurra” diretamente a malha no espaco: ele altera um angulo interno
- esse angulo e convertido em dois componentes:
  - `forwardSpeed = cos(pitch) * speed`
  - `verticalVelocity = -sin(pitch) * speed`
- a altitude (`currentElevation`) e um escalar separado
- a posicao final no planeta e sempre `normalize(pos) * (worldRadius + currentElevation)`

O que isso resolve:
- subir/descer de forma previsivel
- manter o voo colado a uma esfera sem drift numerico estranho
- desacoplar navegacao angular no globo da altitude local

Insight para o seu projeto:
- hoje sua fisica mistura direcao tangencial, altitude e colisao no mesmo fluxo
- vale introduzir explicitamente:
  - `surfaceDirection` = posicao normalizada no globo
  - `altitudeAboveSeaOrTerrain` = estado escalar
  - `forwardArcMotion` = deslocamento tangencial sobre a esfera
  - `verticalVelocity` = componente radial controlada por pitch

Em vez de “reprojetar e torcer para funcionar”, voce pode fazer:
1. integrar yaw/roll em torno de `gravityUp`
2. calcular `verticalVelocity` pelo pitch
3. atualizar altitude com suavizacao/inercia
4. reconstruir `position = surfaceDir * (worldRadius + altitude)`

Isso combina muito bem com o seu mundo procedural.

## Como Eles Fazem a Camera

Fonte: `GameCamera.cs`

Padrao usado:
- camera atras/frente/top-down sao apenas presets de offset e look target
- `FOV` varia com velocidade e boost
- a camera usa `player.GravityUp` como up local do planeta
- ha transicao suave entre menu e gameplay

O que e forte aqui:
- simplicidade
- legibilidade dos modos
- sensacao de velocidade sem custo alto

O que trazer para o seu projeto:
- `FOV` dinamico entre voo lento/rapido
- camera com um ou dois presets claros:
  - chase camera
  - orbit/top-down/debug
- `camera.up` derivado de `gravityUp`, mas com uma fração do bank do aviao
- damping exponencial em posicao e target

Em pratica, isso pode melhorar mais a sensacao de voo do que mexer em shader.

## Como Eles Fazem Lookup de Terreno

Fonte: `WorldLookup.cs` e `TerrainHeightProcessor.cs`

Esse e um dos melhores insights para voce.

Eles nao tentam inferir altura do terreno a partir da malha renderizada.
Eles criam um recurso de lookup dedicado:
- processam um `heightMap` para um `RenderTexture`
- mantem um `heightLookup` pequeno/eficiente
- consultam altura e indice de pais por coordenada
- usam compute + `AsyncGPUReadback` quando faz sentido

Por que isso e importante:
- gameplay e fisica consultam um sistema estavel e barato
- render e simulacao nao ficam acoplados
- colisao/quest/navegacao nao dependem do mesh draw da frame atual

O que trazer para o seu projeto:
- hoje voce clonou a funcao procedural na CPU, o que funciona
- mas um proximo salto de arquitetura seria criar um “terrain query system”

Duas opcoes boas:
- manter a consulta procedural CPU, mas encapsular num servico unico
- ou gerar um mapa/atlas de altura auxiliar para lookup rapido

Recomendacao:
- curto prazo: criar um modulo `terrain_query.ts` com API unica:
  - `getHeight(sphereDir)`
  - `getNormal(sphereDir)`
  - `getBiome(sphereDir)`
  - `isOcean(sphereDir)`
- medio prazo: considerar um atlas de altura para consultas frequentes

## Como Eles Geram o Terreno

Fonte: `TerrainGenerator.cs`

A diferenca mais importante para o seu projeto:
- o terreno deles e baseado em dados reais + preprocessamento
- o seu e procedural puro

Mesmo assim, ha duas ideias fortes reaproveitaveis:

1. Separar geracao de geometria de consulta de altura
- eles geram a malha uma vez
- e consultam altura por outro caminho

2. Pensar em chunks/meshes combinados com criterio de culling
- eles combinam poligonos em grupos sem destruir demais o frustum culling
- isso e uma abordagem muito boa para seu planeta, mesmo procedural

Insight aplicavel:
- sua renderizacao ainda esta muito “um buffer unico gigante”
- vale evoluir para faces/chunks independentes com:
  - culling
  - LOD
  - possivel streaming/regeneracao futura

## Como Eles Fazem LOD e Culling

Fonte: `SimpleLodSystem.cs` e `RenderSettingsController.cs`

Padrao:
- high-res perto
- low-res longe
- atualizacao parcelada em varios frames
- frustum planes calculados por camera
- layer-based culling distances
- shadow culling separado do camera culling

Isso tem muito valor para voce.

O que trazer:
- o seu culling por face foi um bom primeiro passo
- o proximo nivel seria chunk LOD por distancia
- e especialmente:
  - culling de sombras mais curto que culling visual
  - updates distribuidos por frame para evitar spikes

Recomendacao pratica:
- planeta dividido em patches por face
- cada patch com 2 LODs
- avaliacao de upgrade/downgrade espalhada por frame
- oceano e atmosfera tambem podem seguir a mesma visibilidade por patch

## Como Eles Fazem o Oceano

Fontes: `OceanGenerator.cs` e `Ocean.shader`

Arquitetura:
- geometria simples dividida em tiles/chunks
- costa levada em conta na geracao
- shader faz o trabalho “bonito”

No shader, os pilares sao:
- cor do oceano a partir de mapa/lookup
- normais de onda via normal maps/triplanar
- espuma via mapa de distancia da costa
- especular e fresnel bem calibrados
- sombras e cor ambiente dialogando com o ciclo dia/noite

O insight central:
- eles nao dependem de deslocamento grande de vertice para vender agua
- a maior parte da riqueza vem de normal perturbada, foam e composicao de cor

Isso conversa exatamente com a direcao que voce ja vinha tomando.

Coisas que valem muito a pena portar conceitualmente:
- espuma guiada por distancia a costa, nao so por profundidade instantanea
- perturbacao de normal em duas escalas
- reflexo do ceu e fresnel como parte da cor da agua
- sombra/oclusao barata do aviao e do ambiente no mar

## Como Eles Fazem Iluminacao Dia/Noite

Fontes: `Terrain.shader`, `Sun.cs`, `SolarSystemManager.cs`

Padrao:
- o sol nao e “so uma direcao fixa”
- existe um sistema de tempo global
- materiais sabem interpolar entre look diurno e noturno
- a cor do sol muda com o horario/angulo relativo

No terreno:
- dia e noite sao tratados como dois regimes diferentes
- ha:
  - `nightCol`
  - `terrainCol` diurno
  - interpolacao entre ambos por `nightT`
- city lights entram so quando necessario
- fresnel/rim ajudam o silhouette noturno

Insight muito forte:
- nao tente resolver toda iluminacao com uma formula unica
- vale muito mais ter um “blend de regimes”

Para o seu projeto isso sugere:
- separar shading em:
  - dia
  - entardecer
  - noite
- controlar isso por `sunAltitude` ou `dot(surfaceUp, sunDir)`
- dar ao oceano e atmosfera parametros que variam com esse estado global

## Como Eles Fazem Atmosfera/Ceu

Fonte indireta: `RenderingManager.cs`, `Sun.cs`, materiais e command buffers

O sistema deles parece guiado por uma orquestracao de render:
- ceu/outer space antes dos opacos
- atmosfera como efeito proprio
- sol/estrelas/lua coordenados pelo mesmo sistema temporal

Insight arquitetural:
- a atmosfera nao deve ser “apenas um shader bonito”
- ela precisa estar alinhada com:
  - direcao do sol
  - cor do sol
  - estado do ceu
  - transicao dia/noite
  - oceano e fog

No seu projeto, isso significa que vale criar um pequeno modulo de ambiente:
- `EnvironmentState`
  - `sunDirection`
  - `sunColor`
  - `sunIntensity`
  - `skyZenithColor`
  - `skyHorizonColor`
  - `fogDensity`
  - `nightFactor`

Em vez de cada shader “inventar” sua propria atmosfera.

## O Que Eu Nao Trazeria Diretamente

Essas partes nao valem copiar literalmente:
- shaders e assets prontos
- pipeline dependente de mapas reais de paises/costas
- sistemas de UI/quest/localizacao
- detalhes muito Unity-specific como command buffers ou materiais compartilhados

O valor real esta nas ideias:
- separar consulta de terreno da renderizacao
- usar estados simples e coerentes para voo
- deixar shader vender detalhe, nao geometria cara
- centralizar ambiente/tempo/sol

## O Que Eu Trazeria Primeiro

### Fase 1: fisica e camera
- reestruturar o controller para altitude ser estado explicito
- pitch gerar velocidade radial controlada
- yaw coordenado por bank
- camera com damping + FOV dinamico + leve roll follow

### Fase 2: terreno como sistema consultavel
- criar `terrain_query.ts`
- encapsular:
  - altura
  - normal
  - biome
  - mascara de oceano
- depois decidir entre procedural CPU ou atlas de lookup

### Fase 3: ambiente centralizado
- criar `EnvironmentState`
- derivar dele:
  - sol
  - cores do ceu
  - densidade de fog
  - fator de noite
- passar isso para todos os shaders

### Fase 4: oceano e atmosfera
- manter geometria simples
- enriquecer por:
  - normais multi-escala
  - espuma guiada por costa
  - reflexo do ceu
  - glitter solar
  - sombra barata do aviao

### Fase 5: performance estrutural
- patches/chunks por face
- LOD por distancia
- culling de sombras separado do culling visual
- updates parcelados ao longo dos frames

## Plano Ideal Para o Seu Projeto

Se a meta e “melhorar a fisica e o feeling geral usando os insights do projeto de referencia”, eu seguiria esta ordem:

1. refatorar `player_controller.ts`
- altitude como estado
- velocidade tangencial e radial separadas
- bank afetando curva real

2. refatorar `camera.ts`
- presets
- damping
- FOV por velocidade
- roll parcial na camera

3. criar `environment.ts`
- estado central do ceu/sol/fog/noite

4. criar `terrain_query.ts`
- esconder detalhes de procedural/lookup

5. evoluir render
- dia/noite coerente
- oceano por normal/fresnel/foam
- atmosfera como sistema, nao so cor

## Conclusao

O projeto da pasta `inspiration` nao e valioso porque “tem um shader bonito”.
Ele e valioso porque:
- simplifica a fisica sem perder sensacao
- organiza o planeta como sistema consultavel
- usa camera e FOV para reforcar o movimento
- faz oceano/atmosfera parecerem ricos com geometria simples
- centraliza tempo e iluminacao
- trata performance como parte da arquitetura

Se eu tivesse que resumir em uma frase:

Use o projeto de referencia menos como “fonte de efeito visual” e mais como “fonte de separacao de responsabilidades”.

Isso e o que mais vai melhorar seu projeto sem te prender ao codigo/asset deles.
