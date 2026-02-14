'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CreatePluginRequestSchema, type CreatePluginRequestInput } from '../types'

/**
 * 플러그인 요청 생성 훅 (클라이언트 사이드)
 */
export function useCreateRequest() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createRequest = async (input: CreatePluginRequestInput) => {
    setIsLoading(true)
    setError(null)

    try {
      // Zod 스키마로 검증
      const validated = CreatePluginRequestSchema.parse(input)

      const supabase = createClient()
      
      // plugin_requests 테이블이 타입에 아직 없으므로 타입 단언 사용
      const { data, error: insertError } = await (supabase as any)
        .from('plugin_requests')
        .insert({
          plugin_name: validated.plugin_name,
          developer: validated.developer || null,
          description: validated.description || null,
          website_url: validated.website_url || null,
        })
        .select()
        .single()

      if (insertError) {
        throw new Error(insertError.message)
      }

      return { success: true, data }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '요청 생성에 실패했습니다.'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  return { createRequest, isLoading, error }
}
