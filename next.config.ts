/** @type {import('next').NextConfig} */
const nextConfig = {
  // We keep ignoreBuildErrors for now because of the complex third-party types in Gemini SDK,
  // but we will fix the project-level any types.
  typescript: {
    ignoreBuildErrors: true,
  }
};

export default nextConfig;
