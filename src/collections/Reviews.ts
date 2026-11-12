import type { CollectionConfig } from 'payload'

export const Reviews: CollectionConfig = {
  slug: 'reviews',
  admin: {
    useAsTitle: 'customerName',
    defaultColumns: ['customerName', 'rating', 'store', 'source', 'published', 'createdAt'],
    group: 'Operations',
    description: 'Google, Yelp, and direct customer reviews for all 3 stores',
  },
  fields: [
    {
      name: 'customerName',
      type: 'text',
      required: true,
      label: 'Reviewer Name',
    },
    {
      name: 'rating',
      type: 'number',
      required: true,
      min: 1,
      max: 5,
      defaultValue: 5,
      label: 'Rating (1 - 5 Stars)',
    },
    {
      name: 'reviewText',
      type: 'textarea',
      required: true,
      label: 'Review Feedback',
    },
    {
      name: 'store',
      type: 'select',
      required: true,
      label: 'Store Reviewed',
      options: [
        { label: '33 S 52nd St', value: '52nd-st' },
        { label: '4016 Lancaster Ave', value: '4016-lancaster' },
        { label: '4060 Lancaster Ave', value: '4060-lancaster' },
      ],
      defaultValue: '52nd-st',
    },
    {
      name: 'source',
      type: 'select',
      label: 'Source',
      options: [
        { label: 'Google Review', value: 'google' },
        { label: 'Yelp', value: 'yelp' },
        { label: 'Direct Website QR Code', value: 'qr-code' },
      ],
      defaultValue: 'google',
    },
    {
      name: 'published',
      type: 'checkbox',
      label: 'Publish on Website Carousel',
      defaultValue: true,
    },
    {
      name: 'staffResponse',
      type: 'textarea',
      label: 'Store Response',
    },
  ],
}

