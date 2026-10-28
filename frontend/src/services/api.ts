const API_BASE = (import.meta.env.VITE_API_URL !== undefined && import.meta.env.VITE_API_URL !== '')
  ? import.meta.env.VITE_API_URL
  : (import.meta.env.DEV ? 'http://localhost:3001' : '');

export class ApiClient {
  private static getToken(): string | null {
    return localStorage.getItem('aether_token');
  }

  static setToken(token: string) {
    localStorage.setItem('aether_token', token);
  }

  static clearToken() {
    localStorage.removeItem('aether_token');
  }

  private static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error: any = new Error(data.error || 'An unexpected error occurred');
      error.code = data.code;
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data as T;
  }

  // Health
  static async getHealth() {
    return this.request<{ status: string; timestamp: string }>('/health');
  }

  // Identity & Auth
  static async exchangeToken(payload: {
    supabase_token?: string;
    email?: string;
    full_name?: string;
    avatar_url?: string;
    org_id?: string;
  }) {
    return this.request<{
      needs_onboarding: boolean;
      token: string;
      user: any;
      memberships: any[];
      active_org?: any;
    }>('/identity/exchange', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  static async login(email: string, password: string, target_role: 'creator' | 'business' = 'creator') {
    return this.request<{
      needs_onboarding: boolean;
      token: string;
      user: any;
      memberships: any[];
      active_org?: any;
    }>('/identity/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, target_role }),
    });
  }

  static async signup(email: string, password: string, full_name?: string, target_role: 'creator' | 'business' = 'creator') {
    return this.request<{
      needs_onboarding: boolean;
      token: string;
      user: any;
      memberships: any[];
      active_org?: any;
    }>('/identity/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, full_name, target_role }),
    });
  }

  static async bootstrapWorkspace(org_name: string, plan: 'free' | 'pro' | 'enterprise') {
    return this.request<{
      success: boolean;
      token: string;
      active_org: any;
      org: any;
    }>('/identity/bootstrap', {
      method: 'POST',
      body: JSON.stringify({ org_name, plan }),
    });
  }

  static async switchOrganization(org_id: string) {
    return this.request<{
      success: boolean;
      token: string;
      active_org: any;
    }>('/identity/switch', {
      method: 'POST',
      body: JSON.stringify({ org_id }),
    });
  }

  // Resource CRUD
  static async getResource<T = any>(resource: string, params: Record<string, any> = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, String(val));
      }
    });
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return this.request<{ data: T; count?: number }>(`/api/${resource}${queryString}`);
  }

  static async writeResource<T = any>(resource: string, payload: {
    op: 'create' | 'update' | 'delete';
    id?: string;
    data?: any;
  }) {
    return this.request<{ success: boolean; data: T; approval?: any; asset?: any }>(`/api/${resource}`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // RAG
  static async ingestGuidelines(brand_kit_id: string, guidelines_text: string) {
    return this.request<{ success: boolean; message: string; chunks_count: number }>('/rag/ingest', {
      method: 'POST',
      body: JSON.stringify({ brand_kit_id, guidelines_text }),
    });
  }

  static async retrieveGuidelines(query: string, limit?: number) {
    return this.request<{
      chunks: Array<{ id: string; content: string; similarity: number; chunk_index: number }>;
      top_similarity: number;
      gap: number;
      confident: boolean;
    }>('/rag/retrieve', {
      method: 'POST',
      body: JSON.stringify({ query, limit }),
    });
  }

  // Generate
  static async generateAsset(payload: {
    prompt: string;
    platform: string;
    audience?: string;
    style?: string;
  }) {
    return this.request<{
      ok: boolean;
      prompt: string;
      image_prompt?: string;
      platform: string;
      style?: string;
      image: string;
      gen_width: number;
      gen_height: number;
      understanding?: {
        intent?: string;
        subject?: string;
        composition?: string;
        palette?: string[];
        mood?: string;
        avoid?: string[];
        image_prompt?: string;
        negative_prompt?: string;
      };
      sources?: Array<{ id?: string; content: string; similarity: number }>;
      confident?: boolean;
      top_similarity?: number;
      gap?: number;
    }>('/generate', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Edit Created Image with Prompt
  static async editAssetWithPrompt(payload: {
    original_prompt: string;
    edit_instruction: string;
    platform?: string;
    style?: string;
  }) {
    return this.request<{
      ok: boolean;
      prompt: string;
      edit_instruction?: string;
      image_prompt?: string;
      platform: string;
      style?: string;
      image: string;
      gen_width: number;
      gen_height: number;
      understanding?: {
        intent?: string;
        subject?: string;
        composition?: string;
        palette?: string[];
        mood?: string;
        avoid?: string[];
        image_prompt?: string;
        negative_prompt?: string;
      };
    }>('/generate/edit', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Support
  static async chatSupport(payload: {
    messages: Array<{ role: 'user' | 'assistant'; content: string }>;
    role?: string;
    plan?: string;
    currentPage?: string;
  }) {
    return this.request<{ reply: string; should_escalate: boolean }>('/support/chat', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  static async submitTicket(payload: {
    name: string;
    email: string;
    topic: string;
    subject: string;
    message: string;
    chat_transcript?: any;
  }) {
    return this.request<{ success: boolean; ticket_id: string; message: string }>('/support/ticket', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Social
  static async generateCaptions(prompt: string, brandName?: string, tone?: string, wordCount?: number | string, format?: string) {
    return this.request<{
      success: boolean;
      variants: { punchy: string; story: string; value: string };
    }>('/social/captions', {
      method: 'POST',
      body: JSON.stringify({ prompt, brandName, tone, wordCount, format }),
    });
  }

  static async postInstagram(imageUrl: string, caption: string, accountName?: string) {
    return this.request<{
      success: boolean;
      post_id: string;
      permalink: string;
      published_at: string;
      account: string;
      caption_preview: string;
    }>('/social/post-instagram', {
      method: 'POST',
      body: JSON.stringify({ imageUrl, caption, accountName }),
    });
  }
}
