import { checklistGeoActionsPrioritairesArticle } from '@/app/lib/resource-articles/checklist-geo-actions-prioritaires';
import { commentSavoirSiChatgptCiteArticle } from '@/app/lib/resource-articles/comment-savoir-si-chatgpt-cite-votre-site';
import { corrigerHallucinationIaMarqueArticle } from '@/app/lib/resource-articles/corriger-hallucination-ia-marque';
import { pourquoiVotreMarqueNapparaitPasArticle } from '@/app/lib/resource-articles/pourquoi-votre-marque-napparait-pas';
import { questCeQueLeGeoArticle } from '@/app/lib/resource-articles/quest-ce-que-le-geo';
import { seoVsGeoArticle } from '@/app/lib/resource-articles/seo-vs-geo';

/** Couleurs d’accent pour bandeaux et stats (charte Qory). */
export type ResourceSiteAccent = '#4BA7F5' | '#F16B5D' | '#F4B43A';

export type ResourceArticleBodyBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'bulletList'; items: string[] }
  | {
      type: 'figure';
      variant: 'photo' | 'frame';
      src?: string;
      alt: string;
      caption?: string;
      href?: string;
    }
  | {
      type: 'bento';
      headline?: string;
      accent?: ResourceSiteAccent;
      items: Array<{
        highlight: string;
        description: string;
        href?: string;
      }>;
    }
  | {
      type: 'bannerQuote';
      color: ResourceSiteAccent;
      quote: string;
      attribution?: string;
    }
  | {
      type: 'iconFrames';
      items: Array<{
        label: string;
        href: string;
        icon: 'link' | 'chart' | 'search' | 'sparkle';
      }>;
    };

export type ResourceArticleSection = {
  title: string;
  paragraphs: string[];
  bullets?: string[];
  /** Si présent et non vide, remplace l’enchaînement paragraphs + bullets. */
  body?: ResourceArticleBodyBlock[];
};

export type ResourceArticleFaq = {
  question: string;
  answer: string;
};

export type ResourceArticle = {
  slug: string;
  title: string;
  description: string;
  excerpt: string;
  category: string;
  dateLabel: string;
  dateIso: string;
  readTime: string;
  imageSrc: string;
  imageAlt: string;
  tags: string[];
  sections: ResourceArticleSection[];
  /** Titre SEO (balise title / partage social), peut différer du H1. */
  seoTitle?: string;
  dateModifiedIso?: string;
  dateModifiedLabel?: string;
  authorLabel?: string;
  faqs?: ResourceArticleFaq[];
  ctaBox?: {
    title: string;
    body: string;
    href: string;
    label: string;
  };
};

export const resourceArticles: ResourceArticle[] = [
  questCeQueLeGeoArticle as unknown as ResourceArticle,
  seoVsGeoArticle as unknown as ResourceArticle,
  commentSavoirSiChatgptCiteArticle as unknown as ResourceArticle,
  pourquoiVotreMarqueNapparaitPasArticle as unknown as ResourceArticle,
  corrigerHallucinationIaMarqueArticle as unknown as ResourceArticle,
  checklistGeoActionsPrioritairesArticle as unknown as ResourceArticle,
];

export function getResourceArticleBySlug(slug: string): ResourceArticle | undefined {
  return resourceArticles.find((article) => article.slug === slug);
}
