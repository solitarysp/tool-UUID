export const SITE_NAME = 'UUID Toolkit';
export const DEFAULT_SITE_DESCRIPTION =
  'Generate and decode UUIDs, ULIDs, NanoIDs, CUID2, and Snowflake IDs in one fast web tool.';

const DEFAULT_SITE_URL = 'http://localhost:3000';

function normalizeSiteUrl(url: string): string {
  return url.trim().replace(/\/+$/, '');
}

export function getSiteUrl(): string {
  const configuredUrl = import.meta.env.VITE_SITE_URL;
  if (configuredUrl && configuredUrl.trim().length > 0) {
    return normalizeSiteUrl(configuredUrl);
  }

  if (typeof window !== 'undefined' && window.location.origin) {
    return normalizeSiteUrl(window.location.origin);
  }

  return DEFAULT_SITE_URL;
}

export function toAbsoluteUrl(pathname: string): string {
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return new URL(path, `${getSiteUrl()}/`).toString();
}

export function getOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: toAbsoluteUrl('/'),
  };
}

export function getWebsiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    description: DEFAULT_SITE_DESCRIPTION,
    url: toAbsoluteUrl('/'),
    inLanguage: 'en',
  };
}

export function getSoftwareApplicationJsonLd(pathname: string, description: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'UUID Generator & Decoder',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Web Browser',
    description,
    url: toAbsoluteUrl(pathname),
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };
}

export function getBreadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: toAbsoluteUrl(item.path),
    })),
  };
}
