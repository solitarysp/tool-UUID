import { useEffect } from 'react';
import { SITE_NAME, toAbsoluteUrl } from '../lib/seo';

type JsonLd = Record<string, unknown>;

interface SeoHeadProps {
  title: string;
  description: string;
  pathname: string;
  robots?: string;
  type?: 'website' | 'article';
  jsonLd?: JsonLd | JsonLd[];
}

function upsertNamedMeta(name: string, content: string) {
  let meta = document.head.querySelector(`meta[name="${name}"]`);
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', name);
    meta.setAttribute('data-seo-managed', 'true');
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', content);
}

function upsertPropertyMeta(property: string, content: string) {
  let meta = document.head.querySelector(`meta[property="${property}"]`);
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('property', property);
    meta.setAttribute('data-seo-managed', 'true');
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', content);
}

function upsertCanonicalLink(url: string) {
  let link = document.head.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('data-seo-managed', 'true');
    document.head.appendChild(link);
  }
  link.setAttribute('href', url);
}

export default function SeoHead({
  title,
  description,
  pathname,
  robots = 'index,follow',
  type = 'website',
  jsonLd,
}: SeoHeadProps) {
  useEffect(() => {
    const absoluteUrl = toAbsoluteUrl(pathname);
    const documentTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;

    document.title = documentTitle;

    upsertNamedMeta('description', description);
    upsertNamedMeta('robots', robots);
    upsertNamedMeta('twitter:card', 'summary_large_image');
    upsertNamedMeta('twitter:title', documentTitle);
    upsertNamedMeta('twitter:description', description);

    upsertPropertyMeta('og:type', type);
    upsertPropertyMeta('og:site_name', SITE_NAME);
    upsertPropertyMeta('og:title', documentTitle);
    upsertPropertyMeta('og:description', description);
    upsertPropertyMeta('og:url', absoluteUrl);

    upsertCanonicalLink(absoluteUrl);

    document
      .querySelectorAll('script[data-seo-jsonld="true"]')
      .forEach((node) => node.remove());

    if (jsonLd) {
      const entries = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
      for (const entry of entries) {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.setAttribute('data-seo-jsonld', 'true');
        script.text = JSON.stringify(entry);
        document.head.appendChild(script);
      }
    }
  }, [title, description, pathname, robots, type, jsonLd]);

  return null;
}
