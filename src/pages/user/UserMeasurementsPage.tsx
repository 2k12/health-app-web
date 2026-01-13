import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Ruler, Weight, Activity, Calendar } from "lucide-react";
import {
  measurementService,
  type Measurement,
  type CreateMeasurementDto,
} from "@/services/measurementService";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ProgressChart } from "@/components/dashboard/ProgressChart";

const UserMeasurementsPage = () => {
  const [history, setHistory] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [formData, setFormData] = useState<CreateMeasurementDto>({
    weightKg: 0,
    heightCm: 0,
    age: 25,
    gender: "MASCULINO",
    goal: "MANTENIMIENTO",
    trainingDays: 3,
    neck: 0,
    chest: 0,
    arm: 0,
    waist: 0,
    hips: 0,
    glute: 0,
    leg: 0,
  });

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await measurementService.getMyHistory();
      setHistory(data);
    } catch (error) {
      console.error(error);
      toast.error("Error al cargar historial");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await measurementService.create(formData);
      toast.success("Control registrado exitosamente");
      setIsDialogOpen(false);
      fetchHistory();
    } catch (error) {
      console.error(error);
      toast.error("Error al registrar control");
    }
  };

  const latest = history[0];

  if (loading) {
    return (
      <div className="p-8 flex justify-center text-muted-foreground">
        Cargando historial...
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Activity className="h-8 w-8 text-primary" /> Mi Progreso
          </h2>
          <p className="text-muted-foreground">
            Registra tus medidas corporales para recalcular tu plan nutricional.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" /> Nuevo Control
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-card max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Registrar Medidas Corporales</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="grid gap-6 py-4">
              {/* Sección Bio */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">
                  Datos Básicos
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="grid gap-2">
                    <Label>Peso (kg)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      required
                      value={formData.weightKg || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          weightKg: parseFloat(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Altura (cm)</Label>
                    <Input
                      type="number"
                      value={formData.heightCm || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          heightCm: parseFloat(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Edad</Label>
                    <Input
                      type="number"
                      value={formData.age || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          age: parseFloat(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Género</Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(val) =>
                        setFormData({ ...formData, gender: val })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MASCULINO">Masculino</SelectItem>
                        <SelectItem value="FEMENINO">Femenino</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Sección Objetivo */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">
                  Objetivo y Actividad
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Objetivo Fitness</Label>
                    <Select
                      value={formData.goal}
                      onValueChange={(val) =>
                        setFormData({ ...formData, goal: val })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="VOLUMEN">
                          Ganar Músculo (Volumen)
                        </SelectItem>
                        <SelectItem value="DEFINICION">
                          Perder Grasa (Definición)
                        </SelectItem>
                        <SelectItem value="MANTENIMIENTO">
                          Mantenimiento
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Días de Entrenamiento / Semana</Label>
                    <Select
                      value={formData.trainingDays.toString()}
                      onValueChange={(val) =>
                        setFormData({
                          ...formData,
                          trainingDays: parseInt(val),
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 día (Sedentario)</SelectItem>
                        <SelectItem value="3">3 días (Moderado)</SelectItem>
                        <SelectItem value="5">5 días (Intenso)</SelectItem>
                        <SelectItem value="6">6-7 días (Atleta)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Sección Medidas */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">
                  Perímetros (cm)
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Neck, Chest, Arm, Waist */}
                  <div className="grid gap-2">
                    <Label>Cuello</Label>
                    <Input
                      type="number"
                      step="0.5"
                      value={formData.neck || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          neck: parseFloat(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Pecho</Label>
                    <Input
                      type="number"
                      step="0.5"
                      value={formData.chest || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          chest: parseFloat(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Brazo</Label>
                    <Input
                      type="number"
                      step="0.5"
                      value={formData.arm || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          arm: parseFloat(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Cintura</Label>
                    <Input
                      type="number"
                      step="0.5"
                      value={formData.waist || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          waist: parseFloat(e.target.value),
                        })
                      }
                    />
                  </div>
                  {/* Hips, Glute, Leg */}
                  <div className="grid gap-2">
                    <Label>Cadera</Label>
                    <Input
                      type="number"
                      step="0.5"
                      value={formData.hips || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          hips: parseFloat(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Glúteo</Label>
                    <Input
                      type="number"
                      step="0.5"
                      value={formData.glute || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          glute: parseFloat(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Pierna</Label>
                    <Input
                      type="number"
                      step="0.5"
                      value={formData.leg || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          leg: parseFloat(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full mt-4 bg-primary text-primary-foreground"
              >
                Guardar Medidas
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {latest && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Peso Actual</CardTitle>
              <Weight className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{latest.weightKg} kg</div>
              <p className="text-xs text-muted-foreground">Último registro</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                % Grasa Corporal Est.
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {latest.bodyFat ? `${latest.bodyFat}%` : "N/A"}
              </div>
              <p className="text-xs text-muted-foreground">
                Calculado automáticamente
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Objetivo</CardTitle>
              <Ruler className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">
                {typeof latest.goal === "string"
                  ? latest.goal.toLowerCase()
                  : latest.goal === 0
                  ? "Volumen"
                  : latest.goal === 1
                  ? "Definición"
                  : "Mantenimiento"}
              </div>
              <p className="text-xs text-muted-foreground">
                Meta fitness actual
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <ProgressChart />

      <Card>
        <CardHeader>
          <CardTitle>Historial de Registros</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Mobile Card View */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {history.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border rounded-lg p-4">
                No hay registros aún. ¡Añade tu primer control!
              </div>
            ) : (
              history.map((item) => (
                <div
                  key={item.id}
                  className="rounded-lg border bg-card text-card-foreground shadow-sm p-4 space-y-3"
                >
                  <div className="flex justify-between items-center border-b pb-2">
                    <div className="flex items-center gap-2 font-medium">
                      <Calendar className="h-4 w-4 text-primary" />
                      {format(new Date(item.date), "dd MMM yyyy", {
                        locale: es,
                      })}
                    </div>
                    <div className="font-bold text-lg">{item.weightKg} kg</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">% Grasa:</span>
                      <span className="font-medium">
                        {item.bodyFat ? `${item.bodyFat}%` : "-"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cintura:</span>
                      <span className="font-medium">{item.waist} cm</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cadera:</span>
                      <span className="font-medium">{item.hips} cm</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Obj:</span>
                      <span className="font-medium capitalize">
                        {typeof item.goal === "string"
                          ? item.goal.toLowerCase()
                          : item.goal === 0
                          ? "Volumen"
                          : item.goal === 1
                          ? "Definición"
                          : "Mant."}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Peso</TableHead>
                  <TableHead>% Grasa</TableHead>
                  <TableHead>Cintura</TableHead>
                  <TableHead>Cadera</TableHead>
                  <TableHead>Objetivo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {format(new Date(item.date), "dd MMM yyyy", {
                          locale: es,
                        })}
                      </div>
                    </TableCell>
                    <TableCell>{item.weightKg} kg</TableCell>
                    <TableCell>
                      {item.bodyFat ? `${item.bodyFat}%` : "-"}
                    </TableCell>
                    <TableCell>{item.waist} cm</TableCell>
                    <TableCell>{item.hips} cm</TableCell>
                    <TableCell className="capitalize">
                      {typeof item.goal === "string"
                        ? item.goal.toLowerCase()
                        : item.goal === 0
                        ? "Volumen"
                        : item.goal === 1
                        ? "Definición"
                        : "Matenimiento"}
                    </TableCell>
                  </TableRow>
                ))}
                {history.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No hay registros aún. ¡Añade tu primer control!
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserMeasurementsPage;
