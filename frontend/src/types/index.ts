// Define los contratos JSON compartidos por las secciones y servicios de la API.
export interface Admin {
  id: number;
  username: string;
  email: string;
  role: 'admin';
  created_at?: string;
  updated_at?: string;
}

export interface About {
  about_id: number;
  full_name: string;
  title?: string;
  description?: string;
  interests?: string;
  objectives?: string;
  profile?: string;
  technologies?: string;
  additional_interest?: string;
}

export interface Skill {
  skill_id: number;
  name: string;
  category: string;
  level: number;
  description?: string;
  sort_order: number;
}

export interface Experience {
  experience_id: number;
  position: string;
  organization?: string;
  start_date: string;
  end_date?: string | null;
  status?: string;
  description?: string;
  technologies?: string[];
  sort_order: number;
}

export interface Achievement {
  achievement_id: number;
  title: string;
  date: string;
  description?: string;
  category?: string;
  icon_or_image?: string;
  metric_value?: number | null;
  metric_label?: string | null;
}

export interface Project {
  project_id: number;
  name: string;
  short_description?: string;
  full_description?: string;
  category?: string;
  technologies?: string[];
  image_url?: string;
  demo_url?: string;
  repo_url?: string;
  project_date?: string;
  sort_order: number;
}

export interface Comment {
  comment_id: number;
  name: string;
  message: string;
  created_at: string;
}
                                                                                                                                                                                                                                                                                                                                                                                          
export interface Education { education_id: number; institution: string; title: string; start_year: number; end_year: number | null; status: string; }
export interface Language { language_id: number; name: string; level: string; sort_order: number; }

export interface Contact {
  contact_id: number;
  email: string;
  phone: string;
  github_url: string;
  linkedin_url: string;
  public_location: string;
}
