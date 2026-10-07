import clsx from 'clsx';
import {
  ArrowLeft,
  ArrowLeftRight,
  ArrowRight,
  Ban,
  Bell,
  Bold,
  Calendar,
  CalendarCheck,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  Clock,
  Copy,
  Download,
  Ellipsis,
  Eye,
  EyeOff,
  FileText,
  Funnel,
  Hand,
  HandHeart,
  House,
  Info,
  Italic,
  Link,
  List,
  ListOrdered,
  LogOut,
  Mail,
  MapIcon,
  MapPin,
  Menu,
  MessageCircle,
  MessageSquareMore,
  Paperclip,
  Pencil,
  Phone,
  Plus,
  Search,
  Send,
  Settings,
  Sparkles,
  Trash2,
  TriangleAlert,
  Underline,
  User,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react';

export type IconName = keyof typeof icons;
export type IconSize = 'sm' | 'md' | 'lg';

type IconProps = {
  name: IconName;
  /** sm = 16px (badges, captions), md = 20px (buttons, fields, alerts), lg = 24px (navigation, lists, default). */
  size?: IconSize;
  /** Accessible name, only when no nearby text conveys the meaning. The icon is hidden otherwise. */
  label?: string;
  className?: string;
};

export const iconSizes = {
  sm: 'size-icon-sm',
  md: 'size-icon-md',
  lg: 'size-icon-lg',
} satisfies Record<IconSize, string>;

export function Icon({ name, size = 'lg', label, className }: IconProps) {
  const Component = icons[name];

  return (
    <Component
      className={clsx('block shrink-0', iconSizes[size], className)}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  );
}

// Maps each concept to the icon library. This is the only file that knows about Lucide: changing the library,
// or the icon of a concept, happens here (foundations/iconography.mdx).
const icons = {
  // Features
  home: House,
  request: Hand,
  event: Calendar,
  information: MessageSquareMore,
  document: FileText,
  exchange: ArrowLeftRight,
  members: Users,
  interests: Sparkles,
  profile: User,
  notifications: Bell,
  settings: Settings,
  answer: HandHeart,
  participation: CalendarCheck,
  comment: MessageCircle,

  // Statuses
  info: Info,
  success: CircleCheck,
  warning: TriangleAlert,
  error: CircleAlert,
  canceled: Ban,

  // Actions
  add: Plus,
  close: X,
  search: Search,
  menu: Menu,
  more: Ellipsis,
  edit: Pencil,
  delete: Trash2,
  send: Send,
  filter: Funnel,
  show: Eye,
  hide: EyeOff,
  'sign-out': LogOut,
  copy: Copy,
  download: Download,

  // Text formatting
  bold: Bold,
  italic: Italic,
  underline: Underline,
  link: Link,
  'bullet-list': List,
  'ordered-list': ListOrdered,

  // Directions
  next: ArrowRight,
  back: ArrowLeft,
  'chevron-down': ChevronDown,
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,

  // Objects
  check: Check,
  location: MapPin,
  map: MapIcon,
  phone: Phone,
  email: Mail,
  time: Clock,
  attachment: Paperclip,
} satisfies Record<string, LucideIcon>;

export const iconNames = Object.keys(icons) as IconName[];
