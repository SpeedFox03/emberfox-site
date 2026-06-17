import { useMemo } from 'react';
import * as THREE from 'three';
import { BackSide } from 'three';

/**
 * Halo atmosphérique : sphère légèrement plus grande que la Terre,
 * rendue par l'arrière (BackSide) avec un effet de Fresnel additif.
 */
export default function Atmosphere({ radius = 2, color = '#3a8fff' }) {
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color(color) },
        uIntensity: { value: 0.72 },
      },
      vertexShader: /* glsl */ `
        varying vec3 vNormal;
        varying vec3 vView;
        void main() {
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vNormal = normalize(normalMatrix * normal);
          vView = normalize(-mvPosition.xyz);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor;
        uniform float uIntensity;
        varying vec3 vNormal;
        varying vec3 vView;
        void main() {
          float fresnel = pow(1.0 - abs(dot(vNormal, vView)), 3.15);
          gl_FragColor = vec4(uColor, fresnel * uIntensity);
        }
      `,
      transparent: true,
      side: BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }, [color]);

  return (
    <mesh scale={1.013} material={material}>
      <sphereGeometry args={[radius, 64, 64]} />
    </mesh>
  );
}
