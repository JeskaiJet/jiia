const imgDeweyEducation1 = "https://www.figma.com/api/mcp/asset/ce5fee3f-4743-43e9-8bda-f13bfaba2c38";
const imgTreeingBanner1 = "/images/treeing/banner.png";
const imgTreeingWebHome1 = "/images/treeing/main_page.png";
const imgTreeingWebHome2 = "/images/treeing/listing_page.png";
const imgTreeingSpotlight = "/images/treeing/spotlight.png";
const imgTreeingGuestList = "/images/treeing/guest_list.png";
const imgTreeingGuestListInvitation = "/images/treeing/guest_list_invitation.png";
const imgTreeingHostDashboard = "/images/treeing/host_dashboard.png";
const imgTreeingHostListing = "/images/treeing/host_listing.png";
const imgTreeingHostPage = "/images/treeing/host_page.png";
const imgTreeingBatchSet = "/images/treeing/batch_set.png";
const imgTreeingCalendarConnect = "/images/treeing/calendar_connect.png";
const imgVector = "https://www.figma.com/api/mcp/asset/974064d0-e9f8-4228-a1a0-bc6d2d1fef24";
const imgVector1 = "https://www.figma.com/api/mcp/asset/e9aeb798-0b18-47dd-a65a-636f1850ab12";
const imgVector2 = "https://www.figma.com/api/mcp/asset/03199955-468d-4522-9ba1-86542d919cf6";
const imgVector3 = "https://www.figma.com/api/mcp/asset/0c2e1ddb-69c5-407c-b602-059d1253842b";
const imgVector2Stroke = "https://www.figma.com/api/mcp/asset/975dc6b6-c759-4b8d-8a3b-e123c5af78ca";
const imgTreeing = "/images/treeing/logo.svg";

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
        "Treeing is a travel platform designed around returning guests.",
        "Hosts manage regular guests with Guest Lists, while users quickly find trusted hosts and book at better prices."
      ],
      zh: [
        "Treeing 是一个围绕熟客关系设计的旅行平台。",
        "Host 通过 Guest List 管理常客，用户也能快速找到熟悉的 Host，并以更好的价格完成预订。"
      ]
    },
    caseStudy: {
      blocks: {
        en: [
          {
            id: "about-treeing",
            column: "primary",
            markdown: `## About Treeing

Treeing was framed less as another listing marketplace and more as a system for making repeat-guest relationships visible, manageable, and bookable.

- Guests needed a faster way to find hosts they already trusted.
- Hosts needed tools to keep regular guests organized without moving that relationship off-platform.
- The core design direction became a relationship-first booking flow built around Guest Lists.`
          },
          {
            id: "spotlight",
            column: "secondary",
            media: {
              src: imgTreeingSpotlight,
              alt: "Treeing Spotlight View",
              width: 2880,
              height: 2086
            },
            markdown: `Spotlight was designed to reduce the pressure of search.

- Instead of asking users to define every filter upfront, the interface starts with a lightweight recommendation queue.
- Swipes act as preference signals, so exploration and feedback happen in the same interaction.
- The result is a browsing pattern that feels casual, but still improves the relevance of the next listings.`
          },
          {
            id: "guest-list",
            column: "primary",
            media: {
              src: imgTreeingGuestListInvitation,
              alt: "Treeing Guest List invitation",
              width: 2880,
              height: 2048
            },
            afterMedia: {
              src: imgTreeingGuestList,
              alt: "Treeing Guest List management",
              width: 2880,
              height: 2048
            },
            markdown: `Guest List became the product's relationship model.

- For Hosts, it turns repeat guests from scattered contacts into a managed audience.
- Invitations explain the value before asking Guests to join, reducing uncertainty at the entry point.
- For Guests, the My Host tab makes trusted inventory easy to revisit instead of rediscovering it through search.`
          },
          {
            id: "host-dashboard",
            column: "secondary",
            media: {
              src: imgTreeingHostDashboard,
              alt: "Treeing Host Dashboard",
              width: 2880,
              height: 2048
            },
            markdown: `The Dashboard was treated as the Host's working surface, not just a reporting page.

- High-priority business signals and schedules are visible immediately.
- The calendar can expand when planning requires more context.
- This keeps day-to-day checks lightweight while preserving a deeper operational view when needed.`
          },
          {
            id: "listing-editing",
            column: "primary",
            media: {
              src: imgTreeingHostListing,
              alt: "Treeing listing editing page",
              width: 2880,
              height: 10327,
              previewHeight: 2048
            },
            markdown: `Listing editing was redesigned around direct manipulation.

- Hosts edit inside a page that mirrors the Guest-facing listing, reducing the gap between setup and outcome.
- Changes happen near the content they affect, so the editing model is easier to understand.
- This avoids pushing Hosts through a dense back-office form when they need visual confidence.`
          },
          {
            id: "host-page",
            column: "secondary",
            media: {
              src: imgTreeingHostPage,
              alt: "Treeing Host Page",
              width: 2880,
              height: 5002,
              previewHeight: 2048
            },
            markdown: `Host Page reframes the Host as a destination.

- Guests can understand a Host's listings, activity, and reputation in one place.
- The page supports trust-building beyond a single property detail page.
- For Hosts, it also works as a shareable profile that can support off-platform promotion.`
          },
          {
            id: "batch-set",
            column: "primary",
            media: {
              src: imgTreeingBatchSet,
              alt: "Treeing Batch Set",
              width: 2048,
              height: 1536
            },
            markdown: `Batch Set focuses on reducing repetitive maintenance work.

- Hosts often apply the same pricing or availability logic across many listings and dates.
- The design turns those repeated changes into reusable rules instead of one-off edits.
- This gives Hosts more control while lowering the risk of missing a listing or date range.`
          },
          {
            id: "calendar-connect",
            column: "secondary",
            media: {
              src: imgTreeingCalendarConnect,
              alt: "Treeing Calendar Connect",
              width: 2048,
              height: 1536
            },
            markdown: `Calendar Connect addresses the operational cost of working across platforms.

- Syncing external listing data reduces duplicate maintenance.
- Supported platforms can also use Instant Confirm, so booking status moves with the same workflow.
- The design goal is to make Treeing easier to adopt without forcing Hosts to abandon their existing channels.`
          }
        ],
        zh: [
          {
            id: "about-treeing",
            column: "primary",
            markdown: `## About Treeing

Treeing 的设计目标不是再做一个房源市场，而是把 Host 与熟客之间的关系变成可发现、可管理、可复购的产品结构。

- 对 Guest 来说，核心问题是更快找到已经信任的 Host。
- 对 Host 来说，核心问题是把常客关系留在平台内持续维护。
- 因此产品方向集中在以 Guest List 为核心的关系型预订流程。`
          },
          {
            id: "spotlight",
            column: "secondary",
            media: {
              src: imgTreeingSpotlight,
              alt: "Treeing Spotlight View",
              width: 2880,
              height: 2086
            },
            markdown: `Spotlight 的设计重点是降低搜索压力。

- 不要求用户一开始就填写完整筛选条件，而是先进入一个轻量的推荐队列。
- 滑动行为同时承担浏览和反馈的作用，让偏好表达自然发生。
- 这样用户感到是在随意探索，系统也能持续优化后续推荐。`
          },
          {
            id: "guest-list",
            column: "primary",
            media: {
              src: imgTreeingGuestListInvitation,
              alt: "Treeing Guest List invitation",
              width: 2880,
              height: 2048
            },
            afterMedia: {
              src: imgTreeingGuestList,
              alt: "Treeing Guest List management",
              width: 2880,
              height: 2048
            },
            markdown: `Guest List 是 Treeing 的核心关系模型。

- 对 Host 来说，它把分散的熟客联系人转化为可管理的客群。
- 邀请流程先解释加入 Guest List 的价值，再引导 Guest 接受邀请，降低进入门槛。
- 对 Guest 来说，My Host 让可信 Host 的房源可以被快速回访，而不是重新搜索。`
          },
          {
            id: "host-dashboard",
            column: "secondary",
            media: {
              src: imgTreeingHostDashboard,
              alt: "Treeing Host Dashboard",
              width: 2880,
              height: 2048
            },
            markdown: `Dashboard 被设计成 Host 的工作台，而不只是数据展示页。

- 重要经营数据和日程信息需要在进入页面时立即可见。
- 当 Host 需要做排期判断时，日历可以展开为更完整的视图。
- 这样既保留日常查看的轻量感，也支持更复杂的运营决策。`
          },
          {
            id: "listing-editing",
            column: "primary",
            media: {
              src: imgTreeingHostListing,
              alt: "Treeing listing editing page",
              width: 2880,
              height: 10327,
              previewHeight: 2048
            },
            markdown: `Listing Editing 的设计思路是让编辑更接近结果本身。

- Host 在接近 Guest 视角的房源页面中直接编辑，减少“设置页面”和“最终效果”之间的距离。
- 修改入口出现在对应内容附近，让操作关系更直观。
- 这避免了传统后台表单带来的理解成本，也让 Host 更容易确认修改效果。`
          },
          {
            id: "host-page",
            column: "secondary",
            media: {
              src: imgTreeingHostPage,
              alt: "Treeing Host Page",
              width: 2880,
              height: 5002,
              previewHeight: 2048
            },
            markdown: `Host Page 把 Host 本身设计成一个可被关注的目的地。

- Guest 可以在一个页面中理解 Host 的房源、活动和评价。
- 它把信任建立从单个房源详情页扩展到 Host 维度。
- 对 Host 来说，这个页面也可以作为可分享的商业名片使用。`
          },
          {
            id: "batch-set",
            column: "primary",
            media: {
              src: imgTreeingBatchSet,
              alt: "Treeing Batch Set",
              width: 2048,
              height: 1536
            },
            markdown: `Batch Set 解决的是 Host 在维护房源时的重复劳动。

- 价格、可订状态等规则经常需要跨多个房源和日期批量调整。
- 设计上将这些重复修改抽象成可复用规则，而不是一次次手动编辑。
- 这让 Host 保持控制感，同时降低漏改房源或日期的风险。`
          },
          {
            id: "calendar-connect",
            column: "secondary",
            media: {
              src: imgTreeingCalendarConnect,
              alt: "Treeing Calendar Connect",
              width: 2048,
              height: 1536
            },
            markdown: `Calendar Connect 解决的是多平台运营带来的维护成本。

- 同步外部平台房源数据可以减少重复录入。
- 在支持的平台上，Instant Confirm 还能让预订状态随流程自动同步。
- 设计目标是降低 Treeing 的接入成本，而不是要求 Host 放弃原有渠道。`
          }
        ]
      }
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
