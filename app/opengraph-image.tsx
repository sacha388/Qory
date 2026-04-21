import {
  OG_IMAGE_CONTENT_TYPE,
  OG_IMAGE_SIZE,
  createBrandOgImageResponse,
} from '@/app/lib/og-brand-image';

export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;

export default async function OpenGraphImage() {
  return createBrandOgImageResponse();
}
