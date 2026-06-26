import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/operator/', '/dashboard/'],
    },
    sitemap: 'https://scorebos.com/sitemap.xml',
  }
}
