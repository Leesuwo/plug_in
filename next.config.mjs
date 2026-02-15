/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Vercel 무료 플랜에서도 이미지 최적화 사용 가능
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.plugin-alliance.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'slatedigital.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'solidstatelogic.com',
        pathname: '/**',
      },
    ],
    // 이미지 최적화 설정
    formats: ['image/avif', 'image/webp'], // AVIF와 WebP 포맷 우선 사용 (용량 최적화)
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840], // 반응형 이미지 크기
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384], // 아이콘/썸네일 크기
    minimumCacheTTL: 60, // 이미지 캐시 TTL (초) - 1분
  },
  // Playwright는 서버리스 함수에서 실행 불가하므로 빌드에서 제외
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // 클라이언트 번들에서 playwright 제외 (Vercel 빌드 최적화)
      config.resolve.alias = {
        ...config.resolve.alias,
        playwright: false,
      }
    }
    return config
  },
  eslint: {
    // 개발 중에는 false로 변경 권장, 배포 시에는 true로 유지 가능
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 개발 중에는 false로 변경 권장, 배포 시에는 true로 유지 가능
    ignoreBuildErrors: true,
  },
}

export default nextConfig