import { useEffect, useState } from "react";
import {
  workoutService,
  type WorkoutPlan,
  type DailyWorkout,
} from "@/services/workoutService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dumbbell, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const UserWorkoutPage = () => {
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchWorkout = async () => {
    try {
      setLoading(true);
      const plans = await workoutService.getMyWorkout();
      // Controller returns array, take first or sort by latest
      if (plans && plans.length > 0) {
        setWorkoutPlan(plans[0]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkout();
  }, []);

  // Parse exercises from JSON if existing
  // Parse exercises from JSON if existing
  let dailyWorkouts: DailyWorkout[] = [];

  if (workoutPlan?.exercises) {
    let loaded = workoutPlan.exercises;
    if (typeof loaded === "string") {
      try {
        loaded = JSON.parse(loaded);
      } catch (e) {
        console.error("Failed to parse workout exercises", e);
        loaded = [];
      }
    }

    if (Array.isArray(loaded)) {
      dailyWorkouts = loaded as DailyWorkout[];
    } else if (typeof loaded === "object" && loaded !== null) {
      // Legacy Object Format handling (Day 1: [...], Day 2: [...])
      const keys = Object.keys(loaded)
        .map(Number)
        .sort((a, b) => a - b);
      dailyWorkouts = keys.map((day) => ({
        day,
        exercises: loaded[String(day)] || [],
      }));
    }
  }

  // Sort by Day 1..7
  dailyWorkouts.sort((a, b) => a.day - b.day);

  if (loading) {
    return (
      <div className="p-8 flex justify-center text-muted-foreground">
        Cargando rutina...
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Dumbbell className="h-8 w-8 text-primary" /> Mis Entrenamientos
          </h2>
          <p className="text-muted-foreground">
            Rutina asignada por tu entrenador.
          </p>
        </div>
      </div>

      {!workoutPlan ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
            <AlertCircle className="h-16 w-16 mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">
              No tienes una rutina asignada
            </h3>
            <p className="max-w-md mx-auto">
              Tu entrenador aún no ha creado un plan de entrenamiento para ti.
              Contáctalo para comenzar.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Tabs
          defaultValue={dailyWorkouts[0]?.day.toString()}
          className="w-full"
        >
          <TabsList className="w-full justify-start overflow-x-auto h-auto p-1 bg-transparent gap-2 mb-4">
            {dailyWorkouts.map((dw) => (
              <TabsTrigger
                key={dw.day}
                value={dw.day.toString()}
                className="px-6 py-2 rounded-full border bg-card data-[state=active]:bg-primary data-[state=active]:text-primary-foreground min-w-[100px]"
              >
                Día {dw.day}
              </TabsTrigger>
            ))}
          </TabsList>

          {dailyWorkouts.map((dw) => (
            <TabsContent
              key={dw.day}
              value={dw.day.toString()}
              className="space-y-4 animate-in slide-in-from-bottom-2"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dw.exercises.map((ex, idx) => (
                  <Card
                    key={idx}
                    className="group hover:border-primary/50 transition-all"
                  >
                    <CardHeader className="bg-secondary/10 pb-2">
                      <div className="flex justify-between items-start">
                        <Badge variant="outline" className="bg-background">
                          {ex.muscleGroup}
                        </Badge>
                        <Badge className="bg-primary/20 text-primary hover:bg-primary/30">
                          {ex.sets} Series
                        </Badge>
                      </div>
                      <CardTitle className="mt-2 text-lg">{ex.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Repeticiones:
                        </span>
                        <span className="font-bold">{ex.reps}</span>
                      </div>
                      {ex.notes && (
                        <div className="text-xs bg-muted p-2 rounded mt-2 text-muted-foreground italic">
                          "{ex.notes}"
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
};

export default UserWorkoutPage;
