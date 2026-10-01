export type IconName = 'home' | 'book' | 'calendar' | 'settings' | 'arrow' | 'plus' | 'check'
const paths: Record<IconName, string> = {
  home: 'M3 10 12 3l9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z',
  book: 'M4 4h6a3 3 0 0 1 2 1 3 3 0 0 1 2-1h6v16h-6a3 3 0 0 0-2 1 3 3 0 0 0-2-1H4ZM12 5v16',
  calendar: 'M4 5h16v16H4ZM8 3v4m8-4v4M4 10h16m-12 4h2m4 0h2m-8 3h2',
  settings: 'M4 6h16M4 12h16M4 18h16M8 3v6m8 0v6m-8 0v6',
  arrow: 'M5 12h14m-5-5 5 5-5 5',
  plus: 'M12 5v14M5 12h14',
  check: 'm5 12 4 4L19 6',
}
export function Icon({ name }: { name: IconName }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  )
}
