// The clinic's tooth icon, used in the sidebar and on the sign-in screen.


export function ToothMark({ size = 22 }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 5.6c-1.2-1.1-2.9-1.5-4.3-1-2 .7-3.2 2.8-2.9 5.3.3 2.4 1.3 3.6 1.8 5.4.5 1.9.6 4.3 1.6 4.8 1.3.6 1.7-2.3 2.2-3.8.3-.9.7-1.4 1.6-1.4s1.3.5 1.6 1.4c.5 1.5.9 4.4 2.2 3.8 1-.5 1.1-2.9 1.6-4.8.5-1.8 1.5-3 1.8-5.4.3-2.5-.9-4.6-2.9-5.3-1.4-.5-3.1-.1-4.3 1z" />
    </svg>
  );
}
