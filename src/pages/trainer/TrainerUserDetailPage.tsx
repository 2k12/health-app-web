import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { trainerService, type AssignedUser } from "@/services/trainerService";
import { exerciseService, type Exercise } from "@/services/exerciseService";
import {
  type DailyWorkout,
  type WorkoutExercise,
} from "@/services/workoutService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  ArrowLeft,
  Save,
  Trash2,
  Plus,
  User as UserIcon,
  Dumbbell,
  Utensils,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import { NutritionManager } from "@/components/nutrition/NutritionManager";
import { useBranding } from "@/context/BrandingContext";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const TrainerUserDetailPage = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { primaryColor } = useBranding();
  const [user, setUser] = useState<AssignedUser | null>(null);
  const [exercisesList, setExercisesList] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  // Workout State
  const [numDays, setNumDays] = useState(3);
  const [days, setDays] = useState<DailyWorkout[]>([]);
  const [selectedDay, setSelectedDay] = useState("1");

  useEffect(() => {
    const init = async () => {
      if (!userId) return;
      try {
        setLoading(true);
        const assigned = await trainerService.getAssignedUsers();
        const found = assigned.find((u) => u.id === userId);

        if (!found) {
          toast.error("Usuario no encontrado o no asignado.");
          navigate("/trainer/users");
          return;
        }
        setUser(found);

        // Fetch Exercises
        const exsData = await exerciseService.getAllExercises();
        setExercisesList(exsData);

        // Check for Profile Training Days preference
        const profileDays = found.profile?.trainingDays
          ? Number(found.profile.trainingDays)
          : 0;

        // Fetch Existing Plan
        try {
          const plan = await trainerService.getUserPlan(userId);
          let finalDays: DailyWorkout[] = [];

          if (plan && plan.exercises) {
            let loadedDays = plan.exercises;
            // Normalize JSON string
            if (typeof loadedDays === "string") {
              try {
                loadedDays = JSON.parse(loadedDays);
              } catch (e) {
                loadedDays = [];
              }
            }

            if (Array.isArray(loadedDays)) {
              // Cast and normalize reps
              let casted = loadedDays as unknown as DailyWorkout[];
              casted = casted.map((d) => ({
                ...d,
                exercises: d.exercises.map((e) => ({
                  ...e,
                  reps: String(e.reps),
                })),
              }));
              finalDays = casted;
            } else if (typeof loadedDays === "object" && loadedDays !== null) {
              // Legacy Object Handling
              const keys = Object.keys(loadedDays)
                .map(Number)
                .sort((a, b) => a - b);
              const maxKey = keys.length > 0 ? keys[keys.length - 1] : 3;

              for (let i = 1; i <= maxKey; i++) {
                // @ts-expect-error - legacy handling
                const dayExercises = loadedDays[String(i)] || [];
                const mappedExercises = Array.isArray(dayExercises)
                  ? dayExercises.map((ex: any) => {
                      const match = exsData.find(
                        (e) =>
                          e.name.toLowerCase() === (ex.name || "").toLowerCase()
                      );
                      return {
                        exerciseId: match?.id || "",
                        name: ex.name || "Ejercicio Desconocido",
                        sets: Number(ex.sets) || 3,
                        reps: String(ex.reps || "10-12"),
                        notes: ex.notes || "",
                        muscleGroup: match?.muscleGroup || "",
                      } as WorkoutExercise;
                    })
                  : [];
                finalDays.push({ day: i, exercises: mappedExercises });
              }
            }
          }

          // Force extend if profile has more days
          const targetDays = Math.max(finalDays.length, profileDays, 3);

          if (finalDays.length < targetDays) {
            for (let i = finalDays.length + 1; i <= targetDays; i++) {
              finalDays.push({ day: i, exercises: [] });
            }
          }

          setDays(finalDays);
          setNumDays(targetDays);
        } catch {
          // No existing plan
          const target = Math.max(profileDays, 3);
          initializeDays(target);
          setNumDays(target);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [userId, navigate]);

  const initializeDays = (count: number) => {
    const newDays: DailyWorkout[] = [];
    for (let i = 1; i <= count; i++) {
      newDays.push({ day: i, exercises: [] });
    }
    setDays(newDays);
  };

  const handleNumDaysChange = (val: string) => {
    const count = parseInt(val);
    setNumDays(count);
    // Adjust days array
    const current = [...days];
    if (count > current.length) {
      for (let i = current.length + 1; i <= count; i++) {
        current.push({ day: i, exercises: [] });
      }
    } else {
      current.length = count;
    }
    setDays(current);
  };

  const addExercise = (dayIdx: number) => {
    const current = [...days];
    current[dayIdx].exercises.push({
      exerciseId: "",
      name: "",
      sets: 3,
      reps: "10-12",
      notes: "",
      muscleGroup: "",
    });
    setDays(current);
  };

  const updateExercise = (
    dayIdx: number,
    exIdx: number,
    field: keyof WorkoutExercise,
    value: string | number
  ) => {
    const current = [...days];
    const exercise = current[dayIdx].exercises[exIdx];

    // Special handling for Exercise Selection to auto-fill details
    if (field === "exerciseId") {
      const selectedEx = exercisesList.find((e) => e.id === value);
      if (selectedEx) {
        exercise.exerciseId = value as string;
        exercise.name = selectedEx.name;
        exercise.muscleGroup = selectedEx.muscleGroup;
      }
    } else {
      // @ts-expect-error - Dynamic field access safe due to typeguard logic
      exercise[field] = value;
    }

    setDays(current);
  };

  const removeExercise = (dayIdx: number, exIdx: number) => {
    const current = [...days];
    current[dayIdx].exercises.splice(exIdx, 1);
    setDays(current);
  };

  const handleSave = async () => {
    if (!userId) return;
    try {
      await trainerService.upsertWorkoutPlan(userId, days);
      toast.success("Rutina guardada exitosamente");
    } catch (error) {
      console.error(error);
      toast.error("Error al guardar rutina");
    }
  };

  if (!user || loading) return <div className="p-8">Cargando...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center gap-4 border-b pb-4">
        <Button variant="ghost" onClick={() => navigate("/trainer/users")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver
        </Button>
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <UserIcon className="h-6 w-6" /> {user.name}
          </h2>
          <p className="text-muted-foreground text-sm">Panel de Entrenador</p>
        </div>
      </div>

      <Tabs defaultValue="workout" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="workout" className="flex items-center gap-2">
            <Dumbbell className="h-4 w-4" /> Rutina Ejercicios
          </TabsTrigger>
          <TabsTrigger value="nutrition" className="flex items-center gap-2">
            <Utensils className="h-4 w-4" /> Plan Nutricional
          </TabsTrigger>
        </TabsList>

        <TabsContent value="workout" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Rutina Semanal</h3>
            <Button
              className="bg-primary text-primary-foreground"
              onClick={handleSave}
            >
              <Save className="mr-2 h-4 w-4" /> Guardar Rutina
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Configuración General</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-w-xs">
                <Label>Días de entrenamiento por semana</Label>
                <Select
                  value={numDays.toString()}
                  onValueChange={handleNumDaysChange}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                      <SelectItem key={n} value={n.toString()}>
                        {n} Días
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Tabs
            value={selectedDay}
            onValueChange={setSelectedDay}
            className="w-full"
          >
            <TabsList className="w-full justify-start overflow-x-auto h-auto p-1 bg-transparent gap-2 mb-4">
              {days.map((d) => (
                <TabsTrigger
                  key={d.day}
                  value={d.day.toString()}
                  className="px-6 py-2 rounded-full border bg-card data-[state=active]:bg-primary data-[state=active]:text-primary-foreground min-w-[100px]"
                >
                  Día {d.day}
                </TabsTrigger>
              ))}
            </TabsList>

            {days.map((day, dIdx) => (
              <TabsContent
                key={day.day}
                value={day.day.toString()}
                className="space-y-4"
              >
                {day.exercises.map((ex, exIdx) => (
                  <Card
                    key={exIdx}
                    className="border-l-4 border-l-primary/50 relative"
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                      onClick={() => removeExercise(dIdx, exIdx)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <CardContent className="p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                      <div className="md:col-span-4 flex flex-col gap-2">
                        <Label>
                          Ejercicio{" "}
                          {ex.muscleGroup ? `(${ex.muscleGroup})` : ""}
                        </Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "w-full justify-between",
                                !ex.exerciseId && "text-muted-foreground"
                              )}
                            >
                              {ex.exerciseId
                                ? exercisesList.find(
                                    (e) => e.id === ex.exerciseId
                                  )?.name
                                : "Seleccionar Ejercicio"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[300px] p-0">
                            <Command>
                              <CommandInput placeholder="Buscar ejercicio..." />
                              <CommandList>
                                <CommandEmpty>No encontrado.</CommandEmpty>
                                <CommandGroup className="max-h-[300px] overflow-auto">
                                  {exercisesList.map((exercise) => (
                                    <CommandItem
                                      key={exercise.id}
                                      value={exercise.name} // Search by name
                                      onSelect={() => {
                                        updateExercise(
                                          dIdx,
                                          exIdx,
                                          "exerciseId",
                                          exercise.id
                                        );
                                        // Also triggers the detail auto-fill logic in updateExercise
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          ex.exerciseId === exercise.id
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                      {exercise.name}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="md:col-span-2">
                        <Label>Series</Label>
                        <Input
                          type="number"
                          value={ex.sets}
                          onChange={(e) =>
                            updateExercise(
                              dIdx,
                              exIdx,
                              "sets",
                              parseInt(e.target.value)
                            )
                          }
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label>Repeticiones</Label>
                        <Input
                          value={ex.reps}
                          onChange={(e) =>
                            updateExercise(dIdx, exIdx, "reps", e.target.value)
                          }
                        />
                      </div>
                      <div className="md:col-span-4">
                        <Label>Notas / Observaciones</Label>
                        <Input
                          value={ex.notes}
                          placeholder="Ej. Peso ascendente..."
                          onChange={(e) =>
                            updateExercise(dIdx, exIdx, "notes", e.target.value)
                          }
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <Button
                  variant="outline"
                  className="w-full border-dashed py-8"
                  onClick={() => addExercise(dIdx)}
                >
                  <Plus className="mr-2 h-4 w-4" /> Agregar Ejercicio al Día{" "}
                  {day.day}
                </Button>
              </TabsContent>
            ))}
          </Tabs>
        </TabsContent>

        <TabsContent value="nutrition">
          {userId && (
            <NutritionManager
              userId={userId}
              isReadOnly={true}
              canExport={false}
              userName={user?.name || "Usuario"}
              userGoal={user?.profile?.fitnessGoal || "Mejorar Salud"}
              organizationName="Fitba"
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TrainerUserDetailPage;
