// Presenta la terminal y conecta sus comandos con navegación y tema.
import { useEffect } from 'react';
import { useTerminal } from '../hooks/useTerminal';
import type { TerminalSection } from '../hooks/useTerminal';

interface TerminalProps {
  onNavigate: (section: TerminalSection) => void;
  onToggleTheme: () => void;
}

export default function Terminal({ onNavigate, onToggleTheme }: TerminalProps) {
  const {
    history,
    inputRef,
    onInputChange,
    handleKeyDown,
    appendSystem,
    setOnNavigate,
    setOnToggleTheme,
    focusInput,
    input,
  } = useTerminal();


  useEffect(() => {
    setOnNavigate(onNavigate);
  }, [onNavigate, setOnNavigate]);

  useEffect(() => {
    setOnToggleTheme(onToggleTheme);
  }, [onToggleTheme, setOnToggleTheme]);

  useEffect(() => {
    const lines = [
      'BIOS INITIALIZATION...',
      'CPU ........................ OK',
      'MEMORY ..................... OK',
      'NETWORK .................... OK',
      'DATABASE ................... OK',
      'REACT RUNTIME .............. OK',
      '',
      'Initializing portfolio...',
      '',
      'SYSTEM READY',
      'Insert "help" or "ayuda" to continue.',
    ];

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const timers = lines.map((line, index) => window.setTimeout(() => appendSystem(line), prefersReduced ? 0 : index * 250));
    timers.push(window.setTimeout(focusInput, prefersReduced ? 0 : lines.length * 250));
    return () => timers.forEach(window.clearTimeout);
  }, [appendSystem, focusInput]);

  const promptUser = 'guest';

  return (
    <div className="terminal ani-fade" role="region" aria-label="Terminal interactiva">
      <div className="terminal-header">
        <span className="dot" aria-hidden="true" />
        <span className="dot y" aria-hidden="true" />
        <span className="dot g" aria-hidden="true" />
        <span className="term-title mono">portfolio@terminal ~</span>
      </div>
      <div className="terminal-body" aria-live="polite">
        {history.map((entry) => {
          let content = entry.content;
          if (entry.type === 'command') {
            content = entry.content.startsWith('>') ? entry.content : `$ ${entry.content}`;
          }
          return (
            <div key={entry.id} className={`term-entry ${entry.type}`}>
              {content}
            </div>
          );
        })}
      </div>
      <div className="term-input-row">
        <span className="term-prompt mono">{promptUser}@portfolio:~$</span>
        <input
          ref={inputRef}
          type="text"
          className="term-input mono"
          aria-label="Input de comandos de terminal"
          placeholder='Escribí "help" o "ayuda"'
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          value={input}
          onChange={onInputChange}
          onKeyDown={handleKeyDown}
        />
      </div>
    </div>
  );
}
