import type { Block } from 'payload'

export const CtaBlock: Block = {
  slug: 'ctaBanner',
  labels: {
    singular: 'Call to Action Banner',
    plural: 'Call to Action Banners',
  },
  fields: [
    {
      name: 'headline',
      type: 'text',
      label: 'Headline',
      defaultValue: 'Need your phone fixed right now?',
    },
    {
      name: 'subtext',
      type: 'text',
      label: 'Subtext',
      defaultValue:
        'Walk in today to any of our 3 West Philadelphia locations or schedule online for priority bench service.',
    },
    {
      name: 'buttonText',
      type: 'text',
      label: 'Button Label',
      defaultValue: 'Schedule Repair Online',
    },
    {
      name: 'buttonLink',
      type: 'text',
      label: 'Button URL',
      defaultValue: '/schedule-repair',
    },
  ],
}

