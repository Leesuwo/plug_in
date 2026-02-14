import { createClient } from '@supabase/supabase-js'
import type { Plugin } from '@/features/plugins/types'
import type { Database } from '@/src/types/supabase'

/**
 * Supabase에 플러그인 데이터 저장
 * 중복 체크 후 새 플러그인만 삽입
 */
export async function savePluginsToSupabase(plugins: Plugin[]): Promise<void> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase 환경 변수가 설정되지 않았습니다. NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY를 확인하세요.')
  }

  const supabase = createClient<Database>(supabaseUrl, supabaseKey)
  let savedCount = 0
  let skippedCount = 0

  console.log(`\nSupabase에 ${plugins.length}개의 플러그인 저장 중...`)

  for (const plugin of plugins) {
    try {
      // 중복 체크: 같은 이름, 개발자, 소스의 플러그인이 이미 존재하는지 확인
      const { data: existing } = await supabase
        .from('plugins')
        .select('id')
        .eq('name', plugin.name)
        .eq('developer', plugin.developer)
        .eq('source', plugin.source)
        .single()

      if (existing) {
        // 기존 플러그인 업데이트
        const { error: updateError } = await supabase
          .from('plugins')
          .update({
            description: plugin.description || null,
            price: plugin.price || null,
            currency: plugin.currency || 'USD',
            image_url: plugin.imageUrl || null,
            source_url: plugin.sourceUrl || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id)

        if (updateError) {
          console.warn(`플러그인 업데이트 실패 (${plugin.name}):`, updateError.message)
        } else {
          savedCount++
        }
        skippedCount++
        continue
      }

      // 새 플러그인 삽입
      const { data: insertedPlugin, error: insertError } = await supabase
        .from('plugins')
        .insert({
          name: plugin.name,
          developer: plugin.developer,
          description: plugin.description || null,
          price: plugin.price || null,
          currency: plugin.currency || 'USD',
          image_url: plugin.imageUrl || null,
          website_url: plugin.website || null,
          source: plugin.source,
          source_url: plugin.sourceUrl || null,
          release_date: plugin.releaseDate?.toISOString().split('T')[0] || null,
          last_updated: plugin.lastUpdated?.toISOString() || null,
        })
        .select('id')
        .single()

      if (insertError) {
        console.warn(`플러그인 저장 실패 (${plugin.name}):`, insertError.message)
        continue
      }

      // 플러그인 포맷 저장
      if (plugin.formats && plugin.formats.length > 0 && insertedPlugin) {
        const formats = plugin.formats.map(format => ({
          plugin_id: insertedPlugin.id,
          format: format,
        }))

        const { error: formatsError } = await supabase
          .from('plugin_formats')
          .upsert(formats, { onConflict: 'plugin_id,format' })

        if (formatsError) {
          console.warn(`플러그인 포맷 저장 실패 (${plugin.name}):`, formatsError.message)
        }
      }

      // 플러그인 카테고리 저장 (테이블 생성 후 활성화)
      // if (plugin.category && insertedPlugin) {
      //   const { error: categoryError } = await supabase
      //     .from('plugin_categories')
      //     .upsert({
      //       plugin_id: insertedPlugin.id,
      //       category: plugin.category,
      //     }, { onConflict: 'plugin_id,category' })
      //
      //   if (categoryError) {
      //     console.warn(`플러그인 카테고리 저장 실패 (${plugin.name}):`, categoryError.message)
      //   }
      // }

      // 플러그인 태그 저장 (테이블 생성 후 활성화)
      // if (plugin.tags && plugin.tags.length > 0 && insertedPlugin) {
      //   const tags = plugin.tags.map(tag => ({
      //     plugin_id: insertedPlugin.id,
      //     tag: tag,
      //   }))
      //
      //   const { error: tagsError } = await supabase
      //     .from('plugin_tags')
      //     .upsert(tags, { onConflict: 'plugin_id,tag' })
      //
      //   if (tagsError) {
      //     console.warn(`플러그인 태그 저장 실패 (${plugin.name}):`, tagsError.message)
      //   }
      // }

      savedCount++
    } catch (error) {
      console.error(`플러그인 처리 중 오류 (${plugin.name}):`, error)
    }
  }

  console.log(`\n저장 완료: ${savedCount}개 저장, ${skippedCount}개 건너뜀`)
}
