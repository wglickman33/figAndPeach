import "./IconClose.css";

type IconCloseProps = {
  className?: string;
};

export function IconClose({ className = "" }: IconCloseProps) {
  return (
    <svg
      className={`icon-close ${className}`.trim()}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
      />
    </svg>
  );
}
