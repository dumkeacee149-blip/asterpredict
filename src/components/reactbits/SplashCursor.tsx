'use client';
import React, { useEffect, useRef } from 'react';

interface ColorRGB { r: number; g: number; b: number; }

interface SplashCursorProps {
  SIM_RESOLUTION?: number;
  DYE_RESOLUTION?: number;
  DENSITY_DISSIPATION?: number;
  VELOCITY_DISSIPATION?: number;
  PRESSURE?: number;
  PRESSURE_ITERATIONS?: number;
  CURL?: number;
  SPLAT_RADIUS?: number;
  SPLAT_FORCE?: number;
  SHADING?: boolean;
  COLOR_UPDATE_SPEED?: number;
  BACK_COLOR?: ColorRGB;
  TRANSPARENT?: boolean;
}

interface Pointer {
  id: number; texcoordX: number; texcoordY: number;
  prevTexcoordX: number; prevTexcoordY: number;
  deltaX: number; deltaY: number;
  down: boolean; moved: boolean; color: ColorRGB;
}

function pointerPrototype(): Pointer {
  return { id: -1, texcoordX: 0, texcoordY: 0, prevTexcoordX: 0, prevTexcoordY: 0,
    deltaX: 0, deltaY: 0, down: false, moved: false, color: { r: 0, g: 0, b: 0 } };
}

