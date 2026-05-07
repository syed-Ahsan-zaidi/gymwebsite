/**
 * URL utility functions for pagination and navigation
 */

/**
 * Validates a page parameter from URL search params
 * @param pageParam - The page parameter value from URL
 * @returns Valid page number (defaults to 1 for invalid input)
 */
export function validatePageParam(pageParam: string | null | undefined): number {
  // Handle null, undefined, or empty string
  if (!pageParam || pageParam.trim() === '') return 1
  
  // Parse the parameter
  const page = parseInt(pageParam.trim(), 10)
  
  // Handle invalid numbers, negative numbers, zero, or non-integers
  if (isNaN(page) || page < 1 || !Number.isFinite(page)) return 1
  
  // Handle extremely large numbers that could cause issues
  if (page > Number.MAX_SAFE_INTEGER) return 1
  
  return page
}

/**
 * Validates a page parameter against the total available pages
 * @param pageParam - The page parameter value from URL
 * @param totalPages - Total number of available pages
 * @returns Valid page number (defaults to 1 for out-of-range or invalid input)
 */
export function validatePageParamWithRange(
  pageParam: string | null | undefined, 
  totalPages: number
): number {
  const page = validatePageParam(pageParam)
  
  // If page exceeds total pages and there are pages available, return page 1
  if (page > totalPages && totalPages > 0) {
    return 1
  }
  
  return page
}

/**
 * Generates a URL with proper page parameter handling
 * @param baseUrl - The base URL (can be relative or absolute)
 * @param page - The page number to set
 * @param preserveParams - Whether to preserve existing query parameters
 * @returns Properly encoded URL with page parameter
 */
export function generatePageUrl(
  baseUrl: string, 
  page: number, 
  preserveParams: boolean = true
): string {
  // Validate page number
  if (!Number.isInteger(page) || page < 1) {
    throw new Error(`Invalid page number: ${page}. Page must be a positive integer.`)
  }

  // For page 1, return clean base URL without page parameter
  if (page === 1) {
    if (!preserveParams) {
      // Return just the base path without any parameters
      return baseUrl.split('?')[0]
    }

    // Parse the base URL to remove any existing page parameter
    try {
      // Handle absolute URLs
      const url = new URL(baseUrl, typeof window !== 'undefined' ? window.location.origin : 'http://localhost')
      url.searchParams.delete('page')
      
      // Return path + search params (without page) or just path if no params
      const searchString = url.searchParams.toString()
      return url.pathname + (searchString ? `?${searchString}` : '')
    } catch {
      // Fallback for relative URLs
      const [basePath, existingParams] = baseUrl.split('?')
      if (!existingParams) return basePath
      
      const params = new URLSearchParams(existingParams)
      params.delete('page')
      const searchString = params.toString()
      return basePath + (searchString ? `?${searchString}` : '')
    }
  }

  // For other pages, add/update the page parameter
  try {
    // Handle absolute URLs
    const url = new URL(baseUrl, typeof window !== 'undefined' ? window.location.origin : 'http://localhost')
    
    if (!preserveParams) {
      // Clear all existing params and only set page
      url.search = ''
      url.searchParams.set('page', String(page))
    } else {
      // Preserve existing params and set/update page
      url.searchParams.set('page', String(page))
    }
    
    // Return path + search params
    const searchString = url.searchParams.toString()
    return url.pathname + (searchString ? `?${searchString}` : '')
  } catch {
    // Fallback for relative URLs
    const [basePath, existingParams] = baseUrl.split('?')
    const params = new URLSearchParams(preserveParams ? existingParams || '' : '')
    params.set('page', String(page))
    const searchString = params.toString()
    return basePath + (searchString ? `?${searchString}` : '')
  }
}

/**
 * Builds a pagination URL following the project's existing patterns
 * @param basePath - The base path (e.g., '/dashboard/gyms')
 * @param page - The page number
 * @param additionalParams - Additional query parameters to preserve
 * @returns Properly formatted URL
 */
export function buildPaginationUrl(
  basePath: string,
  page: number,
  additionalParams?: Record<string, string>
): string {
  const params = new URLSearchParams()
  
  // Add additional parameters first
  if (additionalParams) {
    Object.entries(additionalParams).forEach(([key, value]) => {
      if (value) params.set(key, value)
    })
  }
  
  // Add page parameter only if not page 1
  if (page > 1) {
    params.set('page', String(page))
  }
  
  const query = params.toString()
  return query ? `${basePath}?${query}` : basePath
}

/**
 * Extracts page number from Next.js searchParams
 * @param searchParams - Next.js searchParams object
 * @returns Valid page number
 */
export function extractPageFromSearchParams(
  searchParams: { page?: string } | undefined
): number {
  return validatePageParam(searchParams?.page)
}

/**
 * Validates if a URL is safe for navigation
 * @param url - The URL to validate
 * @returns Whether the URL is safe for navigation
 */
export function isValidNavigationUrl(url: string): boolean {
  try {
    // Check for relative URLs (safe)
    if (url.startsWith('/') && !url.startsWith('//')) {
      return true
    }
    
    // Check for absolute URLs (validate domain if needed)
    const parsedUrl = new URL(url)
    
    // Only allow http/https protocols
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return false
    }
    
    // Additional domain validation could be added here if needed
    return true
  } catch {
    return false
  }
}