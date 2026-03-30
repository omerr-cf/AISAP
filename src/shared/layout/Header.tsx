"use client";

import { useTranslation } from "react-i18next";

export const Header = () => {
  const { t } = useTranslation();
  const brand = t("header.brand");
  const pipe = brand.indexOf("|");

  return (
    <header className="sticky top-0 z-10 border-b border-surface-border bg-surface-card/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-4">
        <span className="text-xl font-bold tracking-tight text-content-primary">
          {pipe === -1 ? (
            brand
          ) : (
            <>
              {brand.slice(0, pipe)}
              <span className="text-brand">|</span>
              {brand.slice(pipe + 1)}
            </>
          )}
        </span>
        <span className="text-sm text-content-muted">
          {t("header.subtitle")}
        </span>
      </div>
    </header>
  );
};
