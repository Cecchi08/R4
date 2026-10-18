import { useCallback, useEffect, useState } from 'react';
import { getAbout } from '../services/about';
import { getSkills } from '../services/skills';
import { getExperience } from '../services/experience';
import { getAchievements } from '../services/achievements';
import { getProjects } from '../services/projects';
import { getEducation } from '../services/education';
import { getLanguages } from '../services/languages';
import { getContact } from '../services/contact';
import type { About, Achievement, Contact, Education, Experience, Language, Project, Skill } from '../types';

interface Props {
  onOpenGuestbook: () => void;
  onOpenAdmin: () => void;
}

interface PortfolioData {
  about: About | null;
  skills: Skill[];
  experience: Experience[];
  achievements: Achievement[];
  projects: Project[];
  education: Education[];
  languages: Language[];
  contact: Contact | null;
}

const emptyData: PortfolioData = {
  about: null, skills: [], experience: [], achievements: [], projects: [], education: [], languages: [], contact: null,
};

function usePortfolioData() {
  const [data, setData] = useState<PortfolioData>(emptyData);
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchData = useCallback(async () => {
    const results = await Promise.allSettled([
      getAbout(), getSkills(), getExperience(), getAchievements(), getProjects(), getEducation(), getLanguages(), getContact(),
    ]);
    const next = { ...emptyData };
    const failures: string[] = [];
    const assign = <K extends keyof PortfolioData>(key: K, index: number) => {
      const result = results[index];
      if (result.status === 'fulfilled') next[key] = result.value as PortfolioData[K];
      else failures.push(key);
    };
    (['about', 'skills', 'experience', 'achievements', 'projects', 'education', 'languages', 'contact'] as const).forEach((key, index) => assign(key, index));
    return { next, failures };
  }, []);
  useEffect(() => {
    let active = true;
    void fetchData().then(({ next, failures }) => {
      if (active) { setData(next); setErrors(failures); setLoading(false); }
    });
    return () => { active = false; };
  }, [fetchData]);
  const reload = useCallback(async () => {
    setLoading(true);
    const { next, failures } = await fetchData();
    setData(next); setErrors(failures); setLoading(false);
  }, [fetchData]);
  return { data, errors, loading, reload };
}

function SectionHeading({ eyebrow, title, id }: { eyebrow: string; title: string; id: string }) {
  return <div className="landing-section-heading"><p className="landing-eyebrow">{eyebrow}</p><h2 id={id}>{title}</h2></div>;
}

function dateLabel(value?: string | null) {
  if (!value) return 'Actualidad';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('es-AR', { month: 'short', year: 'numeric' });
}

