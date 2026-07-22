import path from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  turbopack: {
    // Keep module resolution inside the frontend app directory.
    root: __dirname,
  },
  images: {
    unoptimized: true,
  },
  serverExternalPackages: ["puppeteer-core"],
  async redirects() {
    return [{ source: "/favicon.ico", destination: "/logo.png", permanent: false }]
  },
}

export default nextConfig
