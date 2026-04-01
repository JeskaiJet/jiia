const imgDeweyEducation1 = "https://www.figma.com/api/mcp/asset/ce5fee3f-4743-43e9-8bda-f13bfaba2c38";
const imgTreeingBanner1 = "https://www.figma.com/api/mcp/asset/8b54b0bf-aac5-4efb-bd4a-7e224052342a";
const imgTreeingWebHome1 = "https://www.figma.com/api/mcp/asset/89f287de-36d2-441e-9e3b-63cc434a0e09";
const imgTreeingWebHome2 = "https://www.figma.com/api/mcp/asset/b090f275-57bb-4ea7-a62e-4bc6a739d97c";
const imgMockupContent1206PxX2622Px1 = "https://www.figma.com/api/mcp/asset/28dde9a5-8b9e-4130-9588-d94a6bfaddf0";
const imgMockupContent1206PxX2622Px2 = "https://www.figma.com/api/mcp/asset/d6535cf5-03a2-47ec-8aba-eff49490699d";
const imgVector = "https://www.figma.com/api/mcp/asset/974064d0-e9f8-4228-a1a0-bc6d2d1fef24";
const imgVector1 = "https://www.figma.com/api/mcp/asset/e9aeb798-0b18-47dd-a65a-636f1850ab12";
const imgVector2 = "https://www.figma.com/api/mcp/asset/03199955-468d-4522-9ba1-86542d919cf6";
const imgVector3 = "https://www.figma.com/api/mcp/asset/0c2e1ddb-69c5-407c-b602-059d1253842b";
const imgVector2Stroke = "https://www.figma.com/api/mcp/asset/975dc6b6-c759-4b8d-8a3b-e123c5af78ca";
const imgTreeing = "https://www.figma.com/api/mcp/asset/3398cccd-797a-4c1b-a58a-3bc975efe97d";

export const portfolioAssets = {
  abmac: {
    vector: imgVector,
    vector1: imgVector1,
    vector2: imgVector2,
    vector3: imgVector3,
    vector2Stroke: imgVector2Stroke
  }
};

export const projects = [
  {
    id: "abmac-food",
    name: "abmac",
    theme: {
      accent: "#1f8dff",
      accentRgb: "31 141 255"
    },
    meta: {
      en: "Food Service, Mobile & Web, 2025-2026",
      zh: "Food Service, Mobile & Web, 2025-2026"
    },
    tags: [
      { label: "Food & Beverage", showDot: true },
      { label: "Mobile & Web", showDot: true },
      { label: "2025-2026", showDot: true }
    ],
    logo: {
      kind: "abmac"
    }
  },
  {
    id: "treeing",
    name: "treeing",
    theme: {
      accent: "#27c840",
      accentRgb: "39 200 64"
    },
    meta: {
      en: "Travel Platform, Mobile & Web, 2025-2026",
      zh: "Travel Platform, Mobile & Web, 2025-2026"
    },
    tags: [
      { label: "Travel", showDot: true },
      { label: "Mobile & Web", showDot: true },
      { label: "2023-2025", showDot: true }
    ],
    logo: {
      kind: "image",
      src: imgTreeing,
      alt: "treeing",
      width: 176,
      height: 82,
      className: "project-logo__image--treeing"
    },
    description: {
      en: [
        "Treeing is an invitation-first travel platform.",
        "It allows users to find listings from the hosts they are most familiar with."
      ],
      zh: [
        "Treeing is an invitation-first travel platform.",
        "It allows users to find listings from the hosts they are most familiar with."
      ]
    },
    gallery: [
      {
        src: imgTreeingBanner1,
        alt: "Treeing banner",
        width: 300,
        height: 169
      },
      {
        src: imgTreeingWebHome1,
        alt: "Treeing home feed",
        width: 238,
        height: 169
      },
      {
        src: imgTreeingWebHome2,
        alt: "Treeing listing page",
        width: 238,
        height: 169,
        className: "project-gallery__image project-gallery__image--overflow"
      },
      {
        src: imgMockupContent1206PxX2622Px1,
        alt: "Treeing mobile mockup 1",
        width: 78,
        height: 169
      },
      {
        src: imgMockupContent1206PxX2622Px2,
        alt: "Treeing mobile mockup 2",
        width: 78,
        height: 169
      }
    ]
  },
  {
    id: "dewey-education",
    name: "DEWEY EDUCATION",
    theme: {
      accent: "#f2b744",
      accentRgb: "242 183 68"
    },
    meta: {
      en: "Landing Page, Web, 2025",
      zh: "Landing Page, Web, 2025"
    },
    tags: [
      { label: "Education", showDot: true },
      { label: "Web", showDot: false },
      { label: "2025", showDot: false }
    ],
    logo: {
      kind: "image",
      src: imgDeweyEducation1,
      alt: "DEWEY EDUCATION",
      width: 237,
      height: 65,
      className: "project-logo__image--dewey"
    }
  },
  {
    id: "abmac-landing-1",
    name: "abmac",
    theme: {
      accent: "#1f8dff",
      accentRgb: "31 141 255"
    },
    meta: {
      en: "Landing Page, Web, 2025",
      zh: "Landing Page, Web, 2025"
    },
    tags: [
      { label: "Landing Page", showDot: true },
      { label: "Web", showDot: true },
      { label: "2025", showDot: true }
    ],
    logo: {
      kind: "abmac"
    }
  },
  {
    id: "abmac-landing-2",
    name: "abmac",
    theme: {
      accent: "#1f8dff",
      accentRgb: "31 141 255"
    },
    meta: {
      en: "Landing Page, Web, 2025",
      zh: "Landing Page, Web, 2025"
    },
    tags: [
      { label: "Landing Page", showDot: true },
      { label: "Web", showDot: true },
      { label: "2025", showDot: true }
    ],
    logo: {
      kind: "abmac"
    }
  }
];
