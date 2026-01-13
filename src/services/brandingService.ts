import api from "./api";

export interface OrganizationConfig {
  id: string;
  name: string;
  slug: string;
  primaryColor: string; // Hex
  secondaryColor: string;
  logoUrl: string | null;
  restaurantUrl: string | null;
}

// Convert Hex to HSL for Shadcn/Tailwind
const hexToHSL = (hex: string) => {
  let r = 0,
    g = 0,
    b = 0;
  if (hex.length === 4) {
    r = parseInt("0x" + hex[1] + hex[1]);
    g = parseInt("0x" + hex[2] + hex[2]);
    b = parseInt("0x" + hex[3] + hex[3]);
  } else if (hex.length === 7) {
    r = parseInt("0x" + hex[1] + hex[2]);
    g = parseInt("0x" + hex[3] + hex[4]);
    b = parseInt("0x" + hex[5] + hex[6]);
  }

  r /= 255;
  g /= 255;
  b /= 255;

  let cmin = Math.min(r, g, b),
    cmax = Math.max(r, g, b),
    delta = cmax - cmin,
    h = 0,
    s = 0,
    l = 0;

  if (delta === 0) h = 0;
  else if (cmax === r) h = ((g - b) / delta) % 6;
  else if (cmax === g) h = (b - r) / delta + 2;
  else h = (r - g) / delta + 4;

  h = Math.round(h * 60);
  if (h < 0) h += 360;

  l = (cmax + cmin) / 2;
  s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

  s = +(s * 100).toFixed(1);
  l = +(l * 100).toFixed(1);

  return `${h} ${s}% ${l}%`;
};

export const brandingService = {
  fetchConfig: async (): Promise<OrganizationConfig> => {
    // 1. Check URL path for /org/:slug
    const pathMatch = window.location.pathname.match(/^\/org\/([^/]+)/);
    let slug = pathMatch ? pathMatch[1] : null;

    // 2. Check query param (fallback/legacy)
    if (!slug) {
      const params = new URLSearchParams(window.location.search);
      slug = params.get("org");
    }

    // 3. Default to "vitality" if nothing found, unless it's explicitly "superadmin" or "landing"
    if (!slug) {
      // If we are at root or something else, defaults to vitality?
      // User said: "lo principal se va a llamar vitality"
      slug = "vitality";
    }

    console.log(`Fetching config for organization: ${slug}`);

    try {
      const response = await api.get<OrganizationConfig>(
        `/organization/config?slug=${slug}`
      );
      return response.data;
    } catch (error) {
      console.warn("Org config fetch failed, using default.");
      return {
        id: "default",
        name: "Vitality Health",
        slug: "vitality",
        primaryColor: "#10B981",
        secondaryColor: "#1F2937",
        logoUrl: null,
        restaurantUrl: null,
      };
    }
  },

  applyTheme: (config: OrganizationConfig) => {
    if (!config.primaryColor) return;

    const primaryHSL = hexToHSL(config.primaryColor);

    // Set CSS Variable
    document.documentElement.style.setProperty("--primary", primaryHSL);

    // Update Title
    document.title = config.name;

    // Store current org slug in localStorage for persistence if needed
    // localStorage.setItem("currentOrgSlug", config.slug);
  },
};