export default function LandingPage({ onOpenGuestbook, onOpenAdmin }: Props) {
  const { data, errors, loading, reload } = usePortfolioData();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const { about, skills, experience, achievements, projects, education, languages, contact } = data;
  const name = about?.full_name || 'Portfolio';
  const interests = about?.interests?.split(';').map(item => item.trim()).filter(Boolean) ?? [];

  useEffect(() => {
    const updateScrollButton = () => setShowBackToTop(window.scrollY > 320);
    window.addEventListener('scroll', updateScrollButton, { passive: true });
    return () => window.removeEventListener('scroll', updateScrollButton);
  }, []);

  const gmailComposeUrl = contact?.email
    ? `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(contact.email)}`
    : undefined;
  const closeMenu = () => setMenuOpen(false);

  return <div className="landing-page">
    <nav className="landing-nav" aria-label="Navegación principal">
      <a className="landing-nav-name" href="#inicio">{name}</a>
      <div className={`landing-nav-links ${menuOpen ? 'is-open' : ''}`} id="landing-navigation">
        <a href="#sobre-mi" onClick={closeMenu}>Sobre mí</a><a href="#habilidades" onClick={closeMenu}>Habilidades</a><a href="#experiencia" onClick={closeMenu}>Experiencia</a>
        <a href="#logros" onClick={closeMenu}>Logros</a><a href="#proyectos" onClick={closeMenu}>Proyectos</a><a href="#educacion" onClick={closeMenu}>Educación</a><a href="#idiomas" onClick={closeMenu}>Idiomas</a><a href="#contacto" onClick={closeMenu}>Contacto</a>
      </div>
      <a className="landing-nav-cta" href="#contacto" onClick={closeMenu}>Hablemos <span aria-hidden="true">↗</span></a>
      <button className={`landing-menu-toggle ${menuOpen ? 'is-open' : ''}`} type="button" aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={menuOpen} aria-controls="landing-navigation" onClick={() => setMenuOpen(open => !open)}>
        <span /><span /><span />
      </button>
    </nav>

    <main>
      <section className="landing-hero" id="inicio" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="landing-eyebrow">{about?.title || 'Portfolio profesional'}</p>
          <h1 id="hero-title">{about?.full_name ? <>Hola, soy <span>{about.full_name}</span>.</> : 'Portfolio profesional'}</h1>
          {about?.title && <p className="hero-role">{about.title}</p>}
          {(about?.profile || about?.description) && <p className="hero-description">{about.profile || about.description}</p>}
          <div className="hero-actions">
            <a className="landing-button primary" href="#proyectos">Ver proyectos <span aria-hidden="true">↓</span></a>
            {gmailComposeUrl && <a className="landing-button secondary" href={gmailComposeUrl} target="_blank" rel="noopener noreferrer">Contactarme por Gmail <span aria-hidden="true">↗</span></a>}
          </div>
          {contact?.public_location && <p className="hero-location"><span aria-hidden="true">⌖</span> {contact.public_location}</p>}
        </div>
        <div className="hero-card" aria-label="Perfil profesional">
          <div className="hero-card-top"><span>PERFIL</span><span className="hero-card-mark">MC</span></div>
          <div className="hero-avatar" aria-hidden="true">{name.split(' ').slice(0, 2).map(part => part[0]).join('').toUpperCase()}</div>
          <p className="hero-card-name">{name}</p>{about?.title && <p className="hero-card-role">{about.title}</p>}
          {contact?.public_location && <p className="hero-card-location">{contact.public_location}</p>}
          <div className="hero-card-bottom"><span>PORTFOLIO</span><span>01 — 08</span></div>
        </div>
        <a className="hero-scroll" href="#sobre-mi"><span /> Deslizá para explorar</a>
      </section>

      {errors.length > 0 && <div className="landing-load-error" role="status">Algunos datos no pudieron cargarse. <button onClick={() => void reload()}>Reintentar</button></div>}

      <section className="landing-section about-section" id="sobre-mi">
        <SectionHeading eyebrow="01 / PERFIL" title="Sobre mí" id="about-heading" />
        <div className="about-layout">
          <p className="about-lead">{about?.description || about?.profile || 'Información personal no disponible.'}</p>
          <div className="about-details">
            {about?.profile && about.profile !== about.description && <p>{about.profile}</p>}
            {about?.objectives && <div><span className="detail-label">OBJETIVOS</span><p>{about.objectives}</p></div>}
            {about?.additional_interest && <div><span className="detail-label">TAMBIÉN ME INTERESA</span><p>{about.additional_interest}</p></div>}
            {interests.length > 0 && <div className="interest-list"><span className="detail-label">ÁREAS DE INTERÉS</span><div>{interests.map(item => <span className="interest-chip" key={item}>{item}</span>)}</div></div>}
          </div>
        </div>
      </section>

      <section className="landing-section tinted-section" id="habilidades">
        <SectionHeading eyebrow="02 / CONOCIMIENTOS" title="Habilidades" id="skills-heading" />
        {loading && skills.length === 0 ? <p className="landing-muted">Cargando habilidades…</p> : skills.length ? <div className="landing-skills-grid">{skills.map(skill => <article className="landing-skill" key={skill.skill_id}>
          <div className="skill-label-row"><h3>{skill.name}</h3><span>{skill.level}%</span></div><div className="landing-skill-track"><span style={{ width: `${Math.min(100, Math.max(0, skill.level))}%` }} /></div>
          <p>{skill.description}</p><span className="skill-category">{skill.category}</span>
        </article>)}</div> : <p className="landing-muted">No hay habilidades registradas.</p>}
      </section>

      <section className="landing-section" id="experiencia">
        <SectionHeading eyebrow="03 / TRAYECTORIA" title="Experiencia" id="experience-heading" />
        {experience.length ? <div className="landing-timeline">{experience.map(item => <article className="landing-timeline-item" key={item.experience_id}>
          <span className="timeline-marker" /><div className="timeline-meta"><span>{dateLabel(item.start_date)} — {dateLabel(item.end_date)}</span><span>{item.status || 'Experiencia'}</span></div>
          <h3>{item.position}</h3><p className="timeline-org">{item.organization}</p><p className="timeline-description">{item.description}</p>
          {!!item.technologies?.length && <div className="landing-tags">{item.technologies.map(tech => <span key={tech}>{tech}</span>)}</div>}
        </article>)}</div> : <p className="landing-muted">{loading ? 'Cargando experiencia…' : 'No hay experiencia registrada.'}</p>}
      </section>

      <section className="landing-section tinted-section" id="logros">
        <SectionHeading eyebrow="04 / RECONOCIMIENTOS" title="Logros" id="achievements-heading" />
        {achievements.filter(item => item.title.toLowerCase() !== 'no hay logros cargados').length ? <div className="landing-card-grid">{achievements.filter(item => item.title.toLowerCase() !== 'no hay logros cargados').map(item => <article className="landing-info-card" key={item.achievement_id}>
          <span className="landing-card-kicker">{item.category || dateLabel(item.date)}</span><h3>{item.title}</h3>{item.description && <p>{item.description}</p>}
          {item.metric_value != null && <strong className="achievement-metric">{item.metric_value} {item.metric_label}</strong>}
        </article>)}</div> : <p className="landing-muted">{loading ? 'Cargando logros…' : 'No hay logros publicados.'}</p>}
      </section>

      <section className="landing-section" id="proyectos">
        <SectionHeading eyebrow="05 / TRABAJO SELECCIONADO" title="Proyectos" id="projects-heading" />
        {projects.length ? <div className="landing-project-grid">{projects.map((project, index) => <article className="landing-project" key={project.project_id}>
          <div className={`project-visual project-visual-${index % 3}`}>
            {project.image_url ? <img src={project.image_url} alt={`Vista de ${project.name}`} loading="lazy" /> : <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>}
            {project.category && <span className="project-category">{project.category}</span>}
          </div>
          <div className="project-content"><div className="project-title-row"><h3>{project.name}</h3>{project.project_date && <span>{new Date(project.project_date).getFullYear()}</span>}</div>
            <p>{project.short_description || project.full_description}</p>
            {!!project.technologies?.length && <div className="landing-tags">{project.technologies.slice(0, 5).map(tech => <span key={tech}>{tech}</span>)}</div>}
            <div className="project-links">{project.demo_url && <a href={project.demo_url} target="_blank" rel="noopener noreferrer">Ver demo <span aria-hidden="true">↗</span></a>}{project.repo_url && <a href={project.repo_url} target="_blank" rel="noopener noreferrer">Repositorio <span aria-hidden="true">↗</span></a>}</div>
          </div>
        </article>)}</div> : <p className="landing-muted">{loading ? 'Cargando proyectos…' : 'No hay proyectos registrados.'}</p>}
      </section>

      <section className="landing-section tinted-section" id="educacion">
        <SectionHeading eyebrow="06 / FORMACIÓN" title="Educación e idiomas" id="education-heading" />
        <div className="education-language-grid"><div><h3 className="subsection-title">Educación</h3>{education.length ? education.map(item => <article className="education-item" key={item.education_id}><span className="education-years">{item.start_year} — {item.end_year ?? 'Actualidad'}</span><h4>{item.title}</h4><p>{item.institution}</p><span className="skill-category">{item.status}</span></article>) : <p className="landing-muted">{loading ? 'Cargando educación…' : 'No hay formación registrada.'}</p>}</div>
          <div id="idiomas"><h3 className="subsection-title">Idiomas</h3>{languages.length ? <div className="language-list">{languages.map(item => <div className="language-item" key={item.language_id}><span>{item.name}</span><span>{item.level}</span></div>)}</div> : <p className="landing-muted">{loading ? 'Cargando idiomas…' : 'No hay idiomas registrados.'}</p>}</div></div>
      </section>

      <section className="landing-contact" id="contacto"><div><p className="landing-eyebrow">07 / SIGUIENTE PASO</p><h2>¿Hablamos?</h2><p>Estoy abierto a conversar sobre oportunidades y proyectos.</p></div>
        <div className="contact-actions">{gmailComposeUrl && <a className="landing-button primary" href={gmailComposeUrl} target="_blank" rel="noopener noreferrer">Enviar un mensaje por Gmail <span aria-hidden="true">↗</span></a>}{contact?.github_url && <a href={contact.github_url} target="_blank" rel="noopener noreferrer">GitHub ↗</a>}{contact?.linkedin_url && <a href={contact.linkedin_url} target="_blank" rel="noopener noreferrer">LinkedIn ↗</a>}</div>
      </section>
    </main>
    <footer className="landing-footer"><span>© {new Date().getFullYear()} {name}</span><div><button type="button" onClick={onOpenGuestbook}>Libro de visitas</button><button type="button" onClick={onOpenAdmin}>Administrar</button><a href="#inicio">Volver arriba ↑</a></div></footer>
    {showBackToTop && <button className="back-to-top" type="button" aria-label="Volver arriba" title="Volver arriba" onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })}>↑</button>}
  </div>;
}
