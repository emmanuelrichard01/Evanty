/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: [],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'img.clerk.com', pathname: '**' },
      { protocol: 'https', hostname: 'files.stripe.com', pathname: '**' },
      { protocol: 'https', hostname: '**.r2.dev', pathname: '**' },
    ],
  },
};

export default nextConfig;

