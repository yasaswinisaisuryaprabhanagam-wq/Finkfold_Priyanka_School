import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://priyankaem.school";

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/student/login",
          "/portal/student",
          "/about",
          "/academics",
          "/admissions",
          "/contact",
          "/login",
        ],
        disallow: [
          "/admin",
          "/admin/",
          "/admin/*",
          "/portal/admin",
          "/portal/admin/*",
          "/faculty",
          "/faculty/",
          "/faculty/*",
          "/portal/faculty",
          "/portal/faculty/*",
          "/api/",
          "/api/*",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
