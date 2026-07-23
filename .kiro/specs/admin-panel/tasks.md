# Implementation Plan: Admin Panel & Authorization System

## Overview

This plan implements the full admin panel system for Deal Spot, extending the existing Spring Boot backend and Next.js frontend. The architecture already has key entities, repositories, and scaffolded services/pages in place. This plan focuses on hardening the backend logic (role validation, state machine enforcement, audit completeness), completing the frontend admin pages with real data integration, and adding property-based tests to validate correctness properties.

Backend: Java (Spring Boot + JPA/Hibernate + PostgreSQL) with jqwik for property tests.
Frontend: TypeScript (Next.js App Router + shadcn/ui) with fast-check for property tests.

## Tasks

- [x] 1. Harden RBAC and role enforcement
  - [x] 1.1 Implement role hierarchy validation in UserManagementService
    - Add role hierarchy constant (USER < CHECKER < ADMIN < SUPER_ADMIN)
    - Refactor `checkRole()` to use hierarchy-based comparison instead of exact match
    - Add validation in `changeUserRole()`: actor must be SUPER_ADMIN, target cannot be self, new role cannot be SUPER_ADMIN
    - Throw `AccessDeniedException` (Spring Security) instead of generic RuntimeException
    - _Requirements: REQ-AUTH-01, REQ-AUTH-02, REQ-AUTH-03, REQ-AUTH-05_

  - [x] 1.2 Write property test for role enforcement (jqwik)
    - **Property 1: Role enforcement grants access if and only if role is sufficient**
    - Generate random (userRole, requiredRoles[]) pairs and verify checkRole allows/denies correctly
    - **Validates: Requirements REQ-AUTH-02, REQ-MOD-02, REQ-AUD-06**

  - [x] 1.3 Write property test for role change rules (jqwik)
    - **Property 2: Role change rules are comprehensive and non-bypassable**
    - Generate random (actorRole, targetId, actorId, newRole) tuples
    - Verify success only when actor=SUPER_ADMIN, target≠actor, newRole∈{USER,CHECKER,ADMIN}
    - **Validates: Requirements REQ-AUTH-03, REQ-AUTH-05, REQ-USR-06, REQ-USR-07**

  - [x] 1.4 Add banned user login rejection in AuthService
    - Check `user.getBanned()` during login and throw appropriate exception with ban reason
    - Return 403 with `ACCOUNT_BANNED` error code
    - _Requirements: REQ-USR-04, REQ-USR-08_

  - [x] 1.5 Write property test for banned user authentication denial (jqwik)
    - **Property 8: Banned users are denied authentication**
    - Generate random users with banned=true/false, verify login allowed iff not banned
    - **Validates: Requirements REQ-USR-04**

- [x] 2. Implement listing moderation state machine
  - [x] 2.1 Add state machine validation to ModerationService
    - Create `VALID_TRANSITIONS` map as defined in design
    - Add `transitionStatus()` method that validates transitions before applying
    - Refactor `approveListing`, `rejectListing`, `flagListing` to use `transitionStatus()`
    - Add rejection reason validation (non-null, non-blank)
    - Set new listings to PENDING status in ListingService.createListing()
    - _Requirements: REQ-MOD-01, REQ-MOD-02, REQ-MOD-03, REQ-MOD-04_

  - [x] 2.2 Write property test for listing status transitions (jqwik)
    - **Property 3: Listing status transitions follow the state machine**
    - Generate random (currentStatus, attemptedNewStatus) pairs
    - Verify transition succeeds only for valid pairs in the defined transition map
    - **Validates: Requirements REQ-MOD-01, REQ-MOD-02**

  - [x] 2.3 Write property test for rejection reason validation (jqwik)
    - **Property 4: Rejection requires a non-empty reason**
    - Generate random strings (including null, empty, whitespace-only)
    - Verify rejection fails for invalid reasons, succeeds for valid non-empty strings
    - **Validates: Requirements REQ-MOD-03**

  - [x] 2.4 Write property test for FIFO moderation queue ordering (jqwik)
    - **Property 5: Moderation queue maintains FIFO ordering**
    - Generate random listings with random createdAt timestamps
    - Verify queue returns them in ascending createdAt order
    - **Validates: Requirements REQ-MOD-06**

  - [x] 2.5 Add moderation stats to ModerationService
    - Implement `getModerationStats()`: pending count, approved today, rejected today
    - Add endpoint `GET /api/admin/moderation/stats` in AdminController
    - _Requirements: REQ-MOD-07_

