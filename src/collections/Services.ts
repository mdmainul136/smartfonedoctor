import type { CollectionConfig } from 'payload'

export const Services: CollectionConfig = {
  slug: 'services',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', 'turnaround', 'active'],
    group: 'Content & Website',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'Screen repair', value: 'Screen repair' },
        { label: 'Battery', value: 'Battery' },
        { label: 'Charging & HDMI', value: 'Charging & HDMI' },
        { label: 'Water damage', value: 'Water damage' },
        { label: 'Audio & camera', value: 'Audio & camera' },
        { label: 'Other', value: 'Other' },
      ],
    },
    {
      name: 'turnaround',
      type: 'text',
      defaultValue: '25–45 min',
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'prices',
      type: 'group',
      fields: [
        { name: 'iphone', type: 'text', defaultValue: '$129–$299' },
        { name: 'samsung', type: 'text', defaultValue: '$99–$249' },
        { name: 'google', type: 'text', defaultValue: '$89–$179' },
        { name: 'other', type: 'text', defaultValue: '$59–$129' },
      ],
    },
  ],
}

