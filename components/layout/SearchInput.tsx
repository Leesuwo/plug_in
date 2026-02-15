'use client'

import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useState, useCallback, useEffect, useRef } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useDebounce } from '@/hooks/use-debounce'
import { useTransition } from 'react'

/**
 * 검색 입력 컴포넌트
 * useSearchParams를 사용하므로 Suspense로 감싸져야 함
 */
export function SearchInput() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  
  // URL에서 검색어 가져오기 (plugins 페이지인 경우)
  const urlQuery = pathname === '/plugins' ? (searchParams.get('q') || '') : ''
  const [searchQuery, setSearchQuery] = useState(urlQuery)
  const debouncedSearchQuery = useDebounce(searchQuery, 300)
  
  // URL 업데이트를 트리거한 내부 변경인지 추적하는 ref
  const isInternalUpdate = useRef(false)

  // URL 파라미터와 동기화하는 함수를 메모이제이션
  const handleSearch = useCallback(
    (query: string) => {
      startTransition(() => {
        const params = new URLSearchParams()
        
        if (query.trim()) {
          params.set('q', query.trim())
        }

        const queryString = params.toString()
        const newUrl = queryString ? `/plugins?${queryString}` : '/plugins'
        
        // 내부 업데이트 플래그 설정
        isInternalUpdate.current = true
        
        // 현재 페이지가 /plugins가 아니면 이동
        if (pathname !== '/plugins') {
          router.push(newUrl)
        } else {
          // 같은 페이지면 replace로 URL만 업데이트
          router.replace(newUrl)
        }
      })
    },
    [router, pathname]
  )

  // URL 파라미터 변경 시 로컬 상태 동기화 (외부 변경에만 반응)
  // searchQuery를 의존성에서 제거: 무한 루프 방지를 위해 의도적으로 제외
  useEffect(() => {
    // 내부 업데이트로 인한 변경이면 무시
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false
      return
    }

    if (pathname === '/plugins') {
      const currentQuery = searchParams.get('q') || ''
      // URL의 검색어와 현재 상태가 다를 때만 업데이트
      setSearchQuery((prevQuery) => {
        if (currentQuery !== prevQuery) {
          return currentQuery
        }
        return prevQuery
      })
    } else {
      // 다른 페이지에서는 검색어 초기화
      setSearchQuery('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, pathname])

  // debounced 검색어 변경 시 URL 업데이트 (plugins 페이지에서만)
  // searchParams를 의존성에서 제거: handleSearch 내부에서 사용하므로 불필요
  useEffect(() => {
    if (pathname === '/plugins') {
      const currentQuery = searchParams.get('q') || ''
      // debounced 값과 URL의 값이 다를 때만 업데이트
      if (debouncedSearchQuery !== currentQuery) {
        handleSearch(debouncedSearchQuery)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchQuery, pathname, handleSearch])

  // Enter 키로 검색
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSearch(searchQuery)
    }
  }

  return (
    <div className="flex-1 max-w-2xl">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-audio-text-muted" />
        <Input
          type="search"
          placeholder="Search plugins, developers, categories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="pl-10 bg-dark-audio-surface-elevated border-dark-audio-border text-dark-audio-text placeholder:text-dark-audio-text-dim focus-visible:ring-dark-audio-cyan"
        />
        {isPending && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-dark-audio-border border-t-dark-audio-cyan rounded-full animate-spin" />
          </div>
        )}
      </div>
    </div>
  )
}
