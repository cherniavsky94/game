import { CharacterData, CreateCharacterRequest } from 'shared';
import { SupabaseClient } from './SupabaseClient';

export class CharacterService {
  private static instance: CharacterService;
  private supabase: SupabaseClient;
  private apiUrl: string;

  private constructor() {
    this.supabase = SupabaseClient.getInstance();
    // Prefer explicit VITE_API_URL (set in client/.env) so CI/dev overrides work
    const envApi = (import.meta.env as any).VITE_API_URL as string | undefined;
    if (envApi) {
      // ensure it ends with /api
      this.apiUrl = envApi.endsWith('/api') ? envApi : envApi.replace(/\/$/, '') + '/api';
    } else if (
      window.location.hostname.includes('gitpod.dev') ||
      window.location.hostname.includes('gitpod.io')
    ) {
      // Gitpod environment - attempt to reach backend via external host
      const baseUrl = window.location.origin;
      this.apiUrl = baseUrl.replace('3000--', '2567--') + '/api';
    } else {
      // Use relative path so Vite dev server proxy can forward requests to backend
      this.apiUrl = '/api';
    }

    console.log('API URL:', this.apiUrl);
  }

  static getInstance(): CharacterService {
    if (!CharacterService.instance) {
      CharacterService.instance = new CharacterService();
    }
    return CharacterService.instance;
  }

  private async getAuthToken(): Promise<string> {
    const session = await this.supabase.getSession();
    if (!session) {
      throw new Error('Not authenticated');
    }
    return session.access_token;
  }

  async getCharacters(): Promise<CharacterData[]> {
    try {
      const token = await this.getAuthToken();

      const response = await fetch(`${this.apiUrl}/characters`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch characters');
      }

      return await response.json();
    } catch (error) {
      console.error('Get characters error:', error);
      throw error;
    }
  }

  async createCharacter(request: CreateCharacterRequest): Promise<CharacterData> {
    try {
      const token = await this.getAuthToken();

      const response = await fetch(`${this.apiUrl}/characters`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create character');
      }

      return await response.json();
    } catch (error) {
      console.error('Create character error:', error);
      throw error;
    }
  }

  async getCharacter(id: string): Promise<CharacterData> {
    try {
      const token = await this.getAuthToken();

      const response = await fetch(`${this.apiUrl}/characters/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch character');
      }

      return await response.json();
    } catch (error) {
      console.error('Get character error:', error);
      throw error;
    }
  }
}