- [x] 3. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implement revenue and analytics backend
  - [x] 4.1 Complete StatsService with revenue aggregation
    - Implement `getDashboardStats()` with proper JPA queries (count users, listings by status, sum payments)
    - Implement `getRevenueStats(from, to)` with daily breakdown and category split
    - Filter only `status = "PAID"` payments for revenue totals
    - Add `getTransactionHistory(page, size, from, to)` with date range filtering
    - _Requirements: REQ-REV-01, REQ-REV-02, REQ-REV-03, REQ-REV-04_

  - [x] 4.2 Write property test for revenue totals excluding non-successful payments (jqwik)
    - **Property 6: Revenue totals exclude non-successful payments**
    - Generate random sets of PaymentOrder with various statuses (PAID, FAILED, REFUNDED, CREATED)
    - Verify sum only includes PAID, and category breakdown sums match total
    - **Validates: Requirements REQ-REV-01, REQ-REV-02, REQ-REV-04**

  - [x] 4.3 Write property test for transaction date filter (jqwik)
    - **Property 10: Transaction filter results respect filter criteria**
    - Generate random transactions with random dates, apply random date range filter
    - Verify all returned transactions have createdAt within [from, to] inclusive
    - **Validates: Requirements REQ-REV-03**

  - [x] 4.4 Add analytics endpoints to StatsService and AdminController
    - Implement user growth stats (daily registrations)
    - Implement listing stats by category and status
    - Add contact unlock count and conversion rate calculation
    - Add necessary repository query methods (e.g., `countByCreatedAtBetween`)
    - _Requirements: REQ-ANA-01, REQ-ANA-02, REQ-ANA-04, REQ-ANA-06, REQ-ANA-07_

  - [x] 4.5 Add CSV export endpoint for revenue data
    - Create `GET /api/admin/stats/revenue/export?from=&to=` endpoint
    - Return CSV with proper headers and escaped fields
    - _Requirements: REQ-REV-05_

- [x] 5. Implement user management enhancements
  - [x] 5.1 Complete ban/unban with proper validation and token revocation
    - Add protection: cannot ban users with equal/higher role (ADMIN cannot ban ADMIN)
    - Verify `refreshTokenRepository.revokeAllByUserId()` works correctly on ban
    - Add search functionality in `getAllUsers()` (search by name/phone)
    - _Requirements: REQ-USR-01, REQ-USR-02, REQ-USR-03, REQ-USR-05, REQ-USR-08_

  - [x] 5.2 Write property test for ban/unban round-trip (jqwik)
    - **Property 7: Ban/unban is a round-trip that restores user state**
    - Generate random users, ban then unban, verify state restored
    - Unban then ban with new reason, verify new reason stored
    - **Validates: Requirements REQ-USR-03, REQ-USR-05**

- [x] 6. Implement banners, settings, and audit backend
  - [x] 6.1 Complete BannerService with date-range filtering
    - Implement `getActiveBanners()` filtering by active=true AND current date between start/end
    - Add banner update endpoint `PUT /api/admin/banners/{id}`
    - Add featured listing management (mark/unmark featured with "promoted" badge)
    - _Requirements: REQ-ADS-01, REQ-ADS-02, REQ-ADS-03, REQ-ADS-04_

  - [x] 6.2 Complete SettingsService with validation
    - Validate known setting keys (contact_unlock_price, max_images_per_listing, listing_expiry_days, maintenance_mode)
    - Ensure audit logging for every settings change
    - Add platform listing creation (admin posts listing without seller phone)
    - _Requirements: REQ-SET-01, REQ-SET-02, REQ-SET-03, REQ-SET-04, REQ-SET-05, REQ-ADS-05_

  - [x] 6.3 Harden AuditService for append-only guarantee
    - Remove any UPDATE/DELETE methods on AuditLogRepository (if present)
    - Ensure every admin mutation (moderation, ban/unban, role change, setting update, banner CRUD) calls audit
    - Add action type filtering and date range filtering to `getAuditLogs()`
    - _Requirements: REQ-AUD-01, REQ-AUD-02, REQ-AUD-03, REQ-AUD-04, REQ-AUD-05, REQ-AUD-06_

  - [x] 6.4 Write property test for audit log append-only monotonicity (jqwik)
    - **Property 9: Audit log is append-only and monotonically growing**
    - Generate random sequences of admin operations
    - Verify audit count never decreases and each mutation adds exactly one entry
    - **Validates: Requirements REQ-AUD-01, REQ-AUD-02, REQ-AUD-03, REQ-AUD-04, REQ-AUD-05**

