const API_URL = process.env.API_URL ?? 'http://localhost:3001';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  eslint: { ignoreDuringBuilds: true },
  // O navegador fala só com o Next (mesma origem); o Next repassa /api/* para a API.
  // Assim os cookies httpOnly funcionam sem CORS e sem expor a URL da API.
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${API_URL}/:path*` }];
  },
};

export default nextConfig;
