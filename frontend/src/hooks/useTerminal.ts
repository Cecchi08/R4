// Interpreta comandos públicos y asigna identificadores estables al historial.
import { useState, useEffect, useRef, useCallback } from 'react';

export type TerminalSection =
  | 'education'
  | 'languages'
  | 'about'
  | 'skills'
  | 'experience'
  | 'achievements'
  | 'projects'
  | 'guestbook'
  | 'contact'
  | 'admin';


export interface TerminalEntry {
  id: number;
  type: 'command' | 'output' | 'system';
  content: string;
}

const HELP_TEXT =
  'Comandos disponibles:\n' +
  ' education      - Ver educación\n' +
  ' languages      - Ver idiomas\n' +
  ' help | ayuda    - Muestra esta ayuda\n' +
  ' about          - Abrir sección Sobre mí\n' +
  ' skills         - Ver habilidades\n' +
  ' experience     - Ver experiencia laboral\n' +
  ' achievements   - Ver logros\n' +
  ' projects       - Ver proyectos\n' +
  ' guestbook      - Libro de visitas\n' +
  ' contact        - Medios de contacto\n' +
  ' admin          - Panel de administración\n' +
  ' theme          - Alternar modo día/noche\n' +
  ' clear          - Limpiar terminal';

const NAV_SECTIONS: TerminalSection[] = [
  'education',
  'languages',
  'about',
  'skills',
  'experience',
  'achievements',
  'projects',
  'guestbook',
  'contact',
  'admin',
];

export function useTerminal() {
  const [input, setInput] = useState<string>('');
  const [history, setHistory] = useState<TerminalEntry[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const nextIdRef = useRef<number>(1);
  const onNavigateRef = useRef<((section: TerminalSection) => void) | undefined>(undefined);
  const onToggleThemeRef = useRef<(() => void) | undefined>(undefined);

  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const appendEntry = useCallback(
    (type: TerminalEntry['type'], content: string) => {
      const id = nextIdRef.current++;
      setHistory((prev) => [...prev, { id, type, content }]);
    },
    []
  );

  const appendSystem = useCallback(
    (text: string) => {
      appendEntry('system', text);
    },
    [appendEntry]
  );

  const setOnNavigate = useCallback((fn: (s: TerminalSection) => void) => {
    onNavigateRef.current = fn;
  }, []);

  const setOnToggleTheme = useCallback((fn: () => void) => {
    onToggleThemeRef.current = fn;
  }, []);

  const onInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key !== 'Enter') {
        return;
      }

      const raw = input;
      const cmd = raw.trim().toLowerCase();

      if (cmd === '') {
        focusInput();
        return;
      }

      if (cmd === 'clear') {
        clearHistory();
        setInput('');
        focusInput();
        return;
      }

      appendEntry('command', `> ${raw}`);

      if (cmd === 'help' || cmd === 'ayuda') {
        appendEntry('output', HELP_TEXT);
      } else if (cmd === 'theme') {
        appendEntry('output', 'Toggling theme...');
        onToggleThemeRef.current?.();
      } else if (NAV_SECTIONS.includes(cmd as TerminalSection)) {
        const section = cmd as TerminalSection;
        appendEntry('output', `Loading module: ${section}...`);
        onNavigateRef.current?.(section);
      } else {
        appendEntry(
          'output',
          'Command not found. Type "help" to list available commands.'
        );
      }

      setInput('');
      focusInput();
    },
    [input, appendEntry, clearHistory, focusInput]
  );

  useEffect(() => {
    focusInput();
  }, [focusInput]);

  return {
    input,
    setInput,
    history,
    inputRef,
    onInputChange,
    handleKeyDown,
    focusInput,
    clearHistory,
    appendSystem,
    setOnNavigate,
    setOnToggleTheme,
  };
}
