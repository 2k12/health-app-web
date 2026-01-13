import { useEffect, useState } from "react";
import { trainerService, type AssignedUser } from "@/services/trainerService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Users, ExternalLink, Calendar, Target } from "lucide-react";
import { useNavigate } from "react-router-dom"; // Assuming react-router-dom is used

const TrainerUsersPage = () => {
  const [users, setUsers] = useState<AssignedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const data = await trainerService.getAssignedUsers();
        setUsers(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" /> Mis Usuarios Asignados
          </h2>
          <p className="text-muted-foreground">
            Gestiona los planes de entrenamiento de tus alumnos.
          </p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar alumno..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <Card
            key={user.id}
            className="group hover:border-primary/50 transition-all cursor-pointer"
            onClick={() => navigate(`/trainer/users/${user.id}`)}
          >
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 overflow-hidden">
                <CardTitle className="text-lg truncate">{user.name}</CardTitle>
                <p className="text-sm text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </CardHeader>
            <CardContent className="pt-4 border-t mt-2 bg-secondary/10">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Target className="h-3 w-3" /> Objetivo
                  </span>
                  <span className="font-medium capitalize">
                    {user.profile?.fitnessGoal
                      ?.replace("_", " ")
                      .toLowerCase() || "Sin definir"}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Último Control
                  </span>
                  <span className="font-medium">
                    {user.measurements?.[0]
                      ? new Date(user.measurements[0].date).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredUsers.length === 0 && !loading && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No se encontraron usuarios asignados.
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainerUsersPage;
