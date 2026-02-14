# Supabase RLS (Row Level Security) Policies

이 문서는 일반 유저가 플러그인 데이터를 조회할 수 있도록 하는 RLS 정책을 제공합니다.

## 개요

- **Admin Client (Service Role Key)**: RLS를 우회하여 모든 작업(INSERT, UPDATE, DELETE) 가능
- **일반 유저 (Anon Key)**: SELECT만 허용하여 데이터 조회 가능

## SQL Policies

Supabase 대시보드의 SQL Editor에서 다음 쿼리를 실행하세요:

```sql
-- ============================================
-- plugins 테이블: 모든 유저가 조회 가능
-- ============================================

-- SELECT 정책: 모든 유저가 플러그인 데이터를 조회할 수 있음
CREATE POLICY "Allow public read access to plugins"
ON public.plugins
FOR SELECT
TO public
USING (true);

-- ============================================
-- plugin_formats 테이블: 모든 유저가 조회 가능
-- ============================================

-- SELECT 정책: 모든 유저가 플러그인 포맷 데이터를 조회할 수 있음
CREATE POLICY "Allow public read access to plugin_formats"
ON public.plugin_formats
FOR SELECT
TO public
USING (true);

-- ============================================
-- 기존 정책 확인 (선택사항)
-- ============================================

-- 현재 활성화된 정책 확인
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('plugins', 'plugin_formats')
ORDER BY tablename, policyname;
```

## 정책 설명

### `plugins` 테이블
- **SELECT**: 모든 유저(`public`)가 조회 가능
- **INSERT/UPDATE/DELETE**: Service Role Key를 사용하는 Admin Client만 가능 (RLS 우회)

### `plugin_formats` 테이블
- **SELECT**: 모든 유저(`public`)가 조회 가능
- **INSERT/UPDATE/DELETE**: Service Role Key를 사용하는 Admin Client만 가능 (RLS 우회)

## 보안 고려사항

1. **Service Role Key 보호**
   - `.env.local`에만 저장
   - 절대 클라이언트 사이드 코드에 포함하지 않음
   - Git에 커밋하지 않음 (`.gitignore`에 포함)

2. **RLS 활성화**
   - 모든 테이블에서 RLS가 활성화되어 있어야 함
   - Admin Client는 Service Role Key로 RLS를 우회
   - 일반 유저는 Anon Key로 SELECT만 가능

3. **정책 테스트**
   ```sql
   -- Anon Key로 SELECT 테스트 (대시보드에서 실행)
   SELECT * FROM public.plugins LIMIT 5;
   
   -- INSERT 시도 (실패해야 함 - Anon Key는 INSERT 불가)
   -- INSERT INTO public.plugins (name, developer, source) VALUES ('Test', 'Test Dev', 'Manual');
   ```

## 문제 해결

### 정책이 적용되지 않는 경우
1. RLS가 활성화되어 있는지 확인:
   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public' 
     AND tablename IN ('plugins', 'plugin_formats');
   ```

2. RLS 활성화:
   ```sql
   ALTER TABLE public.plugins ENABLE ROW LEVEL SECURITY;
   ALTER TABLE public.plugin_formats ENABLE ROW LEVEL SECURITY;
   ```

### 정책 삭제 (필요한 경우)
```sql
DROP POLICY IF EXISTS "Allow public read access to plugins" ON public.plugins;
DROP POLICY IF EXISTS "Allow public read access to plugin_formats" ON public.plugin_formats;
```
