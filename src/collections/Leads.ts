import type { CollectionConfig } from 'payload'

export const Leads: CollectionConfig = {
  slug: 'leads',
  admin: {
    useAsTitle: 'customerName',
    defaultColumns: ['customerName', 'phone', 'device', 'status', 'store', 'createdAt'],
    group: 'Operations',
    description: 'Inquiries, phone calls, and appointment requests from all 3 stores',
  },
  fields: [
    {
      name: 'customerName',
      type: 'text',
      required: true,
      label: 'Customer Name',
    },
    {
      name: 'phone',
      type: 'text',
      required: true,
      label: 'Phone Number',
    },
    {
      name: 'email',
      type: 'email',
      label: 'Email Address (Optional)',
    },
    {
      name: 'device',
      type: 'text',
      required: true,
      label: 'Device (e.g. iPhone 15 Pro, Galaxy S23)',
    },
    {
      name: 'issue',
      type: 'text',
      required: true,
      label: 'Issue / Service Needed',
    },
    {
      name: 'store',
      type: 'select',
      required: true,
      label: 'Assigned Store Location',
      options: [
        { label: '33 S 52nd St (West Philly)', value: '52nd-st' },
        { label: '4016 Lancaster Ave', value: '4016-lancaster' },
        { label: '4060 Lancaster Ave', value: '4060-lancaster' },
      ],
      defaultValue: '52nd-st',
    },
    {
      name: 'status',
      type: 'select',
      label: 'Lead Status',
      options: [
        { label: 'New / Uncontacted', value: 'new' },
        { label: 'Contacted', value: 'contacted' },
        { label: 'Appointment Scheduled', value: 'scheduled' },
        { label: 'Completed', value: 'completed' },
        { label: 'Lost / No-Show', value: 'lost' },
      ],
      defaultValue: 'new',
    },
    {
      name: 'source',
      type: 'select',
      label: 'Acquisition Source',
      options: [
        { label: 'Google Maps / GMB', value: 'google-maps' },
        { label: 'Google Organic Search', value: 'google-search' },
        { label: 'Website Form / Estimate', value: 'website-form' },
        { label: 'Direct Phone Call', value: 'phone-call' },
        { label: 'Walk-In Customer', value: 'walk-in' },
        { label: 'ChatGPT / AI Recommendation', value: 'ai' },
        { label: 'Yelp', value: 'yelp' },
        { label: 'Instagram / Facebook', value: 'social' },
      ],
      defaultValue: 'website-form',
    },
    {
      name: 'estValue',
      type: 'number',
      label: 'Estimated Repair Value ($)',
      defaultValue: 99,
    },
    {
      name: 'notes',
      type: 'textarea',
      label: 'Technician / Dispatcher Notes',
    },
  ],
}
