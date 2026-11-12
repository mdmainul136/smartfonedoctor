import type { Block } from 'payload'

export const ServicesBlock: Block = {
  slug: 'servicesGrid',
  labels: {
    singular: 'Services Grid',
    plural: 'Services Grids',
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      label: 'Section Heading',
      defaultValue: 'Expert Repair Services for Every Device',
    },
    {
      name: 'subtitle',
      type: 'text',
      label: 'Section Subtitle',
      defaultValue: 'From screen replacements to logic board diagnostics, select your device to get started.',
    },
    {
      name: 'showPricingSnippet',
      type: 'checkbox',
      label: 'Show Starting Price Badges',
      defaultValue: true,
    },
  ],
}
