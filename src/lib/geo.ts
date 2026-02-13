const COUNTRY_HEADER_KEYS = [
  "x-vercel-ip-country",
  "cf-ipcountry",
  "x-country",
  "x-country-code",
  "x-geo-country",
  "x-geo-country-code",
  "x-appengine-country",
];

const THREE_TO_TWO_MAP: Record<string, string> = {
  DZA: "DZ",
};

type HeaderLike =
  | Headers
  | {
      get?: (name: string) => string | null;
    }
  | Record<string, unknown>;

function readHeader(headers: HeaderLike, key: string): string | null {
  if (headers && typeof (headers as Headers).get === "function") {
    return (headers as Headers).get(key);
  }
  const record = headers as Record<string, unknown>;
  const direct = record[key] ?? record[key.toLowerCase()];
  if (Array.isArray(direct)) {
    const first = direct[0];
    return typeof first === "string" ? first : null;
  }
  return typeof direct === "string" ? direct : null;
}

export function getGeoCountryFromHeaders(headers: HeaderLike): string | null {
  for (const key of COUNTRY_HEADER_KEYS) {
    const raw = readHeader(headers, key);
    if (!raw) continue;
    const value = raw.trim().toUpperCase();
    if (!value || value === "XX") continue;
    if (value.length === 3 && THREE_TO_TWO_MAP[value]) {
      return THREE_TO_TWO_MAP[value];
    }
    if (/^[A-Z]{2}$/.test(value)) {
      return value;
    }
  }
  return null;
}
