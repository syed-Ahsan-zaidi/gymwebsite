import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/login', '/register'],
        disallow: ['/dashboard/', '/super-admin/', '/api/'],
      },
    ],
    sitemap: 'https://fitzone.sbs/sitemap.xml',
  }
}
