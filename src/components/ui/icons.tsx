import {
    AlertTriangle,
    ArrowRight,
    Check,
    ChevronLeft,
    ChevronRight,
    CreditCard,
    File,
    FileText,
    HelpCircle,
    Image,
    Laptop,
    Loader2,
    LucideProps,
    Moon,
    MoreVertical,
    Pizza,
    Plus,
    Settings,
    SunMedium,
    Trash,
    Twitter,
    User,
    X,
    Calendar,
    Clock,
    MapPin,
    Users,
    Share2,
    Download,
    Mail,
    MessageCircle,
    Search,
    Filter,
    Bell,
    CheckCircle,
    Ticket,
    BarChart,
    RefreshCcw,
    Heart,
    type LucideIcon,
  } from "lucide-react"
  
  export type Icon = LucideIcon
  
  export const Icons = {
    logo: ({ ...props }: LucideProps) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <circle cx="12" cy="12" r="9" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
        <polyline points="11 12 12 12 12 16 13 16" />
      </svg>
    ),
    close: X,
    spinner: Loader2,
    chevronLeft: ChevronLeft,
    chevronRight: ChevronRight,
    trash: Trash,
    settings: Settings,
    user: User,
    arrowRight: ArrowRight,
    help: HelpCircle,
    pizza: Pizza,
    sun: SunMedium,
    moon: Moon,
    laptop: Laptop,
    calendar: Calendar,
    clock: Clock,
    mapPin: MapPin,
    users: Users,
    share: Share2,
    download: Download,
    mail: Mail,
    message: MessageCircle,
    search: Search,
    filter: Filter,
    bell: Bell,
    check: Check,
    checkCircle: CheckCircle,
    ticket: Ticket,
    chart: BarChart,
    refresh: RefreshCcw,
    heart: Heart,
    plus: Plus,
    image: Image,
    file: File,
    fileText: FileText,
    moreVertical: MoreVertical,
    creditCard: CreditCard,
    twitter: Twitter,
    warning: AlertTriangle,
    google: ({ ...props }: LucideProps) => (
      <svg role="img" viewBox="0 0 24 24" {...props}>
        <path
          fill="currentColor"
          d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
        />
      </svg>
    ),
    // Payment Provider Icons
    stripe: ({ ...props }: LucideProps) => (
      <svg role="img" viewBox="0 0 24 24" {...props}>
        <path
          fill="currentColor"
          d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305h.002z"
        />
      </svg>
    ),
    paypal: ({ ...props }: LucideProps) => (
      <svg role="img" viewBox="0 0 24 24" {...props}>
        <path
          fill="currentColor"
          d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.987 1.62 1.407 1.075 2.115 2.651 2.115 4.719 0 .975-.169 1.891-.51 2.741-.339.85-.83 1.591-1.465 2.221-.636.63-1.39 1.14-2.255 1.528-.866.389-1.821.656-2.86.805l-.102.023c.296.373.466.851.466 1.368 0 .298-.065.58-.189.841l-1.596 3.821c-.187.45-.623.741-1.104.741h-4.037c-.481 0-.917-.291-1.103-.74l-1.363-3.265a1.237 1.237 0 0 1-.155-.606c0-.517.171-.995.466-1.368l-.101-.024c-1.04-.148-1.994-.415-2.86-.804-.866-.388-1.62-.898-2.255-1.528-.636-.63-1.127-1.371-1.466-2.221-.34-.85-.51-1.766-.51-2.741 0-2.068.708-3.644 2.115-4.719C4.168.543 6.177 0 8.747 0h7.46c.524 0 .972.382 1.054.901l3.108 19.696a.641.641 0 0 1-.633.74h-4.61c-.455 0-.868-.274-1.042-.696l-.459-1.114a1.208 1.208 0 0 1-.189-.69c0-.517.171-.995.466-1.368l-.101-.024c-1.04-.148-1.994-.415-2.86-.804-.866-.388-1.62-.898-2.255-1.528-.636-.63-1.127-1.371-1.466-2.221-.34-.85-.51-1.766-.51-2.741 0-2.068.708-3.644 2.115-4.719C10.588.543 12.597 0 15.167 0h7.46c.524 0 .972.382 1.054.901l3.108 19.696a.641.641 0 0 1-.633.74h-4.61c-.455 0-.868-.274-1.042-.696l-.459-1.114a1.208 1.208 0 0 1-.189-.69c0-.517.171-.995.466-1.368l-.101-.024c-1.04-.148-1.994-.415-2.86-.804-.866-.388-1.62-.898-2.255-1.528-.636-.63-1.127-1.371-1.466-2.221-.34-.85-.51-1.766-.51-2.741 0-2.068.708-3.644 2.115-4.719C16.928.543 18.937 0 21.507 0H24l-3.893 24H7.076z"
        />
      </svg>
    ),
    // Social Icons
    facebook: ({ ...props }: LucideProps) => (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" {...props}>
        <path
          fill="currentColor"
          d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z"
        />
      </svg>
    ),
    instagram: ({ ...props }: LucideProps) => (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" {...props}>
        <path
          fill="currentColor"
          d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"
        />
      </svg>
    ),
    linkedin: ({ ...props }: LucideProps) => (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" {...props}>
        <path
          fill="currentColor"
          d="M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z"
        />
      </svg>
    )
}
  
export type IconKey = keyof typeof Icons
  
export type { LucideProps }