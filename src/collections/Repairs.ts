import type { CollectionConfig } from 'payload'

export const Repairs: CollectionConfig = {
  slug: 'repairs',
  admin: {
    useAsTitle: 'ticketNumber',
    defaultColumns: ['ticketNumber', 'customerName', 'deviceModel', 'status', 'storeLocation', 'updatedAt'],
    group: 'Operations',
    description: 'Active repair tickets, bench progress, and customer pickup status',
  },
  fields: [
    {
      name: 'ticketNumber',
      type: 'text',
      required: true,
      unique: true,
      label: 'Ticket # (e.g. SFD-1082)',
    },
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
      label: 'Customer Phone',
    },
    {
      name: 'deviceModel',
      type: 'text',
      required: true,
      label: 'Device & Model',
    },
    {
      name: 'serialOrImei',
      type: 'text',
      label: 'IMEI / Serial Number (Optional)',
    },
    {
      name: 'issueReported',
      type: 'text',
      required: true,
      label: 'Reported Issue',
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      label: 'Repair Status',
      options: [
        { label: 'Device Received', value: 'received' },
        { label: 'Diagnosing on Bench', value: 'diagnosing' },
        { label: 'Waiting for Parts', value: 'waiting_parts' },
        { label: 'Repair in Progress', value: 'in_progress' },
        { label: 'Quality Check & Ready for Pickup', value: 'ready_pickup' },
        { label: 'Completed & Delivered', value: 'completed' },
      ],
      defaultValue: 'received',
    },
    {
      name: 'storeLocation',
      type: 'select',
      required: true,
      label: 'Store Location',
      options: [
        { label: '33 S 52nd St', value: '52nd-st' },
        { label: '4016 Lancaster Ave', value: '4016-lancaster' },
        { label: '4060 Lancaster Ave', value: '4060-lancaster' },
      ],
      defaultValue: '52nd-st',
    },
    {
      name: 'technicianName',
      type: 'text',
      label: 'Assigned Technician',
    },
    {
      name: 'totalCost',
      type: 'number',
      label: 'Total Cost / Quote ($)',
    },
    {
      name: 'warrantyDays',
      type: 'number',
      label: 'Warranty Period (Days)',
      defaultValue: 90,
    },
    {
      name: 'technicianNotes',
      type: 'textarea',
      label: 'Internal Bench Notes',
    },
  ],
}

