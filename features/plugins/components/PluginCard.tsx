'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { Plugin } from '../types'
import { nameToSlug } from '../utils/slug'

interface PluginCardProps {
  plugin: Plugin
  index?: number // 첫 화면 이미지 priority 최적화를 위한 인덱스
}

export function PluginCard({ plugin, index = 0 }: PluginCardProps) {
  // slug 계산을 메모이제이션하여 불필요한 재계산 방지
  const slug = useMemo(() => nameToSlug(plugin.name), [plugin.name])
  
  // 첫 화면 이미지(상위 8개)는 priority로 설정하여 LCP 개선
  const isPriorityImage = index < 8
  
  // 이미지 로딩 상태 추적
  const [imageLoading, setImageLoading] = useState(true)
  const [imageError, setImageError] = useState(false)

  return (
    <Link
      href={`/${slug}`}
      className="group relative flex flex-col h-full bg-white rounded-lg overflow-hidden border border-gray-100 transition-shadow hover:shadow-lg"
      prefetch={true} // 링크 prefetch로 페이지 전환 속도 개선
    >
      {/* plugin-item-box2: 이미지 박스 영역 */}
      <div className="relative w-full">
        {/* plugin-item-img: 이미지 영역 */}
        <div 
          className="relative w-full overflow-hidden bg-gray-50"
          style={{ 
            aspectRatio: '318 / 250', // HTML의 width="318" height="250" 참고
            paddingBottom: '78.6%' // 250/318 ≈ 0.786
          }}
        >
          {plugin.imageUrl && !imageError ? (
            <div className="absolute inset-0 flex items-center justify-center p-1 sm:p-2 md:p-3">
              {/* 로딩 스켈레톤 */}
              {imageLoading && (
                <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse" />
              )}
              <div className="relative w-full h-full">
                <Image
                  src={plugin.imageUrl}
                  alt={plugin.name}
                  fill
                  className={`object-contain transition-opacity duration-300 ${
                    imageLoading ? 'opacity-0' : 'opacity-100'
                  }`}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                  priority={isPriorityImage}
                  quality={85} // 품질과 용량의 균형 (기본값 75보다 약간 높게)
                  loading={isPriorityImage ? undefined : 'lazy'} // priority가 아닌 경우 lazy loading 명시
                  onLoad={() => setImageLoading(false)}
                  onError={() => {
                    setImageError(true)
                    setImageLoading(false)
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-300 bg-gray-50">
              <svg
                className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16"
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
            </div>
          )}
        </div>
      </div>

      {/* plugin-item-title: 제목 */}
      <div className="px-4 sm:px-5 md:px-6 pt-4 sm:pt-5 md:pt-6">
        <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-black mb-2 sm:mb-2 line-clamp-2">
          {plugin.name}
        </h3>
        {plugin.developer && (
          <div className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
            {plugin.developer}
          </div>
        )}
      </div>

      {/* plugin-item-description: 설명 */}
      {plugin.description && (
        <div className="flex flex-col flex-1 px-4 sm:px-5 md:px-6 pb-4 sm:pb-5 md:pb-6">
          <p className="text-xs sm:text-sm md:text-base text-black leading-relaxed line-clamp-3 sm:line-clamp-4 md:line-clamp-5">
            {plugin.description}
          </p>
        </div>
      )}
    </Link>
  )
}
