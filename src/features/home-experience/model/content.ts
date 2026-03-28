export type MarketingLocale = "en" | "ru" | "es";
export type SiteExperience = "consumer" | "business";

export const APP_STORE_URL = "https://apps.apple.com/app/id6746678571";
export const BUSINESS_CONSOLE_URL = "https://console.maetry.com/auth";
export const SUPPORT_EMAIL = "support@maetry.com";
export const SUPPORT_EMAIL_HREF = `mailto:${SUPPORT_EMAIL}`;
export const TELEGRAM_URL = "https://t.me/maetry_app";
export const INSTAGRAM_URL = "https://instagram.com/maetry.co";

type SectionLink = {
  href: string;
  label: string;
};

type Hero = {
  eyebrow: string;
  title: string;
  description: string;
  primaryCta: string;
  secondaryCta: string;
  note: string;
  badges: string[];
};

type Highlight = {
  title: string;
  description: string;
};

type Step = {
  title: string;
  description: string;
};

type Quote = {
  quote: string;
  author: string;
  role: string;
};

type Faq = {
  question: string;
  answer: string;
};

type CoveragePoint = {
  label: string;
  description: string;
};

type PricingPlan = {
  name: string;
  price: string;
  description: string;
};

type ConsumerContent = {
  metaTitle: string;
  metaDescription: string;
  nav: SectionLink[];
  hero: Hero;
  highlights: Highlight[];
  coverageEyebrow: string;
  coverageTitle: string;
  coverageDescription: string;
  coveragePoints: CoveragePoint[];
  coveragePanelLabel: string;
  coveragePanelText: string;
  coveragePanelBullets: string[];
  bookingEyebrow: string;
  bookingTitle: string;
  bookingDescription: string;
  bookingSteps: Step[];
  businessBridgeEyebrow: string;
  businessBridgeTitle: string;
  businessBridgeDescription: string;
  businessBridgePoints: string[];
  footerTagline: string;
};

type BusinessContent = {
  metaTitle: string;
  metaDescription: string;
  nav: SectionLink[];
  hero: Hero;
  outcomes: Highlight[];
  platformEyebrow: string;
  platformTitle: string;
  platformDescription: string;
  platformModules: Highlight[];
  journeyEyebrow: string;
  journeyTitle: string;
  journeyDescription: string;
  journeySteps: Step[];
  pricingEyebrow: string;
  pricingTitle: string;
  pricingDescription: string;
  pricingPlans: PricingPlan[];
  quotes: Quote[];
  faqEyebrow: string;
  faqTitle: string;
  faqs: Faq[];
  footerTagline: string;
};

type CommonContent = {
  productName: string;
  consumerLabel: string;
  businessLabel: string;
  /** Заголовок колонки футера: салоны и частные мастера */
  footerBusinessSectionTitle: string;
  appStoreLabel: string;
  openConsoleLabel: string;
  contactLabel: string;
  partnershipLabel: string;
  privacyLabel: string;
  termsLabel: string;
  languageLabel: string;
  productSectionLabel: string;
  legalSectionLabel: string;
  /** Подпись ссылки на лендинг для бизнеса (maetry.com/…/business) */
  businessSubdomainLabel: string;
  consumerPathLabel: string;
  footerRights: string;
};

export type LocaleContent = {
  common: CommonContent;
  consumer: ConsumerContent;
  business: BusinessContent;
};

