'use client'

import { useMemo, useCallback } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

interface PaginationProps {
  currentPage: number
  totalPages: number
  basePath?: string
}

export function Pagination({ currentPage, totalPages, basePath = '/plugins' }: PaginationProps) {
  const searchParams = useSearchParams()
  
  // 현재 검색 파라미터 유지하면서 페이지 번호만 변경하는 함수를 메모이제이션
  const createPageUrl = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString())
      if (page === 1) {
        params.delete('page')
      } else {
        params.set('page', page.toString())
      }
      const queryString = params.toString()
      return queryString ? `${basePath}?${queryString}` : basePath
    },
    [searchParams, basePath]
  )

  // 표시할 페이지 번호들 계산을 메모이제이션하여 불필요한 재계산 방지
  const pageNumbers = useMemo(() => {
    const pages: (number | string)[] = []
    const maxVisible = 7 // 최대 표시할 페이지 번호 수
    
    if (totalPages <= maxVisible) {
      // 전체 페이지가 적으면 모두 표시
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // 현재 페이지 주변 페이지 표시
      if (currentPage <= 4) {
        // 앞부분
        for (let i = 1; i <= 5; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 3) {
        // 뒷부분
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        // 중간
        pages.push(1)
        pages.push('...')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      }
    }
    
    return pages
  }, [currentPage, totalPages])

  if (totalPages <= 1) {
    return null
  }

  return (
    <nav className="flex items-center justify-center gap-2 mt-8 sm:mt-12" aria-label="페이지네이션">
      {/* 이전 페이지 버튼 */}
      <Link
        href={createPageUrl(currentPage - 1)}
        className={`flex items-center justify-center w-10 h-10 rounded-md border transition-colors ${
          currentPage === 1
            ? 'border-gray-200 text-gray-400 cursor-not-allowed pointer-events-none'
            : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
        }`}
        aria-label="이전 페이지"
        aria-disabled={currentPage === 1}
      >
        <ChevronLeft className="w-5 h-5" />
      </Link>

      {/* 페이지 번호 */}
      <div className="flex items-center gap-1">
        {pageNumbers.map((page, index) => {
          if (page === '...') {
            return (
              <span key={`ellipsis-${index}`} className="px-2 text-gray-400">
                ...
              </span>
            )
          }

          const pageNum = page as number
          const isActive = pageNum === currentPage

          return (
            <Link
              key={pageNum}
              href={createPageUrl(pageNum)}
              className={`flex items-center justify-center min-w-[40px] h-10 px-3 rounded-md border text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-black text-white border-black'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
              }`}
              aria-label={`페이지 ${pageNum}`}
              aria-current={isActive ? 'page' : undefined}
            >
              {pageNum}
            </Link>
          )
        })}
      </div>

      {/* 다음 페이지 버튼 */}
      <Link
        href={createPageUrl(currentPage + 1)}
        className={`flex items-center justify-center w-10 h-10 rounded-md border transition-colors ${
          currentPage === totalPages
            ? 'border-gray-200 text-gray-400 cursor-not-allowed pointer-events-none'
            : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
        }`}
        aria-label="다음 페이지"
        aria-disabled={currentPage === totalPages}
      >
        <ChevronRight className="w-5 h-5" />
      </Link>
    </nav>
  )
}