export default function SplashCursor({
  SIM_RESOLUTION = 128, DYE_RESOLUTION = 1440,
  DENSITY_DISSIPATION = 4, VELOCITY_DISSIPATION = 2,
  PRESSURE = 0.1, PRESSURE_ITERATIONS = 20,
  CURL = 5, SPLAT_RADIUS = 0.15, SPLAT_FORCE = 4000,
  SHADING = true, COLOR_UPDATE_SPEED = 10,
  BACK_COLOR = { r: 0, g: 0, b: 0 }, TRANSPARENT = true
}: SplashCursorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const pointers: Pointer[] = [pointerPrototype()];
    const config = { SIM_RESOLUTION, DYE_RESOLUTION, DENSITY_DISSIPATION, VELOCITY_DISSIPATION,
      PRESSURE, PRESSURE_ITERATIONS, CURL, SPLAT_RADIUS, SPLAT_FORCE,
      SHADING, COLOR_UPDATE_SPEED, PAUSED: false, BACK_COLOR, TRANSPARENT };

    const params = { alpha: true, depth: false, stencil: false, antialias: false, preserveDrawingBuffer: false };
    let gl = canvas.getContext('webgl2', params) as WebGL2RenderingContext | null;
    if (!gl) gl = (canvas.getContext('webgl', params) || canvas.getContext('experimental-webgl', params)) as WebGL2RenderingContext | null;
    if (!gl) return;

    const isWebGL2 = 'drawBuffers' in gl;
    let supportLinearFiltering = false;
    let halfFloat: any = null;

    if (isWebGL2) {
      gl.getExtension('EXT_color_buffer_float');
      supportLinearFiltering = !!gl.getExtension('OES_texture_float_linear');
    } else {
      halfFloat = gl.getExtension('OES_texture_half_float');
      supportLinearFiltering = !!gl.getExtension('OES_texture_half_float_linear');
    }
    gl.clearColor(0, 0, 0, 1);

    if (!supportLinearFiltering) { config.DYE_RESOLUTION = 256; config.SHADING = false; }

    const halfFloatTexType = isWebGL2 ? (gl as WebGL2RenderingContext).HALF_FLOAT : (halfFloat?.HALF_FLOAT_OES) || 0;

    function getSupportedFormat(glCtx: any, iF: number, f: number, t: number): any {
      if (!supportRenderTex(glCtx, iF, f, t)) {
        if (isWebGL2) {
          if (iF === glCtx.R16F) return getSupportedFormat(glCtx, glCtx.RG16F, glCtx.RG, t);
          if (iF === glCtx.RG16F) return getSupportedFormat(glCtx, glCtx.RGBA16F, glCtx.RGBA, t);
        }
        return null;
      }
      return { internalFormat: iF, format: f };
    }

    function supportRenderTex(glCtx: any, iF: number, f: number, t: number) {
      const tex = glCtx.createTexture(); if (!tex) return false;
      glCtx.bindTexture(glCtx.TEXTURE_2D, tex);
      glCtx.texParameteri(glCtx.TEXTURE_2D, glCtx.TEXTURE_MIN_FILTER, glCtx.NEAREST);
      glCtx.texParameteri(glCtx.TEXTURE_2D, glCtx.TEXTURE_MAG_FILTER, glCtx.NEAREST);
      glCtx.texParameteri(glCtx.TEXTURE_2D, glCtx.TEXTURE_WRAP_S, glCtx.CLAMP_TO_EDGE);
      glCtx.texParameteri(glCtx.TEXTURE_2D, glCtx.TEXTURE_WRAP_T, glCtx.CLAMP_TO_EDGE);
      glCtx.texImage2D(glCtx.TEXTURE_2D, 0, iF, 4, 4, 0, f, t, null);
      const fbo = glCtx.createFramebuffer(); if (!fbo) return false;
      glCtx.bindFramebuffer(glCtx.FRAMEBUFFER, fbo);
      glCtx.framebufferTexture2D(glCtx.FRAMEBUFFER, glCtx.COLOR_ATTACHMENT0, glCtx.TEXTURE_2D, tex, 0);
      return glCtx.checkFramebufferStatus(glCtx.FRAMEBUFFER) === glCtx.FRAMEBUFFER_COMPLETE;
    }

    let formatRGBA: any, formatRG: any, formatR: any;
    if (isWebGL2) {
      const gl2 = gl as WebGL2RenderingContext;
      formatRGBA = getSupportedFormat(gl2, gl2.RGBA16F, gl2.RGBA, halfFloatTexType);
      formatRG = getSupportedFormat(gl2, gl2.RG16F, gl2.RG, halfFloatTexType);
      formatR = getSupportedFormat(gl2, gl2.R16F, gl2.RED, halfFloatTexType);
    } else {
      formatRGBA = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
      formatRG = formatRGBA; formatR = formatRGBA;
    }

    if (!formatRGBA || !formatRG || !formatR) return;

    const filtering = supportLinearFiltering ? gl.LINEAR : gl.NEAREST;

    function addKW(src: string, kw: string[] | null) { return kw ? kw.map(k => `#define ${k}\n`).join('') + src : src; }
    function compileShader(type: number, src: string, kw: string[] | null = null) {
      const s = gl!.createShader(type); if (!s) return null;
      gl!.shaderSource(s, addKW(src, kw)); gl!.compileShader(s); return s;
    }
    function createProg(vs: WebGLShader | null, fs: WebGLShader | null) {
      if (!vs || !fs) return null; const p = gl!.createProgram()!;
      gl!.attachShader(p, vs); gl!.attachShader(p, fs); gl!.linkProgram(p); return p;
    }
    function getUniforms(p: WebGLProgram) {
      const u: Record<string, WebGLUniformLocation | null> = {};
      for (let i = 0; i < gl!.getProgramParameter(p, gl!.ACTIVE_UNIFORMS); i++) {
        const info = gl!.getActiveUniform(p, i); if (info) u[info.name] = gl!.getUniformLocation(p, info.name);
      }
      return u;
    }

    class Prog { program: WebGLProgram | null; uniforms: Record<string, WebGLUniformLocation | null>;
      constructor(vs: WebGLShader | null, fs: WebGLShader | null) { this.program = createProg(vs, fs); this.uniforms = this.program ? getUniforms(this.program) : {}; }
      bind() { if (this.program) gl!.useProgram(this.program); }
    }

    class Mat { vs: WebGLShader | null; fsSrc: string; progs: Record<number, WebGLProgram | null> = {}; active: WebGLProgram | null = null; uniforms: Record<string, WebGLUniformLocation | null> = {};
      constructor(vs: WebGLShader | null, fsSrc: string) { this.vs = vs; this.fsSrc = fsSrc; }
      setKW(kws: string[]) { let h = 0; for (const k of kws) { for (let i = 0; i < k.length; i++) { h = (h << 5) - h + k.charCodeAt(i); h |= 0; } }
        let p = this.progs[h]; if (!p) { p = createProg(this.vs, compileShader(gl!.FRAGMENT_SHADER, this.fsSrc, kws)); this.progs[h] = p; }
        if (p === this.active) return; if (p) this.uniforms = getUniforms(p); this.active = p; }
      bind() { if (this.active) gl!.useProgram(this.active); }
    }

    const bvs = compileShader(gl.VERTEX_SHADER, `precision highp float;attribute vec2 aPosition;varying vec2 vUv;varying vec2 vL;varying vec2 vR;varying vec2 vT;varying vec2 vB;uniform vec2 texelSize;void main(){vUv=aPosition*.5+.5;vL=vUv-vec2(texelSize.x,0.);vR=vUv+vec2(texelSize.x,0.);vT=vUv+vec2(0.,texelSize.y);vB=vUv-vec2(0.,texelSize.y);gl_Position=vec4(aPosition,0.,1.);}`);

    const splatProg = new Prog(bvs, compileShader(gl.FRAGMENT_SHADER, `precision highp float;precision highp sampler2D;varying vec2 vUv;uniform sampler2D uTarget;uniform float aspectRatio;uniform vec3 color;uniform vec2 point;uniform float radius;void main(){vec2 p=vUv-point.xy;p.x*=aspectRatio;vec3 splat=exp(-dot(p,p)/radius)*color;vec3 base=texture2D(uTarget,vUv).xyz;gl_FragColor=vec4(base+splat,1.);}`)!);
    const copyProg = new Prog(bvs, compileShader(gl.FRAGMENT_SHADER, `precision mediump float;precision mediump sampler2D;varying highp vec2 vUv;uniform sampler2D uTexture;void main(){gl_FragColor=texture2D(uTexture,vUv);}`)!);
    const clearProg = new Prog(bvs, compileShader(gl.FRAGMENT_SHADER, `precision mediump float;precision mediump sampler2D;varying highp vec2 vUv;uniform sampler2D uTexture;uniform float value;void main(){gl_FragColor=value*texture2D(uTexture,vUv);}`)!);
    const advProg = new Prog(bvs, compileShader(gl.FRAGMENT_SHADER, `precision highp float;precision highp sampler2D;varying vec2 vUv;uniform sampler2D uVelocity;uniform sampler2D uSource;uniform vec2 texelSize;uniform vec2 dyeTexelSize;uniform float dt;uniform float dissipation;vec4 bilerp(sampler2D sam,vec2 uv,vec2 ts){vec2 st=uv/ts-.5;vec2 iuv=floor(st);vec2 fuv=fract(st);vec4 a=texture2D(sam,(iuv+vec2(.5,.5))*ts);vec4 b=texture2D(sam,(iuv+vec2(1.5,.5))*ts);vec4 c=texture2D(sam,(iuv+vec2(.5,1.5))*ts);vec4 d=texture2D(sam,(iuv+vec2(1.5,1.5))*ts);return mix(mix(a,b,fuv.x),mix(c,d,fuv.x),fuv.y);}void main(){${supportLinearFiltering?'vec2 coord=vUv-dt*texture2D(uVelocity,vUv).xy*texelSize;vec4 result=texture2D(uSource,coord);':'vec2 coord=vUv-dt*bilerp(uVelocity,vUv,texelSize).xy*texelSize;vec4 result=bilerp(uSource,coord,dyeTexelSize);'}float decay=1.+dissipation*dt;gl_FragColor=result/decay;}`)!);
    const divProg = new Prog(bvs, compileShader(gl.FRAGMENT_SHADER, `precision mediump float;precision mediump sampler2D;varying highp vec2 vUv;varying highp vec2 vL;varying highp vec2 vR;varying highp vec2 vT;varying highp vec2 vB;uniform sampler2D uVelocity;void main(){float L=texture2D(uVelocity,vL).x;float R=texture2D(uVelocity,vR).x;float T=texture2D(uVelocity,vT).y;float B=texture2D(uVelocity,vB).y;vec2 C=texture2D(uVelocity,vUv).xy;if(vL.x<0.)L=-C.x;if(vR.x>1.)R=-C.x;if(vT.y>1.)T=-C.y;if(vB.y<0.)B=-C.y;float div=.5*(R-L+T-B);gl_FragColor=vec4(div,0.,0.,1.);}`)!);
    const curlProg = new Prog(bvs, compileShader(gl.FRAGMENT_SHADER, `precision mediump float;precision mediump sampler2D;varying highp vec2 vUv;varying highp vec2 vL;varying highp vec2 vR;varying highp vec2 vT;varying highp vec2 vB;uniform sampler2D uVelocity;void main(){float L=texture2D(uVelocity,vL).y;float R=texture2D(uVelocity,vR).y;float T=texture2D(uVelocity,vT).x;float B=texture2D(uVelocity,vB).x;float v=R-L-T+B;gl_FragColor=vec4(.5*v,0.,0.,1.);}`)!);
    const vortProg = new Prog(bvs, compileShader(gl.FRAGMENT_SHADER, `precision highp float;precision highp sampler2D;varying vec2 vUv;varying vec2 vL;varying vec2 vR;varying vec2 vT;varying vec2 vB;uniform sampler2D uVelocity;uniform sampler2D uCurl;uniform float curl;uniform float dt;void main(){float L=texture2D(uCurl,vL).x;float R=texture2D(uCurl,vR).x;float T=texture2D(uCurl,vT).x;float B=texture2D(uCurl,vB).x;float C=texture2D(uCurl,vUv).x;vec2 force=.5*vec2(abs(T)-abs(B),abs(R)-abs(L));force/=length(force)+.0001;force*=curl*C;force.y*=-1.;vec2 vel=texture2D(uVelocity,vUv).xy;vel+=force*dt;vel=min(max(vel,-1000.),1000.);gl_FragColor=vec4(vel,0.,1.);}`)!);
    const presProg = new Prog(bvs, compileShader(gl.FRAGMENT_SHADER, `precision mediump float;precision mediump sampler2D;varying highp vec2 vUv;varying highp vec2 vL;varying highp vec2 vR;varying highp vec2 vT;varying highp vec2 vB;uniform sampler2D uPressure;uniform sampler2D uDivergence;void main(){float L=texture2D(uPressure,vL).x;float R=texture2D(uPressure,vR).x;float T=texture2D(uPressure,vT).x;float B=texture2D(uPressure,vB).x;float div=texture2D(uDivergence,vUv).x;float p=(L+R+B+T-div)*.25;gl_FragColor=vec4(p,0.,0.,1.);}`)!);
    const gradProg = new Prog(bvs, compileShader(gl.FRAGMENT_SHADER, `precision mediump float;precision mediump sampler2D;varying highp vec2 vUv;varying highp vec2 vL;varying highp vec2 vR;varying highp vec2 vT;varying highp vec2 vB;uniform sampler2D uPressure;uniform sampler2D uVelocity;void main(){float L=texture2D(uPressure,vL).x;float R=texture2D(uPressure,vR).x;float T=texture2D(uPressure,vT).x;float B=texture2D(uPressure,vB).x;vec2 vel=texture2D(uVelocity,vUv).xy;vel.xy-=vec2(R-L,T-B);gl_FragColor=vec4(vel,0.,1.);}`)!);
    const dispMat = new Mat(bvs, `precision highp float;precision highp sampler2D;varying vec2 vUv;varying vec2 vL;varying vec2 vR;varying vec2 vT;varying vec2 vB;uniform sampler2D uTexture;uniform vec2 texelSize;void main(){vec3 c=texture2D(uTexture,vUv).rgb;#ifdef SHADING\nvec3 lc=texture2D(uTexture,vL).rgb;vec3 rc=texture2D(uTexture,vR).rgb;vec3 tc=texture2D(uTexture,vT).rgb;vec3 bc=texture2D(uTexture,vB).rgb;float dx=length(rc)-length(lc);float dy=length(tc)-length(bc);vec3 n=normalize(vec3(dx,dy,length(texelSize)));float d=clamp(dot(n,vec3(0.,0.,1.))+.7,.7,1.);c*=d;\n#endif\nfloat a=max(c.r,max(c.g,c.b));gl_FragColor=vec4(c,a);}`);

    interface FBO { texture: WebGLTexture; fbo: WebGLFramebuffer; width: number; height: number; texelSizeX: number; texelSizeY: number; attach: (id: number) => number; }
    interface DFBO { width: number; height: number; texelSizeX: number; texelSizeY: number; read: FBO; write: FBO; swap: () => void; }

    const buf = gl.createBuffer()!; gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,-1,1,1,1,1,-1]), gl.STATIC_DRAW);
    const ebuf = gl.createBuffer()!; gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebuf);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0,1,2,0,2,3]), gl.STATIC_DRAW);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0); gl.enableVertexAttribArray(0);

    const blit = (target: FBO | null, clear = false) => {
      if (!target) { gl!.viewport(0, 0, gl!.drawingBufferWidth, gl!.drawingBufferHeight); gl!.bindFramebuffer(gl!.FRAMEBUFFER, null); }
      else { gl!.viewport(0, 0, target.width, target.height); gl!.bindFramebuffer(gl!.FRAMEBUFFER, target.fbo); }
      if (clear) { gl!.clearColor(0,0,0,1); gl!.clear(gl!.COLOR_BUFFER_BIT); }
      gl!.drawElements(gl!.TRIANGLES, 6, gl!.UNSIGNED_SHORT, 0);
    };

    function createFBO(w: number, h: number, iF: number, f: number, t: number, p: number): FBO {
      gl!.activeTexture(gl!.TEXTURE0); const tex = gl!.createTexture()!; gl!.bindTexture(gl!.TEXTURE_2D, tex);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, p); gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MAG_FILTER, p);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_S, gl!.CLAMP_TO_EDGE); gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_T, gl!.CLAMP_TO_EDGE);
      gl!.texImage2D(gl!.TEXTURE_2D, 0, iF, w, h, 0, f, t, null);
      const fbo = gl!.createFramebuffer()!; gl!.bindFramebuffer(gl!.FRAMEBUFFER, fbo);
      gl!.framebufferTexture2D(gl!.FRAMEBUFFER, gl!.COLOR_ATTACHMENT0, gl!.TEXTURE_2D, tex, 0);
      gl!.viewport(0, 0, w, h); gl!.clear(gl!.COLOR_BUFFER_BIT);
      return { texture: tex, fbo, width: w, height: h, texelSizeX: 1/w, texelSizeY: 1/h, attach(id: number) { gl!.activeTexture(gl!.TEXTURE0+id); gl!.bindTexture(gl!.TEXTURE_2D, tex); return id; } };
    }
    function createDFBO(w: number, h: number, iF: number, f: number, t: number, p: number): DFBO {
      const a = createFBO(w,h,iF,f,t,p), b = createFBO(w,h,iF,f,t,p);
      return { width: w, height: h, texelSizeX: a.texelSizeX, texelSizeY: a.texelSizeY, read: a, write: b, swap() { const tmp = this.read; this.read = this.write; this.write = tmp; } };
    }
    function resizeFBO(tgt: FBO, w: number, h: number, iF: number, f: number, t: number, p: number) {
      const n = createFBO(w,h,iF,f,t,p); copyProg.bind(); if (copyProg.uniforms.uTexture) gl!.uniform1i(copyProg.uniforms.uTexture, tgt.attach(0)); blit(n); return n;
    }
    function resizeDFBO(tgt: DFBO, w: number, h: number, iF: number, f: number, t: number, p: number) {
      if (tgt.width===w && tgt.height===h) return tgt;
      tgt.read = resizeFBO(tgt.read,w,h,iF,f,t,p); tgt.write = createFBO(w,h,iF,f,t,p);
      tgt.width=w; tgt.height=h; tgt.texelSizeX=1/w; tgt.texelSizeY=1/h; return tgt;
    }

    function getRes(r: number) { const w=gl!.drawingBufferWidth,h=gl!.drawingBufferHeight; const a=w>h?w/h:h/w; const mn=Math.round(r),mx=Math.round(r*a); return w>h?{width:mx,height:mn}:{width:mn,height:mx}; }
    function px(v: number) { return Math.floor(v*(window.devicePixelRatio||1)); }

    let dye: DFBO, velocity: DFBO, divergence: FBO, curlFBO: FBO, pressure: DFBO;

    function initFBOs() {
      const sr=getRes(config.SIM_RESOLUTION), dr=getRes(config.DYE_RESOLUTION);
      gl!.disable(gl!.BLEND);
      if (!dye) dye=createDFBO(dr.width,dr.height,formatRGBA.internalFormat,formatRGBA.format,halfFloatTexType,filtering);
      else dye=resizeDFBO(dye,dr.width,dr.height,formatRGBA.internalFormat,formatRGBA.format,halfFloatTexType,filtering);
      if (!velocity) velocity=createDFBO(sr.width,sr.height,formatRG.internalFormat,formatRG.format,halfFloatTexType,filtering);
      else velocity=resizeDFBO(velocity,sr.width,sr.height,formatRG.internalFormat,formatRG.format,halfFloatTexType,filtering);
      divergence=createFBO(sr.width,sr.height,formatR.internalFormat,formatR.format,halfFloatTexType,gl!.NEAREST);
      curlFBO=createFBO(sr.width,sr.height,formatR.internalFormat,formatR.format,halfFloatTexType,gl!.NEAREST);
      pressure=createDFBO(sr.width,sr.height,formatR.internalFormat,formatR.format,halfFloatTexType,gl!.NEAREST);
    }

    const kw: string[] = []; if (config.SHADING) kw.push('SHADING'); dispMat.setKW(kw);
    initFBOs();

    let lastT=Date.now(), colTimer=0;

    function frame() { const dt=calcDT(); if (resizeCanvas()) initFBOs(); updColors(dt); applyInputs(); step(dt); render(); requestAnimationFrame(frame); }
    function calcDT() { const n=Date.now(); let d=(n-lastT)/1000; d=Math.min(d,.016666); lastT=n; return d; }
    function resizeCanvas() { const w=px(canvas!.clientWidth),h=px(canvas!.clientHeight); if(canvas!.width!==w||canvas!.height!==h){canvas!.width=w;canvas!.height=h;return true;} return false; }
    function updColors(dt: number) { colTimer+=dt*config.COLOR_UPDATE_SPEED; if(colTimer>=1){colTimer%=1;pointers.forEach(p=>{p.color=genColor();});} }
    function applyInputs() { for(const p of pointers){if(p.moved){p.moved=false;splatPointer(p);}} }

    function step(dt: number) {
      gl!.disable(gl!.BLEND);
      curlProg.bind(); gl!.uniform2f(curlProg.uniforms.texelSize!,velocity.texelSizeX,velocity.texelSizeY); gl!.uniform1i(curlProg.uniforms.uVelocity!,velocity.read.attach(0)); blit(curlFBO);
      vortProg.bind(); gl!.uniform2f(vortProg.uniforms.texelSize!,velocity.texelSizeX,velocity.texelSizeY); gl!.uniform1i(vortProg.uniforms.uVelocity!,velocity.read.attach(0)); gl!.uniform1i(vortProg.uniforms.uCurl!,curlFBO.attach(1)); gl!.uniform1f(vortProg.uniforms.curl!,config.CURL); gl!.uniform1f(vortProg.uniforms.dt!,dt); blit(velocity.write); velocity.swap();
      divProg.bind(); gl!.uniform2f(divProg.uniforms.texelSize!,velocity.texelSizeX,velocity.texelSizeY); gl!.uniform1i(divProg.uniforms.uVelocity!,velocity.read.attach(0)); blit(divergence);
      clearProg.bind(); gl!.uniform1i(clearProg.uniforms.uTexture!,pressure.read.attach(0)); gl!.uniform1f(clearProg.uniforms.value!,config.PRESSURE); blit(pressure.write); pressure.swap();
      presProg.bind(); gl!.uniform2f(presProg.uniforms.texelSize!,velocity.texelSizeX,velocity.texelSizeY); gl!.uniform1i(presProg.uniforms.uDivergence!,divergence.attach(0));
      for(let i=0;i<config.PRESSURE_ITERATIONS;i++){gl!.uniform1i(presProg.uniforms.uPressure!,pressure.read.attach(1));blit(pressure.write);pressure.swap();}
      gradProg.bind(); gl!.uniform2f(gradProg.uniforms.texelSize!,velocity.texelSizeX,velocity.texelSizeY); gl!.uniform1i(gradProg.uniforms.uPressure!,pressure.read.attach(0)); gl!.uniform1i(gradProg.uniforms.uVelocity!,velocity.read.attach(1)); blit(velocity.write); velocity.swap();
      advProg.bind(); gl!.uniform2f(advProg.uniforms.texelSize!,velocity.texelSizeX,velocity.texelSizeY);
      if(!supportLinearFiltering&&advProg.uniforms.dyeTexelSize) gl!.uniform2f(advProg.uniforms.dyeTexelSize,velocity.texelSizeX,velocity.texelSizeY);
      const vi=velocity.read.attach(0); gl!.uniform1i(advProg.uniforms.uVelocity!,vi); gl!.uniform1i(advProg.uniforms.uSource!,vi); gl!.uniform1f(advProg.uniforms.dt!,dt); gl!.uniform1f(advProg.uniforms.dissipation!,config.VELOCITY_DISSIPATION); blit(velocity.write); velocity.swap();
      if(!supportLinearFiltering&&advProg.uniforms.dyeTexelSize) gl!.uniform2f(advProg.uniforms.dyeTexelSize,dye.texelSizeX,dye.texelSizeY);
      gl!.uniform1i(advProg.uniforms.uVelocity!,velocity.read.attach(0)); gl!.uniform1i(advProg.uniforms.uSource!,dye.read.attach(1)); gl!.uniform1f(advProg.uniforms.dissipation!,config.DENSITY_DISSIPATION); blit(dye.write); dye.swap();
    }

    function render() { gl!.blendFunc(gl!.ONE,gl!.ONE_MINUS_SRC_ALPHA); gl!.enable(gl!.BLEND); dispMat.bind(); if(config.SHADING&&dispMat.uniforms.texelSize) gl!.uniform2f(dispMat.uniforms.texelSize,1/gl!.drawingBufferWidth,1/gl!.drawingBufferHeight); if(dispMat.uniforms.uTexture) gl!.uniform1i(dispMat.uniforms.uTexture,dye.read.attach(0)); blit(null); }

    function splatPointer(p: Pointer) { splat(p.texcoordX,p.texcoordY,p.deltaX*config.SPLAT_FORCE,p.deltaY*config.SPLAT_FORCE,p.color); }
    function clickSplat(p: Pointer) { const c=genColor(); c.r*=10;c.g*=10;c.b*=10; splat(p.texcoordX,p.texcoordY,10*(Math.random()-.5),30*(Math.random()-.5),c); }

    function splat(x: number,y: number,dx: number,dy: number,c: ColorRGB) {
      splatProg.bind(); gl!.uniform1i(splatProg.uniforms.uTarget!,velocity.read.attach(0));
      gl!.uniform1f(splatProg.uniforms.aspectRatio!,canvas!.width/canvas!.height);
      gl!.uniform2f(splatProg.uniforms.point!,x,y); gl!.uniform3f(splatProg.uniforms.color!,dx,dy,0);
      const ar=canvas!.width/canvas!.height; let r=config.SPLAT_RADIUS/100; if(ar>1)r*=ar;
      gl!.uniform1f(splatProg.uniforms.radius!,r); blit(velocity.write); velocity.swap();
      gl!.uniform1i(splatProg.uniforms.uTarget!,dye.read.attach(0)); gl!.uniform3f(splatProg.uniforms.color!,c.r,c.g,c.b); blit(dye.write); dye.swap();
    }

    // Ink wash palette
    function genColor(): ColorRGB {
      const p = [
        {r:.10,g:.08,b:.05},{r:.15,g:.12,b:.06},{r:.06,g:.10,b:.09},
        {r:.12,g:.10,b:.08},{r:.08,g:.06,b:.04},{r:.14,g:.11,b:.05},
      ];
      return {...p[Math.floor(Math.random()*p.length)]};
    }

    function updDown(p: Pointer,id: number,x: number,y: number) { p.id=id;p.down=true;p.moved=false;p.texcoordX=x/canvas!.width;p.texcoordY=1-y/canvas!.height;p.prevTexcoordX=p.texcoordX;p.prevTexcoordY=p.texcoordY;p.deltaX=0;p.deltaY=0;p.color=genColor(); }
    function updMove(p: Pointer,x: number,y: number,c: ColorRGB) { p.prevTexcoordX=p.texcoordX;p.prevTexcoordY=p.texcoordY;p.texcoordX=x/canvas!.width;p.texcoordY=1-y/canvas!.height;const ar=canvas!.width/canvas!.height;p.deltaX=(p.texcoordX-p.prevTexcoordX)*(ar<1?ar:1);p.deltaY=(p.texcoordY-p.prevTexcoordY)/(ar>1?ar:1);p.moved=Math.abs(p.deltaX)>0||Math.abs(p.deltaY)>0;p.color=c; }

    const onDown = (e: MouseEvent) => { updDown(pointers[0],-1,px(e.clientX),px(e.clientY)); clickSplat(pointers[0]); };
    const firstMove = (e: MouseEvent) => { updMove(pointers[0],px(e.clientX),px(e.clientY),genColor()); frame(); document.body.removeEventListener('mousemove',firstMove); };
    const onMove = (e: MouseEvent) => { updMove(pointers[0],px(e.clientX),px(e.clientY),pointers[0].color); };
    const firstTouch = (e: TouchEvent) => { for(let i=0;i<e.targetTouches.length;i++){updDown(pointers[0],e.targetTouches[i].identifier,px(e.targetTouches[i].clientX),px(e.targetTouches[i].clientY));} frame(); document.body.removeEventListener('touchstart',firstTouch); };
    const onTouchStart = (e: TouchEvent) => { for(let i=0;i<e.targetTouches.length;i++) updDown(pointers[0],e.targetTouches[i].identifier,px(e.targetTouches[i].clientX),px(e.targetTouches[i].clientY)); };
    const onTouchMove = (e: TouchEvent) => { for(let i=0;i<e.targetTouches.length;i++) updMove(pointers[0],px(e.targetTouches[i].clientX),px(e.targetTouches[i].clientY),pointers[0].color); };
    const onTouchEnd = () => { pointers[0].down=false; };

    window.addEventListener('mousedown',onDown); document.body.addEventListener('mousemove',firstMove);
    window.addEventListener('mousemove',onMove); document.body.addEventListener('touchstart',firstTouch);
    window.addEventListener('touchstart',onTouchStart,false); window.addEventListener('touchmove',onTouchMove,false);
    window.addEventListener('touchend',onTouchEnd);

    return () => {
      window.removeEventListener('mousedown',onDown); window.removeEventListener('mousemove',onMove);
      window.removeEventListener('touchstart',onTouchStart); window.removeEventListener('touchmove',onTouchMove);
      window.removeEventListener('touchend',onTouchEnd);
    };
  }, [SIM_RESOLUTION,DYE_RESOLUTION,DENSITY_DISSIPATION,VELOCITY_DISSIPATION,PRESSURE,PRESSURE_ITERATIONS,CURL,SPLAT_RADIUS,SPLAT_FORCE,SHADING,COLOR_UPDATE_SPEED,BACK_COLOR,TRANSPARENT]);

  return (
    <div className="fixed top-0 left-0 z-50 pointer-events-none w-full h-full" style={{mixBlendMode:'screen'}}>
      <canvas ref={canvasRef} className="w-screen h-screen block" />
    </div>
  );
}
