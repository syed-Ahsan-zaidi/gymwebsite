"use server";
import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";

// TypeScript interfaces for pagination
export interface GetPaginatedGymsParams {
  page?: number;
  pageSize?: number;
}

export interface PaginationMetadata {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface GymWithDetails {
  id: string;
  gymName: string;
  location: string;
  createdAt: Date;
  users: Array<{
    email: string;
    role: Role;
  }>;
  _count: {
    users: number;
  };
}

export interface PaginatedGymsResponse {
  gyms: GymWithDetails[];
  pagination: PaginationMetadata;
}

// Input validation for page parameters
function validatePageParam(page: number | undefined): number {
  // Handle undefined, null, or invalid numbers
  if (!page || !Number.isInteger(page) || page < 1 || !Number.isFinite(page)) {
    return 1;
  }
  
  // Handle extremely large numbers that could cause database issues
  if (page > Number.MAX_SAFE_INTEGER) {
    return 1;
  }
  
  return page;
}

function validatePageSize(pageSize: number | undefined): number {
  // Handle undefined, null, or invalid numbers
  if (!pageSize || !Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100 || !Number.isFinite(pageSize)) {
    return 10; // Default page size
  }
  
  return pageSize;
}

// Helper function to calculate pagination metadata
function calculatePaginationMetadata(
  totalCount: number,
  currentPage: number,
  pageSize: number
): PaginationMetadata {
  const totalPages = Math.ceil(totalCount / pageSize);
  
  return {
    currentPage,
    totalPages,
    totalCount,
    pageSize,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
  };
}

// Enhanced gym actions with pagination support
export const getPaginatedGyms = async (
  params: GetPaginatedGymsParams = {}
): Promise<PaginatedGymsResponse> => {
  try {
    // Validate and set defaults for parameters
    const requestedPage = validatePageParam(params.page);
    const pageSize = validatePageSize(params.pageSize);
    
    // Get total count for pagination metadata first
    const totalCount = await prisma.gymProfile.count();
    const totalPages = Math.ceil(totalCount / pageSize) || 1; // Ensure at least 1 page
    
    // Handle out-of-range page requests gracefully (Requirement 4.2)
    // If requested page exceeds available pages, use page 1 instead
    let actualPage = requestedPage;
    if (requestedPage > totalPages && totalCount > 0) {
      actualPage = 1;
    }
    
    // Calculate offset for database query using the actual page
    const skip = (actualPage - 1) * pageSize;
    
    // Fetch paginated gym data with optimized related information
    const gyms = await prisma.gymProfile.findMany({
      skip,
      take: pageSize,
      include: {
        // Only fetch admin users for email display
        users: {
          where: {
            role: "ADMIN"
          },
          select: {
            email: true,
            role: true,
          },
        },
        // Count only MEMBER role users for member count
        _count: { 
          select: { 
            users: {
              where: {
                role: "MEMBER"
              }
            }
          } 
        },
      },
      orderBy: { createdAt: "desc" },
    });
    
    // Calculate pagination metadata using the actual page that was used
    const pagination = calculatePaginationMetadata(totalCount, actualPage, pageSize);
    
    return {
      gyms,
      pagination,
    };
  } catch (error) {
    console.error("Error fetching paginated gyms:", error);
    
    // Enhanced error handling - provide more specific error information
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error("Detailed error:", errorMessage);
    
    // Return empty result with default pagination on error
    return {
      gyms: [],
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalCount: 0,
        pageSize: 10,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };
  }
};

// Legacy function - kept for backward compatibility
export const getGyms = async () => {
  try {
    const gyms = await prisma.gymProfile.findMany({
      select: { id: true, gymName: true },
    });
    return gyms;
  } catch (error) {
    console.error("Error:", error);
    return [];
  }
};
