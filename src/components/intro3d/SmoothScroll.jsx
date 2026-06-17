import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Active un smooth scroll global (Lenis) synchronisé avec GSAP ScrollTrigger.
 *
 * Lenis (v1) pilote le scroll réel de la fenêtre : les `scroll` events natifs
 * continuent d'être émis, donc la nav et les IntersectionObserver existants
 * du site ne sont pas cassés.
 *
 * @param {boolean} enabled  false → ne fait rien (mobile / reduced-motion).
 */
export function useSmoothScroll(enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
      // On laisse le tactile au scroll natif pour ne pas gêner sur mobile.
      smoothTouch: false,
    });

    lenis.on('scroll', ScrollTrigger.update);

    const onTick = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(onTick);
      lenis.destroy();
    };
  }, [enabled]);
}

/** Variante composant si tu préfères : <SmoothScroll enabled /> */
export default function SmoothScroll({ enabled = true }) {
  useSmoothScroll(enabled);
  return null;
}
