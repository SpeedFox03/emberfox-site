import { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import Earth from './Earth';
import Atmosphere from './Atmosphere';
import CameraRig from './CameraRig';
import IntroOverlay from './IntroOverlay';
import SpaceBackdrop from './SpaceBackdrop';
import { useSmoothScroll } from './SmoothScroll';
import { EARTH_BASE_ROTATION_Y } from '../../utils/geo';
import './intro3d.css';

gsap.registerPlugin(ScrollTrigger);

const RADIUS = 2;
const SESSION_KEY = 'ef-intro-seen';

function smoothstep(edge0, edge1, x) {
  const t = Math.min(Math.max((x - edge0) / (edge1 - edge0), 0), 1);
  return t * t * (3 - 2 * t);
}

/** Mode test : ?intro=replay → on peut remonter le scroll pour rejouer l'intro. */
function isReplayMode() {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get('intro') === 'replay';
}

/** Décide si l'intro doit s'afficher (1ère visite de session, pas reduced-motion…). */
function shouldShowIntro() {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  if (params.get('intro') === '0') return false; // désactivation manuelle
  if (params.get('intro') === 'replay') return true; // mode test : toujours affichée
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  if (window.sessionStorage.getItem(SESSION_KEY) === '1') return false;
  return true;
}

/**
 * Intro 3D plein écran (Terre + dive vers la Belgique au scroll).
 * Rendu comme une couche par-dessus le site existant ; ne le réécrit pas.
 *
 * @param {number} scrollVh  Hauteur de scroll dédiée à l'intro (défaut 300vh).
 */
export default function Intro3D({ scrollVh = 300 }) {
  const [active, setActive] = useState(shouldShowIntro);
  const replay = isReplayMode();
  const lowPerf =
    typeof window !== 'undefined' &&
    window.matchMedia('(max-width: 768px)').matches;

  // Smooth scroll uniquement pendant l'intro (se désactive au démontage).
  useSmoothScroll(active && !lowPerf);

  const fixedRef = useRef(null);
  const overlayRef = useRef(null);
  const spacerRef = useRef(null);
  const progressRef = useRef(0);
  const planetRotationRef = useRef(EARTH_BASE_ROTATION_Y);
  const stRef = useRef(null);
  const finishedRef = useRef(false);

  function finish() {
    if (replay) return; // mode test : on ne termine jamais (replay au scroll up)
    if (finishedRef.current) return;
    finishedRef.current = true;
    try {
      window.sessionStorage.setItem(SESSION_KEY, '1');
    } catch (e) {
      /* sessionStorage indisponible : on ignore */
    }
    if (stRef.current) stRef.current.kill();
    setActive(false);
    window.scrollTo(0, 0); // le site reprend proprement en haut
  }

  function handleSkip() {
    if (replay) {
      // Mode test : on descend simplement sous l'intro (toujours rejouable au scroll up).
      const end = spacerRef.current?.offsetHeight ?? window.innerHeight * 3;
      window.scrollTo({ top: end, behavior: 'smooth' });
      return;
    }
    if (fixedRef.current) {
      gsap.to(fixedRef.current, { opacity: 0, duration: 0.5, onComplete: finish });
    } else {
      finish();
    }
  }

  useEffect(() => {
    if (!active) return;

    if (replay) {
      // eslint-disable-next-line no-console
      console.info('[Intro3D] mode replay actif (?intro=replay) — scroll up pour rejouer.');
    }

    // Démarrer l'intro toujours en haut.
    const prevRestore = window.history.scrollRestoration;
    try {
      window.history.scrollRestoration = 'manual';
    } catch (e) { /* noop */ }
    window.scrollTo(0, 0);

    const st = ScrollTrigger.create({
      trigger: spacerRef.current,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        const p = self.progress;
        progressRef.current = p;

        // Le texte d'intro disparaît sur les premiers 45 %.
        if (overlayRef.current) {
          overlayRef.current.style.opacity = String(1 - smoothstep(0.0, 0.45, p));
        }
        // Fade + léger blur de la scène 3D sur les derniers 20 %.
        if (fixedRef.current) {
          const f = 1 - smoothstep(0.72, 0.96, p);
          fixedRef.current.style.opacity = String(f);
          fixedRef.current.style.filter = `blur(${(1 - f) * 7}px)`;
        }
      },
      onLeave: finish,
    });
    stRef.current = st;

    return () => {
      st.kill();
      try {
        window.history.scrollRestoration = prevRestore || 'auto';
      } catch (e) { /* noop */ }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  if (!active) return null;

  return (
    <>
      <div className="intro3d-fixed" ref={fixedRef} aria-hidden="false">
        <Canvas
          className="intro3d-canvas"
          dpr={lowPerf ? 1 : [1, 1.75]}
          gl={{ antialias: !lowPerf, powerPreference: 'high-performance' }}
          camera={{ position: [0, 1.0, RADIUS * 2.5], fov: 45 }}
        >
          <ambientLight intensity={0.11} />
          {/* Le "soleil" directionnel est géré dans CameraRig (il suit la caméra). */}

          <SpaceBackdrop lowPerf={lowPerf} progressRef={progressRef} />

          <Earth
            radius={RADIUS}
            progressRef={progressRef}
            rotationRef={planetRotationRef}
            lowPerf={lowPerf}
          />
          <Atmosphere radius={RADIUS} />
          <CameraRig
            radius={RADIUS}
            progressRef={progressRef}
            planetRotationRef={planetRotationRef}
          />
        </Canvas>

        <IntroOverlay ref={overlayRef} onSkip={handleSkip} />
      </div>

      {/* Spacer en flux normal : fournit la distance de scroll de l'intro. */}
      <div
        className="intro3d-spacer"
        ref={spacerRef}
        style={{ height: `${scrollVh}vh` }}
        aria-hidden="true"
      />
    </>
  );
}
