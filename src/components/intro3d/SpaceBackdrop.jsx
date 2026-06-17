import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';

const BACKDROP_DRAG_SPEED = 0.0025;
const BACKDROP_DAMPING = 0.94;
const MAX_BACKDROP_VELOCITY = 0.035;

export default function SpaceBackdrop({ lowPerf = false, progressRef }) {
  const groupRef = useRef();
  const dragRef = useRef({ active: false, lastX: 0, pointerId: null });
  const manualRotationRef = useRef(0);
  const velocityRef = useRef(0);

  useEffect(() => {
    return () => {
      if (typeof document !== 'undefined') document.body.style.cursor = '';
    };
  }, []);

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
    if (p > 0.72) return;

    event.stopPropagation();
    event.target.setPointerCapture?.(event.pointerId);
    dragRef.current.active = true;
    dragRef.current.lastX = event.clientX;
    dragRef.current.pointerId = event.pointerId;
    velocityRef.current = 0;

    if (typeof document !== 'undefined') document.body.style.cursor = 'grabbing';
  }

  function handlePointerMove(event) {
    if (!dragRef.current.active) return;

    event.stopPropagation();
    const dx = event.clientX - dragRef.current.lastX;
    if (dx === 0) return;

    const rotationDelta = THREE.MathUtils.clamp(
      dx * BACKDROP_DRAG_SPEED,
      -MAX_BACKDROP_VELOCITY,
      MAX_BACKDROP_VELOCITY
    );

    manualRotationRef.current += rotationDelta;
    velocityRef.current = rotationDelta;
    dragRef.current.lastX = event.clientX;
  }

  useFrame(({ clock }, delta) => {
    const p = progressRef?.current ?? 0;
    const drift = 1 - Math.min(p * 1.2, 1);

    if (!dragRef.current.active) {
      manualRotationRef.current += delta * 0.012 * drift;

      if (Math.abs(velocityRef.current) > 0.0001) {
        manualRotationRef.current += velocityRef.current;
        velocityRef.current *= BACKDROP_DAMPING;
      } else {
        velocityRef.current = 0;
      }
    }

    if (groupRef.current) {
      groupRef.current.rotation.y = manualRotationRef.current;
      groupRef.current.rotation.x = Math.sin(clock.elapsedTime * 0.12) * 0.018 * drift;
      groupRef.current.rotation.z = Math.sin(clock.elapsedTime * 0.08) * 0.01 * drift;
    }
  });

  return (
    <group
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={stopDragging}
      onPointerCancel={stopDragging}
      onLostPointerCapture={stopDragging}
    >
      <mesh position={[0, 0, -16]}>
        <planeGeometry args={[80, 45]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      <group ref={groupRef}>
        <Stars
          radius={120}
          depth={60}
          count={lowPerf ? 1500 : 4500}
          factor={4}
          saturation={0}
          fade
          speed={0.6}
        />
      </group>
    </group>
  );
}
