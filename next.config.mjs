/** @type {import('next').NextConfig} */
const nextConfig = {
  /*
   * Update for Next.js 14+: serverExternalPackages should be under experimental
   * or serverComponentsExternalPackages depending on exact version.
   * Using generic experimental.serverComponentsExternalPackages which is widely supported.
   */
  experimental: {
    serverComponentsExternalPackages: ['mongoose'],
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'utfs.io', pathname: '**' },
      { protocol: 'https', hostname: 'uploadthing.com', pathname: '**' },
      { protocol: 'https', hostname: 'img.clerk.com', pathname: '**' },
      { protocol: 'https', hostname: 'files.stripe.com', pathname: '**' },
    ],
  },
  transpilePackages: [
    '@uploadthing/react',
    'uploadthing',
    '@uploadthing/mime-types',
  ],
};

export default nextConfig;
