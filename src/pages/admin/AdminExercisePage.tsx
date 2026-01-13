import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Search,
  Loader2,
  Trash2,
  Pencil,
  Dumbbell,
  Activity,
} from "lucide-react";
import { exerciseService } from "@/services/exerciseService";
import type { Exercise, CreateExerciseDto } from "@/services/exerciseService";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Predefined Options
const BODY_PARTS = ["Tren Superior", "Tren Inferior"];

const MUSCLE_GROUPS = [
  "Pecho",
  "Espalda",
  "Hombros",
  "Bíceps",
  "Tríceps",
  "Cuádriceps",
  "Isquiotibiales",
  "Glúteos",
  "Pantorrillas",
  "Abdominales",
  "Cardio",
  "Otro",
];

const AdminExercisePage = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Create/Edit State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateExerciseDto>({
    name: "",
    muscleGroup: "",
    bodyPart: "",
  });
  const [isCustomMuscle, setIsCustomMuscle] = useState(false);

  // Delete State
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [exerciseToDelete, setExerciseToDelete] = useState<string | null>(null);

  const fetchExercises = async () => {
    try {
      setLoading(true);
      const data = await exerciseService.getAllExercises();
      setExercises(data);
    } catch (error) {
      console.error("Error fetching exercises:", error);
      toast.error("Error al cargar ejercicios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, []);

  const resetForm = () => {
    setFormData({
      name: "",
      muscleGroup: "",
      bodyPart: "",
    });
    setIsEditing(false);
    setIsCustomMuscle(false);
    setCurrentId(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (exercise: Exercise) => {
    // Check if the muscle is a custom one (not in the standard list)
    // We treat "Otro" in the list as the trigger for custom
    const isStandard = MUSCLE_GROUPS.some(
      (m) => m === exercise.muscleGroup && m !== "Otro"
    );

    setFormData({
      name: exercise.name,
      muscleGroup: exercise.muscleGroup,
      bodyPart: exercise.bodyPart,
    });
    setIsCustomMuscle(!isStandard);
    setCurrentId(exercise.id);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && currentId) {
        await exerciseService.updateExercise(currentId, formData);
        toast.success("Ejercicio actualizado");
      } else {
        await exerciseService.createExercise(formData);
        toast.success("Ejercicio creado");
      }
      setIsDialogOpen(false);
      fetchExercises();
    } catch (error) {
      console.error("Error saving exercise:", error);
      toast.error("Error al guardar ejercicio");
    }
  };

  const handleDelete = async () => {
    if (!exerciseToDelete) return;
    try {
      await exerciseService.deleteExercise(exerciseToDelete);
      toast.success("Ejercicio eliminado");
      fetchExercises();
    } catch (error) {
      console.error("Error deleting exercise:", error);
      toast.error("Error al eliminar ejercicio");
    } finally {
      setIsAlertOpen(false);
      setExerciseToDelete(null);
    }
  };

  // Filter exercises
  const filteredExercises = exercises.filter((ex) =>
    ex.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group by Body Part
  const exercisesByBodyPart = filteredExercises.reduce((acc, ex) => {
    const part = ex.bodyPart || "Otros";
    if (!acc[part]) {
      acc[part] = [];
    }
    acc[part].push(ex);
    return acc;
  }, {} as Record<string, Exercise[]>);

  const bodyParts = Object.keys(exercisesByBodyPart).sort();

  return (
    <div className="space-y-8 animate-in fade-in duration-500 container mx-auto p-2">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b pb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Dumbbell className="h-8 w-8 text-primary" />
            </div>
            Gestión de Ejercicios
          </h2>
          <p className="text-muted-foreground mt-2 max-w-xl">
            Administra tu biblioteca de ejercicios organizada por partes del
            cuerpo. Asegúrate de mantener la consistencia en los nombres.
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          size="lg"
          className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="mr-2 h-5 w-5" /> Nuevo Ejercicio
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 bg-card p-4 rounded-xl border shadow-sm">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar ejercicio por nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-secondary/30 focus:bg-background transition-colors"
          />
        </div>
        <div className="text-sm text-muted-foreground ml-auto">
          Total:{" "}
          <span className="font-bold text-foreground">
            {filteredExercises.length}
          </span>{" "}
          ejercicios
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center flex-col gap-4 text-muted-foreground">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p>Cargando biblioteca...</p>
        </div>
      ) : filteredExercises.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center text-center gap-4 bg-muted/20 rounded-xl border border-dashed">
          <div className="p-4 bg-muted rounded-full">
            <Dumbbell className="h-10 w-10 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-lg">
              No se encontraron ejercicios
            </h3>
            <p className="text-muted-foreground">
              Intenta con otra búsqueda o agrega un nuevo ejercicio.
            </p>
          </div>
        </div>
      ) : (
        <Tabs defaultValue={bodyParts[0] || "all"} className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto h-auto p-1 bg-transparent gap-2 mb-6">
            {bodyParts.map((part) => (
              <TabsTrigger
                key={part}
                value={part}
                className="group px-6 py-2.5 rounded-full border bg-card data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all whitespace-nowrap"
              >
                {part}
                <Badge
                  variant="secondary"
                  className="ml-2 bg-black/10 dark:bg-white/10 hover:bg-black/20 text-[10px] h-5 px-1.5 group-data-[state=active]:bg-primary-foreground/20 group-data-[state=active]:text-primary-foreground"
                >
                  {exercisesByBodyPart[part].length}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>

          {bodyParts.map((part) => (
            <TabsContent
              key={part}
              value={part}
              className="space-y-6 animate-in slide-in-from-bottom-2 duration-300"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {exercisesByBodyPart[part].map((exercise) => (
                  <Card
                    key={exercise.id}
                    className="group hover:border-primary/50 hover:shadow-md transition-all duration-200 overflow-hidden"
                  >
                    <CardHeader className="pb-3 bg-secondary/10">
                      <div className="flex justify-between items-start gap-2">
                        <Badge
                          variant="outline"
                          className="bg-background text-xs font-normal"
                        >
                          {exercise.muscleGroup}
                        </Badge>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleOpenEdit(exercise)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => {
                              setExerciseToDelete(exercise.id);
                              setIsAlertOpen(true);
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                      <CardTitle
                        className="text-lg leading-tight mt-2 min-h-[3rem] line-clamp-2"
                        title={exercise.name}
                      >
                        {exercise.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 pb-2">
                      <div className="flex items-center text-xs text-muted-foreground gap-2">
                        <Activity className="h-3.5 w-3.5" />
                        <span>Parte: {exercise.bodyPart}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-card border-border text-foreground max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Editar Ejercicio" : "Nuevo Ejercicio"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Modifica los detalles del ejercicio."
                : "Agrega un nuevo ejercicio a la biblioteca."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                className="bg-secondary/50 border-input font-medium"
                placeholder="Ej. Press de Banca"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="bodyPart">Parte del Cuerpo</Label>
                <Select
                  value={formData.bodyPart}
                  onValueChange={(value) =>
                    setFormData({ ...formData, bodyPart: value })
                  }
                >
                  <SelectTrigger className="bg-secondary/50 border-input">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {BODY_PARTS.map((part) => (
                      <SelectItem key={part} value={part}>
                        {part}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[10px] text-muted-foreground">
                  Categoría principal
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="muscleGroup">Músculo</Label>
                <Select
                  value={isCustomMuscle ? "Otro" : formData.muscleGroup}
                  onValueChange={(value) => {
                    if (value === "Otro") {
                      setIsCustomMuscle(true);
                      setFormData({ ...formData, muscleGroup: "" });
                    } else {
                      setIsCustomMuscle(false);
                      setFormData({ ...formData, muscleGroup: value });
                    }
                  }}
                >
                  <SelectTrigger className="bg-secondary/50 border-input">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {MUSCLE_GROUPS.map((muscle) => (
                      <SelectItem key={muscle} value={muscle}>
                        {muscle}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <p className="text-[10px] text-muted-foreground">
                  Músculo específico
                </p>
              </div>
            </div>

            {/* Custom Muscle Input - Full Width */}
            {isCustomMuscle && (
              <div className="grid gap-2 animate-in fade-in slide-in-from-top-2">
                <Label htmlFor="customMuscle">Nombre del Músculo</Label>
                <Input
                  id="customMuscle"
                  value={formData.muscleGroup}
                  onChange={(e) =>
                    setFormData({ ...formData, muscleGroup: e.target.value })
                  }
                  placeholder="Escribe el nombre del músculo..."
                  className="bg-secondary/50 border-input"
                  autoFocus
                />
              </div>
            )}
            <DialogFooter className="mt-4">
              <Button
                type="submit"
                className="bg-primary text-primary-foreground w-full"
              >
                {isEditing ? "Guardar Cambios" : "Crear Ejercicio"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Alert */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent className="bg-card border-border text-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmar eliminación?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El ejercicio será eliminado
              permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminExercisePage;
