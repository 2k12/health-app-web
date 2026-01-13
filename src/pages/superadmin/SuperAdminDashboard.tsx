import { useEffect, useState } from "react";
import { organizationService } from "@/services/organizationService";
import type { OrganizationConfig } from "@/services/organizationService";
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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"; // Assuming you have this or use Input
import { toast } from "sonner";
import { Loader2, Plus, Edit, Building2 } from "lucide-react";

export default function SuperAdminDashboard() {
  console.log("🚀 SuperAdminDashboard MOUNTED");
  const [orgs, setOrgs] = useState<OrganizationConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrg, setSelectedOrg] = useState<OrganizationConfig | null>(
    null
  );
  const [open, setOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<OrganizationConfig>>({
    name: "",
    slug: "",
    primaryColor: "#10B981",
    secondaryColor: "#1F2937",
    logoUrl: "",
    restaurantUrl: "",
    nutritionDetails: "",
  });

  const fetchOrgs = async () => {
    try {
      setLoading(true);
      const data = await organizationService.getAll();
      setOrgs(data);
    } catch {
      toast.error("Error al cargar organizaciones");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrgs();
  }, []);

  const handleEdit = (org: OrganizationConfig) => {
    setSelectedOrg(org);
    setFormData({
      name: org.name,
      slug: org.slug,
      primaryColor: org.primaryColor,
      secondaryColor: org.secondaryColor,
      logoUrl: org.logoUrl || "",
      restaurantUrl: org.restaurantUrl || "",
      nutritionDetails: org.nutritionDetails || "",
    });
    setOpen(true);
  };

  const handleCreate = () => {
    setSelectedOrg(null);
    setFormData({
      name: "",
      slug: "",
      primaryColor: "#10B981",
      secondaryColor: "#1F2937",
      logoUrl: "",
      restaurantUrl: "",
      nutritionDetails: "",
    });
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedOrg) {
        // Edit
        await organizationService.update(selectedOrg.id, formData);
        toast.success("Organización actualizada");
      } else {
        // Create
        await organizationService.create(formData);
        toast.success("Organización creada");
      }
      setOpen(false);
      fetchOrgs();
    } catch (error) {
      console.error(error);
      toast.error("Error al guardar organización");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <Building2 className="h-8 w-8" /> Gestión de Organizaciones
          </h1>
          <p className="text-muted-foreground mt-2">
            Panel de SuperAdmin para administrar tenants (gimnasios/clientes).
          </p>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" /> Nueva Organización
        </Button>
      </div>

      <div className="border rounded-lg bg-white shadow-sm overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Slug (URL)</TableHead>
              <TableHead>Colores</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orgs.map((org) => (
              <TableRow key={org.id}>
                <TableCell className="font-medium">{org.name}</TableCell>
                <TableCell>
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                    {org.slug}
                  </code>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <div
                      className="w-6 h-6 rounded-full border"
                      style={{ backgroundColor: org.primaryColor }}
                      title={`Primario: ${org.primaryColor}`}
                    />
                    <div
                      className="w-6 h-6 rounded-full border"
                      style={{ backgroundColor: org.secondaryColor }}
                      title={`Secundario: ${org.secondaryColor}`}
                    />
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(org)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* CREATE / EDIT DIALOG */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedOrg ? "Editar Organización" : "Nueva Organización"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Ej. Fitness & Balance"
                />
              </div>
              <div className="space-y-2">
                <Label>Slug (Identificador URL)</Label>
                <Input
                  required
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  placeholder="Ej. fitba"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Color Primario</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    className="w-12 p-1 h-10"
                    value={formData.primaryColor}
                    onChange={(e) =>
                      setFormData({ ...formData, primaryColor: e.target.value })
                    }
                  />
                  <Input
                    value={formData.primaryColor}
                    onChange={(e) =>
                      setFormData({ ...formData, primaryColor: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Color Secundario</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    className="w-12 p-1 h-10"
                    value={formData.secondaryColor}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        secondaryColor: e.target.value,
                      })
                    }
                  />
                  <Input
                    value={formData.secondaryColor}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        secondaryColor: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>URL Logo (Opcional)</Label>
              <Input
                value={formData.logoUrl || ""}
                onChange={(e) =>
                  setFormData({ ...formData, logoUrl: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>URL Restaurante (Opcional)</Label>
              <Input
                value={formData.restaurantUrl || ""}
                onChange={(e) =>
                  setFormData({ ...formData, restaurantUrl: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Detalles de Nutrición (HTML)</Label>
              <p className="text-xs text-muted-foreground">
                Se usará en el PDF. Usa lista <code>&lt;li&gt;</code> para
                mejores resultados.
              </p>
              <Textarea
                className="font-mono text-xs min-h-[150px]"
                value={formData.nutritionDetails || ""}
                onChange={(e) =>
                  setFormData({ ...formData, nutritionDetails: e.target.value })
                }
                placeholder="<ul><li>Detalle 1</li>...</ul>"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {selectedOrg ? "Guardar Cambios" : "Crear Organización"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
