var e=(e,t)=>()=>(e&&(t=e(e=0)),t),t=(e,t)=>()=>(t||(e((t={exports:{}}).exports,t),e=null),t.exports);(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();function n(e=0,t=0,n=0){return new Float32Array([e,t,n])}function r(e,t){return e[0]=t[0],e[1]=t[1],e[2]=t[2],e}function i(e,t,n){return e[0]=t[0]-n[0],e[1]=t[1]-n[1],e[2]=t[2]-n[2],e}function a(e,t,n){return e[0]=t[0]*n,e[1]=t[1]*n,e[2]=t[2]*n,e}function o(e,t,n,r){return e[0]=t[0]+n[0]*r,e[1]=t[1]+n[1]*r,e[2]=t[2]+n[2]*r,e}function s(e,t){return e[0]*t[0]+e[1]*t[1]+e[2]*t[2]}function c(e,t,n){let r=t[0],i=t[1],a=t[2],o=n[0],s=n[1],c=n[2];return e[0]=i*c-a*s,e[1]=a*o-r*c,e[2]=r*s-i*o,e}function l(e){return Math.sqrt(e[0]*e[0]+e[1]*e[1]+e[2]*e[2])}function u(e){return e[0]*e[0]+e[1]*e[1]+e[2]*e[2]}function d(e,t){let n=l(t);if(n>1e-8){let r=1/n;e[0]=t[0]*r,e[1]=t[1]*r,e[2]=t[2]*r}else e[0]=0,e[1]=0,e[2]=0;return e}function f(e,t,n){let r=s(t,n);return e[0]=t[0]-n[0]*r,e[1]=t[1]-n[1]*r,e[2]=t[2]-n[2]*r,e}function p(){let e=new Float32Array(16);return e[0]=1,e[5]=1,e[10]=1,e[15]=1,e}function m(e,t,n){for(let r=0;r<4;r++)for(let i=0;i<4;i++){let a=0;for(let e=0;e<4;e++)a+=t[e*4+i]*n[r*4+e];e[r*4+i]=a}return e}function h(e,t,n,r,i){let a=1/Math.tan(t*.5),o=1/(r-i);return e.fill(0),e[0]=a/n,e[5]=a,e[10]=i*o,e[11]=-1,e[14]=r*i*o,e}function g(e,t,r,a){let o=n(),l=n(),u=n();return i(o,t,r),d(o,o),c(l,a,o),d(l,l),c(u,o,l),e[0]=l[0],e[1]=u[0],e[2]=o[0],e[3]=0,e[4]=l[1],e[5]=u[1],e[6]=o[1],e[7]=0,e[8]=l[2],e[9]=u[2],e[10]=o[2],e[11]=0,e[12]=-s(l,t),e[13]=-s(u,t),e[14]=-s(o,t),e[15]=1,e}function _(e=0,t=0,n=0,r=1){return new Float32Array([e,t,n,r])}function v(e,t,n){let r=n*.5,i=Math.sin(r);return e[0]=t[0]*i,e[1]=t[1]*i,e[2]=t[2]*i,e[3]=Math.cos(r),e}function y(e,t,n){let r=n[0],i=n[1],a=n[2],o=n[3],s=t[0],c=t[1],l=t[2],u=2*(i*l-a*c),d=2*(a*s-r*l),f=2*(r*c-i*s);return e[0]=s+o*u+(i*f-a*d),e[1]=c+o*d+(a*u-r*f),e[2]=l+o*f+(r*d-i*u),e}function b(e,t,n){return e<t?t:e>n?n:e}function x(e,t,n){let r=b((n-e)/(t-e),0,1);return r*r*(3-2*r)}var S,C=e((()=>{S=Math.PI/180,180/Math.PI,Math.PI*2}));function w(){return{position:n(0,0,10),target:n(),up:n(0,1,0),right:n(1,0,0),forward:n(0,0,-1),viewMatrix:p(),projectionMatrix:p(),viewProjectionMatrix:p(),distance:12,height:3,lookAhead:20,fovY:75*S,nearPlane:.1,farPlane:1e4,_scratchForward:n()}}function T(e,t,n,a,s){return i(e.up,t,a),d(e.up,e.up),f(e._scratchForward,n,e.up),u(e._scratchForward)<1e-6&&(r(e._scratchForward,e.forward),f(e._scratchForward,e._scratchForward,e.up)),d(e.forward,e._scratchForward),c(e.right,e.forward,e.up),d(e.right,e.right),o(e.target,t,e.forward,e.lookAhead),o(e.position,t,e.forward,-e.distance),o(e.position,e.position,e.up,e.height),g(e.viewMatrix,e.position,e.target,e.up),h(e.projectionMatrix,e.fovY,s,e.nearPlane,e.farPlane),m(e.viewProjectionMatrix,e.projectionMatrix,e.viewMatrix),e}var E=e((()=>{C()}));function D(e,t,n,r,i,a=!1){let o=e.createShaderModule({code:n});return e.createRenderPipeline({layout:`auto`,vertex:{module:o,entryPoint:r},fragment:{module:o,entryPoint:i,targets:[{format:t,blend:a?{color:{srcFactor:`src-alpha`,dstFactor:`one-minus-src-alpha`,operation:`add`},alpha:{srcFactor:`one`,dstFactor:`one-minus-src-alpha`,operation:`add`}}:void 0}]},primitive:{topology:`triangle-list`,cullMode:`none`},depthStencil:{format:`depth24plus`,depthWriteEnabled:!a,depthCompare:`less`}})}function O(e){let t=(e-1)*(e-1),n=new Uint32Array(t*6*6),r=0;for(let t=0;t<6;t++){let i=t*e*e;for(let t=0;t<e-1;t++)for(let a=0;a<e-1;a++){let o=i+t*e+a,s=o+1,c=o+e,l=c+1;n[r++]=o,n[r++]=c,n[r++]=s,n[r++]=s,n[r++]=c,n[r++]=l}}return n}function k(e){let t=new Float32Array(e.particleCount*L),n=e.worldRadius+e.flyHeight*.55,r=e.flyHeight*.55;for(let i=0;i<e.particleCount;i++){let a=i%28,o=a*23.173+11.7,s=i*17.13+a*5.31,c=M(j(o*1.17)*Math.PI*2),l=j(o*2.31)*2-1,u=Math.sqrt(Math.max(0,1-l*l)),d=Math.cos(c)*u,f=l,p=Math.sin(c)*u,m=Math.abs(f)<.92?0:1,h=+(Math.abs(f)<.92),g=h*p-0*f,_=0*d-m*p,v=m*f-h*d,y=Math.hypot(g,_,v);y<1e-5&&(g=1,_=0,v=0,y=1),g/=y,_/=y,v/=y;let b=f*v-p*_,x=p*g-d*v,S=d*_-f*g,C=j(s*.73)*Math.PI*2,w=j(s*1.91)**.72*r,T=(j(s*2.77)-.5)*e.flyHeight*.18,E=n+(j(o*4.13)-.5)*e.flyHeight*.8,D=Math.cos(C)*w,O=Math.sin(C)*w,k=d*(E+T)+g*D+b*O,A=f*(E+T)+_*D+x*O,N=p*(E+T)+v*D+S*O,P=i*L;t[P+0]=k,t[P+1]=A,t[P+2]=N,t[P+3]=1,t[P+4]=k,t[P+5]=A,t[P+6]=N,t[P+7]=1,t[P+8]=k,t[P+9]=A,t[P+10]=N,t[P+11]=1,t[P+12]=a,t[P+13]=w,t[P+14]=0,t[P+15]=0}return t}function A(e,t,n){let r=Math.hypot(e.position[0],e.position[1],e.position[2])||1,i=e.position[0]/r,a=e.position[1]/r,o=e.position[2]/r,s=[],c=Math.min(n/Math.max(t,1),.12);for(let t=0;t<B.length;t++){let n=B[t],r=n[0]*i+n[1]*a+n[2]*o,l=n[0]*e.forward[0]+n[1]*e.forward[1]+n[2]*e.forward[2],u=r*.75+l*.25;(r>-.32-c||l>-.18)&&s.push({face:t,score:u})}s.sort((e,t)=>t.score-e.score);let l=s.slice(0,3).map(e=>e.face);return l.length>0?l:[0,2,4]}function j(e){let t=Math.sin(e*127.1)*43758.5453123;return t-Math.floor(t)}function M(e){return e-Math.floor(e)}var N,P,F,I,L,R,z,B,V=e((()=>{N=44,P=20,F=20,I=51,L=16,R=32,z=class e{device;format;config;terrainVertexCount;terrainIndexCount;cloudParticleCount;terrainFaceIndexCount;frameUniformData=new Float32Array(N);cloudUniformData=new Float32Array(P);airplaneUniformData=new Float32Array(F);terrainParamBytes=new ArrayBuffer(R);frameUniformBuffer;terrainParamBuffer;cloudParamBuffer;airplaneUniformBuffer;terrainPositionBuffer;terrainNormalBuffer;terrainHeightBuffer;particleBuffer;terrainIndexBuffer;terrainComputePipeline;cloudsComputePipeline;planetRenderPipeline;oceanRenderPipeline;atmosphereRenderPipeline;cloudsRenderPipeline;airplaneRenderPipeline;atmosphereFrameBindGroup;planetFrameBindGroup;oceanFrameBindGroup;cloudsFrameBindGroup;airplaneFrameBindGroup;terrainComputeBindGroup;atmosphereTerrainBindGroup;planetTerrainBindGroup;oceanTerrainBindGroup;cloudComputeBindGroup;cloudRenderBindGroup;airplaneUniformBindGroup;depthTexture=null;depthTextureView=null;writeMat4(e,t,n){this.assertFloatWrite(e,t,16),e.set(n,t)}writeVec4(e,t,n,r,i,a){this.assertFloatWrite(e,t,4),e[t+0]=n,e[t+1]=r,e[t+2]=i,e[t+3]=a}writeScalar(e,t,n){this.assertFloatWrite(e,t,1),e[t]=n}assertFloatWrite(e,t,n){if(t<0||t+n>e.length)throw Error(`Uniform write out of bounds: offset=${t} length=${n} size=${e.length}`)}constructor(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N){this.device=e,this.format=t,this.config=n,this.terrainVertexCount=r,this.terrainIndexCount=i,this.cloudParticleCount=a,this.terrainFaceIndexCount=i/6,this.frameUniformBuffer=o,this.terrainParamBuffer=s,this.cloudParamBuffer=c,this.airplaneUniformBuffer=l,this.terrainPositionBuffer=u,this.terrainNormalBuffer=d,this.terrainHeightBuffer=f,this.particleBuffer=p,this.terrainIndexBuffer=m,this.terrainComputePipeline=h,this.cloudsComputePipeline=g,this.planetRenderPipeline=_,this.oceanRenderPipeline=v,this.atmosphereRenderPipeline=y,this.cloudsRenderPipeline=b,this.airplaneRenderPipeline=x,this.atmosphereFrameBindGroup=S,this.planetFrameBindGroup=C,this.oceanFrameBindGroup=w,this.cloudsFrameBindGroup=T,this.airplaneFrameBindGroup=E,this.terrainComputeBindGroup=D,this.atmosphereTerrainBindGroup=O,this.planetTerrainBindGroup=k,this.oceanTerrainBindGroup=A,this.cloudComputeBindGroup=j,this.cloudRenderBindGroup=M,this.airplaneUniformBindGroup=N}static async create(t,n,r,i,a,o){let s=r.terrainResolution*r.terrainResolution*6,c=O(r.terrainResolution),l=k(r),u=t.createBuffer({size:N*4,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),d=t.createBuffer({size:R,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),f=t.createBuffer({size:P*4,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),p=t.createBuffer({size:F*4,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),m=t.createBuffer({size:s*16,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC|GPUBufferUsage.COPY_DST}),h=t.createBuffer({size:s*16,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC|GPUBufferUsage.COPY_DST}),g=t.createBuffer({size:s*4,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC|GPUBufferUsage.COPY_DST}),_=t.createBuffer({size:l.byteLength,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST,mappedAtCreation:!0});new Float32Array(_.getMappedRange()).set(l),_.unmap();let v=t.createBuffer({size:c.byteLength,usage:GPUBufferUsage.INDEX|GPUBufferUsage.COPY_DST,mappedAtCreation:!0});new Uint32Array(v.getMappedRange()).set(c),v.unmap();let y=t.createComputePipeline({layout:`auto`,compute:{module:t.createShaderModule({code:i.terrainCompute}),entryPoint:`main`}}),b=t.createComputePipeline({layout:`auto`,compute:{module:t.createShaderModule({code:i.cloudsCompute}),entryPoint:`main`}}),x=D(t,n,i.planetRender,`vs_main`,`fs_main`),S=D(t,n,i.oceanRender,`vs_main`,`fs_main`,!0),C=D(t,n,i.atmosphereRender,`vs_main`,`fs_main`,!0),w=D(t,n,i.cloudsRender,`vs_main`,`fs_main`,!0),T=D(t,n,i.airplaneRender,`vs_main`,`fs_main`),E=t.createBindGroup({layout:C.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:u}}]}),A=t.createBindGroup({layout:x.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:u}}]}),j=t.createBindGroup({layout:S.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:u}}]}),M=t.createBindGroup({layout:w.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:u}}]}),I=t.createBindGroup({layout:T.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:u}}]}),L=t.createBindGroup({layout:y.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:d}},{binding:1,resource:{buffer:m}},{binding:2,resource:{buffer:h}},{binding:3,resource:{buffer:g}}]}),z=t.createBindGroup({layout:C.getBindGroupLayout(1),entries:[{binding:0,resource:{buffer:d}},{binding:1,resource:{buffer:m}},{binding:2,resource:{buffer:h}},{binding:3,resource:{buffer:g}}]}),B=t.createBindGroup({layout:x.getBindGroupLayout(1),entries:[{binding:0,resource:{buffer:d}},{binding:1,resource:{buffer:m}},{binding:2,resource:{buffer:h}},{binding:3,resource:{buffer:g}}]}),V=t.createBindGroup({layout:S.getBindGroupLayout(1),entries:[{binding:0,resource:{buffer:d}},{binding:1,resource:{buffer:m}},{binding:3,resource:{buffer:g}}]}),H=t.createBindGroup({layout:b.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:f}},{binding:1,resource:{buffer:_}}]}),U=t.createBindGroup({layout:w.getBindGroupLayout(1),entries:[{binding:0,resource:{buffer:f}},{binding:1,resource:{buffer:_}}]}),W=t.createBindGroup({layout:T.getBindGroupLayout(1),entries:[{binding:0,resource:{buffer:p}}]}),G=new e(t,n,r,s,c.length,r.particleCount,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,A,j,M,I,L,z,B,V,H,U,W);return G.writeTerrainParams(),G.resize(a,o),G.generateTerrain(),G}resize(e,t){this.depthTexture?.destroy(),this.depthTexture=this.device.createTexture({size:{width:Math.max(1,Math.floor(e)),height:Math.max(1,Math.floor(t))},format:`depth24plus`,usage:GPUTextureUsage.RENDER_ATTACHMENT}),this.depthTextureView=this.depthTexture.createView()}updateFrameUniforms(e,t,n,r,i){this.writeMat4(this.frameUniformData,0,e.viewProjectionMatrix),this.writeVec4(this.frameUniformData,16,e.position[0],e.position[1],e.position[2],1),this.writeVec4(this.frameUniformData,20,t[0],t[1],t[2],0),this.writeVec4(this.frameUniformData,24,e.right[0],e.right[1],e.right[2],0),this.writeVec4(this.frameUniformData,28,e.up[0],e.up[1],e.up[2],0),this.writeVec4(this.frameUniformData,32,n[0],n[1],n[2],1),this.writeScalar(this.frameUniformData,36,r),this.writeScalar(this.frameUniformData,37,i),this.writeScalar(this.frameUniformData,38,this.config.worldRadius),this.writeScalar(this.frameUniformData,39,this.config.seaLevel),this.writeScalar(this.frameUniformData,40,this.config.atmosphereHeight),this.writeScalar(this.frameUniformData,41,this.config.flyHeight),this.writeScalar(this.frameUniformData,42,0),this.writeScalar(this.frameUniformData,43,0),this.device.queue.writeBuffer(this.frameUniformBuffer,0,this.frameUniformData)}updateCloudUniforms(e,t){this.writeVec4(this.cloudUniformData,0,e.position[0],e.position[1],e.position[2],1),this.writeVec4(this.cloudUniformData,4,e.forward[0],e.forward[1],e.forward[2],0),this.writeScalar(this.cloudUniformData,8,this.config.cloudCollisionRadius),this.writeScalar(this.cloudUniformData,9,Math.max(e.speed*.015,.05)),this.writeScalar(this.cloudUniformData,10,this.config.cloudRelaxToHome),this.writeScalar(this.cloudUniformData,11,t),this.writeScalar(this.cloudUniformData,12,this.config.particleCount),this.writeScalar(this.cloudUniformData,13,this.config.cloudBillboardSize),this.writeScalar(this.cloudUniformData,14,this.config.cloudStrength),this.writeScalar(this.cloudUniformData,15,.985),this.writeScalar(this.cloudUniformData,16,0),this.writeScalar(this.cloudUniformData,17,0),this.writeScalar(this.cloudUniformData,18,0),this.writeScalar(this.cloudUniformData,19,0),this.device.queue.writeBuffer(this.cloudParamBuffer,0,this.cloudUniformData)}updateAirplaneUniforms(e){let t=Math.max(this.config.flyHeight*.012,1.35),n=t*5.5,r=t*.65,i=e.position[0]+e.forward[0]*n-e.up[0]*r,a=e.position[1]+e.forward[1]*n-e.up[1]*r,o=e.position[2]+e.forward[2]*n-e.up[2]*r;this.airplaneUniformData[0]=e.right[0]*t,this.airplaneUniformData[1]=e.right[1]*t,this.airplaneUniformData[2]=e.right[2]*t,this.airplaneUniformData[3]=0,this.airplaneUniformData[4]=e.up[0]*t,this.airplaneUniformData[5]=e.up[1]*t,this.airplaneUniformData[6]=e.up[2]*t,this.airplaneUniformData[7]=0,this.airplaneUniformData[8]=e.forward[0]*t,this.airplaneUniformData[9]=e.forward[1]*t,this.airplaneUniformData[10]=e.forward[2]*t,this.airplaneUniformData[11]=0,this.airplaneUniformData[12]=i,this.airplaneUniformData[13]=a,this.airplaneUniformData[14]=o,this.airplaneUniformData[15]=1,this.airplaneUniformData[16]=.92,this.airplaneUniformData[17]=.74,this.airplaneUniformData[18]=.18,this.airplaneUniformData[19]=1,this.device.queue.writeBuffer(this.airplaneUniformBuffer,0,this.airplaneUniformData)}render(e,t){if(!this.depthTextureView)return;let n=this.device.createCommandEncoder(),r=n.beginComputePass();r.setPipeline(this.cloudsComputePipeline),r.setBindGroup(0,this.cloudComputeBindGroup),r.dispatchWorkgroups(Math.ceil(this.cloudParticleCount/64)),r.end();let i=n.beginRenderPass({colorAttachments:[{view:e,clearValue:{r:.055,g:.08,b:.12,a:1},loadOp:`clear`,storeOp:`store`}],depthStencilAttachment:{view:this.depthTextureView,depthClearValue:1,depthLoadOp:`clear`,depthStoreOp:`store`}}),a=A(t,this.config.worldRadius,this.config.atmosphereHeight);i.setIndexBuffer(this.terrainIndexBuffer,`uint32`),i.setPipeline(this.planetRenderPipeline),i.setBindGroup(0,this.planetFrameBindGroup),i.setBindGroup(1,this.planetTerrainBindGroup),this.drawTerrainFaces(i,a),i.setPipeline(this.oceanRenderPipeline),i.setBindGroup(0,this.oceanFrameBindGroup),i.setBindGroup(1,this.oceanTerrainBindGroup),this.drawTerrainFaces(i,a),i.setPipeline(this.airplaneRenderPipeline),i.setBindGroup(0,this.airplaneFrameBindGroup),i.setBindGroup(1,this.airplaneUniformBindGroup),i.draw(I,1,0,0),i.setPipeline(this.cloudsRenderPipeline),i.setBindGroup(0,this.cloudsFrameBindGroup),i.setBindGroup(1,this.cloudRenderBindGroup),i.draw(6,this.cloudParticleCount,0,0),i.setPipeline(this.atmosphereRenderPipeline),i.setBindGroup(0,this.atmosphereFrameBindGroup),i.setBindGroup(1,this.atmosphereTerrainBindGroup),this.drawTerrainFaces(i,a),i.end(),this.device.queue.submit([n.finish()])}drawTerrainFaces(e,t){for(let n=0;n<t.length;n++){let r=t[n]*this.terrainFaceIndexCount;e.drawIndexed(this.terrainFaceIndexCount,1,r,0,0)}}writeTerrainParams(){let e=new DataView(this.terrainParamBytes);e.setUint32(0,this.config.terrainResolution,!0),e.setFloat32(4,this.config.worldRadius,!0),e.setUint32(8,this.config.terrainNoise.octaves,!0),e.setFloat32(12,this.config.terrainNoise.persistence,!0),e.setFloat32(16,this.config.terrainNoise.lacunarity,!0),e.setFloat32(20,this.config.terrainNoise.baseFrequency,!0),e.setFloat32(24,this.config.terrainNoise.baseAmplitude,!0),e.setFloat32(28,this.config.terrainNoise.seed,!0),this.device.queue.writeBuffer(this.terrainParamBuffer,0,this.terrainParamBytes)}generateTerrain(){let e=this.device.createCommandEncoder(),t=e.beginComputePass();t.setPipeline(this.terrainComputePipeline),t.setBindGroup(0,this.terrainComputeBindGroup),t.dispatchWorkgroups(Math.ceil(this.config.terrainResolution/8),Math.ceil(this.config.terrainResolution/8),6),t.end(),this.device.queue.submit([e.finish()])}},B=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]]}));function H(e){return e-Math.floor(1/289*e)*289}function U(e){return H((e*34+10)*e)}function W(e){return 1.79284291400159-.85373472095314*e}function G(e,t,n,r,i,a){return e*r+t*i+n*a}function ee(e,t,n,r,i,a,o,s){return e*i+t*a+n*o+r*s}function K(e,t,n){let r=1/6,i=1/3,a=Math.floor(e+(e+t+n)*i),o=Math.floor(t+(e+t+n)*i),s=Math.floor(n+(e+t+n)*i),c=e-a+(a+o+s)*r,l=t-o+(a+o+s)*r,u=n-s+(a+o+s)*r,d=+(c>=l),f=+(l>=u),p=+(u>=c),m=1-d,h=1-f,g=1-p,_=Math.min(d,g),v=Math.min(f,m),y=Math.min(p,h),b=Math.max(d,g),x=Math.max(f,m),S=Math.max(p,h),C=c-_+r,w=l-v+r,T=u-y+r,E=c-b+i,D=l-x+i,O=u-S+i,k=c-.5,A=l-.5,j=u-.5;a=H(a),o=H(o),s=H(s);let M=U(U(U(s+0)+o+0)+a+0),N=U(U(U(s+y)+o+v)+a+_),P=U(U(U(s+S)+o+x)+a+b),F=U(U(U(s+1)+o+1)+a+1),I=1/7,L=I*2,R=I*.5-1,z=I*1,B=M-49*Math.floor(M*z*z),V=N-49*Math.floor(N*z*z),K=P-49*Math.floor(P*z*z),q=F-49*Math.floor(F*z*z),te=Math.floor(B*z),ne=Math.floor(V*z),re=Math.floor(K*z),ie=Math.floor(q*z),ae=Math.floor(B-7*te),oe=Math.floor(V-7*ne),se=Math.floor(K-7*re),ce=Math.floor(q-7*ie),J=te*L+R,Y=ne*L+R,le=re*L+R,X=ie*L+R,ue=ae*L+R,Z=oe*L+R,de=se*L+R,fe=ce*L+R,pe=1-Math.abs(J)-Math.abs(ue),me=1-Math.abs(Y)-Math.abs(Z),he=1-Math.abs(le)-Math.abs(de),ge=1-Math.abs(X)-Math.abs(fe),_e=J,ve=Y,ye=ue,be=Z,xe=le,Se=X,Ce=de,we=fe,Te=Math.floor(_e)*2+1,Ee=Math.floor(ve)*2+1,De=Math.floor(ye)*2+1,Oe=Math.floor(be)*2+1,ke=Math.floor(xe)*2+1,Ae=Math.floor(Se)*2+1,je=Math.floor(Ce)*2+1,Me=Math.floor(we)*2+1,Ne=pe<0?-1:0,Pe=me<0?-1:0,Fe=he<0?-1:0,Ie=ge<0?-1:0,Le=_e+Te*Ne,Re=ye+De*Ne,ze=ve+Ee*Pe,Be=be+Oe*Pe,Ve=xe+ke*Fe,He=Ce+je*Fe,Ue=Se+Ae*Ie,We=we+Me*Ie,Ge=Le,Ke=Re,qe=pe,Je=ze,Ye=Be,Q=me,Xe=Ve,Ze=He,Qe=he,$e=Ue,et=We,tt=ge,nt=W(G(Ge,Ke,qe,Ge,Ke,qe)),rt=W(G(Je,Ye,Q,Je,Ye,Q)),it=W(G(Xe,Ze,Qe,Xe,Ze,Qe)),at=W(G($e,et,tt,$e,et,tt));Ge*=nt,Ke*=nt,qe*=nt,Je*=rt,Ye*=rt,Q*=rt,Xe*=it,Ze*=it,Qe*=it,$e*=at,et*=at,tt*=at;let ot=Math.max(.5-G(c,l,u,c,l,u),0),st=Math.max(.5-G(C,w,T,C,w,T),0),ct=Math.max(.5-G(E,D,O,E,D,O),0),$=Math.max(.5-G(k,A,j,k,A,j),0);return ot*=ot,st*=st,ct*=ct,$*=$,105*ee(ot*ot,st*st,ct*ct,$*$,G(Ge,Ke,qe,c,l,u),G(Je,Ye,Q,C,w,T),G(Xe,Ze,Qe,E,D,O),G($e,et,tt,k,A,j))}function q(e,t,n,r,i,a,o){let s=0,c=1,l=r.baseFrequency,u=0;for(let d=0;d<r.octaves;d++)s+=K(e*l+i,t*l+a,n*l+o)*c,u+=c,c*=r.persistence,l*=r.lacunarity;return s/Math.max(u,1e-4)}function te(e,t,n,r){let i=0,a=1,o=r.baseFrequency*1.35,s=0;for(let c=0;c<r.octaves;c++){let c=1-Math.abs(K(e*o+r.seed*1.91,t*o+r.seed*1.91,n*o+r.seed*1.91));i+=c*c*a,s+=a,a*=r.persistence,o*=r.lacunarity}return i/Math.max(s,1e-4)}function ne(e,t){let n=e[0],r=e[1],i=e[2],a=K(n*t.baseFrequency*.22+t.seed,r*t.baseFrequency*.22,i*t.baseFrequency*.22),o=K(i*t.baseFrequency*.24,n*t.baseFrequency*.24+t.seed*1.3,r*t.baseFrequency*.24),s=K(r*t.baseFrequency*.2,i*t.baseFrequency*.2,n*t.baseFrequency*.2+t.seed*1.7),c=n+a*.22,l=r+o*.22,u=i+s*.22,d=Math.hypot(c,l,u)||1,f=c/d,p=l/d,m=u/d,h=x(.48,.86,q(f*.42,p*.42,m*.42,t,t.seed,t.seed,t.seed)*.5+.5),g=q(f*1.35,p*1.35,m*1.35,t,t.seed,t.seed,t.seed)*.5+.5,_=te(f*2.4,p*2.4,m*2.4,t),v=q(f*5.25,p*5.25,m*5.25,t,t.seed,t.seed,t.seed)*.5+.5,y=(g*(.18+h*.2)+_*.92*h+(v*.09+_*h*.28))*h;return Math.max(y*t.baseAmplitude,0)}var re=e((()=>{C()}));function ie(){return{pitch:0,yaw:0,roll:0,throttle:0,brake:0}}function ae(e,t){let i=n(e+t,0,0),a=n(1,0,0),o=n(0,0,-1),s=n(0,-1,0);return{worldCenter:n(),position:i,forward:o,right:s,up:r(n(),a),velocity:n(),gravityUp:a,previousPosition:r(n(),i),worldRadius:e,flyHeight:t,speed:42,minSpeed:12,maxSpeed:160,acceleration:28,yawRate:.9,pitchRate:.7,rollBank:0,bankResponse:2.4,_scratchA:n(),_scratchB:n(),_rotationQuat:_()}}function oe(e,t,n,i,p){let m=b(e.bankResponse*n,0,1);e.speed=b(e.speed+(t.throttle-t.brake)*e.acceleration*n,e.minSpeed,e.maxSpeed),r(e.previousPosition,e.position),d(e.gravityUp,e.position),e.rollBank+=(t.roll*.75-e.rollBank)*m;let h=(t.yaw+e.rollBank*.8)*e.yawRate*n;v(e._rotationQuat,e.gravityUp,h),y(e.forward,e.forward,e._rotationQuat),c(e.right,e.forward,e.gravityUp),u(e.right)<1e-6&&c(e.right,e.forward,e.up),d(e.right,e.right),c(e.up,e.gravityUp,e.right),d(e.up,e.up),v(e._rotationQuat,e.right,t.pitch*e.pitchRate*n),y(e.forward,e.forward,e._rotationQuat),d(e.forward,e.forward);let g=s(e.forward,e.gravityUp);Math.abs(g)>.98&&(f(e.forward,e.forward,e.gravityUp),d(e.forward,e.forward),g=s(e.forward,e.gravityUp)),c(e.right,e.forward,e.gravityUp),u(e.right)<1e-6&&c(e.right,e.forward,e.up),d(e.right,e.right),c(e.up,e.gravityUp,e.right),d(e.up,e.up),v(e._rotationQuat,e.forward,e.rollBank),y(e.right,e.right,e._rotationQuat),y(e.up,e.up,e._rotationQuat),d(e.right,e.right),d(e.up,e.up),a(e._scratchA,e.forward,e.speed*n),o(e.position,e.position,e._scratchA,1),d(e.gravityUp,e.position);let _=ne(e.gravityUp,i),x=e.worldRadius+Math.max(_,p)+2,S=Math.max(e.worldRadius+e.flyHeight,x),C=l(e.position);if(C<x)a(e.position,e.gravityUp,x),e.speed=b(e.speed*.8,e.minSpeed,e.maxSpeed),C=x;else{let t=S-C;o(e.position,e.position,e.gravityUp,t*m*.22),C=l(e.position)}return d(e.gravityUp,e.position),c(e.right,e.forward,e.gravityUp),u(e.right)<1e-6&&c(e.right,e.forward,e.up),d(e.right,e.right),c(e.up,e.gravityUp,e.right),d(e.up,e.up),v(e._rotationQuat,e.forward,e.rollBank),y(e.right,e.right,e._rotationQuat),y(e.up,e.up,e._rotationQuat),d(e.right,e.right),d(e.up,e.up),r(e._scratchB,e.position),e._scratchB[0]-=e.previousPosition[0],e._scratchB[1]-=e.previousPosition[1],e._scratchB[2]-=e.previousPosition[2],a(e.velocity,e._scratchB,n>0?1/n:0),e}var se=e((()=>{C(),re()}));async function ce(e){return Y.create(e)}var J,Y,le=e((()=>{E(),V(),C(),se(),J={terrainResolution:256,worldRadius:3e3,flyHeight:120,seaLevel:18,atmosphereHeight:260,particleCount:4096,cloudCollisionRadius:150,cloudRelaxToHome:.05,cloudBillboardSize:15,cloudStrength:.82,terrainNoise:{octaves:5,persistence:.52,lacunarity:2.15,baseFrequency:1.75,baseAmplitude:150,seed:11.5}},Y=class e{canvas;context;device;config;bridge;camera;player;input;sunDirection;isRunning=!1;lastTimeMs=0;animationFrame=e=>this.frame(e);constructor(e,t,r,i,a){this.canvas=e,this.context=t,this.device=r,this.config=i,this.bridge=a,this.camera=w(),this.player=ae(i.worldRadius,i.flyHeight),this.input=ie(),this.sunDirection=n(-.55,.45,-.7),d(this.sunDirection,this.sunDirection)}static async create(t){let n={...J,...t.config,terrainNoise:{...J.terrainNoise,...t.config?.terrainNoise??{}}},r=await z.create(t.device,t.presentationFormat,n,t.shaders,t.canvas.width,t.canvas.height),i=new e(t.canvas,t.context,t.device,n,r);return i.resize(),i}start(){this.isRunning||(this.isRunning=!0,this.lastTimeMs=performance.now(),requestAnimationFrame(this.animationFrame))}stop(){this.isRunning=!1}resize(){let e=Math.max(1,Math.floor(this.canvas.clientWidth*window.devicePixelRatio)),t=Math.max(1,Math.floor(this.canvas.clientHeight*window.devicePixelRatio));this.canvas.width!==e&&(this.canvas.width=e),this.canvas.height!==t&&(this.canvas.height=t),this.bridge.resize(e,t)}setKeyState(e,t){let n=+!!t;switch(e){case`KeyW`:case`ArrowUp`:case`KeyI`:this.input.pitch=-n;break;case`KeyS`:case`ArrowDown`:case`KeyK`:this.input.pitch=n;break;case`ArrowLeft`:case`KeyJ`:this.input.yaw=n;break;case`ArrowRight`:case`KeyL`:this.input.yaw=-n;break;case`KeyQ`:this.input.roll=-n;break;case`KeyE`:this.input.roll=n;break;case`ShiftLeft`:this.input.throttle=n;break;case`ControlLeft`:this.input.brake=n;break}}frame(e){if(!this.isRunning)return;let t=Math.min(.05,Math.max(.001,(e-this.lastTimeMs)*.001));this.lastTimeMs=e,oe(this.player,this.input,t,this.config.terrainNoise,this.config.seaLevel),T(this.camera,this.player.position,this.player.forward,this.player.worldCenter,this.canvas.width/this.canvas.height),this.bridge.updateFrameUniforms(this.camera,this.sunDirection,this.player.position,e*.001,t),this.bridge.updateCloudUniforms(this.player,t),this.bridge.updateAirplaneUniforms(this.player),this.bridge.render(this.context.getCurrentTexture().createView(),this.camera),requestAnimationFrame(this.animationFrame)}}})),X,ue=e((()=>{X=`// =============================================================================
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
`})),Z,de=e((()=>{Z=`// =============================================================================
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
`})),fe,pe=e((()=>{fe=`// =============================================================================
// planet.wgsl — Render Shader: planet surface from compute-generated buffers
// =============================================================================

struct FrameUniforms {
  viewProjection: mat4x4<f32>,
  cameraPos: vec4f,
  sunDir: vec4f,
  cameraRight: vec4f,
  cameraUp: vec4f,
  playerPos: vec4f,
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

fn atmosphericFog(worldPos: vec3f, cameraPos: vec3f, sunDir: vec3f) -> vec4f {
  let viewDir = normalize(worldPos - cameraPos);
  let dist = length(worldPos - cameraPos);
  let altitude = length(cameraPos) - frame.worldRadius;
  let altFactor = exp(-altitude / 400.0);
  let density = 0.00035 * altFactor;
  let fogAmount = 1.0 - exp(-dist * density);
  let sunDot = max(dot(viewDir, normalize(sunDir)), 0.0);
  let skyBase = vec3f(0.45, 0.62, 0.88);
  let sunsetTint = vec3f(0.98, 0.58, 0.32);
  let fogCol = mix(skyBase, sunsetTint, pow(sunDot, 4.0) * 0.5);
  return vec4f(fogCol, fogAmount);
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
  let humidityLarge = fractalNoise(
    planetPos.yzx * 1.37 + vec3f(planetSeed * 0.13, planetSeed * 0.29, planetSeed * 0.17),
    terrain.baseFreq * 0.72,
    max(terrain.octaves, 3u),
    0.58,
    terrain.lacunarity * 0.92,
    vec3f(37.1, 11.7, 53.9)
  ) * 0.5 + 0.5;
  let humiditySmall = snoise(planetPos * 8.5 + vec3f(planetSeed * 2.1, 7.3, -3.1)) * 0.25;
  let humidityNoise = clamp(humidityLarge + humiditySmall, 0.0, 1.0);
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

  let surfaceUp = in.sphereDir;
  let skyColor = vec3f(0.55, 0.70, 0.95);
  let groundColor = vec3f(0.25, 0.20, 0.15);
  let hemiFactor = dot(normal, surfaceUp) * 0.5 + 0.5;
  let ambientIndirect = mix(groundColor, skyColor, hemiFactor) * 0.35;
  let rimLight = pow(1.0 - max(dot(viewDir, normal), 0.0), 3.0) * 0.08;
  let backLight = pow(max(dot(-dirToSun, viewDir), 0.0), 3.0) * slope * 0.12;
  let sunLight = albedo * diffuse * 1.15;
  let albedoLighting = albedo * ambientIndirect + sunLight + vec3f(rimLight + backLight);
  let fog = atmosphericFog(in.worldPos, frame.cameraPos.xyz, frame.sunDir.xyz);
  let finalColor = mix(albedoLighting, fog.rgb, fog.a);
  return vec4f(finalColor, 1.0);
}
`})),me,he=e((()=>{me=`// =============================================================================
// ocean.wgsl — Render Shader: animated ocean shell + solar specular highlight
// =============================================================================

struct FrameUniforms {
  viewProjection: mat4x4<f32>,
  cameraPos: vec4f,
  sunDir: vec4f,
  cameraRight: vec4f,
  cameraUp: vec4f,
  playerPos: vec4f,
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
  @location(2) uv: vec2f,
  @location(3) terrainHeight: f32,
};

@group(0) @binding(0) var<uniform> frame: FrameUniforms;
@group(1) @binding(0) var<uniform> terrain: TerrainParams;
@group(1) @binding(1) var<storage, read> terrainPositions: array<vec4f>;
@group(1) @binding(3) var<storage, read> terrainHeights: array<f32>;

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

fn fractalNoise(pos: vec3f) -> f32 {
  var noise = 0.0;
  var amplitude = 1.0;
  var frequency = terrain.baseFreq;
  var amplitudeSum = 0.0;

  for (var i = 0u; i < terrain.octaves; i++) {
    noise += snoise(pos * frequency + vec3f(terrain.seed)) * amplitude;
    amplitudeSum += amplitude;
    amplitude *= terrain.persistence;
    frequency *= terrain.lacunarity;
  }

  return noise / max(amplitudeSum, 0.0001);
}

fn ridgedNoise(pos: vec3f) -> f32 {
  var value = 0.0;
  var amplitude = 1.0;
  var frequency = terrain.baseFreq * 1.35;
  var amplitudeSum = 0.0;

  for (var i = 0u; i < terrain.octaves; i++) {
    let sampleValue = 1.0 - abs(snoise(pos * frequency + vec3f(terrain.seed * 1.91)));
    value += sampleValue * sampleValue * amplitude;
    amplitudeSum += amplitude;
    amplitude *= terrain.persistence;
    frequency *= terrain.lacunarity;
  }

  return value / max(amplitudeSum, 0.0001);
}

fn terrainHeightAt(sphereDir: vec3f) -> f32 {
  let warp = vec3f(
    snoise(sphereDir * terrain.baseFreq * 0.22 + vec3f(terrain.seed, 0.0, 0.0)),
    snoise(sphereDir.zxy * terrain.baseFreq * 0.24 + vec3f(0.0, terrain.seed * 1.3, 0.0)),
    snoise(sphereDir.yzx * terrain.baseFreq * 0.2 + vec3f(0.0, 0.0, terrain.seed * 1.7))
  );
  let warped = normalize(sphereDir + warp * 0.22);
  let continents = smoothstep(0.48, 0.86, fractalNoise(warped * 0.42) * 0.5 + 0.5);
  let hills = fractalNoise(warped * 1.35) * 0.5 + 0.5;
  let mountains = ridgedNoise(warped * 2.4);
  let details = fractalNoise(warped * 5.25) * 0.5 + 0.5;
  let macroHeight = mix(hills * 0.18, hills * 0.38 + mountains * 0.92, continents);
  let detailHeight = details * 0.09 + mountains * continents * 0.28;
  let combined = (macroHeight + detailHeight) * continents;
  return max(combined * terrain.baseAmp, 0.0);
}

fn sphereToUV(p: vec3f) -> vec2f {
  let n = normalize(p);
  let longitude = atan2(n.x, -n.z);
  let latitude = asin(clamp(n.y, -1.0, 1.0));
  let u = (longitude / 3.14159265359 + 1.0) * 0.5;
  let v = latitude / 3.14159265359 + 0.5;
  return vec2f(u, v);
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

fn atmosphericFog(worldPos: vec3f, cameraPos: vec3f, sunDir: vec3f) -> vec4f {
  let viewDir = normalize(worldPos - cameraPos);
  let dist = length(worldPos - cameraPos);
  let altitude = length(cameraPos) - frame.worldRadius;
  let altFactor = exp(-altitude / 400.0);
  let density = 0.00035 * altFactor;
  let fogAmount = 1.0 - exp(-dist * density);
  let sunDot = max(dot(viewDir, normalize(sunDir)), 0.0);
  let skyBase = vec3f(0.45, 0.62, 0.88);
  let sunsetTint = vec3f(0.98, 0.58, 0.32);
  let fogCol = mix(skyBase, sunsetTint, pow(sunDot, 4.0) * 0.5);
  return vec4f(fogCol, fogAmount);
}

@vertex
fn vs_main(@builtin(vertex_index) vertexIndex: u32) -> VertexOut {
  let sphereDir = normalize(terrainPositions[vertexIndex].xyz);
  let terrainHeight = terrainHeights[vertexIndex];
  let worldPos = sphereDir * (terrain.worldRadius + frame.seaLevel);

  var out: VertexOut;
  out.worldPos = worldPos;
  out.sphereDir = sphereDir;
  out.uv = sphereToUV(sphereDir);
  out.terrainHeight = terrainHeight;
  out.clipPosition = frame.viewProjection * vec4f(worldPos, 1.0);
  return out;
}

@fragment
fn fs_main(in: VertexOut) -> @location(0) vec4f {
  let approxWaterDepth = frame.seaLevel - in.terrainHeight;
  let sampledTerrainHeight = select(in.terrainHeight, terrainHeightAt(in.sphereDir), abs(approxWaterDepth) < 6.0);
  let waterDepth = frame.seaLevel - sampledTerrainHeight;
  if (waterDepth <= 0.0) {
    discard;
  }

  let dirToSun = normalize(frame.sunDir.xyz);
  let viewDir = normalize(frame.cameraPos.xyz - in.worldPos);
  let basis = tangentFrame(in.sphereDir);
  let n1 = vec2f(
    snoise(in.worldPos * 0.015 + vec3f(frame.time * 0.3, 0.0, 0.0)),
    snoise(in.worldPos.zxy * 0.015 + vec3f(0.0, frame.time * 0.25, 0.0))
  );
  let n2 = vec2f(
    snoise(in.worldPos * 0.18 + vec3f(frame.time * 1.1, 0.0, 0.0)),
    snoise(in.worldPos.zxy * 0.18 + vec3f(0.0, frame.time * 0.95, 0.0))
  );
  let bump = n1 * 0.6 + n2 * 0.25;
  let normal = normalize(basis * normalize(vec3f(bump * 0.25, 1.0)));

  let fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), 3.5);
  let reflDir = reflect(-viewDir, normal);
  let skyUp = max(dot(reflDir, in.sphereDir), 0.0);
  let skyRefl = mix(
    vec3f(0.35, 0.52, 0.78),
    vec3f(0.08, 0.22, 0.52),
    pow(skyUp, 0.6)
  );
  let halfVector = normalize(dirToSun + viewDir);
  let specBase = pow(max(dot(normal, halfVector), 0.0), 24.0);
  let glitterNoise = snoise(in.worldPos * 2.5 + vec3f(frame.time * 3.0, 0.0, 0.0));
  let glitter = pow(max(glitterNoise, 0.0), 6.0) * specBase * 4.0;

  let diffuse = max(dot(normal, dirToSun), 0.0);
  let deepWaterColor = vec3f(0.03, 0.11, 0.22);
  let shallowWaterColor = vec3f(0.08, 0.36, 0.58);
  let depthFactor = clamp(waterDepth / 60.0, 0.0, 1.0);
  let caustic = sin(in.worldPos.x * 0.3 + frame.time) * sin(in.worldPos.z * 0.3 + frame.time * 1.3);
  let shallowTinted = shallowWaterColor + vec3f(0.15, 0.18, 0.12) * max(caustic, 0.0) * (1.0 - depthFactor);
  let waterBase = mix(shallowTinted, deepWaterColor, depthFactor);
  let waterLit = waterBase * (0.35 + diffuse * 0.5);
  let waterCol = mix(waterLit, skyRefl, fresnel * 0.85);
  let highlight = vec3f(1.0, 0.97, 0.86) * (specBase * 0.6 + glitter);
  let foam = step(waterDepth, 1.2 + sin(frame.time * 2.0 - in.uv.x * 50.0) * 0.5);
  let shoreFoam = (1.0 - smoothstep(0.0, 4.0, waterDepth)) * 0.8;
  let foamColor = vec3f(1.0) * max(foam, shoreFoam);
  let planeOnSea = normalize(frame.playerPos.xyz) * (terrain.worldRadius + frame.seaLevel);
  let shadowDist = length(in.worldPos - planeOnSea);
  let planeShadow = 1.0 - (1.0 - smoothstep(0.0, 40.0, shadowDist)) * 0.4;
  let albedoLighting = (waterCol + highlight + foamColor) * planeShadow;
  let fog = atmosphericFog(in.worldPos, frame.cameraPos.xyz, frame.sunDir.xyz);
  let finalColor = mix(albedoLighting, fog.rgb, fog.a);

  return vec4f(finalColor, mix(0.42, 0.72, depthFactor));
}
`})),ge,_e=e((()=>{ge=`// =============================================================================
// atmosphere.wgsl — Render Shader: lightweight atmospheric shell
// =============================================================================

struct FrameUniforms {
  viewProjection: mat4x4<f32>,
  cameraPos: vec4f,
  sunDir: vec4f,
  cameraRight: vec4f,
  cameraUp: vec4f,
  playerPos: vec4f,
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
  let viewDir = normalize(in.worldPos - frame.cameraPos.xyz);
  let surfaceUp = normalize(frame.cameraPos.xyz);
  let upness = max(dot(-viewDir, surfaceUp), 0.0);

  let zenithCol = vec3f(0.08, 0.22, 0.55);
  let middleCol = vec3f(0.35, 0.58, 0.88);
  let horizonCol = vec3f(0.82, 0.72, 0.58);

  let lowSky = mix(horizonCol, middleCol, smoothstep(0.0, 0.3, upness));
  let sky = mix(lowSky, zenithCol, smoothstep(0.3, 0.9, upness));

  let sunDot = max(dot(viewDir, dirToSun), 0.0);
  let sunsetWarm = vec3f(0.98, 0.52, 0.22);
  let finalSky = mix(sky, sunsetWarm, pow(sunDot, 8.0) * 0.5);

  let horizon = pow(1.0 - max(dot(in.sphereDir, -viewDir), 0.0), 2.6);
  return vec4f(finalSky, horizon * 0.6);
}
`})),ve,ye=e((()=>{ve=`// =============================================================================
// clouds.wgsl — Render Shader: instanced billboards with volumetric shading
// =============================================================================

struct FrameUniforms {
  viewProjection: mat4x4<f32>,
  cameraPos: vec4f,
  sunDir: vec4f,
  cameraRight: vec4f,
  cameraUp: vec4f,
  playerPos: vec4f,
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
  let cloudCol = mix(vec3f(0.48, 0.52, 0.58), vec3f(0.96, 0.97, 1.0), shading);
  return vec4f(cloudCol, cloudStrength * 0.58);
}
`})),be,xe=e((()=>{be=`// =============================================================================
// airplane.wgsl — Render Shader: procedural aircraft mesh driven by player state
// =============================================================================

struct FrameUniforms {
  viewProjection: mat4x4<f32>,
  cameraPos: vec4f,
  sunDir: vec4f,
  cameraRight: vec4f,
  cameraUp: vec4f,
  playerPos: vec4f,
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
`}));t((()=>{le(),ue(),de(),pe(),he(),_e(),ye(),xe();async function e(){if(!(`gpu`in navigator))throw Error(`WebGPU nao esta disponivel neste navegador.`);let e=document.querySelector(`#viewport`);if(!e)throw Error(`Canvas #viewport nao encontrado.`);let t=await navigator.gpu.requestAdapter();if(!t)throw Error(`Nenhum adaptador WebGPU disponivel.`);let n=await t.requestDevice(),r=e.getContext(`webgpu`);if(!r)throw Error(`Nao foi possivel obter o contexto WebGPU.`);let i=navigator.gpu.getPreferredCanvasFormat();r.configure({device:n,format:i,alphaMode:`opaque`});let a=await ce({canvas:e,context:r,device:n,presentationFormat:i,shaders:{terrainCompute:X,cloudsCompute:Z,planetRender:fe,oceanRender:me,atmosphereRender:ge,cloudsRender:ve,airplaneRender:be}});window.addEventListener(`resize`,()=>a.resize()),window.addEventListener(`keydown`,e=>a.setKeyState(e.code,!0)),window.addEventListener(`keyup`,e=>a.setKeyState(e.code,!1)),a.start()}e().catch(e=>{console.error(e);let t=document.querySelector(`#error`);t&&(t.textContent=e instanceof Error?e.message:String(e))})}))();