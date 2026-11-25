// Íconos de trazo del diseño (SVG inline, heredan el color del texto).
const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
}

export const IconSearch = ({ size = 22 }) => (
  <svg {...base} width={size} height={size} strokeWidth="2.2">
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.5-3.5" />
  </svg>
)
export const IconPlus = ({ size = 22, w = 2.6 }) => (
  <svg {...base} width={size} height={size} strokeWidth={w}>
    <path d="M12 5v14M5 12h14" />
  </svg>
)
export const IconBack = ({ size = 22 }) => (
  <svg {...base} width={size} height={size} strokeWidth="2.4">
    <path d="M15 18l-6-6 6-6" />
  </svg>
)
export const IconClose = ({ size = 22 }) => (
  <svg {...base} width={size} height={size} strokeWidth="2.4">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
)
export const IconArrowUpRight = ({ size = 20 }) => (
  <svg {...base} width={size} height={size} strokeWidth="2.4">
    <path d="M7 17L17 7M9 7h8v8" />
  </svg>
)
export const IconArrowRight = ({ size = 22, w = 2.6 }) => (
  <svg {...base} width={size} height={size} strokeWidth={w}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
)
export const IconPencil = ({ size = 18, w = 2.2, extra = false }) => (
  <svg {...base} width={size} height={size} strokeWidth={w}>
    <path d="M4 20h4L19 9l-4-4L4 16z" />
    {extra && <path d="M13.5 6.5l4 4" />}
  </svg>
)
export const IconCutlery = ({ size = 18 }) => (
  <svg {...base} width={size} height={size} strokeWidth="2.2">
    <path d="M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M17 21V3c-2 1-3 4-3 8h3" />
  </svg>
)
export const IconCheck = ({ size = 14, w = 3 }) => (
  <svg {...base} width={size} height={size} strokeWidth={w}>
    <path d="M5 12.5l4 4 10-10" />
  </svg>
)
export const IconAlert = ({ size = 16 }) => (
  <svg {...base} width={size} height={size} strokeWidth="2.4">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v5M12 16h.01" />
  </svg>
)
export const IconTrash = ({ size = 19 }) => (
  <svg {...base} width={size} height={size} strokeWidth="2.2">
    <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
  </svg>
)
export const IconTimer = ({ size = 22 }) => (
  <svg {...base} width={size} height={size} strokeWidth="2.2">
    <circle cx="12" cy="13" r="8" />
    <path d="M12 9v4l2 2M10 2h4" />
  </svg>
)
export const IconPhoto = ({ size = 24 }) => (
  <svg {...base} width={size} height={size} strokeWidth="2">
    <rect x="3" y="5" width="18" height="14" rx="3" />
    <circle cx="9" cy="10" r="2" />
    <path d="M21 16l-5-5-8 8" />
  </svg>
)
export const IconHand = ({ size = 18 }) => (
  <svg {...base} width={size} height={size} strokeWidth="2">
    <path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V11M11 10.5V4a1.5 1.5 0 0 1 3 0v6.5M14 10.5V5.5a1.5 1.5 0 0 1 3 0V12M17 9.5a1.5 1.5 0 0 1 3 0V15a6 6 0 0 1-6 6h-1a6 6 0 0 1-5-2.7L5.2 14a1.5 1.5 0 0 1 2.5-1.7L8 13" />
  </svg>
)
export const IconPlay = ({ size = 20 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
    <path d="M8 5v14l11-7z" />
  </svg>
)
export const IconLogout = ({ size = 20 }) => (
  <svg {...base} width={size} height={size} strokeWidth="2.2">
    <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l-5-5 5-5M5 12h11" />
  </svg>
)

/** Reloj relleno de los chips "90 min". */
export const ClockBadge = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="10" fill="#121212" />
    <path d="M12 7v5l3 2" fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
)
