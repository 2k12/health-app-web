import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { measurementService } from "@/services/measurementService";
import type { Measurement } from "@/services/measurementService";
import { userService } from "@/services/userService";
import type { User } from "@/services/userService";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { ArrowLeft, Loader2, Calendar, Activity, Scale } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NutritionManager } from "@/components/nutrition/NutritionManager";
import { Utensils } from "lucide-react";

const UserHistoryPage = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Trainer Assignment State
  const [trainers, setTrainers] = useState<Partial<User>[]>([]);
  const [selectedTrainer, setSelectedTrainer] = useState<string>("no-trainer");

  // Detail View State
  const [selectedMeasurement, setSelectedMeasurement] =
    useState<Measurement | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const [userData, historyData, trainersList] = await Promise.all([
          userService.getUserById(userId),
          measurementService.getHistoryByUser(userId),
          userService.getTrainers(),
        ]);
        setUser(userData);
        setMeasurements(historyData);
        setTrainers(trainersList);

        // Set initial selected trainer
        if (userData.profile?.assignedTrainerId) {
          setSelectedTrainer(userData.profile.assignedTrainerId);
        } else {
          setSelectedTrainer("no-trainer");
        }
      } catch (error) {
        console.error("Error fetching history:", error);
        toast.error("Error al cargar historial");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  const handleAssignTrainer = async (trainerId: string) => {
    if (!user || user.role !== "USUARIO") return;

    // Optimistic update
    const previousTrainer = selectedTrainer;
    setSelectedTrainer(trainerId);

    try {
      await userService.assignTrainer(
        user.id,
        trainerId === "no-trainer" ? null : trainerId
      );
      toast.success("Entrenador actualizado correctamente");
    } catch (error) {
      console.error("Error assigning trainer:", error);
      toast.error("Error al asignar entrenador");
      setSelectedTrainer(previousTrainer); // Rollback
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 max-w-full overflow-x-hidden">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate("/admin/users")}
          className="hover:bg-secondary/50 self-start md:self-auto"
        >
          <ArrowLeft className="h-5 w-5 mr-2" /> Volver
        </Button>
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-primary">
            Historial de Seguimiento
          </h2>
          <p className="text-muted-foreground">
            {user ? `Progreso de ${user.name}` : "Detalles del usuario"}
          </p>
        </div>
      </div>

      <Tabs defaultValue="history" className="w-full">
        <TabsList className="mb-6 grid grid-cols-2 w-full h-auto">
          <TabsTrigger
            value="history"
            className="flex items-center justify-center gap-2 py-3"
          >
            <Activity className="h-4 w-4" />{" "}
            <span className="hidden sm:inline">Historial y Medidas</span>
            <span className="sm:hidden">Historial</span>
          </TabsTrigger>
          <TabsTrigger
            value="nutrition"
            className="flex items-center justify-center gap-2 py-3"
          >
            <Utensils className="h-4 w-4" />{" "}
            <span className="hidden sm:inline">Plan Nutricional</span>
            <span className="sm:hidden">Plan</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="space-y-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* User Info & Photo Placeholder */}
            <Card className="w-full md:w-1/3">
              <CardHeader>
                <CardTitle>Perfil del Usuario</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="w-full overflow-hidden rounded-md border border-border bg-muted">
                  <AspectRatio ratio={16 / 9}>
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      <Activity className="h-12 w-12 opacity-20" />
                      <span className="sr-only">User Cover Placeholder</span>
                    </div>
                  </AspectRatio>
                </div>
                <div>
                  <p className="text-xl font-bold">{user?.name}</p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                  <div className="mt-2 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                    {user?.role}
                  </div>
                </div>

                {/* Trainer Assignment Section */}
                {user?.role === "USUARIO" && (
                  <div className="pt-4 border-t border-border">
                    <label className="text-sm font-medium mb-2 block">
                      Entrenador Asignado:
                    </label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={selectedTrainer}
                      onChange={(e) => handleAssignTrainer(e.target.value)}
                    >
                      <option value="no-trainer">Sin entrenador</option>
                      {trainers.map((trainer) => (
                        <option key={trainer.id} value={trainer.id}>
                          {trainer.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="w-full md:w-2/3 grid grid-cols-1 md:grid-cols-3 gap-4">
              {measurements.length > 0 && (
                <>
                  <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-200/20 shadow-sm relative overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
                        Peso Actual
                      </CardTitle>
                      <div className="p-2 bg-blue-500/10 rounded-full">
                        <Scale className="h-4 w-4 text-blue-500" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                        {measurements[0].weightKg}{" "}
                        <span className="text-sm font-normal text-muted-foreground">
                          kg
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Último registro:{" "}
                        {format(new Date(measurements[0].date), "d MMM", {
                          locale: es,
                        })}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-200/20 shadow-sm relative overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">
                        Cintura
                      </CardTitle>
                      <div className="p-2 bg-purple-500/10 rounded-full">
                        <Activity className="h-4 w-4 text-purple-500" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                        {measurements[0].waist}{" "}
                        <span className="text-sm font-normal text-muted-foreground">
                          cm
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Medida de cintura
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-200/20 shadow-sm relative overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                        % Grasa
                      </CardTitle>
                      <div className="p-2 bg-emerald-500/10 rounded-full">
                        <Activity className="h-4 w-4 text-emerald-500" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">
                        {measurements[0].bodyFat || "-"}{" "}
                        <span className="text-sm font-normal text-muted-foreground">
                          %
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Estimado
                      </p>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </div>

          {/* Mobile Card View for Measurements */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {measurements.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground border rounded-lg bg-card text-sm">
                No hay registros de medidas.
              </div>
            ) : (
              measurements.map((m) => (
                <Card key={m.id} className="shadow-sm border-border">
                  <CardHeader className="py-3 px-4 bg-secondary/10 border-b border-border/50">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span className="font-semibold text-sm">
                          {format(new Date(m.date), "dd MMM yyyy", {
                            locale: es,
                          })}
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-background text-foreground"
                      >
                        {m.weightKg} kg
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      {m.bodyFat && (
                        <div className="bg-muted/30 p-1.5 rounded">
                          <span className="block text-muted-foreground text-[10px] uppercase">
                            Grasa
                          </span>
                          <span className="font-bold">{m.bodyFat}%</span>
                        </div>
                      )}
                      {m.waist && (
                        <div className="bg-muted/30 p-1.5 rounded">
                          <span className="block text-muted-foreground text-[10px] uppercase">
                            Cintura
                          </span>
                          <span className="font-bold">{m.waist}cm</span>
                        </div>
                      )}
                      {m.hips && (
                        <div className="bg-muted/30 p-1.5 rounded">
                          <span className="block text-muted-foreground text-[10px] uppercase">
                            Cadera
                          </span>
                          <span className="font-bold">{m.hips}cm</span>
                        </div>
                      )}
                      {m.chest && (
                        <div className="bg-muted/30 p-1.5 rounded">
                          <span className="block text-muted-foreground text-[10px] uppercase">
                            Pecho
                          </span>
                          <span className="font-bold">{m.chest}cm</span>
                        </div>
                      )}
                      {m.arm && (
                        <div className="bg-muted/30 p-1.5 rounded">
                          <span className="block text-muted-foreground text-[10px] uppercase">
                            Brazo
                          </span>
                          <span className="font-bold">{m.arm}cm</span>
                        </div>
                      )}
                      {m.leg && (
                        <div className="bg-muted/30 p-1.5 rounded">
                          <span className="block text-muted-foreground text-[10px] uppercase">
                            Pierna
                          </span>
                          <span className="font-bold">{m.leg}cm</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          <div className="hidden md:block rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="p-4 bg-secondary/20 border-b border-border">
              <h3 className="font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Registro de Controles
              </h3>
            </div>
            <Table>
              <TableHeader className="bg-secondary/50">
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead>Fecha</TableHead>
                  <TableHead>Peso (kg)</TableHead>
                  <TableHead>Cuello (cm)</TableHead>
                  <TableHead>Pecho (cm)</TableHead>
                  <TableHead>Brazo (cm)</TableHead>
                  <TableHead>Cintura (cm)</TableHead>
                  <TableHead>Cadera (cm)</TableHead>
                  <TableHead>Glúteo (cm)</TableHead>
                  <TableHead>Pierna (cm)</TableHead>
                  <TableHead>% Grasa</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {measurements.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={10}
                      className="h-32 text-center text-muted-foreground"
                    >
                      No hay registros de medidas para este usuario.
                    </TableCell>
                  </TableRow>
                ) : (
                  measurements.map((m) => (
                    <TableRow
                      key={m.id}
                      className="border-border hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => {
                        setSelectedMeasurement(m);
                        setIsDetailOpen(true);
                      }}
                    >
                      <TableCell className="font-medium">
                        {format(new Date(m.date), "dd MMM yyyy", {
                          locale: es,
                        })}
                      </TableCell>
                      <TableCell>{m.weightKg}</TableCell>
                      <TableCell>{m.neck || "-"}</TableCell>
                      <TableCell>{m.chest}</TableCell>
                      <TableCell>{m.arm}</TableCell>
                      <TableCell>{m.waist}</TableCell>
                      <TableCell>{m.hips}</TableCell>
                      <TableCell>{m.glute || "-"}</TableCell>
                      <TableCell>{m.leg}</TableCell>
                      <TableCell>{m.bodyFat || "-"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="nutrition">
          {userId && (
            <NutritionManager
              userId={userId}
              canExport={true}
              userName={user?.name || "Usuario"}
              userGoal={user?.profile?.fitnessGoal || "Mejorar Salud"}
              currentWeight={measurements[0]?.weightKg}
              organizationName="Fitba"
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Measurement Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[600px] bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Detalles del Control
            </DialogTitle>
            <DialogDescription>
              {selectedMeasurement &&
                format(new Date(selectedMeasurement.date), "PPP", {
                  locale: es,
                })}
            </DialogDescription>
          </DialogHeader>

          {selectedMeasurement && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 py-4">
              <div className="col-span-1 space-y-1">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Peso
                </span>
                <div className="text-2xl font-bold text-primary">
                  {selectedMeasurement.weightKg} kg
                </div>
              </div>

              <div className="col-span-1 space-y-1">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  % Grasa
                </span>
                <div className="text-2xl font-bold text-foreground">
                  {selectedMeasurement.bodyFat
                    ? `${selectedMeasurement.bodyFat}%`
                    : "-"}
                </div>
              </div>

              <div className="col-span-1 space-y-1">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Objetivo
                </span>
                <Badge variant="outline" className="font-mono">
                  {selectedMeasurement.goal === 0
                    ? "Definición"
                    : selectedMeasurement.goal === 1
                    ? "Volumen"
                    : "Mantenimiento"}
                </Badge>
              </div>

              <div className="col-span-full border-t border-border/50 my-1 font-semibold text-sm pt-2 text-primary">
                Medidas Corporales (cm)
              </div>

              <div className="space-y-1 p-2 bg-secondary/10 rounded-lg">
                <span className="text-[10px] items-center gap-1 uppercase text-muted-foreground flex">
                  Pecho
                </span>
                <div className="font-semibold text-lg">
                  {selectedMeasurement.chest}
                </div>
              </div>
              <div className="space-y-1 p-2 bg-secondary/10 rounded-lg">
                <span className="text-[10px] items-center gap-1 uppercase text-muted-foreground flex">
                  Cintura
                </span>
                <div className="font-semibold text-lg">
                  {selectedMeasurement.waist}
                </div>
              </div>
              <div className="space-y-1 p-2 bg-secondary/10 rounded-lg">
                <span className="text-[10px] items-center gap-1 uppercase text-muted-foreground flex">
                  Cadera
                </span>
                <div className="font-semibold text-lg">
                  {selectedMeasurement.hips}
                </div>
              </div>
              <div className="space-y-1 p-2 bg-secondary/10 rounded-lg">
                <span className="text-[10px] items-center gap-1 uppercase text-muted-foreground flex">
                  Brazo
                </span>
                <div className="font-semibold text-lg">
                  {selectedMeasurement.arm}
                </div>
              </div>
              <div className="space-y-1 p-2 bg-secondary/10 rounded-lg">
                <span className="text-[10px] items-center gap-1 uppercase text-muted-foreground flex">
                  Pierna
                </span>
                <div className="font-semibold text-lg">
                  {selectedMeasurement.leg}
                </div>
              </div>
              <div className="space-y-1 p-2 bg-secondary/10 rounded-lg">
                <span className="text-[10px] items-center gap-1 uppercase text-muted-foreground flex">
                  Glúteo
                </span>
                <div className="font-semibold text-lg">
                  {selectedMeasurement.glute || "-"}
                </div>
              </div>
              <div className="space-y-1 p-2 bg-secondary/10 rounded-lg">
                <span className="text-[10px] items-center gap-1 uppercase text-muted-foreground flex">
                  Cuello
                </span>
                <div className="font-semibold text-lg">
                  {selectedMeasurement.neck || "-"}
                </div>
              </div>

              {(selectedMeasurement.bmr || selectedMeasurement.tdee) && (
                <div className="col-span-full border-t border-border/50 my-1 font-semibold text-sm pt-2 text-primary">
                  Metabolismo
                </div>
              )}

              {selectedMeasurement.bmr && (
                <div className="col-span-1 space-y-1">
                  <span className="text-xs font-medium text-muted-foreground uppercase">
                    BMR
                  </span>
                  <div className="font-mono text-sm">
                    {selectedMeasurement.bmr} kcal
                  </div>
                </div>
              )}
              {selectedMeasurement.tdee && (
                <div className="col-span-1 space-y-1">
                  <span className="text-xs font-medium text-muted-foreground uppercase">
                    TDEE
                  </span>
                  <div className="font-mono text-sm">
                    {selectedMeasurement.tdee} kcal
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserHistoryPage;
