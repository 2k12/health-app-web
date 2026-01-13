import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Apple,
  MoreHorizontal,
  Utensils,
  Flame,
  Droplet,
  Wheat,
  Dna,
} from "lucide-react";
import { foodService } from "@/services/foodService";
import type { Food, CreateFoodDto } from "@/services/foodService";
import { toast } from "sonner";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

// Helper component for Zoom Effect Carousel
const ZoomCarousel = ({
  foods,
  onEdit,
  onDelete,
}: {
  foods: Food[];
  onEdit: (f: Food, e?: any) => void;
  onDelete: (id: string) => void;
}) => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setCurrent(api.selectedScrollSnap());
    };

    onSelect(); // Set initial
    api.on("select", onSelect);

    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  return (
    <Carousel
      setApi={setApi}
      opts={{
        align: "center",
        loop: false,
      }}
      className="w-full"
    >
      <CarouselContent className="-ml-4 py-12 px-4">
        {foods.map((food, index) => {
          const isSelected = index === current;

          return (
            <CarouselItem
              key={food.id}
              onClick={() => api?.scrollTo(index)}
              className={cn(
                "pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4 transition-all duration-500 ease-out cursor-pointer",
                isSelected
                  ? "scale-105 z-20 opacity-100"
                  : "scale-95 opacity-60 hover:opacity-100 grayscale-[0.3] hover:grayscale-0"
              )}
            >
              <div
                className={cn(
                  "relative h-full overflow-hidden rounded-3xl transition-all duration-500 border",
                  isSelected
                    ? "bg-background/90 border-primary/50 shadow-[0_10px_40px_-10px_hsl(var(--primary)/0.4)]"
                    : "bg-background/40 border-border/40 shadow-sm hover:border-primary/30 hover:shadow-xl hover:bg-background/70"
                )}
              >
                {/* Decorative Background Mesh */}
                <div
                  className={cn(
                    "absolute inset-0 opacity-10 transition-opacity duration-500",
                    isSelected
                      ? "bg-gradient-to-br from-primary via-primary/20 to-transparent opacity-15"
                      : "opacity-0"
                  )}
                />

                <div className="relative p-5 flex flex-col h-full gap-5">
                  {/* Header: Icon & Name */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          "flex items-center justify-center w-12 h-12 rounded-2xl shadow-sm transition-colors duration-300",
                          isSelected
                            ? "bg-primary text-primary-foreground shadow-primary/25"
                            : "bg-secondary text-secondary-foreground"
                        )}
                      >
                        <Utensils className="w-6 h-6" />
                      </div>
                      <div className="flex flex-col">
                        <h3
                          className={cn(
                            "font-bold text-lg leading-tight tracking-tight transition-colors line-clamp-1",
                            isSelected
                              ? "text-foreground"
                              : "text-muted-foreground"
                          )}
                        >
                          {food.name}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Flame className="w-3.5 h-3.5 text-orange-500" />
                          <span className="text-sm font-semibold text-muted-foreground">
                            {food.calories}{" "}
                            <span className="text-[10px] font-normal uppercase">
                              kcal
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-background/80 rounded-full text-muted-foreground hover:text-foreground transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="w-5 h-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(food);
                          }}
                        >
                          <Pencil className="mr-2 h-4 w-4" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(food.id);
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Macros Grid */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="flex flex-col items-center p-2.5 rounded-2xl bg-secondary/30 border border-border/50">
                      <Dna className="w-4 h-4 text-blue-500 mb-1.5" />
                      <span className="text-xl font-extrabold text-foreground leading-none">
                        {food.protein}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 mt-1">
                        Prot
                      </span>
                    </div>
                    <div className="flex flex-col items-center p-2.5 rounded-2xl bg-secondary/30 border border-border/50">
                      <Wheat className="w-4 h-4 text-yellow-500 mb-1.5" />
                      <span className="text-xl font-extrabold text-foreground leading-none">
                        {food.carbs}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 mt-1">
                        Carb
                      </span>
                    </div>
                    <div className="flex flex-col items-center p-2.5 rounded-2xl bg-secondary/30 border border-border/50">
                      <Droplet className="w-4 h-4 text-pink-500 mb-1.5" />
                      <span className="text-xl font-extrabold text-foreground leading-none">
                        {food.fat}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 mt-1">
                        Fat
                      </span>
                    </div>
                  </div>

                  {/* Footer Action */}
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(food);
                    }}
                    className={cn(
                      "w-full mt-auto rounded-xl font-semibold tracking-wide transition-all duration-300 h-10",
                      isSelected
                        ? "active-button-glow bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-transparent hover:border-border"
                    )}
                    variant={isSelected ? "default" : "secondary"}
                  >
                    {isSelected ? "Ver Detalles / Editar" : "Seleccionar"}
                  </Button>
                </div>
              </div>
            </CarouselItem>
          );
        })}
      </CarouselContent>
      <CarouselPrevious className="left-4 h-10 w-10 border-none bg-background/20 hover:bg-background/40 hover:text-primary backdrop-blur-md" />
      <CarouselNext className="right-4 h-10 w-10 border-none bg-background/20 hover:bg-background/40 hover:text-primary backdrop-blur-md" />
    </Carousel>
  );
};

