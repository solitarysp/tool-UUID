import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.production', quiet: true });
dotenv.config({ quiet: true });

const VERSION_ROUTES = [
  'v1',
  'v3',
  'v4',
  'v5',
  'v6',
  'v7',
  'nil',
  'max',
  'ulid',
  'nanoid',
  'cuid2',
  'snowflake',
];

const ROUTES = [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  { path: '/decode', changefreq: 'weekly', priority: '0.9' },
  { path: '/guide', changefreq: 'weekly', priority: '0.8' },
  ...VERSION_ROUTES.map((version) => ({
    path: `/guide/${version}`,
    changefreq: 'monthly',
    priority: '0.7',
  })),
];

function normalizeSiteUrl(value) {
  return value.trim().replace(/\/+$/, '');
}

function buildUrl(siteUrl, routePath) {
  return routePath === '/' ? `${siteUrl}/` : `${siteUrl}${routePath}`;
}

const fallbackSiteUrl = 'http://localhost:3000';
const siteUrl = normalizeSiteUrl(process.env.VITE_SITE_URL || fallbackSiteUrl);
const lastmod = new Date().toISOString().slice(0, 10);

const sitemapEntries = ROUTES.map(
  (route) => `  <url>\n    <loc>${buildUrl(siteUrl, route.path)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${route.changefreq}</changefreq>\n    <priority>${route.priority}</priority>\n  </url>`
).join('\n');

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapEntries}\n</urlset>`;

const robotsTxt = `User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\n`;

const publicDir = path.join(process.cwd(), 'public');
await mkdir(publicDir, { recursive: true });
await writeFile(path.join(publicDir, 'sitemap.xml'), `${sitemapXml}\n`, 'utf8');
await writeFile(path.join(publicDir, 'robots.txt'), robotsTxt, 'utf8');

console.log(`Generated SEO files for ${siteUrl}`);
