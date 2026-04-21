import { permanentRedirect } from 'next/navigation';

/** Ancienne URL : la page « pour qui » (produit) vit sur `/pour-qui`. */
export default function QuiLegacyRedirect() {
  permanentRedirect('/pour-qui');
}
