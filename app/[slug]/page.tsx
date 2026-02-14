import { notFound } from 'next/navigation'
import { getPluginBySlug } from '@/features/plugins/hooks/usePlugins'
import { nameToSlug } from '@/features/plugins/utils/slug'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface PluginDetailPageProps {
  params: { slug: string }
}

export default async function PluginDetailPage({ params }: PluginDetailPageProps) {
  const plugin = await getPluginBySlug(params.slug)

  if (!plugin) {
    notFound()
  }

  return (
    <main className="flex-1 p-4 sm:p-6 md:p-8 bg-white min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* 뒤로가기 버튼 */}
        <Link
          href="/plugins"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-black mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">플러그인 목록으로</span>
        </Link>

        {/* 플러그인 상세 정보 */}
        <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
          {/* 이미지 */}
          {plugin.imageUrl && (
            <div className="relative w-full bg-gradient-to-br from-gray-50 to-gray-100">
              <div 
                className="relative w-full"
                style={{ 
                  aspectRatio: '318 / 250',
                  paddingBottom: '78.6%'
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-6 md:p-8">
                  <div className="relative w-full h-full">
                    <Image
                      src={plugin.imageUrl}
                      alt={plugin.name}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, 800px"
                      priority
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 정보 섹션 */}
          <div className="p-6 sm:p-8 md:p-10">
            {/* 제조사 */}
            {plugin.developer && (
              <div className="text-sm sm:text-base text-gray-500 uppercase tracking-wider mb-2">
                {plugin.developer}
              </div>
            )}

            {/* 제목 */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-black mb-4">
              {plugin.name}
            </h1>

            {/* 설명 */}
            {plugin.description && (
              <div className="mb-6 sm:mb-8">
                <p className="text-base sm:text-lg text-gray-700 leading-relaxed whitespace-pre-line">
                  {plugin.description}
                </p>
              </div>
            )}

            {/* 상세 정보 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-6 border-t border-gray-200">
              {/* 가격 */}
              {plugin.price !== undefined && (
                <div>
                  <div className="text-sm text-gray-500 mb-1">가격</div>
                  <div className="text-2xl font-bold text-black">
                    ${plugin.price.toFixed(2)}
                    {plugin.currency && plugin.currency !== 'USD' && (
                      <span className="ml-2 text-lg text-gray-600">{plugin.currency}</span>
                    )}
                  </div>
                </div>
              )}

              {/* 소스 */}
              <div>
                <div className="text-sm text-gray-500 mb-1">소스</div>
                <div className="text-lg font-medium text-black">
                  {plugin.source}
                </div>
              </div>

              {/* 웹사이트 */}
              {plugin.website && (
                <div>
                  <div className="text-sm text-gray-500 mb-1">웹사이트</div>
                  <a
                    href={plugin.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lg text-blue-600 hover:text-blue-800 underline"
                  >
                    방문하기
                  </a>
                </div>
              )}

              {/* 원본 링크 */}
              {plugin.sourceUrl && (
                <div>
                  <div className="text-sm text-gray-500 mb-1">원본 페이지</div>
                  <a
                    href={plugin.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lg text-blue-600 hover:text-blue-800 underline"
                  >
                    보러가기
                  </a>
                </div>
              )}

              {/* 평점 */}
              {plugin.rating !== undefined && (
                <div>
                  <div className="text-sm text-gray-500 mb-1">평점</div>
                  <div className="text-lg font-medium text-black">
                    {plugin.rating.toFixed(1)} / 5.0
                    {plugin.reviewCount !== undefined && (
                      <span className="ml-2 text-sm text-gray-500">
                        ({plugin.reviewCount}개 리뷰)
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* 출시일 */}
              {plugin.releaseDate && (
                <div>
                  <div className="text-sm text-gray-500 mb-1">출시일</div>
                  <div className="text-lg text-black">
                    {plugin.releaseDate.toLocaleDateString('ko-KR')}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
