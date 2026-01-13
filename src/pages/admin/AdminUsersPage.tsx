import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  MoreHorizontal,
  Plus,
  Search,
  Loader2,
  Trash2,
  UserCog,
  History,
} from "lucide-react";
import { userService } from "@/services/userService";
import type { User, CreateUserDto } from "@/services/userService";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const AdminUsersPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [trainers, setTrainers] = useState<Partial<User>[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Create State
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState<CreateUserDto>({
    name: "",
    email: "",
    password: "",
    role: "USUARIO",
  });

  // Edit State
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    role: "",
    assignedTrainerId: "",
  });

  // Delete State
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error(
        `Error al cargar usuarios: ${(error as Error).message || "Desconocido"}`
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchTrainers = async () => {
    try {
      const data = await userService.getTrainers();
      setTrainers(data);
    } catch (error) {
      console.error("Error fetching trainers:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchTrainers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await userService.createUser(newUser);
      toast.success("Usuario creado exitosamente");
      setIsCreateDialogOpen(false);
      setNewUser({ name: "", email: "", password: "", role: "USUARIO" });
      fetchUsers();
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error("Error al crear usuario");
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      await userService.deleteUser(userToDelete);
      toast.success("Usuario eliminado");
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Error al eliminar usuario");
    } finally {
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const openEditDialog = (user: User) => {
    setEditingUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role,
      assignedTrainerId: user.profile?.assignedTrainerId || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      // 1. Update User Details
      await userService.updateUser(editingUser.id, {
        name: editForm.name,
        email: editForm.email,
        role: editForm.role as User["role"],
      });

      // 2. If it's a USER, update Trainer assignment
      if (editForm.role === "USUARIO") {
        await userService.assignTrainer(
          editingUser.id,
          editForm.assignedTrainerId === "none"
            ? null
            : editForm.assignedTrainerId
        );
      }

      toast.success("Usuario actualizado correctamente");
      setIsEditDialogOpen(false);
      fetchUsers();
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Error al actualizar usuario");
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight text-primary">
            Gestión de Usuarios
          </h2>
          <p className="text-muted-foreground mt-1">
            Administra los accesos, roles y asignaciones.
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-all hover:scale-105">
              <Plus className="mr-2 h-4 w-4" /> Nuevo Usuario
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-card border-border text-foreground max-h-[90vh] overflow-y-auto">
            {/* Dialog Content */}
            <DialogHeader>
              <DialogTitle>Crear Nuevo Usuario</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Ingresa los datos del nuevo usuario.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateUser} className="grid gap-4 py-4">
              {/* Form Fields */}
              <div className="grid gap-2">
                <Label htmlFor="name">Nombre Completo</Label>
                <Input
                  id="name"
                  value={newUser.name}
                  onChange={(e) =>
                    setNewUser({ ...newUser, name: e.target.value })
                  }
                  required
                  className="bg-secondary/50 border-input focus:ring-primary"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                  required
                  className="bg-secondary/50 border-input focus:ring-primary"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) =>
                    setNewUser({ ...newUser, password: e.target.value })
                  }
                  required
                  className="bg-secondary/50 border-input focus:ring-primary"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Rol</Label>
                <Select
                  value={newUser.role}
                  onValueChange={(value: User["role"]) =>
                    setNewUser({ ...newUser, role: value })
                  }
                >
                  <SelectTrigger className="bg-secondary/50 border-input">
                    <SelectValue placeholder="Selecciona un rol" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border text-popover-foreground">
                    <SelectItem value="USUARIO">Usuario</SelectItem>
                    <SelectItem value="ENTRENADOR">Entrenador</SelectItem>
                    <SelectItem value="ADMINISTRADOR">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter className="mt-4">
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary/90 w-full"
                >
                  Crear Usuario
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Error Alert */}
      {/* Use a simple variable/state check if we had one, but we used toast. 
           Let's add a static example or implement 'error' state properly if requested.
           For now, I will just ensure the component is valid. 
           Actually, let's REMOVE the unused imports if we aren't using them, OR use them.
           The user asked to "use" them. 
           I'll add a section that shows an alert if there are no users found, maybe?
           Or just leave it for now since I'm fixing the crash.
           I'll remove the unused imports to clean up lint errors for now, 
           and maybe add a real usage if I urge it. 
           Actually, sticking to the crash fix is safer. 
           I will SKIP modifying AdminUsersPage for now to avoid side effects while fixing the crash.
           Wait, I selected 'multi_replace' which implies I might do it.
           I will just do the imports in AdminLayout.tsx first.
       */}

      <div className="flex items-center space-x-2 bg-card p-2 rounded-xl border border-border  max-w-md shadow-sm">
        <Search className="h-5 w-5 text-muted-foreground ml-2" />
        <Input
          placeholder="Buscar por nombre o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border-0 bg-transparent focus-visible:ring-0 text-foreground placeholder:text-muted-foreground"
        />
      </div>

      {loading && users.length === 0 && (
        <Alert className="bg-muted/50 border-muted text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertTitle>Cargando</AlertTitle>
          <AlertDescription>Obteniendo lista de usuarios...</AlertDescription>
        </Alert>
      )}

      {!loading && users.length === 0 && (
        <Alert>
          <History className="h-4 w-4" />
          <AlertTitle>Sin Usuarios</AlertTitle>
          <AlertDescription>
            No se encontraron usuarios registrados en el sistema.
          </AlertDescription>
        </Alert>
      )}

      {/* Mobile Card View */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            Cargando usuarios...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border rounded-lg bg-card">
            No se encontraron usuarios.
          </div>
        ) : (
          filteredUsers.map((user) => (
            <Card key={user.id} className="shadow-sm border-border">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-sm font-bold text-foreground border border-border">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <CardTitle className="text-base font-bold">
                        {user.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <Badge
                    className="bg-secondary text-secondary-foreground border-border"
                    variant="outline"
                  >
                    {user.role}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mt-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                      user.isActive
                        ? "bg-green-500/15 text-green-700"
                        : "bg-red-500/15 text-red-700"
                    }`}
                    onClick={async () => {
                      try {
                        await userService.toggleStatus(user.id, !user.isActive);
                        toast.success(
                          `Usuario ${
                            !user.isActive ? "activado" : "desactivado"
                          }`
                        );
                        fetchUsers();
                      } catch (error) {
                        console.error(error);
                        toast.error("Error al cambiar estado");
                      }
                    }}
                  >
                    {user.isActive ? "Activo" : "Inactivo"}
                  </span>

                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        navigate(`/admin/users/${user.id}/history`)
                      }
                    >
                      <History className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(user)}
                    >
                      <UserCog className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setUserToDelete(user.id);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-secondary/50">
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground font-semibold">
                Nombre
              </TableHead>
              <TableHead className="text-muted-foreground font-semibold">
                Email
              </TableHead>
              <TableHead className="text-muted-foreground font-semibold">
                Rol
              </TableHead>
              <TableHead className="text-muted-foreground font-semibold">
                Estado
              </TableHead>
              <TableHead className="text-right text-muted-foreground font-semibold">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    Cargando usuarios...
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-32 text-center text-muted-foreground"
                >
                  No se encontraron usuarios.
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow
                  key={user.id}
                  className="border-border hover:bg-muted/50 transition-colors"
                >
                  <TableCell className="font-medium text-foreground">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-foreground border border-border">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      {user.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {user.email}
                  </TableCell>
                  <TableCell>
                    {/* Neutral Badge Colors as requested */}
                    <Badge
                      className="bg-secondary text-secondary-foreground border-border hover:bg-secondary/80"
                      variant="outline"
                    >
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium cursor-pointer select-none transition-colors ${
                          user.isActive
                            ? "bg-green-500/15 text-green-700 hover:bg-green-500/25 dark:text-green-400"
                            : "bg-red-500/15 text-red-700 hover:bg-red-500/25 dark:text-red-400"
                        }`}
                        onClick={async () => {
                          try {
                            await userService.toggleStatus(
                              user.id,
                              !user.isActive
                            );
                            toast.success(
                              `Usuario ${
                                !user.isActive ? "activado" : "desactivado"
                              }`
                            );
                            fetchUsers();
                          } catch (error) {
                            console.error(error);
                            toast.error("Error al cambiar estado");
                          }
                        }}
                      >
                        {user.isActive ? "Activo" : "Inactivo"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Historial y Seguimiento"
                        onClick={() =>
                          navigate(`/admin/users/${user.id}/history`)
                        }
                      >
                        <History className="h-4 w-4 text-muted-foreground hover:text-primary" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                          >
                            <span className="sr-only">Abrir menú</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="bg-popover border-border text-popover-foreground"
                        >
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuItem
                            className="focus:bg-accent focus:text-accent-foreground cursor-pointer"
                            onClick={() => openEditDialog(user)}
                          >
                            <UserCog className="mr-2 h-4 w-4" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-border" />
                          <DropdownMenuItem
                            className="focus:bg-destructive/10 focus:text-destructive text-destructive cursor-pointer"
                            onClick={() => {
                              setUserToDelete(user.id);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-card border-border text-foreground max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>
              Modifica los datos del usuario.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateUser} className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Nombre</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
                className="bg-secondary/50 border-input"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                value={editForm.email}
                onChange={(e) =>
                  setEditForm({ ...editForm, email: e.target.value })
                }
                className="bg-secondary/50 border-input"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-role">Rol</Label>
              <Select
                value={editForm.role}
                onValueChange={(value: User["role"]) =>
                  setEditForm({ ...editForm, role: value })
                }
              >
                <SelectTrigger className="bg-secondary/50 border-input">
                  <SelectValue placeholder="Selecciona un rol" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border text-popover-foreground">
                  <SelectItem value="USUARIO">Usuario</SelectItem>
                  <SelectItem value="ENTRENADOR">Entrenador</SelectItem>
                  <SelectItem value="ADMINISTRADOR">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Trainer Assignment (Only for USUARIO) */}
            {editForm.role === "USUARIO" && (
              <div className="grid gap-2">
                <Label htmlFor="assign-trainer">Asignar Entrenador</Label>
                <Select
                  value={editForm.assignedTrainerId || "none"}
                  onValueChange={(value) =>
                    setEditForm({ ...editForm, assignedTrainerId: value })
                  }
                >
                  <SelectTrigger className="bg-secondary/50 border-input">
                    <SelectValue placeholder="Selecciona un entrenador" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border text-popover-foreground">
                    <SelectItem value="none">Sin Entrenador</SelectItem>
                    {trainers.map((trainer) => (
                      <SelectItem
                        key={trainer.id}
                        value={trainer.id || "unknown"}
                      >
                        {trainer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <DialogFooter>
              <Button
                type="submit"
                className="bg-primary text-primary-foreground"
              >
                Guardar Cambios
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Alert Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent className="bg-card border-border text-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está absolutamente seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción desactivará al usuario.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
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

export default AdminUsersPage;