- [x] 7. Checkpoint - Ensure all backend tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Implement frontend admin guard and role gating
  - [x] 8.1 Create useAdminGuard hook and update admin layout
    - Create `src/lib/useAdminGuard.ts` hook that checks user role from AuthContext
    - Redirect to `/login` if not authenticated or role insufficient
    - Update admin sidebar navigation to show/hide items based on user role
    - Add role-based visibility: Settings/Audit only for SUPER_ADMIN, Dashboard/Revenue/Users for ADMIN+
    - _Requirements: REQ-UI-01, REQ-UI-02, REQ-AUTH-02_

  - [x] 8.2 Add admin API methods to api.ts
    - Add typed methods: `adminModerationQueue()`, `adminApprove()`, `adminReject()`, `adminFlag()`
    - Add typed methods: `adminUsers()`, `adminBanUser()`, `adminUnbanUser()`, `adminChangeRole()`
    - Add typed methods: `adminRevenue()`, `adminTransactions()`, `adminDashboard()`
    - Add typed methods: `adminBanners()`, `adminCreateBanner()`, `adminDeleteBanner()`
    - Add typed methods: `adminSettings()`, `adminUpdateSettings()`, `adminAuditLogs()`
    - Add TypeScript interfaces matching backend DTOs (DashboardStats, RevenueStats, UserResponse, etc.)
    - _Requirements: REQ-UI-01_

- [x] 9. Implement frontend moderation page
  - [x] 9.1 Build moderation queue page with approve/reject/flag actions
    - Replace mock data in `/admin/moderation/page.tsx` with real API calls
    - Implement listing card with status badges and action buttons
    - Add rejection reason modal (required field)
    - Show moderation stats (pending count, approved today, rejected today)
    - Implement pagination for the queue
    - Call `useAdminGuard('CHECKER')` for page protection
    - _Requirements: REQ-MOD-02, REQ-MOD-03, REQ-MOD-06, REQ-MOD-07, REQ-UI-03_

- [x] 10. Implement frontend user management page
  - [x] 10.1 Build users list page with ban/unban/role management
    - Replace mock data in `/admin/users/page.tsx` with real API calls
    - Implement user table with pagination, search, and role badges
    - Add ban/unban actions with reason modal
    - Add role change dropdown (visible only for SUPER_ADMIN)
    - Show user details (profile, listing count, transaction count)
    - Call `useAdminGuard('ADMIN')` for page protection
    - _Requirements: REQ-USR-01, REQ-USR-02, REQ-USR-03, REQ-USR-05, REQ-USR-06, REQ-USR-07, REQ-UI-03_

- [x] 11. Implement frontend revenue and analytics page
  - [x] 11.1 Build revenue dashboard with charts and transaction history
    - Replace mock data in `/admin/revenue/page.tsx` with real API calls
    - Add date range picker for revenue filtering
    - Display daily revenue chart (bar or line chart using recharts or similar)
    - Show category breakdown as pie/donut chart
    - Implement transaction history table with pagination and filters
    - Add CSV export button
    - Call `useAdminGuard('ADMIN')` for page protection
    - _Requirements: REQ-REV-01, REQ-REV-02, REQ-REV-03, REQ-REV-05, REQ-UI-03, REQ-UI-04_

