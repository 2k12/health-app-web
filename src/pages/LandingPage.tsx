import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useBranding } from "@/context/BrandingContext";
import {
  ArrowRight,
  Dumbbell,
  Utensils,
  Laptop,
  CheckCircle2,
  Instagram,
  Twitter,
} from "lucide-react";

// Animation Variants
const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
};

const LandingPage = () => {
  const navigate = useNavigate();
  const { orgName, restaurantUrl } = useBranding();
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden selection:bg-primary/30">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-primary/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-bold text-primary"
          >
            {orgName}
          </motion.div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#inicio" className="hover:text-primary transition-colors">
              Inicio
            </a>
            <a
              href="#paquetes"
              className="hover:text-primary transition-colors"
            >
              Paquetes
            </a>
            {restaurantUrl && (
              <a
                href={restaurantUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 hover:text-primary transition-colors"
              >
                Restaurante <Utensils className="w-3 h-3" />
              </a>
            )}
            <Button
              variant="default"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => navigate("/login")}
            >
              Plataforma <Laptop className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        id="inicio"
        className="relative min-h-screen flex items-center justify-center pt-20"
      >
        <div className="absolute inset-0 -z-10">
          {/* Background Gradient/Image */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay" />
        </div>

        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="space-y-8"
          >
            <motion.div
              variants={fadeIn}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Transforma tu vida hoy
            </motion.div>

            <motion.h1
              variants={fadeIn}
              className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight"
            >
              Tu Mejor Versión <br />
              <span className="text-primary">Empieza Aquí</span>
            </motion.h1>

            <motion.p
              variants={fadeIn}
              className="text-xl text-muted-foreground max-w-lg"
            >
              Entrenamiento personalizado, nutrición inteligente y seguimiento
              en tiempo real. Todo en una sola plataforma.
            </motion.p>

            <motion.div variants={fadeIn} className="flex flex-wrap gap-4">
              <Button
                size="lg"
                className="text-lg px-8 h-14"
                onClick={() => navigate("/login")}
              >
                Comienza Gratis <ArrowRight className="ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-lg px-8 h-14"
                asChild
              >
                <a href="#paquetes">Ver Planes</a>
              </Button>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            {/* Abstract 3D-like Shape or Hero Image */}
            <div className="relative z-10 w-full h-[600px] rounded-3xl overflow-hidden shadow-2xl skew-y-3 hover:skew-y-0 transition-transform duration-700 ease-out">
              <img
                src="https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?q=80&w=2669&auto=format&fit=crop"
                alt="Athlete"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />

              {/* Floating Cards */}
              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 4,
                  ease: "easeInOut",
                }}
                className="absolute bottom-20 left-10 bg-card/80 backdrop-blur border border-white/10 p-4 rounded-xl flex items-center gap-4 shadow-xl"
              >
                <div className="h-12 w-12 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500">
                  <Utensils className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Calorías
                  </p>
                  <p className="text-lg font-bold">2,450 kcal</p>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 20, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 5,
                  ease: "easeInOut",
                  delay: 1,
                }}
                className="absolute top-20 right-10 bg-card/80 backdrop-blur border border-white/10 p-4 rounded-xl flex items-center gap-4 shadow-xl"
              >
                <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500">
                  <Dumbbell className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Entrenamiento
                  </p>
                  <p className="text-lg font-bold">Hombro & Pierna</p>
                </div>
              </motion.div>
            </div>

            {/* Background Blob */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/20 blur-[100px] -z-10" />
          </motion.div>
        </div>
      </section>

      {/* Packages Section */}
      <section id="paquetes" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold">Elige Tu Cambio</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Planes diseñados científicamente para adaptarse a tus objetivos,
              disponibilidad y nivel de experiencia.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Básico",
                price: "$29.99",
                features: [
                  "Rutina Mensual",
                  "Guía Nutricional Básica",
                  "Soporte 24/7",
                ],
                popular: false,
                color: "border-border",
              },
              {
                name: "Pro",
                price: "$49.99",
                features: [
                  "Rutinas Semanales",
                  "Dieta Personalizada Dinámica",
                  "Seguimiento Semanal",
                  "Acceso App Móvil",
                ],
                popular: true,
                color: "border-primary shadow-primary/20 scale-105",
              },
              {
                name: "Elite",
                price: "$89.99",
                features: [
                  "Plan 1 a 1 Exclusivo",
                  "Video-llamadas Quincenales",
                  "Ajustes Diarios",
                  "Todo lo incluido en Pro",
                ],
                popular: false,
                color: "border-border",
              },
            ].map((plan, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={`relative p-8 rounded-3xl bg-card border ${plan.color} shadow-lg flex flex-col`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-sm font-bold px-4 py-1 rounded-full uppercase tracking-wide">
                    Más Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="text-4xl font-extrabold mb-6">
                  {plan.price}
                  <span className="text-lg font-normal text-muted-foreground">
                    /mes
                  </span>
                </div>

                <ul className="space-y-4 mb-8 flex-1">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full py-6 text-lg ${
                    plan.popular ? "bg-primary" : "variant-secondary"
                  }`}
                >
                  Empezar Ahora
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Integration Section */}
      <section className="py-24 bg-secondary/20">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-6">Un Ecosistema Completo</h2>
            <p className="text-lg text-muted-foreground mb-8">
              {orgName} no es solo una app de ejercicios. Es un estilo de vida
              que integra entrenamiento, nutrición saludable y tecnología.
            </p>

            <div className="space-y-6">
              {restaurantUrl && (
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-500 flex-shrink-0">
                    <Utensils className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold">{orgName} Food</h4>
                    <p className="text-muted-foreground">
                      Comidas saludables preparadas por chefs y calculadas para
                      tus macros, entregadas en tu puerta.
                    </p>
                    <a
                      href={restaurantUrl}
                      target="_blank"
                      className="text-primary font-medium mt-2 inline-flex items-center hover:underline"
                    >
                      Visitar Restaurante{" "}
                      <ArrowRight className="ml-1 w-4 h-4" />
                    </a>
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-500 flex-shrink-0">
                  <Laptop className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xl font-bold">Plataforma Inteligente</h4>
                  <p className="text-muted-foreground">
                    Tu progreso centralizado. Gráficos de evolución, chats con
                    entrenadores y ajustes en tiempo real.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, rotate: 5 }}
            whileInView={{ opacity: 1, rotate: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <img
              src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=2653&auto=format&fit=crop"
              alt="Healthy Food"
              className="rounded-3xl shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500"
            />
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border mt-12 bg-card">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-2xl font-bold text-primary">{orgName}</div>
          <div className="text-muted-foreground text-sm">
            © 2026 {orgName}. Todos los derechos reservados.
          </div>
          <div className="flex gap-6">
            <Instagram className="w-6 h-6 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
            <Twitter className="w-6 h-6 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
