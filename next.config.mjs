/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'utfs.io', pathname: '**' },
      { protocol: 'https', hostname: 'uploadthing.com', pathname: '**' },
      { protocol: 'https', hostname: 'img.clerk.com', pathname: '**' },
      { protocol: 'https', hostname: 'files.stripe.com', pathname: '**' },
    ],
  },
  serverExternalPackages: ['mongoose'],
  transpilePackages: [
    '@uploadthing/react',
    'uploadthing',
    '@uploadthing/mime-types',
  ],
};

export default nextConfig;
