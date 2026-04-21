import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';

/**
 * Google Sans pour l’OG : on charge des TTF dérivés (`public/fonts/og-google-sans/`)
 * sans tables GSUB/GPOS — les fichiers d’origine font planter Satori
 * (`lookupType: 7 - substFormat: 1 is not yet supported`).
 * Régénération : `python3 scripts/regenerate-og-google-sans.py` (fontTools).
 */
export const OG_FONT_FAMILY = 'Google Sans' as const;

/** Même picto que `public/logo.svg` (viewBox 0 0 183 183). */
const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 183 183"><path fill="#ffffff" d="M183,102.74v80.26H0v-61h91.5L0,61V0h91.5v61h53.74c20.86,0,37.76,18.69,37.76,41.74Z"/></svg>`;
const logoDataUri = `data:image/svg+xml,${encodeURIComponent(logoSvg)}`;

const BRAND = {
  bg: '#000000',
  blue: '#4BA7F5',
  coral: '#F16B5D',
  text: '#ffffff',
  textMuted: 'rgba(255,255,255,0.72)',
} as const;

export const OG_IMAGE_SIZE = {
  width: 1200,
  height: 630,
} as const;

export const OG_IMAGE_CONTENT_TYPE = 'image/png';

/** Picto + mot « Qory » : même échelle (px). */
const WORDMARK_LOGO_PX = 80;
/** Écart supplémentaire r → y : 4 % du cadratin (= 0,04 × taille). */
const WORDMARK_RY_GAP_PX = WORDMARK_LOGO_PX * 0.04;

function BrandOgImageInner() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        position: 'relative',
        backgroundColor: BRAND.bg,
        color: BRAND.text,
        fontFamily: OG_FONT_FAMILY,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: '100%',
          height: '100%',
          padding: '72px 88px 64px',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28, maxWidth: 980 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <img
              src={logoDataUri}
              alt=""
              width={WORDMARK_LOGO_PX}
              height={WORDMARK_LOGO_PX}
              style={{
                width: WORDMARK_LOGO_PX,
                height: WORDMARK_LOGO_PX,
                objectFit: 'contain',
                flexShrink: 0,
              }}
            />
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: WORDMARK_LOGO_PX,
                lineHeight: 1,
                fontWeight: 600,
                letterSpacing: '-0.045em',
                color: BRAND.text,
              }}
            >
              <span>Qor</span>
              <span style={{ marginLeft: WORDMARK_RY_GAP_PX }}>y</span>
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <span
              style={{
                fontSize: 54,
                fontWeight: 700,
                letterSpacing: '-0.038em',
                lineHeight: 1.08,
                color: BRAND.text,
              }}
            >
              Mesurez votre visibilité IA
            </span>
            <span
              style={{
                fontSize: 26,
                fontWeight: 500,
                letterSpacing: '-0.02em',
                lineHeight: 1.35,
                color: BRAND.textMuted,
                maxWidth: 920,
              }}
            >
              Découvrez si votre site ressort dans les réponses IA.
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div
            style={{
              width: 120,
              height: 5,
              borderRadius: 999,
              background: `linear-gradient(90deg, ${BRAND.coral}, ${BRAND.blue})`,
            }}
          />
          <span
            style={{
              fontSize: 15,
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.45)',
            }}
          >
            Visibilité · Réponses IA · Action
          </span>
        </div>
      </div>
    </div>
  );
}

async function loadGoogleSansOgFonts() {
  const dir = join(process.cwd(), 'public/fonts/og-google-sans');
  const [medium, semiBold, bold] = await Promise.all([
    readFile(join(dir, 'GoogleSans-Medium.ttf')),
    readFile(join(dir, 'GoogleSans-SemiBold.ttf')),
    readFile(join(dir, 'GoogleSans-Bold.ttf')),
  ]);
  return [
    { name: OG_FONT_FAMILY, data: medium, style: 'normal' as const, weight: 500 as const },
    { name: OG_FONT_FAMILY, data: semiBold, style: 'normal' as const, weight: 600 as const },
    { name: OG_FONT_FAMILY, data: bold, style: 'normal' as const, weight: 700 as const },
  ];
}

export async function createBrandOgImageResponse() {
  const fonts = await loadGoogleSansOgFonts();
  return new ImageResponse(<BrandOgImageInner />, {
    ...OG_IMAGE_SIZE,
    fonts,
  });
}