const content: Record<MarketingLocale, LocaleContent> = {
  en: {
    common: {
      productName: "Maetry",
      consumerLabel: "For clients",
      businessLabel: "For salon teams",
      footerBusinessSectionTitle: "For salons & independent pros",
      appStoreLabel: "Get the app",
      openConsoleLabel: "Open business console",
      contactLabel: "Contact Maetry",
      partnershipLabel: "Partner program",
      privacyLabel: "Privacy policy",
      termsLabel: "Terms of use",
      languageLabel: "Language",
      productSectionLabel: "Product",
      legalSectionLabel: "Documents",
      businessSubdomainLabel: "maetry.com/business",
      consumerPathLabel: "maetry.com",
      footerRights: "© 2026 Maetry LLC. All rights reserved.",
    },
    consumer: {
      metaTitle: "Maetry | Discover salons and book beauty appointments",
      metaDescription:
        "Discover salons, open salon profiles and book beauty appointments online with Maetry.",
      nav: [
        { href: "#discover", label: "Discover" },
        { href: "#coverage", label: "Coverage" },
        { href: "#download", label: "Get the app" },
      ],
      hero: {
        eyebrow: "Beauty marketplace",
        title: "Discover salons and book beauty appointments with less friction.",
        description:
          "Explore salon profiles, compare options and move into booking from the app or a direct salon link.",
        primaryCta: "Get the app",
        secondaryCta: "For salon teams",
        note: "Use the app to browse salons faster and save favorites. If a salon sends you a direct booking link, you can still complete booking on the web.",
        badges: [
          "Salon discovery",
          "Online booking",
          "Direct salon links",
        ],
      },
      highlights: [
        {
          title: "Browse real salon profiles",
          description:
            "See who the salon is, where it is located, and how to book before you ever need to message or call.",
        },
        {
          title: "Compare before you book",
          description:
            "Check the essentials first: location, contacts, booking access and the salon presence inside Maetry.",
        },
        {
          title: "Move from discovery to appointment",
          description:
            "When a salon supports online booking, clients can go from interest to confirmed time without extra back-and-forth.",
        },
      ],
      coverageEyebrow: "Coverage",
      coverageTitle: "See where Maetry is already available.",
      coverageDescription:
        "Clients should immediately understand whether their city or favorite salon is already on the platform.",
      coveragePoints: [
        {
          label: "Marketplace salons",
          description:
            "Discover salons that already publish their profiles through Maetry.",
        },
        {
          label: "Direct booking links",
          description:
            "Move from Instagram, Telegram or a message thread straight into booking.",
        },
        {
          label: "Coverage keeps expanding",
          description:
            "The consumer network grows salon by salon, with the app as the main place to keep exploring.",
        },
      ],
      coveragePanelLabel: "How clients use Maetry",
      coveragePanelText:
        "Start with discovery, then move into booking once a salon enables online appointments.",
      coveragePanelBullets: [
        "Open a salon profile to check services, location and contacts",
        "Switch from social or chat directly into booking when a salon shares a link",
      ],
      bookingEyebrow: "Booking",
      bookingTitle: "Booking should feel simple from the first tap.",
      bookingDescription:
        "The app is the main place to discover salons. The web supports salon-specific booking links when a business wants to send clients straight into an appointment flow.",
      bookingSteps: [
        {
          title: "1. Find a salon",
          description:
            "Use Maetry to discover salons and keep the ones you want to revisit.",
        },
        {
          title: "2. Review the profile",
          description:
            "Check contacts, location and whether the salon has online booking enabled.",
        },
        {
          title: "3. Book in the app or through a direct link",
          description:
            "If the salon shares a booking link, the web flow can complete the appointment quickly.",
        },
      ],
      businessBridgeEyebrow: "For salon teams",
      businessBridgeTitle: "Own or manage a salon?",
      businessBridgeDescription:
        "Maetry also includes a separate business product for bookings, schedules, reminders and daily salon operations.",
      businessBridgePoints: [
        "Dedicated business landing for salon decision-makers",
        "Clearer messaging for clients and salon teams",
        "Stronger split between marketplace demand and salon software",
      ],
      footerTagline:
        "Discover salons on maetry.com. Manage salon operations on business.maetry.com.",
    },
    business: {
      metaTitle: "Maetry for salons | Booking, schedules, and salon operations",
      metaDescription:
        "Salon management software for bookings, schedules, reminders and client operations. Built for owners, administrators and growing teams.",
      nav: [
        { href: "#platform", label: "Platform" },
        { href: "#journey", label: "How it works" },
        { href: "#pricing", label: "Pricing" },
        { href: "#faq", label: "FAQ" },
      ],
      hero: {
        eyebrow: "Salon management software",
        title: "Run bookings, schedules, and client operations from one system.",
        description:
          "Maetry helps salon owners and administrators manage online booking, staff coordination, reminders and client history in one place.",
        primaryCta: "Open business console",
        secondaryCta: "Contact Maetry",
        note: "Built for independent salons, growing teams and multi-location operators.",
        badges: [
          "Online booking",
          "Staff schedules",
          "Client reminders",
        ],
      },
      outcomes: [
        {
          title: "Reduce manual booking work",
          description:
            "Let clients book online and stop routing every appointment through calls, chats and ad hoc confirmations.",
        },
        {
          title: "Keep the team aligned",
          description:
            "Manage schedules, avoid overlaps and keep daily operations visible for the whole salon.",
        },
        {
          title: "Improve client retention",
          description:
            "Use reminders and cleaner client history to reduce no-shows and make follow-up easier.",
        },
      ],
      platformEyebrow: "Platform",
      platformTitle: "Everything the salon team needs to stay organized.",
      platformDescription:
        "Maetry combines booking, scheduling, client history and communication in one operating workflow instead of scattered chats, notebooks and spreadsheets.",
      platformModules: [
        {
          title: "Booking and schedules",
          description:
            "Control services, staff availability and salon calendars from one place.",
        },
        {
          title: "Client base",
          description:
            "Keep visit history, notes and follow-up opportunities attached to the salon, not spread across personal devices.",
        },
        {
          title: "Reminders and communication",
          description:
            "Automate reminders so the team spends less time confirming appointments manually.",
        },
        {
          title: "Operational visibility",
          description:
            "See what is booked, who is working and where the day needs attention.",
        },
      ],
      journeyEyebrow: "How it works",
      journeyTitle: "How salons get started with Maetry",
      journeyDescription:
        "A strong B2B page reduces uncertainty. Buyers should quickly understand setup, first value and daily use.",
      journeySteps: [
        {
          title: "Configure the salon",
          description:
            "Add services, team members and working hours so the system reflects real operations.",
        },
        {
          title: "Turn on online booking",
          description:
            "Share booking entry points through social media, messengers and salon profiles.",
        },
        {
          title: "Manage daily operations from one place",
          description:
            "Track appointments, team workload and client communication inside one workflow.",
        },
      ],
      pricingEyebrow: "Pricing",
      pricingTitle: "Pricing that stays clear as the team grows",
      pricingDescription:
        "Start with a simple base plan, then expand as you add specialists and locations.",
      pricingPlans: [
        {
          name: "Start",
          price: "From $29/mo",
          description:
            "For independent specialists and small salons getting structured online booking in place.",
        },
        {
          name: "Grow",
          price: "From $49/mo",
          description:
            "For salons with multiple specialists and more active day-to-day coordination.",
        },
        {
          name: "Scale",
          price: "From $89/mo",
          description:
            "For larger teams and salon networks that need tighter operational control.",
        },
      ],
      quotes: [
        {
          quote:
            "Maetry helps me see how many clients are booked, which services are in demand, and who is new versus returning.",
          author: "Julia",
          role: "Owner of the PROmanicure chain",
        },
        {
          quote:
            "Our main client flow comes through Maetry because online booking removes too much friction to ignore.",
          author: "Nikita",
          role: "Founder of Lui Philipp",
        },
      ],
      faqEyebrow: "FAQ",
      faqTitle: "Questions salon teams usually ask",
      faqs: [
        {
          question: "Is Maetry only for large salon chains?",
          answer:
            "No. It works for solo specialists, single-location salons and growing multi-location teams.",
        },
        {
          question: "Can clients book without calling the salon?",
          answer:
            "Yes. Online booking is one of the core product workflows and stays visible throughout the business landing.",
        },
        {
          question: "Does Maetry support staff schedules and workload visibility?",
          answer:
            "Yes. Teams can manage schedules, reduce overlaps and see who is booked throughout the day.",
        },
        {
          question: "Can it work for one salon and multiple locations?",
          answer:
            "Yes. The platform fits both a single salon and teams operating across multiple workspaces.",
        },
      ],
      footerTagline:
        "Salon software for bookings, schedules and client operations.",
    },
  },
  ru: {
    common: {
      productName: "Maetry",
      consumerLabel: "Для клиентов",
      businessLabel: "Для салонов",
      footerBusinessSectionTitle: "Для салонов и мастеров",
      appStoreLabel: "Скачать приложение",
      openConsoleLabel: "Открыть бизнес-консоль",
      contactLabel: "Связаться с Maetry",
      partnershipLabel: "Партнёрская программа",
      privacyLabel: "Политика конфиденциальности",
      termsLabel: "Условия использования",
      languageLabel: "Язык",
      productSectionLabel: "Продукт",
      legalSectionLabel: "Документы",
      businessSubdomainLabel: "maetry.com/business",
      consumerPathLabel: "maetry.com",
      footerRights: "© 2026 Maetry LLC. Все права защищены.",
    },
    consumer: {
      metaTitle: "Maetry | Найти салон и записаться онлайн",
      metaDescription:
        "Ищите салоны, открывайте карточки салонов и записывайтесь на бьюти-услуги онлайн через Maetry.",
      nav: [
        { href: "#discover", label: "Поиск" },
        { href: "#coverage", label: "Покрытие" },
        { href: "#download", label: "Приложение" },
      ],
      hero: {
        eyebrow: "Маркетплейс для beauty-записи",
        title: "Находите салоны и записывайтесь на бьюти-услуги без лишнего трения.",
        description:
          "Изучайте карточки салонов, сравнивайте варианты и переходите к записи из приложения или по прямой ссылке от салона.",
        primaryCta: "Скачать приложение",
        secondaryCta: "Для салонов",
        note: "Приложение удобно для поиска и сохранения салонов. Если салон прислал прямую ссылку на запись, вы можете завершить запись и в вебе.",
        badges: [
          "Поиск салонов",
          "Онлайн-запись",
          "Прямые ссылки от салонов",
        ],
      },
      highlights: [
        {
          title: "Изучайте реальные карточки салонов",
          description:
            "Смотрите, кто перед вами, где находится салон и как записаться, ещё до звонка или переписки.",
        },
        {
          title: "Сравнивайте до записи",
          description:
            "Сначала проверьте главное: адрес, контакты, доступность записи и присутствие салона в Maetry.",
        },
        {
          title: "Переходите от интереса к визиту",
          description:
            "Если салон включает онлайн-запись, клиент может быстро перейти от выбора к подтверждённому времени.",
        },
      ],
      coverageEyebrow: "Покрытие",
      coverageTitle: "Сразу видно, где Maetry уже работает.",
      coverageDescription:
        "Клиент должен быстро понять, доступен ли сервис в его городе или у салона, который он уже знает.",
      coveragePoints: [
        {
          label: "Салоны в маркетплейсе",
          description:
            "Открывайте салоны, которые уже публикуют свои профили через Maetry.",
        },
        {
          label: "Прямые booking-ссылки",
          description:
            "Переходите из Instagram, Telegram или переписки сразу в поток записи.",
        },
        {
          label: "Покрытие растёт",
          description:
            "Сеть расширяется салон за салоном, а приложение остаётся основной точкой входа для клиента.",
        },
      ],
      coveragePanelLabel: "Как клиенты используют Maetry",
      coveragePanelText:
        "Сначала поиск, затем запись, когда салон открывает онлайн-слоты для клиентов.",
      coveragePanelBullets: [
        "Откройте карточку салона, чтобы проверить услуги, адрес и контакты",
        "Переходите из соцсетей или чата сразу в запись, если салон делится ссылкой",
      ],
      bookingEyebrow: "Запись",
      bookingTitle: "Запись должна быть понятной с первого касания.",
      bookingDescription:
        "Приложение остаётся главным местом для поиска салонов, а веб поддерживает прямые booking-ссылки, когда салон ведёт клиента сразу в запись.",
      bookingSteps: [
        {
          title: "1. Найдите салон",
          description:
            "Используйте Maetry, чтобы находить салоны и сохранять те, к которым хотите вернуться.",
        },
        {
          title: "2. Посмотрите карточку салона",
          description:
            "Проверьте контакты, адрес и наличие онлайн-записи.",
        },
        {
          title: "3. Запишитесь в приложении или по ссылке",
          description:
            "Если салон прислал booking-link, веб-флоу поможет быстро завершить запись.",
        },
      ],
      businessBridgeEyebrow: "Для салонов",
      businessBridgeTitle: "Управляете салоном или командой?",
      businessBridgeDescription:
        "У Maetry есть отдельный бизнес-продукт для записей, графиков, напоминаний и ежедневной операционной работы салона.",
      businessBridgePoints: [
        "Отдельный бизнес-лендинг для тех, кто принимает решение",
        "Более понятный месседж для клиентов и салонных команд",
        "Чёткое разделение маркетплейса и салонного софта",
      ],
      footerTagline:
        "Ищите салоны на maetry.com. Управляйте работой салона на business.maetry.com.",
    },
    business: {
      metaTitle: "Maetry для салонов | Запись, графики и операционная работа",
      metaDescription:
        "Система управления салоном для онлайн-записи, графиков, напоминаний и работы с клиентами. Для владельцев, администраторов и растущих команд.",
      nav: [
        { href: "#platform", label: "Платформа" },
        { href: "#journey", label: "Как это работает" },
        { href: "#pricing", label: "Цены" },
        { href: "#faq", label: "FAQ" },
      ],
      hero: {
        eyebrow: "Система управления салоном",
        title: "Ведите запись, графики и работу с клиентами в одной системе.",
        description:
          "Maetry помогает владельцам салонов и администраторам управлять онлайн-записью, координацией команды, напоминаниями и клиентской историей в одном месте.",
        primaryCta: "Открыть бизнес-консоль",
        secondaryCta: "Связаться с Maetry",
        note: "Подходит независимым салонам, растущим командам и бизнесам с несколькими локациями.",
        badges: [
          "Онлайн-запись",
          "Графики команды",
          "Напоминания клиентам",
        ],
      },
      outcomes: [
        {
          title: "Снизить ручную работу с записями",
          description:
            "Дайте клиентам возможность записываться онлайн и уберите лишние звонки, чаты и ручные подтверждения.",
        },
        {
          title: "Синхронизировать команду",
          description:
            "Управляйте графиками, избегайте пересечений и держите ежедневную работу салона под контролем.",
        },
        {
          title: "Лучше удерживать клиентов",
          description:
            "Используйте напоминания и аккуратную историю клиента, чтобы снижать no-show и упрощать follow-up.",
        },
      ],
      platformEyebrow: "Платформа",
      platformTitle: "Всё, что нужно команде салона для порядка в работе.",
      platformDescription:
        "Maetry объединяет запись, расписание, историю клиентов и коммуникацию в одном рабочем процессе вместо разрозненных чатов, блокнотов и таблиц.",
      platformModules: [
        {
          title: "Запись и расписание",
          description:
            "Управляйте услугами, доступностью команды и календарём салона из одного места.",
        },
        {
          title: "Клиентская база",
          description:
            "Храните историю визитов, заметки и возможности для возврата клиента внутри салона, а не в личных телефонах.",
        },
        {
          title: "Напоминания и коммуникация",
          description:
            "Автоматизируйте напоминания, чтобы команда тратила меньше времени на ручные подтверждения.",
        },
        {
          title: "Операционная видимость",
          description:
            "Сразу видно, что записано, кто работает и где дню требуется внимание.",
        },
      ],
      journeyEyebrow: "Как это работает",
      journeyTitle: "Как салон начинает работать с Maetry",
      journeyDescription:
        "Сильная B2B-страница снимает неопределённость. Покупатель должен быстро понять запуск, первую ценность и ежедневный сценарий.",
      journeySteps: [
        {
          title: "Настройте салон",
          description:
            "Добавьте услуги, сотрудников и рабочие часы так, чтобы система отражала реальную операционку.",
        },
        {
          title: "Включите онлайн-запись",
          description:
            "Поделитесь точками входа в запись через соцсети, мессенджеры и карточку салона.",
        },
        {
          title: "Управляйте работой из одного места",
          description:
            "Контролируйте записи, загрузку команды и коммуникацию с клиентами внутри одного процесса.",
        },
      ],
      pricingEyebrow: "Цены",
      pricingTitle: "Понятные тарифы, которые растут вместе с командой",
      pricingDescription:
        "Начните с простой базовой точки, а затем расширяйтесь по мере роста числа специалистов и локаций.",
      pricingPlans: [
        {
          name: "Start",
          price: "От $29/мес",
          description:
            "Для независимых специалистов и небольших салонов, которым нужна системная онлайн-запись.",
        },
        {
          name: "Grow",
          price: "От $49/мес",
          description:
            "Для салонов с несколькими мастерами и более активной ежедневной координацией.",
        },
        {
          name: "Scale",
          price: "От $89/мес",
          description:
            "Для больших команд и сетей, которым нужен более жёсткий операционный контроль.",
        },
      ],
      quotes: [
        {
          quote:
            "Maetry помогает мне видеть, сколько клиентов записано, какие услуги востребованы и кто приходит впервые, а кто возвращается.",
          author: "Юлия",
          role: "Владелица сети PROmanicure",
        },
        {
          quote:
            "Основной поток клиентов приходит через Maetry, потому что онлайн-запись убирает слишком много трения, чтобы это игнорировать.",
          author: "Никита",
          role: "Основатель Lui Philipp",
        },
      ],
      faqEyebrow: "FAQ",
      faqTitle: "Вопросы, которые чаще всего задают салонные команды",
      faqs: [
        {
          question: "Maetry подходит только крупным сетям?",
          answer:
            "Нет. Платформа подходит и solo-специалистам, и одиночным салонам, и растущим сетям.",
        },
        {
          question: "Клиенты смогут записываться без звонка в салон?",
          answer:
            "Да. Онлайн-запись остаётся одним из ключевых сценариев продукта и видна на всей бизнес-странице.",
        },
        {
          question: "Есть ли графики сотрудников и видимость загрузки?",
          answer:
            "Да. Команда может управлять графиками, уменьшать пересечения и видеть загрузку в течение дня.",
        },
        {
          question: "Система подходит и для одного салона, и для нескольких локаций?",
          answer:
            "Да. Maetry можно использовать как в одном салоне, так и в нескольких рабочих пространствах.",
        },
      ],
      footerTagline:
        "Салонный софт для записей, графиков и ежедневной работы с клиентами.",
    },
  },
  es: {
    common: {
      productName: "Maetry",
      consumerLabel: "Para clientes",
      businessLabel: "Para salones",
      footerBusinessSectionTitle: "Para salones y profesionales independientes",
      appStoreLabel: "Descargar la app",
      openConsoleLabel: "Abrir consola de negocio",
      contactLabel: "Contactar a Maetry",
      partnershipLabel: "Programa de socios",
      privacyLabel: "Política de privacidad",
      termsLabel: "Términos de uso",
      languageLabel: "Idioma",
      productSectionLabel: "Producto",
      legalSectionLabel: "Documentos",
      businessSubdomainLabel: "maetry.com/business",
      consumerPathLabel: "maetry.com",
      footerRights: "© 2026 Maetry LLC. Todos los derechos reservados.",
    },
    consumer: {
      metaTitle: "Maetry | Descubre salones y reserva citas de belleza",
      metaDescription:
        "Descubre salones, abre perfiles y reserva citas de belleza online con Maetry.",
      nav: [
        { href: "#discover", label: "Descubrir" },
        { href: "#coverage", label: "Cobertura" },
        { href: "#download", label: "Descargar" },
      ],
      hero: {
        eyebrow: "Marketplace de belleza",
        title: "Encuentra salones y reserva citas de belleza con menos fricción.",
        description:
          "Explora perfiles de salones, compara opciones y pasa a la reserva desde la app o desde un enlace directo del salón.",
        primaryCta: "Descargar la app",
        secondaryCta: "Para salones",
        note: "Usa la app para descubrir salones y guardar favoritos. Si un salón te envía un enlace directo, también puedes completar la reserva en la web.",
        badges: [
          "Descubrimiento de salones",
          "Reserva online",
          "Enlaces directos del salón",
        ],
      },
      highlights: [
        {
          title: "Explora perfiles reales de salones",
          description:
            "Consulta quiénes son, dónde están y cómo reservar antes de escribir o llamar.",
        },
        {
          title: "Compara antes de reservar",
          description:
            "Revisa primero lo esencial: ubicación, contactos, acceso a la reserva y presencia del salón en Maetry.",
        },
        {
          title: "Pasa del interés a la cita",
          description:
            "Cuando un salón activa la reserva online, el cliente puede avanzar rápidamente hasta un horario confirmado.",
        },
      ],
      coverageEyebrow: "Cobertura",
      coverageTitle: "Mira de inmediato dónde Maetry ya está disponible.",
      coverageDescription:
        "El cliente debe entender enseguida si puede usar Maetry en su zona o con el salón que ya sigue.",
      coveragePoints: [
        {
          label: "Salones del marketplace",
          description:
            "Descubre salones que ya publican su perfil dentro de Maetry.",
        },
        {
          label: "Enlaces directos de reserva",
          description:
            "Pasa desde Instagram, Telegram o un chat directamente al flujo de reserva.",
        },
        {
          label: "La cobertura sigue creciendo",
          description:
            "La red crece salón por salón y la app sigue siendo la puerta principal para descubrir nuevos lugares.",
        },
      ],
      coveragePanelLabel: "Cómo usan Maetry los clientes",
      coveragePanelText:
        "Primero descubren el salón y después reservan cuando el negocio habilita citas online.",
      coveragePanelBullets: [
        "Abre el perfil del salón para revisar servicios, ubicación y contactos",
        "Pasa desde redes sociales o chat directamente a la reserva cuando el salón comparte un enlace",
      ],
      bookingEyebrow: "Reserva",
      bookingTitle: "La reserva debe sentirse simple desde el primer toque.",
      bookingDescription:
        "La app sigue siendo el lugar principal para descubrir salones, mientras la web resuelve enlaces directos cuando un negocio quiere llevar al cliente directo a la cita.",
      bookingSteps: [
        {
          title: "1. Encuentra un salón",
          description:
            "Usa Maetry para descubrir salones y guardar los que quieres volver a visitar.",
        },
        {
          title: "2. Revisa el perfil",
          description:
            "Comprueba contactos, ubicación y si el salón tiene reserva online activada.",
        },
        {
          title: "3. Reserva en la app o desde un enlace",
          description:
            "Si el salón comparte un enlace de reserva, el flujo web puede cerrar la cita de forma rápida.",
        },
      ],
      businessBridgeEyebrow: "Para salones",
      businessBridgeTitle: "¿Gestionas un salón o un equipo?",
      businessBridgeDescription:
        "Maetry también incluye un producto de negocio independiente para reservas, horarios, recordatorios y operación diaria del salón.",
      businessBridgePoints: [
        "Landing de negocio dedicado para quienes toman la decisión",
        "Mensaje más claro para clientes y equipos del salón",
        "Separación clara entre marketplace y software de gestión",
      ],
      footerTagline:
        "Descubre salones en maetry.com. Gestiona la operación del salón en business.maetry.com.",
    },
    business: {
      metaTitle: "Maetry para salones | Reservas, horarios y operación diaria",
      metaDescription:
        "Software de gestión para salones con reservas online, horarios, recordatorios y operación con clientes. Diseñado para dueños, administradores y equipos en crecimiento.",
      nav: [
        { href: "#platform", label: "Plataforma" },
        { href: "#journey", label: "Cómo funciona" },
        { href: "#pricing", label: "Precios" },
        { href: "#faq", label: "FAQ" },
      ],
      hero: {
        eyebrow: "Software de gestión para salones",
        title: "Gestiona reservas, horarios y operación con clientes desde un solo sistema.",
        description:
          "Maetry ayuda a dueños y administradores a coordinar la reserva online, los horarios del equipo, los recordatorios y el historial de clientes en un solo lugar.",
        primaryCta: "Abrir consola de negocio",
        secondaryCta: "Contactar a Maetry",
        note: "Pensado para salones independientes, equipos en crecimiento y negocios con varias ubicaciones.",
        badges: [
          "Reserva online",
          "Horarios del equipo",
          "Recordatorios a clientes",
        ],
      },
      outcomes: [
        {
          title: "Reducir trabajo manual en reservas",
          description:
            "Permite que los clientes reserven online y evita depender de llamadas, chats y confirmaciones improvisadas.",
        },
        {
          title: "Mantener al equipo coordinado",
          description:
            "Gestiona horarios, evita solapamientos y mantén visible la operación diaria del salón.",
        },
        {
          title: "Retener mejor a los clientes",
          description:
            "Usa recordatorios e historial ordenado para reducir ausencias y facilitar el seguimiento.",
        },
      ],
      platformEyebrow: "Plataforma",
      platformTitle: "Todo lo que el equipo del salón necesita para trabajar con orden.",
      platformDescription:
        "Maetry reúne reservas, agenda, historial de clientes y comunicación en un solo flujo operativo, en lugar de repartirlo entre chats, cuadernos y hojas de cálculo.",
      platformModules: [
        {
          title: "Reservas y agenda",
          description:
            "Controla servicios, disponibilidad del equipo y calendarios del salón desde un mismo lugar.",
        },
        {
          title: "Base de clientes",
          description:
            "Guarda el historial de visitas, notas y oportunidades de seguimiento dentro del negocio, no en dispositivos personales.",
        },
        {
          title: "Recordatorios y comunicación",
          description:
            "Automatiza recordatorios para que el equipo dedique menos tiempo a confirmar citas manualmente.",
        },
        {
          title: "Visibilidad operativa",
          description:
            "Ve qué está reservado, quién trabaja y dónde el día necesita atención.",
        },
      ],
      journeyEyebrow: "Cómo funciona",
      journeyTitle: "Cómo empieza un salón con Maetry",
      journeyDescription:
        "Una buena página B2B reduce la incertidumbre. El comprador debe entender rápido la configuración, el valor inicial y el uso diario.",
      journeySteps: [
        {
          title: "Configura el salón",
          description:
            "Añade servicios, personal y horarios para que el sistema refleje la operación real.",
        },
        {
          title: "Activa la reserva online",
          description:
            "Comparte los accesos de reserva en redes, mensajería y perfiles del salón.",
        },
        {
          title: "Gestiona la operación desde un solo lugar",
          description:
            "Controla citas, carga del equipo y comunicación con clientes dentro de un mismo flujo.",
        },
      ],
      pricingEyebrow: "Precios",
      pricingTitle: "Precios claros a medida que el equipo crece",
      pricingDescription:
        "Empieza con una base simple y amplía el plan a medida que sumas especialistas y ubicaciones.",
      pricingPlans: [
        {
          name: "Start",
          price: "Desde $29/mes",
          description:
            "Para especialistas independientes y salones pequeños que necesitan una reserva online bien estructurada.",
        },
        {
          name: "Grow",
          price: "Desde $49/mes",
          description:
            "Para salones con varios especialistas y una coordinación diaria más activa.",
        },
        {
          name: "Scale",
          price: "Desde $89/mes",
          description:
            "Para equipos grandes y redes de salones que requieren más control operativo.",
        },
      ],
      quotes: [
        {
          quote:
            "Maetry me ayuda a ver cuántos clientes están reservados, qué servicios tienen más demanda y quién viene por primera vez o vuelve.",
          author: "Julia",
          role: "Propietaria de la cadena PROmanicure",
        },
        {
          quote:
            "Nuestro principal flujo de clientes llega por Maetry porque la reserva online elimina demasiada fricción como para ignorarla.",
          author: "Nikita",
          role: "Fundador de Lui Philipp",
        },
      ],
      faqEyebrow: "FAQ",
      faqTitle: "Preguntas que suelen hacer los equipos del salón",
      faqs: [
        {
          question: "¿Maetry es solo para grandes cadenas?",
          answer:
            "No. La plataforma funciona para especialistas independientes, salones de una sola ubicación y equipos en crecimiento.",
        },
        {
          question: "¿Los clientes pueden reservar sin llamar al salón?",
          answer:
            "Sí. La reserva online es uno de los flujos centrales del producto y sigue visible en todo el landing de negocio.",
        },
        {
          question: "¿Incluye horarios del personal y visibilidad de carga?",
          answer:
            "Sí. El equipo puede gestionar horarios, reducir solapamientos y ver la carga diaria de trabajo.",
        },
        {
          question: "¿Sirve tanto para un salón como para varias ubicaciones?",
          answer:
            "Sí. Maetry se adapta a un solo salón y también a operaciones con varios espacios de trabajo.",
        },
      ],
      footerTagline:
        "Software para salones con reservas, horarios y operación diaria con clientes.",
    },
  },
};

