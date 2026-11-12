import type { CollectionConfig } from 'payload'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'updatedAt'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'hero',
      type: 'group',
      fields: [
        {
          name: 'topPillTag',
          type: 'text',
          defaultValue: "Philadelphia's Trusted Leader in",
        },
        {
          name: 'headline',
          type: 'text',
          defaultValue: 'Fast, reliable repairs that keep your tech working when it matters.',
        },
        {
          name: 'subtitle',
          type: 'textarea',
          defaultValue:
            'Repair services for smartphones, tablets, computers and game consoles, backed by certified technicians and a 90-day free warranty.',
        },
        {
          name: 'ctaText',
          type: 'text',
          defaultValue: 'Book your repair',
        },
        {
          name: 'ctaLink',
          type: 'text',
          defaultValue: '/schedule-repair',
        },
      ],
    },
    {
      name: 'announcementBar',
      type: 'group',
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'text',
          type: 'text',
          defaultValue:
            "Philadelphia's Trusted Device Repair Experts · Walk-ins Welcome Mon–Sat",
        },
        {
          name: 'promoTag',
          type: 'text',
          defaultValue: 'Free Glass Screen Protector with any Screen Repair',
        },
        {
          name: 'phoneNumber',
          type: 'text',
          defaultValue: '+1 (215) 598-2090',
        },
      ],
    },
  ],
}