- [x] 12. Implement frontend banners, settings, and audit pages
  - [x] 12.1 Build banners management page
    - Replace mock data in `/admin/banners/page.tsx` with real API calls
    - Implement banner create form (title, subtitle, image upload, link, date range)
    - Show active/inactive banners list with delete action
    - Add featured listing toggle
    - Call `useAdminGuard('ADMIN')` for page protection
    - _Requirements: REQ-ADS-01, REQ-ADS-02, REQ-ADS-03, REQ-UI-03_

  - [x] 12.2 Build settings page
    - Replace mock data in `/admin/settings/page.tsx` with real API calls
    - Implement form for: contact unlock price, max images, listing expiry, maintenance mode toggle
    - Call `useAdminGuard('SUPER_ADMIN')` for page protection
    - _Requirements: REQ-SET-01, REQ-SET-02, REQ-SET-03, REQ-SET-04, REQ-SET-05_

  - [x] 12.3 Build audit logs page
    - Replace mock data in `/admin/audit/page.tsx` with real API calls
    - Implement table with columns: timestamp, actor, action, target, details
    - Add pagination and date range filtering
    - Call `useAdminGuard('SUPER_ADMIN')` for page protection
    - _Requirements: REQ-AUD-01, REQ-AUD-06, REQ-UI-03_

- [x] 13. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 14. Integration wiring and seed data
  - [x] 14.1 Create database seed script for SUPER_ADMIN and platform settings
    - Add `data.sql` or `CommandLineRunner` that seeds SUPER_ADMIN user on first run (idempotent)
    - Seed default platform settings (contact_unlock_price=5000, max_images=5, listing_expiry=30, maintenance_mode=false)
    - Ensure seed runs only if records don't already exist
    - _Requirements: REQ-AUTH-04, REQ-SET-01, REQ-SET-03, REQ-SET-04_

  - [x] 14.2 Wire notification service for moderation decisions
    - Send notification to listing owner when listing is approved/rejected
    - Include rejection reason in the notification message
    - Use existing NotificationService
    - _Requirements: REQ-MOD-05_

  - [x] 14.3 Write integration tests for full moderation workflow
    - Test: create listing → PENDING → approve → ACTIVE (notification sent)
    - Test: create listing → PENDING → reject with reason → REJECTED (notification sent)
    - Test: create listing → PENDING → flag → FLAGGED → admin approves → ACTIVE
    - _Requirements: REQ-MOD-01, REQ-MOD-02, REQ-MOD-03, REQ-MOD-04, REQ-MOD-05_

  - [x] 14.4 Write integration tests for user ban/auth flow
    - Test: ban user → verify login rejected → unban → verify login succeeds
    - Test: ban user → verify refresh tokens revoked
    - _Requirements: REQ-USR-03, REQ-USR-04, REQ-USR-05, REQ-USR-08_

- [x] 15. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties using jqwik (Java backend) and fast-check (TypeScript frontend)
- Unit tests validate specific examples and edge cases
- The existing backend already has scaffolded services (AdminService, ModerationService, UserManagementService, StatsService, BannerService, SettingsService, AuditService) — tasks focus on hardening logic and adding missing validation
- The existing frontend has admin pages scaffolded with mock data — tasks focus on replacing mocks with real API integration
- Entities (User, Listing, PaymentOrder, Banner, PlatformSetting, AuditLog) already exist with all needed fields

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.4"] },
    { "id": 1, "tasks": ["1.2", "1.3", "1.5", "2.1"] },
    { "id": 2, "tasks": ["2.2", "2.3", "2.4", "2.5", "4.1"] },
    { "id": 3, "tasks": ["4.2", "4.3", "4.4", "5.1"] },
    { "id": 4, "tasks": ["4.5", "5.2", "6.1", "6.2"] },
    { "id": 5, "tasks": ["6.3", "6.4", "8.1", "8.2"] },
    { "id": 6, "tasks": ["9.1", "10.1", "11.1"] },
    { "id": 7, "tasks": ["12.1", "12.2", "12.3"] },
    { "id": 8, "tasks": ["14.1", "14.2"] },
    { "id": 9, "tasks": ["14.3", "14.4"] }
  ]
}
```
