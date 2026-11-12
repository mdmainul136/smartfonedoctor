export interface IssueSection {
  heading: string;
  paragraphs: string[];
  listItems?: string[];
  ordered?: boolean;
}

export interface CommonIssueDetail {
  slug: string;
  category: "smartphone" | "computer" | "tablet" | "console";
  categoryName: string;
  title: string;
  leadText: string;
  image: string;
  sections: IssueSection[];
  relatedSlugs: string[];
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
}

export const COMMON_ISSUES_CMS: CommonIssueDetail[] = [
  // 1. CHARGING PORT REPLACEMENT & REPAIR (Exact Match to User Screenshot)
  {
    slug: "charging-port-replacement",
    category: "smartphone",
    categoryName: "Smartphone",
    title: "Charging Port Replacement & Repair",
    leadText:
      "If your smartphone or tablet's charging port is malfunctioning, continue reading for assistance troubleshooting the issue.",
    image:
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=900&auto=format&fit=crop&q=80",
    sections: [
      {
        heading: "Charging Port Problems",
        paragraphs: [
          "Charging ports are easy to damage. Constant connecting and removal of the connector cord can be hard on the port and move, bend, or damage internal components. Sometimes a dropped phone can also cause charging issues. If your phone or mobile device has stopped charging correctly, there are a few things that you can do to troubleshoot and attempt to fix the problem.",
        ],
      },
      {
        heading: "Troubleshooting Charging Port Problems",
        paragraphs: [
          "The charging port can be dirty or dusty, blocking the connection. Try using a can of compressed air to remove debris from inside the port. If this does not help, it might need further cleaning. Turn off the device and use a specialized anti-static brush or a wooden toothpick to gently clean lint inside the port very carefully. Do not spray or dump any liquid directly into the port itself.",
          "You also might be using the wrong charger or a degraded cable. Are you using the original or MFi-certified charger that came with the device? Some devices have specific power delivery (PD) requirements that are not met by cheap generic chargers, even when they physically fit into the charging port on your device.",
          "Many times the internal contact pins or tension clips inside the connector become bent or depressed too far. Inspect the port with a flashlight to see if pins are misaligned, charred, or corroded from moisture.",
        ],
      },
      {
        heading: "Repairing Your Charging Port",
        paragraphs: [
          "If you have tried cleaning and routine troubleshooting, but you are still having problems with the charging port, let us evaluate the problem with a free diagnosis. Bring the device to your local SmartFoneDoctor store at 33 S 52nd St, Philadelphia.",
          "An experienced technician will evaluate the problem with precision multimeter diagnostic probes and give you an exact upfront estimate of time and cost to repair or micro-solder the charging port.",
        ],
      },
    ],
    relatedSlugs: [
      "cracked-glass-replacement",
      "water-damaged-phone-repair",
      "speaker-replacement",
      "battery-replacement",
    ],
    seo: {
      title: "Charging Port Replacement & Repair | SmartFoneDoctor",
      description:
        "Learn how to troubleshoot and fix phone charging port problems. Fast same-day charging port repairs and micro-soldering in Philadelphia.",
      keywords: ["Charging Port Repair", "Phone Wont Charge", "USB-C Port Replacement", "Fix iPhone Charger Port"],
    },
  },

  // 2. CRACKED GLASS REPLACEMENT
  {
    slug: "cracked-glass-replacement",
    category: "smartphone",
    categoryName: "Smartphone",
    title: "Cracked Glass Replacement & Screen Repair",
    leadText:
      "A shattered or fractured front glass screen is frustrating, but in most cases, your underlying phone is completely salvageable.",
    image:
      "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=900&auto=format&fit=crop&q=80",
    sections: [
      {
        heading: "Glass Only vs Full Display Assembly",
        paragraphs: [
          "If your display lights up normally without colored vertical lines or black ink spots and touch still works smoothly, only the outer glass layer is damaged. In modern OLED and Retina screens, replacing the glass or full assembly restores the phone to factory cosmetic and touch condition.",
        ],
      },
      {
        heading: "Preventing Glass Shards & Internal Damage",
        paragraphs: [
          "Continued use of a cracked screen allows moisture and dust to enter inside the digitizer layers, eventually destroying the expensive OLED panel below. Apply a clear screen protector or tape temporarily to keep glass shards in place until you can bring it to a repair shop.",
        ],
      },
      {
        heading: "Same-Day Screen Replacement at SmartFoneDoctor",
        paragraphs: [
          "Our technicians replace cracked screens in under 45 minutes using OEM-grade displays with True Tone calibration and multi-touch responsiveness backed by warranty.",
        ],
      },
    ],
    relatedSlugs: [
      "charging-port-replacement",
      "water-damaged-phone-repair",
      "battery-replacement",
      "speaker-replacement",
    ],
    seo: {
      title: "Cracked Glass Replacement & Screen Fix | SmartFoneDoctor",
      description: "Fast 45-minute cracked glass and OLED screen replacement in Philadelphia. OEM quality displays backed by warranty.",
      keywords: ["Cracked Screen Repair", "Phone Glass Replacement", "Fix Broken Screen Philadelphia"],
    },
  },

  // 3. WATER DAMAGED PHONE REPAIR
  {
    slug: "water-damaged-phone-repair",
    category: "smartphone",
    categoryName: "Smartphone",
    title: "Water & Liquid Damaged Phone Repair",
    leadText:
      "Accidentally dropped your device in water, coffee, or rain? Time is critical to prevent permanent logic board corrosion.",
    image:
      "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=900&auto=format&fit=crop&q=80",
    sections: [
      {
        heading: "Immediate Steps to Take",
        paragraphs: [
          "Turn off the device immediately and DO NOT plug it into a charger. Plugging a wet device into power sends electricity across short-circuited water pathways, instantly frying processor chips and memory chips.",
          "Do not put your phone in rice! Rice does not absorb internal moisture and introduces sticky starch powder into ports and speaker grilles. Leave the phone in a dry airflow and bring it to a technician as soon as possible.",
        ],
      },
      {
        heading: "Ultrasonic Cleaning & Desoldering",
        paragraphs: [
          "At SmartFoneDoctor, we disassemble the device down to the logic board and submerge it in our medical-grade ultrasonic cleaning tanks with specialized chemical solvents. This dissolves mineral oxidation before it corrodes microscopic copper traces.",
        ],
      },
    ],
    relatedSlugs: [
      "charging-port-replacement",
      "battery-replacement",
      "cracked-glass-replacement",
      "speaker-replacement",
    ],
    seo: {
      title: "Water Damaged Phone Repair & Ultrasonic Treatment | SmartFoneDoctor",
      description: "Emergency liquid damage recovery and ultrasonic board cleaning in Philadelphia. Save your phone and data from corrosion.",
      keywords: ["Water Damaged Phone", "Liquid Damage Repair Philadelphia", "Ultrasonic Board Cleaning"],
    },
  },

  // 4. HDMI PORT REPAIR (Console)
  {
    slug: "hdmi-port-repair",
    category: "console",
    categoryName: "Game Console",
    title: "HDMI Port Replacement & Repair",
    leadText:
      "PlayStation 5, Xbox Series X or Nintendo Switch won't display video or shows 'No Signal'? Bent HDMI pins are the #1 console fault.",
    image:
      "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=900&auto=format&fit=crop&q=80",
    sections: [
      {
        heading: "Why Do Console HDMI Ports Break?",
        paragraphs: [
          "Tripping over the HDMI cord, transporting the console in a backpack with the cable still inserted, or forcing the cable in upside-down easily pushes internal pins backwards and cracks the surface-mount solder joints on the motherboard.",
        ],
      },
      {
        heading: "Micro-Soldering Precision Replacement",
        paragraphs: [
          "HDMI repair cannot be fixed with glue or tape. It requires desoldering the broken port with hot air under high magnification, cleaning all 19 copper pads, and micro-soldering a brand-new reinforced OEM HDMI 2.1 port.",
          "Our technicians perform same-day console HDMI replacements in Philadelphia with 4K/120Hz display testing before return.",
        ],
      },
    ],
    relatedSlugs: [
      "charging-port-replacement",
      "cracked-glass-replacement",
      "battery-replacement",
      "water-damaged-phone-repair",
    ],
    seo: {
      title: "Console HDMI Port Replacement & Micro-Soldering | SmartFoneDoctor",
      description: "Same-day PS5, PS4, and Xbox HDMI port replacement in Philadelphia. Fix No Signal and bent pins with warranty.",
      keywords: ["PS5 HDMI Port Repair", "Console HDMI Fix Philadelphia", "Xbox HDMI Replacement"],
    },
  },

  // 5. SPEAKER REPLACEMENT & REPAIR
  {
    slug: "speaker-replacement",
    category: "smartphone",
    categoryName: "Smartphone",
    title: "Speaker Replacement & Audio Repair",
    leadText:
      "Muffled sound, crackling speaker, or can't hear callers during phone calls? Learn how we troubleshoot and repair audio hardware.",
    image:
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=900&auto=format&fit=crop&q=80",
    sections: [
      {
        heading: "Ear Speaker vs Loudspeaker",
        paragraphs: [
          "Smartphones have two distinct speakers: the top earpiece speaker used during phone calls, and the bottom loudspeaker used for speakerphone, video playback, and ringtones. Dirt and makeup buildup frequently clog the top fine acoustic mesh.",
        ],
      },
      {
        heading: "Restoring Clear Audio",
        paragraphs: [
          "If acoustic cleaning doesn't restore full volume, the internal magnetic driver coil is blown. We replace the speaker module with OEM parts to bring back booming, crystal-clear audio.",
        ],
      },
    ],
    relatedSlugs: [
      "charging-port-replacement",
      "battery-replacement",
      "cracked-glass-replacement",
      "water-damaged-phone-repair",
    ],
    seo: {
      title: "Phone Speaker Replacement & Audio Repair | SmartFoneDoctor",
      description: "Fix crackling, distorted, or quiet phone speakers in Philadelphia. Fast same-day speaker replacements with warranty.",
      keywords: ["Phone Speaker Repair", "Earpiece Fix", "Loudspeaker Replacement"],
    },
  },

  // 6. BATTERY REPLACEMENT
  {
    slug: "battery-replacement",
    category: "smartphone",
    categoryName: "Smartphone",
    title: "Battery Replacement & Power Repair",
    leadText:
      "If your battery drops from 40% to 1% in minutes, restarts randomly, or the back cover is bulging, your lithium battery needs replacement.",
    image:
      "https://images.unsplash.com/photo-1588508065123-287b28e013da?w=900&auto=format&fit=crop&q=80",
    sections: [
      {
        heading: "Lithium-Ion Chemical Aging",
        paragraphs: [
          "All rechargeable batteries have a finite lifespan of roughly 500 charge cycles (about 2 years). As they chemically degrade, internal resistance increases, resulting in thermal throttling, stuttering performance, and sudden shutdowns under load.",
        ],
      },
      {
        heading: "Swollen Battery Safety Warning",
        paragraphs: [
          "If your screen or back cover is lifting, stop charging immediately. Swollen batteries produce hazardous flammable gases and require immediate professional disposal and replacement.",
        ],
      },
      {
        heading: "30-Minute Battery Replacement",
        paragraphs: [
          "SmartFoneDoctor installs tested, safety-certified high-capacity batteries that restore original all-day endurance in just 30 minutes.",
        ],
      },
    ],
    relatedSlugs: [
      "charging-port-replacement",
      "cracked-glass-replacement",
      "water-damaged-phone-repair",
      "speaker-replacement",
    ],
    seo: {
      title: "Phone Battery Replacement | SmartFoneDoctor Philadelphia",
      description: "Fast 30-minute phone battery replacement in Philadelphia. Tested safety-certified batteries backed by warranty.",
      keywords: ["Battery Replacement", "Phone Battery Dying Fast", "Fix Swollen Battery"],
    },
  },

  // 7. MACBOOK PRO LOGIC BOARD REPLACEMENT (Exact Match to User Screenshot)
  {
    slug: "macbook-pro-logic-board-replacement",
    category: "computer",
    categoryName: "Computers",
    title: "MacBook Pro Logic Board Replacement",
    leadText:
      "For assistance troubleshooting your MacBook Pro logic board issues or to request professional repair services, turn to the experts at SmartFoneDoctor. As a trusted leader in device repair, we have the tools, parts, and micro-soldering experience to bring your MacBook Pro back to life.",
    image:
      "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=1200&auto=format&fit=crop&q=80",
    sections: [
      {
        heading: "Troubleshooting MacBook Pro Logic Board Problems",
        paragraphs: [
          "Before you decide to replace your MacBook Pro's logic board, it is important to accurately diagnose the root cause. Logic board failure can manifest in subtle or catastrophic ways across different components. Below are the most frequent warning signs our certified technicians look for:"
        ],
      },
      {
        heading: "Screen Goes Black",
        paragraphs: [
          "If your MacBook Pro turns on—the keyboard backlights glow, fans spin, or the startup chime sounds—but the display remains pitch black, the issue usually stems from a damaged display connector, backlight circuit fuse (0402 smd), or corrupted graphics chip on the logic board.",
        ],
      },
      {
        heading: "Overheating & Runaway Fans",
        paragraphs: [
          "A failing logic board can cause cooling fans to spin at maximum 6000+ RPM even when idle. This indicates an SMC (System Management Controller) thermal sensor fault, corroded track, or dried factory thermal paste causing extreme CPU/GPU throttling.",
        ],
      },
      {
        heading: "Liquid Damage Diagnosis",
        paragraphs: [
          "Spilling water, coffee, or soda onto the keyboard or vents allows conductive liquid to seep directly onto logic board traces. Electricity rushing through the liquid causes immediate electrolytic corrosion that eats away copper contacts and shorts power rails.",
          "If your MacBook has had liquid contact, power it off immediately, do not connect the MagSafe charger, and bring it to our store for professional ultrasonic board decontamination.",
        ],
      },
      {
        heading: "How Do I Know If My Logic Board Needs Repair?",
        paragraphs: [
          "A failing logic board frequently mimics bad battery health, kernel panics, or SSD failure. You can run Apple Hardware Test (press and hold 'D' on startup), but an in-depth diagnosis requires checking power rails (PPBUS_G3H, 3V3_G3H) with a digital multimeter and thermal camera under a microscope.",
        ],
      },
      {
        heading: "Can You Repair a Logic Board Instead of Replacing It?",
        paragraphs: [
          "Yes! In over 80% of cases, replacing the entire logic board is completely unnecessary and cost-prohibitive. SmartFoneDoctor's technicians specialize in micro-soldering, allowing us to pinpoint and replace individual blown MOSFETs, capacitors, or charging IC chips (like the ISL9240 / CD3215) at a fraction of the cost of a full motherboard replacement.",
        ],
      },
      {
        heading: "What Is the Cost to Replace a MacBook Pro Logic Board?",
        paragraphs: [
          "Official Apple Store out-of-warranty logic board replacements often cost between $650 and $1,200+. At SmartFoneDoctor, our component-level board repairs and quality refurbished OEM board replacements save you hundreds of dollars. Plus, we provide upfront diagnostics with zero hidden fees.",
        ],
      },
      {
        heading: "Step-by-Step Logic Board Replacement Guide",
        paragraphs: [
          "If you are an experienced technician equipped with ESD protection and precision tools, follow this step-by-step disassembly procedure to replace the logic board safely:",
        ],
        listItems: [
          "P5 Pentalobe screwdriver (bottom case screws)",
          "Torx T3, T5, T6, and T8 precision screwdrivers",
          "ESD-safe anti-static wrist strap and mat",
          "Fine curved tweezers and nylon spudger",
          "99% anhydrous isopropyl alcohol & microfiber lint-free wipes",
          "High-grade thermal paste (e.g., Arctic MX-6 or Noctua NT-H2)",
        ],
        ordered: false,
      },
      {
        heading: "Disassembly & Installation Steps",
        paragraphs: [
          "Follow these sequential steps in order. Keep track of all screws, as they vary in length and diameter:",
        ],
        listItems: [
          "Power Off & Unplug: Ensure the MacBook is fully shut down and disconnected from all power adapters and external monitors.",
          "Remove Lower Case: Using the P5 Pentalobe screwdriver, remove the perimeter screws. Pull the bottom plate toward the front edge to release internal locking clips.",
          "Disconnect the Battery Terminal: Immediately peel back the battery connector warning label and pull the power flex disconnect tab to cut power to the logic board.",
          "Discharge Residual Energy: Press and hold the power button for 10 seconds to drain remaining capacitor energy.",
          "Disconnect I/O & Peripheral Cables: Gently flip the ZIF retention flaps and disconnect the trackpad flex, keyboard flex, audio board cable, and microphone arrays.",
          "Remove Left and Right Cooling Fans: Unscrew the Torx screws securing each fan, disconnect the fan ribbon cables, and lift both fans clear.",
          "Disconnect Display Cables: Remove the metal retention bracket over the eDP display connector, disconnect the backlight cable, and lift the display connector straight up.",
          "Disconnect Wi-Fi / Bluetooth Antennas: Use fine tweezers to gently pry the coaxial antenna cables straight up from the wireless card.",
          "Remove Heat Sink Assembly: Loosen the spring-tensioned screws securing the copper heat pipe over the CPU and GPU in reverse numerical sequence (4, 3, 2, 1). Lift away the heat sink.",
          "Unscrew the Logic Board: Remove all remaining Torx screws holding the motherboard to the aluminum unibody enclosure, noting their exact positions.",
          "Extract Logic Board: Carefully pivot the logic board upwards from the front edge, making sure no cables catch beneath it, and slide it free from the port cutouts.",
          "Clean Thermal Surfaces: Clean the old, hardened thermal paste off both the heatsink and the processor dies using 99% isopropyl alcohol until mirror-shiny.",
          "Install Replacement Board: Carefully angle the replacement logic board into the chassis port cutouts. Seat it flush, verifying no ribbon cables are pinched underneath.",
          "Reapply Thermal Paste & Reassemble: Apply a pea-sized dot of premium thermal compound to the CPU/GPU dies. Reinstall the heatsink, tighten screws evenly, reconnect all ribbon cables, reattach the battery terminal, reinstall the bottom cover, and perform an SMC/NVRAM reset.",
        ],
        ordered: true,
      },
    ],
    relatedSlugs: [
      "charging-port-replacement",
      "cracked-glass-replacement",
      "water-damaged-phone-repair",
      "battery-replacement",
    ],
    seo: {
      title: "MacBook Pro Logic Board Replacement & Repair | SmartFoneDoctor",
      description:
        "Complete troubleshooting and step-by-step logic board replacement guide for MacBook Pro. Micro-soldering and board repairs in Philadelphia.",
      keywords: [
        "MacBook Pro Logic Board Replacement",
        "MacBook Logic Board Repair",
        "Fix MacBook Motherboard",
        "MacBook Wont Turn On Philadelphia",
        "Micro Soldering MacBook",
      ],
    },
  },
];

export function getAllCommonIssuesCMS(): CommonIssueDetail[] {
  return COMMON_ISSUES_CMS;
}

export function getCommonIssueBySlug(
  slug: string,
  category?: string
): CommonIssueDetail | undefined {
  if (category) {
    return COMMON_ISSUES_CMS.find(
      (item) =>
        item.slug.toLowerCase() === slug.toLowerCase() &&
        item.category.toLowerCase() === category.toLowerCase()
    );
  }
  return COMMON_ISSUES_CMS.find(
    (item) => item.slug.toLowerCase() === slug.toLowerCase()
  );
}

export function getRelatedIssues(currentSlug: string): CommonIssueDetail[] {
  const current = getCommonIssueBySlug(currentSlug);
  if (!current) return COMMON_ISSUES_CMS.slice(0, 4);

  return COMMON_ISSUES_CMS.filter(
    (item) =>
      item.slug !== currentSlug &&
      (current.relatedSlugs.includes(item.slug) || true)
  ).slice(0, 4);
}

