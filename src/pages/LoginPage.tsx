import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth, type User } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "@/services/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  email: z.string().email("Correo inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

interface LoginResponse {
  token: string;
  user: User;
}

import { useBranding } from "@/context/BrandingContext";

const LoginPage = () => {
  const { orgName } = useBranding();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      // Extract orgSlug from URL (e.g. /org/vitality/login)
      const pathMatch = window.location.pathname.match(/^\/org\/([^/]+)/);
      const orgSlug = pathMatch ? pathMatch[1] : null;

      const response = await api.post<LoginResponse>("/auth/login", {
        ...values,
        orgSlug,
      });
      const { token, user } = response.data;

      login(token, user);
      console.log("Logged in user role:", user.role);
      toast.success("¡Bienvenido de nuevo!");

      if (user.role && user.role.toUpperCase() === "ADMINISTRADOR") {
        navigate("/admin/users");
      } else if (user.role === "SUPERADMIN") {
        // Force full reload to escape organization basename (e.g. /org/vitality)
        // because superadmin lives at root /superadmin
        window.location.href = "/superadmin";
        return;
      } else {
        navigate("/dashboard");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(
        err.response?.data?.message ||
          "Error al iniciar sesión. Inténtalo de nuevo."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="absolute inset-0 bg-primary/10 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] -z-10 dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)]" />

      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-primary">
            {orgName}
            <span className="text-secondary">.</span>
          </CardTitle>
          <CardDescription className="text-center">
            Ingresa tus credenciales para continuar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo Electrónico</FormLabel>
                    <FormControl>
                      <Input placeholder="usuario@ejemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Ingresando...
                  </>
                ) : (
                  "Iniciar Sesión"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-muted-foreground">
          ¿No tienes cuenta? Contacta a tu entrenador.
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;
