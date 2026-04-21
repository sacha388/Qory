import { HugeiconsIcon } from '@hugeicons/react';
import type { IconSvgElement } from '@hugeicons/react';
import {
  ActivitySparkIcon,
  AiChat01Icon,
  AiMagicIcon,
  AiProgrammingIcon,
  AiSearchIcon,
  BalanceScaleIcon,
  Book02Icon,
  Briefcase01Icon,
  Building01Icon,
  CafeIcon,
  CalculatorIcon,
  Calendar01Icon,
  Camera01Icon,
  Car01Icon,
  ChartBarLineIcon,
  DiamondIcon,
  Dumbbell01Icon,
  FlowerPotIcon,
  GemIcon,
  GlassesIcon,
  HeadsetIcon,
  Home01Icon,
  Hospital01Icon,
  Key01Icon,
  LayerIcon,
  Mail01Icon,
  PaintBrush01Icon,
  Pizza01Icon,
  Restaurant01Icon,
  Scissor01Icon,
  Shield01Icon,
  Shirt01Icon,
  ShoppingBag01Icon,
  SparklesIcon,
  Store01Icon,
  TentIcon,
  Ticket01Icon,
  UserGroupIcon,
  Wallet01Icon,
  WellnessIcon,
  Wrench01Icon,
  ZapIcon,
} from '@hugeicons/core-free-icons';
import type { PaidScanBusinessType } from '@/types';
import type { ActivityCatalogEntry } from '@/lib/scanner/paid-scan-catalog';

type ActivityIconKind =
  | 'food'
  | 'coffee'
  | 'bakery'
  | 'scissors'
  | 'sparkles'
  | 'flower'
  | 'glasses'
  | 'store'
  | 'wrench'
  | 'bolt'
  | 'key'
  | 'brush'
  | 'home'
  | 'dumbbell'
  | 'camera'
  | 'wellness'
  | 'calculator'
  | 'scale'
  | 'monitor'
  | 'megaphone'
  | 'search'
  | 'palette'
  | 'briefcase'
  | 'code'
  | 'layers'
  | 'users'
  | 'mail'
  | 'shield'
  | 'book'
  | 'chart'
  | 'spark'
  | 'wand'
  | 'headset'
  | 'calendar'
  | 'building'
  | 'ticket'
  | 'shirt'
  | 'paw'
  | 'gem'
  | 'car'
  | 'cross'
  | 'tent'
  | 'generic';

const TYPE_OPTION_ICONS: Record<PaidScanBusinessType, IconSvgElement> = {
  commerce_restauration: Restaurant01Icon,
  prestataire_local: Wrench01Icon,
  agence_studio: Briefcase01Icon,
  etablissement_institution: Building01Icon,
  saas_application: LayerIcon,
  ia_assistants: AiChat01Icon,
  plateforme_annuaire: AiSearchIcon,
  ecommerce: ShoppingBag01Icon,
};

const ACTIVITY_KIND_ICONS: Record<ActivityIconKind, IconSvgElement> = {
  food: Pizza01Icon,
  coffee: CafeIcon,
  bakery: Store01Icon,
  scissors: Scissor01Icon,
  sparkles: SparklesIcon,
  flower: FlowerPotIcon,
  glasses: GlassesIcon,
  store: ShoppingBag01Icon,
  wrench: Wrench01Icon,
  bolt: ZapIcon,
  key: Key01Icon,
  brush: PaintBrush01Icon,
  home: Home01Icon,
  dumbbell: Dumbbell01Icon,
  camera: Camera01Icon,
  wellness: WellnessIcon,
  calculator: CalculatorIcon,
  scale: BalanceScaleIcon,
  monitor: LayerIcon,
  megaphone: ActivitySparkIcon,
  search: AiSearchIcon,
  palette: PaintBrush01Icon,
  briefcase: Briefcase01Icon,
  code: AiProgrammingIcon,
  layers: LayerIcon,
  users: UserGroupIcon,
  mail: Mail01Icon,
  shield: Shield01Icon,
  book: Book02Icon,
  chart: ChartBarLineIcon,
  spark: AiChat01Icon,
  wand: AiMagicIcon,
  headset: HeadsetIcon,
  calendar: Calendar01Icon,
  building: Building01Icon,
  ticket: Ticket01Icon,
  shirt: Shirt01Icon,
  paw: GemIcon,
  gem: DiamondIcon,
  car: Car01Icon,
  cross: Hospital01Icon,
  tent: TentIcon,
  generic: Wallet01Icon,
};

