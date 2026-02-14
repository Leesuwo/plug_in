/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      unoptimized: true, // Vercel 서버를 거치지 않고 원본 이미지를 그대로 씀 (무료)
    },
    // Playwright 관련 파일이 빌드에 포함되지 않도록 제외 (선택 사항)
    // 빌드 에러 방지용
    eslint: {
      ignoreDuringBuilds: true,
    },
    typescript: {
      ignoreBuildErrors: true, 
    },
  };
  
  export default nextConfig;