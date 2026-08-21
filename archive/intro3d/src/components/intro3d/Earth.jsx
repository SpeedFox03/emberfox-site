import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { EARTH_BASE_ROTATION_Y, latLonToVector3 } from '../../utils/geo';
import belgiumBoundaryRaw from './belgium-boundary.geojson?raw';

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');
const V = '?v=4';
const TEX = {
  day: `${BASE}/textures/earth/earth_day.jpg${V}`,
  night: `${BASE}/textures/earth/earth_night.jpg${V}`,
  clouds: `${BASE}/textures/earth/earth_clouds.png${V}`,
};

const DAY_EMISSIVE = new THREE.Color(0xffc88a);
const CLOUD_COLOR = new THREE.Color(0xf2f7ff);
const CLOUDS_BASE_OPACITY = 0.34;
const EARTH_SPIN_SPEED = 0.018;
const DRAG_ROTATION_SPEED = 0.0045;
const DRAG_VELOCITY_DAMPING = 0.92;
const MAX_DRAG_VELOCITY = 0.075;
const BELGIUM_GUIDE_START = 0.04;
const BELGIUM_GUIDE_END = 0.56;
const BELGIUM_DRAG_LOCK_PROGRESS = 0.16;
const BELGIUM_SETTLE_START = 0.52;
const BELGIUM_SETTLE_END = 0.68;
const BELGIUM_GUIDED_DRIFT = 0.035;
const BELGIUM_OUTLINE_COLOR = new THREE.Color(0xff8a2a);
const BELGIUM_OUTLINE_CORE = new THREE.Color(0xffe2bd);

const EARTH_SHADOW_VERTEX = /* glsl */ `
  varying vec3 vViewNormal;

  void main() {
    vViewNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const EARTH_SHADOW_FRAGMENT = /* glsl */ `
  uniform float uOpacity;
  varying vec3 vViewNormal;

  void main() {
    vec3 normal = normalize(vViewNormal);
    float front = smoothstep(-0.08, 0.28, normal.z);
    float lowerLeft = 1.0 - smoothstep(0.08, 1.72, distance(normal.xy, vec2(-0.88, -0.78)));
    float diagonalFalloff = smoothstep(0.02, 0.94, dot(normalize(vec2(-0.78, -0.62)), normal.xy) * 0.5 + 0.5);
    float limb = smoothstep(0.12, 0.95, length(normal.xy));
    float alpha = clamp((lowerLeft * 1.18 + diagonalFalloff * limb * 0.28) * front * uOpacity, 0.0, 0.86);

    gl_FragColor = vec4(vec3(0.0, 0.012, 0.035), alpha);
  }
