# 구글 로그인 설정 가이드

이 프로젝트는 Supabase Auth를 사용하여 구글 로그인만 지원합니다.

## 1. Supabase 프로젝트 설정

### 1.1 데이터베이스 마이그레이션 실행

Supabase Dashboard의 SQL Editor에서 다음 순서로 SQL 스크립트를 실행하세요:

1. **프로필 테이블 생성**
   - `supabase/migrations/001_create_profiles_table.sql` 파일의 내용을 복사하여 실행

2. **프로필 자동 생성 트리거 설정**
   - `supabase/migrations/002_create_profile_trigger.sql` 파일의 내용을 복사하여 실행

### 1.2 구글 OAuth 설정

#### Step 1: Supabase 프로젝트 URL 확인

1. **Supabase Dashboard** 접속
2. 프로젝트 설정에서 **API Settings** 또는 **Project URL** 확인
3. 프로젝트 URL 형식: `https://[YOUR_PROJECT_REF].supabase.co`
   - 예: `https://abcdefghijklmnop.supabase.co`
4. **콜백 URL 형식**: `https://[YOUR_PROJECT_REF].supabase.co/auth/v1/callback`
   - 예: `https://abcdefghijklmnop.supabase.co/auth/v1/callback`

#### Step 2: Google Cloud Console 설정

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 프로젝트 선택 또는 새 프로젝트 생성
3. **APIs & Services** → **Credentials** 이동
4. **+ CREATE CREDENTIALS** → **OAuth 2.0 Client ID** 클릭
5. **OAuth consent screen** 설정 (처음인 경우):
   - User Type: **External** 선택
   - App name, User support email 등 필수 정보 입력
   - **Save and Continue** 클릭
6. **OAuth 2.0 Client ID** 생성:
   - **Application type**: **Web application** 선택
   - **Name**: 원하는 이름 입력 (예: "Audio Plugin Archive")
   - **Authorized redirect URIs**: **반드시 다음 형식으로 추가**
     ```
     https://[YOUR_PROJECT_REF].supabase.co/auth/v1/callback
     ```
     - ⚠️ **중요**: `[YOUR_PROJECT_REF]`를 실제 Supabase 프로젝트 ID로 교체
     - 예: `https://abcdefghijklmnop.supabase.co/auth/v1/callback`
     - **http가 아닌 https 사용**
     - **경로 끝에 `/` 없이 정확히 일치해야 함**
   - **CREATE** 클릭
7. 생성된 **Client ID**와 **Client Secret** 복사 (나중에 다시 볼 수 없으므로 저장)

#### Step 3: Supabase에 Google OAuth 설정

1. **Supabase Dashboard** → **Authentication** → **Providers** 이동
2. **Google** 제공자 찾기
3. **Enable Google** 토글 활성화
4. **Client ID (for OAuth)** 필드에 Google Cloud Console에서 복사한 Client ID 붙여넣기
5. **Client Secret (for OAuth)** 필드에 Google Cloud Console에서 복사한 Client Secret 붙여넣기
6. **Save** 클릭

#### ⚠️ redirect_uri_mismatch 오류 해결 방법

이 오류가 발생하면 다음을 확인하세요:

1. **Google Cloud Console** → **Credentials** → 해당 OAuth 2.0 Client ID 클릭
2. **Authorized redirect URIs** 섹션 확인
3. 다음 형식의 URL이 **정확히** 포함되어 있는지 확인:
   ```
   https://[YOUR_PROJECT_REF].supabase.co/auth/v1/callback
   ```
4. 확인 사항:
   - ✅ `https://`로 시작 (http 아님)
   - ✅ 프로젝트 ID가 정확히 일치
   - ✅ 경로가 `/auth/v1/callback`로 정확히 일치 (끝에 `/` 없음)
   - ✅ 대소문자 구분 (모두 소문자)
5. URL이 없거나 다르면 **+ ADD URI** 클릭하여 추가
6. 변경 사항 저장 후 **몇 분 대기** (Google 설정 반영 시간)
7. 브라우저 캐시 삭제 후 다시 시도

### 1.3 Redirect URL 설정

Supabase Dashboard → **Authentication** → **URL Configuration**에서:

- **Site URL**: `http://localhost:3000` (개발 환경) 또는 프로덕션 URL
- **Redirect URLs**: 다음 URL 추가
  ```
  http://localhost:3000/auth/callback
  https://yourdomain.com/auth/callback
  ```

## 2. 환경 변수 확인

`.env.local` 파일에 다음 변수가 설정되어 있는지 확인:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 3. 타입 재생성 (선택사항)

