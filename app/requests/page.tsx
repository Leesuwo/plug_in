import { getRequestsPaginated } from '@/features/requests/hooks/useRequests'
import { RequestCard } from '@/features/requests/components/RequestCard'
import { RequestForm } from '@/features/requests/components/RequestForm'
import { PaginationWrapper } from '@/features/plugins/components/PaginationWrapper'
import type { PluginRequest } from '@/features/requests/types'

interface RequestsPageProps {
  searchParams: { page?: string }
}

export default async function RequestsPage({ searchParams }: RequestsPageProps) {
  const currentPage = parseInt(searchParams.page || '1', 10) || 1
  const pageSize = 20

  let requests: PluginRequest[] = []
  let totalCount = 0
  let totalPages = 0
  let error: string | null = null

  try {
    const result = await getRequestsPaginated(currentPage, pageSize)
    requests = result.requests
    totalCount = result.totalCount
    totalPages = result.totalPages
  } catch (err) {
    error = err instanceof Error ? err.message : '요청을 불러오는 중 오류가 발생했습니다.'
    console.error('요청 로드 오류:', err)
  }

  return (
    <main className="flex-1 p-4 sm:p-6 md:p-8 bg-dark-audio-bg min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* 페이지 헤더 */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-dark-audio-text">
            플러그인 요청 게시판
          </h1>
          <p className="text-sm sm:text-base text-dark-audio-text-muted">
            추가하고 싶은 플러그인을 요청해주세요. 비회원도 요청할 수 있습니다.
          </p>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <h3 className="text-red-500 font-semibold mb-2">오류 발생</h3>
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* 요청 목록 */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {requests.length > 0 ? (
              <>
                <div className="grid grid-cols-1 gap-4 sm:gap-6">
                  {requests.map((request) => (
                    <RequestCard key={request.id} request={request} />
                  ))}
                </div>
                {/* 페이지네이션 */}
                <PaginationWrapper currentPage={currentPage} totalPages={totalPages} basePath="/requests" />
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <svg
                  className="mb-4 h-16 w-16 text-dark-audio-text-dim"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h2 className="mb-2 text-xl font-semibold text-dark-audio-text">
                  아직 요청이 없습니다
                </h2>
                <p className="text-dark-audio-text-muted">
                  첫 번째 플러그인 요청을 작성해보세요!
                </p>
              </div>
            )}
          </div>

          {/* 요청 폼 */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <RequestForm />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
