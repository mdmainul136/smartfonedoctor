import type { Block } from 'payload'

export const HeroBlock: Block = {
  slug: 'hero',
  labels: {
    singular: 'Hero Section',
    plural: 'Hero Sections',
  },
  fields: [
    {
      name: 'topPillTag',
      type: 'text',
      label: 'Badge / Pill Tag',
      defaultValue: "Philadelphia's Trusted Leader in",
    },
    {
      name: 'headline',
      type: 'text',
      label: 'Headline',
      required: true,
      defaultValue: 'Fast, reliable repairs that keep your tech working when it matters.',
    },
    {
      name: 'subtitle',
      type: 'textarea',
      label: 'Subtitle',
      defaultValue:
        'Repair services for smartphones, tablets, computers and game consoles, backed by certified technicians and a 90-day free warranty.',
    },
    {
      name: 'primaryCtaText',
      type: 'text',
      label: 'Primary Button Text',
      defaultValue: 'Book your repair',
    },
    {
      name: 'primaryCtaLink',
      type: 'text',
      label: 'Primary Button Link',
      defaultValue: '/schedule-repair',
    },
    {
      name: 'secondaryCtaText',
      type: 'text',
      label: 'Secondary Button Text',
      defaultValue: 'Call (215) 598-2090',
    },
    {
      name: 'secondaryCtaLink',
      type: 'text',
      label: 'Secondary Button Link',
      defaultValue: 'tel:+12155982090',
    },
  ],
}

