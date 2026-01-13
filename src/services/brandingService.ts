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

  const cmin = Math.min(r, g, b),
    cmax = Math.max(r, g, b),
    delta = cmax - cmin;
  let h = 0,
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
  hexToRgb: (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  },

  // Helper to generate a lighter/darker shade
  adjustColor: (hex: string, lum: number) => {
    // Validate hex string
    hex = String(hex).replace(/[^0-9a-f]/gi, "");
    if (hex.length < 6) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    lum = lum || 0;

    // Convert to decimal and change luminosity
    let rgb = "#",
      c,
      i;
    for (i = 0; i < 3; i++) {
      c = parseInt(hex.substr(i * 2, 2), 16);
      c = Math.round(Math.min(Math.max(0, c + c * lum), 255)).toString(16);
      rgb += ("00" + c).substr(c.length);
    }
    return rgb;
  },

  calculateContrast: (hex: string) => {
    const r = parseInt(hex.substr(1, 2), 16);
    const g = parseInt(hex.substr(3, 2), 16);
    const b = parseInt(hex.substr(5, 2), 16);
    return r * 0.299 + g * 0.587 + b * 0.114 > 186 ? "#000000" : "#ffffff";
  },

  // Calculate relative luminance for WCAG contrast
  getLuminance: (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return 0;

    // Convert to sRGB
    const r = parseInt(result[1], 16) / 255;
    const g = parseInt(result[2], 16) / 255;
    const b = parseInt(result[3], 16) / 255;

    // Helper for sRGB transform
    const transform = (v: number) =>
      v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);

    return (
      0.2126 * transform(r) + 0.7152 * transform(g) + 0.0722 * transform(b)
    );
  },

  // Calculate contrast ratio between two colors
  getContrastRatio: (color1: string, color2: string) => {
    const l1 = brandingService.getLuminance(color1);
    const l2 = brandingService.getLuminance(color2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  },

  // Check if color has sufficient contrast against white (e.g. for text)
  // WCAG AA for normal text is 4.5:1
  hasSufficientContrast: (hex: string, threshold = 4.5) => {
    return brandingService.getContrastRatio(hex, "#ffffff") >= threshold;
  },

  fetchConfig: async (): Promise<OrganizationConfig> => {
    let slug = "";

    // 1. Try to get from URL path (subdomain logic simulation)
    const pathParts = window.location.pathname.split("/");
    // Example: /org/my-gym/login
    const orgIndex = pathParts.indexOf("org");
    if (orgIndex !== -1 && pathParts[orgIndex + 1]) {
      slug = pathParts[orgIndex + 1];
    }

    // 2. Try to get from query params
    if (!slug) {
      const params = new URLSearchParams(window.location.search);
      const orgParam = params.get("org");
      if (orgParam) slug = orgParam;
    }

    // 3. Default to "vitality" if nothing found, unless it's explicitly "superadmin" or "landing"
    if (!slug || slug === "/") {
      slug = "vitality";
    }

    // Skip for known routes that aren't org-specific if needed
    if (slug === "superadmin" || slug === "landing") {
      // Should we return null? or default?
      // Let's return default for now to have branding
      slug = "vitality";
    }

    console.log(`Fetching config for organization: ${slug}`);

    try {
      const { data } = await api.get(`/organization/config?slug=${slug}`);
      return data;
    } catch {
      console.warn("Org config fetch failed, using default.");
      return {
        id: "default",
        name: "Vitality",
        slug: "vitality",
        primaryColor: "#10B981",
        secondaryColor: "#1F2937",
        logoUrl: "/vitality-logo.svg",
        restaurantUrl: null, // Set a specific URL here if the user has one provided in previous context, otherwise null is safer until configured
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
