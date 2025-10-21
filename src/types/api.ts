export interface User {
  id: string;
  username: string;
  email: string;
  full_name?: string;
  profile_picture_url?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  user_id: string;
  website?: string;
  location?: string;
  updated_at: string;
}

export interface Asset {
  id: string;
  creator_id: string;
  file_name: string;
  file_url: string;
  file_format: 'glb' | 'gltf' | 'obj';
  preview_url?: string;
  thumbnail_url?: string;
  downloads: number;
  likes: number;
  description?: string;
  created_at: string;
  updated_at: string;
  is_public: boolean;
  creator?: User;
  tags?: string[];
  metadata?: Record<string, string>;
  user_liked?: boolean;
}

export interface AssetFilter {
  search?: string;
  tags?: string[];
  file_format?: string[];
  creator_id?: string;
  sort?: 'created_at' | 'likes' | 'downloads' | 'name';
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface Comment {
  id: string;
  asset_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user?: User;
}

export interface Like {
  id: number;
  asset_id: string;
  user_id: string;
  created_at: string;
}

export interface AssetDownload {
  id: number;
  asset_id: string;
  user_id?: string;
  downloaded_at: string;
}