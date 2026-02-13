export interface SiteSetting {
  id: string;
  key: string;
  value: unknown;
  created_at: string;
  updated_at: string;
}

export interface MediaItem {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string | null;
  file_size: number | null;
  alt_text: string | null;
  tags: string[];
  created_at: string;
}
