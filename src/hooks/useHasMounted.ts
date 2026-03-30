"use client";

import { useEffect, useState } from "react";

/** True after the first client effect — gates URL sync so it does not run during SSR. */
export const useHasMounted = (): boolean => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // Intentional: one-way flip after mount; standard pattern for client-only follow-up work.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mount gate only
    setMounted(true);
  }, []);
  return mounted;
};
