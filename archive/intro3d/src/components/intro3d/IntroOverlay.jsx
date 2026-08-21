import { forwardRef } from 'react';

/**
 * Texte d'intro + bouton "Passer l'intro".
 * Tout est en `pointer-events: none` sauf le bouton, pour ne jamais
 * bloquer le scroll ni les clics du site.
 */
const IntroOverlay = forwardRef(function IntroOverlay({ onSkip }, ref) {
  return (
    <div className="intro3d-overlay" ref={ref}>
      <div className="intro3d-text">
        <p className="intro3d-pre">EMBERFOX</p>
        <h1 className="intro3d-title">Bienvenue</h1>
        <p className="intro3d-sub">Scroll pour entrer</p>
        <div className="intro3d-scroll-hint" aria-hidden="true">
          <span className="intro3d-mouse">
            <span className="intro3d-wheel" />
          </span>
        </div>
      </div>

      <button type="button" className="intro3d-skip" onClick={onSkip}>
        Passer l’intro
      </button>
    </div>
  );
});

export default IntroOverlay;
