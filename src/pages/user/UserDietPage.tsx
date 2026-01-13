import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { NutritionManager } from "@/components/nutrition/NutritionManager";
import { Utensils } from "lucide-react";
import { measurementService } from "@/services/measurementService";
import { organizationService } from "@/services/organizationService";
import { userService } from "@/services/userService";

import { useBranding } from "@/context/BrandingContext";

const UserDietPage = () => {
  const { user } = useAuth();
  const { primaryColor } = useBranding();
  const [currentWeight, setCurrentWeight] = useState<number | undefined>(
    undefined
  );
  const [profileWeight, setProfileWeight] = useState<number | undefined>(
    undefined
  );
  const [userGoal, setUserGoal] = useState<string>("Mejorar Salud");
  const [orgDetails, setOrgDetails] = useState<string | undefined>(undefined);
  const [orgName, setOrgName] = useState<string>("Fitba");

  useEffect(() => {
    const fetchData = async () => {
      if (user?.id) {
        try {
          // 1. Fetch Organization Config
          const config = await organizationService.getConfig("fitba");
          if (config.name) setOrgName(config.name);
          if (config.nutritionDetails) setOrgDetails(config.nutritionDetails);

          // 2. Fetch User Profile (for accurate Goal and Registered Weight)
          const fullUser = await userService.getProfile();
          if (fullUser.profile) {
            setUserGoal(fullUser.profile.fitnessGoal || "Mejorar Salud");
            setProfileWeight(fullUser.profile.weight);
          }

          // 3. (Optional) Fetch history if we still want recently measured weight contexts
          const history = await measurementService.getHistoryByUser(user.id);
          if (history.length > 0) setCurrentWeight(history[0].weightKg);
        } catch (error) {
          console.error("Error loading data for PDF context", error);
        }
      }
    };
    fetchData();
  }, [user?.id]);

  if (!user) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Debes iniciar sesión para ver tu plan nutricional.
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Utensils className="h-8 w-8 text-primary" /> Mi Plan Nutricional
          </h2>
          <p className="text-muted-foreground">
            Tu dieta personalizada basada en tus objetivos.
          </p>
        </div>
      </div>

      <div className="mt-6">
        {/* User can View Only (ReadOnly) but Can Export */}
        <NutritionManager
          userId={user.id}
          isReadOnly={true}
          canExport={true}
          userName={user.name}
          userGoal={userGoal}
          currentWeight={profileWeight ?? currentWeight} // Prioritize Profile Weight (Goal Registration Weight)
          organizationName={orgName}
          organizationDetails={orgDetails}
          primaryColor={primaryColor}
        />
      </div>
    </div>
  );
};

export default UserDietPage;
