// =============================================================================
// math.ts — Linear Algebra Primitives (WASM-Ready)
// All operations use flat Float32Arrays for GPU buffer compatibility.
// Zero-allocation: mutate in place via output parameter.
// =============================================================================

export type Vec3 = Float32Array;
export type Vec4 = Float32Array;
export type Mat4 = Float32Array;
export type Quat = Float32Array;

// --- Vec3 ---
export function vec3(x = 0, y = 0, z = 0): Vec3 {
  return new Float32Array([x, y, z]);
}
export function vec3Set(o: Vec3, x: number, y: number, z: number): Vec3 {
  o[0] = x; o[1] = y; o[2] = z; return o;
}
export function vec3Copy(o: Vec3, a: Vec3): Vec3 {
  o[0] = a[0]; o[1] = a[1]; o[2] = a[2]; return o;
}
export function vec3Add(o: Vec3, a: Vec3, b: Vec3): Vec3 {
  o[0] = a[0]+b[0]; o[1] = a[1]+b[1]; o[2] = a[2]+b[2]; return o;
}
export function vec3Sub(o: Vec3, a: Vec3, b: Vec3): Vec3 {
  o[0] = a[0]-b[0]; o[1] = a[1]-b[1]; o[2] = a[2]-b[2]; return o;
}
export function vec3Scale(o: Vec3, a: Vec3, s: number): Vec3 {
  o[0] = a[0]*s; o[1] = a[1]*s; o[2] = a[2]*s; return o;
}
export function vec3AddScaled(o: Vec3, a: Vec3, b: Vec3, s: number): Vec3 {
  o[0] = a[0] + b[0] * s;
  o[1] = a[1] + b[1] * s;
  o[2] = a[2] + b[2] * s;
  return o;
}
export function vec3Dot(a: Vec3, b: Vec3): number {
  return a[0]*b[0] + a[1]*b[1] + a[2]*b[2];
}
export function vec3Cross(o: Vec3, a: Vec3, b: Vec3): Vec3 {
  const ax=a[0],ay=a[1],az=a[2], bx=b[0],by=b[1],bz=b[2];
  o[0]=ay*bz-az*by; o[1]=az*bx-ax*bz; o[2]=ax*by-ay*bx; return o;
}
export function vec3Length(a: Vec3): number {
  return Math.sqrt(a[0]*a[0]+a[1]*a[1]+a[2]*a[2]);
}
export function vec3LengthSq(a: Vec3): number {
  return a[0]*a[0]+a[1]*a[1]+a[2]*a[2];
}
export function vec3Normalize(o: Vec3, a: Vec3): Vec3 {
  const l = vec3Length(a);
  if(l>1e-8){ const i=1/l; o[0]=a[0]*i; o[1]=a[1]*i; o[2]=a[2]*i; }
  else { o[0]=0;o[1]=0;o[2]=0; }
  return o;
}
export function vec3Lerp(o: Vec3, a: Vec3, b: Vec3, t: number): Vec3 {
  o[0]=a[0]+(b[0]-a[0])*t; o[1]=a[1]+(b[1]-a[1])*t; o[2]=a[2]+(b[2]-a[2])*t; return o;
}
export function vec3Negate(o: Vec3, a: Vec3): Vec3 {
  o[0]=-a[0]; o[1]=-a[1]; o[2]=-a[2]; return o;
}
export function vec3ProjectOnPlane(o: Vec3, a: Vec3, normal: Vec3): Vec3 {
  const d = vec3Dot(a, normal);
  o[0] = a[0] - normal[0] * d;
  o[1] = a[1] - normal[1] * d;
  o[2] = a[2] - normal[2] * d;
  return o;
}
export function vec3Distance(a: Vec3, b: Vec3): number {
  const dx=a[0]-b[0], dy=a[1]-b[1], dz=a[2]-b[2];
  return Math.sqrt(dx*dx+dy*dy+dz*dz);
}

// --- Vec4 ---
export function vec4(x=0,y=0,z=0,w=1): Vec4 { return new Float32Array([x,y,z,w]); }

