// Coordina la transición visual y respeta la preferencia de movimiento reducido.
import { useEffect, useState } from 'react';

interface TransitionLayerProps {
  module: string;
  phase: 'loading' | 'unloading';
  onDone: () => void;
}

export default function TransitionLayer({ module, phase, onDone }: TransitionLayerProps) {
  const [visibleLogs, setVisibleLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {

    const logs =
      phase === 'loading'
        ? [
            `> Initializing module: ${module}`,
            'Loading assets',
            'Fetching database',
            'Building components',
            'Rendering interface',
          ]
        : [
            `> Unloading module: ${module}`,
            'Cleaning memory',
            'Clearing DOM',
            'Resetting state',
          ];

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timers = logs.map((_, index) => window.setTimeout(() => {
      setVisibleLogs(logs.slice(0, index + 1));
      setProgress(Math.round(((index + 1) / logs.length) * 100));
    }, prefersReduced ? 0 : index * 220));
    timers.push(window.setTimeout(onDone, prefersReduced ? 0 : logs.length * 220 + 300));
    return () => timers.forEach(window.clearTimeout);
  }, [module, phase, onDone]);

  return (
    <div className="transition-layer" role="status" aria-live="assertive" aria-label={`${phase} ${module}`}>
      <div className="trans-box">
        {visibleLogs.map((text, i) => {
          const isFirst = i === 0;
          const showOk = !isFirst && phase === 'loading';
          return (
            <div
              key={`${text}-${i}`}
              className={`log-line mono ${showOk ? 'ok' : ''}`}
              style={{ animationDelay: '0s' }}
            >
              {text}
            </div>
          );
        })}
        {phase === 'loading' && (
          <div className="progress-bar" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
            <div style={{ width: `${progress}%`, transition: 'width .22s ease' }} />
          </div>
        )}
      </div>
    </div>
  );
}
