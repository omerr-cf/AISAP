"use client";

import { useTranslation } from "react-i18next";

export const Header = () => {
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-10 border-b border-surface-border bg-surface-card/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-4">
        <span className="text-xl font-bold tracking-tight text-content-primary">
          {t("header.brand")}
        </span>
        <span className="text-sm text-content-muted">
          {t("header.subtitle")}
        </span>
      </div>
    </header>
  );
};
