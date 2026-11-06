/** @type {import('next').NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  typescript: { ignoreBuildErrors: true },
  serverExternalPackages: ['@huggingface/transformers', 'onnxruntime-web'],
};
module.exports = nextConfig;
