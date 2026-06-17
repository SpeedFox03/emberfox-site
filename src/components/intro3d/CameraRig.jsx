import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { latLonToVector3, BELGIUM, EARTH_BASE_ROTATION_Y } from '../../utils/geo';

const Y_AXIS = new THREE.Vector3(0, 1, 0);

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function remap01(value, start, end) {
  return THREE.MathUtils.clamp((value - start) / (end - start), 0, 1);
}

export default function CameraRig({ radius = 2, progressRef, planetRotationRef }) {
  const { camera } = useThree();

  const belgiumLocal = useMemo(
    () => latLonToVector3(BELGIUM.lat, BELGIUM.lon, radius),
    [radius]
  );

  const REST_DIST = radius * 2.5;
  const END_DIST = radius * 1.3;
  const REST_CAM_X = -radius * 0.82;
  const REST_CAM_Y = 0.75;
  const DIAGONAL_ARC_X = radius * 1.05;
  const DIAGONAL_ARC_Y = radius * 0.28;
  const EARTH_SCREEN_DROP = radius * 0.82;
  const BELGIUM_FOCUS_START = 0.52;
  const BELGIUM_FOCUS_END = 0.8;

  const startPos = useMemo(
    () => new THREE.Vector3(REST_CAM_X, REST_CAM_Y, REST_DIST),
    [REST_CAM_X, REST_CAM_Y, REST_DIST]
  );
  const tmpDir = useRef(new THREE.Vector3());
  const tmpEnd = useRef(new THREE.Vector3());
  const tmpFocus = useRef(new THREE.Vector3());
  const tmpBelgiumFocus = useRef(new THREE.Vector3());

  const sunRef = useRef();
  const camRight = useRef(new THREE.Vector3());
  const camUp = useRef(new THREE.Vector3());

  useFrame(() => {
    const rawProgress = THREE.MathUtils.clamp(progressRef?.current ?? 0, 0, 1);
    const p = easeInOutCubic(remap01(rawProgress, 0.08, 1));
    const diagonalArc = Math.sin(p * Math.PI);

    tmpDir.current
      .copy(belgiumLocal)
      .applyAxisAngle(Y_AXIS, planetRotationRef?.current ?? EARTH_BASE_ROTATION_Y)
      .normalize();
    const belgiumFocus = THREE.MathUtils.smootherstep(
      rawProgress,
      BELGIUM_FOCUS_START,
      BELGIUM_FOCUS_END
    );
    tmpBelgiumFocus.current.copy(tmpDir.current).multiplyScalar(radius * 0.88);
    tmpFocus.current.set(0, EARTH_SCREEN_DROP, 0).lerp(tmpBelgiumFocus.current, belgiumFocus);

    const dist = THREE.MathUtils.lerp(REST_DIST, END_DIST, p);
    tmpEnd.current.copy(tmpDir.current).multiplyScalar(dist);

    camera.position.lerpVectors(startPos, tmpEnd.current, p);
    camera.position.x += diagonalArc * DIAGONAL_ARC_X;
    camera.position.y += diagonalArc * DIAGONAL_ARC_Y;

    camera.lookAt(tmpFocus.current);

    const targetFov = THREE.MathUtils.lerp(45, 41, p);
    if (Math.abs(camera.fov - targetFov) > 0.01) {
      camera.fov = targetFov;
      camera.updateProjectionMatrix();
    }

    if (sunRef.current) {
      camRight.current.set(1, 0, 0).applyQuaternion(camera.quaternion);
      camUp.current.set(0, 1, 0).applyQuaternion(camera.quaternion);
      sunRef.current.position
        .copy(camera.position)
        .addScaledVector(camRight.current, radius * 1.6)
        .addScaledVector(camUp.current, radius * 1.2);
      sunRef.current.target.position.set(0, 0, 0);
      sunRef.current.target.updateMatrixWorld();
    }
  });

  return <directionalLight ref={sunRef} intensity={1.38} color="#fff6e8" />;
}
