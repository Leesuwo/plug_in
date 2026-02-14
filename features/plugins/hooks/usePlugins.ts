import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/src/types/supabase'

type PluginRow = Database['public']['Tables']['plugins']['Row']

/**
 * Supabase 플러그인 데이터를 Plugin 타입으로 변환
 */
function transformPlugin(row: PluginRow) {
  return {
    id: row.id,
    name: row.name,
    developer: row.developer,
    description: row.description || undefined,
    formats: [], // TODO: plugin_formats 테이블에서 조인 필요
    category: 'Other' as const, // TODO: plugin_categories 테이블에서 조인 필요
    tags: [], // TODO: plugin_tags 테이블에서 조인 필요
    price: row.price ?? undefined,
    currency: row.currency || 'USD',
    website: row.website_url || undefined,
    imageUrl: row.image_url || undefined,
    rating: row.rating ?? undefined,
    reviewCount: row.review_count ?? undefined,
    releaseDate: row.release_date ? new Date(row.release_date) : undefined,
    lastUpdated: row.last_updated ? new Date(row.last_updated) : undefined,
    source: row.source as 'KVR' | 'Splice' | 'Plugin Alliance' | 'Manual' | 'Other',
    sourceUrl: row.source_url || undefined,
  }
}

/**
 * 모든 플러그인 가져오기
 */
export async function getPlugins() {
  // 환경 변수 확인
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL 환경 변수가 설정되지 않았습니다.')
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY 환경 변수가 설정되지 않았습니다.')
  }

  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('plugins')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Supabase 쿼리 오류:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    })
    throw new Error(`플러그인 데이터를 가져오는데 실패했습니다: ${error.message} (코드: ${error.code})`)
  }

  if (!data) {
    console.warn('플러그인 데이터가 null입니다.')
    return []
  }

  console.log(`[getPlugins] ${data.length}개의 플러그인을 불러왔습니다.`)
  return data.map(transformPlugin)
}

/**
 * 플러그인 ID로 가져오기
 */
export async function getPluginById(id: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('plugins')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    throw new Error(`플러그인을 찾을 수 없습니다: ${error.message}`)
  }

  return transformPlugin(data)
}
