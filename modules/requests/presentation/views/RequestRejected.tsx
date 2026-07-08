import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { usePaginatedCards } from "@/hooks/usePaginatedCards";
import { GetRequestsRejected } from "../../application/getRequestsRejected";
import { RequestsForm } from "../../domain/request";
import { SupabaseRequestsRepository } from "../../infraestructure/requestsDatasurce";
import RequestFilterModal, { EMPTY_REQUEST_FILTERS, RequestFilters } from "../components/ModalFilters";

const repository = new SupabaseRequestsRepository();
const getRequests = new GetRequestsRejected(repository);

export default function RequestsRejected() {
  const [requests, setRequests] = useState<RequestsForm[]>([]);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState<RequestFilters>(
    EMPTY_REQUEST_FILTERS
  );

  const router = useRouter();

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const userData = await AsyncStorage.getItem("user");

      if (!userData) return;

      const user = JSON.parse(userData);

      const data = await getRequests.execute(
        user.numUsuario,
        user.numRol
      );

      setRequests(data);
    } catch (error) {
      console.log("ERROR loading rejected requests:", error);
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
    switch (tipo) {
      case 1:
        return "servicio";
      case 2:
        return "mantenimiento";
      default:
        return "";
    }
  };

  const getTipoMantenimientoText = (tipoMantenimiento?: number | null) => {
    switch (tipoMantenimiento) {
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

  const filteredRequests = requests.filter((request: any) => {
    const tipo = getTipoText(request.numTipo);

    const tipoMantenimiento = getTipoMantenimientoText(
      request.numTipoMantenimiento ?? request.numtipomantenimiento
    );

    const prioridad = normalizeText(
      String(request.prioridad ?? "")
    );

    const fecha = String(request.fecha ?? "");

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
      fecha.includes(filters.fecha);

    return (
      matchesTipo &&
      matchesTipoMantenimiento &&
      matchesPrioridad &&
      matchesFecha
    );
  });

  const paginationResetKey = JSON.stringify(filters);

  const {
    visibleData: visibleRequests,
    loadMore: loadMoreRequests,
  } = usePaginatedCards(
    filteredRequests,
    15,
    paginationResetKey
  );

  const viewRequest = (request: RequestsForm) => {
    router.push({
      pathname: "/viewRequestForm",
      params: {
        request: JSON.stringify(request),
      },
    });
  };

  const renderStatusColor = (status: number) => {
    switch (status) {
      case 5:
        return "#FECACA";
      default:
        return "#6B7280";
    }
  };

  const renderTipo = (tipo: number) => {
    switch (tipo) {
      case 1:
        return "Servicio";
      case 2:
        return "Mantenimiento";
      default:
        return "Desconocido";
    }
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
        </TouchableOpacity>
      </View>

      <FlatList
        data={visibleRequests}
        onEndReached={loadMoreRequests}
        onEndReachedThreshold={0.3}
        initialNumToRender={15}
        maxToRenderPerBatch={15}
        windowSize={7}
        removeClippedSubviews
        keyExtractor={(item) => item.numSolicitud.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => viewRequest(item)}
          >
            <Text style={styles.title}>
              {renderTipo(item.numTipo)}
            </Text>

            <Text style={styles.text}>
              <Text style={styles.label}>Fecha:</Text> {item.fecha}
            </Text>

            <Text style={styles.text}>
              <Text style={styles.label}>Solicitante:</Text>{" "}
              {item.nombreSolicitante ?? "Sin nombre"}
            </Text>

            <Text style={styles.text}>
              <Text style={styles.label}>Motivo: </Text>
              {item.motivoCancelacion ?? "Sin motivo"}
            </Text>

            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: renderStatusColor(item.numStatus),
                },
              ]}
            >
              <Text style={styles.statusText}>
                Cancelada
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>
            No hay solicitudes rechazadas
          </Text>
        }
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
    marginBottom: 5,
  },

  text: {
    fontSize: 14,
    marginBottom: 3,
    color: "#374151",
  },

  statusBadge: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    alignSelf: "flex-start",
  },

  statusText: {
    color: "#991B1B",
    fontWeight: "bold",
  },

  label: {
    fontWeight: "bold",
  },

  empty: {
    textAlign: "center",
    marginTop: 20,
    color: "#6B7280",
  },
});