import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Прямые импорты иконок, стабильные server/client chunks (избегает ENOENT vendor-chunks)
    optimizePackageImports: ["@chakra-ui/react", "lucide-react"],
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

export default withNextIntl(nextConfig)
