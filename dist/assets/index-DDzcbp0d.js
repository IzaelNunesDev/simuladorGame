var e=(e,t)=>()=>(e&&(t=e(e=0)),t),t=(e,t)=>()=>(t||(e((t={exports:{}}).exports,t),e=null),t.exports);(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();function n(e=0,t=0,n=0){return new Float32Array([e,t,n])}function r(e,t){return e[0]=t[0],e[1]=t[1],e[2]=t[2],e}function i(e,t,n){return e[0]=t[0]-n[0],e[1]=t[1]-n[1],e[2]=t[2]-n[2],e}function a(e,t,n){return e[0]=t[0]*n,e[1]=t[1]*n,e[2]=t[2]*n,e}function o(e,t,n,r){return e[0]=t[0]+n[0]*r,e[1]=t[1]+n[1]*r,e[2]=t[2]+n[2]*r,e}function s(e,t){return e[0]*t[0]+e[1]*t[1]+e[2]*t[2]}function c(e,t,n){let r=t[0],i=t[1],a=t[2],o=n[0],s=n[1],c=n[2];return e[0]=i*c-a*s,e[1]=a*o-r*c,e[2]=r*s-i*o,e}function l(e){return Math.sqrt(e[0]*e[0]+e[1]*e[1]+e[2]*e[2])}function u(e){return e[0]*e[0]+e[1]*e[1]+e[2]*e[2]}function d(e,t){let n=l(t);if(n>1e-8){let r=1/n;e[0]=t[0]*r,e[1]=t[1]*r,e[2]=t[2]*r}else e[0]=0,e[1]=0,e[2]=0;return e}function f(e,t,n){let r=s(t,n);return e[0]=t[0]-n[0]*r,e[1]=t[1]-n[1]*r,e[2]=t[2]-n[2]*r,e}function p(){let e=new Float32Array(16);return e[0]=1,e[5]=1,e[10]=1,e[15]=1,e}function m(e,t,n){for(let r=0;r<4;r++)for(let i=0;i<4;i++){let a=0;for(let e=0;e<4;e++)a+=t[e*4+i]*n[r*4+e];e[r*4+i]=a}return e}function h(e,t,n,r,i){let a=1/Math.tan(t*.5),o=1/(r-i);return e.fill(0),e[0]=a/n,e[5]=a,e[10]=i*o,e[11]=-1,e[14]=r*i*o,e}function g(e,t,r,a){let o=n(),l=n(),u=n();return i(o,t,r),d(o,o),c(l,a,o),d(l,l),c(u,o,l),e[0]=l[0],e[1]=u[0],e[2]=o[0],e[3]=0,e[4]=l[1],e[5]=u[1],e[6]=o[1],e[7]=0,e[8]=l[2],e[9]=u[2],e[10]=o[2],e[11]=0,e[12]=-s(l,t),e[13]=-s(u,t),e[14]=-s(o,t),e[15]=1,e}function _(e=0,t=0,n=0,r=1){return new Float32Array([e,t,n,r])}function v(e,t,n){let r=n*.5,i=Math.sin(r);return e[0]=t[0]*i,e[1]=t[1]*i,e[2]=t[2]*i,e[3]=Math.cos(r),e}function y(e,t,n){let r=n[0],i=n[1],a=n[2],o=n[3],s=t[0],c=t[1],l=t[2],u=2*(i*l-a*c),d=2*(a*s-r*l),f=2*(r*c-i*s);return e[0]=s+o*u+(i*f-a*d),e[1]=c+o*d+(a*u-r*f),e[2]=l+o*f+(r*d-i*u),e}function b(e,t,n){return e<t?t:e>n?n:e}var x,S=e((()=>{x=Math.PI/180,180/Math.PI,Math.PI*2}));function C(){return{position:n(0,0,10),target:n(),up:n(0,1,0),right:n(1,0,0),forward:n(0,0,-1),viewMatrix:p(),projectionMatrix:p(),viewProjectionMatrix:p(),distance:12,height:3,lookAhead:20,fovY:75*x,nearPlane:.1,farPlane:2e4,_scratchForward:n()}}function w(e,t,n,a,s){return i(e.up,t,a),d(e.up,e.up),f(e._scratchForward,n,e.up),u(e._scratchForward)<1e-6&&(r(e._scratchForward,e.forward),f(e._scratchForward,e._scratchForward,e.up)),d(e.forward,e._scratchForward),c(e.right,e.forward,e.up),d(e.right,e.right),o(e.target,t,e.forward,e.lookAhead),o(e.position,t,e.forward,-e.distance),o(e.position,e.position,e.up,e.height),g(e.viewMatrix,e.position,e.target,e.up),h(e.projectionMatrix,e.fovY,s,e.nearPlane,e.farPlane),m(e.viewProjectionMatrix,e.projectionMatrix,e.viewMatrix),e}var T=e((()=>{S()}));function E(e,t,n,r,i,a=!1){let o=e.createShaderModule({code:n});return e.createRenderPipeline({layout:`auto`,vertex:{module:o,entryPoint:r},fragment:{module:o,entryPoint:i,targets:[{format:t,blend:a?{color:{srcFactor:`src-alpha`,dstFactor:`one-minus-src-alpha`,operation:`add`},alpha:{srcFactor:`one`,dstFactor:`one-minus-src-alpha`,operation:`add`}}:void 0}]},primitive:{topology:`triangle-list`,cullMode:`none`},depthStencil:{format:`depth24plus`,depthWriteEnabled:!a,depthCompare:`less`}})}function D(e){let t=(e-1)*(e-1),n=new Uint32Array(t*6*6),r=0;for(let t=0;t<6;t++){let i=t*e*e;for(let t=0;t<e-1;t++)for(let a=0;a<e-1;a++){let o=i+t*e+a,s=o+1,c=o+e,l=c+1;n[r++]=o,n[r++]=c,n[r++]=s,n[r++]=s,n[r++]=c,n[r++]=l}}return n}function O(e){let t=new Float32Array(e.particleCount*F),n=e.worldRadius+e.flyHeight*.55,r=e.flyHeight*.55;for(let i=0;i<e.particleCount;i++){let a=i%28,o=a*23.173+11.7,s=i*17.13+a*5.31,c=A(k(o*1.17)*Math.PI*2),l=k(o*2.31)*2-1,u=Math.sqrt(Math.max(0,1-l*l)),d=Math.cos(c)*u,f=l,p=Math.sin(c)*u,m=Math.abs(f)<.92?0:1,h=+(Math.abs(f)<.92),g=h*p-0*f,_=0*d-m*p,v=m*f-h*d,y=Math.hypot(g,_,v);y<1e-5&&(g=1,_=0,v=0,y=1),g/=y,_/=y,v/=y;let b=f*v-p*_,x=p*g-d*v,S=d*_-f*g,C=k(s*.73)*Math.PI*2,w=k(s*1.91)**.72*r,T=(k(s*2.77)-.5)*e.flyHeight*.18,E=n+(k(o*4.13)-.5)*e.flyHeight*.8,D=Math.cos(C)*w,O=Math.sin(C)*w,j=d*(E+T)+g*D+b*O,M=f*(E+T)+_*D+x*O,N=p*(E+T)+v*D+S*O,P=i*F;t[P+0]=j,t[P+1]=M,t[P+2]=N,t[P+3]=1,t[P+4]=j,t[P+5]=M,t[P+6]=N,t[P+7]=1,t[P+8]=j,t[P+9]=M,t[P+10]=N,t[P+11]=1,t[P+12]=a,t[P+13]=w,t[P+14]=0,t[P+15]=0}return t}function k(e){let t=Math.sin(e*127.1)*43758.5453123;return t-Math.floor(t)}function A(e){return e-Math.floor(e)}var j,M,N,P,F,I,L,R=e((()=>{j=40,M=20,N=20,P=51,F=16,I=32,L=class e{device;format;config;terrainVertexCount;terrainIndexCount;cloudParticleCount;frameUniformData=new Float32Array(j);cloudUniformData=new Float32Array(M);airplaneUniformData=new Float32Array(N);terrainParamBytes=new ArrayBuffer(I);frameUniformBuffer;terrainParamBuffer;cloudParamBuffer;airplaneUniformBuffer;terrainPositionBuffer;terrainNormalBuffer;terrainHeightBuffer;particleBuffer;terrainIndexBuffer;terrainComputePipeline;cloudsComputePipeline;planetRenderPipeline;oceanRenderPipeline;atmosphereRenderPipeline;cloudsRenderPipeline;airplaneRenderPipeline;atmosphereFrameBindGroup;planetFrameBindGroup;oceanFrameBindGroup;cloudsFrameBindGroup;airplaneFrameBindGroup;terrainComputeBindGroup;atmosphereTerrainBindGroup;planetTerrainBindGroup;oceanTerrainBindGroup;cloudComputeBindGroup;cloudRenderBindGroup;airplaneUniformBindGroup;depthTexture=null;depthTextureView=null;constructor(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N){this.device=e,this.format=t,this.config=n,this.terrainVertexCount=r,this.terrainIndexCount=i,this.cloudParticleCount=a,this.frameUniformBuffer=o,this.terrainParamBuffer=s,this.cloudParamBuffer=c,this.airplaneUniformBuffer=l,this.terrainPositionBuffer=u,this.terrainNormalBuffer=d,this.terrainHeightBuffer=f,this.particleBuffer=p,this.terrainIndexBuffer=m,this.terrainComputePipeline=h,this.cloudsComputePipeline=g,this.planetRenderPipeline=_,this.oceanRenderPipeline=v,this.atmosphereRenderPipeline=y,this.cloudsRenderPipeline=b,this.airplaneRenderPipeline=x,this.atmosphereFrameBindGroup=S,this.planetFrameBindGroup=C,this.oceanFrameBindGroup=w,this.cloudsFrameBindGroup=T,this.airplaneFrameBindGroup=E,this.terrainComputeBindGroup=D,this.atmosphereTerrainBindGroup=O,this.planetTerrainBindGroup=k,this.oceanTerrainBindGroup=A,this.cloudComputeBindGroup=j,this.cloudRenderBindGroup=M,this.airplaneUniformBindGroup=N}static async create(t,n,r,i,a,o){let s=r.terrainResolution*r.terrainResolution*6,c=D(r.terrainResolution),l=O(r),u=t.createBuffer({size:j*4,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),d=t.createBuffer({size:I,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),f=t.createBuffer({size:M*4,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),p=t.createBuffer({size:N*4,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),m=t.createBuffer({size:s*16,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC|GPUBufferUsage.COPY_DST}),h=t.createBuffer({size:s*16,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC|GPUBufferUsage.COPY_DST}),g=t.createBuffer({size:s*4,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC|GPUBufferUsage.COPY_DST}),_=t.createBuffer({size:l.byteLength,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST,mappedAtCreation:!0});new Float32Array(_.getMappedRange()).set(l),_.unmap();let v=t.createBuffer({size:c.byteLength,usage:GPUBufferUsage.INDEX|GPUBufferUsage.COPY_DST,mappedAtCreation:!0});new Uint32Array(v.getMappedRange()).set(c),v.unmap();let y=t.createComputePipeline({layout:`auto`,compute:{module:t.createShaderModule({code:i.terrainCompute}),entryPoint:`main`}}),b=t.createComputePipeline({layout:`auto`,compute:{module:t.createShaderModule({code:i.cloudsCompute}),entryPoint:`main`}}),x=E(t,n,i.planetRender,`vs_main`,`fs_main`),S=E(t,n,i.oceanRender,`vs_main`,`fs_main`,!0),C=E(t,n,i.atmosphereRender,`vs_main`,`fs_main`,!0),w=E(t,n,i.cloudsRender,`vs_main`,`fs_main`,!0),T=E(t,n,i.airplaneRender,`vs_main`,`fs_main`),k=t.createBindGroup({layout:C.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:u}}]}),A=t.createBindGroup({layout:x.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:u}}]}),P=t.createBindGroup({layout:S.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:u}}]}),F=t.createBindGroup({layout:w.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:u}}]}),L=t.createBindGroup({layout:T.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:u}}]}),R=t.createBindGroup({layout:y.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:d}},{binding:1,resource:{buffer:m}},{binding:2,resource:{buffer:h}},{binding:3,resource:{buffer:g}}]}),z=t.createBindGroup({layout:C.getBindGroupLayout(1),entries:[{binding:0,resource:{buffer:d}},{binding:1,resource:{buffer:m}},{binding:2,resource:{buffer:h}},{binding:3,resource:{buffer:g}}]}),B=t.createBindGroup({layout:x.getBindGroupLayout(1),entries:[{binding:0,resource:{buffer:d}},{binding:1,resource:{buffer:m}},{binding:2,resource:{buffer:h}},{binding:3,resource:{buffer:g}}]}),V=t.createBindGroup({layout:S.getBindGroupLayout(1),entries:[{binding:0,resource:{buffer:d}},{binding:1,resource:{buffer:m}},{binding:2,resource:{buffer:h}},{binding:3,resource:{buffer:g}}]}),H=t.createBindGroup({layout:b.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:f}},{binding:1,resource:{buffer:_}}]}),U=t.createBindGroup({layout:w.getBindGroupLayout(1),entries:[{binding:0,resource:{buffer:f}},{binding:1,resource:{buffer:_}}]}),W=t.createBindGroup({layout:T.getBindGroupLayout(1),entries:[{binding:0,resource:{buffer:p}}]}),G=new e(t,n,r,s,c.length,r.particleCount,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,k,A,P,F,L,R,z,B,V,H,U,W);return G.writeTerrainParams(),G.resize(a,o),G.generateTerrain(),G}resize(e,t){this.depthTexture?.destroy(),this.depthTexture=this.device.createTexture({size:{width:Math.max(1,Math.floor(e)),height:Math.max(1,Math.floor(t))},format:`depth24plus`,usage:GPUTextureUsage.RENDER_ATTACHMENT}),this.depthTextureView=this.depthTexture.createView()}updateFrameUniforms(e,t,n,r){this.frameUniformData.set(e.viewProjectionMatrix,0),this.frameUniformData.set([e.position[0],e.position[1],e.position[2],1],16),this.frameUniformData.set([t[0],t[1],t[2],0],20),this.frameUniformData.set([e.right[0],e.right[1],e.right[2],0],24),this.frameUniformData.set([e.up[0],e.up[1],e.up[2],0],28),this.frameUniformData[32]=n,this.frameUniformData[33]=r,this.frameUniformData[34]=this.config.worldRadius,this.frameUniformData[35]=this.config.seaLevel,this.frameUniformData[36]=this.config.atmosphereHeight,this.frameUniformData[37]=this.config.flyHeight,this.frameUniformData[38]=0,this.frameUniformData[39]=0,this.device.queue.writeBuffer(this.frameUniformBuffer,0,this.frameUniformData)}updateCloudUniforms(e,t){this.cloudUniformData.set([e.position[0],e.position[1],e.position[2],1],0),this.cloudUniformData.set([e.forward[0],e.forward[1],e.forward[2],0],4),this.cloudUniformData[8]=this.config.cloudCollisionRadius,this.cloudUniformData[9]=Math.max(e.speed*.015,.05),this.cloudUniformData[10]=this.config.cloudRelaxToHome,this.cloudUniformData[11]=t,this.cloudUniformData[12]=this.config.particleCount,this.cloudUniformData[13]=this.config.cloudBillboardSize,this.cloudUniformData[14]=this.config.cloudStrength,this.cloudUniformData[15]=.985,this.cloudUniformData[16]=0,this.cloudUniformData[17]=0,this.cloudUniformData[18]=0,this.cloudUniformData[19]=0,this.device.queue.writeBuffer(this.cloudParamBuffer,0,this.cloudUniformData)}updateAirplaneUniforms(e){let t=e.rollBank*1.25,n=Math.cos(t),r=Math.sin(t),i=e.right[0]*n+e.up[0]*r,a=e.right[1]*n+e.up[1]*r,o=e.right[2]*n+e.up[2]*r,s=e.up[0]*n-e.right[0]*r,c=e.up[1]*n-e.right[1]*r,l=e.up[2]*n-e.right[2]*r,u=Math.max(this.config.flyHeight*.012,1.35),d=u*5.5,f=u*.65,p=e.position[0]+e.forward[0]*d-s*f,m=e.position[1]+e.forward[1]*d-c*f,h=e.position[2]+e.forward[2]*d-l*f;this.airplaneUniformData[0]=i*u,this.airplaneUniformData[1]=a*u,this.airplaneUniformData[2]=o*u,this.airplaneUniformData[3]=0,this.airplaneUniformData[4]=s*u,this.airplaneUniformData[5]=c*u,this.airplaneUniformData[6]=l*u,this.airplaneUniformData[7]=0,this.airplaneUniformData[8]=e.forward[0]*u,this.airplaneUniformData[9]=e.forward[1]*u,this.airplaneUniformData[10]=e.forward[2]*u,this.airplaneUniformData[11]=0,this.airplaneUniformData[12]=p,this.airplaneUniformData[13]=m,this.airplaneUniformData[14]=h,this.airplaneUniformData[15]=1,this.airplaneUniformData[16]=.92,this.airplaneUniformData[17]=.74,this.airplaneUniformData[18]=.18,this.airplaneUniformData[19]=1,this.device.queue.writeBuffer(this.airplaneUniformBuffer,0,this.airplaneUniformData)}render(e){if(!this.depthTextureView)return;let t=this.device.createCommandEncoder(),n=t.beginComputePass();n.setPipeline(this.cloudsComputePipeline),n.setBindGroup(0,this.cloudComputeBindGroup),n.dispatchWorkgroups(Math.ceil(this.cloudParticleCount/64)),n.end();let r=t.beginRenderPass({colorAttachments:[{view:e,clearValue:{r:.055,g:.08,b:.12,a:1},loadOp:`clear`,storeOp:`store`}],depthStencilAttachment:{view:this.depthTextureView,depthClearValue:1,depthLoadOp:`clear`,depthStoreOp:`store`}});r.setIndexBuffer(this.terrainIndexBuffer,`uint32`),r.setPipeline(this.atmosphereRenderPipeline),r.setBindGroup(0,this.atmosphereFrameBindGroup),r.setBindGroup(1,this.atmosphereTerrainBindGroup),r.drawIndexed(this.terrainIndexCount,1,0,0,0),r.setPipeline(this.planetRenderPipeline),r.setBindGroup(0,this.planetFrameBindGroup),r.setBindGroup(1,this.planetTerrainBindGroup),r.drawIndexed(this.terrainIndexCount,1,0,0,0),r.setPipeline(this.oceanRenderPipeline),r.setBindGroup(0,this.oceanFrameBindGroup),r.setBindGroup(1,this.oceanTerrainBindGroup),r.drawIndexed(this.terrainIndexCount,1,0,0,0),r.setPipeline(this.airplaneRenderPipeline),r.setBindGroup(0,this.airplaneFrameBindGroup),r.setBindGroup(1,this.airplaneUniformBindGroup),r.draw(P,1,0,0),r.setPipeline(this.cloudsRenderPipeline),r.setBindGroup(0,this.cloudsFrameBindGroup),r.setBindGroup(1,this.cloudRenderBindGroup),r.draw(6,this.cloudParticleCount,0,0),r.end(),this.device.queue.submit([t.finish()])}writeTerrainParams(){let e=new DataView(this.terrainParamBytes);e.setUint32(0,this.config.terrainResolution,!0),e.setFloat32(4,this.config.worldRadius,!0),e.setUint32(8,this.config.terrainNoise.octaves,!0),e.setFloat32(12,this.config.terrainNoise.persistence,!0),e.setFloat32(16,this.config.terrainNoise.lacunarity,!0),e.setFloat32(20,this.config.terrainNoise.baseFrequency,!0),e.setFloat32(24,this.config.terrainNoise.baseAmplitude,!0),e.setFloat32(28,this.config.terrainNoise.seed,!0),this.device.queue.writeBuffer(this.terrainParamBuffer,0,this.terrainParamBytes)}generateTerrain(){let e=this.device.createCommandEncoder(),t=e.beginComputePass();t.setPipeline(this.terrainComputePipeline),t.setBindGroup(0,this.terrainComputeBindGroup),t.dispatchWorkgroups(Math.ceil(this.config.terrainResolution/8),Math.ceil(this.config.terrainResolution/8),6),t.end(),this.device.queue.submit([e.finish()])}}}));function z(){return{pitch:0,yaw:0,roll:0,throttle:0,brake:0}}function B(e,t){let i=n(e+t,0,0),a=n(1,0,0),o=n(0,0,-1),s=n(0,-1,0);return{worldCenter:n(),position:i,forward:o,right:s,up:r(n(),a),velocity:n(),gravityUp:a,previousPosition:r(n(),i),worldRadius:e,flyHeight:t,speed:42,minSpeed:12,maxSpeed:160,acceleration:28,yawRate:.9,pitchRate:.7,rollBank:0,bankResponse:2.4,_scratchA:n(),_scratchB:n(),_rotationQuat:_()}}function V(e,t,n){return e.speed=b(e.speed+(t.throttle-t.brake)*e.acceleration*n,e.minSpeed,e.maxSpeed),r(e.previousPosition,e.position),d(e.gravityUp,e.position),v(e._rotationQuat,e.gravityUp,t.yaw*e.yawRate*n),y(e.forward,e.forward,e._rotationQuat),f(e.forward,e.forward,e.gravityUp),u(e.forward)<1e-6&&c(e.forward,e.right,e.gravityUp),d(e.forward,e.forward),c(e.right,e.forward,e.gravityUp),d(e.right,e.right),v(e._rotationQuat,e.right,t.pitch*e.pitchRate*n),y(e.forward,e.forward,e._rotationQuat),f(e.forward,e.forward,e.gravityUp),d(e.forward,e.forward),c(e.right,e.forward,e.gravityUp),d(e.right,e.right),r(e.up,e.gravityUp),e.rollBank+=(t.roll*.75-e.rollBank)*b(e.bankResponse*n,0,1),a(e._scratchA,e.forward,e.speed*n),o(e.position,e.position,e._scratchA,1),d(e.gravityUp,e.position),a(e.position,e.gravityUp,e.worldRadius+e.flyHeight),f(e.forward,e.forward,e.gravityUp),u(e.forward)<1e-6&&c(e.forward,e.up,e.right),d(e.forward,e.forward),c(e.right,e.forward,e.gravityUp),d(e.right,e.right),r(e.up,e.gravityUp),r(e._scratchB,e.position),e._scratchB[0]-=e.previousPosition[0],e._scratchB[1]-=e.previousPosition[1],e._scratchB[2]-=e.previousPosition[2],a(e.velocity,e._scratchB,n>0?1/n:0),e}var H=e((()=>{S()}));async function U(e){return G.create(e)}var W,G,K=e((()=>{T(),R(),S(),H(),W={terrainResolution:256,worldRadius:3e3,flyHeight:120,seaLevel:18,atmosphereHeight:260,particleCount:4096,cloudCollisionRadius:72,cloudRelaxToHome:.18,cloudBillboardSize:18,cloudStrength:.82,terrainNoise:{octaves:5,persistence:.52,lacunarity:2.15,baseFrequency:1.75,baseAmplitude:150,seed:11.5}},G=class e{canvas;context;device;config;bridge;camera;player;input;sunDirection;isRunning=!1;lastTimeMs=0;animationFrame=e=>this.frame(e);constructor(e,t,r,i,a){this.canvas=e,this.context=t,this.device=r,this.config=i,this.bridge=a,this.camera=C(),this.player=B(i.worldRadius,i.flyHeight),this.input=z(),this.sunDirection=n(-.35,.88,-.22),d(this.sunDirection,this.sunDirection)}static async create(t){let n={...W,...t.config,terrainNoise:{...W.terrainNoise,...t.config?.terrainNoise??{}}},r=await L.create(t.device,t.presentationFormat,n,t.shaders,t.canvas.width,t.canvas.height),i=new e(t.canvas,t.context,t.device,n,r);return i.resize(),i}start(){this.isRunning||(this.isRunning=!0,this.lastTimeMs=performance.now(),requestAnimationFrame(this.animationFrame))}stop(){this.isRunning=!1}resize(){let e=Math.max(1,Math.floor(this.canvas.clientWidth*window.devicePixelRatio)),t=Math.max(1,Math.floor(this.canvas.clientHeight*window.devicePixelRatio));this.canvas.width!==e&&(this.canvas.width=e),this.canvas.height!==t&&(this.canvas.height=t),this.bridge.resize(e,t)}setKeyState(e,t){let n=+!!t;switch(e){case`ArrowUp`:case`KeyI`:this.input.pitch=-n;break;case`ArrowDown`:case`KeyK`:this.input.pitch=n;break;case`ArrowLeft`:case`KeyJ`:this.input.yaw=n;break;case`ArrowRight`:case`KeyL`:this.input.yaw=-n;break;case`KeyQ`:this.input.roll=-n;break;case`KeyE`:this.input.roll=n;break;case`KeyW`:case`ShiftLeft`:this.input.throttle=n;break;case`KeyS`:case`ControlLeft`:this.input.brake=n;break}}frame(e){if(!this.isRunning)return;let t=Math.min(.05,Math.max(.001,(e-this.lastTimeMs)*.001));this.lastTimeMs=e,V(this.player,this.input,t),w(this.camera,this.player.position,this.player.forward,this.player.worldCenter,this.canvas.width/this.canvas.height),this.bridge.updateFrameUniforms(this.camera,this.sunDirection,e*.001,t),this.bridge.updateCloudUniforms(this.player,t),this.bridge.updateAirplaneUniforms(this.player),this.bridge.render(this.context.getCurrentTexture().createView()),requestAnimationFrame(this.animationFrame)}}})),q,ee=e((()=>{q=`// =============================================================================
// terrain_gen.wgsl — Compute Shader: Simplex Noise + Fractal Terrain + Normals
// Generates height data and normal vectors for a spherified cube planet.
// =============================================================================

// --- Uniforms ---
struct TerrainParams {
  resolution  : u32,      // vertices per face edge
  worldRadius : f32,      // planet base radius
  octaves     : u32,      // fractal noise layers
  persistence : f32,      // amplitude decay per octave
  lacunarity  : f32,      // frequency growth per octave
  baseFreq    : f32,      // starting frequency
  baseAmp     : f32,      // starting amplitude
  seed        : f32,      // noise seed offset
};

@group(0) @binding(0) var<uniform> params : TerrainParams;

// Output buffers: position (vec4 for alignment), normal (vec4)
@group(0) @binding(1) var<storage, read_write> outPositions : array<vec4f>;
@group(0) @binding(2) var<storage, read_write> outNormals   : array<vec4f>;
@group(0) @binding(3) var<storage, read_write> outHeights   : array<f32>;

// =============================================================================
// Simplex Noise 3D — Translated from Ashima Arts / Stefan Gustavson
// =============================================================================
fn mod289_3(x: vec3f) -> vec3f { return x - floor(x * (1.0/289.0)) * 289.0; }
fn mod289_4(x: vec4f) -> vec4f { return x - floor(x * (1.0/289.0)) * 289.0; }
fn permute(x: vec4f) -> vec4f { return mod289_4(((x * 34.0) + 10.0) * x); }

fn taylorInvSqrt(r: vec4f) -> vec4f {
  return vec4f(1.79284291400159) - vec4f(0.85373472095314) * r;
}

fn snoise(v: vec3f) -> f32 {
  let C = vec2f(1.0/6.0, 1.0/3.0);
  let D = vec4f(0.0, 0.5, 1.0, 2.0);

  // First corner
  var i = floor(v + dot(v, vec3f(C.y)));
  let x0 = v - i + dot(i, vec3f(C.x));

  // Other corners
  let g = step(x0.yzx, x0.xyz);
  let l = 1.0 - g;
  let i1 = min(g.xyz, l.zxy);
  let i2 = max(g.xyz, l.zxy);

  let x1 = x0 - i1 + vec3f(C.x);
  let x2 = x0 - i2 + vec3f(C.y);
  let x3 = x0 - vec3f(D.y);

  // Permutations
  i = mod289_3(i);
  let p = permute(permute(permute(
    i.z + vec4f(0.0, i1.z, i2.z, 1.0))
  + i.y + vec4f(0.0, i1.y, i2.y, 1.0))
  + i.x + vec4f(0.0, i1.x, i2.x, 1.0));

  // Gradients: 7x7 points over a square, mapped onto an octahedron
  let n_ = 0.142857142857; // 1.0/7.0
  let ns = n_ * D.wyz - D.xzx;

  let j = p - 49.0 * floor(p * ns.z * ns.z);
  let x_ = floor(j * ns.z);
  let y_ = floor(j - 7.0 * x_);

  let xx = x_ * ns.x + vec4f(ns.y);
  let yy = y_ * ns.x + vec4f(ns.y);
  let h = 1.0 - abs(xx) - abs(yy);

  let b0 = vec4f(xx.x, xx.y, yy.x, yy.y);
  let b1 = vec4f(xx.z, xx.w, yy.z, yy.w);

  let s0 = floor(b0) * 2.0 + 1.0;
  let s1 = floor(b1) * 2.0 + 1.0;
  let sh = -step(h, vec4f(0.0));

  let a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  let a1 = b1.xzyw + s1.xzyw * sh.zzww;

  var p0 = vec3f(a0.x, a0.y, h.x);
  var p1 = vec3f(a0.z, a0.w, h.y);
  var p2 = vec3f(a1.x, a1.y, h.z);
  var p3 = vec3f(a1.z, a1.w, h.w);

  // Normalise gradients
  let norm = taylorInvSqrt(vec4f(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;

  // Mix final noise value
  var m = max(vec4f(0.5) - vec4f(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), vec4f(0.0));
  m = m * m;
  return 105.0 * dot(m*m, vec4f(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

// =============================================================================
// Fractal Noise — Sum of octaves of Simplex Noise
// =============================================================================
fn fractalNoise(pos: vec3f) -> f32 {
  var noise = 0.0;
  var amplitude = 1.0;
  var frequency = params.baseFreq;
  var amplitudeSum = 0.0;

  for (var i = 0u; i < params.octaves; i++) {
    noise += snoise(pos * frequency + vec3f(params.seed)) * amplitude;
    amplitudeSum += amplitude;
    amplitude *= params.persistence;
    frequency *= params.lacunarity;
  }
  return noise / max(amplitudeSum, 0.0001);
}

fn ridgedNoise(pos: vec3f) -> f32 {
  var value = 0.0;
  var amplitude = 1.0;
  var frequency = params.baseFreq * 1.35;
  var amplitudeSum = 0.0;

  for (var i = 0u; i < params.octaves; i++) {
    let sampleValue = 1.0 - abs(snoise(pos * frequency + vec3f(params.seed * 1.91)));
    value += sampleValue * sampleValue * amplitude;
    amplitudeSum += amplitude;
    amplitude *= params.persistence;
    frequency *= params.lacunarity;
  }
  return value / max(amplitudeSum, 0.0001);
}

fn terrainHeight(pos: vec3f) -> f32 {
  let warp = vec3f(
    snoise(pos * params.baseFreq * 0.22 + vec3f(params.seed, 0.0, 0.0)),
    snoise(pos.zxy * params.baseFreq * 0.24 + vec3f(0.0, params.seed * 1.3, 0.0)),
    snoise(pos.yzx * params.baseFreq * 0.2 + vec3f(0.0, 0.0, params.seed * 1.7))
  );
  let warped = normalize(pos + warp * 0.22);

  let continents = smoothstep(0.48, 0.86, fractalNoise(warped * 0.42) * 0.5 + 0.5);
  let hills = fractalNoise(warped * 1.35) * 0.5 + 0.5;
  let mountains = ridgedNoise(warped * 2.4);
  let details = fractalNoise(warped * 5.25) * 0.5 + 0.5;

  let macroHeight = mix(hills * 0.18, hills * 0.38 + mountains * 0.92, continents);
  let detailHeight = details * 0.09 + mountains * continents * 0.28;
  let combined = (macroHeight + detailHeight) * continents;
  return max(combined * params.baseAmp, 0.0);
}

// =============================================================================
// Spherified Cube: maps a cube face point to a sphere surface
// =============================================================================
fn cubeToSphere(p: vec3f) -> vec3f {
  let x2 = p.x * p.x;
  let y2 = p.y * p.y;
  let z2 = p.z * p.z;
  return vec3f(
    p.x * sqrt(1.0 - y2 * 0.5 - z2 * 0.5 + y2 * z2 / 3.0),
    p.y * sqrt(1.0 - z2 * 0.5 - x2 * 0.5 + z2 * x2 / 3.0),
    p.z * sqrt(1.0 - x2 * 0.5 - y2 * 0.5 + x2 * y2 / 3.0)
  );
}

// =============================================================================
// Sphere to UV mapping (longitude/latitude)
// =============================================================================
fn sphereToUV(p: vec3f) -> vec2f {
  let n = normalize(p);
  let longitude = atan2(n.x, -n.z);      // atan2(x, -z)
  let latitude  = asin(clamp(n.y, -1.0, 1.0));
  let u = (longitude / 3.14159265 + 1.0) * 0.5;
  let v = latitude / 3.14159265 + 0.5;
  return vec2f(u, v);
}

// =============================================================================
// Get displaced position on sphere with terrain height
// =============================================================================
fn getDisplacedPos(sphereDir: vec3f) -> vec3f {
  let height = terrainHeight(sphereDir);
  return sphereDir * (params.worldRadius + height);
}

// =============================================================================
// Main compute: generates positions, normals, and heights
// Each thread = one vertex; face is dispatched separately.
// Global ID layout: x = column, y = row, z = face index (0..5)
// =============================================================================
@compute @workgroup_size(8, 8, 1)
fn main(@builtin(global_invocation_id) gid: vec3u) {
  let res = params.resolution;
  if (gid.x >= res || gid.y >= res) { return; }

  let face = gid.z;
  let idx = face * res * res + gid.y * res + gid.x;

  // Map [0, res-1] to [-1, 1]
  let u = f32(gid.x) / f32(res - 1u) * 2.0 - 1.0;
  let v = f32(gid.y) / f32(res - 1u) * 2.0 - 1.0;

  // Build cube face point based on face index
  var cubePoint: vec3f;
  switch (face) {
    case 0u: { cubePoint = vec3f( 1.0,   v,   -u); } // +X
    case 1u: { cubePoint = vec3f(-1.0,   v,    u); } // -X
    case 2u: { cubePoint = vec3f(   u, 1.0,   -v); } // +Y
    case 3u: { cubePoint = vec3f(   u,-1.0,    v); } // -Y
    case 4u: { cubePoint = vec3f(   u,   v,  1.0); } // +Z
    default: { cubePoint = vec3f(  -u,   v, -1.0); } // -Z
  }

  let sphereDir = normalize(cubeToSphere(cubePoint));
  let height = terrainHeight(sphereDir);
  let worldPos = sphereDir * (params.worldRadius + height);

  // --- Normal Calculation via Neighboring Samples (Sobel/Cross Product) ---
  let eps = 0.001; // angular offset for sampling neighbors

  // Build a tangent frame on the sphere
  var tangentU: vec3f;
  if (abs(sphereDir.y) < 0.999) {
    tangentU = normalize(cross(vec3f(0.0, 1.0, 0.0), sphereDir));
  } else {
    tangentU = normalize(cross(vec3f(1.0, 0.0, 0.0), sphereDir));
  }
  let tangentV = normalize(cross(sphereDir, tangentU));

  // Sample 4 neighbors
  let dirN = normalize(sphereDir + tangentV * eps);
  let dirS = normalize(sphereDir - tangentV * eps);
  let dirE = normalize(sphereDir + tangentU * eps);
  let dirW = normalize(sphereDir - tangentU * eps);

  let posN = getDisplacedPos(dirN);
  let posS = getDisplacedPos(dirS);
  let posE = getDisplacedPos(dirE);
  let posW = getDisplacedPos(dirW);

  // Normal from cross product of neighbor differences
  let dirNorth = normalize(posN - posS);
  let dirEast  = normalize(posE - posW);
  let normalVec = normalize(cross(dirNorth, dirEast));

  // Write outputs
  outPositions[idx] = vec4f(worldPos, 1.0);
  outNormals[idx]   = vec4f(normalVec, 0.0);
  outHeights[idx]   = height;
}
`})),J,te=e((()=>{J=`// =============================================================================
// clouds_sim.wgsl — Compute Shader: Verlet integration + player collision
// =============================================================================

struct CloudParams {
  playerPos: vec4f,
  playerDir: vec4f,
  collisionRadius: f32,
  playerSpeed: f32,
  relaxToHome: f32,
  deltaTime: f32,
  particleCount: f32,
  billboardSize: f32,
  cloudStrength: f32,
  drag: f32,
  pad0: f32,
  pad1: f32,
  pad2: f32,
  pad3: f32,
};

struct Particle {
  position: vec4f,
  previousPosition: vec4f,
  homePosition: vec4f,
  packedData: vec4f,
};

@group(0) @binding(0) var<uniform> params: CloudParams;
@group(0) @binding(1) var<storage, read_write> particles: array<Particle>;

fn lerp(a: f32, b: f32, t: f32) -> f32 {
  return a + (b - a) * t;
}

@compute @workgroup_size(64, 1, 1)
fn main(@builtin(global_invocation_id) gid: vec3u) {
  let index = gid.x;
  if (f32(index) >= params.particleCount) {
    return;
  }

  var particle = particles[index];
  let current = particle.position.xyz;
  let previous = particle.previousPosition.xyz;

  // Verlet integration baseline.
  var next = current + (current - previous) * params.drag;

  let offsetToPlayer = params.playerPos.xyz - current;
  let dstFromPlayer = length(offsetToPlayer);
  if (dstFromPlayer > 1e-5 && dstFromPlayer < params.collisionRadius) {
    let collisionDir = -(params.playerPos.xyz - current) / dstFromPlayer;
    let influence = clamp(dot(collisionDir, normalize(params.playerDir.xyz)), 0.0, 1.0);
    let particleVelocity = collisionDir * lerp(0.3, 1.0, influence) * params.playerSpeed;
    next += particleVelocity;
  }

  let toHome = particle.homePosition.xyz - next;
  next += toHome * (params.relaxToHome * max(params.deltaTime, 0.016));

  particle.previousPosition = vec4f(current, 1.0);
  particle.position = vec4f(next, 1.0);
  particles[index] = particle;
}
`})),Y,ne=e((()=>{Y=`// =============================================================================
// planet.wgsl — Render Shader: planet surface from compute-generated buffers
// =============================================================================

struct FrameUniforms {
  viewProjection: mat4x4<f32>,
  cameraPos: vec4f,
  sunDir: vec4f,
  cameraRight: vec4f,
  cameraUp: vec4f,
  time: f32,
  deltaTime: f32,
  worldRadius: f32,
  seaLevel: f32,
  atmosphereHeight: f32,
  flyHeight: f32,
  pad0: f32,
  pad1: f32,
};

struct TerrainParams {
  resolution: u32,
  worldRadius: f32,
  octaves: u32,
  persistence: f32,
  lacunarity: f32,
  baseFreq: f32,
  baseAmp: f32,
  seed: f32,
};

struct VertexOut {
  @builtin(position) clipPosition: vec4f,
  @location(0) worldPos: vec3f,
  @location(1) normal: vec3f,
  @location(2) uv: vec2f,
  @location(3) height: f32,
  @location(4) sphereDir: vec3f,
};

@group(0) @binding(0) var<uniform> frame: FrameUniforms;
@group(1) @binding(0) var<uniform> terrain: TerrainParams;
@group(1) @binding(1) var<storage, read> terrainPositions: array<vec4f>;
@group(1) @binding(2) var<storage, read> terrainNormals: array<vec4f>;
@group(1) @binding(3) var<storage, read> terrainHeights: array<f32>;

fn sphereToUV(p: vec3f) -> vec2f {
  let n = normalize(p);
  let longitude = atan2(n.x, -n.z);
  let latitude = asin(clamp(n.y, -1.0, 1.0));
  let u = (longitude / 3.14159265359 + 1.0) * 0.5;
  let v = latitude / 3.14159265359 + 0.5;
  return vec2f(u, v);
}

fn mod289_3(x: vec3f) -> vec3f { return x - floor(x * (1.0 / 289.0)) * 289.0; }
fn mod289_4(x: vec4f) -> vec4f { return x - floor(x * (1.0 / 289.0)) * 289.0; }
fn permute(x: vec4f) -> vec4f { return mod289_4(((x * 34.0) + 10.0) * x); }

fn taylorInvSqrt(r: vec4f) -> vec4f {
  return vec4f(1.79284291400159) - vec4f(0.85373472095314) * r;
}

fn snoise(v: vec3f) -> f32 {
  let C = vec2f(1.0 / 6.0, 1.0 / 3.0);
  let D = vec4f(0.0, 0.5, 1.0, 2.0);

  var i = floor(v + dot(v, vec3f(C.y)));
  let x0 = v - i + dot(i, vec3f(C.x));

  let g = step(x0.yzx, x0.xyz);
  let l = 1.0 - g;
  let i1 = min(g.xyz, l.zxy);
  let i2 = max(g.xyz, l.zxy);

  let x1 = x0 - i1 + vec3f(C.x);
  let x2 = x0 - i2 + vec3f(C.y);
  let x3 = x0 - vec3f(D.y);

  i = mod289_3(i);
  let p = permute(permute(permute(
    i.z + vec4f(0.0, i1.z, i2.z, 1.0))
  + i.y + vec4f(0.0, i1.y, i2.y, 1.0))
  + i.x + vec4f(0.0, i1.x, i2.x, 1.0));

  let n_ = 0.142857142857;
  let ns = n_ * D.wyz - D.xzx;

  let j = p - 49.0 * floor(p * ns.z * ns.z);
  let x_ = floor(j * ns.z);
  let y_ = floor(j - 7.0 * x_);

  let xx = x_ * ns.x + vec4f(ns.y);
  let yy = y_ * ns.x + vec4f(ns.y);
  let h = 1.0 - abs(xx) - abs(yy);

  let b0 = vec4f(xx.x, xx.y, yy.x, yy.y);
  let b1 = vec4f(xx.z, xx.w, yy.z, yy.w);

  let s0 = floor(b0) * 2.0 + 1.0;
  let s1 = floor(b1) * 2.0 + 1.0;
  let sh = -step(h, vec4f(0.0));

  let a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  let a1 = b1.xzyw + s1.xzyw * sh.zzww;

  var p0 = vec3f(a0.x, a0.y, h.x);
  var p1 = vec3f(a0.z, a0.w, h.y);
  var p2 = vec3f(a1.x, a1.y, h.z);
  var p3 = vec3f(a1.z, a1.w, h.w);

  let norm = taylorInvSqrt(vec4f(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  var m = max(vec4f(0.5) - vec4f(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), vec4f(0.0));
  m = m * m;
  return 105.0 * dot(m * m, vec4f(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

fn fractalNoise(pos: vec3f, baseFreq: f32, octaves: u32, persistence: f32, lacunarity: f32, seedOffset: vec3f) -> f32 {
  var noise = 0.0;
  var amplitude = 1.0;
  var frequency = baseFreq;
  var amplitudeSum = 0.0;

  for (var i = 0u; i < octaves; i++) {
    noise += snoise(pos * frequency + seedOffset) * amplitude;
    amplitudeSum += amplitude;
    amplitude *= persistence;
    frequency *= lacunarity;
  }

  return noise / max(amplitudeSum, 0.0001);
}

fn tangentFrame(n: vec3f) -> mat3x3<f32> {
  var tangent = cross(vec3f(0.0, 1.0, 0.0), n);
  if (length(tangent) < 0.001) {
    tangent = cross(vec3f(1.0, 0.0, 0.0), n);
  }
  tangent = normalize(tangent);
  let bitangent = normalize(cross(n, tangent));
  return mat3x3<f32>(tangent, bitangent, n);
}

@vertex
fn vs_main(@builtin(vertex_index) vertexIndex: u32) -> VertexOut {
  let worldPos = terrainPositions[vertexIndex].xyz;
  let normal = normalize(terrainNormals[vertexIndex].xyz);

  var out: VertexOut;
  out.worldPos = worldPos;
  out.normal = normal;
  out.uv = sphereToUV(worldPos);
  out.height = terrainHeights[vertexIndex];
  out.sphereDir = normalize(worldPos);
  out.clipPosition = frame.viewProjection * vec4f(worldPos, 1.0);
  return out;
}

@fragment
fn fs_main(in: VertexOut) -> @location(0) vec4f {
  let dirToSun = normalize(frame.sunDir.xyz);
  let baseNormal = normalize(in.normal);
  let viewDir = normalize(frame.cameraPos.xyz - in.worldPos);
  let planetPos = in.sphereDir;
  let planetSeed = terrain.seed;
  let humidityNoise = fractalNoise(
    planetPos.yzx * 1.37 + vec3f(planetSeed * 0.13, planetSeed * 0.29, planetSeed * 0.17),
    terrain.baseFreq * 0.72,
    max(terrain.octaves, 3u),
    0.58,
    terrain.lacunarity * 0.92,
    vec3f(37.1, 11.7, 53.9)
  ) * 0.5 + 0.5;
  let heightBlend = clamp(in.height / max(terrain.baseAmp * 0.95, 0.001), 0.0, 1.0);
  let slope = 1.0 - max(dot(baseNormal, in.sphereDir), 0.0);
  let latitude = abs(in.uv.y * 2.0 - 1.0);
  let coldMask = smoothstep(0.52, 0.95, latitude + heightBlend * 0.18);

  let macroA = snoise(planetPos * 4.5 + vec3f(11.0, 23.0, 5.0)) * 0.5 + 0.5;
  let macroB = snoise(planetPos.zxy * 7.2 + vec3f(-17.0, 9.0, 31.0)) * 0.5 + 0.5;
  let terrainVariation = macroA * 0.55 + macroB * 0.45;
  let dryness = clamp(1.0 - humidityNoise + slope * 0.18, 0.0, 1.0);
  let fertileMask = smoothstep(0.08, 0.5, heightBlend) * (1.0 - smoothstep(0.5, 0.9, slope)) * (1.0 - coldMask);
  let desertMask = smoothstep(0.58, 0.84, dryness) * smoothstep(0.06, 0.42, heightBlend) * (1.0 - coldMask * 0.85);
  let forestMask = smoothstep(0.48, 0.82, humidityNoise) * fertileMask;
  let rockMask = smoothstep(0.22, 0.82, slope + heightBlend * 0.42) * (1.0 - forestMask * 0.5);
  let snowMask = max(
    smoothstep(0.64, 1.0, coldMask + heightBlend * 0.32),
    smoothstep(0.68, 1.0, heightBlend + slope * 0.24)
  );

  let beach = vec3f(0.75, 0.69, 0.53);
  let desert = vec3f(0.72, 0.62, 0.38);
  let forest = vec3f(0.18, 0.34, 0.16);
  let meadow = vec3f(0.35, 0.47, 0.22);
  let rockWarm = vec3f(0.47, 0.38, 0.29);
  let rockCold = vec3f(0.35, 0.38, 0.41);
  let snow = vec3f(0.94, 0.96, 1.0);

  var albedo = mix(beach, meadow, smoothstep(0.03, 0.15, heightBlend));
  albedo = mix(albedo, desert, desertMask * (0.8 + terrainVariation * 0.2));
  albedo = mix(albedo, mix(meadow, forest, humidityNoise), forestMask);
  albedo = mix(albedo, mix(rockWarm, rockCold, coldMask * 0.75 + humidityNoise * 0.15), rockMask);
  albedo = mix(albedo, snow, snowMask);
  albedo *= 0.92 + terrainVariation * 0.14;

  let frameBasis = tangentFrame(baseNormal);
  let bumpSampleA = snoise(in.worldPos * 0.12 + vec3f(planetSeed * 0.41, planetSeed * 0.17, frame.time * 0.02));
  let bumpSampleB = snoise(in.worldPos.zxy * 0.24 + vec3f(19.0, -13.0, planetSeed * 0.67));
  let bumpSampleC = snoise(in.worldPos.yzx * 0.48 + vec3f(-7.0, 29.0, 41.0));
  let bumpVec = vec3f(
    bumpSampleA - bumpSampleB,
    bumpSampleC - bumpSampleA,
    1.0
  );
  let bumpStrength = mix(0.04, 0.18, clamp(rockMask + desertMask * 0.35, 0.0, 1.0));
  let normal = normalize(frameBasis * normalize(vec3f(bumpVec.xy * bumpStrength, bumpVec.z)));
  let diffuse = max(dot(normal, dirToSun), 0.0);

  let ambient = 0.16 + terrainVariation * 0.05 + humidityNoise * 0.03;
  let rimLight = pow(1.0 - max(dot(viewDir, normal), 0.0), 3.0) * 0.08;
  let backLight = pow(max(dot(-dirToSun, viewDir), 0.0), 3.0) * slope * 0.12;
  let lighting = ambient + diffuse * 0.88 + rimLight + backLight;
  return vec4f(albedo * lighting, 1.0);
}
`})),X,re=e((()=>{X=`// =============================================================================
// ocean.wgsl — Render Shader: animated ocean shell + solar specular highlight
// =============================================================================

struct FrameUniforms {
  viewProjection: mat4x4<f32>,
  cameraPos: vec4f,
  sunDir: vec4f,
  cameraRight: vec4f,
  cameraUp: vec4f,
  time: f32,
  deltaTime: f32,
  worldRadius: f32,
  seaLevel: f32,
  atmosphereHeight: f32,
  flyHeight: f32,
  pad0: f32,
  pad1: f32,
};

struct TerrainParams {
  resolution: u32,
  worldRadius: f32,
  octaves: u32,
  persistence: f32,
  lacunarity: f32,
  baseFreq: f32,
  baseAmp: f32,
  seed: f32,
};

struct VertexOut {
  @builtin(position) clipPosition: vec4f,
  @location(0) worldPos: vec3f,
  @location(1) normal: vec3f,
  @location(2) uv: vec2f,
  @location(3) terrainHeight: f32,
  @location(4) wave: f32,
};

@group(0) @binding(0) var<uniform> frame: FrameUniforms;
@group(1) @binding(0) var<uniform> terrain: TerrainParams;
@group(1) @binding(1) var<storage, read> terrainPositions: array<vec4f>;
@group(1) @binding(2) var<storage, read> terrainNormals: array<vec4f>;
@group(1) @binding(3) var<storage, read> terrainHeights: array<f32>;

fn sphereToUV(p: vec3f) -> vec2f {
  let n = normalize(p);
  let longitude = atan2(n.x, -n.z);
  let latitude = asin(clamp(n.y, -1.0, 1.0));
  let u = (longitude / 3.14159265359 + 1.0) * 0.5;
  let v = latitude / 3.14159265359 + 0.5;
  return vec2f(u, v);
}

@vertex
fn vs_main(@builtin(vertex_index) vertexIndex: u32) -> VertexOut {
  let sphereDir = normalize(terrainPositions[vertexIndex].xyz);
  let terrainNormal = normalize(terrainNormals[vertexIndex].xyz);
  let terrainHeight = terrainHeights[vertexIndex];
  let uv = sphereToUV(sphereDir);
  let waveA = sin(frame.time * 0.75 + uv.x * 48.0 + uv.y * 21.0);
  let waveB = sin(frame.time * 1.15 - uv.x * 31.0 + uv.y * 37.0);
  let wave = (waveA + waveB) * 0.45;
  let shorelineDamp = 1.0 - smoothstep(frame.seaLevel - 1.0, frame.seaLevel + 8.0, terrainHeight);
  let radius = terrain.worldRadius + frame.seaLevel + wave * shorelineDamp;
  let worldPos = sphereDir * radius;

  var out: VertexOut;
  out.worldPos = worldPos;
  out.normal = normalize(mix(sphereDir, terrainNormal, 0.08));
  out.uv = uv;
  out.terrainHeight = terrainHeight;
  out.wave = wave;
  out.clipPosition = frame.viewProjection * vec4f(worldPos, 1.0);
  return out;
}

@fragment
fn fs_main(in: VertexOut) -> @location(0) vec4f {
  let dirToSun = normalize(frame.sunDir.xyz);
  let viewDir = normalize(frame.cameraPos.xyz - in.worldPos);
  let normal = normalize(in.normal);

  let fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), 3.5);
  let specularAngle = acos(clamp(dot(normalize(dirToSun - viewDir), normal), -1.0, 1.0));
  let smoothness = 0.18;
  let specularExponent = specularAngle / smoothness;
  let specularHighlight = exp(-specularExponent * specularExponent);

  let diffuse = max(dot(normal, dirToSun), 0.0);
  let deep = vec3f(0.03, 0.11, 0.22);
  let shallow = vec3f(0.08, 0.36, 0.58);
  let waterCol = mix(deep, shallow, diffuse * 0.65 + fresnel * 0.35);
  let highlight = vec3f(1.0, 0.95, 0.82) * specularHighlight;
  let coastalDepth = max(frame.seaLevel - in.terrainHeight, 0.0);
  let foamWave = sin(in.uv.x * 96.0 + frame.time * 2.7 + in.wave * 1.4)
    + sin(in.uv.y * 78.0 - frame.time * 2.2)
    + sin((in.uv.x + in.uv.y) * 64.0 + frame.time * 1.8);
  let foamDistortion = foamWave * 0.22;
  let foamMask = 1.0 - smoothstep(0.15, 3.8, coastalDepth + foamDistortion);
  let foam = vec3f(1.0, 1.0, 1.0) * foamMask * (0.75 + diffuse * 0.25);

  return vec4f(waterCol + highlight + foam, 0.72);
}
`})),Z,ie=e((()=>{Z=`// =============================================================================
// atmosphere.wgsl — Render Shader: lightweight atmospheric shell
// =============================================================================

struct FrameUniforms {
  viewProjection: mat4x4<f32>,
  cameraPos: vec4f,
  sunDir: vec4f,
  cameraRight: vec4f,
  cameraUp: vec4f,
  time: f32,
  deltaTime: f32,
  worldRadius: f32,
  seaLevel: f32,
  atmosphereHeight: f32,
  flyHeight: f32,
  pad0: f32,
  pad1: f32,
};

struct TerrainParams {
  resolution: u32,
  worldRadius: f32,
  octaves: u32,
  persistence: f32,
  lacunarity: f32,
  baseFreq: f32,
  baseAmp: f32,
  seed: f32,
};

struct VertexOut {
  @builtin(position) clipPosition: vec4f,
  @location(0) worldPos: vec3f,
  @location(1) sphereDir: vec3f,
};

@group(0) @binding(0) var<uniform> frame: FrameUniforms;
@group(1) @binding(0) var<uniform> terrain: TerrainParams;
@group(1) @binding(1) var<storage, read> terrainPositions: array<vec4f>;
@group(1) @binding(2) var<storage, read> terrainNormals: array<vec4f>;
@group(1) @binding(3) var<storage, read> terrainHeights: array<f32>;

@vertex
fn vs_main(@builtin(vertex_index) vertexIndex: u32) -> VertexOut {
  let sphereDir = normalize(terrainPositions[vertexIndex].xyz);
  let terrainNormal = normalize(terrainNormals[vertexIndex].xyz);
  let terrainHeight = terrainHeights[vertexIndex];
  let atmosphereOffset =
    frame.atmosphereHeight +
    terrainHeight * 0.04 +
    max(dot(terrainNormal, sphereDir), 0.0) * 1.5;
  let worldPos = sphereDir * (terrain.worldRadius + atmosphereOffset);

  var out: VertexOut;
  out.worldPos = worldPos;
  out.sphereDir = sphereDir;
  out.clipPosition = frame.viewProjection * vec4f(worldPos, 1.0);
  return out;
}

@fragment
fn fs_main(in: VertexOut) -> @location(0) vec4f {
  let dirToSun = normalize(frame.sunDir.xyz);
  let viewDir = normalize(frame.cameraPos.xyz - in.worldPos);
  let horizon = pow(1.0 - max(dot(in.sphereDir, viewDir), 0.0), 2.6);
  let forwardScatter = pow(max(dot(viewDir, dirToSun), 0.0), 6.0);
  let base = vec3f(0.22, 0.42, 0.86);
  let sunset = vec3f(0.98, 0.48, 0.22);
  let sky = mix(base, sunset, forwardScatter * 0.6);
  let alpha = horizon * 0.35;
  return vec4f(sky * horizon, alpha);
}
`})),Q,ae=e((()=>{Q=`// =============================================================================
// clouds.wgsl — Render Shader: instanced billboards with volumetric shading
// =============================================================================

struct FrameUniforms {
  viewProjection: mat4x4<f32>,
  cameraPos: vec4f,
  sunDir: vec4f,
  cameraRight: vec4f,
  cameraUp: vec4f,
  time: f32,
  deltaTime: f32,
  worldRadius: f32,
  seaLevel: f32,
  atmosphereHeight: f32,
  flyHeight: f32,
  pad0: f32,
  pad1: f32,
};

struct CloudParams {
  playerPos: vec4f,
  playerDir: vec4f,
  collisionRadius: f32,
  playerSpeed: f32,
  relaxToHome: f32,
  deltaTime: f32,
  particleCount: f32,
  billboardSize: f32,
  cloudStrength: f32,
  drag: f32,
  pad0: f32,
  pad1: f32,
  pad2: f32,
  pad3: f32,
};

struct Particle {
  position: vec4f,
  previousPosition: vec4f,
  homePosition: vec4f,
  packedData: vec4f,
};

struct VertexOut {
  @builtin(position) clipPosition: vec4f,
  @location(0) center: vec3f,
  @location(1) worldPos: vec3f,
  @location(2) localPos: vec2f,
};

@group(0) @binding(0) var<uniform> frame: FrameUniforms;
@group(1) @binding(0) var<uniform> cloudParams: CloudParams;
@group(1) @binding(1) var<storage, read> particles: array<Particle>;

const BILLBOARD: array<vec2f, 6> = array<vec2f, 6>(
  vec2f(-1.0, -1.0),
  vec2f( 1.0, -1.0),
  vec2f( 1.0,  1.0),
  vec2f(-1.0, -1.0),
  vec2f( 1.0,  1.0),
  vec2f(-1.0,  1.0),
);

@vertex
fn vs_main(
  @builtin(vertex_index) vertexIndex: u32,
  @builtin(instance_index) instanceIndex: u32,
) -> VertexOut {
  let particle = particles[instanceIndex];
  let quad = BILLBOARD[vertexIndex];
  let worldPos =
    particle.position.xyz +
    frame.cameraRight.xyz * quad.x * cloudParams.billboardSize +
    frame.cameraUp.xyz * quad.y * cloudParams.billboardSize;

  var out: VertexOut;
  out.center = particle.position.xyz;
  out.worldPos = worldPos;
  out.localPos = quad;
  out.clipPosition = frame.viewProjection * vec4f(worldPos, 1.0);
  return out;
}

@fragment
fn fs_main(in: VertexOut) -> @location(0) vec4f {
  let r2 = dot(in.localPos, in.localPos);
  if (r2 > 1.0) {
    discard;
  }

  let viewDir = normalize(frame.cameraPos.xyz - in.center);
  let z = sqrt(max(1.0 - r2, 0.0));
  let cloudNormal = normalize(
    frame.cameraRight.xyz * in.localPos.x +
    frame.cameraUp.xyz * in.localPos.y +
    viewDir * z
  );

  let shading = max(0.0, dot(cloudNormal, normalize(frame.sunDir.xyz)));
  let edge = smoothstep(1.0, 0.0, r2);
  let cloudStrength = edge * cloudParams.cloudStrength;
  let backgroundCol = vec3f(0.58, 0.68, 0.82);
  let cloudCol = mix(vec3f(0.48, 0.52, 0.58), vec3f(0.96, 0.97, 1.0), shading);
  let finalCol = mix(backgroundCol, cloudCol, cloudStrength);
  return vec4f(finalCol, cloudStrength * 0.58);
}
`})),$,oe=e((()=>{$=`// =============================================================================
// airplane.wgsl — Render Shader: procedural aircraft mesh driven by player state
// =============================================================================

struct FrameUniforms {
  viewProjection: mat4x4<f32>,
  cameraPos: vec4f,
  sunDir: vec4f,
  cameraRight: vec4f,
  cameraUp: vec4f,
  time: f32,
  deltaTime: f32,
  worldRadius: f32,
  seaLevel: f32,
  atmosphereHeight: f32,
  flyHeight: f32,
  pad0: f32,
  pad1: f32,
};

struct AirplaneUniforms {
  model: mat4x4<f32>,
  color: vec4f,
};

struct VertexOut {
  @builtin(position) clipPosition: vec4f,
  @location(0) worldPos: vec3f,
  @location(1) normal: vec3f,
};

@group(0) @binding(0) var<uniform> frame: FrameUniforms;
@group(1) @binding(0) var<uniform> airplane: AirplaneUniforms;

const AIRPLANE_POSITIONS = array<vec3f, 51>(
  vec3f(0.0, 0.0, 2.8), vec3f(-0.28, 0.22, 1.4), vec3f(0.28, 0.22, 1.4),
  vec3f(0.0, 0.0, 2.8), vec3f(0.28, -0.22, 1.4), vec3f(-0.28, -0.22, 1.4),
  vec3f(-0.28, 0.22, 1.4), vec3f(-0.28, -0.22, 1.4), vec3f(0.28, -0.22, 1.4),
  vec3f(-0.28, 0.22, 1.4), vec3f(0.28, -0.22, 1.4), vec3f(0.28, 0.22, 1.4),

  vec3f(-0.28, 0.22, 1.4), vec3f(-0.18, 0.16, -2.2), vec3f(0.18, 0.16, -2.2),
  vec3f(-0.28, -0.22, 1.4), vec3f(0.18, -0.16, -2.2), vec3f(-0.18, -0.16, -2.2),
  vec3f(-0.28, 0.22, 1.4), vec3f(0.18, 0.16, -2.2), vec3f(0.28, 0.22, 1.4),
  vec3f(-0.28, -0.22, 1.4), vec3f(0.28, -0.22, 1.4), vec3f(0.18, -0.16, -2.2),

  vec3f(-2.8, 0.0, 0.3), vec3f(-0.16, 0.03, 0.45), vec3f(-0.16, 0.0, -0.4),
  vec3f(0.16, 0.03, 0.45), vec3f(2.8, 0.0, 0.3), vec3f(0.16, 0.0, -0.4),
  vec3f(-0.16, 0.03, 0.45), vec3f(0.16, 0.03, 0.45), vec3f(0.16, 0.0, -0.4),
  vec3f(-0.16, 0.03, 0.45), vec3f(0.16, 0.0, -0.4), vec3f(-0.16, 0.0, -0.4),

  vec3f(0.0, 0.85, -1.75), vec3f(-0.12, 0.18, -1.85), vec3f(0.12, 0.18, -1.85),
  vec3f(0.0, 0.85, -1.75), vec3f(0.12, 0.18, -1.85), vec3f(0.0, 0.22, -2.35),
  vec3f(0.0, 0.85, -1.75), vec3f(0.0, 0.22, -2.35), vec3f(-0.12, 0.18, -1.85),

  vec3f(-0.72, 0.0, -1.55), vec3f(0.0, 0.04, -1.25), vec3f(0.72, 0.0, -1.55),
  vec3f(-0.46, 0.0, -2.05), vec3f(0.0, 0.03, -1.85), vec3f(0.46, 0.0, -2.05),
);

fn localNormal(index: u32) -> vec3f {
  let tri = index / 3u;
  switch (tri) {
    case 0u, 1u: { return vec3f(0.0, 0.45, 1.0); }
    case 2u, 3u: { return vec3f(0.0, 0.0, -1.0); }
    case 4u: { return vec3f(0.0, 1.0, 0.0); }
    case 5u: { return vec3f(0.0, -1.0, 0.0); }
    case 6u: { return vec3f(-0.1, 0.25, 1.0); }
    case 7u: { return vec3f(0.1, -0.25, 1.0); }
    case 8u, 9u: { return vec3f(0.0, 1.0, 0.02); }
    case 10u, 11u: { return vec3f(0.0, 1.0, -0.2); }
    case 12u, 13u, 14u: { return vec3f(0.0, 1.0, -0.25); }
    default: { return vec3f(0.0, 1.0, -0.1); }
  }
}

@vertex
fn vs_main(@builtin(vertex_index) vertexIndex: u32) -> VertexOut {
  let localPos = AIRPLANE_POSITIONS[vertexIndex];
  let worldPos4 = airplane.model * vec4f(localPos, 1.0);
  let worldNormal = normalize((airplane.model * vec4f(localNormal(vertexIndex), 0.0)).xyz);

  var out: VertexOut;
  out.worldPos = worldPos4.xyz;
  out.normal = worldNormal;
  out.clipPosition = frame.viewProjection * worldPos4;
  return out;
}

@fragment
fn fs_main(in: VertexOut) -> @location(0) vec4f {
  let sun = normalize(frame.sunDir.xyz);
  let normal = normalize(in.normal);
  let viewDir = normalize(frame.cameraPos.xyz - in.worldPos);
  let diffuse = max(dot(normal, sun), 0.0);
  let rim = pow(1.0 - max(dot(viewDir, normal), 0.0), 4.0);
  let spec = pow(max(dot(reflect(-sun, normal), viewDir), 0.0), 24.0);
  let bodyColor = airplane.color.xyz;
  let stripeMask = smoothstep(0.1, 0.24, abs(in.worldPos.y - airplane.model[3].y));
  let accentColor = mix(bodyColor, vec3f(0.18, 0.12, 0.08), stripeMask * 0.35);
  let lit = accentColor * (0.3 + diffuse * 0.95) + vec3f(1.0, 0.94, 0.86) * spec * 0.7 + rim * 0.16;
  return vec4f(lit, 1.0);
}
`}));t((()=>{K(),ee(),te(),ne(),re(),ie(),ae(),oe();async function e(){if(!(`gpu`in navigator))throw Error(`WebGPU nao esta disponivel neste navegador.`);let e=document.querySelector(`#viewport`);if(!e)throw Error(`Canvas #viewport nao encontrado.`);let t=await navigator.gpu.requestAdapter();if(!t)throw Error(`Nenhum adaptador WebGPU disponivel.`);let n=await t.requestDevice(),r=e.getContext(`webgpu`);if(!r)throw Error(`Nao foi possivel obter o contexto WebGPU.`);let i=navigator.gpu.getPreferredCanvasFormat();r.configure({device:n,format:i,alphaMode:`opaque`});let a=await U({canvas:e,context:r,device:n,presentationFormat:i,shaders:{terrainCompute:q,cloudsCompute:J,planetRender:Y,oceanRender:X,atmosphereRender:Z,cloudsRender:Q,airplaneRender:$}});window.addEventListener(`resize`,()=>a.resize()),window.addEventListener(`keydown`,e=>a.setKeyState(e.code,!0)),window.addEventListener(`keyup`,e=>a.setKeyState(e.code,!1)),a.start()}e().catch(e=>{console.error(e);let t=document.querySelector(`#error`);t&&(t.textContent=e instanceof Error?e.message:String(e))})}))();