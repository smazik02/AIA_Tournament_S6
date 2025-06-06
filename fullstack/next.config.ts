import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    async redirects() {
        return [
            {
                source: '/auth',
                destination: '/auth/sign-in',
                permanent: true,
            },
        ];
    },
    output: 'standalone',
    experimental: {
        optimizePackageImports: ['package-name'],
    },
};

export default nextConfig;
