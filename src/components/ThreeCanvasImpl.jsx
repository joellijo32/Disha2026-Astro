import React, { useEffect, useRef, useState } from 'react';
import { Renderer, Program, Mesh, Triangle, RenderTarget } from 'ogl';

const vertexShader = `#version 300 es
in vec2 position;
in vec2 uv;
out vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const WAVE_FRAGMENT_BASE = `#version 300 es
precision highp float;
out vec4 fragColor;

uniform vec2  resolution;
uniform float time;
uniform float waveSpeed;
uniform float waveFrequency;
uniform float waveAmplitude;
uniform vec3  waveColor;
uniform vec2  mousePos;
uniform float enableMouseInteraction;
uniform float mouseRadius;

vec4 mod289(vec4 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
vec2 fade(vec2 t) { return t*t*t*(t*(t*6.0-15.0)+10.0); }

float cnoise(vec2 P) {
  vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
  vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
  Pi = mod289(Pi);
  vec4 ix = Pi.xzxz, iy = Pi.yyww;
  vec4 fx = Pf.xzxz, fy = Pf.yyww;
  vec4 i   = permute(permute(ix) + iy);
  vec4 gx  = fract(i * (1.0/41.0)) * 2.0 - 1.0;
  vec4 gy  = abs(gx) - 0.5;
  vec4 tx  = floor(gx + 0.5);
  gx -= tx;
  vec2 g00 = vec2(gx.x, gy.x), g10 = vec2(gx.y, gy.y);
  vec2 g01 = vec2(gx.z, gy.z), g11 = vec2(gx.w, gy.w);
  vec4 norm = taylorInvSqrt(vec4(
    dot(g00,g00), dot(g01,g01), dot(g10,g10), dot(g11,g11)));
  g00 *= norm.x; g01 *= norm.y; g10 *= norm.z; g11 *= norm.w;
  float n00 = dot(g00, vec2(fx.x, fy.x));
  float n10 = dot(g10, vec2(fx.y, fy.y));
  float n01 = dot(g01, vec2(fx.z, fy.z));
  float n11 = dot(g11, vec2(fx.w, fy.w));
  vec2 fade_xy = fade(Pf.xy);
  vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
  return 2.3 * mix(n_x.x, n_x.y, fade_xy.y);
}

const int OCTAVES = __OCTAVES__;
float fbm(vec2 p) {
  float value = 0.0;
  float amp   = 1.0;
  float freq  = waveFrequency;
  for (int i = 0; i < OCTAVES; i++) {
    value += amp * abs(cnoise(p));
    p     *= freq;
    amp   *= waveAmplitude;
  }
  return value;
}

float pattern(vec2 p) {
  vec2 p2 = p - time * waveSpeed;
  return fbm(p + fbm(p2));
}

void main() {
  vec2 uv = gl_FragCoord.xy / resolution;
  uv -= 0.5;
  uv.x *= resolution.x / resolution.y;

  float dim = 0.0;
  if (enableMouseInteraction > 0.5) {
    vec2 mouseNDC = (mousePos / resolution - 0.5) * vec2(1.0, -1.0);
    mouseNDC.x  *= resolution.x / resolution.y;
    vec2 dir     = uv - mouseNDC;
    float dist   = length(dir);
    float effect = 1.0 - smoothstep(0.0, mouseRadius, dist);
    uv  += normalize(dir + vec2(0.0001)) * effect * 0.15;
    dim  = effect * 0.25;
  }

  float f = clamp(pattern(uv) - dim, 0.0, 1.0);
  vec3 col = mix(vec3(0.0), waveColor, f);
  fragColor = vec4(col, 1.0);
}
`;

const ditherFragmentShader = `#version 300 es
precision highp float;
in  vec2 vUv;
out vec4 fragColor;

uniform sampler2D tDiffuse;
uniform float     colorNum;
uniform float     pixelSize;
uniform vec2      resolution;

const float bayerMatrix8x8[64] = float[64](
   0.0/64.0, 48.0/64.0, 12.0/64.0, 60.0/64.0,  3.0/64.0, 51.0/64.0, 15.0/64.0, 63.0/64.0,
  32.0/64.0, 16.0/64.0, 44.0/64.0, 28.0/64.0, 35.0/64.0, 19.0/64.0, 47.0/64.0, 31.0/64.0,
   8.0/64.0, 56.0/64.0,  4.0/64.0, 52.0/64.0, 11.0/64.0, 59.0/64.0,  7.0/64.0, 55.0/64.0,
  40.0/64.0, 24.0/64.0, 36.0/64.0, 20.0/64.0, 43.0/64.0, 27.0/64.0, 39.0/64.0, 23.0/64.0,
   2.0/64.0, 50.0/64.0, 14.0/64.0, 62.0/64.0,  1.0/64.0, 49.0/64.0, 13.0/64.0, 61.0/64.0,
  34.0/64.0, 18.0/64.0, 46.0/64.0, 30.0/64.0, 33.0/64.0, 17.0/64.0, 45.0/64.0, 29.0/64.0,
  10.0/64.0, 58.0/64.0,  6.0/64.0, 54.0/64.0,  9.0/64.0, 57.0/64.0,  5.0/64.0, 53.0/64.0,
  42.0/64.0, 26.0/64.0, 38.0/64.0, 22.0/64.0, 41.0/64.0, 25.0/64.0, 37.0/64.0, 21.0/64.0
);

void main() {
  vec2 normalizedPixelSize = pixelSize / resolution;
  vec2 uvPixel = normalizedPixelSize * floor(vUv / normalizedPixelSize);
  vec4 color   = texture(tDiffuse, uvPixel);
  vec3 source  = color.rgb;

  vec2  scaledCoord = floor(vUv * resolution / pixelSize);
  int   x           = int(mod(scaledCoord.x, 8.0));
  int   y           = int(mod(scaledCoord.y, 8.0));
  float threshold   = bayerMatrix8x8[y * 8 + x] - 0.5;

  float denom     = max(colorNum - 1.0, 1.0);
  float stepSize  = 1.0 / denom;
  color.rgb      += threshold * stepSize;
  color.rgb       = clamp(color.rgb, 0.0, 1.0);
  color.rgb       = floor(color.rgb * denom + 0.5) / denom;
  color.rgb       = min(color.rgb, source);

  fragColor = color;
}
`;

function getIsMobile() {
  return typeof window !== 'undefined' && window.innerWidth <= 768;
}

export default function DitherCanvas({
  waveSpeed = 0.05,
  waveFrequency = 3,
  waveAmplitude = 0.3,
  waveColor = [0.5, 0.5, 0.5],
  colorNum = 4,
  pixelSize = 1,
  disableAnimation = false,
  enableMouseInteraction = true,
  mouseRadius = 1,
}) {
  const containerRef  = useRef(null);
  const requestRef    = useRef();
  const visibilityRef = useRef({ isVisible: true, pageFrozen: false });
  const [isMobile, setIsMobile] = useState(getIsMobile);

  useEffect(() => {
    const handler = () => setIsMobile(getIsMobile());
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { visibilityRef.current.isVisible = entry.isIntersecting; },
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handler = (e) => { visibilityRef.current.pageFrozen = e.detail.frozen; };
    window.addEventListener('freeze-page-animations', handler);
    return () => window.removeEventListener('freeze-page-animations', handler);
  }, []);

  const effectivePixelSize = isMobile ? 2 : pixelSize;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const octaves            = isMobile ? '2' : '3';
    const waveFragmentShader = WAVE_FRAGMENT_BASE.replace('__OCTAVES__', octaves);
    const activeMouse        = enableMouseInteraction && !isMobile;

    const renderer = new Renderer({
      antialias:       false,
      alpha:           true,
      webgl:           2,
      dpr:             Math.min(window.devicePixelRatio, 2),
      powerPreference: 'high-performance',
    });
    const gl  = renderer.gl;
    const dpr = renderer.dpr;

    const target = new RenderTarget(gl, { width: 1, height: 1 });

    const waveProgram = new Program(gl, {
      vertex:   vertexShader,
      fragment: waveFragmentShader,
      uniforms: {
        time:                   { value: 0 },
        resolution:             { value: [1, 1] },
        waveSpeed:              { value: waveSpeed },
        waveFrequency:          { value: waveFrequency },
        waveAmplitude:          { value: waveAmplitude },
        waveColor:              { value: new Float32Array(waveColor) },
        mousePos:               { value: [-9999, -9999] },
        enableMouseInteraction: { value: activeMouse ? 1.0 : 0.0 },
        mouseRadius:            { value: mouseRadius },
      },
    });
    const waveMesh = new Mesh(gl, {
      geometry: new Triangle(gl),
      program:  waveProgram,
    });

    const ditherProgram = new Program(gl, {
      vertex:   vertexShader,
      fragment: ditherFragmentShader,
      uniforms: {
        tDiffuse:   { value: target.texture },
        colorNum:   { value: colorNum },
        pixelSize:  { value: effectivePixelSize },
        resolution: { value: [1, 1] },
      },
    });
    const ditherMesh = new Mesh(gl, {
      geometry: new Triangle(gl),
      program:  ditherProgram,
    });

    const resize = () => {
      const w = container.offsetWidth;
      const h = container.offsetHeight;
      if (!w || !h) return;

      renderer.setSize(w, h);

      const pw = Math.floor(w * dpr);
      const ph = Math.floor(h * dpr);
      target.setSize(pw, ph);

      ditherProgram.uniforms.tDiffuse.value = target.texture;

      const res = [pw, ph];
      waveProgram.uniforms.resolution.value   = res;
      ditherProgram.uniforms.resolution.value = res;
    };

    const ro = new ResizeObserver(resize);
    ro.observe(container);
    container.appendChild(gl.canvas);
    resize();

    const animState = {
      time:        0,
      lastTime:    0,
      mouse:       [-9999, -9999],
      targetMouse: [-9999, -9999],
    };

    const handlePointer = (e) => {
      const rect = gl.canvas.getBoundingClientRect();
      animState.targetMouse = [
        (e.clientX - rect.left) * dpr,
        (e.clientY - rect.top)  * dpr,
      ];
    };
    if (activeMouse) {
      window.addEventListener('pointermove', handlePointer);
      window.addEventListener('pointerdown', handlePointer);
    }

    let prevColor = [...waveColor];

    const update = (t) => {
      requestRef.current = requestAnimationFrame(update);
      const { isVisible, pageFrozen } = visibilityRef.current;
      if (disableAnimation || !isVisible || pageFrozen) return;

      if (!animState.lastTime) animState.lastTime = t;
      const delta = Math.min((t - animState.lastTime) / 1000, 0.05);
      animState.lastTime = t;
      animState.time    += delta;

      const u = waveProgram.uniforms;
      u.time.value = animState.time;

      if (u.waveSpeed.value     !== waveSpeed)     u.waveSpeed.value     = waveSpeed;
      if (u.waveFrequency.value !== waveFrequency) u.waveFrequency.value = waveFrequency;
      if (u.waveAmplitude.value !== waveAmplitude) u.waveAmplitude.value = waveAmplitude;

      if (!prevColor.every((v, i) => v === waveColor[i])) {
        u.waveColor.value = new Float32Array(waveColor);
        prevColor         = [...waveColor];
      }

      u.enableMouseInteraction.value = activeMouse ? 1.0 : 0.0;
      u.mouseRadius.value            = mouseRadius;

      if (activeMouse) {
        const [tx, ty] = animState.targetMouse;
        const m        = animState.mouse;
        m[0] += (tx - m[0]) * 0.1;
        m[1] += (ty - m[1]) * 0.1;
        u.mousePos.value = [...m];
      }

      renderer.render({ scene: waveMesh,   target });
      renderer.render({ scene: ditherMesh });
    };

    requestRef.current = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(requestRef.current);
      if (activeMouse) {
        window.removeEventListener('pointermove', handlePointer);
        window.removeEventListener('pointerdown', handlePointer);
      }
      ro.disconnect();
      if (gl.canvas.parentElement) container.removeChild(gl.canvas);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, [
    waveSpeed, waveFrequency, waveAmplitude,
    colorNum, effectivePixelSize,
    disableAnimation, enableMouseInteraction, mouseRadius,
    isMobile,
  ]);

  return <div ref={containerRef} className="w-full h-full relative" />;
}
