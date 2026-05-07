# Requirements Document: Gyms List Pagination

## Introduction

The FlexManagePro application currently displays all onboarded gyms on a single page without pagination. As the number of onboarded gyms grows, this creates performance issues and poor user experience. This feature introduces pagination to the gyms list, displaying 10 gyms per page with navigation controls to browse through pages.

## Glossary

- **Gyms_List_Page**: The dashboard page at `/app/dashboard/gyms` that displays all onboarded gyms
- **Pagination_Control**: UI elements (previous/next buttons, page indicators) that allow users to navigate between pages
- **Page_Size**: The number of gyms displayed per page (fixed at 10)
- **Current_Page**: The page number the user is currently viewing (1-indexed)
- **Total_Pages**: The total number of pages available based on total gym count and page size
- **Gym_Record**: A single gym entry containing gym name, location, admin email, and member count
- **Paginated_Response**: API response containing gym records for a specific page plus pagination metadata
- **Query_Parameter**: URL parameter used to specify which page to display (e.g., `?page=2`)

## Requirements

### Requirement 1: Display Paginated Gym Records

**User Story:** As a super admin, I want to view gyms in pages of 10, so that I can browse the gym list efficiently without overwhelming the interface.

#### Acceptance Criteria

1. WHEN the Gyms_List_Page loads without a page parameter, THE Page SHALL display the first page (page 1) with up to 10 Gym_Records
2. WHEN a user navigates to the Gyms_List_Page with a valid page parameter (e.g., `?page=2`), THE Page SHALL display the corresponding page with up to 10 Gym_Records
3. THE Gym_Records on each page SHALL be ordered by creation date in descending order (newest first)
4. WHEN a page contains fewer than 10 Gym_Records, THE Page SHALL display all available records without padding

### Requirement 2: Fetch Paginated Data from Backend

**User Story:** As a developer, I want the backend to support paginated gym queries, so that the frontend can efficiently retrieve only the needed data.

#### Acceptance Criteria

1. WHEN the Gyms_List_Page requests gym data with a page number, THE Backend API SHALL calculate the correct offset based on page number and page size (10)
2. THE Backend API SHALL return a Paginated_Response containing:
   - An array of Gym_Records for the requested page
   - Total count of all gyms
   - Current page number
   - Total pages available
3. WHEN the requested page number exceeds the total available pages, THE Backend API SHALL return an empty array with valid pagination metadata
4. THE Backend API SHALL include gym name, location, admin email, and member count for each Gym_Record

### Requirement 3: Display Pagination Controls

**User Story:** As a super admin, I want to navigate between pages, so that I can view different sets of gyms.

#### Acceptance Criteria

1. THE Gyms_List_Page SHALL display a Pagination_Control component below the gym table
2. THE Pagination_Control SHALL display a "Previous" button that is disabled when viewing page 1
3. THE Pagination_Control SHALL display a "Next" button that is disabled when viewing the last page
4. THE Pagination_Control SHALL display the current page number and total pages in the format "Page X of Y"
5. WHEN a user clicks the "Previous" button, THE Page SHALL navigate to the previous page and update the URL with the new page parameter
6. WHEN a user clicks the "Next" button, THE Page SHALL navigate to the next page and update the URL with the new page parameter

### Requirement 4: Handle Edge Cases and Invalid Input

**User Story:** As a developer, I want the pagination to handle invalid input gracefully, so that users cannot break the interface with malformed URLs.

#### Acceptance Criteria

1. IF a user provides a page parameter that is not a positive integer (e.g., `?page=abc` or `?page=-1`), THEN THE Page SHALL default to page 1
2. IF a user provides a page parameter that exceeds the total available pages (e.g., `?page=999`), THEN THE Page SHALL display page 1 and show an empty gym list with a message indicating no gyms are available on that page
3. IF the Backend API returns an error while fetching paginated data, THEN THE Page SHALL display an error message and allow the user to retry
4. WHEN the total gym count is zero, THE Page SHALL display an empty state message indicating no gyms have been onboarded

### Requirement 5: Maintain Existing Gym Record Display

**User Story:** As a super admin, I want the gym information to remain consistent, so that pagination does not affect the data I see.

#### Acceptance Criteria

1. THE Gym_Records displayed on each page SHALL include the same columns as the current implementation: gym name, location, admin email, and member count
2. THE Gym_Records SHALL display gym name and location in uppercase
3. THE Gym_Records SHALL display member count in bold indigo text
4. WHEN a gym has no admin assigned, THE Page SHALL display "No admin assigned" in the admin email column
5. THE Member count SHALL only include users with the MEMBER role, excluding admins and trainers

### Requirement 6: Preserve URL State for Bookmarking

**User Story:** As a super admin, I want to bookmark or share a specific page of gyms, so that I can quickly return to the same view.

#### Acceptance Criteria

1. THE Current_Page number SHALL be reflected in the URL as a Query_Parameter (e.g., `/app/dashboard/gyms?page=2`)
2. WHEN a user bookmarks a URL with a specific page parameter, THE Page SHALL load directly to that page when the bookmark is accessed
3. WHEN a user shares a URL with a page parameter, THE recipient SHALL see the same page of gyms

### Requirement 7: Optimize Performance for Large Gym Lists

**User Story:** As a developer, I want pagination to improve performance, so that the application remains responsive as the gym list grows.

#### Acceptance Criteria

1. WHEN fetching paginated gym data, THE Backend API SHALL only retrieve the Gym_Records for the requested page plus pagination metadata, not all gyms
2. THE Backend API query SHALL use database-level pagination (LIMIT and OFFSET) to minimize data transfer
3. WHEN the Gyms_List_Page loads, THE Page SHALL render within 2 seconds for typical network conditions

