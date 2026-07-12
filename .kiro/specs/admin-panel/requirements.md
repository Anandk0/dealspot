# Admin Panel & Authorization System — Requirements

## Overview

Deal Spot needs a complete admin system to operate as a real business. This covers role-based access control (RBAC), a moderation workflow, revenue tracking, analytics dashboard, and platform management capabilities.

---

## 1. Role-Based Access Control (RBAC)

### 1.1 Roles

| Role | Description | Assigned by |
|------|-------------|-------------|
| `SUPER_ADMIN` | Platform owner. Full access. Can manage other admins. | Seeded in DB or self-assigned first user |
| `ADMIN` | Manages platform day-to-day. Revenue, users, settings. | SUPER_ADMIN |
| `CHECKER` | Moderator. Reviews listings before they go live. | ADMIN or SUPER_ADMIN |
| `USER` | Normal marketplace user (buyer/seller). | Self-registration |

### 1.2 Permission Matrix

| Action | USER | CHECKER | ADMIN | SUPER_ADMIN |
|--------|------|---------|-------|-------------|
| Browse/search listings | ✅ | ✅ | ✅ | ✅ |
| Create own listing | ✅ | ✅ | ✅ | ✅ |
| Edit/delete own listing | ✅ | ✅ | ✅ | ✅ |
| Unlock contacts (pay ₹50) | ✅ | ✅ | ✅ | ✅ |
| View moderation queue | ❌ | ✅ | ✅ | ✅ |
| Approve/reject listings | ❌ | ✅ | ✅ | ✅ |
| Flag/suspend listings | ❌ | ✅ | ✅ | ✅ |
| View all users | ❌ | ❌ | ✅ | ✅ |
| Ban/suspend users | ❌ | ❌ | ✅ | ✅ |
| View revenue/transactions | ❌ | ❌ | ✅ | ✅ |
| Post platform ads/promotions | ❌ | ❌ | ✅ | ✅ |
| Manage categories/settings | ❌ | ❌ | ✅ | ✅ |
| Assign roles (checker, admin) | ❌ | ❌ | ❌ | ✅ |
| View system logs/audit trail | ❌ | ❌ | ❌ | ✅ |

### 1.3 Requirements

- REQ-AUTH-01: System must support 4 roles: SUPER_ADMIN, ADMIN, CHECKER, USER
- REQ-AUTH-02: All admin/checker endpoints must verify role before execution
- REQ-AUTH-03: Role assignment can only be done by SUPER_ADMIN
- REQ-AUTH-04: A seed script must create the first SUPER_ADMIN account on first deploy
- REQ-AUTH-05: Users cannot escalate their own role

---

## 2. Listing Moderation Workflow

### 2.1 Flow

```
User creates listing → Status: PENDING
    → CHECKER reviews → Approve → Status: ACTIVE (visible to public)
    → CHECKER reviews → Reject (with reason) → Status: REJECTED
    → CHECKER reviews → Flag (suspicious) → Status: FLAGGED (hidden, escalated)
```

### 2.2 Requirements

- REQ-MOD-01: New listings default to PENDING status (not ACTIVE)
- REQ-MOD-02: Only CHECKER/ADMIN/SUPER_ADMIN can change listing status
- REQ-MOD-03: Rejection must include a reason (shown to the user)
- REQ-MOD-04: Flagged listings are escalated to ADMIN for final decision
- REQ-MOD-05: Users are notified when listing is approved/rejected
- REQ-MOD-06: Moderation queue shows oldest-first (FIFO)
- REQ-MOD-07: Checker dashboard shows: pending count, approved today, rejected today

---

## 3. Revenue & Analytics Dashboard

### 3.1 Revenue Tracking

- REQ-REV-01: Dashboard shows total revenue (today, this week, this month, this year, all time)
- REQ-REV-02: Revenue breakdown by category
- REQ-REV-03: Transaction history with filters (date range, status, user)
- REQ-REV-04: Failed/refunded payments tracked separately
- REQ-REV-05: Export revenue data as CSV

### 3.2 Platform Analytics

- REQ-ANA-01: Total registered users (with daily growth)
- REQ-ANA-02: Total active listings (by category)
- REQ-ANA-03: Total page views / impressions (daily/monthly)
- REQ-ANA-04: Total contact unlocks (conversion metric)
- REQ-ANA-05: Top searched keywords
- REQ-ANA-06: Category-wise listing distribution
- REQ-ANA-07: User activity (new registrations per day/week)
- REQ-ANA-08: Geographic distribution of users (by district)

### 3.3 KPI Cards (Dashboard Home)

| KPI | Description |
|-----|-------------|
| Today's Revenue | Sum of today's successful payments |
| Total Users | Count of registered users |
| Active Listings | Count of ACTIVE status listings |
| Pending Moderation | Count of PENDING listings |
| Total Unlocks (month) | Contact unlocks this month |
| Conversion Rate | Unlocks / total detail page views |

---

## 4. User Management

### 4.1 Requirements

- REQ-USR-01: Admin can view all users (paginated, searchable)
- REQ-USR-02: Admin can view user details (profile, listings, transactions)
- REQ-USR-03: Admin can ban/suspend a user (with reason)
- REQ-USR-04: Banned user cannot login or create listings
- REQ-USR-05: Admin can unban a user
- REQ-USR-06: SUPER_ADMIN can promote user to CHECKER or ADMIN
- REQ-USR-07: SUPER_ADMIN can demote ADMIN/CHECKER back to USER
- REQ-USR-08: User ban triggers revocation of all their refresh tokens

