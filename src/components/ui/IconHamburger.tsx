import "./IconHamburger.css";

type IconHamburgerProps = {
  open: boolean;
  className?: string;
};

export function IconHamburger({ open, className = "" }: IconHamburgerProps) {
  return (
    <span className={`icon-hamburger${open ? " icon-hamburger--open" : ""} ${className}`.trim()} aria-hidden>
      <span className="icon-hamburger__bar" />
      <span className="icon-hamburger__bar" />
      <span className="icon-hamburger__bar" />
    </span>
  );
}
