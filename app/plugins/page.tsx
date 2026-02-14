import { getPlugins } from '@/features/plugins/hooks/usePlugins'
import { PluginCard } from '@/features/plugins/components/PluginCard'
import type { Plugin } from '@/features/plugins/types'

export default async function PluginsPage() {
  let plugins: Plugin[] = []
  let error: string | null = null

  try {
    plugins = await getPlugins()
  } catch (err) {
    error = err instanceof Error ? err.message : '플러그인을 불러오는 중 오류가 발생했습니다.'
    console.error('플러그인 로드 오류:', err)
  }

  return (
    <main className="flex-1 p-4 sm:p-6 md:p-8 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 text-black">
            Browse Plugins
          </h1>
          <p className="text-gray-600 text-base sm:text-lg">
            {plugins.length}개의 플러그인을 탐색하세요
          </p>
        </div>

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
          <div className="grid grid-cols-1 gap-4 sm:gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 items-stretch">
            {plugins.map((plugin) => (
              <PluginCard key={plugin.id} plugin={plugin} />
            ))}
          </div>
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
