import { MetadataRoute } from 'next';
import { mockProducts } from '@/mocks/products';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://voltstore.uz';
  const locales = ['ru', 'en'];

  const routes: MetadataRoute.Sitemap = [];

  locales.forEach((locale) => {
    routes.push(
      { url: `${baseUrl}/${locale}`, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
      { url: `${baseUrl}/${locale}/catalog`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
      { url: `${baseUrl}/${locale}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
      { url: `${baseUrl}/${locale}/delivery`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
      { url: `${baseUrl}/${locale}/warranty`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
      { url: `${baseUrl}/${locale}/contacts`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
      { url: `${baseUrl}/${locale}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 }
    );

    mockProducts.forEach((product) => {
      routes.push({
        url: `${baseUrl}/${locale}/product/${product.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    });
  });

  return routes;
}