// --- Mat4 (column-major) ---
export function mat4(): Mat4 {
  const m = new Float32Array(16); m[0]=1;m[5]=1;m[10]=1;m[15]=1; return m;
}
export function mat4Identity(o: Mat4): Mat4 {
  o.fill(0); o[0]=1;o[5]=1;o[10]=1;o[15]=1; return o;
}
export function mat4Multiply(o: Mat4, a: Mat4, b: Mat4): Mat4 {
  for(let c=0;c<4;c++) for(let r=0;r<4;r++){
    let s=0; for(let k=0;k<4;k++) s+=a[k*4+r]*b[c*4+k]; o[c*4+r]=s;
  } return o;
}
export function mat4Perspective(o: Mat4, fovY: number, asp: number, near: number, far: number): Mat4 {
  const f=1/Math.tan(fovY*0.5), ri=1/(near-far);
  o.fill(0); o[0]=f/asp; o[5]=f; o[10]=far*ri; o[11]=-1; o[14]=near*far*ri; return o;
}
export function mat4LookAt(o: Mat4, eye: Vec3, tgt: Vec3, up: Vec3): Mat4 {
  const z=vec3(),x=vec3(),y=vec3();
  vec3Sub(z,eye,tgt); vec3Normalize(z,z);
  vec3Cross(x,up,z);  vec3Normalize(x,x);
  vec3Cross(y,z,x);
  o[0]=x[0];o[1]=y[0];o[2]=z[0];o[3]=0;
  o[4]=x[1];o[5]=y[1];o[6]=z[1];o[7]=0;
  o[8]=x[2];o[9]=y[2];o[10]=z[2];o[11]=0;
  o[12]=-vec3Dot(x,eye);o[13]=-vec3Dot(y,eye);o[14]=-vec3Dot(z,eye);o[15]=1;
  return o;
}
export function mat4FromRotationTranslation(o: Mat4, q: Quat, v: Vec3): Mat4 {
  const x=q[0],y=q[1],z=q[2],w=q[3];
  const x2=x+x,y2=y+y,z2=z+z;
  const xx=x*x2,xy=x*y2,xz=x*z2,yy=y*y2,yz=y*z2,zz=z*z2,wx=w*x2,wy=w*y2,wz=w*z2;
  o[0]=1-(yy+zz);o[1]=xy+wz;o[2]=xz-wy;o[3]=0;
  o[4]=xy-wz;o[5]=1-(xx+zz);o[6]=yz+wx;o[7]=0;
  o[8]=xz+wy;o[9]=yz-wx;o[10]=1-(xx+yy);o[11]=0;
  o[12]=v[0];o[13]=v[1];o[14]=v[2];o[15]=1;
  return o;
}
export function vec3TransformMat4(o: Vec3, a: Vec3, m: Mat4): Vec3 {
  const x=a[0],y=a[1],z=a[2];
  const w=m[3]*x+m[7]*y+m[11]*z+m[15]||1;
  o[0]=(m[0]*x+m[4]*y+m[8]*z+m[12])/w;
  o[1]=(m[1]*x+m[5]*y+m[9]*z+m[13])/w;
  o[2]=(m[2]*x+m[6]*y+m[10]*z+m[14])/w;
  return o;
}

// --- Quaternion [x,y,z,w] ---
export function quat(x=0,y=0,z=0,w=1): Quat { return new Float32Array([x,y,z,w]); }
export function quatIdentity(o: Quat): Quat { o[0]=0;o[1]=0;o[2]=0;o[3]=1; return o; }
export function quatMultiply(o: Quat, a: Quat, b: Quat): Quat {
  const ax=a[0],ay=a[1],az=a[2],aw=a[3],bx=b[0],by=b[1],bz=b[2],bw=b[3];
  o[0]=aw*bx+ax*bw+ay*bz-az*by; o[1]=aw*by-ax*bz+ay*bw+az*bx;
  o[2]=aw*bz+ax*by-ay*bx+az*bw; o[3]=aw*bw-ax*bx-ay*by-az*bz; return o;
}
export function quatNormalize(o: Quat, a: Quat): Quat {
  const l=Math.sqrt(a[0]*a[0]+a[1]*a[1]+a[2]*a[2]+a[3]*a[3]);
  if(l>1e-8){const i=1/l;o[0]=a[0]*i;o[1]=a[1]*i;o[2]=a[2]*i;o[3]=a[3]*i;}
  return o;
}
export function quatFromAxisAngle(o: Quat, axis: Vec3, rad: number): Quat {
  const h=rad*0.5, s=Math.sin(h);
  o[0]=axis[0]*s;o[1]=axis[1]*s;o[2]=axis[2]*s;o[3]=Math.cos(h); return o;
}
export function quatFromUnitVectors(o: Quat, from: Vec3, to: Vec3): Quat {
  const d=vec3Dot(from,to);
  if(d>=1-1e-6) return quatIdentity(o);
  if(d<=-1+1e-6){
    const t=vec3(); vec3Cross(t,vec3(1,0,0),from);
    if(vec3Length(t)<1e-6) vec3Cross(t,vec3(0,1,0),from);
    vec3Normalize(t,t); quatFromAxisAngle(o,t,Math.PI); return o;
  }
  const ax=vec3(); vec3Cross(ax,from,to);
  o[0]=ax[0];o[1]=ax[1];o[2]=ax[2];o[3]=1+d;
  return quatNormalize(o,o);
}
export function vec3RotateByQuat(o: Vec3, v: Vec3, q: Quat): Vec3 {
  const qx=q[0],qy=q[1],qz=q[2],qw=q[3],vx=v[0],vy=v[1],vz=v[2];
  const tx=2*(qy*vz-qz*vy),ty=2*(qz*vx-qx*vz),tz=2*(qx*vy-qy*vx);
  o[0]=vx+qw*tx+(qy*tz-qz*ty);
  o[1]=vy+qw*ty+(qz*tx-qx*tz);
  o[2]=vz+qw*tz+(qx*ty-qy*tx); return o;
}

// --- Utility ---
export const DEG_TO_RAD = Math.PI / 180;
export const RAD_TO_DEG = 180 / Math.PI;
export const PI = Math.PI;
export const TWO_PI = Math.PI * 2;
export function clamp(v: number, mn: number, mx: number): number {
  return v < mn ? mn : v > mx ? mx : v;
}
export function lerp(a: number, b: number, t: number): number { return a+(b-a)*t; }
export function smoothstep(e0: number, e1: number, x: number): number {
  const t = clamp((x-e0)/(e1-e0),0,1); return t*t*(3-2*t);
}
