'use client'

import { Search, X } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect, useTransition } from 'react'
import { useDebounce } from '@/hooks/use-debounce'

export function PluginSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  // URL 파라미터와 동기화
  useEffect(() => {
    const currentQuery = searchParams.get('q') || ''
    setSearchQuery(currentQuery)
  }, [searchParams])

  // 검색어가 변경되면 URL 업데이트
  useEffect(() => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString())
      
      if (debouncedSearchQuery.trim()) {
        params.set('q', debouncedSearchQuery.trim())
        params.delete('page') // 검색 시 첫 페이지로 리셋
      } else {
        params.delete('q')
        params.delete('page')
      }

      const queryString = params.toString()
      const newUrl = queryString ? `/plugins?${queryString}` : '/plugins'
      router.push(newUrl)
    })
  }, [debouncedSearchQuery, router, searchParams])

  const handleClear = () => {
    setSearchQuery('')
    const params = new URLSearchParams(searchParams.toString())
    params.delete('q')
    params.delete('page')
    const queryString = params.toString()
    router.push(queryString ? `/plugins?${queryString}` : '/plugins')
  }

  return (
    <div className="relative mb-6 sm:mb-8">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="search"
          placeholder="플러그인 이름, 제조사, 설명으로 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-10 py-3 sm:py-3.5 border border-gray-300 rounded-lg bg-white text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
        />
        {searchQuery && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="검색어 지우기"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
        {isPending && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
          </div>
        )}
      </div>
    </div>
  )
}
