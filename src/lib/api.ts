const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://dealspot-backend.onrender.com";

class ApiClient {
  private getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("dealspot_token");
  }

  private getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("dealspot_refresh_token");
  }

  private setTokens(access: string, refresh: string) {
    localStorage.setItem("dealspot_token", access);
    localStorage.setItem("dealspot_refresh_token", refresh);
  }

  private clearTokens() {
    localStorage.removeItem("dealspot_token");
    localStorage.removeItem("dealspot_refresh_token");
    localStorage.removeItem("dealspot_user");
  }

  private async refreshAccessToken(): Promise<boolean> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return false;

    try {
      const response = await fetch(`${API_BASE}/api/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        this.clearTokens();
        return false;
      }

      const data = await response.json();
      this.setTokens(data.token, data.refreshToken);
      return true;
    } catch {
      this.clearTokens();
      return false;
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}, retry = true): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    // If 401 and we have a refresh token, try to refresh
    if (response.status === 401 && retry) {
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        return this.request<T>(endpoint, options, false);
      }
      // Redirect to login
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      throw new Error("Session expired. Please login again.");
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Request failed" }));
      throw new Error(error.error || "Something went wrong");
    }

    return response.json();
  }

  private async requestText(endpoint: string, options: RequestInit = {}, retry = true): Promise<string> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401 && retry) {
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        return this.requestText(endpoint, options, false);
      }
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      throw new Error("Session expired. Please login again.");
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Request failed" }));
      throw new Error(error.error || "Something went wrong");
    }

    return response.text();
  }

  // ─── Auth ───────────────────────────────────────────────
  async register(data: {
    phone: string;
    password: string;
    name: string;
    email?: string;
    location?: string;
    district?: string;
    recaptchaToken?: string;
  }) {
    const res = await this.request<AuthResponseData>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
    this.setTokens(res.token, res.refreshToken);
    return res;
  }

  async login(phone: string, password: string, recaptchaToken?: string) {
    const res = await this.request<AuthResponseData>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ phone, password, recaptchaToken }),
    });
    this.setTokens(res.token, res.refreshToken);
    return res;
  }

  async logout() {
    try {
      await this.request("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    this.clearTokens();
  }

  // OTP
  async sendOtp(phone: string) {
    return this.request<{ message: string; otp?: string }>("/api/auth/otp/send", {
      method: "POST",
      body: JSON.stringify({ phone }),
    });
  }

  async verifyOtp(phone: string, otp: string) {
    return this.request<{ verified: boolean }>("/api/auth/otp/verify", {
      method: "POST",
      body: JSON.stringify({ phone, otp }),
    });
  }

  // ─── Listings ───────────────────────────────────────────
  async getListingsByCategory(category: string, page = 0, size = 20) {
    return this.request<PagedResponse<ListingData>>(
      `/api/listings/category/${category}?page=${page}&size=${size}`
    );
  }

  async getListingById(id: number) {
    return this.request<ListingData>(`/api/listings/${id}`);
  }

  async getRecentListings() {
    return this.request<ListingData[]>("/api/listings/recent");
  }

  async getMyListings(page = 0, size = 20) {
    return this.request<PagedResponse<ListingData>>(
      `/api/listings/my?page=${page}&size=${size}`
    );
  }

  async createListing(data: Record<string, unknown>, images?: File[]) {
    const formData = new FormData();
    formData.append("data", new Blob([JSON.stringify(data)], { type: "application/json" }));
    if (images) {
      images.forEach((img) => formData.append("images", img));
    }
    return this.request<ListingData>("/api/listings", {
      method: "POST",
      body: formData,
    });
  }

  async deleteListing(id: number) {
    return this.request<{ message: string }>(`/api/listings/${id}`, {
      method: "DELETE",
    });
  }

  // ─── Search ─────────────────────────────────────────────
  async search(query: string, category?: string, page = 0, size = 20) {
    const params = new URLSearchParams({ q: query, page: String(page), size: String(size) });
    if (category) params.set("category", category);
    return this.request<PagedResponse<ListingData>>(`/api/search?${params}`);
  }

  // ─── Favorites ──────────────────────────────────────────
  async getFavorites(page = 0, size = 20) {
    return this.request<PagedResponse<ListingData>>(
      `/api/favorites?page=${page}&size=${size}`
    );
  }

  async addFavorite(listingId: number) {
    return this.request<{ message: string }>(`/api/favorites/${listingId}`, {
      method: "POST",
    });
  }

  async removeFavorite(listingId: number) {
    return this.request<{ message: string }>(`/api/favorites/${listingId}`, {
      method: "DELETE",
    });
  }

  // ─── User ──────────────────────────────────────────────
  async getProfile() {
    return this.request<UserData>("/api/users/me");
  }

  async updateProfile(data: Record<string, string>) {
    return this.request<UserData>("/api/users/me", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // ─── Payments (Razorpay) ────────────────────────────────
  async createUnlockOrder(listingId: number) {
    return this.request<{
      orderId: string;
      amount: number;
      currency: string;
      keyId: string;
    }>(`/api/payments/unlock/${listingId}`, { method: "POST" });
  }

  async verifyPayment(data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) {
    return this.request<{
      message: string;
      phone: string;
      sellerName: string;
    }>("/api/payments/verify", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async checkUnlock(listingId: number) {
    return this.request<{
      unlocked: boolean;
      phone?: string;
    }>(`/api/payments/unlock/check/${listingId}`);
  }

  // ─── Health ─────────────────────────────────────────────
  async health() {
    return this.request<{ status: string }>("/api/health");
  }

  // ─── Admin ──────────────────────────────────────────────
  async adminDashboard() {
    return this.request<DashboardStats>("/api/admin/stats/dashboard");
  }

  async adminModerationQueue(page = 0, size = 20) {
    return this.request<PagedResponse<ListingData>>(`/api/admin/moderation/queue?page=${page}&size=${size}`);
  }

  async adminApproveListing(listingId: number) {
    return this.request<{ message: string }>(`/api/admin/moderation/${listingId}/approve`, { method: "PUT" });
  }

  async adminRejectListing(listingId: number, reason: string) {
    return this.request<{ message: string }>(`/api/admin/moderation/${listingId}/reject`, { method: "PUT", body: JSON.stringify({ reason }) });
  }

  async adminFlagListing(listingId: number) {
    return this.request<{ message: string }>(`/api/admin/moderation/${listingId}/flag`, { method: "PUT" });
  }

  async adminGetUsers(page = 0, size = 20, search?: string) {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    if (search) params.set("search", search);
    return this.request<PagedResponse<AdminUserResponse>>(`/api/admin/users?${params}`);
  }

  async adminBanUser(userId: number, reason: string) {
    return this.request<{ message: string }>(`/api/admin/users/${userId}/ban`, { method: "PUT", body: JSON.stringify({ reason }) });
  }

  async adminUnbanUser(userId: number) {
    return this.request<{ message: string }>(`/api/admin/users/${userId}/unban`, { method: "PUT" });
  }

  async adminChangeRole(userId: number, role: string) {
    return this.request<{ message: string }>(`/api/admin/users/${userId}/role`, { method: "PUT", body: JSON.stringify({ role }) });
  }

  async adminGetSettings() {
    return this.request<Record<string, string>>("/api/admin/settings");
  }

  async adminUpdateSettings(settings: Record<string, string>) {
    return this.request<{ message: string }>("/api/admin/settings", { method: "PUT", body: JSON.stringify(settings) });
  }

  async adminRevenue(from: string, to: string) {
    const params = new URLSearchParams({ from, to });
    return this.request<RevenueStats>(`/api/admin/stats/revenue?${params}`);
  }

  async adminTransactions(page = 0, size = 20, from?: string, to?: string) {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    return this.request<PagedResponse<TransactionData>>(`/api/admin/stats/transactions?${params}`);
  }

  async adminBanners() {
    return this.request<BannerResponse[]>("/api/admin/banners");
  }

  async adminCreateBanner(data: CreateBannerRequest) {
    return this.request<BannerResponse>("/api/admin/banners", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async adminCreateBannerUpload(formData: FormData) {
    return this.request<BannerResponse>("/api/admin/banners/upload", {
      method: "POST",
      body: formData,
    });
  }

  async adminUpdateBanner(id: number, data: Partial<CreateBannerRequest>) {
    return this.request<BannerResponse>(`/api/admin/banners/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async adminDeleteBanner(id: number) {
    return this.request<{ message: string }>(`/api/admin/banners/${id}`, {
      method: "DELETE",
    });
  }

  async adminAuditLogs(page = 0, size = 20, action?: string, from?: string, to?: string) {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    if (action) params.set("action", action);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    return this.request<PagedResponse<AuditLogEntry>>(`/api/admin/audit?${params}`);
  }

  async adminModerationStats() {
    return this.request<ModerationStats>("/api/admin/moderation/stats");
  }

  async adminFeatureListing(listingId: number) {
    return this.request<{ message: string }>(`/api/admin/listings/${listingId}/feature`, { method: "PUT" });
  }

  async adminUnfeatureListing(listingId: number) {
    return this.request<{ message: string }>(`/api/admin/listings/${listingId}/unfeature`, { method: "PUT" });
  }

  async adminExportRevenue(from: string, to: string) {
    const params = new URLSearchParams({ from, to });
    return this.requestText(`/api/admin/stats/revenue/export?${params}`);
  }

  async adminExportRevenueCsv(from: string, to: string): Promise<Blob> {
    const token = this.getToken();
    const response = await fetch(`${API_BASE}/api/admin/stats/revenue/export?from=${from}&to=${to}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error("Export failed");
    return response.blob();
  }

  async adminSearchUsers(page = 0, size = 20, search?: string) {
    return this.adminGetUsers(page, size, search);
  }

  // ─── Notifications ──────────────────────────────────────
  async getNotifications(page = 0, size = 20) {
    return this.request<PagedResponse<NotificationData>>(`/api/notifications?page=${page}&size=${size}`);
  }

  async getUnreadNotificationCount() {
    return this.request<{ count: number }>("/api/notifications/unread-count");
  }

  async markAllNotificationsRead() {
    return this.request<{ message: string }>("/api/notifications/read-all", { method: "PUT" });
  }

  // ─── Payments (Public) ──────────────────────────────────
  async getUnlockPrice() {
    return this.request<{ amount: number; currency: string }>("/api/payments/unlock-price");
  }
}

export const api = new ApiClient();

// ─── Types ──────────────────────────────────────────────
export interface AuthResponseData {
  token: string;
  refreshToken: string;
  type: string;
  userId: number;
  name: string;
  phone: string;
}

export interface ListingData {
  id: number;
  title: string;
  titleEn?: string;
  description?: string;
  category: string;
  price?: number;
  priceUnit?: string;
  location?: string;
  district?: string;
  status: string;
  images: string[];
  viewCount: number;
  createdAt: string;
  breed?: string;
  age?: string;
  condition?: string;
  hp?: string;
  area?: string;
  skill?: string;
  experience?: string;
  vehicleType?: string;
  rateInfo?: string;
  sellerId: number;
  sellerName?: string;
  sellerLocation?: string;
}

export interface UserData {
  id: number;
  phone: string;
  email?: string;
  name: string;
  location?: string;
  district?: string;
  profileImage?: string;
  role?: string;
  createdAt: string;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// ─── Admin Types ──────────────────────────────────────────

export interface DashboardStats {
  totalUsers: number;
  totalListings: number;
  activeListings: number;
  pendingModeration: number;
  totalRevenue: number;
  todayRevenue: number;
  monthRevenue: number;
  totalUnlocks: number;
  todayUnlocks: number;
  conversionRate: number;
}

export interface RevenueStats {
  totalRevenue: number;
  dailyRevenue: { date: string; amount: number }[];
  categoryBreakdown: { category: string; amount: number; count: number }[];
  failedPayments: number;
  refundedPayments: number;
}

export interface TransactionData {
  id: number;
  userId: number;
  userName: string;
  listingId: number;
  listingTitle: string;
  amount: number;
  status: string;
  purpose: string;
  createdAt: string;
  paidAt?: string;
}

export interface BannerResponse {
  id: number;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  link?: string;
  color?: string;
  active: boolean;
  startDate?: string;
  endDate?: string;
  createdAt: string;
}

export interface CreateBannerRequest {
  title: string;
  subtitle?: string;
  imageUrl?: string;
  link?: string;
  color?: string;
  active: boolean;
  startDate?: string;
  endDate?: string;
}

export interface AuditLogEntry {
  id: number;
  actorId: number;
  actorName?: string;
  action: string;
  targetType: string;
  targetId?: number;
  details?: string;
  createdAt: string;
}

export interface ModerationStats {
  pendingCount: number;
  approvedToday: number;
  rejectedToday: number;
}

export interface AdminUserResponse {
  id: number;
  phone: string;
  name: string;
  email?: string;
  location?: string;
  district?: string;
  role: string;
  banned: boolean;
  banReason?: string;
  listingCount: number;
  createdAt: string;
}

export interface NotificationData {
  id: number;
  title: string;
  message: string;
  type?: string;
  read: boolean;
  createdAt: string;
}
