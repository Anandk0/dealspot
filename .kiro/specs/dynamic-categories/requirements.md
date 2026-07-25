# Requirements Document

## Introduction

The Dealspot Connect agricultural marketplace currently uses hardcoded categories defined in `src/lib/categories.ts`. This feature replaces the static category list with a dynamic, database-backed category management system. Administrators will be able to create, edit, disable, and delete categories from the admin panel. The frontend (home page, create listing page, category pages) will load categories from the API instead of the hardcoded file. Backward compatibility with existing listings is maintained by mapping category strings to slugs in the new `categories` table.

## Glossary

- **Category_Service**: The backend service responsible for CRUD operations on category records in the PostgreSQL database
- **Category_API**: The set of REST endpoints that expose category data to both the public frontend and the admin panel
- **Admin_Panel**: The Next.js admin interface at `/admin` used by administrators to manage the platform
- **Category_Table**: The PostgreSQL table storing category records with fields: id, name, nameEn, slug, icon, imageUrl, color, active, sortOrder, createdAt, updatedAt
- **Listing**: A marketplace post created by a user, belonging to a single category identified by slug
- **Slug**: A URL-friendly unique identifier for a category (e.g., `agricultural-products`)
- **Frontend_App**: The Next.js App Router application serving the public-facing marketplace

## Requirements

### Requirement 1: Category Data Persistence

**User Story:** As a platform operator, I want categories stored in a database table, so that categories can be managed without code deployments.

#### Acceptance Criteria

1. THE Category_Table SHALL store each category with the following fields: id (auto-generated primary key), name (Kannada text), nameEn (English text), slug (unique URL-friendly identifier), icon (emoji or icon identifier), imageUrl (optional image URL), color (CSS color class), active (boolean), sortOrder (integer), createdAt (timestamp), updatedAt (timestamp)
2. THE Category_Table SHALL enforce a unique constraint on the slug field
3. THE Category_Table SHALL contain seed data matching the eight existing hardcoded categories (agricultural-products, livestock, farm-equipment, tractor-rental, vehicle-rental, labor, land, services) with their corresponding names, icons, and colors
4. WHEN a new category record is created, THE Category_Service SHALL auto-generate the slug from the nameEn field if no slug is explicitly provided

### Requirement 2: Admin Category Creation

**User Story:** As an admin, I want to create new categories with Kannada name, English name, icon, and color, so that the marketplace can expand to cover new product types.

#### Acceptance Criteria

1. WHEN an admin submits a valid category creation request with name, nameEn, icon, and color, THE Category_API SHALL create the category record and return the created category with HTTP 201
2. WHEN an admin submits a category creation request with a slug that already exists, THE Category_API SHALL return an HTTP 409 error with a descriptive message
3. WHEN an admin submits a category creation request missing required fields (name, nameEn), THE Category_API SHALL return an HTTP 400 error with field-level validation messages
4. THE Category_API SHALL restrict category creation to users with ADMIN or SUPER_ADMIN role

### Requirement 3: Admin Category Editing

**User Story:** As an admin, I want to edit existing categories, so that I can update names, icons, colors, and display order without recreating them.

#### Acceptance Criteria

1. WHEN an admin submits a valid category update request, THE Category_API SHALL update the specified fields and return the updated category
2. WHEN an admin updates a category slug to a value that conflicts with another category, THE Category_API SHALL return an HTTP 409 error
3. WHEN an admin updates a category slug, THE Category_Service SHALL update all listings referencing the old slug to use the new slug
4. THE Category_API SHALL restrict category editing to users with ADMIN or SUPER_ADMIN role

### Requirement 4: Admin Category Deactivation and Deletion

**User Story:** As an admin, I want to disable or delete categories, so that outdated categories no longer appear to users while preserving listing data.

#### Acceptance Criteria

1. WHEN an admin deactivates a category, THE Category_Service SHALL set the active field to false and retain all associated listing data
2. WHILE a category is inactive, THE Category_API SHALL exclude the category from public category list responses
3. WHEN an admin deletes a category that has zero associated listings, THE Category_Service SHALL permanently remove the category record
4. WHEN an admin attempts to delete a category that has associated listings, THE Category_API SHALL return an HTTP 409 error instructing the admin to deactivate instead
5. THE Category_API SHALL restrict category deactivation and deletion to users with ADMIN or SUPER_ADMIN role

