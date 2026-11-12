export interface StoreLocation {
  id: number;
  name: string;
  type: string;
  address: string;
  cityStateZip: string;
  phone: string;
  email: string;
  businessHours: string;
  calendlyUrl: string;
  gmbUrl: string;
}

export const STORES: StoreLocation[] = [
  {
    id: 1,
    name: "SmartFoneDoctor - 33 S 52nd St (West Philly)",
    type: "Flagship HQ",
    address: "33 S 52nd St, Fl 2nd",
    cityStateZip: "Philadelphia, PA 19139",
    phone: "+1 (215) 598-2090",
    email: "philly52@smartfonedoctor.com",
    businessHours: "Mon - Sat: 10:00 AM - 7:00 PM",
    calendlyUrl: "https://calendly.com/smartfonedoctor/philly-flagship",
    gmbUrl: "https://share.google/gTlyWLewR88ToAdJQ",
  },
  {
    id: 2,
    name: "SmartFoneDoctor - 4016 Lancaster Ave",
    type: "University City Branch",
    address: "4016 Lancaster Ave",
    cityStateZip: "Philadelphia, PA 19104",
    phone: "+1 (215) 598-2090",
    email: "lancaster4016@smartfonedoctor.com",
    businessHours: "Mon - Sat: 10:00 AM - 7:00 PM",
    calendlyUrl: "https://calendly.com/smartfonedoctor/lancaster-4016",
    gmbUrl: "https://maps.google.com/?q=4016+Lancaster+Ave,+Philadelphia,+PA+19104",
  },
  {
    id: 3,
    name: "SmartFoneDoctor - 4060 Lancaster Ave",
    type: "Lancaster Express",
    address: "4060 Lancaster Ave",
    cityStateZip: "Philadelphia, PA 19104",
    phone: "+1 (215) 598-2090",
    email: "lancaster4060@smartfonedoctor.com",
    businessHours: "Mon - Sat: 10:00 AM - 7:00 PM",
    calendlyUrl: "https://calendly.com/smartfonedoctor/lancaster-4060",
    gmbUrl: "https://maps.google.com/?q=4060+Lancaster+Ave,+Philadelphia,+PA+19104",
  },
];
