-- =============================================
-- Portfolio Database Schema
-- Real portfolio data for Mateo Cecchini
-- =============================================


CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Tabla: users (autenticación / roles)
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    role VARCHAR(10) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Tabla: contacts / metadata del portfolio
CREATE TABLE IF NOT EXISTS profile_contact (
    contact_id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(30) NOT NULL,
    github_url TEXT NOT NULL,
    linkedin_url TEXT NOT NULL,
    public_location VARCHAR(120) NOT NULL DEFAULT 'Argentina',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabla: about (perfil personal)
CREATE TABLE IF NOT EXISTS about (
    about_id SERIAL PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    title VARCHAR(160) NOT NULL,
    description TEXT NOT NULL,
    interests TEXT NOT NULL,
    objectives TEXT NOT NULL,
    profile TEXT NOT NULL,
    technologies TEXT NOT NULL,
    additional_interest TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabla: skills
CREATE TABLE IF NOT EXISTS skills (
    skill_id SERIAL PRIMARY KEY,
    name VARCHAR(80) NOT NULL,
    category VARCHAR(60) NOT NULL,
    level SMALLINT NOT NULL CHECK (level BETWEEN 0 AND 100),
    description TEXT NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_skills_category ON skills(category);

-- Tabla: experience
CREATE TABLE IF NOT EXISTS experience (
    experience_id SERIAL PRIMARY KEY,
    position VARCHAR(120) NOT NULL,
    organization VARCHAR(160) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NULL CHECK (end_date >= start_date OR end_date IS NULL),
    status VARCHAR(30) NOT NULL DEFAULT 'En vigencia' CHECK (status IN ('En vigencia', 'Finalizada', 'Pendiente')),
    description TEXT NOT NULL,
    technologies TEXT[] NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_experience_start_date ON experience(start_date);

-- Tabla: achievements
CREATE TABLE IF NOT EXISTS achievements (
    achievement_id SERIAL PRIMARY KEY,
    title VARCHAR(160) NOT NULL,
    date DATE NOT NULL,
    description TEXT,
    category VARCHAR(60),
    icon_or_image VARCHAR(255),
    metric_value INT,
    metric_label VARCHAR(60),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabla: projects
CREATE TABLE IF NOT EXISTS projects (
    project_id SERIAL PRIMARY KEY,
    name VARCHAR(160) NOT NULL,
    short_description VARCHAR(260) NOT NULL,
    full_description TEXT NOT NULL,
    category VARCHAR(60) NOT NULL,
    technologies TEXT[] NOT NULL,
    image_url VARCHAR(255),
    demo_url VARCHAR(255),
    repo_url VARCHAR(255),
    project_date DATE,
    status VARCHAR(30) NOT NULL DEFAULT 'Terminado' CHECK (status IN ('Terminado', 'En desarrollo', 'Pendiente')),
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);

-- Tabla: education
CREATE TABLE IF NOT EXISTS education (
    education_id SERIAL PRIMARY KEY,
    institution VARCHAR(160) NOT NULL,
    title VARCHAR(200) NOT NULL,
    start_year INT NOT NULL CHECK (start_year BETWEEN 1900 AND 2100),
    end_year INT NULL CHECK (end_year IS NULL OR end_year >= start_year),
    status VARCHAR(40) NOT NULL DEFAULT 'En curso' CHECK (status IN ('En curso', 'Finalizado', 'Pendiente')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabla: languages
CREATE TABLE IF NOT EXISTS languages (
    language_id SERIAL PRIMARY KEY,
    name VARCHAR(80) NOT NULL,
    level VARCHAR(20) NOT NULL CHECK (level IN ('Nativo', 'C1', 'C2', 'B2', 'B1', 'A2', 'A1')),
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabla: comments (guestbook)
CREATE TABLE IF NOT EXISTS comments (
    comment_id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL CHECK (char_length(name) BETWEEN 2 AND 50),
    message VARCHAR(1000) NOT NULL CHECK (char_length(message) BETWEEN 2 AND 1000),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_trigger
        WHERE tgname = 'users_set_updated_at'
    ) THEN
        CREATE TRIGGER users_set_updated_at
        BEFORE UPDATE ON users
        FOR EACH ROW
        EXECUTE FUNCTION set_updated_at();
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_trigger
        WHERE tgname = 'profile_contact_set_updated_at'
    ) THEN
        CREATE TRIGGER profile_contact_set_updated_at
        BEFORE UPDATE ON profile_contact
        FOR EACH ROW
        EXECUTE FUNCTION set_updated_at();
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_trigger
        WHERE tgname = 'about_set_updated_at'
    ) THEN
        CREATE TRIGGER about_set_updated_at
        BEFORE UPDATE ON about
        FOR EACH ROW
        EXECUTE FUNCTION set_updated_at();
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_trigger
        WHERE tgname = 'skills_set_updated_at'
    ) THEN
        CREATE TRIGGER skills_set_updated_at
        BEFORE UPDATE ON skills
        FOR EACH ROW
        EXECUTE FUNCTION set_updated_at();
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_trigger
        WHERE tgname = 'experience_set_updated_at'
    ) THEN
        CREATE TRIGGER experience_set_updated_at
        BEFORE UPDATE ON experience
        FOR EACH ROW
        EXECUTE FUNCTION set_updated_at();
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_trigger
        WHERE tgname = 'achievements_set_updated_at'
    ) THEN
        CREATE TRIGGER achievements_set_updated_at
        BEFORE UPDATE ON achievements
        FOR EACH ROW
        EXECUTE FUNCTION set_updated_at();
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_trigger
        WHERE tgname = 'projects_set_updated_at'
    ) THEN
        CREATE TRIGGER projects_set_updated_at
        BEFORE UPDATE ON projects
        FOR EACH ROW
        EXECUTE FUNCTION set_updated_at();
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_trigger
        WHERE tgname = 'education_set_updated_at'
    ) THEN
        CREATE TRIGGER education_set_updated_at
        BEFORE UPDATE ON education
        FOR EACH ROW
        EXECUTE FUNCTION set_updated_at();
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_trigger
        WHERE tgname = 'languages_set_updated_at'
    ) THEN
        CREATE TRIGGER languages_set_updated_at
        BEFORE UPDATE ON languages
        FOR EACH ROW
        EXECUTE FUNCTION set_updated_at();
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_trigger
        WHERE tgname = 'comments_set_updated_at'
    ) THEN
        CREATE TRIGGER comments_set_updated_at
        BEFORE UPDATE ON comments
        FOR EACH ROW
        EXECUTE FUNCTION set_updated_at();
    END IF;
