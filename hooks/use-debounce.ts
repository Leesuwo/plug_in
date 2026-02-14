import { useEffect, useState } from 'react'

/**
 * 값을 디바운싱하는 커스텀 훅
 * 검색 입력 및 API 호출에 유용함
 * 
 * @param value - 디바운싱할 값
 * @param delay - 지연 시간(밀리초, 기본값: 500ms)
 * @returns 디바운싱된 값
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    // 지연 시간 후 디바운싱된 값을 업데이트하기 위한 타이머 설정
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // 정리: 지연 시간이 완료되기 전에 값이 변경되면 타이머 취소
    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}
