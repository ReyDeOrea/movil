import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const screenWidth = Dimensions.get("window").width;

export default function ViewRequest() {

  const params = useLocalSearchParams();
  const router = useRouter();
  const [request, setRequest] = useState<any>(null);

  useEffect(() => {
    if (params.request && typeof params.request === "string") {
      try {
        setRequest(JSON.parse(params.request));
      } catch (error) {
        console.log("ERROR parsing request:", error);
      }
    }
  }, [params.request]);

  const statusColors: Record<number, { background: string; text: string }> = {
    1: { background: "#d7d7d7", text: "#6c6c6c" },
    2: { background: "#FEF3C7", text: "#92400E" },
    3: { background: "#DBEAFE", text: "#1E40AF" },
    4: { background: "#D1FAE5", text: "#065F46" },
    5: { background: "#FECACA", text: "#991B1B" },
  };

  const getStatusStyle = (status: number) =>
    statusColors[status] ?? statusColors[1];

  const getStatusName = (status: number) => {
    switch (status) {
      case 1:
        return "Generada";
      case 2:
        return "Asignada";
      case 3:
        return "En proceso";
      case 4:
        return "Terminada";
      case 5:
        return "Cancelada";
      default:
        return "Desconocido";
    }
  };

  const getTipo = (tipo: number) => {
    switch (tipo) {
      case 1:
        return "Servicio";
      case 2:
        return "Mantenimiento";
      default:
        return "N/A";
    }
  };

  const getTipoMantenimiento = (tipo: number) => {
    switch (tipo) {
      case 1:
        return "Preventivo";
      case 2:
        return "Correctivo";
      case 3:
        return "Reactivo";
      default:
        return "N/A";
    }
  };

  const getArea = (area: number) => {
    switch (area) {
      case 1:
        return "Administración";
      case 2:
        return "Fábrica";
      case 3:
        return "Campo";
      case 4:
        return "Zona habitacional";
      default:
        return "N/A";
    }
  };

  if (!request) {
    return (
      <View style={styles.center}>
        <Text>No se encontró la solicitud</Text>
      </View>
    );
  }

  const statusStyle = getStatusStyle(request.numStatus);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView style={styles.container}>

        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialCommunityIcons
              name="arrow-left"
              size={28}
              color="#fff"
            />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Image
              source={require("../../../../assets/images/ZUCARMEX.png")}
              style={styles.imageZucarmex}
              resizeMode="contain"
            />
          </View>
        </View>

        <View style={styles.content}>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Información general</Text>

            <Text style={styles.label}>Solicitante:</Text>
            <Text style={styles.value}>
              {request.solicitante ??
                request.nombreSolicitante ??
                "No disponible"}
            </Text>

            <Text style={styles.label}>Tipo:</Text>
            <Text style={styles.value}>
              {getTipo(request.numTipo)}
            </Text>

            {request.numTipo === 2 && (
              <>
                <Text style={styles.label}>Tipo de mantenimiento:</Text>
                <Text style={styles.value}>
                  {getTipoMantenimiento(request.numTipoMantenimiento)}
                </Text>
              </>
            )}

            <Text style={styles.label}>Fecha:</Text>
            <Text style={styles.value}>{request.fecha}</Text>

            <Text style={styles.label}>Área:</Text>
            <Text style={styles.value}>
              {getArea(request.numArea)}
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Descripción</Text>
            <Text style={styles.value}>
              {request.descripcion}
            </Text>
          </View>

          {request.evidencias?.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Evidencias</Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
              >
                {request.evidencias.map((e: any) => (
                  <Image
                    key={e.idEvidencia}
                    source={{ uri: e.ruta }}
                    style={styles.image}
                  />
                ))}
              </ScrollView>
            </View>
          )}

          {request.comentarios && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Comentarios</Text>
              <Text style={styles.value}>
                {request.comentarios}
              </Text>
            </View>
          )}

          {request.motivoCancelacion && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>
                Motivo de cancelación
              </Text>
              <Text style={styles.value}>
                {request.motivoCancelacion}
              </Text>
            </View>
          )}

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Estado</Text>

            <View
              style={[
                styles.statusBadge,
                { backgroundColor: statusStyle.background },
              ]}
            >
              <Text
                style={{
                  color: statusStyle.text,
                  fontWeight: "bold",
                }}
              >
                {getStatusName(request.numStatus)}
              </Text>
            </View>
          </View>

        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },

  header: {
    backgroundColor: "#148248",
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 15,
  },

  headerCenter: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  imageZucarmex: {
    width: "45%",
    height: 60,
  },

  content: {
    padding: 20,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 16,
    marginBottom: 15,
    elevation: 3,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#111827",
  },

  label: {
    fontWeight: "bold",
    marginTop: 8,
    color: "#374151",
  },

  value: {
    marginBottom: 5,
    marginLeft: 5,
    color: "#4B5563",
  },

  image: {
    width: screenWidth * 0.7,
    height: 220,
    borderRadius: 15,
    marginRight: 10,
  },

  statusBadge: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    alignSelf: "flex-start",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});