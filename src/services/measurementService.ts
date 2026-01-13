import api from "./api";

export interface Measurement {
  id: string;
  userId: string;
  weightKg: number;
  heightCm: number;
  waist: number;
  hips: number;
  chest: number;
  arm: number;
  leg: number;
  neck: number;
  glute: number;
  goal: number | string; // 0: VOLUMEN, 1: DEFINICION, 2: MANTENIMIENTO
  bodyFat?: number;
  bmr?: number;
  tdee?: number;
  targetCalories?: number;
  date: string;
}

export interface CreateMeasurementDto {
  weightKg: number;
  heightCm: number;
  waist: number;
  hips: number;
  chest: number;
  arm: number;
  leg: number;
  neck: number;
  glute: number;
  goal: string; // "VOLUMEN", "DEFINICION", "MANTENIMIENTO"
  age: number;
  gender: string;
  trainingDays: number;
}

export interface MonthlyStats {
  name: string;
  weight: number;
  bodyFat: number;
  hasData: boolean;
}

export const measurementService = {
  getMonthlyProgress: async () => {
    const response = await api.get<MonthlyStats[]>("/measurements/progress");
    return response.data;
  },

  getMyHistory: async () => {
    const response = await api.get<Measurement[]>("/measurements");
    return response.data;
  },

  getHistoryByUser: async (userId: string) => {
    const response = await api.get<Measurement[]>(
      `/measurements/user/${userId}`
    );
    return response.data;
  },

  create: async (data: CreateMeasurementDto) => {
    const response = await api.post<Measurement>("/measurements", data);
    return response.data;
  },
};
