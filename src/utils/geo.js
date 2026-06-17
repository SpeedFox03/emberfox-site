import * as THREE from 'three';

// Three.js maps the center of an equirectangular texture to +X on a sphere.
// Rotate the visual globe so longitude 0 faces the camera on +Z at rest.
export const EARTH_BASE_ROTATION_Y = -Math.PI / 2;

/**
 * Convertit une latitude / longitude (en degrés) en coordonnées 3D
 * sur une sphère de rayon `radius`.
 *
 * Le mapping correspond à une texture équirectangulaire classique
 * (earth_day.jpg : longitude 0 au centre de l'image, projetee sur +X
 * avant la rotation visuelle du globe).
 *
 * @param {number} lat    Latitude en degrés  (-90 → 90)
 * @param {number} lon    Longitude en degrés (-180 → 180)
 * @param {number} radius Rayon de la sphère
 * @returns {THREE.Vector3} Point 3D à la surface de la sphère
 */
export function latLonToVector3(lat, lon, radius = 1) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
}

/** Coordonnées de la Belgique (Bruxelles). */
export const BELGIUM = { lat: 50.8503, lon: 4.3517 };
