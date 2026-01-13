import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { userService } from "@/services/userService";
import type { User, UpdateUserDto } from "@/services/userService";
import { toast } from "sonner";
import { Loader2, Save, User as UserIcon, Mail, Shield } from "lucide-react";

const ProfilePage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState<UpdateUserDto>({
    name: "",
    email: "",
    password: "",
    age: 25,
    height: 170,
    weight: 70,
    gender: "OTRO",
    activityLevel: "MODERADO",
    fitnessGoal: "MANTENIMIENTO",
    trainingDays: 3,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await userService.getProfile();
        setUser(data);

        // Map backend profile to form
        const p = data.profile || {};
        // Guess training days from activity level if not stored, or default 3
        let tDays = 3;
        if (p.activityLevel === "SEDENTARIO") tDays = 0;
        else if (p.activityLevel === "LIGERO") tDays = 2;
        else if (p.activityLevel === "MODERADO") tDays = 3;
        else if (p.activityLevel === "ACTIVO") tDays = 5;
        else if (p.activityLevel === "MUY_ACTIVO") tDays = 6;

        setFormData({
          name: data.name,
          email: data.email,
          age: p.age || 25,
          height: p.height || 170,
          weight: p.weight || 70,
          gender: p.gender || "OTRO",
          activityLevel: p.activityLevel || "MODERADO",
          fitnessGoal: p.fitnessGoal || "MANTENIMIENTO",
          trainingDays: tDays,
        });
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Error al cargar perfil");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Effect to auto-update activityLevel based on trainingDays
  useEffect(() => {
    const days = formData.trainingDays || 0;
    let level: UpdateUserDto["activityLevel"] = "SEDENTARIO";

    if (days === 0) level = "SEDENTARIO";
    else if (days >= 1 && days <= 2) level = "LIGERO";
    else if (days >= 3 && days <= 4) level = "MODERADO";
    else if (days >= 5 && days <= 6) level = "ACTIVO";
    else if (days >= 7) level = "MUY_ACTIVO";

    // Only update if it's different to avoid loops or overrides if user manually picked (though we might enforce it)
    if (level !== formData.activityLevel) {
      setFormData((prev) => ({ ...prev, activityLevel: level }));
    }
  }, [formData.trainingDays, formData.activityLevel]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setSaving(true);
      const updateData: UpdateUserDto = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      };

      if (!updateData.password) delete updateData.password;

      // Only include profile data for standard users/trainers
      if (user.role === "USUARIO" || user.role === "ENTRENADOR") {
        updateData.age = formData.age;
        updateData.height = formData.height;
        updateData.weight = formData.weight;
        updateData.gender = formData.gender;
        updateData.activityLevel = formData.activityLevel;
        updateData.fitnessGoal = formData.fitnessGoal;
        updateData.trainingDays = formData.trainingDays;
      }

      const updatedUser = await userService.updateProfile(updateData);
      setUser(updatedUser);
      toast.success("Perfil actualizado correctamente");
      setFormData((prev) => ({ ...prev, password: "" }));
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Error al actualizar perfil");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8 text-center text-red-500">
        Error al cargar la información del usuario.
      </div>
    );
  }

  const isFitnessUser = user.role === "USUARIO" || user.role === "ENTRENADOR";

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-primary mb-2">
          Mi Perfil
        </h2>
        <p className="text-muted-foreground">
          Gestiona tu información personal{isFitnessUser ? " y métricas" : ""}.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Sidebar Info Card */}
        <Card className="bg-card border-border shadow-md md:col-span-1 border h-fit">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 relative">
              <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                <AvatarImage
                  src={`https://ui-avatars.com/api/?name=${user.name}&background=334155&color=fff`}
                />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className="text-xl text-foreground">
              {user.name}
            </CardTitle>
            <CardDescription className="flex items-center justify-center gap-1 mt-1 text-primary font-medium">
              <Shield className="h-3 w-3" />
              {user.role}
            </CardDescription>
          </CardHeader>
          {isFitnessUser && (
            <CardContent className="text-center pt-2 space-y-2">
              <div className="text-sm font-medium">Nivel de Actividad</div>
              <div className="text-xs text-muted-foreground bg-secondary/50 p-1 rounded">
                {user.profile?.activityLevel || "N/A"}
              </div>
            </CardContent>
          )}
        </Card>

        {/* Edit Form */}
        <Card className="bg-card border-border shadow-md md:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-foreground">
                Información Personal {isFitnessUser && "y Física"}
              </CardTitle>
            </div>
            <CardDescription className="text-muted-foreground">
              {isFitnessUser
                ? "Tus métricas ayudan a calcular mejor tu plan."
                : "Actualiza tus credenciales de acceso."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nombre Completo</Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Correo Electrónico</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>

              {isFitnessUser && (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>Edad</Label>
                      <Input
                        type="number"
                        value={formData.age}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            age: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Peso (kg)</Label>
                      <Input
                        type="number"
                        value={formData.weight}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            weight: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Altura (cm)</Label>
                      <Input
                        type="number"
                        value={formData.height}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            height: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Género</Label>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        value={formData.gender}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            gender: e.target.value as any,
                          })
                        }
                      >
                        <option value="MASCULINO">Masculino</option>
                        <option value="FEMENINO">Femenino</option>
                        <option value="OTRO">Otro</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Días de Entrenamiento (Semanal)</Label>
                        <Input
                          type="number"
                          min={0}
                          max={7}
                          value={formData.trainingDays}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              trainingDays: Number(e.target.value),
                            })
                          }
                        />
                        <p className="text-xs text-muted-foreground">
                          Define automáticamente tu Nivel de Actividad.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label>Nivel de Actividad (Calculado)</Label>
                        <Input
                          value={formData.activityLevel}
                          readOnly
                          className="bg-secondary/50 text-muted-foreground cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Objetivo Fitness</Label>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        value={formData.fitnessGoal}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            fitnessGoal: e.target.value as any,
                          })
                        }
                      >
                        <option value="PERDER_PESO">Perder Peso</option>
                        <option value="GANAR_MUSCULO">Ganar Músculo</option>
                        <option value="MANTENIMIENTO">Mantenimiento</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-2 pt-4 border-t border-border">
                <Label htmlFor="password">Nueva Contraseña (Opcional)</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Dejar en blanco para mantener la actual"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-all hover:scale-105"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" /> Guardar Cambios
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
