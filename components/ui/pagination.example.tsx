// Example usage of the Pagination component
// This file demonstrates how to use the Pagination component in a page

import { Pagination } from "./pagination"

// Example 1: Basic usage
function ExampleBasicPagination() {
  return (
    <Pagination
      currentPage={2}
      totalPages={10}
      baseUrl="/dashboard/gyms"
    />
  )
}

// Example 2: With existing query parameters
function ExampleWithQueryParams() {
  return (
    <Pagination
      currentPage={3}
      totalPages={15}
      baseUrl="/dashboard/gyms?search=fitness"
    />
  )
}

// Example 3: With custom styling
function ExampleWithCustomStyling() {
  return (
    <Pagination
      currentPage={1}
      totalPages={5}
      baseUrl="/dashboard/gyms"
      className="border-t-2 border-indigo-200"
    />
  )
}

// Example 4: Integration with table (as it would be used in gyms page)
function ExampleTableIntegration() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Table content would go here */}
      <div className="p-4">
        <p>Table content...</p>
      </div>
      
      {/* Pagination at the bottom */}
      <Pagination
        currentPage={2}
        totalPages={8}
        baseUrl="/dashboard/gyms"
      />
    </div>
  )
}

export {
  ExampleBasicPagination,
  ExampleWithQueryParams,
  ExampleWithCustomStyling,
  ExampleTableIntegration
}