---

## 5. Platform Ads & Promotions

### 5.1 Requirements

- REQ-ADS-01: Admin can create "featured" listings (promoted/sticky at top)
- REQ-ADS-02: Admin can create platform banners (shown on home page carousel)
- REQ-ADS-03: Banners have: title, subtitle, image, link, start/end date
- REQ-ADS-04: Featured listings have a "promoted" badge in search results
- REQ-ADS-05: Admin can post listings on behalf of the platform (no seller phone needed)

---

## 6. System Settings

### 6.1 Requirements

- REQ-SET-01: Admin can change contact unlock price (currently ₹50)
- REQ-SET-02: Admin can enable/disable categories
- REQ-SET-03: Admin can set max images per listing
- REQ-SET-04: Admin can configure listing expiry duration (default 30 days)
- REQ-SET-05: Admin can toggle maintenance mode

---

## 7. Audit Trail

### 7.1 Requirements

- REQ-AUD-01: Log all admin actions (who did what, when)
- REQ-AUD-02: Log all moderation decisions (listing ID, checker, action, reason, timestamp)
- REQ-AUD-03: Log all role changes
- REQ-AUD-04: Log all ban/unban actions
- REQ-AUD-05: Audit logs are immutable (append-only)
- REQ-AUD-06: Only SUPER_ADMIN can view audit logs

---

## 8. Admin Panel Frontend

### 8.1 Pages Required

| Page | Role Access |
|------|-------------|
| Admin Login (separate route) | All admin roles |
| Dashboard (KPIs + charts) | ADMIN, SUPER_ADMIN |
| Moderation Queue | CHECKER, ADMIN, SUPER_ADMIN |
| Listing Detail (with approve/reject buttons) | CHECKER, ADMIN, SUPER_ADMIN |
| All Listings (manage) | ADMIN, SUPER_ADMIN |
| Users List | ADMIN, SUPER_ADMIN |
| User Detail (ban/promote) | ADMIN, SUPER_ADMIN |
| Revenue & Transactions | ADMIN, SUPER_ADMIN |
| Banners / Promotions | ADMIN, SUPER_ADMIN |
| Settings | SUPER_ADMIN |
| Audit Logs | SUPER_ADMIN |
| Role Management | SUPER_ADMIN |

### 8.2 UI Requirements

- REQ-UI-01: Admin panel at `/admin` route (same frontend, different layout)
- REQ-UI-02: Admin sidebar with navigation
- REQ-UI-03: Tables with pagination, sorting, search
- REQ-UI-04: KPI cards with sparkline charts
- REQ-UI-05: Responsive (works on tablet/desktop)

---

## 9. API Endpoints Required (Backend)

### Admin Auth
- `POST /api/admin/login` — Admin-specific login (reuses same JWT, checks role ≥ CHECKER)

### Moderation
- `GET /api/admin/moderation/queue` — Pending listings
- `PUT /api/admin/moderation/{listingId}/approve`
- `PUT /api/admin/moderation/{listingId}/reject` (body: reason)
- `PUT /api/admin/moderation/{listingId}/flag`

### User Management
- `GET /api/admin/users` — All users (paginated, searchable)
- `GET /api/admin/users/{id}` — User detail
- `PUT /api/admin/users/{id}/ban` (body: reason)
- `PUT /api/admin/users/{id}/unban`
- `PUT /api/admin/users/{id}/role` (body: newRole) — SUPER_ADMIN only

### Revenue & Analytics
- `GET /api/admin/stats/dashboard` — KPI summary
- `GET /api/admin/stats/revenue?from=&to=` — Revenue data
- `GET /api/admin/stats/users` — User growth stats
- `GET /api/admin/stats/listings` — Listing stats by category
- `GET /api/admin/stats/transactions?from=&to=&page=&size=` — Transaction history

### Banners & Promotions
- `GET /api/admin/banners` — All banners
- `POST /api/admin/banners` — Create banner
- `PUT /api/admin/banners/{id}` — Update banner
- `DELETE /api/admin/banners/{id}` — Delete banner
- `PUT /api/admin/listings/{id}/feature` — Mark as featured
- `PUT /api/admin/listings/{id}/unfeature` — Remove featured

### Settings
- `GET /api/admin/settings` — Get all settings
- `PUT /api/admin/settings` — Update settings

### Audit
- `GET /api/admin/audit?from=&to=&action=&page=` — Audit logs (SUPER_ADMIN only)

---

## 10. Database Changes Needed

New tables:
- `admin_audit_log` (id, actor_id, action, target_type, target_id, details_json, created_at)
- `banners` (id, title, subtitle, image_url, link, color, active, start_date, end_date, created_by, created_at)
- `platform_settings` (key, value, updated_by, updated_at)

Modifications:
- `users` table: add `banned` (boolean), `ban_reason` (text), `banned_at` (timestamp)
- `listings` table: add `featured` (boolean), `rejection_reason` (text), `moderated_by` (FK), `moderated_at` (timestamp)

---

## 11. Priority Order for Implementation

1. **Phase 1:** RBAC + role enforcement + seed SUPER_ADMIN (foundation for everything)
2. **Phase 2:** Moderation workflow (PENDING → ACTIVE flow, checker queue)
3. **Phase 3:** Revenue dashboard + transaction history
4. **Phase 4:** User management (ban/unban/promote)
5. **Phase 5:** Analytics, banners, settings, audit logs

---

*Spec created: July 2026*
*Status: Requirements Complete — Ready for Design phase*
