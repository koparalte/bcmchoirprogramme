import {
  Wrench,
  Users,
  Monitor,
  GlassWater,
  Presentation,
  BookOpen,
  HelpCircle,
  type LucideProps,
} from "lucide-react";
import * as React from "react";

export const iconMap: Record<string, React.ElementType<LucideProps>> = {
  workshop: Wrench,
  conference: Users,
  webinar: Monitor,
  social: GlassWater,
  presentation: Presentation,
  lecture: BookOpen,
  default: HelpCircle,
};

type CategoryIconProps = LucideProps & {
  category: string;
};

export function CategoryIcon({ category, ...props }: CategoryIconProps) {
  const Icon =
    iconMap[category?.toLowerCase()] || iconMap.default;
  return <Icon {...props} />;
}
