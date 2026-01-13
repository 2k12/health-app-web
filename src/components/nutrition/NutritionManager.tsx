import { useEffect, useState } from "react";
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
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Trash2, Plus, Apple, FileText } from "lucide-react";
import api from "@/services/api";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { DietPDFDocument } from "./DietPDFDocument";

// Interfaces
interface DietPlan {
  id: string;
  dailyCalories: number;
  meals: DietMeal[];
}
interface DietMeal {
  id: string;
  name: string;
  day: number;
  order: number;
  foods: DietFood[];
}
interface DietFood {
  id: string;
  foodId: string;
  portionGram: number;
  food: {
    id: string;
    name: string;
    calories: number; // per 100g
    protein: number;
    carbs: number;
    fat: number;
  };
}
interface FoodItem {
  id: string;
  name: string;
  category: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

// ... props interface
interface NutritionManagerProps {
  userId: string;
  isReadOnly?: boolean;
  canExport?: boolean;
  // Context for Export
  userName?: string;
  userGoal?: string; // Optional, can be derived or passed
  currentWeight?: number;
  organizationName?: string;
  organizationDetails?: string;
  primaryColor?: string;
}

export const NutritionManager = ({
  userId,
  isReadOnly = false,
  canExport = false,
  userName = "Usuario",
  userGoal = "Mejorar Salud", // Default Goal
  currentWeight,
  organizationName = "Fitba",
  organizationDetails = `
<ul class="list-none space-y-2 text-xs text-gray-600">
    <li><strong>• Ensalada:</strong> Cualquier tipo puede ser ensaladas que aportan volumen. (A TU GUSTO)</li>
    <li><strong>• Proteína Reemplazo:</strong> Puede ser carne molida 1% de grasa, filete de carne y filete de pescado (Salmon, tilapia, pargo o atún). Recomendado mismas porciones puedes turnar diariamente tanto como semanal.</li>
    <li><strong>• Huevos:</strong> Pueden ser cocidos, a la plancha o revueltos sin aceite (ACEITE PAM 0KCALS)</li>
    <li><strong>• Café y aguas:</strong> Dejar las azucares y edulcorantes (STEVIA PUEDES CONSUMIR)</li>
    <li><strong>• Dieta:</strong> Establecida hasta terminar la definición.</li>
    <li><strong>• Agua:</strong> 8 vasos de agua diario – 4 A 3 Litros</li>
    <li><strong>• VitC:</strong> Despues de tu desayuno (OPCIONAL)</li>
    <li><strong>• Multivitaminas:</strong> Después de tu desayuno. (OPCIONAL)</li>
    <li><strong>• Cardio en ayunas:</strong> Diariamente LUNES-DOMINGO O 30min-10.000pasos/ 15.000 Pasos- El deporte que hagas.</li>
    <li><strong>• Vinagre de manzana:</strong> 1 cucharada después de tu cardio, antes de tu primera comida, mezclar con gotas de limón y un poco de agua para puedas tomarte. (OPCIONAL)</li>
    <li><strong>• Canela en polvo:</strong> Acompaña en los pancakes.</li>
    <li><strong>• MEDIA TARDE:</strong> Unir con la ultima comida si no tienes tiempo de hacerla o consumir mas comida en la cena mas proteina y mas cabohidrato.(EN TU CASO REDUCIR LAS PORCIONES)</li>
    <li><strong>• CEREALES POST ENTRENAMIENTO CON PROTEINA:</strong> Esta opcion 3 juega un papel fundamental en recuperacion de nutrientes post entreno y en este caso, puedes consumir cuando vengas a entrenar 6:00am.</li>
    <li><strong>• SALSAS 0 FITBA:</strong> Utilízalas con moderación.</li>
    <li><strong>• DIAS SIN ENTRENAMIENTO DE PESAS:</strong> Baja el consumo de carbohidratos.</li>
    <li><strong>• REEMPLAZO DE GRASAS SALUDABLES:</strong> NUECES, ALMENDRAS, CREMAS DE FRUTOS SECOS</li>
    <li><strong>• MOVILIDAD LOS DIAS QUE NO ENTRENES:</strong> SUBES A 15,000 PASOS O NADAR</li>
    <li><strong>• LOS DIAS QUE ENTRENES NATACION + /FUERZA:</strong> MOVILIDAD 10.000 PASOS Y SUBES 100gr DE CARBS CENA/MEDIA TARDE O UTILIZA LAS OPCIONES CENA FIT</li>
    <li><strong>• LOS DIAS DE CARBS BAJOS:</strong> PRIORIZA EL CONSUMO DE FRUTOS ROJOS</li>
    <li><strong>• CARBOHIDRATOS:</strong> PUEDES PRIORIZAR PAPAS CAMOTE, ZANAHORIA BLANCA, TODOS LOS ALIMENTOS INTEGRALES.</li>
    <li><strong>• CHEAT FIT:</strong> SUBIR CHO EN LOS DIAS DE ENTRENAMIENTO (CARDIO Y FUERZA) y luego si el plan como tal</li>
</ul>
  `,
  primaryColor,
}: NutritionManagerProps) => {
  const [dietPlan, setDietPlan] = useState<DietPlan | null>(null);
  const [foodsList, setFoodsList] = useState<FoodItem[]>([]);
  const [selectedDietDay, setSelectedDietDay] = useState("1");
  const [newFoodId, setNewFoodId] = useState("");
  const [newFoodPortion, setNewFoodPortion] = useState("100");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const [foodsData, dietData] = await Promise.all([
          api
            .get<FoodItem[]>("/foods")
            .then((r) => r.data)
            .catch(() => []),
          api
            .get(`/diet?userId=${userId}`)
            .then((r) => r.data)
            .catch(() => null),
        ]);
        setFoodsList(foodsData);
        if (dietData) setDietPlan(dietData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [userId]);

  const handleAddFood = async (mealId: string) => {
    if (!newFoodId) {
      toast.error("Selecciona un alimento");
      return;
    }
    try {
      await api.post(`/diet/${mealId}/food`, {
        foodId: newFoodId,
        portionGram: parseInt(newFoodPortion),
      });
      toast.success("Alimento agregado");
      const updated = await api
        .get(`/diet?userId=${userId}`)
        .then((r) => r.data)
        .catch(() => null);
      if (updated) setDietPlan(updated);
      setNewFoodId("");
      setNewFoodPortion("100");
    } catch (error) {
      console.error(error);
      toast.error("Error al agregar alimento");
    }
  };

  const handleRemoveFood = async (dietFoodId: string) => {
    try {
      await api.delete(`/diet/food/${dietFoodId}`);
      toast.success("Alimento eliminado");
      const updated = await api
        .get(`/diet?userId=${userId}`)
        .then((r) => r.data)
        .catch(() => null);
      if (updated) setDietPlan(updated);
    } catch (error) {
      console.error(error);
      toast.error("Error al eliminar alimento");
    }
  };

  const generateDiet = async () => {
    try {
      setLoading(true);
      const res = await api.post("/diet", { userId });

      if (res.data.message) {
        toast.success(res.data.message);
      } else {
        toast.success("Dieta generada exitosamente");
      }

      // Use the plan returned directly from the backend to update UI
      if (res.data.plan) {
        setDietPlan(res.data.plan);
      } else {
        // Fallback: only refetch if plan wasn't returned
        const updated = await api
          .get(`/diet?userId=${userId}`)
          .then((r) => r.data)
          .catch(() => null);
        if (updated) setDietPlan(updated);
      }
    } catch (error: any) {
      console.error("Generate Diet Error:", error);
      toast.error(
        error.response?.data?.message ||
          "Error generando dieta (Revisa consola)"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading && !dietPlan && foodsList.length === 0)
    return <div>Cargando nutrición...</div>;

  // Calculate Progress and Macros
  const targetCalories = dietPlan?.dailyCalories || 2000;
  const selectedMeals =
    dietPlan?.meals.filter((m) => m.day === parseInt(selectedDietDay)) || [];

  let totalDailyCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;

  selectedMeals.forEach((meal) => {
    meal.foods.forEach((f) => {
      const ratio = f.portionGram / 100;
      totalDailyCalories += f.food.calories * ratio;
      totalProtein += f.food.protein * ratio;
      totalCarbs += f.food.carbs * ratio;
      totalFat += f.food.fat * ratio;
    });
  });

  const progress = Math.min((totalDailyCalories / targetCalories) * 100, 100);
  const isOver = totalDailyCalories > targetCalories;

  return (
    <div className="space-y-6">
      {/* Export Button - Always visible if allowed */}
      {canExport && dietPlan && (
        <div className="flex justify-end mb-4">
          <PDFDownloadLink
            document={
              <DietPDFDocument
                organizationName={organizationName}
                userName={userName}
                userGoal={userGoal}
                currentWeight={currentWeight}
                targetCalories={targetCalories}
                dietPlan={dietPlan}
                organizationDetails={organizationDetails}
                primaryColor={primaryColor}
              />
            }
            fileName={`plan_nutricional_${userName.replace(/\s+/g, "_")}.pdf`}
          >
            {({ loading }) => (
              <Button
                variant="outline"
                disabled={loading}
                className="gap-2 border-primary/20 hover:border-primary hover:bg-primary/5"
              >
                {loading ? (
                  "Generando..."
                ) : (
                  <>
                    <FileText className="h-4 w-4" /> Exportar Plan (PDF)
                  </>
                )}
              </Button>
            )}
          </PDFDownloadLink>
        </div>
      )}

      {!dietPlan ? (
        <div className="text-center py-12 border rounded-lg bg-card print:border-none">
          <p className="text-muted-foreground mb-4">
            No hay plan nutricional asignado.
          </p>
          {!isReadOnly && (
            <Button onClick={generateDiet}>Generar Dieta Automática</Button>
          )}
        </div>
      ) : (
        <div className="space-y-6 print:block">
          {/* Calorie Header */}
          <Card className="print:shadow-none print:border-none">
            <CardContent className="pt-6 print:pt-0 print:px-0">
              <div className="flex flex-col sm:flex-row justify-between mb-2 text-sm font-medium gap-1">
                <span>Calorías Diarias (Día {selectedDietDay})</span>
                <span className="text-muted-foreground sm:text-foreground">
                  {Math.round(totalDailyCalories)} / {targetCalories} kcal
                </span>
              </div>
              <Progress
                value={progress}
                className={`h-3 ${isOver ? "bg-red-200" : ""} print:hidden`}
                indicatorClassName={isOver ? "bg-red-500" : "bg-primary"}
              />
              {isOver && (
                <p className="text-xs text-red-500 mt-1 print:text-black">
                  Has excedido el objetivo calórico.
                </p>
              )}
              <div className="grid grid-cols-3 gap-2 mt-4 text-xs text-muted-foreground print:text-xs print:font-normal text-center bg-muted/20 p-2 rounded-lg">
                <div className="flex flex-col">
                  <span className="font-semibold text-foreground text-sm sm:text-base">
                    {Math.round(totalProtein)}g
                  </span>
                  <span className="text-[10px] sm:text-xs">Proteína</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-foreground text-sm sm:text-base">
                    {Math.round(totalCarbs)}g
                  </span>
                  <span className="text-[10px] sm:text-xs">Carbos</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-foreground text-sm sm:text-base">
                    {Math.round(totalFat)}g
                  </span>
                  <span className="text-[10px] sm:text-xs">Grasas</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs
            value={selectedDietDay}
            onValueChange={setSelectedDietDay}
            className="print:hidden"
          >
            <div className="max-w-[calc(100vw-3rem)] overflow-x-auto no-scrollbar pb-2">
              <TabsList className="w-full justify-start h-auto p-1 bg-transparent gap-2 mb-0 inline-flex">
                {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                  <TabsTrigger
                    key={d}
                    value={d.toString()}
                    className="px-4 py-2 sm:px-6 rounded-full border bg-card data-[state=active]:bg-primary data-[state=active]:text-primary-foreground min-w-[3rem] text-sm flex-shrink-0"
                  >
                    Día {d}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {[1, 2, 3, 4, 5, 6, 7].map((strDay) => (
              <TabsContent
                key={strDay}
                value={strDay.toString()}
                className="space-y-6"
              >
                {selectedMeals.length === 0 && (
                  <p className="text-muted-foreground p-4">
                    No hay comidas para este día.
                  </p>
                )}
                {selectedMeals.map((meal) => (
                  <Card key={meal.id} className="print:break-inside-avoid">
                    <CardHeader className="py-3 bg-muted/20">
                      <CardTitle className="text-base flex items-center justify-between">
                        {meal.name}
                        <span className="text-xs font-normal text-muted-foreground">
                          {meal.foods
                            .reduce(
                              (acc, f) =>
                                acc + (f.food.calories * f.portionGram) / 100,
                              0
                            )
                            .toFixed(0)}{" "}
                          kcal
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      {meal.foods.map((f) => (
                        <div
                          key={f.id}
                          className="flex justify-between items-center p-3 border-b last:border-0 hover:bg-muted/50 group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center text-primary">
                              <Apple className="h-4 w-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-sm truncate">
                                {f.food.name}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {f.portionGram}g -{" "}
                                {Math.round(
                                  (f.food.calories * f.portionGram) / 100
                                )}{" "}
                                kcal
                                <span className="ml-2 opacity-70">
                                  (P:{" "}
                                  {(
                                    (f.food.protein * f.portionGram) /
                                    100
                                  ).toFixed(1)}
                                  g)
                                </span>
                              </p>
                            </div>
                          </div>
                          {!isReadOnly && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="opacity-0 group-hover:opacity-100 text-destructive h-8 w-8"
                              onClick={() => handleRemoveFood(f.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}

                      {!isReadOnly && (
                        <div className="p-3 bg-muted/10 flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
                          <div className="flex-1">
                            <Label className="text-xs mb-1 block">
                              Agregar Alimento
                            </Label>
                            <Select onValueChange={setNewFoodId}>
                              <SelectTrigger className="h-9 text-xs w-full">
                                <SelectValue placeholder="Buscar alimento..." />
                              </SelectTrigger>
                              <SelectContent>
                                {foodsList.map((food) => (
                                  <SelectItem key={food.id} value={food.id}>
                                    {food.name} ({food.calories}kcal)
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="w-full sm:w-24">
                            <Label className="text-xs mb-1 block">Gramos</Label>
                            <Input
                              className="h-9 text-xs w-full"
                              type="number"
                              placeholder="100"
                              onChange={(e) =>
                                setNewFoodPortion(e.target.value)
                              }
                            />
                          </div>
                          <Button
                            size="sm"
                            className="h-9 w-full sm:w-auto"
                            variant="secondary"
                            onClick={() => handleAddFood(meal.id)}
                          >
                            <Plus className="h-4 w-4 mr-1 sm:mr-0" />{" "}
                            <span className="sm:hidden">Agregar</span>
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      )}
    </div>
  );
};
