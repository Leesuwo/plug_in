# redirect_uri_mismatch 오류 해결 가이드

## 문제 증상

구글 로그인 시도 시 다음 오류 메시지가 표시됨:
```
400 오류: redirect_uri_mismatch
이 앱에서 잘못된 요청을 전송했으므로 로그인할 수 없습니다.
```

## 원인

Google Cloud Console의 **Authorized redirect URIs**에 Supabase의 콜백 URL이 정확히 일치하지 않을 때 발생합니다.

## 해결 방법

### 1단계: Supabase 프로젝트 URL 확인

1. **Supabase Dashboard** 접속
2. 왼쪽 메뉴에서 **Settings** → **API** 클릭
3. **Project URL** 확인 (예: `https://abcdefghijklmnop.supabase.co`)
4. **콜백 URL 형식**: `https://[PROJECT_REF].supabase.co/auth/v1/callback`
   - 예: `https://abcdefghijklmnop.supabase.co/auth/v1/callback`

### 2단계: Google Cloud Console에서 리다이렉트 URI 확인 및 수정

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 프로젝트 선택
3. **APIs & Services** → **Credentials** 이동
4. OAuth 2.0 Client ID 목록에서 해당 클라이언트 클릭
5. **Authorized redirect URIs** 섹션 확인

### 3단계: 올바른 URI 추가

**Authorized redirect URIs**에 다음 형식의 URL이 **정확히** 포함되어 있어야 합니다:

```
https://[YOUR_PROJECT_REF].supabase.co/auth/v1/callback
```

**중요 체크리스트:**
- ✅ `https://`로 시작 (절대 `http://` 아님)
- ✅ 프로젝트 ID가 정확히 일치
- ✅ 경로가 `/auth/v1/callback`로 정확히 일치
- ✅ 끝에 `/` 없음
- ✅ 대소문자 구분 (모두 소문자)

**예시:**
```
✅ 올바른 형식: https://abcdefghijklmnop.supabase.co/auth/v1/callback
❌ 잘못된 형식: https://abcdefghijklmnop.supabase.co/auth/v1/callback/
❌ 잘못된 형식: http://abcdefghijklmnop.supabase.co/auth/v1/callback
❌ 잘못된 형식: https://ABCDEFGHIJKLMNOP.supabase.co/auth/v1/callback
```

### 4단계: URI 추가 방법

1. **+ ADD URI** 버튼 클릭
2. 위 형식의 URL 입력
3. **SAVE** 클릭
4. **몇 분 대기** (Google 설정 반영 시간)

### 5단계: 테스트

1. 브라우저 캐시 삭제 (또는 시크릿 모드 사용)
2. 애플리케이션에서 다시 로그인 시도

## 추가 확인 사항

### Supabase 설정 확인

1. **Supabase Dashboard** → **Authentication** → **Providers** → **Google**
2. **Client ID**와 **Client Secret**이 올바르게 입력되어 있는지 확인
3. Google Provider가 **활성화**되어 있는지 확인

### 환경 변수 확인

`.env.local` 파일에 올바른 Supabase URL이 설정되어 있는지 확인:

```env
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR_PROJECT_REF].supabase.co
```

## 여전히 문제가 발생하는 경우

1. **Google Cloud Console**에서 OAuth 2.0 Client ID를 삭제하고 새로 생성
2. **Supabase Dashboard**에서 Google Provider를 비활성화 후 다시 활성화
3. 브라우저 개발자 도구의 Network 탭에서 실제 요청 URL 확인
4. Supabase 지원팀에 문의

## 참고

- Google OAuth 설정 변경 사항은 최대 5-10분 정도 소요될 수 있습니다
- 여러 환경(개발/프로덕션)을 사용하는 경우 각각의 콜백 URL을 모두 추가해야 합니다
- Supabase는 자동으로 올바른 콜백 URL을 사용하므로, Google Cloud Console에만 올바르게 설정하면 됩니다
