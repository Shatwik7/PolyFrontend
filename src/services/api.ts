import { Asset, AssetFilter, User, Comment } from '@/types/api';
import { mockAssets, mockUsers, mockComments } from './mockData';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class ApiService {
  private currentUser: User | null = null;
  private userLikes: Set<string> = new Set();

  // Authentication
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    await delay(1000);
    const user = mockUsers.find(u => u.email === email);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    this.currentUser = user;
    return { user, token: 'mock-jwt-token' };
  }

  async register(userData: Partial<User> & { password: string }): Promise<{ user: User; token: string }> {
    await delay(1000);
    const newUser: User = {
      id: Date.now().toString(),
      username: userData.username!,
      email: userData.email!,
      full_name: userData.full_name || '',
      profile_picture_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.username}`,
      bio: userData.bio || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    mockUsers.push(newUser);
    this.currentUser = newUser;
    return { user: newUser, token: 'mock-jwt-token' };
  }

  async logout(): Promise<void> {
    await delay(500);
    this.currentUser = null;
    this.userLikes.clear();
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  // Assets
  async getAssets(filters: AssetFilter = {}): Promise<{ assets: Asset[]; total: number }> {
    await delay(800);
    let filteredAssets = [...mockAssets];

    // Apply filters
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredAssets = filteredAssets.filter(asset =>
        asset.file_name.toLowerCase().includes(searchTerm) ||
        asset.description?.toLowerCase().includes(searchTerm) ||
        asset.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    if (filters.tags && filters.tags.length > 0) {
      filteredAssets = filteredAssets.filter(asset =>
        asset.tags?.some(tag => filters.tags!.includes(tag))
      );
    }

    if (filters.file_format && filters.file_format.length > 0) {
      filteredAssets = filteredAssets.filter(asset =>
        filters.file_format!.includes(asset.file_format)
      );
    }

    if (filters.creator_id) {
      filteredAssets = filteredAssets.filter(asset =>
        asset.creator_id === filters.creator_id
      );
    }

    // Apply sorting
    if (filters.sort) {
      filteredAssets.sort((a, b) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let aValue: any, bValue: any;
        switch (filters.sort) {
          case 'likes':
            aValue = a.likes;
            bValue = b.likes;
            break;
          case 'downloads':
            aValue = a.downloads;
            bValue = b.downloads;
            break;
          case 'name':
            aValue = a.file_name;
            bValue = b.file_name;
            break;
          default:
            aValue = new Date(a.created_at);
            bValue = new Date(b.created_at);
        }

        if (filters.order === 'asc') {
          return aValue > bValue ? 1 : -1;
        }
        return aValue < bValue ? 1 : -1;
      });
    }

    // Add user_liked flag
    const assetsWithLikes = filteredAssets.map(asset => ({
      ...asset,
      user_liked: this.userLikes.has(asset.id)
    }));

    // Pagination
    const page = filters.page || 1;
    const limit = filters.limit || 12;
    const start = (page - 1) * limit;
    const paginatedAssets = assetsWithLikes.slice(start, start + limit);

    return {
      assets: paginatedAssets,
      total: filteredAssets.length
    };
  }

  async getAsset(id: string): Promise<Asset> {
    await delay(500);
    const asset = mockAssets.find(a => a.id === id);
    if (!asset) {
      throw new Error('Asset not found');
    }
    return {
      ...asset,
      user_liked: this.userLikes.has(asset.id)
    };
  }

  async likeAsset(assetId: string): Promise<void> {
    await delay(300);
    if (!this.currentUser) {
      throw new Error('Authentication required');
    }
    
    const asset = mockAssets.find(a => a.id === assetId);
    if (!asset) {
      throw new Error('Asset not found');
    }

    if (this.userLikes.has(assetId)) {
      this.userLikes.delete(assetId);
      asset.likes--;
    } else {
      this.userLikes.add(assetId);
      asset.likes++;
    }
  }

  async downloadAsset(assetId: string): Promise<string> {
    await delay(500);
    if (!this.currentUser) {
      throw new Error('Authentication required');
    }

    const asset = mockAssets.find(a => a.id === assetId);
    if (!asset) {
      throw new Error('Asset not found');
    }

    asset.downloads++;
    return asset.file_url;
  }

  // Comments
  async getComments(assetId: string): Promise<Comment[]> {
    await delay(400);
    return mockComments.filter(c => c.asset_id === assetId);
  }

  async addComment(assetId: string, content: string): Promise<Comment> {
    await delay(600);
    if (!this.currentUser) {
      throw new Error('Authentication required');
    }

    const newComment: Comment = {
      id: Date.now().toString(),
      asset_id: assetId,
      user_id: this.currentUser.id,
      content,
      created_at: new Date().toISOString(),
      user: this.currentUser
    };

    mockComments.push(newComment);
    return newComment;
  }

  // Users
  async getUser(id: string): Promise<User> {
    await delay(400);
    const user = mockUsers.find(u => u.id === id);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async updateProfile(userData: Partial<User>): Promise<User> {
    await delay(800);
    if (!this.currentUser) {
      throw new Error('Authentication required');
    }

    const updatedUser = {
      ...this.currentUser,
      ...userData,
      updated_at: new Date().toISOString()
    };

    // Update in mock data
    const userIndex = mockUsers.findIndex(u => u.id === this.currentUser!.id);
    if (userIndex !== -1) {
      mockUsers[userIndex] = updatedUser;
    }

    this.currentUser = updatedUser;
    return updatedUser;
  }
}

export const apiService = new ApiService();