const AdminFoodPage = () => {
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Create/Edit State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateFoodDto>({
    name: "",
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    category: "",
    description: "",
  });

  // Delete State
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [foodToDelete, setFoodToDelete] = useState<string | null>(null);

  const fetchFoods = async () => {
    try {
      setLoading(true);
      const data = await foodService.getAllFoods();
      if (Array.isArray(data)) {
        setFoods(data);
      } else {
        setFoods([]);
      }
    } catch (error) {
      console.error("Error fetching foods:", error);
      toast.error("Error al cargar alimentos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoods();
  }, []);

  const resetForm = () => {
    setFormData({
      name: "",
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      category: "",
      description: "",
    });
    setIsEditing(false);
    setCurrentId(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (food: Food, e?: React.MouseEvent) => {
    // Optional chaining in case e is not passed
    e?.stopPropagation(); // Prevent opening modal if row click
    setFormData({
      name: food.name,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      category: food.category || "CARBOHIDRATO",
      description: food.description || "",
    });
    setCurrentId(food.id);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && currentId) {
        await foodService.updateFood(currentId, formData);
        toast.success("Alimento actualizado");
      } else {
        await foodService.createFood(formData);
        toast.success("Alimento creado");
      }
      setIsDialogOpen(false);
      fetchFoods();
    } catch (error) {
      console.error("Error saving food:", error);
      toast.error("Error al guardar alimento");
    }
  };

  const handleDelete = async (id?: string) => {
    const targetId = id || foodToDelete;
    if (!targetId) return;

    try {
      await foodService.deleteFood(targetId);
      toast.success("Alimento eliminado");
      fetchFoods();
    } catch (error) {
      console.error("Error deleting food:", error);
      toast.error("Error al eliminar alimento");
    } finally {
      setIsAlertOpen(false);
      setFoodToDelete(null);
    }
  };

  const filteredFoods = foods.filter((food) =>
    food.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group foods by category
  const foodsByCategory = filteredFoods.reduce((acc, food) => {
    const category = food.category || "General";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(food);
    return acc;
  }, {} as Record<string, Food[]>);

  const categories = Object.keys(foodsByCategory).sort();

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-[100vw] overflow-x-hidden p-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-border/40">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
            <span className="p-2 bg-primary/10 rounded-xl text-primary">
              <Apple className="h-8 w-8" />
            </span>
            Gestión de Alimentos
          </h2>
          <p className="text-muted-foreground mt-2 text-lg">
            Configuración avanzada de base de datos nutricional.
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          size="lg"
          className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/20 transition-all hover:scale-105 rounded-full px-8"
        >
          <Plus className="mr-2 h-5 w-5" /> Nuevo Alimento
        </Button>
      </div>

      <div className="flex items-center space-x-4 bg-secondary/30 p-4 rounded-2xl border border-border/50 max-w-xl mx-auto backdrop-blur-sm">
        <Search className="h-6 w-6 text-muted-foreground ml-2" />
        <Input
          placeholder="Buscar alimento por nombre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border-0 bg-transparent focus-visible:ring-0 text-foreground placeholder:text-muted-foreground text-lg"
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="font-medium animate-pulse">
            Sincronizando base de datos...
          </p>
        </div>
      ) : filteredFoods.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground border-2 border-dashed border-border/50 rounded-3xl bg-card/50">
          <p className="text-xl font-medium">No se encontraron alimentos</p>
          <p className="text-sm mt-2">
            Intenta con otro término de búsqueda o crea uno nuevo.
          </p>
        </div>
      ) : (
        <div className="space-y-16">
          {categories.map((category) => (
            <div key={category} className="space-y-6">
              <div className="flex items-center gap-4 px-4">
                <div className="h-8 w-1 bg-primary rounded-full" />
                <h3 className="text-2xl font-bold tracking-tight text-foreground uppercase">
                  {category}
                </h3>
                <Badge
                  variant="secondary"
                  className="text-sm px-3 py-1 rounded-full font-mono font-normal"
                >
                  {foodsByCategory[category].length}
                </Badge>
              </div>

              <div className="px-4 w-full">
                <ZoomCarousel
                  foods={foodsByCategory[category]}
                  onEdit={handleOpenEdit}
                  onDelete={(id) => {
                    setFoodToDelete(id);
                    setIsAlertOpen(true);
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-card/95 backdrop-blur-xl border-border/50 text-foreground max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl">
          <DialogHeader className="pb-4 border-b border-border/10">
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              {isEditing ? (
                <Pencil className="w-5 h-5 text-primary" />
              ) : (
                <Plus className="w-5 h-5 text-primary" />
              )}
              {isEditing ? "Editar Alimento" : "Nuevo Alimento"}
            </DialogTitle>
            <DialogDescription className="text-base">
              {isEditing
                ? "Modifica los valores nutricionales."
                : "Añade un nuevo registro nutricional."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-6 py-6">
            <div className="grid gap-2">
              <Label
                htmlFor="name"
                className="text-sm font-medium uppercase text-muted-foreground tracking-wide"
              >
                Nombre del Alimento
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                placeholder="Ej. Pechuga de Pollo"
                className="bg-secondary/20 border-border/50 text-lg py-5 rounded-xl focus:ring-primary/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Calories - Featured */}
              <div className="grid gap-2 col-span-2 sm:col-span-1">
                <Label
                  htmlFor="calories"
                  className="text-xs font-medium text-muted-foreground uppercase"
                >
                  Calorías (kcal)
                </Label>
                <div className="relative">
                  <Flame className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="calories"
                    type="number"
                    value={formData.calories}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        calories: Number(e.target.value),
                      })
                    }
                    required
                    className="pl-10 bg-background border-border text-base py-5 rounded-xl focus:border-primary/50"
                  />
                </div>
              </div>

              {/* Protein */}
              <div className="grid gap-2 col-span-2 sm:col-span-1">
                <Label
                  htmlFor="proteins"
                  className="text-xs font-medium text-muted-foreground uppercase"
                >
                  Proteínas (g)
                </Label>
                <div className="relative">
                  <Dna className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="proteins"
                    type="number"
                    value={formData.protein}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        protein: Number(e.target.value),
                      })
                    }
                    required
                    className="pl-10 bg-background border-border text-base py-5 rounded-xl focus:border-primary/50"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Carbs */}
              <div className="grid gap-2">
                <Label
                  htmlFor="carbs"
                  className="text-xs font-medium text-muted-foreground uppercase"
                >
                  Carbohidratos (g)
                </Label>
                <div className="relative">
                  <Wheat className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="carbs"
                    type="number"
                    value={formData.carbs}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        carbs: Number(e.target.value),
                      })
                    }
                    required
                    className="pl-10 bg-background border-border text-base py-5 rounded-xl focus:border-primary/50"
                  />
                </div>
              </div>

              {/* Fats */}
              <div className="grid gap-2">
                <Label
                  htmlFor="fats"
                  className="text-xs font-medium text-muted-foreground uppercase"
                >
                  Grasas (g)
                </Label>
                <div className="relative">
                  <Droplet className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="fats"
                    type="number"
                    value={formData.fat}
                    onChange={(e) =>
                      setFormData({ ...formData, fat: Number(e.target.value) })
                    }
                    required
                    className="pl-10 bg-background border-border text-base py-5 rounded-xl focus:border-primary/50"
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <Label
                htmlFor="category"
                className="text-sm font-medium uppercase text-muted-foreground tracking-wide"
              >
                Categoría
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger className="bg-secondary/20 border-border/50 py-5 rounded-xl text-base">
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CARBOHIDRATO">CARBOHIDRATO</SelectItem>
                  <SelectItem value="PROTEINA">PROTEINA</SelectItem>
                  <SelectItem value="GRASA">GRASA</SelectItem>
                  <SelectItem value="VEGETAL">VEGETAL</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="mt-6">
              <Button
                type="submit"
                size="lg"
                className="bg-primary text-primary-foreground w-full rounded-xl text-base font-medium shadow-md shadow-primary/20 hover:scale-[1.01] transition-transform"
              >
                {isEditing ? "Guardar Cambios" : "Crear Alimento"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Alert */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent className="bg-card border-border text-foreground rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl text-destructive flex items-center gap-2">
              <Trash2 className="w-6 h-6" /> Eliminar Registro
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base text-muted-foreground">
              ¿Estás seguro de eliminar este alimento? Esta acción afectará a
              las dietas que lo utilicen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl border-none bg-secondary text-secondary-foreground hover:bg-secondary/80">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDelete()}
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-lg shadow-destructive/20"
            >
              Sí, Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminFoodPage;
