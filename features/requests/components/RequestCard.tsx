'use client'

import { useMemo } from 'react'
import type { PluginRequest } from '../types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ExternalLink } from 'lucide-react'

interface RequestCardProps {
  request: PluginRequest
}

export function RequestCard({ request }: RequestCardProps) {
  // 날짜 포맷팅을 메모이제이션하여 불필요한 재계산 방지
  const createdAt = useMemo(
    () =>
      new Date(request.created_at).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    [request.created_at]
  )

  return (
    <Card className="bg-dark-audio-surface border-dark-audio-border hover:border-dark-audio-border-light transition-colors">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg sm:text-xl text-dark-audio-text line-clamp-2">
          {request.plugin_name}
        </CardTitle>
        {request.developer && (
          <p className="text-sm text-dark-audio-text-muted mt-1">
            사이트: {request.developer}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {request.description && (
          <p className="text-sm text-dark-audio-text leading-relaxed line-clamp-3">
            {request.description}
          </p>
        )}
        <div className="flex items-center justify-between gap-4 pt-2 border-t border-dark-audio-border">
          <span className="text-xs text-dark-audio-text-dim">
            {createdAt}
          </span>
          {request.website_url && (
            <a
              href={request.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-dark-audio-cyan hover:text-dark-audio-cyan-light transition-colors"
            >
              <span>웹사이트</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
