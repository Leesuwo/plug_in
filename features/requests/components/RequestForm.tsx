'use client'

import { useState } from 'react'
import { useCreateRequest } from '../hooks/useCreateRequest'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Send } from 'lucide-react'

export function RequestForm() {
  const { createRequest, isLoading, error } = useCreateRequest()
  const [formData, setFormData] = useState({
    plugin_name: '',
    developer: '',
    description: '',
    website_url: '',
  })
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitSuccess(false)

    const result = await createRequest(formData)

    if (result.success) {
      setFormData({
        plugin_name: '',
        developer: '',
        description: '',
        website_url: '',
      })
      setSubmitSuccess(true)
      // 3초 후 성공 메시지 숨기기
      setTimeout(() => setSubmitSuccess(false), 3000)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <Card className="bg-dark-audio-surface border-dark-audio-border">
      <CardHeader>
        <CardTitle className="text-xl sm:text-2xl text-dark-audio-text">
          플러그인 요청하기
        </CardTitle>
        <CardDescription className="text-dark-audio-text-muted">
          추가하고 싶은 플러그인을 요청해주세요.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="plugin_name"
              className="text-sm font-medium text-dark-audio-text"
            >
              플러그인 이름 <span className="text-red-500">*</span>
            </label>
            <Input
              id="plugin_name"
              name="plugin_name"
              value={formData.plugin_name}
              onChange={handleChange}
              placeholder="예: Serum, Massive X"
              required
              className="bg-dark-audio-surface-elevated border-dark-audio-border text-dark-audio-text placeholder:text-dark-audio-text-dim focus-visible:ring-dark-audio-cyan"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="description"
              className="text-sm font-medium text-dark-audio-text"
            >
              내용
            </label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="플러그인에 대한 추가 정보나 요청 사유를 입력해주세요"
              rows={4}
              className="bg-dark-audio-surface-elevated border-dark-audio-border text-dark-audio-text placeholder:text-dark-audio-text-dim focus-visible:ring-dark-audio-cyan resize-none"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="developer"
              className="text-sm font-medium text-dark-audio-text"
            >
              사이트
            </label>
            <Input
              id="developer"
              name="developer"
              value={formData.developer}
              onChange={handleChange}
              placeholder="예: Xfer Records, Native Instruments"
              className="bg-dark-audio-surface-elevated border-dark-audio-border text-dark-audio-text placeholder:text-dark-audio-text-dim focus-visible:ring-dark-audio-cyan"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="website_url"
              className="text-sm font-medium text-dark-audio-text"
            >
              사이트 URL <span className="text-dark-audio-text-dim text-xs">(선택)</span>
            </label>
            <Input
              id="website_url"
              name="website_url"
              type="url"
              value={formData.website_url}
              onChange={handleChange}
              placeholder="https://example.com"
              className="bg-dark-audio-surface-elevated border-dark-audio-border text-dark-audio-text placeholder:text-dark-audio-text-dim focus-visible:ring-dark-audio-cyan"
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md">
              <p className="text-sm text-red-500">{error}</p>
            </div>
          )}

          {submitSuccess && (
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-md">
              <p className="text-sm text-green-500">
                요청이 성공적으로 제출되었습니다!
              </p>
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-dark-audio-cyan hover:bg-dark-audio-cyan-light text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                제출 중...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                요청 제출
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
