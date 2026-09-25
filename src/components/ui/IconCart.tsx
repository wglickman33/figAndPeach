import "./IconCart.css";

type IconCartProps = {
  className?: string;
};

export function IconCart({ className = "" }: IconCartProps) {
  return (
    <svg
      className={`icon-cart ${className}`.trim()}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M6 6h15l-1.5 9h-12L6 6Z"
        stroke="currentColor"
        strokeWidth="1.85"
        strokeLinejoin="round"
      />
      <path
        d="M6 6 5 3H2"
        stroke="currentColor"
        strokeWidth="1.85"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9.5" cy="19" r="1.35" fill="currentColor" />
      <circle cx="16.5" cy="19" r="1.35" fill="currentColor" />
    </svg>
  );
}
