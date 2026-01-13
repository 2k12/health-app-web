import api from "./api";

export interface DietFood {
  id: string;
  food: {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  portionGram: number;
}

export interface DietMeal {
  id: string;
  name: string;
  order: number;
  foods: DietFood[];
}

export interface DietPlan {
  id: string;
  dailyCalories: number;
  proteinGrams: number;
  carbohydrateGrams: number;
  fatGrams: number;
  meals: DietMeal[];
  createdAt: string;
}

export const dietService = {
  getMyPlan: async (): Promise<DietPlan | null> => {
    const response = await api.get<DietPlan>("/diet");
    // If the backend returns null or empty body, handle it
    if (!response.data) return null;
    return response.data;
  },

  generatePlan: async (): Promise<DietPlan> => {
    const response = await api.post<DietPlan>("/diet", {});
    return response.data;
  },
};
