import type { Block } from 'payload'

export const BenefitsBlock: Block = {
  slug: 'benefits',
  labels: {
    singular: 'Benefits / Value Props',
    plural: 'Benefits Sections',
  },
  fields: [
    {
      name: 'sectionTitle',
      type: 'text',
      label: 'Section Title',
      defaultValue: 'Why Philadelphians Choose SmartFoneDoctor',
    },
    {
      name: 'items',
      type: 'array',
      label: 'Benefit Cards',
      minRows: 1,
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
          required: true,
        },
        {
          name: 'icon',
          type: 'select',
          options: [
            { label: 'Clock / 30 Min', value: 'clock' },
            { label: 'Shield / Warranty', value: 'shield' },
            { label: 'MapPin / 3 Stores', value: 'map-pin' },
            { label: 'Sparkles / OEM Quality', value: 'sparkles' },
          ],
          defaultValue: 'shield',
        },
      ],
    },
  ],
}

