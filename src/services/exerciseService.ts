import api from "./api";

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  bodyPart: string;
  createdAt?: string;
}

export interface CreateExerciseDto {
  name: string;
  muscleGroup: string;
  bodyPart: string;
}

export const exerciseService = {
  getAllExercises: async () => {
    const response = await api.get<Exercise[]>("/exercises");
    return response.data;
  },

  createExercise: async (data: CreateExerciseDto) => {
    const response = await api.post<Exercise>("/exercises", data);
    return response.data;
  },

  updateExercise: async (id: string, data: CreateExerciseDto) => {
    const response = await api.put<Exercise>(`/exercises/${id}`, data);
    return response.data;
  },

  deleteExercise: async (id: string) => {
    await api.delete(`/exercises/${id}`);
  },
};
