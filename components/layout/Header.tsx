'use client'

import { Menu } from 'lucide-react'
import { Suspense } from 'react'
import { SearchInput } from './SearchInput'

interface HeaderProps {
  onMenuClick: () => void
}

/**
 * Header 컴포넌트
 * 정적 UI(메뉴 버튼)와 동적 검색 로직을 분리
 * SearchInput은 Suspense로 감싸져 있어 페이지를 정적으로 렌더링 가능
 */
export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="h-16 border-b border-dark-audio-border bg-dark-audio-surface flex items-center px-4 sm:px-6 gap-4">
      {/* Mobile Menu Button - 정적 UI */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg text-dark-audio-text-muted hover:bg-dark-audio-surface-elevated hover:text-dark-audio-text transition-colors"
        aria-label="메뉴 열기"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Search Bar - 동적 로직 (Suspense로 감싸짐) */}
      <Suspense
        fallback={
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <div className="h-10 w-full bg-dark-audio-surface-elevated border border-dark-audio-border rounded-md animate-pulse" />
            </div>
          </div>
        }
      >
        <SearchInput />
      </Suspense>
    </header>
  )
}
