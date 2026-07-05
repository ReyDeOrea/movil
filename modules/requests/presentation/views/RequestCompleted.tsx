import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { GetRequestsCompleted } from "../../application/getRequestCompleted";
import { RequestsForm } from "../../domain/request";
import { SupabaseRequestsRepository } from "../../infraestructure/requestsDatasurce";
import RequestFilterModal, { EMPTY_REQUEST_FILTERS, RequestFilters } from "../components/ModalFilters";


const repository = new SupabaseRequestsRepository();
const getRequests = new GetRequestsCompleted(repository);

const ROL_TECNICO = 3;

export default function RequestsCompleted() {
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

  const getValue = (obj: any, ...keys: string[]) => {
    for (const key of keys) {
      if (
        obj &&
        obj[key] !== undefined &&
        obj[key] !== null &&
        obj[key] !== ""
      ) {
        return obj[key];
      }
    }

    return undefined;
  };

  const normalizeText = (text: string) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  };

  const isAssignedToCurrentTecnico = (
    request: any,
    user: any,
    numUsuario: number
  ) => {
    const userName = normalizeText(
      String(
        getValue(
          user,
          "nombre",
          "name",
          "username",
          "nombreUsuario",
          "nombreusuario"
        ) ?? ""
      )
    );

    const directTecnicoId = Number(
      getValue(
        request,
        "numTecnico",
        "numtecnico",
        "numTecnicoInterno",
        "numtecnicointerno",
        "numUsuarioTecnico",
        "numusuariotecnico",
        "numUsuarioAsignado",
        "numusuarioasignado"
      )
    );

    if (directTecnicoId === numUsuario) {
      return true;
    }

    const tecnicos = getValue(
      request,
      "tecnicos",
      "tecnicosAsignados",
      "tecnicos_asignados"
    );

    if (Array.isArray(tecnicos)) {
      return tecnicos.some((tecnico: any) => {
        const tecnicoId = Number(
          getValue(
            tecnico,
            "numUsuario",
            "numusuario",
            "num_usuario",
            "id",
            "idUsuario",
            "idusuario"
          )
        );

        const tecnicoName = normalizeText(
          String(
            getValue(
              tecnico,
              "nombre",
              "name",
              "nombreTecnico",
              "nombretecnico"
            ) ?? ""
          )
        );

        return (
          tecnicoId === numUsuario ||
          (userName !== "" && tecnicoName === userName)
        );
      });
    }

    const tecnicoAsignado = normalizeText(
      String(
        getValue(
          request,
          "tecnicoAsignado",
          "tecnicoasignado",
          "nombreTecnico",
          "nombretecnico"
        ) ?? ""
      )
    );

    if (userName !== "" && tecnicoAsignado !== "") {
      return (
        tecnicoAsignado === userName ||
        tecnicoAsignado.includes(userName)
      );
    }

    return false;
  };

  const loadRequests = async () => {
    try {
      const userData = await AsyncStorage.getItem("user");

      if (!userData) {
        setRequests([]);
        return;
      }

      const user = JSON.parse(userData);

      const numUsuario = Number(
        getValue(
          user,
          "numUsuario",
          "numusuario",
          "num_usuario",
          "id"
        )
      );

      const numRol = Number(
        getValue(
          user,
          "numRol",
          "numrol",
          "num_rol"
        )
      );

      const data = await getRequests.execute(
        numUsuario,
        numRol
      );

      const solicitudesCompletadas = (data ?? []).filter((item: any) => {
        const status = Number(
          getValue(
            item,
            "numStatus",
            "numstatus",
            "num_status"
          )
        );

        return status === 4;
      });

      if (numRol === ROL_TECNICO) {
        const solicitudesDelTecnico = solicitudesCompletadas.filter(
          (item: any) =>
            isAssignedToCurrentTecnico(
              item,
              user,
              numUsuario
            )
        );

        setRequests(solicitudesDelTecnico);
        return;
      }

      setRequests(solicitudesCompletadas);
    } catch (error) {
      console.log("ERROR loading completed requests:", error);
      setRequests([]);
    }
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
      getValue(
        item,
        "numTipo",
        "numtipo",
        "num_tipo"
      )
    );

    const tipoMantenimiento = getTipoMantenimientoText(
      getValue(
        item,
        "numTipoMantenimiento",
        "numtipomantenimiento",
        "num_tipo_mantenimiento"
      )
    );

    const prioridad = normalizeText(
      String(getValue(item, "prioridad") ?? "")
    );

    const fechaOriginal = String(
      getValue(
        item,
        "fecha",
        "fechaSolicitud",
        "fechasolicitud"
      ) ?? ""
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

  const viewRequest = (request: RequestsForm) => {
    router.push({
      pathname: "/viewRequestForm",
      params: {
        request: JSON.stringify(request),
      },
    });
  };

  const renderStatusColor = (status: number) => {
    switch (Number(status)) {
      case 4:
        return "#BBF7D0";
      default:
        return "#E5E7EB";
    }
  };

  const renderStatusTextColor = (status: number) => {
    switch (Number(status)) {
      case 4:
        return "#166534";
      default:
        return "#374151";
    }
  };

  const renderStatusText = (status: number) => {
    switch (Number(status)) {
      case 4:
        return "Completada";
      default:
        return "Desconocido";
    }
  };

  const renderTipo = (tipo: number) => {
    switch (Number(tipo)) {
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
        keyExtractor={(item) =>
          String(
            (item as any).numSolicitud ??
              (item as any).numsolicitud
          )
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => viewRequest(item)}
            activeOpacity={0.85}
          >
            <Text style={styles.title}>
              {renderTipo(
                (item as any).numTipo ??
                  (item as any).numtipo
              )}
            </Text>

            <Text style={styles.text}>
              <Text style={styles.label}>Fecha:</Text>{" "}
              {formatDate((item as any).fecha)}
            </Text>

            <Text style={styles.text}>
              <Text style={styles.label}>Solicitante:</Text>{" "}
              {(item as any).nombreSolicitante ?? "Sin nombre"}
            </Text>

            {(item as any).prioridad && (
              <Text style={styles.text}>
                <Text style={styles.label}>Prioridad:</Text>{" "}
                {(item as any).prioridad}
              </Text>
            )}

            <Text style={styles.text}>
              <Text style={styles.label}>Finalizó:</Text>{" "}
              {formatDate(
                (item as any).fechaFinReal ??
                  (item as any).fechafinreal
              )}
            </Text>

            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: renderStatusColor(
                    (item as any).numStatus ??
                      (item as any).numstatus
                  ),
                },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  {
                    color: renderStatusTextColor(
                      (item as any).numStatus ??
                        (item as any).numstatus
                    ),
                  },
                ]}
              >
                {renderStatusText(
                  (item as any).numStatus ??
                    (item as any).numstatus
                )}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>
            No hay solicitudes completadas
          </Text>
        }
        contentContainerStyle={{
          paddingBottom: 100,
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
    marginBottom: 5,
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

  statusBadge: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    alignSelf: "flex-start",
  },

  statusText: {
    fontWeight: "bold",
  },

  empty: {
    textAlign: "center",
    marginTop: 20,
    color: "#6B7280",
  },
});