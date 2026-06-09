/* eslint-disable react/no-unknown-property */
import React, { useEffect, useRef, useState, forwardRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { wrapEffect } from '@react-three/postprocessing';
import { Effect } from 'postprocessing';
import * as THREE from 'three';

const _origConsoleWarn = console.warn.bind(console);
console.warn = (msg, ...args) => {
  if (msg && typeof msg === 'string' && msg.includes('THREE.Clock') && msg.includes('deprecated')) return;
  _origConsoleWarn(msg, ...args);
};

const waveVertexShader = `
precision highp float;
varying vec2 vUv;
void main() {
  vUv = uv;
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  gl_Position = projectionMatrix * viewPosition;
}
`;

const waveFragmentShader = `
precision highp float;
uniform vec2 resolution;
uniform float time;
uniform float waveSpeed;
uniform float waveFrequency;
uniform float waveAmplitude;
uniform vec3 waveColor;
uniform vec2 mousePos;
uniform float enableMouseInteraction;
uniform float mouseRadius;

vec4 mod289(vec4 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
vec2 fade(vec2 t) { return t*t*t*(t*(t*6.0-15.0)+10.0); }

float cnoise(vec2 P) {
  vec4 Pi = floor(P.xyxy) + vec4(0.0,0.0,1.0,1.0);
  vec4 Pf = fract(P.xyxy) - vec4(0.0,0.0,1.0,1.0);
  Pi = mod289(Pi);
  vec4 ix = Pi.xzxz;
  vec4 iy = Pi.yyww;
  vec4 fx = Pf.xzxz;
  vec4 fy = Pf.yyww;
  vec4 i = permute(permute(ix) + iy);
  vec4 gx = fract(i * (1.0/41.0)) * 2.0 - 1.0;
  vec4 gy = abs(gx) - 0.5;
  vec4 tx = floor(gx + 0.5);
  gx = gx - tx;
  vec2 g00 = vec2(gx.x, gy.x);
  vec2 g10 = vec2(gx.y, gy.y);
  vec2 g01 = vec2(gx.z, gy.z);
  vec2 g11 = vec2(gx.w, gy.w);
  vec4 norm = taylorInvSqrt(vec4(dot(g00,g00), dot(g01,g01), dot(g10,g10), dot(g11,g11)));
  g00 *= norm.x; g01 *= norm.y; g10 *= norm.z; g11 *= norm.w;
  float n00 = dot(g00, vec2(fx.x, fy.x));
  float n10 = dot(g10, vec2(fx.y, fy.y));
  float n01 = dot(g01, vec2(fx.z, fy.z));
  float n11 = dot(g11, vec2(fx.w, fy.w));
  vec2 fade_xy = fade(Pf.xy);
  vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
  return 2.3 * mix(n_x.x, n_x.y, fade_xy.y);
}

const int OCTAVES = 3;
float fbm(vec2 p) {
  float value = 0.0;
  float amp = 1.0;
  float freq = waveFrequency;
  for (int i = 0; i < OCTAVES; i++) {
    value += amp * abs(cnoise(p));
    p *= freq;
    amp *= waveAmplitude;
  }
  return value;
}

float pattern(vec2 p) {
  vec2 p2 = p - time * waveSpeed;
  return fbm(p + fbm(p2));
}

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  uv -= 0.5;
  uv.x *= resolution.x / resolution.y;

  float dim = 0.0;

  if (enableMouseInteraction > 0.5) {
    vec2 mouseNDC = (mousePos / resolution - 0.5) * vec2(1.0, -1.0);
    mouseNDC.x *= resolution.x / resolution.y;

    vec2 dir = uv - mouseNDC;
    float dist = length(dir);
    float effect = 1.0 - smoothstep(0.0, mouseRadius, dist);

    uv += normalize(dir + vec2(0.0001)) * effect * 0.15;
    dim = effect * 0.25;
  }

  float f = pattern(uv) - dim;
  vec3 col = mix(vec3(0.0), waveColor, f);
  gl_FragColor = vec4(col, 1.0);
}
`;

const ditherFragmentShader = `
precision highp float;
uniform float colorNum;
uniform float pixelSize;

float interleavedGradientNoise(vec2 n) {
  float f = 0.06711056 * n.x + 0.00583715 * n.y;
  return fract(52.9829189 * fract(f));
}

void mainImage(in vec4 inputColor, in vec2 uv, out vec4 outputColor) {
  vec2 normalizedPixelSize = pixelSize / resolution;
  vec2 uvPixel = normalizedPixelSize * floor(uv / normalizedPixelSize);
  vec4 color = texture2D(inputBuffer, uvPixel);

  vec2 scaledCoord = floor(uv * resolution / pixelSize);
  float threshold = interleavedGradientNoise(scaledCoord) - 0.25;

  float denom = max(colorNum - 1.0, 1.0);
  float step = 1.0 / denom;
  color.rgb += threshold * step;
  float bias = 0.2;
  color.rgb = clamp(color.rgb - bias, 0.0, 1.0);
  color.rgb = floor(color.rgb * denom + 0.5) / denom;

  outputColor = color;
}
`;

class RetroEffectImpl extends Effect {
  constructor() {
    const uniforms = new Map([
      ['colorNum', new THREE.Uniform(4.0)],
      ['pixelSize', new THREE.Uniform(2.0)]
    ]);
    super('RetroEffect', ditherFragmentShader, { uniforms });
    this.uniforms = uniforms;
  }
  set colorNum(v) {
    this.uniforms.get('colorNum').value = v;
  }
  get colorNum() {
    return this.uniforms.get('colorNum').value;
  }
  set pixelSize(v) {
    this.uniforms.get('pixelSize').value = v;
  }
  get pixelSize() {
    return this.uniforms.get('pixelSize').value;
  }
}

const WrappedRetro = wrapEffect(RetroEffectImpl);

const RetroEffect = forwardRef((props, ref) => {
  const { colorNum, pixelSize } = props;
  return <WrappedRetro ref={ref} colorNum={colorNum} pixelSize={pixelSize} />;
});
RetroEffect.displayName = 'RetroEffect';

function DitheredWaves({
  waveSpeed,
  waveFrequency,
  waveAmplitude,
  waveColor,
  colorNum,
  pixelSize,
  disableAnimation,
  enableMouseInteraction,
  mouseRadius
}) {
  const mesh = useRef(null);
  const prevColor = useRef([...waveColor]);

  const targetMouse = useRef(new THREE.Vector2(-1000, -1000));
  const smoothMouse = useRef(new THREE.Vector2(-1000, -1000));

  const { viewport, size, gl } = useThree();

  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
  const activeMouseInteraction = enableMouseInteraction && !isMobile;

  const waveUniformsRef = useRef({
    time: { value: 0 },
    resolution: { value: new THREE.Vector2(0, 0) },
    waveSpeed: { value: waveSpeed },
    waveFrequency: { value: waveFrequency },
    waveAmplitude: { value: waveAmplitude },
    waveColor: { value: new THREE.Color(...waveColor) },
    mousePos: { value: new THREE.Vector2(-1000, -1000) },
    enableMouseInteraction: { value: activeMouseInteraction ? 1.0 : 0.0 },
    mouseRadius: { value: mouseRadius }
  });

  useEffect(() => {
    if (!activeMouseInteraction) return;

    const handlePointer = (e) => {
      const dpr = gl.getPixelRatio();
      targetMouse.current.set(e.clientX * dpr, e.clientY * dpr);
    };

    window.addEventListener('pointermove', handlePointer);
    window.addEventListener('pointerdown', handlePointer);

    return () => {
      window.removeEventListener('pointermove', handlePointer);
      window.removeEventListener('pointerdown', handlePointer);
    };
  }, [activeMouseInteraction, gl]);

  useEffect(() => {
    if (!mesh.current) return;
    const dpr = gl.getPixelRatio();
    const w = Math.floor(size.width * dpr),
      h = Math.floor(size.height * dpr);
    const res = mesh.current.material.uniforms.resolution.value;
    if (res.x !== w || res.y !== h) {
      res.set(w, h);
    }
  }, [size, gl]);

  const processedFragmentShader = React.useMemo(() => {
    return waveFragmentShader.replace(
      'const int OCTAVES = 3;',
      `const int OCTAVES = ${isMobile ? '2' : '3'};`
    );
  }, [isMobile]);

  useFrame((state, delta) => {
    if (!mesh.current) return;
    const u = mesh.current.material.uniforms;

    if (!disableAnimation) {
      u.time.value += delta;
    }

    if (u.waveSpeed.value !== waveSpeed) u.waveSpeed.value = waveSpeed;
    if (u.waveFrequency.value !== waveFrequency) u.waveFrequency.value = waveFrequency;
    if (u.waveAmplitude.value !== waveAmplitude) u.waveAmplitude.value = waveAmplitude;

    if (!prevColor.current.every((v, i) => v === waveColor[i])) {
      u.waveColor.value.set(...waveColor);
      prevColor.current = [...waveColor];
    }

    u.enableMouseInteraction.value = activeMouseInteraction ? 1.0 : 0.0;
    u.mouseRadius.value = mouseRadius;

    if (activeMouseInteraction) {
      smoothMouse.current.lerp(targetMouse.current, 0.1);
      u.mousePos.value.copy(smoothMouse.current);
    }
  });

  return (
    <>
      <mesh ref={mesh} scale={[viewport.width, viewport.height, 1]}>
        <planeGeometry args={[1, 1]} />
        <shaderMaterial
          vertexShader={waveVertexShader}
          fragmentShader={processedFragmentShader}
          uniforms={waveUniformsRef.current}
        />
      </mesh>
    </>
  );
}

function DitherCanvas({
  waveSpeed = 0.05,
  waveFrequency = 3,
  waveAmplitude = 0.3,
  waveColor = [0.5, 0.5, 0.5],
  colorNum = 4,
  pixelSize = 2,
  disableAnimation = false,
  enableMouseInteraction = true,
  mouseRadius = 1
}) {
  const containerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(true);
  const [pageFrozen, setPageFrozen] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handler = (e) => setPageFrozen(e.detail.frozen)
    window.addEventListener("freeze-page-animations", handler)
    return () => window.removeEventListener("freeze-page-animations", handler)
  }, [])

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <Canvas
        className="w-full h-full"
        camera={{ position: [0, 0, 6] }}
        dpr={1}
        gl={{
          powerPreference: "high-performance",
          antialias: false,
          failIfMajorPerformanceCaveat: false
        }}
      >
        <DitheredWaves
          waveSpeed={waveSpeed}
          waveFrequency={waveFrequency}
          waveAmplitude={waveAmplitude}
          waveColor={waveColor}
          colorNum={colorNum}
          pixelSize={pixelSize}
          disableAnimation={disableAnimation || !isVisible || pageFrozen}
          enableMouseInteraction={enableMouseInteraction && isVisible}
          mouseRadius={mouseRadius}
        />
      </Canvas>
    </div>
  );
}

export default DitherCanvas;
