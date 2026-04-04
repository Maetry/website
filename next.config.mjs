import { withSentryConfig } from "@sentry/nextjs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    externalDir: true,
    // Прямые импорты иконок, стабильные server/client chunks (избегает ENOENT vendor-chunks)
    optimizePackageImports: ["@chakra-ui/react", "lucide-react"],
  },
  turbopack: {
    root: path.dirname(fileURLToPath(import.meta.url)),
  },
  async redirects() {
    return [
      { source: '/ambassadors', destination: '/affiliate', permanent: true },
      { source: '/employees/invite', destination: '/staff/invite', permanent: true },
      { source: '/clients/invite', destination: '/client/invite', permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/.well-known/apple-app-site-association",
        headers: [
          {
            key: "Content-Type",
            value: "application/json",
          },
        ],
      },
      {
        source: "/apple-app-site-association",
        headers: [
          {
            key: "Content-Type",
            value: "application/json",
          },
        ],
      },
    ]
  },
}

export default withSentryConfig(withNextIntl(nextConfig), {
  authToken: process.env.SENTRY_AUTH_TOKEN,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: true,
  sourcemaps: {
    disable: !process.env.SENTRY_AUTH_TOKEN,
  },
})
