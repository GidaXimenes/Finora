import {
  Briefcase,
  Car,
  Coffee,
  Gamepad2,
  Gift,
  GraduationCap,
  HeartPulse,
  Home,
  Laptop,
  PawPrint,
  Plane,
  Repeat,
  Shirt,
  ShoppingBag,
  Smartphone,
  Tag,
  TrendingUp,
  Utensils,
  Wallet,
  Zap,
  type LucideIcon,
} from 'lucide-react';

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  briefcase: Briefcase,
  laptop: Laptop,
  'trending-up': TrendingUp,
  wallet: Wallet,
  utensils: Utensils,
  car: Car,
  home: Home,
  'heart-pulse': HeartPulse,
  'graduation-cap': GraduationCap,
  gamepad: Gamepad2,
  repeat: Repeat,
  'shopping-bag': ShoppingBag,
  tag: Tag,
  gift: Gift,
  plane: Plane,
  'paw-print': PawPrint,
  coffee: Coffee,
  shirt: Shirt,
  smartphone: Smartphone,
  zap: Zap,
};

export const ICON_CHOICES = Object.keys(CATEGORY_ICONS);

export function CategoryIcon({ name, className }: { name: string; className?: string }) {
  const Icon = CATEGORY_ICONS[name] ?? Tag;
  return <Icon className={className} aria-hidden />;
}
