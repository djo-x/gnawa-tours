import { useMemo } from "react";

type RegionalPricing = {
  isAlgeria: boolean;
  originCountry: string;
};

export function useRegionalPricing(): RegionalPricing {
  return useMemo(() => {
    if (typeof navigator === "undefined") {
      return { isAlgeria: false, originCountry: "INTL" };
    }
    const languages =
      (Array.isArray(navigator.languages) && navigator.languages.length > 0
        ? navigator.languages
        : [navigator.language]) || [];
    const hasDzLang = languages.some((lang) => /-DZ$/i.test(lang));
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const isDz = hasDzLang || timeZone === "Africa/Algiers";
    return { isAlgeria: isDz, originCountry: isDz ? "DZ" : "INTL" };
  }, []);
}
