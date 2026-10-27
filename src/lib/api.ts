import { compressImages } from "./compressImage";

// In the browser we call relative "/api/..." paths so requests go to the same
// origin the app is served from — Next.js rewrites() then proxies them to the
// backend. This avoids CORS and stale-IP issues entirely.
// On the server (SSR) we need an absolute URL.
const API_BASE =
  typeof window !== "undefined"
    ? ""
    : (process.env.NEXT_PUBLIC_API_URL || "https://dealspot-backend.onrender.com");

class ApiClient {
  public getToken(): string | null {
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
        headers: { 
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
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

    // Required to bypass ngrok browser warning page for API calls
    headers["ngrok-skip-browser-warning"] = "true";

    let response: Response;
    try {
      response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
      });
    } catch (networkErr: unknown) {
      const msg = networkErr instanceof Error ? networkErr.message : String(networkErr);
      if (msg.includes("Failed to fetch") || msg.includes("NetworkError")) {
        throw new Error(
          "ನೆಟ್‌ವರ್ಕ್ ಸಂಪರ್ಕ ದೋಷ ಅಥವಾ ಫೋಟೋಗಳ ಗಾತ್ರ ಮೀರಿದೆ. ದಯವಿಟ್ಟು ಸಂಪರ್ಕ ಪರಿಶೀಲಿಸಿ ಅಥವಾ ಫೋಟೋಗಳನ್ನು ಕಡಿಮೆ ಮಾಡಿ (Network error or upload failed. Please check connection and try again)"
        );
      }
      throw networkErr;
    }

    // Auth endpoints (login, register, OTP) are public — never trigger the
    // token-refresh / redirect-to-login flow on their errors. Just surface them.
    const isAuthEndpoint = endpoint.startsWith("/api/auth/");

