import type { CollectionConfig } from 'payload'

export const FAQs: CollectionConfig = {
  slug: 'faqs',
  admin: {
    useAsTitle: 'question',
    defaultColumns: ['question', 'category', 'order'],
  },
  fields: [
    {
      name: 'question',
      type: 'text',
      required: true,
    },
    {
      name: 'answer',
      type: 'textarea',
      required: true,
    },
    {
      name: 'category',
      type: 'select',
      defaultValue: 'General',
      options: [
        { label: 'General & Booking', value: 'General' },
        { label: 'Warranty & Quality', value: 'Warranty' },
        { label: 'Pricing & Turnaround', value: 'Pricing' },
      ],
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 1,
    },
  ],
}

