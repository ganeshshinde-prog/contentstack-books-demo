/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    eslint: {
        // Disable ESLint during builds for now
        ignoreDuringBuilds: true,
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.contentstack.io',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'via.placeholder.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'picsum.photos',
                port: '',
                pathname: '/**',
            },
        ],
        domains: ['images.contentstack.io', 'via.placeholder.com', 'picsum.photos'],
    },
    env: { // available at build time
        CONTENTSTACK_API_KEY: process.env.CONTENTSTACK_API_KEY ,
        CONTENTSTACK_DELIVERY_TOKEN: process.env.CONTENTSTACK_DELIVERY_TOKEN,
        CONTENTSTACK_BRANCH: process.env.CONTENTSTACK_BRANCH ? process.env.CONTENTSTACK_BRANCH : 'main',
        CONTENTSTACK_ENVIRONMENT: process.env.CONTENTSTACK_ENVIRONMENT,
        CONTENTSTACK_APP_HOST: process.env.CONTENTSTACK_APP_HOST, //app host
        CONTENTSTACK_PREVIEW_HOST: process.env.CONTENTSTACK_PREVIEW_HOST, // live-preview host
        CONTENTSTACK_PREVIEW_TOKEN: process.env.CONTENTSTACK_PREVIEW_TOKEN, // live-preview token
        CONTENTSTACK_LIVE_EDIT_TAGS: process.env.CONTENTSTACK_LIVE_EDIT_TAGS,
        CONTENTSTACK_API_HOST: process.env.CONTENTSTACK_API_HOST,
        // Contentstack Personalize Configuration (Compass Starter Style)
        CONTENTSTACK_PERSONALIZE_PROJECT_UID: process.env.CONTENTSTACK_PERSONALIZE_PROJECT_UID,
        CONTENTSTACK_PERSONALIZE_EDGE_API_URL: process.env.CONTENTSTACK_PERSONALIZE_EDGE_API_URL,
        // A/B Testing Configuration
        CONTENTSTACK_AB_LANDING_PAGE_PATH: process.env.CONTENTSTACK_AB_LANDING_PAGE_PATH,
        CONTENTSTACK_AB_EXPERIENCE_ID: process.env.CONTENTSTACK_AB_EXPERIENCE_ID,
        CONTENTSTACK_AB_PRIMARY_EVENT: process.env.CONTENTSTACK_AB_PRIMARY_EVENT,
    }
};

export default nextConfig;
