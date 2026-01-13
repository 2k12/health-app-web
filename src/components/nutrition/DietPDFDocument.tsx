import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// Register fonts if needed, otherwise use built-in Helvetica/Times
// Font.register({ family: 'Roboto', src: 'https://...' });

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#10B981", // Emerald-500
    paddingBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  orgName: {
    fontSize: 24,
    color: "#10B981",
    fontWeight: "heavy",
    textTransform: "uppercase",
  },
  subHeader: {
    fontSize: 10,
    color: "#6B7280",
    letterSpacing: 2,
    marginTop: 5,
  },
  dateBadge: {
    backgroundColor: "#ECFDF5", // Emerald-50
    padding: "4px 8px",
    borderRadius: 4,
  },
  dateText: {
    color: "#059669", // Emerald-700
    fontSize: 10,
    fontWeight: "bold",
  },
  section: {
    marginBottom: 15,
  },
  userCard: {
    backgroundColor: "#F9FAFB", // Gray-50
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    flexDirection: "row",
    flexWrap: "wrap",
  },
  userField: {
    width: "50%",
    marginBottom: 10,
  },
  userLabel: {
    fontSize: 8,
    color: "#6B7280",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  userValue: {
    fontSize: 12,
    color: "#111827",
    fontWeight: "bold",
  },
  dayContainer: {
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    overflow: "hidden",
  },
  dayHeader: {
    backgroundColor: "#10B981",
    padding: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dayTitle: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  dayMacros: {
    color: "white",
    fontSize: 10,
  },
  mealRow: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  mealTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  foodItem: {
    fontSize: 10,
    color: "#4B5563",
    marginLeft: 10,
    marginBottom: 2,
  },
  foodPortion: {
    color: "#9CA3AF",
    fontSize: 9,
  },
  detailsSection: {
    marginTop: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  detailsTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 10,
    textTransform: "uppercase",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingBottom: 5,
  },
  detailItem: {
    fontSize: 9,
    color: "#4B5563",
    marginBottom: 4,
    lineHeight: 1.4,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: "center",
    fontSize: 8,
    color: "#9CA3AF",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 10,
  },
});

interface DietPDFProps {
  organizationName: string;
  userName: string;
  userGoal: string;
  currentWeight?: number;
  targetCalories: number;
  dietPlan: any; // Using any for flexibility to match backend shape
  organizationDetails?: string;
  primaryColor?: string;
}

const parseHtmlDetails = (html: string) => {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const items = doc.querySelectorAll("li");
  return Array.from(items).map((li) => li.textContent || "");
};

export const DietPDFDocument = ({
  organizationName,
  userName,
  userGoal,
  currentWeight,
  targetCalories,
  dietPlan,
  organizationDetails,
  primaryColor = "#10B981",
}: DietPDFProps) => {
  const detailsList = organizationDetails
    ? parseHtmlDetails(organizationDetails)
    : [];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* HEADER */}
        <View style={[styles.header, { borderBottomColor: primaryColor }]}>
          <View>
            <Text style={[styles.orgName, { color: primaryColor }]}>
              {organizationName}
            </Text>
            <Text style={styles.subHeader}>PLAN NUTRICIONAL PERSONALIZADO</Text>
          </View>
          <View style={styles.dateBadge}>
            <Text style={[styles.dateText, { color: primaryColor }]}>
              FECHA: {new Date().toLocaleDateString("es-ES")}
            </Text>
          </View>
        </View>

        {/* USER INFO */}
        <View style={styles.userCard}>
          <View style={styles.userField}>
            <Text style={styles.userLabel}>USUARIO</Text>
            <Text style={styles.userValue}>{userName}</Text>
          </View>
          <View style={styles.userField}>
            <Text style={styles.userLabel}>OBJETIVO</Text>
            <Text style={styles.userValue}>{userGoal}</Text>
          </View>
          <View style={styles.userField}>
            <Text style={styles.userLabel}>PESO ACTUAL</Text>
            <Text style={styles.userValue}>
              {currentWeight ? `${currentWeight} KG` : "NO REGISTRADO"}
            </Text>
          </View>
          <View style={styles.userField}>
            <Text style={styles.userLabel}>CALORÍAS META</Text>
            <Text style={[styles.userValue, { color: primaryColor }]}>
              {targetCalories} KCAL / DÍA
            </Text>
          </View>
        </View>

        {/* DAILY PLAN ITERATION */}
        <View style={styles.section}>
          {[1, 2, 3, 4, 5, 6, 7].map((day) => {
            const dayMeals =
              dietPlan?.meals?.filter((m: any) => m.day === day) || [];
            if (dayMeals.length === 0) return null;

            let dCals = 0;
            let dProt = 0;
            let dCarbs = 0;
            let dFat = 0;

            dayMeals.forEach((m: any) =>
              m.foods.forEach((f: any) => {
                const ratio = f.portionGram / 100;
                dCals += f.food.calories * ratio;
                dProt += f.food.protein * ratio;
                dCarbs += f.food.carbs * ratio;
                dFat += f.food.fat * ratio;
              })
            );

            return (
              <View key={day} wrap={false} style={styles.dayContainer}>
                <View
                  style={[styles.dayHeader, { backgroundColor: primaryColor }]}
                >
                  <Text style={styles.dayTitle}>DÍA {day}</Text>
                  <Text style={styles.dayMacros}>
                    {Math.round(dCals)} kcal | P: {Math.round(dProt)}g | C:{" "}
                    {Math.round(dCarbs)}g | F: {Math.round(dFat)}g
                  </Text>
                </View>
                {dayMeals.map((meal: any) => (
                  <View key={meal.id} style={styles.mealRow}>
                    <Text style={styles.mealTitle}>
                      {meal.name}
                      <Text
                        style={{
                          fontWeight: "normal",
                          color: "#9CA3AF",
                          fontSize: 9,
                        }}
                      >
                        {"  "}~
                        {Math.round(
                          meal.foods.reduce(
                            (acc: number, f: any) =>
                              acc + (f.food.calories * f.portionGram) / 100,
                            0
                          )
                        )}{" "}
                        kcal
                      </Text>
                    </Text>
                    {meal.foods.map((f: any) => (
                      <Text key={f.id} style={styles.foodItem}>
                        • {f.food.name}{" "}
                        <Text style={styles.foodPortion}>
                          ({f.portionGram}g)
                        </Text>
                      </Text>
                    ))}
                  </View>
                ))}
              </View>
            );
          })}
        </View>

        {/* DETAILS SECTION */}
        {detailsList.length > 0 && (
          <View style={styles.detailsSection} break>
            <Text style={styles.detailsTitle}>RECOMENDACIONES Y DETALLES</Text>
            {detailsList.map((item, idx) => (
              <Text key={idx} style={styles.detailItem}>
                {item}
              </Text>
            ))}
          </View>
        )}

        {/* FOOTER */}
        <Text style={styles.footer} fixed>
          Generado automáticamente por la plataforma de {organizationName} •
          Pagina{" "}
          <Text
            render={({ pageNumber, totalPages }) =>
              `${pageNumber} / ${totalPages}`
            }
          />
        </Text>
      </Page>
    </Document>
  );
};
