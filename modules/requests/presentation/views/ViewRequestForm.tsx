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
    1: { background: "#FEF3C7", text: "#92400E" },
    2: { background: "#DBEAFE", text: "#1E40AF" },
    3: { background: "#EDE9FE", text: "#5B21B6" },
    4: { background: "#D1FAE5", text: "#065F46" },
    5: { background: "#FECACA", text: "#991B1B" },
  };

  const getStatusStyle = (status: number) =>
    statusColors[status] ?? statusColors[1];

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
            <MaterialCommunityIcons name="arrow-left" size={28} color="#fff" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.title}>Solicitud</Text>
            <MaterialCommunityIcons name="clipboard-text" size={28} color="#fff" />
          </View>
        </View>

        <View style={styles.content}>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Información general</Text>

            <Text style={styles.label}>Tipo:</Text>
            <Text style={styles.value}>{request.numTipo}</Text>

            <Text style={styles.label}>Tipo mantenimiento:</Text>
            <Text style={styles.value}>
              {request.numTipoMantenimiento ?? "N/A"}
            </Text>

            <Text style={styles.label}>Fecha:</Text>
            <Text style={styles.value}>{request.fecha}</Text>

            <Text style={styles.label}>Área:</Text>
            <Text style={styles.value}>{request.numArea}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Descripción</Text>
            <Text style={styles.value}>{request.descripcion}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Evidencias</Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {request.evidencias?.map((e: any) => (
                <Image
                  key={e.idEvidencia}
                  source={{ uri: e.ruta }}
                  style={styles.image}
                />
              ))}
            </ScrollView>
          </View>

          {request.comentarios && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Comentarios</Text>
              <Text style={styles.value}>{request.comentarios}</Text>
            </View>
          )}

          {request.motivoCancelacion && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Motivo rechazo</Text>
              <Text style={styles.value}>{request.motivoCancelacion}</Text>
            </View>
          )}

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Estado</Text>

            <View style={[
              styles.statusBadge,
              { backgroundColor: statusStyle.background }
            ]}>
              <Text style={{ color: statusStyle.text, fontWeight: "bold" }}>
                {request.numStatus}
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
    backgroundColor: "#F3F4F6",
  },

  header: {
    backgroundColor: "#4F46E5",
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

  title: {
    fontSize: 28,
    color: "#fff",
    fontWeight: "bold",
    marginRight: 8,
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
    marginTop: 5,
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