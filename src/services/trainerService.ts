import api from "./api";
import type { User } from "./userService";
import type { WorkoutPlan, DailyWorkout } from "./workoutService";

export interface AssignedUser extends User {
  profile: any;
  measurements: any[];
}

export const trainerService = {
  getAssignedUsers: async () => {
    const response = await api.get<AssignedUser[]>("/trainer/users");
    return response.data;
  },

  upsertWorkoutPlan: async (userId: string, exercises: DailyWorkout[]) => {
    const response = await api.post<WorkoutPlan>("/trainer/workout-plan", {
      userId,
      exercises,
    });
    return response.data;
  },

  getUserPlan: async (userId: string) => {
    const response = await api.get<WorkoutPlan>(
      `/trainer/workout-plan/${userId}`
    );
    return response.data;
  },
};
