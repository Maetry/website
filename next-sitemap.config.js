/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://maetry.com",
  generateRobotsTxt: true,
  exclude: [
    "/*/booking/*",
    "/*/visits/*",
    "/*/billing",
    "/*/billing/*",
    "/*/staff/invite",
    "/*/client/invite",
    "/*/link/*",
  ],
  robotsTxtOptions: {
    additionalSitemaps: [],
    policies: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/*/booking/",
          "/*/visits/",
          "/*/billing",
          "/*/staff/invite",
          "/*/client/invite",
          "/*/link/",
        ],
      },
    ],
  },
}
