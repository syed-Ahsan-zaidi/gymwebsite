import * as React from "react"
import Link from "next/link"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { generatePageUrl, isValidNavigationUrl } from "@/lib/url-utils"
import { Button } from "@/components/ui/button"

interface PaginationProps {
  currentPage: number
  totalPages: number
  baseUrl: string
  className?: string
}

interface PaginationButtonProps {
  href: string
  disabled?: boolean
  children: React.ReactNode
  variant?: 'default' | 'outline'
  className?: string
}

function PaginationButton({ 
  href, 
  disabled = false, 
  children, 
  variant = 'outline',
  className,
  ...props 
}: PaginationButtonProps) {
  if (disabled) {
    return (
      <Button
        variant={variant}
        disabled
        className={cn("cursor-not-allowed opacity-50", className)}
        {...props}
      >
        {children}
      </Button>
    )
  }

  return (
    <Button
      asChild
      variant={variant}
      className={className}
      {...props}
    >
      <Link href={href}>
        {children}
      </Link>
    </Button>
  )
}

function Pagination({ 
  currentPage, 
  totalPages, 
  baseUrl, 
  className 
}: PaginationProps) {
  // Don't render pagination if there's only one page or no pages
  if (totalPages <= 1) {
    return null
  }

  // Generate URLs for navigation with proper validation
  const generateSafePageUrl = (page: number): string => {
    try {
      const url = generatePageUrl(baseUrl, page, true)
      
      // Validate the generated URL
      if (!isValidNavigationUrl(url)) {
        console.warn(`Generated invalid navigation URL: ${url}`)
        return '#'
      }
      
      return url
    } catch (error) {
      console.error('Error generating page URL:', error)
      return '#'
    }
  }

  const previousPage = currentPage > 1 ? currentPage - 1 : null
  const nextPage = currentPage < totalPages ? currentPage + 1 : null

  return (
    <div 
      className={cn(
        "flex items-center justify-between gap-4 px-6 py-4 bg-white border-t border-slate-200",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <PaginationButton
          href={previousPage ? generateSafePageUrl(previousPage) : '#'}
          disabled={!previousPage}
          variant="outline"
          className="flex items-center gap-1.5 text-slate-700 border-slate-300 hover:bg-slate-50"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          Previous
        </PaginationButton>
        
        <PaginationButton
          href={nextPage ? generateSafePageUrl(nextPage) : '#'}
          disabled={!nextPage}
          variant="outline"
          className="flex items-center gap-1.5 text-slate-700 border-slate-300 hover:bg-slate-50"
        >
          Next
          <ChevronRightIcon className="h-4 w-4" />
        </PaginationButton>
      </div>

      <div className="text-sm font-medium text-slate-600">
        Page {currentPage} of {totalPages}
      </div>
    </div>
  )
}

export { Pagination, type PaginationProps }
export { generatePageUrl, buildPaginationUrl, validatePageParam, validatePageParamWithRange, extractPageFromSearchParams } from "@/lib/url-utils"