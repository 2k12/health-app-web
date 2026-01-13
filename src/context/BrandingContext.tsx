import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { brandingService } from "@/services/brandingService";

interface BrandingContextType {
  orgName: string;
  logoUrl: string | null;
  restaurantUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  isLoading: boolean;
}

const BrandingContext = createContext<BrandingContextType>({
  orgName: "",
  logoUrl: null,
  restaurantUrl: null,
  primaryColor: "#10B981", // Default Emerald
  secondaryColor: "#3B82F6", // Default Blue
  isLoading: true,
});

export const BrandingProvider = ({ children }: { children: ReactNode }) => {
  const [orgName, setOrgName] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [restaurantUrl, setRestaurantUrl] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState("#10B981");
  const [secondaryColor, setSecondaryColor] = useState("#3B82F6");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initBranding = async () => {
      try {
        const config = await brandingService.fetchConfig();
        brandingService.applyTheme(config);

        setOrgName(config.name);
        setLogoUrl(config.logoUrl);
        setRestaurantUrl(config.restaurantUrl);
        if (config.primaryColor) setPrimaryColor(config.primaryColor);
        if (config.secondaryColor) setSecondaryColor(config.secondaryColor);
      } catch (error) {
        console.error("Failed to load branding", error);
      } finally {
        setIsLoading(false);
      }
    };

    initBranding();
  }, []);

  return (
    <BrandingContext.Provider
      value={{
        orgName,
        logoUrl,
        restaurantUrl,
        primaryColor,
        secondaryColor,
        isLoading,
      }}
    >
      {children}
    </BrandingContext.Provider>
  );
};

export const useBranding = () => useContext(BrandingContext);
