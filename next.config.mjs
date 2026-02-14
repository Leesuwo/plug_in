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