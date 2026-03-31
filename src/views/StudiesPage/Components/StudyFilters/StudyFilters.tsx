"use client";

import { Input } from "@/shared/ui/Input";
import { Select } from "@/shared/ui/Select";
import type { LVEFFilter } from "@/types";
import { useTranslation } from "react-i18next";
import { useStudyFilters } from "./useStudyFilters";

export const StudyFilters = () => {
  const { t } = useTranslation();
  const { searchInput, setSearchInput, filters, setLVEFFilter } =
    useStudyFilters();

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <Input
        type="search"
        placeholder={t("filters.searchPlaceholder")}
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        className="sm:max-w-xs"
        aria-label={t("filters.searchPlaceholder")}
      />
      <Select
        value={filters.lvef}
        onChange={(e) => setLVEFFilter(e.target.value as LVEFFilter)}
        aria-label={t("filters.lvefAll")}
      >
        <option value="all">{t("filters.lvefAll")}</option>
        <option value="normal">{t("filters.lvefNormal")}</option>
        <option value="mildly_reduced">{t("filters.lvefMild")}</option>
        <option value="severely_reduced">{t("filters.lvefSevere")}</option>
      </Select>
    </div>
  );
};