END $$;

-- =============================================
-- Datos reales del portfolio
-- =============================================

INSERT INTO profile_contact (email, phone, github_url, linkedin_url, public_location)
VALUES (
    'cecchinimateo21@gmail.com',
    '2236861233',
    'https://github.com/Cecchi08',
    'https://www.linkedin.com/in/mateo-cecchini-58059338b',
    'Argentina'
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO about (
    full_name,
    title,
    description,
    interests,
    objectives,
    profile,
    technologies,
    additional_interest
) VALUES (
    'Cecchini Mateo',
    'Estudiante',
    'Mateo Cecchini es estudiante de la Tecnicatura en Informática Personal y Profesional.',
    'Programación; Desarrollo web; Inteligencia artificial y automatización; Desarrollo de sistemas y aplicaciones; Bases de datos y backend; Docker, Linux y servidores; Hardware y soporte técnico; Investigación y resolución de problemas; Matemática y lógica; Aprendizaje de nuevas tecnologías',
    'Mejorar continuamente sus conocimientos de programación; Desarrollar proyectos cada vez más profesionales; Profundizar conocimientos en IA, backend, bases de datos y DevOps; Obtener experiencia práctica; Mejorar sus capacidades técnicas y de resolución de problemas; Desarrollar soluciones reales combinando software, automatización e IA.',
    'Persona autodidacta, curiosa y orientada a la resolución de problemas.',
    'React; TypeScript; Node.js; Python; PostgreSQL; MySQL; Docker; Ollama; Qwen; OpenClaw; Linux; Git; APIs; Deployments',
    'Comprender cómo funcionan internamente las tecnologías y sistemas utilizados.'
)
ON CONFLICT DO NOTHING;

INSERT INTO skills (name, category, level, description, sort_order) VALUES
('Desarrollo web', 'Programación', 80, 'Desarrollo de aplicaciones web utilizando React, TypeScript, Node.js, APIs y bases de datos.', 1),
('Programación', 'Informática', 80, 'Desarrollo de aplicaciones, lógica de programación y resolución de problemas.', 2),
('Inteligencia artificial', 'IA y automatización', 75, 'Trabajo con modelos locales, Ollama, Qwen, OpenClaw y automatización.', 3),
('Administración de servidores', 'Sistemas', 70, 'Administración de sistemas Linux, Docker, contenedores, redes, servicios y despliegues.', 4),
('Bases de datos', 'Backend', 70, 'Trabajo e integración con bases de datos MySQL y PostgreSQL.', 5),
('Soporte técnico', 'Hardware y sistemas', 80, 'Diagnóstico y resolución de problemas relacionados con hardware, drivers, sistemas operativos y dispositivos.', 6)
ON CONFLICT DO NOTHING;

INSERT INTO experience (position, organization, start_date, end_date, status, description, technologies, sort_order) VALUES
(
    'Practicante',
    'Grupo Núcleo',
    '2026-08-11',
    NULL,
    'En vigencia',
    'Desarrollo de soluciones web y sistemas inteligentes, incluyendo aplicaciones, APIs, bases de datos y agentes de inteligencia artificial. Participación en procesos de desarrollo y despliegue de soluciones modernas.',
    ARRAY['HTML', 'CSS', 'Node.js', 'Express', 'Docker', 'Linux', 'IA', 'Agentes', 'React', 'APIs', 'Bases de datos', 'PostgreSQL'],
    1
)
ON CONFLICT DO NOTHING;

INSERT INTO achievements (title, date, description, category, icon_or_image, metric_value, metric_label)
VALUES
('No hay logros cargados', '2026-01-01', 'Actualmente no hay logros cargados.', 'General', NULL, NULL, NULL)
ON CONFLICT DO NOTHING;

-- La tabla achievements queda preparada para agregar logros posteriormente.
-- Se evita inventar logros ficticios.

INSERT INTO projects (name, short_description, full_description, category, technologies, image_url, demo_url, repo_url, project_date, status, sort_order) VALUES
(
    'Bondis',
    'Plataforma web para visualizar los tiempos de arribo de los colectivos que pasan cerca de la escuela.',
    'Proyecto que permite visualizar los tiempos de llegada de los colectivos que circulan cerca de la escuela, facilitando la consulta de los horarios de arribo.',
    'Web app',
    ARRAY['HTML', 'CSS', 'JavaScript', 'Node.js', 'Python'],
    NULL,
    'https://bondis-beta.vercel.app/',
    'https://github.com/Cecchi08/Bondis',
    '2025-01-01',
    'Terminado',
    1
),
(
    'Malharro Web',
    'Desarrollo de página web institucional para la escuela M. Malharro.',
    'Desarrollo de una página web institucional para la escuela M. Malharro, con un diseño flexible y una estructura sencilla de editar y mantener.',
    'Web app',
    ARRAY['React', 'Node.js', 'Express', 'HTML', 'CSS'],
    NULL,
    NULL,
    'https://github.com/SESELOVSKYDarian/MalharroPrueba2',
    '2024-01-01',
    'Terminado',
    2
)
ON CONFLICT DO NOTHING;

INSERT INTO education (institution, title, start_year, end_year, status) VALUES
('EEST N°5', 'Tecnicatura en Informática Personal y Profesional', 2020, 2026, 'En curso')
ON CONFLICT DO NOTHING;

INSERT INTO languages (name, level, sort_order) VALUES
('Español', 'Nativo', 1),
('Inglés', 'B1', 2),
('Italiano', 'A2', 3)
ON CONFLICT DO NOTHING;

-- comments: la tabla queda preparada para que los visitantes agreguen mensajes posteriormente.
-- No se insertan comentarios ficticios.

-- Usuario administrador no se crea con credenciales reales.
-- Se recomienda generar el password_hash mediante bcrypt desde el backend y luego crear el usuario admin en SQL o por aplicación.

-- =============================================
-- Comentario final
-- La estructura quedó preparada para Supabase y para que el backend administre el portfolio.
-- =============================================
