export interface Client {
  id: string;
  user_id: string | null;
  full_name: string;
  email: string;
  company_name: string | null;
  phone: string | null;
  cnpj: string | null;
  regime: string | null;
  created_at: string;
}

export interface Project {
  id: string;
  client_id: string;
  title: string;
  description: string | null;
  status: string;
  current_regime: string | null;
  target_regime: string | null;
  annual_revenue: number | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  clients?: Client;
}

export interface ProjectStep {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: string;
  order_index: number;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface ProjectEvent {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  event_date: string;
  event_type: string;
  created_at: string;
}

export interface ProjectTask {
  id: string;
  step_id: string;
  project_id: string;
  title: string;
  status: string;
  due_date: string | null;
  action: string | null;
  result: string | null;
  exclusions: string | null;
  methodology: string | null;
  order_index: number;
  created_at: string;
}

export interface ProjectFile {
  id: string;
  project_id: string;
  file_name: string;
  file_path: string;
  file_type: string | null;
  file_size: number | null;
  created_at: string;
}
