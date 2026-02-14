"use client"

import { Search, Menu } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useState, useCallback, useEffect } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useDebounce } from "@/hooks/use-debounce"
import { useTransition } from "react"

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  
  // URL에서 검색어 가져오기 (plugins 페이지인 경우)
  const urlQuery = pathname === '/plugins' ? (searchParams.get('q') || '') : ''
  const [searchQuery, setSearchQuery] = useState(urlQuery)
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  // URL 파라미터와 동기화
  const handleSearch = useCallback((query: string) => {
    startTransition(() => {
      const params = new URLSearchParams()
      
      if (query.trim()) {
        params.set('q', query.trim())
      }

      const queryString = params.toString()
      const newUrl = queryString ? `/plugins?${queryString}` : '/plugins'
      
      // 현재 페이지가 /plugins가 아니면 이동
      if (pathname !== '/plugins') {
        router.push(newUrl)
      } else {
        // 같은 페이지면 replace로 URL만 업데이트
        router.replace(newUrl)
      }
    })
  }, [router, pathname])

  // URL 파라미터와 동기화 (plugins 페이지에서만)
  useEffect(() => {
    if (pathname === '/plugins') {
      const currentQuery = searchParams.get('q') || ''
      // URL의 검색어와 현재 상태가 다를 때만 업데이트 (무한 루프 방지)
      if (currentQuery !== searchQuery) {
        setSearchQuery(currentQuery)
      }
    } else {
      // 다른 페이지에서는 검색어 초기화
      setSearchQuery('')
    }
  }, [searchParams, pathname]) // searchQuery는 의존성에서 제외

  // 검색어가 변경되면 URL 업데이트 (plugins 페이지에서만)
  useEffect(() => {
    if (pathname === '/plugins') {
      const currentQuery = searchParams.get('q') || ''
      // debounced 값과 URL의 값이 다를 때만 업데이트
      if (debouncedSearchQuery !== currentQuery) {
        handleSearch(debouncedSearchQuery)
      }
    }
  }, [debouncedSearchQuery, pathname, handleSearch, searchParams])

  // Enter 키로 검색
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSearch(searchQuery)
    }
  }

  return (
    <header className="h-16 border-b border-dark-audio-border bg-dark-audio-surface flex items-center px-4 sm:px-6 gap-4">
      {/* Mobile Menu Button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg text-dark-audio-text-muted hover:bg-dark-audio-surface-elevated hover:text-dark-audio-text transition-colors"
        aria-label="메뉴 열기"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Search Bar */}
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
    </header>
  )
}
