import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Optimizar compilación para desarrollo
  compiler: {
    removeConsole: false, // Mantener console logs para debugging
  },
  // Configuración para desarrollo local
  reactStrictMode: true,
  // Habilitar cache optimizado
  generateEtags: false,
};

export default nextConfig;
