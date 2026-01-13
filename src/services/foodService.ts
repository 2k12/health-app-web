import api from "./api";

export interface Food {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  category?: string;
  description?: string;
}

export interface CreateFoodDto {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  category?: string;
  description?: string;
}

export const foodService = {
  getAllFoods: async () => {
    const response = await api.get<Food[]>("/foods");
    return response.data;
  },

  createFood: async (data: CreateFoodDto) => {
    const response = await api.post<Food>("/foods", data);
    return response.data;
  },

  updateFood: async (id: string, data: Partial<CreateFoodDto>) => {
    const response = await api.put<Food>(`/foods/${id}`, data);
    return response.data;
  },

  deleteFood: async (id: string) => {
    const response = await api.delete(`/foods/${id}`);
    return response.data;
  },
};
