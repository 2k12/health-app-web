import api from "./api";

export interface WorkoutSet {
  reps: string;
  weight?: string;
}

export interface WorkoutExercise {
  exerciseId: string;
  name: string;
  sets: number;
  reps: string; // Range e.g. "10-12"
  notes?: string;
  muscleGroup: string;
}

export interface DailyWorkout {
  day: number; // 1-7
  exercises: WorkoutExercise[];
}

export interface WorkoutPlan {
  id: string;
  userId: string;
  trainerId?: string;
  exercises: any; // Stored as JSON, we expect DailyWorkout[] structure
  createdAt: string;
}

export const workoutService = {
  getMyWorkout: async () => {
    // Controller getWorkoutPlans returns an array
    const response = await api.get<WorkoutPlan[]>("/workout");
    return response.data; // usually returns array, we prefer the first one
  },
};
