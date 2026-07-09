export const galleryCategories = [
  { id: "ui", label: { en: "UIs", zh: "界面" } },
  { id: "poster", label: { en: "Posters", zh: "海报" } }
];

const localizedLabel = (label) => ({ en: label, zh: label });

const galleryFrame = (folder, id, alt, width, height) => ({
  id,
  src: `/images/gallery/${folder}/${id}.webp`,
  alt,
  width,
  height
});

export const galleryItems = [
  {
    id: "tabmac-homepage",
    category: "ui",
    projectId: "tabmac",
    presentation: "phone",
    description: {
      en: "Tabmac Homepage",
      zh: "Tabmac Homepage"
    },
    frames: [
      {
        id: "tabmac-homepage-locations",
        src: "/images/gallery/tabmac/tabmac-homepage-locations.webp",
        alt: "Tabmac Homepage - Locations",
        width: 804,
        height: 1748
      },
      {
        id: "tabmac-homepage-locations-scrolling",
        src: "/images/gallery/tabmac/tabmac-homepage-locations-scrolling.webp",
        alt: "Tabmac Homepage - Locations Scrolling",
        width: 804,
        height: 1748
      },
      {
        id: "tabmac-homepage-locations-map",
        src: "/images/gallery/tabmac/tabmac-homepage-locations-map.webp",
        alt: "Tabmac Homepage - Map",
        width: 804,
        height: 1748
      }
    ]
  },
  {
    id: "tabmac-order",
    category: "ui",
    projectId: "tabmac",
    presentation: "phone",
    description: {
      en: "Tabmac - Oder",
      zh: "Tabmac - Oder"
    },
    frames: [
      {
        id: "tabmac-order-store-page-selected",
        src: "/images/gallery/tabmac/tabmac-order-store-page-selected.webp",
        alt: "Tabmac - Oder - Store page selected",
        width: 804,
        height: 1748
      },
      {
        id: "tabmac-order-confirm",
        src: "/images/gallery/tabmac/tabmac-order-confirm.webp",
        alt: "Tabmac - Oder - Confirm",
        width: 804,
        height: 1748
      },
      {
        id: "tabmac-order-confirmed",
        src: "/images/gallery/tabmac/tabmac-order-confirmed.webp",
        alt: "Tabmac - Oder - Confirmed",
        width: 804,
        height: 1748
      },
      {
        id: "tabmac-order-edit-usage",
        src: "/images/gallery/tabmac/tabmac-order-edit-usage.webp",
        alt: "Tabmac - Oder - Edit Usage",
        width: 804,
        height: 1748
      }
    ]
  },
  {
    id: "tabmac-tip",
    category: "ui",
    projectId: "tabmac",
    presentation: "phone",
    description: {
      en: "Tabmac - Tip",
      zh: "Tabmac - Tip"
    },
    frames: [
      {
        id: "tabmac-tip",
        src: "/images/gallery/tabmac/tabmac-tip.webp",
        alt: "Tabmac - Tip",
        width: 804,
        height: 1748
      },
      {
        id: "tabmac-tip-select-payment-method",
        src: "/images/gallery/tabmac/tabmac-tip-select-payment-method.webp",
        alt: "Tabmac - Tip - Select payment method",
        width: 804,
        height: 1748
      },
      {
        id: "tabmac-tip-succeed",
        src: "/images/gallery/tabmac/tabmac-tip-succeed.webp",
        alt: "Tabmac - Tip - Succeed",
        width: 804,
        height: 1748
      }
    ]
  },
  {
    id: "tabmac-account-onboarding",
    category: "ui",
    projectId: "tabmac",
    presentation: "phone",
    description: {
      en: "Tabmac - Account & Onboarding",
      zh: "Tabmac - Account & Onboarding"
    },
    frames: [
      {
        id: "tabmac-account",
        src: "/images/gallery/tabmac/tabmac-account.webp",
        alt: "Tabmac - Account & Onboarding - Account",
        width: 804,
        height: 1748
      },
      {
        id: "tabmac-account-onboarding",
        src: "/images/gallery/tabmac/tabmac-account-onboarding.webp",
        alt: "Tabmac - Account & Onboarding - Account Onboarding",
        width: 804,
        height: 1748
      },
      {
        id: "tabmac-onboarding-1",
        src: "/images/gallery/tabmac/tabmac-onboarding-1.webp",
        alt: "Tabmac - Account & Onboarding - Onboarding 1",
        width: 804,
        height: 1748
      },
      {
        id: "tabmac-onboarding-1-5",
        src: "/images/gallery/tabmac/tabmac-onboarding-1-5.webp",
        alt: "Tabmac - Account & Onboarding - Onboarding 1.5",
        width: 804,
        height: 1748
      },
      {
        id: "tabmac-onboarding-2",
        src: "/images/gallery/tabmac/tabmac-onboarding-2.webp",
        alt: "Tabmac - Account & Onboarding - Onboarding 2",
        width: 804,
        height: 1748
      },
      {
        id: "tabmac-onboarding-3",
        src: "/images/gallery/tabmac/tabmac-onboarding-3.webp",
        alt: "Tabmac - Account & Onboarding - Onboarding 3",
        width: 804,
        height: 1748
      },
      {
        id: "tabmac-onboarding-4",
        src: "/images/gallery/tabmac/tabmac-onboarding-4.webp",
        alt: "Tabmac - Account & Onboarding - Onboarding 4",
        width: 804,
        height: 1748
      },
      {
        id: "tabmac-onboarding-5",
        src: "/images/gallery/tabmac/tabmac-onboarding-5.webp",
        alt: "Tabmac - Account & Onboarding - Onboarding 5",
        width: 804,
        height: 1748
      }
    ]
  },
  {
    id: "tabmac-checkout",
    category: "ui",
    projectId: "tabmac",
    presentation: "phone",
    description: {
      en: "Tabmac - Checkout",
      zh: "Tabmac - Checkout"
    },
    frames: [
      {
        id: "tabmac-checkout-app-clip",
        src: "/images/gallery/tabmac/tabmac-checkout-app-clip.webp",
        alt: "Tabmac - Checkout - App Clip",
        width: 804,
        height: 1748
      },
      {
        id: "tabmac-checkout",
        src: "/images/gallery/tabmac/tabmac-checkout.webp",
        alt: "Tabmac - Checkout",
        width: 804,
        height: 1748
      }
    ]
  },
  {
    id: "tabmac-business",
    category: "ui",
    projectId: "tabmac",
    presentation: "desktop",
    description: {
      en: "Tabmac Business",
      zh: "Tabmac Business"
    },
    frames: [
      {
        id: "tabmac-business-home-signed-out",
        src: "/images/gallery/tabmac/tabmac-business-home-signed-out.webp",
        alt: "Tabmac Business - Home Signed out",
        width: 2880,
        height: 2048
      },
      {
        id: "tabmac-business-home-signed-in",
        src: "/images/gallery/tabmac/tabmac-business-home-signed-in.webp",
        alt: "Tabmac Business - Home Signed in",
        width: 2880,
        height: 2048
      },
      {
        id: "tabmac-business-recurring-purchase-item-select",
        src: "/images/gallery/tabmac/tabmac-business-recurring-purchase-item-select.webp",
        alt: "Tabmac Business - Rurring Purchase Item select",
        width: 2880,
        height: 2048
      },
      {
        id: "tabmac-business-storage",
        src: "/images/gallery/tabmac/tabmac-business-storage.webp",
        alt: "Tabmac Business - Storage",
        width: 2880,
        height: 2048
      },
      {
        id: "tabmac-business-team-detail",
        src: "/images/gallery/tabmac/tabmac-business-team-detail.webp",
        alt: "Tabmac Business - Team Detail",
        width: 2880,
        height: 2048
      }
    ]
  },
  {
    id: "tabmac-redeem",
    category: "ui",
    projectId: "tabmac",
    presentation: "phone",
    description: {
      en: "Tabmac - Redeem",
      zh: "Tabmac - Redeem"
    },
    frames: [
      {
        id: "tabmac-redeem-app-clip",
        src: "/images/gallery/tabmac/tabmac-redeem-app-clip.webp",
        alt: "Tabmac - Redeem - App Clip",
        width: 804,
        height: 1748
      },
      {
        id: "tabmac-redeem-enter-key",
        src: "/images/gallery/tabmac/tabmac-redeem-enter-key.webp",
        alt: "Tabmac - Redeem - Enter Key",
        width: 804,
        height: 1748
      },
      {
        id: "tabmac-redeem",
        src: "/images/gallery/tabmac/tabmac-redeem.webp",
        alt: "Tabmac - Redeem",
        width: 804,
        height: 1748
      },
      {
        id: "tabmac-redeem-add-into-account-in-appclip",
        src: "/images/gallery/tabmac/tabmac-redeem-add-into-account-in-appclip.webp",
        alt: "Tabmac - Redeem - Add into Account in App Clip",
        width: 804,
        height: 1748
      },
      {
        id: "tabmac-redeem-new-plan",
        src: "/images/gallery/tabmac/tabmac-redeem-new-plan.webp",
        alt: "Tabmac - Redeem - New Plan",
        width: 804,
        height: 1748
      }
    ]
  },
  {
    id: "tabmac-mail-template",
    category: "ui",
    projectId: "tabmac",
    presentation: "mail",
    description: {
      en: "Tabmac - Mail Template",
      zh: "Tabmac - Mail Template"
    },
    frames: [
      {
        id: "tabmac-mail-business-team-invite",
        src: "/images/gallery/tabmac/tabmac-mail-business-team-invite.webp",
        alt: "Tabmac - Mail Template - Business Team Invite",
        width: 1190,
        height: 1684
      },
      {
        id: "tabmac-mail-allocate-notification",
        src: "/images/gallery/tabmac/tabmac-mail-allocate-notification.webp",
        alt: "Tabmac - Mail Template - Allocate Notification",
        width: 1190,
        height: 1684
      }
    ]
  },
  {
    id: "treeing-host-dashboard",
    category: "ui",
    projectId: "treeing",
    presentation: "desktop",
    description: localizedLabel("Treeing - Host Dashboard"),
    frames: [
      galleryFrame("treeing", "treeing-host-dashboard-dashboard", "Treeing - Host Dashboard - Dashboard", 2880, 2048),
      galleryFrame("treeing", "treeing-host-dashboard-listings", "Treeing - Host Dashboard - Listings", 2880, 2048),
      galleryFrame("treeing", "treeing-host-dashboard-reservations", "Treeing - Host Dashboard - Reservations", 2880, 2048),
      galleryFrame("treeing", "treeing-host-dashboard-guest-list", "Treeing - Host Dashboard - Guest List", 2880, 2048),
      galleryFrame("treeing", "treeing-host-dashboard-billing-income", "Treeing - Host Dashboard - Billing & Income", 2880, 2354)
    ]
  },
  {
    id: "treeing-list-editing",
    category: "ui",
    projectId: "treeing",
    presentation: "desktop",
    description: localizedLabel("Treeing - List Editing"),
    frames: [
      galleryFrame("treeing", "treeing-list-editing-flow", "Treeing - List Editing", 2880, 10326),
      galleryFrame("treeing", "treeing-list-editing-sidebar-normal", "Treeing - List Editing - Sidebar Normal", 2880, 1800),
      galleryFrame("treeing", "treeing-list-editing-sidebar-sections", "Treeing - List Editing - Sidebar with sections", 2880, 1800),
      galleryFrame("treeing", "treeing-list-editing-sidebar-cards", "Treeing - List Editing - Sidebar cards", 2880, 1800),
      galleryFrame("treeing", "treeing-list-editing-sidebar-wide", "Treeing - List Editing - Sidebar wide", 2880, 1800)
    ]
  },
  {
    id: "treeing-homepage-tabs",
    category: "ui",
    projectId: "treeing",
    presentation: "desktop",
    description: localizedLabel("Treeing - Homepage Tabs"),
    frames: [
      galleryFrame("treeing", "treeing-homepage-tabs-homepage", "Treeing - Homepage Tabs - Homepage", 2880, 2048),
      galleryFrame("treeing", "treeing-homepage-tabs-maps", "Treeing - Homepage Tabs - Maps", 2880, 2030),
      galleryFrame("treeing", "treeing-homepage-tabs-hosts", "Treeing - Homepage Tabs - Hosts", 2880, 2048)
    ]
  },
  {
    id: "treeing-oobe",
    category: "ui",
    projectId: "treeing",
    presentation: "desktop",
    description: localizedLabel("Treeing - OOBE"),
    frames: [
      galleryFrame("treeing", "treeing-oobe-1", "Treeing - OOBE - 1", 2880, 2048),
      galleryFrame("treeing", "treeing-oobe-2", "Treeing - OOBE - 2", 2880, 2048),
      galleryFrame("treeing", "treeing-oobe-3", "Treeing - OOBE - 3", 2880, 2048),
      galleryFrame("treeing", "treeing-oobe-4", "Treeing - OOBE - 4", 2880, 2048),
      galleryFrame("treeing", "treeing-oobe-5", "Treeing - OOBE - 5", 2880, 2048),
      galleryFrame("treeing", "treeing-oobe-6", "Treeing - OOBE - 6", 2880, 2048),
      galleryFrame("treeing", "treeing-oobe-7", "Treeing - OOBE - 7", 2880, 2048),
      galleryFrame("treeing", "treeing-oobe-8", "Treeing - OOBE - 8", 2880, 2048),
      galleryFrame("treeing", "treeing-oobe-9", "Treeing - OOBE - 9", 2880, 2048)
    ]
  },
  {
    id: "treeing-invite-signup",
    category: "ui",
    projectId: "treeing",
    presentation: "desktop",
    description: localizedLabel("Treeing - Invite & Sign up"),
    frames: [
      galleryFrame("treeing", "treeing-invite-signup-invitation-link", "Treeing - Invite & Sign up - Invitation Link", 2880, 2048),
      galleryFrame("treeing", "treeing-invite-signup-sign-up", "Treeing - Invite & Sign up - Sign Up", 2880, 2048),
      galleryFrame("treeing", "treeing-invite-signup-third-party-sign-up", "Treeing - Invite & Sign up - 3rd Party Sign Up", 2880, 2048)
    ]
  },
  {
    id: "treeing-order",
    category: "ui",
    projectId: "treeing",
    presentation: "desktop",
    description: localizedLabel("Treeing - Order"),
    frames: [
      galleryFrame("treeing", "treeing-order-information", "Treeing - Order - Information", 2880, 8606),
      galleryFrame("treeing", "treeing-order-reserve", "Treeing - Order - Reserve", 2880, 5316),
      galleryFrame("treeing", "treeing-order-payment", "Treeing - Order - Choose your payment", 2880, 4398)
    ]
  },
  {
    id: "treeing-batch-set",
    category: "ui",
    projectId: "treeing",
    presentation: "desktop",
    description: localizedLabel("Treeing - Batch Set"),
    frames: [
      galleryFrame("treeing", "treeing-batch-set-step-1", "Treeing - Batch Set - Step 1", 1800, 986),
      galleryFrame("treeing", "treeing-batch-set-step-2", "Treeing - Batch Set - Step 2", 1800, 1118),
      galleryFrame("treeing", "treeing-batch-set-step-3", "Treeing - Batch Set - Step 3", 1800, 1338)
    ]
  },
  {
    id: "treeing-ios-app",
    category: "ui",
    projectId: "treeing",
    presentation: "phone",
    description: localizedLabel("Treeing - iOS APP"),
    frames: [
      galleryFrame("treeing", "treeing-ios-explore", "Treeing - iOS APP - Explore", 804, 1748),
      galleryFrame("treeing", "treeing-ios-map-view-multiple", "Treeing - iOS APP - Map View Multiple", 804, 1748),
      galleryFrame("treeing", "treeing-ios-listing", "Treeing - iOS APP - Listing", 804, 6446),
      galleryFrame("treeing", "treeing-ios-reserve", "Treeing - iOS APP - Reserve", 804, 3378),
      galleryFrame("treeing", "treeing-ios-dates", "Treeing - iOS APP - Dates", 804, 1748),
      galleryFrame("treeing", "treeing-ios-pay", "Treeing - iOS APP - Pay", 804, 1748),
      galleryFrame("treeing", "treeing-ios-rewards", "Treeing - iOS APP - Rewards", 804, 1748)
    ]
  },
  {
    id: "treeing-host-page",
    category: "ui",
    projectId: "treeing",
    presentation: "desktop",
    description: localizedLabel("Treeing - Host Page"),
    frames: [
      galleryFrame("treeing", "treeing-host-page", "Treeing - Host Page", 2880, 5002)
    ]
  },
  {
    id: "treeing-spotlight",
    category: "ui",
    projectId: "treeing",
    presentation: "desktop",
    description: localizedLabel("Treeing - Spotlight"),
    frames: [
      galleryFrame("treeing", "treeing-spotlight", "Treeing - Spotlight", 2880, 2086)
    ]
  },
  {
    id: "poster-working-late-kiki",
    category: "poster",
    presentation: "poster",
    ...galleryFrame("posters", "poster-working-late-kiki", "I'm working late...Kiki poster", 2480, 3508)
  },
  {
    id: "poster-after-disaster",
    category: "poster",
    presentation: "poster",
    ...galleryFrame("posters", "poster-after-disaster", "After-disaster discussion poster", 2480, 3508)
  },
  {
    id: "poster-habitat",
    category: "poster",
    presentation: "poster",
    ...galleryFrame("posters", "poster-habitat", "Habitat co-building invitation poster", 2480, 3508)
  },
  {
    id: "poster-qingming",
    category: "poster",
    presentation: "poster",
    ...galleryFrame("posters", "poster-qingming", "Qingming memorial poster", 2480, 3508)
  },
  {
    id: "poster-icedheart",
    category: "poster",
    presentation: "poster",
    ...galleryFrame("posters", "poster-icedheart", "IcedHeart poster", 2480, 3508)
  },
  {
    id: "poster-national-day",
    category: "poster",
    presentation: "poster",
    ...galleryFrame("posters", "poster-national-day", "National Day special event poster", 2480, 3508)
  },
  {
    id: "poster-national-day-2",
    category: "poster",
    presentation: "poster",
    ...galleryFrame("posters", "poster-national-day-2", "National Day special event second poster", 2479, 3508)
  }
];
