const imgDeweyEducation1 = "https://www.figma.com/api/mcp/asset/ce5fee3f-4743-43e9-8bda-f13bfaba2c38";
const imgTreeingBanner1 = "/images/treeing/banner.png";
const imgTreeingWebHome1 = "/images/treeing/main_page.png";
const imgTreeingWebHome2 = "/images/treeing/listing_page.png";
const imgTreeingMobileMain = "/images/treeing/mobile_main.png";
const imgTreeingMobileListing = "/images/treeing/mobile_listing.png";
const imgTreeingMobileSearch = "/images/treeing/mobile_search.png";
const imgTreeingSpotlight = "/images/treeing/spotlight.png";
const imgTreeingGuestList = "/images/treeing/guest_list.png";
const imgTreeingGuestListInvitation = "/images/treeing/guest_list_invitation.png";
const imgTreeingHostDashboard = "/images/treeing/host_dashboard.png";
const imgTreeingHostListing = "/images/treeing/host_listing.png";
const imgTreeingHostPage = "/images/treeing/host_page.png";
const imgTreeingBatchSet = "/images/treeing/batch_set.png";
const imgTreeingCalendarConnect = "/images/treeing/calendar_connect.png";
const imgTabmacLogo = "/images/tabmac/logo.png";
const imgTabmacBanner = "/images/tabmac/banner.png";
const imgTabmacMain = "/images/tabmac/main.png";
const imgTabmacMap = "/images/tabmac/map.png";
const imgTabmacStore = "/images/tabmac/store.png";
const imgTabmacAccount = "/images/tabmac/account.png";
const imgTabmacBusiness = "/images/tabmac/business.png";
const imgTabmacCheckout = "/images/tabmac/checkout.png";
const imgTabmacVenue = "/images/tabmac/venue.png";
const imgTabmacRedeem = "/images/tabmac/redeem.png";
const imgTabmacTip = "/images/tabmac/tip.png";
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
    id: "tabmac",
    name: "Tabmac",
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
      kind: "image",
      src: imgTabmacLogo,
      alt: "Tabmac",
      width: 149,
      height: 48,
      className: "project-logo__image--tabmac"
    },
    description: {
      en: [
        "Tabmac is a subscription-based dining platform that connects users with curated restaurant experiences, while offering integrated solutions for business procurement, venue booking, and checkout."
      ],
      zh: [
        "Tabmac 是一个订阅制餐饮平台，连接用户与精选餐厅体验，同时为企业采购、场地预订和结账流程提供一体化解决方案。"
      ]
    },
    caseStudy: {
      blocks: {
        en: [
          {
            id: "about-tabmac",
            column: "primary",
            markdown: `## About Tabmac

Tabmac was framed as more than a consumer dining subscription. The design needed to connect restaurant discovery, prepaid dining, business purchasing, event booking, and lightweight checkout into one platform.

- Consumers needed a clear way to understand what a subscription unlocks and how to redeem it.
- Businesses needed controls for buying, distributing, and tracking dining benefits at scale.
- Restaurants needed add-on tools that fit existing service workflows instead of creating a separate operational layer.`
          },
          {
            id: "business",
            column: "secondary",
            media: {
              src: imgTabmacBusiness,
              alt: "Tabmac Business",
              width: 2048,
              height: 1536
            },
            markdown: `Tabmac Business turns dining subscriptions into an organizational purchasing workflow.

- Bulk purchase, recurring purchase, distribution rules, and teams were separated into clear management tasks.
- Admins can decide who receives items or subscriptions, then review usage without manually tracking each redemption.
- The design goal was to make a consumer product usable for procurement while keeping the value of the dining experience visible.`
          },
          {
            id: "checkout",
            column: "primary",
            media: {
              src: imgTabmacCheckout,
              alt: "Tabmac Checkout",
              width: 2048,
              height: 1536
            },
            markdown: `Tabmac Checkout was designed as a low-friction entry point for payment.

- App Clips let guests complete checkout even when they have not installed the full app.
- This lowers adoption friction for diners and gives restaurants a payment surface that still connects back to the Tabmac ecosystem.
- The flow focuses on speed, clarity, and confidence at the moment when users are least willing to create an account or learn a new product.`
          },
          {
            id: "venue",
            column: "secondary",
            media: {
              src: imgTabmacVenue,
              alt: "Tabmac Venue booking",
              width: 2880,
              height: 8667,
              previewHeight: 2048
            },
            markdown: `Tabmac Venue restructures private dining booking around instant clarity.

- Traditional event booking requires back-and-forth communication before users can understand price, capacity, terms, and availability.
- The interface borrows from hotel booking patterns: select a venue, review constraints, receive an instant quote, and move toward confirmation.
- Custom quote rules help restaurants keep control while reducing manual sales work.`
          },
          {
            id: "redeem",
            column: "primary",
            media: {
              src: imgTabmacRedeem,
              alt: "Tabmac Redeem",
              width: 2048,
              height: 1536
            },
            markdown: `Tabmac Redeem unifies one-off rewards and business-distributed dining benefits.

- Users can redeem marketing rewards, team purchases, or subscription items through the same lightweight path.
- App Clips support redemption without forcing users to install the full app first.
- This makes Tabmac accessible to casual, single-use guests while still giving power users a consistent account-based experience.`
          },
          {
            id: "tips",
            column: "secondary",
            media: {
              src: imgTabmacTip,
              alt: "Tabmac Tips",
              width: 804,
              height: 1748,
              presentation: "compact-phone"
            },
            markdown: `Tips were treated as part of the payment system, not an afterthought.

- Restaurants can configure suggested tip behavior around local expectations in the U.S. market.
- Business-purchased items can include prepaid tips, removing uncertainty for employees and reducing friction at the restaurant.
- The design keeps generosity, policy, and checkout timing aligned in one flow.`
          }
        ],
        zh: [
          {
            id: "about-tabmac",
            column: "primary",
            markdown: `## About Tabmac

Tabmac 的设计不只是一个面向消费者的餐饮订阅产品，而是需要把餐厅发现、预付餐饮、企业采购、场地预订和轻量结账整合到同一个平台中。

- 消费者需要清楚理解订阅能兑换什么，以及如何使用。
- 企业需要批量购买、分发和追踪餐饮权益的管理能力。
- 餐厅需要能嵌入现有服务流程的工具，而不是额外增加一套独立运营系统。`
          },
          {
            id: "business",
            column: "secondary",
            media: {
              src: imgTabmacBusiness,
              alt: "Tabmac Business",
              width: 2048,
              height: 1536
            },
            markdown: `Tabmac Business 把餐饮订阅转化为组织级采购流程。

- Bulk Purchase、Recurring Purchase、Distribution 和 Teams 被拆成清晰的管理任务。
- 管理员可以决定哪些成员获得 item 或 subscription，并查看使用情况，而不需要手动追踪每次兑换。
- 设计目标是在保留餐饮体验价值感的同时，让这个消费级产品也能被企业采购场景使用。`
          },
          {
            id: "checkout",
            column: "primary",
            media: {
              src: imgTabmacCheckout,
              alt: "Tabmac Checkout",
              width: 2048,
              height: 1536
            },
            markdown: `Tabmac Checkout 是一个低摩擦的支付入口。

- 通过 App Clips，用户即使没有安装完整 App，也可以完成结账。
- 这降低了用户 adoption 的成本，也让餐厅获得一个能接回 Tabmac 生态的支付触点。
- 流程重点放在速度、信息清晰和支付确认感，因为结账时用户最不愿意被迫注册或学习新产品。`
          },
          {
            id: "venue",
            column: "secondary",
            media: {
              src: imgTabmacVenue,
              alt: "Tabmac Venue booking",
              width: 2880,
              height: 8667,
              previewHeight: 2048
            },
            markdown: `Tabmac Venue 的设计重点是让包场预订尽早获得清晰信息。

- 传统活动预订需要反复沟通，用户才能确认价格、容量、条款和可用性。
- 交互上借用了酒店预订模式：选择场地、查看限制、获得即时报价，再进入确认流程。
- Instant Quote 通过自定义规则让餐厅保留控制权，同时减少人工销售沟通。`
          },
          {
            id: "redeem",
            column: "primary",
            media: {
              src: imgTabmacRedeem,
              alt: "Tabmac Redeem",
              width: 2048,
              height: 1536
            },
            markdown: `Tabmac Redeem 把营销奖励和企业分发的餐饮权益合并到同一个兑换路径中。

- 用户可以用同一套流程兑换活动奖励、团队购买的权益或订阅 item。
- App Clips 让未安装完整 App 的用户也能完成兑换和下单。
- 这样 Tabmac 既能触达一次性使用的轻量用户，也能为高频用户保持一致的账户体验。`
          },
          {
            id: "tips",
            column: "secondary",
            media: {
              src: imgTabmacTip,
              alt: "Tabmac Tips",
              width: 804,
              height: 1748,
              presentation: "compact-phone"
            },
            markdown: `Tips 被当作支付系统的一部分来设计，而不是结账后的附加选项。

- 餐厅可以根据美国本地消费习惯设置推荐小费。
- 企业批量购买的 item 可以预先支付小费，减少员工到店消费时的不确定性。
- 这个流程把支付时机、企业政策和餐厅服务预期放在一起处理。`
          }
        ]
      }
    },
    gallery: [
      {
        src: imgTabmacBanner,
        alt: "Tabmac banner",
        width: 300,
        height: 169
      },
      {
        src: imgTabmacMain,
        alt: "Tabmac main screen",
        width: 78,
        height: 169
      },
      {
        src: imgTabmacMap,
        alt: "Tabmac map screen",
        width: 78,
        height: 169
      },
      {
        src: imgTabmacStore,
        alt: "Tabmac store screen",
        width: 78,
        height: 169
      },
      {
        src: imgTabmacAccount,
        alt: "Tabmac account screen",
        width: 78,
        height: 169
      }
    ]
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
          },
          {
            id: "mobile-search",
            column: "primary",
            media: {
              src: imgTreeingMobileSearch,
              alt: "Treeing mobile search flow",
              width: 2048,
              height: 1536
            },
            markdown: `Mobile Search was designed as a focused, step-by-step flow instead of a compressed desktop search bar.

- Each decision is separated into its own page or modal, so users only deal with one question at a time.
- The flow reduces visual competition on small screens and makes destination, dates, and guests easier to confirm.
- This keeps mobile search fast without making the interaction feel crowded or error-prone.`
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
          },
          {
            id: "mobile-search",
            column: "primary",
            media: {
              src: imgTreeingMobileSearch,
              alt: "Treeing mobile search flow",
              width: 2048,
              height: 1536
            },
            markdown: `Mobile Search 的设计重点不是把桌面搜索栏压缩到移动端，而是把搜索拆成更专注的分步流程。

- 每个决策被拆到独立页面或模态层中，让用户一次只处理一个问题。
- 这样可以减少小屏幕上的视觉竞争，也让目的地、日期和人数更容易确认。
- 最终目标是在保持搜索速度的同时，避免移动端流程显得拥挤或容易出错。`
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
      },
      {
        src: imgTreeingMobileMain,
        alt: "Treeing mobile home",
        width: 78,
        height: 169
      },
      {
        src: imgTreeingMobileListing,
        alt: "Treeing mobile listing",
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
