/** @type {import('next').NextConfig} */
const nextConfig = {
  // Thêm cấu hình images này vào
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default nextConfig;