import type { CollectionConfig } from 'payload'
import {
  HeroBlock,
  BenefitsBlock,
  ServicesBlock,
  FaqBlock,
  CtaBlock,
} from '../blocks'

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
      label: 'Page Title',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: 'URL Slug (e.g. "home", "about")',
    },
    {
      name: 'announcementBar',
      type: 'group',
      label: 'Top Announcement Bar',
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
    {
      name: 'layout',
      type: 'blocks',
      label: 'Page Builder (Drag & Drop Sections)',
      blocks: [
        HeroBlock,
        BenefitsBlock,
        ServicesBlock,
        FaqBlock,
        CtaBlock,
      ],
    },
  ],
}
