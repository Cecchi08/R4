// Coordina la navegación de la terminal; sólo el módulo admin monta autenticación.
import EducationSection from './sections/EducationSection';
import LanguagesSection from './sections/LanguagesSection';
import { useState, useEffect, useCallback } from 'react';
import { useTheme } from './hooks/useTheme';
import { AuthProvider } from './hooks/useAuth';
import Terminal from './components/Terminal';
import TransitionLayer from './components/TransitionLayer';
import AboutSection from './sections/AboutSection';
import SkillsSection from './sections/SkillsSection';
import ExperienceSection from './sections/ExperienceSection';
import AchievementsSection from './sections/AchievementsSection';
import ProjectsSection from './sections/ProjectsSection';
import GuestbookSection from './sections/GuestbookSection';
import ContactSection from './sections/ContactSection';
import AdminSection from './sections/AdminSection';
import type { TerminalSection } from './hooks/useTerminal';
import LandingPage from './components/LandingPage';

type SectionId = 'landing' | 'terminal' | TerminalSection;
type ViewMode = 'landing' | 'terminal';
const MODE_KEY = 'portfolio-view-mode';

function getInitialMode(): ViewMode {
  try { return localStorage.getItem(MODE_KEY) === 'terminal' ? 'terminal' : 'landing'; }
  catch { return 'landing'; }
}

function App() {
  const [mode, setMode] = useState<ViewMode>(getInitialMode);
  const [currentSection, setCurrentSection] = useState<SectionId>(() => getInitialMode() === 'terminal' ? 'terminal' : 'landing');
  const [pendingSection, setPendingSection] = useState<SectionId | null>(null);
  const [transMode, setTransMode] = useState<null | 'loading' | 'unloading'>(null);
  const [unmounting, setUnmounting] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const changeMode = useCallback((next: ViewMode) => {
    setMode(next);
    try { localStorage.setItem(MODE_KEY, next); } catch { /* La preferencia vive en memoria si storage está bloqueado. */ }
    setCurrentSection(next);
    setPendingSection(null);
    setTransMode(null);
    setUnmounting(false);
  }, []);
 // Maneja la navegación entre secciones, evitando navegar a la misma sección
  const navigateTo = useCallback((section: SectionId) => {
    if (section === currentSection) {
      return;
    }
    setPendingSection(section);
    setTransMode('loading');
  }, [currentSection]);
  // ir a la terminal desde cualquier sección, excepto la terminal misma
  const goTerminal = useCallback(() => {
    if (currentSection === 'terminal') {
      return;
    }
    setUnmounting(true);
    setTransMode('unloading');
  }, [currentSection]);

  // Maneja la transición de carga y descarga de secciones
  const handleTransDone = useCallback(() => {
    if (transMode === 'loading') {
      setCurrentSection(pendingSection as SectionId);
      setPendingSection(null);
      setTransMode(null);
    } else if (transMode === 'unloading') {
      setCurrentSection('terminal');
      setTransMode(null);
      setPendingSection(null);
      setUnmounting(false);
    }
  }, [transMode, pendingSection]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (mode === 'terminal' && e.key === 'Escape' && currentSection !== 'terminal') {
        goTerminal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, currentSection, goTerminal]);

  const renderSection = () => {
    const sectionWrapClass = unmounting ? 'ani-unload' : '';
    switch (currentSection) {
      case 'terminal':
        return (
          <Terminal
            onNavigate={navigateTo}
            onToggleTheme={toggleTheme}
          />
        );
      case 'landing':
        return <LandingPage onOpenGuestbook={() => setCurrentSection('guestbook')} onOpenAdmin={() => setCurrentSection('admin')} />;
      case 'education':
        return <div className={sectionWrapClass}><EducationSection onBack={goTerminal} /></div>;
      case 'languages':
        return <div className={sectionWrapClass}><LanguagesSection onBack={goTerminal} /></div>;
      case 'about':
        return <div className={sectionWrapClass}><AboutSection onBack={goTerminal} /></div>;
      case 'skills':
        return <div className={sectionWrapClass}><SkillsSection onBack={goTerminal} /></div>;
      case 'experience':
        return <div className={sectionWrapClass}><ExperienceSection onBack={goTerminal} /></div>;
      case 'achievements':
        return <div className={sectionWrapClass}><AchievementsSection onBack={goTerminal} /></div>;
      case 'projects':
        return (
          <div className={sectionWrapClass}>
            <ProjectsSection onBack={goTerminal} />
          </div>
        );
      case 'guestbook':
        return <div className={sectionWrapClass}><GuestbookSection onBack={() => setCurrentSection(mode === 'landing' ? 'landing' : 'terminal')} /></div>;
      case 'contact':
        return <div className={sectionWrapClass}><ContactSection onBack={goTerminal} /></div>;
      case 'admin':
        return <div className={sectionWrapClass}><AuthProvider><AdminSection onBack={() => setCurrentSection(mode === 'landing' ? 'landing' : 'terminal')} /></AuthProvider></div>;
      default:
        return null;
    }
  };

  const transModule = (pendingSection ?? currentSection) as string;

  return (
    <div className={`app-shell ${mode === 'terminal' ? 'tech-grid scanlines' : 'landing-shell'}`} data-theme={theme}>
      <header className="mode-bar" aria-label="Preferencias de interfaz">
        <a className="mode-brand" href={mode === 'landing' ? '#inicio' : undefined} onClick={mode === 'landing' ? undefined : () => changeMode('landing')}>MC<span>.</span></a>
        <div className="mode-controls" role="group" aria-label="Modo de navegación">
          <button type="button" className={`mode-option ${mode === 'landing' ? 'active' : ''}`} aria-pressed={mode === 'landing'} onClick={() => changeMode('landing')}>Portfolio</button>
          <button type="button" className={`mode-option ${mode === 'terminal' ? 'active' : ''}`} aria-pressed={mode === 'terminal'} onClick={() => changeMode('terminal')}>Terminal</button>
        </div>
        <button type="button" className="theme-toggle" onClick={toggleTheme} aria-label={`Cambiar a tema ${theme === 'dark' ? 'claro' : 'oscuro'}`}>{theme === 'dark' ? '☼' : '☾'}</button>
      </header>
      {transMode !== null && (
        <TransitionLayer module={transModule} phase={transMode} onDone={handleTransDone} />
      )}
      <main>{renderSection()}</main>
    </div>
  );
}

export default App;
