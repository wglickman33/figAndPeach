import type { ReactNode } from "react";

type AdminPageIntroProps = {
  title: string;
  lede: string;
  children?: ReactNode;
};

export function AdminPageIntro({ title, lede, children }: AdminPageIntroProps) {
  return (
    <header className="admin-page-intro">
      <h2 className="admin-page-intro__title">{title}</h2>
      <p className="admin-page-intro__lede">{lede}</p>
      {children}
    </header>
  );
}