export function normalizeMarketingLocale(locale: string): MarketingLocale {
  if (locale === "ru" || locale === "es") {
    return locale;
  }

  return "en";
}

export function resolveSiteExperience(host: string | null): SiteExperience {
  const normalizedHost = host?.toLowerCase() ?? "";

  if (normalizedHost.startsWith("business.maetry.com")) {
    return "business";
  }

  return "consumer";
}

/** Базовый URL клиентской главной с учётом окружения (локально / продакшен). */
export function getConsumerHomeHref(host: string | null, locale: string): string {
  const normalizedLocale = normalizeMarketingLocale(locale);
  const normalizedHost = host?.toLowerCase() ?? "";
  const isLocal =
    normalizedHost.includes("localhost") || normalizedHost.includes("127.0.0.1");
  const isPreview =
    normalizedHost.includes("vercel.app") || normalizedHost.includes("vercel.live");

  if (isLocal || isPreview || !normalizedHost.includes("maetry.com")) {
    return `/${normalizedLocale}`;
  }

  return `https://maetry.com/${normalizedLocale}`;
}

export function withDiscoverHash(href: string): string {
  const base = href.includes("#") ? href.slice(0, href.indexOf("#")) : href;
  return `${base}#discover`;
}

export function getMarketingContent(locale: string): LocaleContent {
  return content[normalizeMarketingLocale(locale)];
}

export function buildAppStoreUrl(campaign: string): string {
  const url = new URL(APP_STORE_URL);
  url.searchParams.set("utm_source", "website");
  url.searchParams.set("utm_medium", "landing");
  url.searchParams.set("utm_campaign", campaign);
  return url.toString();
}

export function getBusinessHref(host: string | null, locale: string): string {
  const normalizedLocale = normalizeMarketingLocale(locale);
  const normalizedHost = host?.toLowerCase() ?? "";
  const isLocal =
    normalizedHost.includes("localhost") || normalizedHost.includes("127.0.0.1");
  const isPreview =
    normalizedHost.includes("vercel.app") || normalizedHost.includes("vercel.live");

  if (isLocal || isPreview || !normalizedHost.includes("maetry.com")) {
    return `/${normalizedLocale}/business`;
  }

  // Уже на поддомене бизнеса — остаёмся на этом origin
  if (normalizedHost.includes("business.maetry.com")) {
    return `https://business.maetry.com/${normalizedLocale}`;
  }

  // Клиентский сайт: лендинг для бизнеса на основном домене
  return `https://maetry.com/${normalizedLocale}/business`;
}
