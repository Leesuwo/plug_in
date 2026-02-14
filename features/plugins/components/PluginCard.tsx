'use client'

import Image from 'next/image'
import { Heart } from 'lucide-react'
import { useState } from 'react'
import type { Plugin } from '../types'

interface PluginCardProps {
  plugin: Plugin
}

export function PluginCard({ plugin }: PluginCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false)

  return (
    <div className="group relative flex flex-col h-full bg-white rounded-lg overflow-hidden transition-shadow hover:shadow-xl border border-gray-100">
      {/* 위시리스트 아이콘 */}
      <button
        onClick={(e) => {
          e.preventDefault()
          setIsWishlisted(!isWishlisted)
        }}
        className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 p-1.5 sm:p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-sm transition-all hover:bg-white hover:scale-110 active:scale-95"
        aria-label="위시리스트에 추가"
      >
        <Heart
          className={`h-4 w-4 sm:h-5 sm:w-5 transition-colors ${
            isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-800'
          }`}
        />
      </button>

      {/* 제조회사명 */}
      <div className="px-4 sm:px-5 md:px-6 pt-4 sm:pt-5 md:pt-6 pb-2 min-h-[20px] sm:min-h-[24px]">
        {plugin.developer && (
          <div className="text-[10px] sm:text-xs font-light text-gray-400 uppercase tracking-wider">
            {plugin.developer}
          </div>
        )}
      </div>

      {/* 플러그인명 */}
      <div className="px-4 sm:px-5 md:px-6 pb-3 sm:pb-4 min-h-[48px] sm:min-h-[56px] md:min-h-[60px]">
        <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-black mb-1 line-clamp-1 sm:line-clamp-2">
          {plugin.name}
        </h3>
        <div className="h-px w-8 sm:w-10 md:w-12 bg-black"></div>
      </div>

      {/* 플러그인 이미지 - 반응형 높이 */}
      <div className="relative w-full h-48 sm:h-56 md:h-64 bg-gradient-to-br from-gray-50 to-gray-100 my-3 sm:my-4 mx-4 sm:mx-5 md:mx-6 rounded-lg overflow-hidden shadow-inner">
        {plugin.imageUrl ? (
          <div className="relative w-full h-full p-3 sm:p-4 md:p-6">
            <Image
              src={plugin.imageUrl}
              alt={plugin.name}
              fill
              className="object-contain drop-shadow-lg"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            />
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-gray-300">
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

      {/* 설명/태그라인 - 반응형 높이 */}
      <div className="px-4 sm:px-5 md:px-6 pb-3 sm:pb-4 min-h-[40px] sm:min-h-[44px] md:min-h-[48px] flex-1">
        {plugin.description ? (
          <p className="text-xs sm:text-sm text-black leading-relaxed line-clamp-2">
            {plugin.description}
          </p>
        ) : (
          <div></div>
        )}
      </div>

      {/* 가격 */}
      <div className="px-4 sm:px-5 md:px-6 pb-4 sm:pb-5 md:pb-6 min-h-[32px] sm:min-h-[36px] md:min-h-[40px]">
        {plugin.price ? (
          <span className="text-xl sm:text-2xl font-bold text-black">
            ${plugin.price.toFixed(2)}
          </span>
        ) : (
          <div className="text-xs sm:text-sm text-gray-400">가격 정보 없음</div>
        )}
      </div>
    </div>
  )
}
