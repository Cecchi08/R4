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

type SectionId = 'terminal' | TerminalSection;

function App() {
  const [currentSection, setCurrentSection] = useState<SectionId>('terminal');
  const [pendingSection, setPendingSection] = useState<SectionId | null>(null);
  const [transMode, setTransMode] = useState<null | 'loading' | 'unloading'>(null);
  const [unmounting, setUnmounting] = useState(false);
  const { theme, toggleTheme } = useTheme();
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
      if (e.key === 'Escape' && currentSection !== 'terminal') {
        goTerminal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSection, goTerminal]);

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
        return <div className={sectionWrapClass}><GuestbookSection onBack={goTerminal} /></div>;
      case 'contact':
        return <div className={sectionWrapClass}><ContactSection onBack={goTerminal} /></div>;
      case 'admin':
        return <div className={sectionWrapClass}><AuthProvider><AdminSection onBack={goTerminal} /></AuthProvider></div>;
      default:
        return null;
    }
  };

  const transModule = (pendingSection ?? currentSection) as string;

  return (
    <div className={`app-shell tech-grid scanlines`} data-theme={theme}>
      {transMode !== null && (
        <TransitionLayer module={transModule} phase={transMode} onDone={handleTransDone} />
      )}
      <main>{renderSection()}</main>
    </div>
  );
}

export default App;
