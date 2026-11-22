// Home hero content: the prop type and today's text. Kept apart from HeroSection so
// the page builder can read the defaults without loading the component.

/** Text and image of the home hero. Every field can be changed in the page builder. */
export type HeroSectionProps = {
  badge?: string;
  headline?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  imageUrl?: string;
  imageAlt?: string;
  statusText?: string;
  statusLinkText?: string;
  statusLink?: string;
};

export const HERO_DEFAULTS: Required<HeroSectionProps> = {
  badge: "Phone & computer repair in Philadelphia",
  headline: "Fast, reliable repairs that keep your tech working when it matters.",
  subtitle:
    "Repair services for smartphones, tablets, computers and game consoles, backed by certified technicians and a 90-day free warranty.",
  ctaText: "Book your repair",
  ctaLink: "/schedule-repair",
  imageUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1280&q=80",
  imageAlt: "SmartFoneDoctor Philadelphia Repair Bench",
  statusText: "Already have a repair with us?",
  statusLinkText: "Check status",
  statusLink: "/repair-status",
};
