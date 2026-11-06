/** @type {import('next').NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  typescript: { ignoreBuildErrors: true },
  // Next.js 16: la configuration a changé de place
  serverExternalPackages: ['@huggingface/transformers', 'onnxruntime-web'],
};
module.exports = nextConfig;
