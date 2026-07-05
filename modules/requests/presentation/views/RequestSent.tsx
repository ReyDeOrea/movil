import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { GetRequestsBySolicitante } from "../../application/getRequestSent";
import { RequestsForm } from "../../domain/request";
import { SupabaseRequestsRepository } from "../../infraestructure/requestsDatasurce";
import RequestFilterModal, { EMPTY_REQUEST_FILTERS, RequestFilters } from "../components/ModalFilters";


const repository = new SupabaseRequestsRepository();
const getRequests = new GetRequestsBySolicitante(repository);

export default function RequestsSent() {
  const [requests, setRequests] = useState<RequestsForm[]>([]);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState<RequestFilters>(
    EMPTY_REQUEST_FILTERS
  );

  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      loadRequests();
    }, [])
  );

  const loadRequests = async () => {
    try {
      const userData = await AsyncStorage.getItem("user");

      if (!userData) return;

      const user = JSON.parse(userData);

      const data = await getRequests.execute(user.numUsuario);

      setRequests(data ?? []);
    } catch (error) {
      console.log("ERROR loading requests:", error);
    }
  };

  const normalizeText = (text: string) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  };

  const getTipoText = (tipo: number) => {
    switch (Number(tipo)) {
      case 1:
        return "servicio";
      case 2:
        return "mantenimiento";
      default:
        return "";
    }
  };

  const getTipoMantenimientoText = (
    tipoMantenimiento?: number | null
  ) => {
    switch (Number(tipoMantenimiento)) {
      case 1:
        return "correctivo";
      case 2:
        return "preventivo";
      case 3:
        return "reactivo";
      default:
        return "";
    }
  };

  const formatDate = (date?: string | null) => {
    if (!date) return "Sin fecha";

    const cleanDate = String(date).split("T")[0];
    const parts = cleanDate.split("-");

    if (parts.length === 3) {
      const [year, month, day] = parts;
      return `${day}/${month}/${year}`;
    }

    return String(date);
  };

  const filteredRequests = requests.filter((request) => {
    const item = request as any;

    const tipo = getTipoText(
      item.numTipo ??
        item.numtipo ??
        item.num_tipo
    );

    const tipoMantenimiento = getTipoMantenimientoText(
      item.numTipoMantenimiento ??
        item.numtipomantenimiento ??
        item.num_tipo_mantenimiento
    );

    const prioridad = normalizeText(
      String(item.prioridad ?? "")
    );

    const fechaOriginal = String(
      item.fecha ??
        item.fechaSolicitud ??
        item.fechasolicitud ??
        ""
    );

    const fechaFormateada = formatDate(fechaOriginal);

    const matchesTipo =
      filters.tipo === "" || tipo.includes(filters.tipo);

    const matchesTipoMantenimiento =
      filters.tipoMantenimiento === "" ||
      tipoMantenimiento.includes(filters.tipoMantenimiento);

    const matchesPrioridad =
      filters.prioridad === "" ||
      prioridad.includes(filters.prioridad);

    const matchesFecha =
      filters.fecha === "" ||
      fechaOriginal.includes(filters.fecha) ||
      fechaFormateada.includes(filters.fecha);

    return (
      matchesTipo &&
      matchesTipoMantenimiento &&
      matchesPrioridad &&
      matchesFecha
    );
  });

  const activeFiltersCount = Object.values(filters).filter(
    (value) => value.trim() !== ""
  ).length;

  const cancelarSolicitud = async (numSolicitud: number) => {
    Alert.alert(
      "Cancelar solicitud",
      "¿Estás seguro de que deseas cancelar esta solicitud?",
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Sí",
          style: "destructive",
          onPress: async () => {
            try {
              await repository.rejectRequest(
                numSolicitud,
                "Cancelada por el usuario"
              );

              Alert.alert(
                "Éxito",
                "La solicitud ha sido cancelada correctamente."
              );

              loadRequests();
            } catch (error: any) {
              Alert.alert(
                "Error",
                error.message || "No fue posible cancelar la solicitud."
              );
            }
          },
        },
      ]
    );
  };

  const viewRequest = (request: RequestsForm) => {
    router.push({
      pathname: "/viewRequestForm",
      params: {
        request: JSON.stringify(request),
      },
    });
  };

  const statusColors: Record<number, { background: string; text: string }> = {
    1: { background: "#d7d7d7", text: "#6c6c6c" },
    2: { background: "#FEF3C7", text: "#92400E" },
    3: { background: "#DBEAFE", text: "#1E40AF" },
    4: { background: "#D1FAE5", text: "#065F46" },
    5: { background: "#FECACA", text: "#991B1B" },
  };

  const getStatusStyle = (status: number) =>
    statusColors[status] ?? {
      background: "#6B7280",
      text: "#fff",
    };

  const getStatusName = (estado: number) => {
    switch (Number(estado)) {
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
    switch (Number(tipo)) {
      case 1:
        return "Servicio";
      case 2:
        return "Mantenimiento";
      default:
        return "Desconocido";
    }
  };

  const getTecnicoAsignado = (item: RequestsForm) => {
    if (item.tecnicoAsignado) {
      return item.tecnicoAsignado;
    }

    if (item.tecnicos && item.tecnicos.length > 0) {
      return item.tecnicos
        .map((tecnico) => tecnico.nombre)
        .join(", ");
    }

    return "No asignado";
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerFilters}>


        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setFilterModalOpen(true)}
        >
          <MaterialCommunityIcons
            name="filter-variant"
            size={24}
            color="#148248"
          />

          {activeFiltersCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>
                {activeFiltersCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredRequests}
        keyExtractor={(item) => item.numSolicitud.toString()}
        renderItem={({ item }) => {
          const statusStyle = getStatusStyle(item.numStatus);

          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => viewRequest(item)}
              activeOpacity={0.85}
            >
              <Text style={styles.title}>
                {getTipo(item.numTipo)}
              </Text>

              <Text style={styles.text}>
                <Text style={styles.label}>Fecha:</Text>{" "}
                {formatDate(item.fecha)}
              </Text>

              {(item as any).prioridad && (
                <Text style={styles.text}>
                  <Text style={styles.label}>Prioridad:</Text>{" "}
                  {(item as any).prioridad}
                </Text>
              )}

              <Text style={styles.text}>
                <Text style={styles.label}>Descripción:</Text>{" "}
                {item.descripcion}
              </Text>

              {item.numStatus >= 2 && (
                <Text style={styles.text}>
                  <Text style={styles.label}>Técnico asignado:</Text>{" "}
                  {getTecnicoAsignado(item)}
                </Text>
              )}

              <View style={styles.rowBetween}>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: statusStyle.background,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: statusStyle.text,
                      fontWeight: "bold",
                    }}
                  >
                    {getStatusName(item.numStatus)}
                  </Text>
                </View>
              </View>

              {item.numStatus === 1 && (
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={(event) => {
                    event.stopPropagation();
                    cancelarSolicitud(item.numSolicitud);
                  }}
                >
                  <Text style={styles.cancelButtonText}>
                    Cancelar solicitud
                  </Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No has enviado solicitudes
          </Text>
        }
        contentContainerStyle={{
          paddingBottom: 10,
          flexGrow: 1,
        }}
      />

      <RequestFilterModal
        visible={filterModalOpen}
        filters={filters}
        setFilters={setFilters}
        onClose={() => setFilterModalOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    padding: 10,
  },

  headerFilters: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  screenTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },

  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#EAF7EF",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },

  filterBadge: {
    position: "absolute",
    top: -3,
    right: -3,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#EF4444",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },

  filterBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "bold",
  },

  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 3,
  },

  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#111827",
  },

  text: {
    fontSize: 14,
    marginBottom: 3,
    color: "#374151",
  },

  label: {
    fontWeight: "bold",
  },

  cancelButton: {
    backgroundColor: "#870c0c",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 40,
    marginTop: 12,
  },

  cancelButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginTop: 10,
  },

  statusBadge: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    alignSelf: "flex-start",
  },

  emptyText: {
    marginTop: 50,
    textAlign: "center",
    fontSize: 16,
    color: "#6B7280",
  },
});