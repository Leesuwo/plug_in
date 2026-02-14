import { Suspense } from 'react'
import { getPluginsPaginated } from '@/features/plugins/hooks/usePlugins'
import { PluginCard } from '@/features/plugins/components/PluginCard'
import { Pagination } from '@/features/plugins/components/Pagination'
import { PluginSearch } from '@/features/plugins/components/PluginSearch'
import type { Plugin } from '@/features/plugins/types'

interface PluginsPageProps {
  searchParams: { page?: string; q?: string }
}

export default async function PluginsPage({ searchParams }: PluginsPageProps) {
  const currentPage = parseInt(searchParams.page || '1', 10) || 1
  const pageSize = 20
  const searchQuery = searchParams.q || undefined

  let plugins: Plugin[] = []
  let totalCount = 0
  let totalPages = 0
  let error: string | null = null

  try {
    const result = await getPluginsPaginated(currentPage, pageSize, searchQuery)
    plugins = result.plugins
    totalCount = result.totalCount
    totalPages = result.totalPages
  } catch (err) {
    error = err instanceof Error ? err.message : '플러그인을 불러오는 중 오류가 발생했습니다.'
    console.error('플러그인 로드 오류:', err)
  }

  return (
    <main className="flex-1 p-4 sm:p-6 md:p-8 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* 검색바 */}
        <Suspense fallback={<div className="h-14 mb-6" />}>
          <PluginSearch />
        </Suspense>

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="text-red-800 font-semibold mb-2">오류 발생</h3>
            <p className="text-red-600 text-sm">{error}</p>
            <p className="text-red-500 text-xs mt-2">
              개발자 콘솔을 확인하거나 환경 변수 설정을 확인해주세요.
            </p>
          </div>
        )}

        {/* 플러그인 그리드 */}
        {plugins.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-4 sm:gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 items-stretch">
              {plugins.map((plugin) => (
                <PluginCard key={plugin.id} plugin={plugin} />
              ))}
            </div>
            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <Suspense fallback={<div className="h-10" />}>
                <Pagination currentPage={currentPage} totalPages={totalPages} />
              </Suspense>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <svg
              className="mb-4 h-16 w-16 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
              />
            </svg>
            <h2 className="mb-2 text-xl font-semibold text-black">
              플러그인이 없습니다
            </h2>
            <p className="text-gray-600">
              크롤링을 실행하여 플러그인 데이터를 수집하세요
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
