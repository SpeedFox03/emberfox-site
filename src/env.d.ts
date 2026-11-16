interface Window {
  dataLayer: unknown[];
  gtag: (...args: unknown[]) => void;
  enkotechTrack: (event: string, parameters?: Record<string, string | number>) => void;
}