    // If 401/403 on a protected endpoint, try refresh, else redirect to login
    if ((response.status === 401 || response.status === 403) && retry && !isAuthEndpoint) {
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        return this.request<T>(endpoint, options, false);
      }
      this.clearTokens();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      throw new Error("ದಯವಿಟ್ಟು ಮೊದಲು ಲಾಗಿನ್ ಮಾಡಿ (Please login to continue)");
    }

    if (!response.ok) {
      let errorMsg = "";
      try {
        const text = await response.text();
        if (text) {
          try {
            const data = JSON.parse(text);
            if (data.details && typeof data.details === "object") {
              errorMsg = Object.values(data.details).join(", ");
            } else {
              errorMsg = data.message || data.error || (typeof data === "string" ? data : JSON.stringify(data));
            }
          } catch {
            if (text.includes("<html") || text.includes("<!DOCTYPE")) {
              if (response.status === 413) {
                errorMsg = "ಫೋಟೋಗಳ ಗಾತ್ರ ತುಂಬಾ ದೊಡ್ಡದಾಗಿದೆ. ದಯವಿಟ್ಟು ಚಿಕ್ಕ ಫೋಟೋಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ (Upload size too large. Please upload smaller photos)";
              } else if (response.status === 504 || response.status === 502) {
                errorMsg = "ಸರ್ವರ್ ಸಮಯ ಮೀರಿದೆ. ದಯವಿಟ್ಟು ಪುನಃ ಪ್ರಯತ್ನಿಸಿ (Server timed out, please try again)";
              } else {
                errorMsg = `ಸರ್ವರ್ ದೋಷ (${response.status}) (Server error ${response.status})`;
              }
            } else {
              errorMsg = text.slice(0, 250);
            }
          }
        }
      } catch {
        // ignore
      }

      if (!errorMsg) {
        if (response.status === 413) {
          errorMsg = "ಫೋಟೋಗಳ ಗಾತ್ರ ತುಂಬಾ ದೊಡ್ಡದಾಗಿದೆ (Upload size too large)";
        } else if (response.status === 504 || response.status === 502) {
          errorMsg = "ಸರ್ವರ್ ಸಮಯ ಮೀರಿದೆ. ದಯವಿಟ್ಟು ಪುನಃ ಪ್ರಯತ್ನಿಸಿ (Server timed out)";
        } else {
          errorMsg = `ದೋಷ ಸಂಭವಿಸಿದೆ (${response.status}) (Something went wrong: ${response.status})`;
        }
      }

      throw new Error(errorMsg);
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

    // Required to bypass ngrok browser warning page for API calls
    headers["ngrok-skip-browser-warning"] = "true";

    let response: Response;
    try {
      response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
      });
    } catch (networkErr: unknown) {
      const msg = networkErr instanceof Error ? networkErr.message : String(networkErr);
      if (msg.includes("Failed to fetch") || msg.includes("NetworkError")) {
        throw new Error(
          "ನೆಟ್‌ವರ್ಕ್ ಸಂಪರ್ಕ ದೋಷ ಅಥವಾ ಫೋಟೋಗಳ ಗಾತ್ರ ಮೀರಿದೆ. ದಯವಿಟ್ಟು ಸಂಪರ್ಕ ಪರಿಶೀಲಿಸಿ ಅಥವಾ ಫೋಟೋಗಳನ್ನು ಕಡಿಮೆ ಮಾಡಿ (Network error or upload failed. Please check connection and try again)"
        );
      }
      throw networkErr;
    }

    if ((response.status === 401 || response.status === 403) && retry) {
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        return this.requestText(endpoint, options, false);
      }
      this.clearTokens();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      throw new Error("ದಯವಿಟ್ಟು ಮೊದಲು ಲಾಗಿನ್ ಮಾಡಿ (Please login to continue)");
    }

    if (!response.ok) {
      let errorMsg = "";
      try {
        const text = await response.text();
        if (text) {
          try {
            const data = JSON.parse(text);
            if (data.details && typeof data.details === "object") {
              errorMsg = Object.values(data.details).join(", ");
            } else {
              errorMsg = data.message || data.error || (typeof data === "string" ? data : JSON.stringify(data));
            }
          } catch {
            if (text.includes("<html") || text.includes("<!DOCTYPE")) {
              if (response.status === 413) {
                errorMsg = "ಫೋಟೋಗಳ ಗಾತ್ರ ತುಂಬಾ ದೊಡ್ಡದಾಗಿದೆ (Upload size too large)";
              } else if (response.status === 504 || response.status === 502) {
                errorMsg = "ಸರ್ವರ್ ಸಮಯ ಮೀರಿದೆ. ದಯವಿಟ್ಟು ಪುನಃ ಪ್ರಯತ್ನಿಸಿ (Server timed out)";
              } else {
                errorMsg = `ಸರ್ವರ್ ದೋಷ (${response.status}) (Server error ${response.status})`;
              }
            } else {
              errorMsg = text.slice(0, 250);
            }
          }
        }
      } catch {
        // ignore
      }

      if (!errorMsg) {
        if (response.status === 413) {
          errorMsg = "ಫೋಟೋಗಳ ಗಾತ್ರ ತುಂಬಾ ದೊಡ್ಡದಾಗಿದೆ (Upload size too large)";
        } else if (response.status === 504 || response.status === 502) {
          errorMsg = "ಸರ್ವರ್ ಸಮಯ ಮೀರಿದೆ (Server timed out)";
        } else {
          errorMsg = `ದೋಷ ಸಂಭವಿಸಿದೆ (${response.status}) (Something went wrong: ${response.status})`;
        }
      }

      throw new Error(errorMsg);
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
    taluk?: string;
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

  // Sign in / up with a Google ID token obtained in the browser.
  async loginWithGoogle(idToken: string) {
    const res = await this.request<AuthResponseData>("/api/auth/google", {
      method: "POST",
      body: JSON.stringify({ idToken }),
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

  // Email OTP (registration)
  async sendEmailOtp(email: string) {
    return this.request<{ message: string; otp?: string }>("/api/auth/email-otp/send", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  async verifyEmailOtp(email: string, otp: string) {
    return this.request<{ verified: boolean }>("/api/auth/email-otp/verify", {
      method: "POST",
      body: JSON.stringify({ email, otp }),
    });
  }

  // ─── Listings ───────────────────────────────────────────
  // Location-prioritized feed: taluk first, then district, then the rest.
  async getFeed(district?: string | null, taluk?: string | null, page = 0, size = 20) {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    if (district) params.set("district", district);
    if (taluk) params.set("taluk", taluk);
    return this.request<PagedResponse<ListingData>>(`/api/listings/feed?${params}`);
  }

  async getListingsByCategory(category: string, page = 0, size = 20, type?: string) {
    const typeParam = type ? `&type=${encodeURIComponent(type)}` : "";
    return this.request<PagedResponse<ListingData>>(
      `/api/listings/category/${category}?page=${page}&size=${size}${typeParam}`
    );
  }

  async getListingById(id: number) {
    return this.request<ListingData>(`/api/listings/${id}`);
  }

  async getRecentListings() {
    return this.request<ListingData[]>("/api/listings/recent");
  }

  // Listings in the given district (location-based recommendations).
  async getNearbyListings(district: string, page = 0, size = 20) {
    const params = new URLSearchParams({ district, page: String(page), size: String(size) });
    return this.request<PagedResponse<ListingData>>(`/api/listings/nearby?${params}`);
  }

  // ─── Location / Districts ───────────────────────────────
  async getDistricts() {
    return this.request<DistrictOption[]>("/api/districts");
  }

  // Taluks for a district (pass English name or slug).
  async getTaluks(district: string) {
    return this.request<string[]>(`/api/districts/${encodeURIComponent(district)}/taluks`);
  }

  // Persist the signed-in user's preferred district (used to prioritize recommendations).
  async setMyDistrict(district: string) {
    return this.request<{ message: string; district: string }>("/api/users/me/district", {
      method: "PUT",
      body: JSON.stringify({ district }),
    });
  }

  async getMyListings(page = 0, size = 20) {
    return this.request<PagedResponse<ListingData>>(
      `/api/listings/my?page=${page}&size=${size}`
    );
  }

  async createListing(data: Record<string, unknown>, images?: File[]) {
    const formData = new FormData();
    formData.append("data", new Blob([JSON.stringify(data)], { type: "application/json" }));
    if (images && images.length > 0) {
      const compressed = await compressImages(images);
      compressed.forEach((img) => formData.append("images", img));
    }
    return this.request<ListingData>("/api/listings", {
      method: "POST",
      body: formData,
    });
  }

  // Update an existing listing (owner only). If `data.existingImages` (a string
  // URL array) is provided, the final images become existingImages + uploads
  // and removed URLs are deleted on the backend; otherwise new images are just
  // appended.
  async updateListing(id: number, data: Record<string, unknown>, images?: File[]) {
    const formData = new FormData();
    formData.append("data", new Blob([JSON.stringify(data)], { type: "application/json" }));
    if (images && images.length > 0) {
      const compressed = await compressImages(images);
      compressed.forEach((img) => formData.append("images", img));
    }
    return this.request<ListingData>(`/api/listings/${id}`, {
      method: "PUT",
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

  // Upload/replace the user's profile picture. Returns the updated profile.
  async uploadProfileImage(file: File) {
    const fd = new FormData();
    fd.append("image", file);
    return this.request<UserData>("/api/users/me/image", { method: "POST", body: fd });
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
      free: boolean;
      recorded?: boolean; // user has a saved unlock record (free-click or paid)
      phone?: string;
      contact?: {
        name?: string | null;
        mobile?: string | null;
        whatsapp?: string | null;
        fullAddress?: string | null;
      } | null;
    }>(`/api/payments/unlock/check/${listingId}`);
  }

  // Record a FREE unlock so it persists for this user+listing (no payment).
  async freeUnlock(listingId: number) {
    return this.request<{
      unlocked: boolean;
      phone?: string;
      contact?: { name?: string | null; mobile?: string | null; whatsapp?: string | null; fullAddress?: string | null } | null;
    }>(`/api/payments/unlock/free/${listingId}`, { method: "POST" });
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

  // All listings posted by a user (any status), for the admin drill-down.
  async adminGetUserListings(userId: number, page = 0, size = 50) {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    return this.request<PagedResponse<ListingData>>(`/api/admin/users/${userId}/listings?${params}`);
  }

  // Admin force-delete of any listing (bypasses the owner check).
  async adminDeleteListing(listingId: number) {
    return this.request<{ message: string }>(`/api/admin/listings/${listingId}`, { method: "DELETE" });
  }

  async adminGetSettings() {
    return this.request<Record<string, string>>("/api/admin/settings");
  }

  // Public client config flags (no auth). Currently just the agent/referral toggle.
  async getPublicConfig() {
    return this.request<{ referralSystemEnabled: boolean }>("/api/config");
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

  async getActiveBanners() {
    return this.request<BannerResponse[]>("/api/banners/active");
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

  // Replace a banner's image (multipart). Other fields use adminUpdateBanner.
  async adminUpdateBannerImage(id: number, formData: FormData) {
    return this.request<BannerResponse>(`/api/admin/banners/${id}/image`, {
      method: "POST",
      body: formData,
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

  // Restore a taken-down listing back to ACTIVE (within 30 days, CHECKER+).
  async adminRestoreListing(listingId: number) {
    return this.request<{ message: string }>(`/api/admin/listings/${listingId}/restore`, {
      method: "PUT",
    });
  }

  // Take down a live/flagged/pending listing (CHECKER and above).
  async adminTakeDownListing(listingId: number, reason: string) {
    return this.request<{ message: string }>(`/api/admin/listings/${listingId}/takedown`, {
      method: "PUT",
      body: JSON.stringify({ reason }),
    });
  }

  // ─── Reports ────────────────────────────────────────────
  // Any logged-in user can report a listing.
  async reportListing(listingId: number, reason: string, description?: string) {
    return this.request<ReportResponse>("/api/reports", {
      method: "POST",
      body: JSON.stringify({ targetType: "LISTING", targetId: listingId, reason, description }),
    });
  }

  // Moderators view pending reports.
  async adminGetReports(page = 0, size = 20) {
    return this.request<PagedResponse<ReportResponse>>(`/api/admin/reports?page=${page}&size=${size}`);
  }

  // Moderator drill-down for a reported listing: its owner + their reported/all ads.
  async adminGetOwnerOverview(listingId: number) {
    return this.request<UserModerationOverview>(`/api/admin/listings/${listingId}/owner-overview`);
  }

  // Mark a report resolved (removes it from the pending queue).
  async adminResolveReport(reportId: number) {
    return this.request<{ message: string }>(`/api/admin/reports/${reportId}/resolve`, { method: "PUT" });
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

  // ─── Categories (Public) ────────────────────────────────
  async getCategories() {
    return this.request<CategoryPublicResponse[]>("/api/categories");
  }

  // ─── Admin Categories ───────────────────────────────────
  async adminGetCategories() {
    return this.request<AdminCategoryResponse[]>("/api/admin/categories");
  }

  // Upload a category/subcategory image, returns its hosted URL.
  async adminUploadCategoryImage(formData: FormData) {
    return this.request<{ imageUrl: string }>("/api/admin/categories/upload-image", {
      method: "POST",
      body: formData,
    });
  }

  async adminCreateCategory(data: CategoryRequestData) {
    return this.request<AdminCategoryResponse>("/api/admin/categories", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Set the before-unlock (free) and after-unlock (paid) field lists for a category.
  async adminSetFieldVisibility(id: number, freeFields: string[], unlockFields: string[]) {
    return this.request<AdminCategoryResponse>(`/api/admin/categories/${id}/field-visibility`, {
      method: "PUT",
      body: JSON.stringify({ freeFields, unlockFields }),
    });
  }

  async adminUpdateCategory(id: number, data: CategoryRequestData) {
    return this.request<AdminCategoryResponse>(`/api/admin/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async adminDeleteCategory(id: number) {
    return this.request<{ message: string }>(`/api/admin/categories/${id}`, {
      method: "DELETE",
    });
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
  needsOnboarding?: boolean;
}

export interface DistrictOption {
  id: string;      // slug of English name, e.g. "bengaluru-urban"
  name: string;    // Kannada name
  nameEn: string;  // English name
  icon: string;    // emoji
}

export interface ReportResponse {
  id: number;
  reporterId: number;
  targetType: string;
  targetId: number;
  reason: string;
  description?: string;
  status: string;
  createdAt: string;
}

export interface OwnerInfo {
  id: number;
  name: string;
  phone: string;
  email?: string;
  location?: string;
  district?: string;
  role: string;
  banned: boolean;
  banReason?: string;
  createdAt: string;
  totalListings: number;
  activeListings: number;
}

export interface ReportedListingItem {
  listing: ListingData;
  reportCount: number;
  reasons: string[];
}

export interface UserModerationOverview {
  owner: OwnerInfo;
  reportedListings: ReportedListingItem[];
  allListings: ListingData[];
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
  taluk?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  status: string;
  images: string[];
  imagesPurged?: boolean; // images deleted by the 30-day retention job after takedown
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
  details?: string; // JSON string of category-specific attributes (e.g. property)
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
  createdById?: number;
  createdByName?: string;
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

// ─── Category Types ──────────────────────────────────────

export interface CategoryPublicResponse {
  id: number;
  name: string;
  nameEn: string;
  slug: string;
  icon?: string;
  imageUrl?: string;
  color?: string;
  parentId?: number | null;
  isFree?: boolean;
  subcategories: CategoryPublicResponse[];
}

export interface AdminCategoryResponse {
  id: number;
  name: string;
  nameEn: string;
  slug: string;
  icon?: string;
  imageUrl?: string;
  color?: string;
  active: boolean;
  sortOrder: number;
  moderationLevel: string;
  listingCount: number;
  createdAt: string;
  updatedAt?: string;
  parentId?: number | null;
  parentName?: string | null;
  isFree?: boolean;
  unlockPrice?: number | null; // per-category unlock price in PAISE (null = global default)
  visibleFields?: string[] | null; // detail keys buyers may see (null/empty = all) [legacy]
  freeFields?: string[] | null;    // shown before unlock
  unlockFields?: string[] | null;  // shown after unlock
  subcategories: AdminCategoryResponse[];
}

export interface CategoryRequestData {
  name: string;
  nameEn: string;
  slug?: string;
  icon?: string;
  imageUrl?: string;
  color?: string;
  sortOrder?: number;
  active?: boolean;
  moderationLevel?: string;
  parentId?: number | null;
  isFree?: boolean;
  unlockPrice?: number | null; // in PAISE
  visibleFields?: string[] | null; // detail keys buyers may see (null/empty = all)
}
