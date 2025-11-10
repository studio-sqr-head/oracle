/** Deterministic sign selection based on seed string */
function deterministicSign(seed: string): string {
  const SIGNS = [
    "aries",
    "taurus",
    "gemini",
    "cancer",
    "leo",
    "virgo",
    "libra",
    "scorpio",
    "sagittarius",
    "capricorn",
    "aquarius",
    "pisces",
  ];
  const h = [...seed].reduce((a, c) => a + c.charCodeAt(0), 0);
  return SIGNS[h % 12];
}

/** Get Sun sign using deterministic method (placeholder for astronomia) */
function getSunSign(isoDate: string): string {
  // TODO: Replace with actual astronomia library calculation
  // For now, use deterministic placeholder
  return deterministicSign(isoDate + "sun");
}

export interface AstroNodes {
  sun_sign: string;
  moon_sign: string;
  rising_sign: string;
}

/** Calculate Astrology nodes from birth data */
export async function calculateAstro(opts: {
  date: string;
  time?: string;
  latitude?: number;
  longitude?: number;
}): Promise<AstroNodes> {
  const sun_sign = getSunSign(opts.date);
  const moon_sign = deterministicSign(opts.date + "moon"); // TODO: replace with ephemeris
  const rising_sign = deterministicSign(opts.date + "rising"); // TODO: replace with ascendant calc

  return { sun_sign, moon_sign, rising_sign };
}
