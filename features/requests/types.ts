import { z } from 'zod'

// 플러그인 요청 인터페이스
export interface PluginRequest {
  id: string
  plugin_name: string
  developer?: string
  description?: string
  website_url?: string
  created_at: string
  updated_at: string
}

// 플러그인 요청 생성 스키마 (Zod)
export const CreatePluginRequestSchema = z.object({
  plugin_name: z
    .string()
    .min(1, '플러그인 이름을 입력해주세요')
    .max(200, '플러그인 이름은 200자 이하여야 합니다'),
  developer: z
    .string()
    .max(100, '개발자 이름은 100자 이하여야 합니다')
    .optional(),
  description: z
    .string()
    .max(1000, '설명은 1000자 이하여야 합니다')
    .optional(),
  website_url: z
    .string()
    .url('올바른 URL 형식이 아닙니다')
    .optional()
    .or(z.literal('')),
})

export type CreatePluginRequestInput = z.infer<typeof CreatePluginRequestSchema>