### Requirement 5: Public Category Listing Endpoint

**User Story:** As a user, I want to browse available categories, so that I can find relevant listings in the marketplace.

#### Acceptance Criteria

1. THE Category_API SHALL provide a public GET endpoint at `/api/categories` that returns all active categories ordered by sortOrder ascending
2. THE Category_API SHALL return each category with fields: id, name, nameEn, slug, icon, imageUrl, color
3. WHEN no active categories exist, THE Category_API SHALL return an empty array with HTTP 200
4. THE Category_API SHALL allow unauthenticated access to the public categories endpoint

### Requirement 6: Admin Category List Endpoint

**User Story:** As an admin, I want to see all categories including inactive ones, so that I can manage the full set of categories.

#### Acceptance Criteria

1. THE Category_API SHALL provide an admin GET endpoint at `/api/admin/categories` that returns all categories (active and inactive) ordered by sortOrder ascending
2. THE Category_API SHALL return each category with all fields including active status, createdAt, updatedAt, and listing count per category
3. THE Category_API SHALL restrict the admin categories endpoint to users with ADMIN or SUPER_ADMIN role

### Requirement 7: Admin Categories Page

**User Story:** As an admin, I want a dedicated categories management page in the admin panel, so that I can view, create, edit, and manage categories through a user interface.

#### Acceptance Criteria

1. THE Admin_Panel SHALL display a "Categories" navigation item in the admin sidebar accessible to ADMIN and SUPER_ADMIN roles
2. THE Admin_Panel SHALL display a categories list showing name (Kannada), nameEn (English), icon, color swatch, active status, sort order, and listing count for each category
3. WHEN an admin clicks "Add Category", THE Admin_Panel SHALL display a form with fields for name, nameEn, icon, imageUrl, color, and sortOrder
4. WHEN an admin clicks edit on a category, THE Admin_Panel SHALL display a pre-filled form allowing modification of all editable fields
5. WHEN an admin clicks the active/inactive toggle on a category, THE Admin_Panel SHALL send a deactivation or activation request and update the display

### Requirement 8: Frontend Dynamic Category Loading

**User Story:** As a user, I want the home page and create listing page to show current categories from the server, so that I always see the latest category options.

#### Acceptance Criteria

1. WHEN the home page loads, THE Frontend_App SHALL fetch categories from the `/api/categories` endpoint and render the category grid
2. WHEN the create listing page loads, THE Frontend_App SHALL fetch categories from the `/api/categories` endpoint and populate the category selector
3. IF the categories API request fails, THEN THE Frontend_App SHALL display a retry option and show a user-friendly error message in Kannada
4. WHILE categories are loading, THE Frontend_App SHALL display skeleton placeholders in place of the category grid

### Requirement 9: Category Page Listing Display

**User Story:** As a user, I want to view all listings in a specific category, so that I can browse relevant items.

#### Acceptance Criteria

1. WHEN a user navigates to a category page by slug, THE Frontend_App SHALL fetch and display listings belonging to that category
2. WHEN a user navigates to a category page with an invalid or inactive slug, THE Frontend_App SHALL display a "category not found" message
3. THE Frontend_App SHALL display the category name (Kannada), icon, and color as the page header using data from the categories API

### Requirement 10: Backward Compatibility

**User Story:** As a platform operator, I want existing listings to remain accessible after migration, so that no data is lost during the transition.

#### Acceptance Criteria

1. THE Category_Table seed data SHALL use slugs identical to the existing hardcoded category id values (agricultural-products, livestock, farm-equipment, tractor-rental, vehicle-rental, labor, land, services)
2. THE Category_Service SHALL resolve listing category references by matching the listing category string to the Category_Table slug field
3. WHEN a listing references a category slug that does not exist in the Category_Table, THE Frontend_App SHALL display the listing with a generic "Unknown Category" label instead of failing
