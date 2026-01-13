import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ProgressChart } from "@/components/dashboard/ProgressChart";
import { dietService, type DietPlan } from "@/services/dietService";
import {
  measurementService,
  type Measurement,
} from "@/services/measurementService";
import { Flame, Loader2, RefreshCw, Activity, Zap, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const DashboardPage = () => {
  const [dietPlan, setDietPlan] = useState<DietPlan | null>(null);
  const [measurement, setMeasurement] = useState<Measurement | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const [history, setHistory] = useState<Measurement[]>([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch data independently so one failure doesn't block the other
      // Important for Trainers who might not have a diet plan yet but have measurements
      try {
        const diet = await dietService.getMyPlan();
        setDietPlan(diet);
      } catch (err) {
        console.warn("Could not fetch diet plan:", err);
      }

      try {
        const historyData = await measurementService.getMyHistory();
        if (historyData && historyData.length > 0) {
          setHistory(historyData);
          setMeasurement(historyData[0]);
        }
      } catch (err) {
        console.warn("Could not fetch measurement history:", err);
      }
    } catch (error) {
      console.error("Error in dashboard fetch:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRegenerate = async () => {
    try {
      setGenerating(true);
      const newPlan = await dietService.generatePlan();
      setDietPlan(newPlan);
      toast.success("Plan nutricional actualizado con tus últimas medidas.");
    } catch (error) {
      console.error("Error generating plan:", error);
      toast.error("Error al actualizar el plan.");
    } finally {
      setGenerating(false);
    }
  };

  const stats = [
    {
      title: "% Grasa Corporal",
      value: measurement?.bodyFat ? `${measurement.bodyFat}%` : "N/A",
      unit: "estimado",
      icon: Activity,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      desc: "Porcentaje de grasa corporal actual",
    },
    {
      title: "TMB (Basal)",
      value: measurement?.bmr ? Math.round(measurement.bmr) : 0,
      unit: "kcal",
      icon: Zap,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
      desc: "Calorías quemadas en reposo absoluto",
    },
    {
      title: "GET (Mantenimiento)",
      value: measurement?.tdee ? Math.round(measurement.tdee) : 0,
      unit: "kcal",
      icon: Scale,
      color: "text-indigo-500",
      bg: "bg-indigo-500/10",
      border: "border-indigo-500/20",
      desc: "Gasto Energético Total diario",
    },
    {
      title: "Meta Calórica",
      value: measurement?.targetCalories
        ? Math.round(measurement.targetCalories)
        : dietPlan?.dailyCalories || 0,
      unit: "kcal",
      icon: Flame,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
      border: "border-orange-500/20",
      desc: measurement?.targetCalories
        ? "Objetivo basado en tu última medición"
        : "Objetivo base del plan nutricional",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Bienvenido de nuevo
          </h2>
          <p className="text-muted-foreground mt-1">
            Resumen de tu estado físico y nutricional actual.
          </p>
        </div>
        <Button
          onClick={handleRegenerate}
          disabled={generating || loading}
          variant="outline"
          className="gap-2"
        >
          {generating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Actualizar Plan
        </Button>
      </div>

      <TooltipProvider>
        {/* Main Stats Grid - Biometrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((item, idx) => (
            <div
              key={idx}
              className={`relative overflow-hidden rounded-2xl p-6 border transition-all duration-300 hover:shadow-lg ${item.bg} ${item.border}`}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    {item.title}
                  </span>
                  <div className="flex items-baseline gap-1">
                    {loading ? (
                      <div className="h-8 w-24 bg-foreground/10 animate-pulse rounded" />
                    ) : (
                      <>
                        <h3 className="text-3xl font-bold text-foreground">
                          {item.value}
                        </h3>
                        <span className="text-sm font-medium text-muted-foreground">
                          {item.unit}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <Tooltip>
                  <TooltipTrigger>
                    <div
                      className={`p-3 rounded-xl bg-background shadow-sm ${item.color}`}
                    >
                      <item.icon className="h-6 w-6" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{item.desc}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div
                className={`absolute -right-6 -bottom-6 h-24 w-24 rounded-full opacity-10 ${item.color.replace(
                  "text-",
                  "bg-"
                )}`}
              />
            </div>
          ))}
        </div>
      </TooltipProvider>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ProgressChart />

          {/* History Table */}
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
            <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-4">
              <h3 className="font-semibold leading-none tracking-tight">
                Historial de Registros
              </h3>
            </div>
            <div className="p-0">
              <HistoryTable history={history} loading={loading} />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-2xl p-6 shadow-md relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-lg font-semibold mb-2">
                Próximo Entrenamiento
              </h3>
              <p className="text-primary-foreground/80 mb-6">
                Hoy es día de pierna. ¡No te saltes el día de pierna!
              </p>
              <Link to="/workout">
                <button className="bg-background text-primary px-4 py-2 rounded-lg font-medium text-sm hover:bg-background/90 transition-colors">
                  Ver Rutina
                </button>
              </Link>
            </div>
            <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
              <svg
                width="150"
                height="150"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M20.57 14.86L22 13.43L20.57 12L17 15.57L8.43 7L12 3.43L10.57 2L9.14 3.43L7.71 2L5.57 4.14L4.14 2.71L2.71 4.14L4.14 5.57L2 7.71L3.43 9.14L2 10.57L3.43 12L7 8.43L15.57 17L12 20.57L13.43 22L14.86 20.57L16.29 22L18.43 19.86L19.86 21.29L21.29 19.86L19.86 18.43L22 16.29L20.57 14.86Z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sub-component for clean Table code
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const HistoryTable = ({
  history,
  loading,
}: {
  history: Measurement[];
  loading: boolean;
}) => {
  if (loading)
    return (
      <div className="p-8 text-center text-muted-foreground">
        Cargando historial...
      </div>
    );
  if (!history || history.length === 0)
    return (
      <div className="p-8 text-center text-muted-foreground">
        No hay registros aún.
      </div>
    );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Fecha</TableHead>
          <TableHead>Peso</TableHead>
          <TableHead>Grasa %</TableHead>
          <TableHead className="hidden md:table-cell">Cintura</TableHead>
          <TableHead className="text-right">Obj</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {history.slice(0, 5).map((m) => (
          <TableRow key={m.id}>
            <TableCell className="font-medium">
              {format(new Date(m.date), "d MMM yyyy", { locale: es })}
            </TableCell>
            <TableCell>{m.weightKg} kg</TableCell>
            <TableCell>{m.bodyFat ? `${m.bodyFat}%` : "-"}</TableCell>
            <TableCell className="hidden md:table-cell">{m.waist} cm</TableCell>
            <TableCell className="text-right">
              {Math.round(m.targetCalories || 0)} kcal
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default DashboardPage;
