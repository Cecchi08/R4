// Anima el acceso admin con temporizadores que se cancelan al desmontar.
import { useEffect, useState } from 'react';

interface AuthBootSequenceProps {
  lines: string[];
  onDone: () => void;
}

export default function AuthBootSequence({ lines, onDone }: AuthBootSequenceProps) {
  const [visible, setVisible] = useState<string[]>([]);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timers = lines.map((_, index) => window.setTimeout(() => {
      setVisible(lines.slice(0, index + 1));
    }, reduced ? 0 : index * 200));
    timers.push(window.setTimeout(onDone, reduced ? 0 : lines.length * 200 + 150));
    return () => timers.forEach(window.clearTimeout);
  }, [lines, onDone]);

  return (
    <div className="panel ani-fade auth-boot" style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>
      {visible.map((line, i) => (
        <div
          key={i}
          className="log-line"
          style={{
            marginBottom: 4,
            animationDelay: `${i * 80}ms`,
            color: line.includes('DENIED') || line.includes('ERROR')
              ? 'var(--error)'
              : line.includes('granted') || line.includes('OK')
                ? 'var(--success)'
                : 'var(--fg)',
          }}
        >
          {line}
        </div>
      ))}
    </div>
  );
}
