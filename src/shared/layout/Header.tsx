"use client";

import { useTranslation } from "react-i18next";

export const Header = () => {
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-10 border-b border-surface-border bg-surface-card/80 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-4 py-4 flex items-center gap-3">
        <span className="text-xl font-bold tracking-tight text-content-primary">
          a<span className="text-brand">|</span>sap
        </span>
        <span className="text-content-muted text-sm">
          {t("header.subtitle")}
        </span>
      </div>
    </header>
  );
};