export function TypeOptionIcon({
  type,
  size = 22,
  strokeWidth = 1.8,
  className,
}: {
  type: PaidScanBusinessType;
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  return (
    <HugeiconsIcon
      icon={TYPE_OPTION_ICONS[type]}
      size={size}
      strokeWidth={strokeWidth}
      className={className ?? 'h-5 w-5'}
    />
  );
}

function resolveActivityIconKind(activity: ActivityCatalogEntry): ActivityIconKind {
  const haystack = `${activity.id} ${activity.label}`.toLowerCase();

  if (/pizzeria|restaurant|fast_food|street_food|alimentation|boissons/.test(haystack)) return 'food';
  if (/bar|cafe|coffee/.test(haystack)) return 'coffee';
  if (/boulangerie|patisserie|epicerie|primeur/.test(haystack)) return 'bakery';
  if (/coiffure/.test(haystack)) return 'scissors';
  if (/beaute|cosmet|bijoux|accessoires/.test(haystack)) return 'sparkles';
  if (/fleur/.test(haystack)) return 'flower';
  if (/opticien/.test(haystack)) return 'glasses';
  if (/boutique|ecommerce|mode|vetement/.test(haystack)) return 'store';
  if (/plombier|couvreur|charpentier|services_domicile|devis/.test(haystack)) return 'wrench';
  if (/electric/.test(haystack)) return 'bolt';
  if (/serrurier/.test(haystack)) return 'key';
  if (/peintre|design|creation/.test(haystack)) return 'brush';
  if (/maison|decoration|immobilier/.test(haystack)) return 'home';
  if (/coach_sportif|salle_sport|fitness|sport|outdoor/.test(haystack)) return 'dumbbell';
  if (/photographe|photo|video/.test(haystack)) return 'camera';
  if (/osteo|kine|psychologue|veterinaire|bien_etre/.test(haystack)) return 'wellness';
  if (/comptabil|finance|expert_comptable/.test(haystack)) return 'calculator';
  if (/avocat|juridique|signature|legal|compliance/.test(haystack)) return 'scale';
  if (/agence_web|web|application|logiciel|saas|high_tech|electronique/.test(haystack)) return 'monitor';
  if (/marketing|communication|sales|prospection/.test(haystack)) return 'megaphone';
  if (/seo|sea|annuaire|comparateur/.test(haystack)) return 'search';
  if (/studio_design|designer/.test(haystack)) return 'palette';
  if (/cabinet|consultant|conseil|coworking/.test(haystack)) return 'briefcase';
  if (/develop|code/.test(haystack)) return 'code';
  if (/gestion_projet|automation|automatisation/.test(haystack)) return 'layers';
  if (/crm|commercial|rh|recrutement|emploi/.test(haystack)) return 'users';
  if (/emailing|mail/.test(haystack)) return 'mail';
  if (/cyber/.test(haystack)) return 'shield';
  if (/education|formation|ecole|auto_ecole|creche/.test(haystack)) return 'book';
  if (/analytics|data/.test(haystack)) return 'chart';
  if (/ia_generaliste|assistant/.test(haystack)) return 'spark';
  if (/ia_marketing|ia_design|ia_juridique|documents/.test(haystack)) return 'wand';
  if (/support_client/.test(haystack)) return 'headset';
  if (/reservation/.test(haystack)) return 'calendar';
  if (/hotel|hebergement|clinique|institution/.test(haystack)) return 'building';
  if (/billetterie|evenements/.test(haystack)) return 'ticket';
  if (/enfants|jouets/.test(haystack)) return 'shirt';
  if (/animaux/.test(haystack)) return 'paw';
  if (/bijoux/.test(haystack)) return 'gem';
  if (/auto_ecole/.test(haystack)) return 'car';
  if (/dentiste|clinique|medical/.test(haystack)) return 'cross';
  if (/camping|loisirs|voyage/.test(haystack)) return 'tent';

  return 'generic';
}

export function ActivityChipIcon({
  activity,
  className,
}: {
  activity: ActivityCatalogEntry;
  className?: string;
}) {
  const kind = resolveActivityIconKind(activity);

  return (
    <HugeiconsIcon
      icon={ACTIVITY_KIND_ICONS[kind]}
      size={16}
      strokeWidth={1.8}
      className={className ?? 'h-[0.95rem] w-[0.95rem]'}
    />
  );
}
