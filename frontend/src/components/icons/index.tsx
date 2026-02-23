interface IconProps {
  size?: number
  className?: string
}

export function GridIcon({ size = 28, className }: IconProps) {
  return (
    <svg viewBox="0 0 28 28" fill="none" width={size} height={size} className={className} aria-hidden="true">
      <rect x="2" y="2" width="11" height="11" rx="3" fill="var(--color-primary)" />
      <rect x="15" y="2" width="11" height="11" rx="3" fill="var(--color-primary)" opacity="0.45" />
      <rect x="2" y="15" width="11" height="11" rx="3" fill="var(--color-primary)" opacity="0.45" />
      <rect x="15" y="15" width="11" height="11" rx="3" fill="var(--color-primary)" opacity="0.2" />
    </svg>
  )
}

export function PlusIcon({ size = 14, className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" width={size} height={size} className={className} aria-hidden="true">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 5v6M5 8h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function EditIcon({ size = 14, className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" width={size} height={size} className={className} aria-hidden="true">
      <path d="M11.5 2.5a1.414 1.414 0 0 1 2 2L5 13H3v-2L11.5 2.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function TrashIcon({ size = 14, className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" width={size} height={size} className={className} aria-hidden="true">
      <path d="M3 4h10M6 4V3h4v1M5 4v8a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function ChevronIcon({ size = 14, className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" width={size} height={size} className={className} aria-hidden="true">
      <path d="M5.5 3.5L10 8l-4.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function SearchIcon({ size = 16, className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" width={size} height={size} className={className} aria-hidden="true">
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10.5 10.5L13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function XIcon({ size = 16, className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" width={size} height={size} className={className} aria-hidden="true">
      <path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export function PersonIcon({ size = 11, className }: IconProps) {
  return (
    <svg viewBox="0 0 14 14" fill="none" width={size} height={size} className={className} aria-hidden="true">
      <circle cx="7" cy="4.5" r="2" stroke="currentColor" strokeWidth="1.3" />
      <path d="M2 11.5c0-2.5 2.2-4.5 5-4.5s5 2 5 4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

export function ToolsIcon({ size = 11, className }: IconProps) {
  return (
    <svg viewBox="0 0 14 14" fill="none" width={size} height={size} className={className} aria-hidden="true">
      <path d="M2 12l3.5-3.5M8 2l4 4-6 6-4-4 6-6z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function ManualIcon({ size = 14, className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" width={size} height={size} className={className} aria-hidden="true">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 5v3.5l2 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function ArrowUpIcon({ size = 14, className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" width={size} height={size} className={className} aria-hidden="true">
      <path d="M8 12V4M4 8l4-4 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function ArrowDownIcon({ size = 14, className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" width={size} height={size} className={className} aria-hidden="true">
      <path d="M8 4v8M4 8l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function MoveIcon({ size = 14, className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" width={size} height={size} className={className} aria-hidden="true">
      <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M5 5L2 8l3 3M11 5l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function SystemIcon({ size = 14, className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" width={size} height={size} className={className} aria-hidden="true">
      <rect x="1" y="2" width="14" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 11v2M10 11v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M4 13h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
