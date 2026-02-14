/**
 * 플러그인 이름을 URL-safe slug로 변환
 * 예: "bx_tonebox" -> "bx-tonebox", "FG-DS 902" -> "fg-ds-902"
 */
export function nameToSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // 특수문자 제거 (언더스코어, 하이픈 제외)
    .replace(/[\s_]+/g, '-') // 공백과 언더스코어를 하이픈으로 변환
    .replace(/-+/g, '-') // 연속된 하이픈을 하나로
    .replace(/^-|-$/g, '') // 앞뒤 하이픈 제거
}

/**
 * slug를 원래 이름과 비교 가능한 형태로 변환
 * 검색 시 사용 (부분 일치를 위해)
 */
export function slugToSearchPattern(slug: string): string {
  return slug
    .replace(/-/g, ' ') // 하이픈을 공백으로
    .replace(/_/g, ' ') // 언더스코어를 공백으로
    .trim()
}
