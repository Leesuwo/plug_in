'use client'

import { Suspense } from 'react'
import { Pagination } from './Pagination'

interface PaginationWrapperProps {
  currentPage: number
  totalPages: number
  basePath?: string
}

/**
 * Pagination을 Suspense로 감싸는 래퍼 컴포넌트
 * useSearchParams를 사용하는 Pagination을 안전하게 렌더링
 */
export function PaginationWrapper({ currentPage, totalPages, basePath }: PaginationWrapperProps) {
  if (totalPages <= 1) {
    return null
  }

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center gap-2 mt-8 sm:mt-12">
          <div className="h-10 w-10 bg-gray-100 rounded-md animate-pulse" />
          <div className="h-10 w-10 bg-gray-100 rounded-md animate-pulse" />
          <div className="h-10 w-10 bg-gray-100 rounded-md animate-pulse" />
        </div>
      }
    >
      <Pagination currentPage={currentPage} totalPages={totalPages} basePath={basePath} />
    </Suspense>
  )
}
