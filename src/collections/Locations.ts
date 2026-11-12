import type { CollectionConfig } from 'payload'

export const Locations: CollectionConfig = {
  slug: 'locations',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'phone', 'address', 'isActive'],
    group: 'Operations',
    description: 'Physical repair store locations in Philadelphia',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Store Name (e.g. 52nd St Hub)',
    },
    {
      name: 'storeCode',
      type: 'text',
      required: true,
      unique: true,
      label: 'Unique Slug / Store Code (e.g. 52nd-st)',
    },
    {
      name: 'address',
      type: 'text',
      required: true,
      label: 'Street Address',
    },
    {
      name: 'neighborhood',
      type: 'text',
      label: 'Neighborhood / Area',
      defaultValue: 'West Philadelphia, PA',
    },
    {
      name: 'phone',
      type: 'text',
      required: true,
      label: 'Store Phone Number',
      defaultValue: '+1 (215) 598-2090',
    },
    {
      name: 'hours',
      type: 'text',
      label: 'Opening Hours',
      defaultValue: 'Mon–Sat: 10:00 AM – 7:00 PM | Sun: Closed',
    },
    {
      name: 'googleMapsUrl',
      type: 'text',
      label: 'Google Maps Link',
    },
    {
      name: 'googleRating',
      type: 'number',
      label: 'Current Google Rating',
      defaultValue: 4.9,
    },
    {
      name: 'totalReviews',
      type: 'number',
      label: 'Total Google Reviews',
      defaultValue: 1520,
    },
    {
      name: 'isActive',
      type: 'checkbox',
      label: 'Store Active & Accepting Walk-ins',
      defaultValue: true,
    },
  ],
}