데이터베이스 스키마 변경 후 Supabase 타입을 재생성하려면:

```bash
npm run gen-types
```

또는 Supabase CLI 사용:

```bash
npx supabase gen types typescript --project-id [YOUR_PROJECT_ID] --schema public > src/types/supabase.ts
```

## 4. 회원가입/로그인 플로우

이 애플리케이션은 **구글 계정으로 회원가입과 로그인을 모두 지원**합니다:

### 자동 회원가입
- 처음 구글 로그인을 시도하면 자동으로 회원가입이 진행됩니다
- Supabase Auth가 자동으로 사용자 계정을 생성합니다
- 데이터베이스 트리거가 자동으로 `profiles` 테이블에 프로필을 생성합니다

### 로그인
- 이미 가입한 사용자는 동일한 버튼으로 로그인할 수 있습니다
- 구글 계정 인증 후 자동으로 로그인됩니다

### 프로필 자동 생성
- 회원가입 시 다음 정보가 자동으로 저장됩니다:
  - 이메일 주소
  - 이름 (Google 프로필에서 가져옴)
  - 프로필 이미지 URL (Google 프로필에서 가져옴)
  - 인증 제공자 (google)

## 5. 테스트

1. 개발 서버 실행:
   ```bash
   npm run dev
   ```

2. 브라우저에서 `http://localhost:3000` 접속
3. Header의 "Sign up / Sign in with Google" 버튼 클릭
4. 구글 계정 선택 및 권한 승인
5. 자동으로 회원가입/로그인 처리됨
6. 로그인 성공 시 프로필 정보가 자동으로 `profiles` 테이블에 생성됨
7. 사이드바 상단에 사용자 정보가 표시됨

## 6. 테이블 구조

### profiles 테이블

| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| `id` | UUID (PK, FK) | auth.users.id와 동일 |
| `email` | TEXT | 사용자 이메일 |
| `full_name` | TEXT (nullable) | 사용자 전체 이름 |
| `avatar_url` | TEXT (nullable) | 프로필 이미지 URL |
| `provider` | TEXT | 인증 제공자 (현재는 'google'만 지원) |
| `created_at` | TIMESTAMPTZ | 생성 시간 |
| `updated_at` | TIMESTAMPTZ | 수정 시간 |

### RLS (Row Level Security) 정책

- 사용자는 자신의 프로필만 조회 가능
- 사용자는 자신의 프로필만 수정 가능
- 사용자는 자신의 프로필만 삽입 가능 (회원가입 시)

## 7. 트러블슈팅

### 문제: "인증 코드가 없습니다" 오류

- **원인**: OAuth 콜백 URL이 올바르게 설정되지 않음
- **해결**: Supabase Dashboard에서 Redirect URLs 확인

### 문제: 프로필이 자동 생성되지 않음

- **원인**: 트리거 함수가 제대로 실행되지 않음
- **해결**: `002_create_profile_trigger.sql` 스크립트 재실행 확인

### 문제: 구글 로그인 버튼 클릭 시 오류

- **원인**: Google OAuth Client ID/Secret이 올바르게 설정되지 않음
- **해결**: Supabase Dashboard의 Google Provider 설정 확인

### 문제: "400 오류: redirect_uri_mismatch" 오류

- **원인**: Google Cloud Console의 Authorized redirect URIs에 Supabase 콜백 URL이 정확히 일치하지 않음
- **해결 방법**:
  1. Supabase Dashboard에서 프로젝트 URL 확인 (예: `https://abcdefghijklmnop.supabase.co`)
  2. Google Cloud Console → Credentials → 해당 OAuth 2.0 Client ID 클릭
  3. Authorized redirect URIs에 다음 URL이 **정확히** 포함되어 있는지 확인:
     ```
     https://[YOUR_PROJECT_REF].supabase.co/auth/v1/callback
     ```
  4. URL이 없거나 다르면 추가 (끝에 `/` 없이, `https://` 사용)
  5. 변경 사항 저장 후 몇 분 대기
  6. 브라우저 캐시 삭제 후 다시 시도

**확인 체크리스트:**
- [ ] Google Cloud Console에 Supabase 콜백 URL이 정확히 추가됨
- [ ] URL이 `https://`로 시작함 (http 아님)
- [ ] 프로젝트 ID가 정확히 일치함
- [ ] 경로가 `/auth/v1/callback`로 정확히 일치함 (끝에 `/` 없음)
- [ ] Supabase Dashboard에 Client ID와 Secret이 올바르게 입력됨