`;

const BELGIUM_BOUNDARY = JSON.parse(belgiumBoundaryRaw);
const BELGIUM_RINGS = BELGIUM_BOUNDARY.features.flatMap((feature) => {
  const geometry = feature.geometry;
  if (geometry.type === 'Polygon') return geometry.coordinates;
  if (geometry.type === 'MultiPolygon') return geometry.coordinates.flatMap((polygon) => polygon);
  return [];
});

function loadTexture(url, onResult, srgb = true) {
  const loader = new THREE.TextureLoader();
  loader.load(
    url,
    (tex) => {
      tex.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
      tex.anisotropy = 16;
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.generateMipmaps = true;
      onResult(tex);
    },
    undefined,
    () => onResult(null)
  );
}

function stripClosingPoint(ring) {
  const first = ring[0];
  const last = ring[ring.length - 1];
  if (first && last && first[0] === last[0] && first[1] === last[1]) {
    return ring.slice(0, -1);
  }
  return ring;
}

function smooth(value, start, end) {
  return THREE.MathUtils.smootherstep(value, start, end);
}

function shortestAngle(angle) {
  return Math.atan2(Math.sin(angle), Math.cos(angle));
}

function makeBorderGeometry(ring, radius, tubeRadius) {
  const points = stripClosingPoint(ring).map(([lon, lat]) =>
    latLonToVector3(lat, lon, radius * 1.026)
  );
  const curve = new THREE.CurvePath();

  for (let i = 0; i < points.length; i += 1) {
    curve.add(new THREE.LineCurve3(points[i], points[(i + 1) % points.length]));
  }

  return new THREE.TubeGeometry(curve, Math.max(points.length * 2, 180), tubeRadius, 5, true);
}

function BelgiumOutline({ radius, progressRef }) {
  const coreRef = useRef();
  const glowRef = useRef();

  const geometries = useMemo(
    () =>
      BELGIUM_RINGS.map((ring) => ({
        core: makeBorderGeometry(ring, radius, radius * 0.0009),
        glow: makeBorderGeometry(ring, radius, radius * 0.0028),
      })),
    [radius]
  );

  useFrame(({ clock }) => {
    const p = progressRef?.current ?? 0;
    const fadeIn = smooth(p, 0.34, 0.58);
    const fadeOut = 1 - smooth(p, 0.78, 0.94);
    const opacity = fadeIn * fadeOut;
    const pulse = 0.92 + Math.sin(clock.elapsedTime * 4.4) * 0.08;

    if (coreRef.current) {
      coreRef.current.visible = opacity > 0.01;
      coreRef.current.children.forEach((mesh) => {
        mesh.material.opacity = opacity;
      });
    }

    if (glowRef.current) {
      glowRef.current.visible = opacity > 0.01;
      glowRef.current.children.forEach((mesh) => {
        mesh.material.opacity = opacity * 0.22 * pulse;
      });
    }
  });

  return (
    <group>
      <group ref={glowRef}>
        {geometries.map(({ glow }, index) => (
          <mesh key={`glow-${index}`} geometry={glow} renderOrder={4}>
            <meshBasicMaterial
              color={BELGIUM_OUTLINE_COLOR}
              transparent
              opacity={0}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
        ))}
      </group>
      <group ref={coreRef}>
        {geometries.map(({ core }, index) => (
          <mesh key={`core-${index}`} geometry={core} renderOrder={5}>
            <meshBasicMaterial
              color={BELGIUM_OUTLINE_CORE}
              transparent
              opacity={0}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

export default function Earth({ radius = 2, progressRef, rotationRef, lowPerf = false }) {
  const earthRef = useRef();
  const cloudsRef = useRef();
  const shadowMaterialRef = useRef();
  const outlineRootRef = useRef();
  const spinRef = useRef(0);
  const manualSpinRef = useRef(0);
  const guidedOffsetRef = useRef(0);
  const dragVelocityRef = useRef(0);
  const dragRef = useRef({ active: false, lastX: 0, pointerId: null });
  const [maps, setMaps] = useState({ day: null, night: null });
  const [ready, setReady] = useState(false);
  const [clouds, setClouds] = useState(null);

  useEffect(() => {
    if (rotationRef) rotationRef.current = EARTH_BASE_ROTATION_Y;
  }, [rotationRef]);

  useEffect(() => {
    return () => {
      if (typeof document !== 'undefined') document.body.style.cursor = '';
    };
  }, []);

  useEffect(() => {
    let alive = true;
    let pending = 2;
    const result = { day: null, night: null };

    const done = (key) => (tex) => {
      result[key] = tex;
      if (--pending === 0 && alive) {
        setMaps(result);
        setReady(true);
      }
    };

    loadTexture(TEX.day, done('day'));
    loadTexture(TEX.night, done('night'));
    loadTexture(
      TEX.clouds,
      (tex) => {
        if (!alive) return tex && tex.dispose();
        if (tex) setClouds(tex);
      },
      false
    );

    return () => {
      alive = false;
      [result.day, result.night].forEach((tex) => tex && tex.dispose());
      setClouds((tex) => {
        tex && tex.dispose();
        return null;
      });
    };
  }, []);

  const segments = lowPerf ? 48 : 96;

  function stopDragging(event) {
    if (!dragRef.current.active) return;
    event?.stopPropagation();
    try {
      event?.target?.releasePointerCapture?.(dragRef.current.pointerId);
    } catch (e) {
      /* pointer capture already released */
    }
    dragRef.current.active = false;
    dragRef.current.pointerId = null;
    if (typeof document !== 'undefined') document.body.style.cursor = '';
  }

  function handlePointerDown(event) {
    const p = progressRef?.current ?? 0;
    if (p > BELGIUM_DRAG_LOCK_PROGRESS) return;

    event.stopPropagation();
    event.target.setPointerCapture?.(event.pointerId);
    dragRef.current.active = true;
    dragRef.current.lastX = event.clientX;
    dragRef.current.pointerId = event.pointerId;
    dragVelocityRef.current = 0;

    if (typeof document !== 'undefined') document.body.style.cursor = 'grabbing';
  }

  function handlePointerMove(event) {
    if (!dragRef.current.active) return;

    event.stopPropagation();
    const dx = event.clientX - dragRef.current.lastX;
    if (dx === 0) return;

    const rotationDelta = THREE.MathUtils.clamp(
      dx * DRAG_ROTATION_SPEED,
      -MAX_DRAG_VELOCITY,
      MAX_DRAG_VELOCITY
    );

    manualSpinRef.current += rotationDelta;
    dragVelocityRef.current = rotationDelta;
    dragRef.current.lastX = event.clientX;
  }

  useFrame(({ clock }, delta) => {
    const p = progressRef?.current ?? 0;
    const guide = smooth(p, BELGIUM_GUIDE_START, BELGIUM_GUIDE_END);
    const settle = smooth(p, BELGIUM_SETTLE_START, BELGIUM_SETTLE_END);

    if (!dragRef.current.active) {
      const spin = delta * EARTH_SPIN_SPEED * (1 - Math.min(p * 1.4, 1));
      spinRef.current += spin;

      if (Math.abs(dragVelocityRef.current) > 0.0001) {
        manualSpinRef.current += dragVelocityRef.current;
        dragVelocityRef.current *= DRAG_VELOCITY_DAMPING;
      } else {
        dragVelocityRef.current = 0;
      }
    }

    const freeOffset = shortestAngle(spinRef.current + manualSpinRef.current);
    const guidedDrift =
      Math.sin(clock.elapsedTime * 0.62) *
      BELGIUM_GUIDED_DRIFT *
      guide *
      (1 - settle);
    const targetOffset = freeOffset * (1 - guide) + guidedDrift;

    if (dragRef.current.active) {
      guidedOffsetRef.current = targetOffset;
    } else {
      const dampedOffset = THREE.MathUtils.damp(
        guidedOffsetRef.current,
        targetOffset,
        THREE.MathUtils.lerp(5.5, 18, guide),
        delta
      );
      guidedOffsetRef.current = THREE.MathUtils.lerp(dampedOffset, targetOffset, settle);
    }

    const earthRotation = EARTH_BASE_ROTATION_Y + guidedOffsetRef.current;
    if (rotationRef) rotationRef.current = earthRotation;
    if (earthRef.current) earthRef.current.rotation.y = earthRotation;
    if (outlineRootRef.current) outlineRootRef.current.rotation.y = earthRotation;

    if (shadowMaterialRef.current) {
      shadowMaterialRef.current.uniforms.uOpacity.value =
        THREE.MathUtils.lerp(0.9, 0.72, p) * (1 - smooth(p, 0.9, 0.98) * 0.25);
    }

    if (cloudsRef.current) {
      cloudsRef.current.rotation.y =
        EARTH_BASE_ROTATION_Y + guidedOffsetRef.current + spinRef.current * 0.08 * (1 - guide);
      const mat = cloudsRef.current.material;
      if (mat) {
        const fade = 1 - THREE.MathUtils.smoothstep(p, 0.4, 0.78);
        mat.opacity = CLOUDS_BASE_OPACITY * fade;
      }
    }
  });

  const hasDay = ready && maps.day;

  return (
    <group
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={stopDragging}
      onPointerCancel={stopDragging}
      onLostPointerCapture={stopDragging}
    >
      <mesh ref={earthRef} rotation={[0, EARTH_BASE_ROTATION_Y, 0]}>
        <sphereGeometry args={[radius, segments, segments]} />
        {hasDay ? (
          <meshLambertMaterial
            map={maps.day}
            emissiveMap={maps.night || undefined}
            emissive={maps.night ? DAY_EMISSIVE : new THREE.Color(0x000000)}
            emissiveIntensity={maps.night ? 0.12 : 0}
          />
        ) : (
          <meshStandardMaterial
            color={0x1b66a8}
            emissive={0x06243d}
            emissiveIntensity={0.4}
            roughness={0.8}
            metalness={0.1}
          />
        )}
      </mesh>

      {clouds && (
        <mesh ref={cloudsRef} scale={1.006} rotation={[0, EARTH_BASE_ROTATION_Y, 0]}>
          <sphereGeometry args={[radius, segments, segments]} />
          <meshLambertMaterial
            color={CLOUD_COLOR}
            map={clouds}
            alphaMap={clouds}
            transparent
            opacity={CLOUDS_BASE_OPACITY}
            alphaTest={0.035}
            depthWrite={false}
          />
        </mesh>
      )}

      {hasDay && (
        <mesh scale={1.009} renderOrder={3}>
          <sphereGeometry args={[radius, segments, segments]} />
          <shaderMaterial
            ref={shadowMaterialRef}
            uniforms={{
              uOpacity: { value: 0.9 },
            }}
            vertexShader={EARTH_SHADOW_VERTEX}
            fragmentShader={EARTH_SHADOW_FRAGMENT}
            transparent
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      )}

      <group ref={outlineRootRef} rotation={[0, EARTH_BASE_ROTATION_Y, 0]}>
        <BelgiumOutline radius={radius} progressRef={progressRef} />
      </group>
    </group>
  );
}
