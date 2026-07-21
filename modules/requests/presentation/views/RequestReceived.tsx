import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

import { usePaginatedCards } from "@/hooks/usePaginatedCards";
import { CancelRequestUseCase } from "../../application/cancelRequest";
import { GetAllRequests } from "../../application/getRequestRecived";
import { RequestsForm } from "../../domain/request";
import { SupabaseRequestsRepository } from "../../infraestructure/requestsDatasurce";
import RequestFilterModal, {
  EMPTY_REQUEST_FILTERS,
  RequestFilters,
} from "../components/ModalFilters";

const repository = new SupabaseRequestsRepository();
const getRequests = new GetAllRequests(repository);
const cancelRequest = new CancelRequestUseCase(repository);

export default function RequestsReceived() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();

  const [requests, setRequests] =
    useState<RequestsForm[]>([]);

  const [
    modalRechazoVisible,
    setModalRechazoVisible,
  ] = useState(false);

  const [
    motivoCancelacion,
    setMotivoCancelacion,
  ] = useState("");

  const [
    solicitudSeleccionada,
    setSolicitudSeleccionada,
  ] = useState<RequestsForm | null>(null);

  const [
    filterModalOpen,
    setFilterModalOpen,
  ] = useState(false);

  const [filters, setFilters] =
    useState<RequestFilters>(
      EMPTY_REQUEST_FILTERS
    );

  /*
   * Valores utilizados únicamente para
   * adaptar la interfaz.
   */
  const isSmallScreen =
    width < 370 || height < 650;

  const isTablet = width >= 700;
  const useGrid = width >= 760;

  const horizontalPadding =
    isTablet ? 18 : 10;

  const modalWidth = Math.max(
    280,
    Math.min(
      width - (isTablet ? 120 : 32),
      560
    )
  );

  useFocusEffect(
    useCallback(() => {
      loadRequests();
    }, [])
  );

  const loadRequests = async () => {
    try {
      const data =
        await getRequests.execute();

      setRequests(data ?? []);
    } catch (error) {
      console.log(
        "ERROR loading requests:",
        error
      );
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
        return "preventivo";

      case 2:
        return "correctivo";

      case 3:
        return "reactivo";

      default:
        return "";
    }
  };

  const formatDate = (
    date?: string | null
  ) => {
    if (!date) return "Sin fecha";

    const cleanDate =
      String(date).split("T")[0];

    const parts = cleanDate.split("-");

    if (parts.length === 3) {
      const [year, month, day] = parts;

      return `${day}/${month}/${year}`;
    }

    return String(date);
  };

  const normalizarFechaFiltro = (
    date?: string | null
  ) => {
    if (!date) return "";

    return String(date).split(/[T ]/)[0];
  };

  const fechaEstaEnRango = (
    fechaItem: string | null | undefined,
    fechaInicio: string,
    fechaFin: string
  ) => {
    if (!fechaInicio && !fechaFin) {
      return true;
    }

    const fecha =
      normalizarFechaFiltro(fechaItem);

    if (!fecha) {
      return false;
    }

    if (
      fechaInicio &&
      fecha < fechaInicio
    ) {
      return false;
    }

    if (
      fechaFin &&
      fecha > fechaFin
    ) {
      return false;
    }

    return true;
  };

  const filteredRequests =
    requests.filter((request) => {
      const item = request as any;

      const tipo = getTipoText(
        item.numTipo ??
          item.numtipo ??
          item.num_tipo
      );

      const tipoMantenimiento =
        getTipoMantenimientoText(
          item.numTipoMantenimiento ??
            item.numtipomantenimiento ??
            item.num_tipo_mantenimiento
        );

      const prioridad = normalizeText(
        String(item.prioridad ?? "")
      );

      const fechaSolicitud = String(
        item.fecha ??
          item.fechaSolicitud ??
          item.fechasolicitud ??
          item.fecha_solicitud ??
          ""
      );

      const fechaCompletada = String(
        item.fechafinreal ??
          item.fechaFinReal ??
          item.fecha_fin_real ??
          item.fechaCompletada ??
          item.fechacompletada ??
          item.fecha_completada ??
          ""
      );

      const matchesTipo =
        filters.tipo === "" ||
        tipo.includes(filters.tipo);

      const matchesTipoMantenimiento =
        filters.tipoMantenimiento === "" ||
        tipoMantenimiento.includes(
          filters.tipoMantenimiento
        );

      const matchesPrioridad =
        filters.prioridad === "" ||
        prioridad.includes(
          filters.prioridad
        );

      const matchesFechaSolicitud =
        fechaEstaEnRango(
          fechaSolicitud,
          filters.fechaInicio,
          filters.fechaFin
        );

      const matchesFechaCompletada =
        fechaEstaEnRango(
          fechaCompletada,
          filters.fechaCompletadaInicio,
          filters.fechaCompletadaFin
        );

      return (
        matchesTipo &&
        matchesTipoMantenimiento &&
        matchesPrioridad &&
        matchesFechaSolicitud &&
        matchesFechaCompletada
      );
    });

  const paginationResetKey =
    JSON.stringify(filters);

  const {
    visibleData: visibleRequests,
    loadMore: loadMoreRequests,
  } = usePaginatedCards(
    filteredRequests,
    15,
    paginationResetKey
  );

  const activeFiltersCount =
    Object.values(filters).filter(
      (value) => value.trim() !== ""
    ).length;

  const abrirModalRechazo = (
    request: RequestsForm
  ) => {
    setSolicitudSeleccionada(request);
    setMotivoCancelacion("");
    setModalRechazoVisible(true);
  };

  const cerrarModalRechazo = () => {
    setModalRechazoVisible(false);
    setSolicitudSeleccionada(null);
    setMotivoCancelacion("");
  };

  const confirmarRechazo = async () => {
    try {
      if (!solicitudSeleccionada) {
        Alert.alert(
          "Error",
          "No se encontró la solicitud seleccionada"
        );

        return;
      }

      await cancelRequest.execute(
        solicitudSeleccionada.numSolicitud,
        motivoCancelacion
      );

      Alert.alert(
        "Solicitud rechazada correctamente"
      );

      cerrarModalRechazo();

      await loadRequests();
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message ||
          "No se pudo rechazar la solicitud"
      );
    }
  };

  const aceptar = async (
    request: RequestsForm
  ) => {
    router.push({
      pathname: "/formAdmin",
      params: {
        request: JSON.stringify(request),
      },
    });
  };

  const viewRequest = (
    request: RequestsForm
  ) => {
    router.push({
      pathname: "/viewRequestForm",
      params: {
        request: JSON.stringify(request),
      },
    });
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

  const getTipoIcon = (tipo: number) => {
    switch (Number(tipo)) {
      case 1:
        return "clipboard-text-outline";

      case 2:
        return "tools";

      default:
        return "file-document-outline";
    }
  };

  const statusColors: Record<
    number,
    {
      background: string;
      text: string;
    }
  > = {
    1: {
      background: "#E5E7EB",
      text: "#4B5563",
    },

    2: {
      background: "#FEF3C7",
      text: "#92400E",
    },

    3: {
      background: "#DBEAFE",
      text: "#1E40AF",
    },

    4: {
      background: "#D1FAE5",
      text: "#065F46",
    },

    5: {
      background: "#FECACA",
      text: "#991B1B",
    },
  };

  const getStatusStyle = (
    status: number
  ) =>
    statusColors[status] ?? {
      background: "#6B7280",
      text: "#FFFFFF",
    };

  /*
   * Colores utilizados en el cuadro
   * completo de prioridad.
   */
  const priorityColors: Record<
    string,
    {
      background: string;
      text: string;
      border: string;
    }
  > = {
    baja: {
      background: "#ECFDF5",
      text: "#065F46",
      border: "#A7F3D0",
    },

    media: {
      background: "#FFFBEB",
      text: "#92400E",
      border: "#FDE68A",
    },

    alta: {
      background: "#ffeded",
      text: "#c21010",
      border: "#fd7474",
    },
  };

  const getPriorityStyle = (
    priority?: string | null
  ) => {
    const normalizedPriority =
      normalizeText(
        String(priority ?? "")
      );

    return (
      priorityColors[normalizedPriority] ?? {
        background: "#F3F4F6",
        text: "#4B5563",
        border: "#D1D5DB",
      }
    );
  };

  const getPriorityIcon = (
    priority?: string | null
  ) => {
    const normalizedPriority =
      normalizeText(
        String(priority ?? "")
      );

    switch (normalizedPriority) {
      case "baja":
        return "arrow-down-circle-outline";

      case "media":
        return "flag-outline";

      case "alta":
        return "alert-circle-outline";

      case "urgente":
        return "alert-octagon-outline";

      default:
        return "flag-outline";
    }
  };

  const canTakeAction = (
    status: number
  ) => {
    return status === 1;
  };

  const getStatusName = (
    estado: number
  ) => {
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

  const getStatusIcon = (
    estado: number
  ) => {
    switch (Number(estado)) {
      case 1:
        return "file-document-outline";

      case 2:
        return "account-check-outline";

      case 3:
        return "clock-outline";

      case 4:
        return "check-circle-outline";

      case 5:
        return "close-circle-outline";

      default:
        return "help-circle-outline";
    }
  };

  const getTecnicoAsignado = (
    item: RequestsForm
  ) => {
    if (item.tecnicoAsignado) {
      return item.tecnicoAsignado;
    }

    if (
      item.tecnicos &&
      item.tecnicos.length > 0
    ) {
      return item.tecnicos
        .map(
          (tecnico) => tecnico.nombre
        )
        .join(", ");
    }

    return "No asignado";
  };

  const renderRequest = ({
    item,
  }: {
    item: RequestsForm;
  }) => {
    const statusStyle =
      getStatusStyle(item.numStatus);

    const prioridad = String(
      (item as any).prioridad ?? ""
    ).trim();

    const priorityStyle =
      getPriorityStyle(prioridad);

    return (
      <TouchableOpacity
        onPress={() => viewRequest(item)}
        style={[
          styles.card,
          useGrid && styles.cardGrid,
          isSmallScreen &&
            styles.cardSmall,
        ]}
        activeOpacity={0.86}
        accessibilityLabel={`Ver solicitud ${item.numSolicitud}`}
      >
        {/* Encabezado */}
        <View style={styles.cardHeader}>
          <View
            style={styles.cardIconContainer}
          >
            <MaterialCommunityIcons
              name={
                getTipoIcon(
                  item.numTipo
                ) as any
              }
              size={27}
              color="#148248"
            />
          </View>

          <View
            style={styles.cardTitleContainer}
          >
            <Text
              style={styles.title}
              numberOfLines={1}
            >
              {getTipo(item.numTipo)}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Fecha y solicitante */}
        <View style={styles.informationRow}>
          <View
            style={[
              styles.informationBox,
              styles.informationBoxLeft,
            ]}
          >
            <View
              style={styles.informationIcon}
            >
              <MaterialCommunityIcons
                name="calendar-outline"
                size={18}
                color="#148248"
              />
            </View>

            <View
              style={
                styles.informationTextContainer
              }
            >
              <Text
                style={styles.informationLabel}
              >
                Fecha
              </Text>

              <Text
                style={styles.informationValue}
                numberOfLines={1}
              >
                {formatDate(item.fecha)}
              </Text>
            </View>
          </View>

          <View style={styles.informationBox}>
            <View
              style={styles.informationIcon}
            >
              <MaterialCommunityIcons
                name="account-outline"
                size={18}
                color="#148248"
              />
            </View>

            <View
              style={
                styles.informationTextContainer
              }
            >
              <Text
                style={styles.informationLabel}
              >
                Solicitante
              </Text>

              <Text
                style={styles.informationValue}
                numberOfLines={1}
              >
                {item.nombreSolicitante ??
                  "Sin nombre"}
              </Text>
            </View>
          </View>
        </View>

        {/* Descripción */}
        <View
          style={styles.descriptionContainer}
        >
          <View style={styles.descriptionHeader}>
            <MaterialCommunityIcons
              name="text-box-outline"
              size={18}
              color="#68736E"
            />

            <Text
              style={styles.descriptionLabel}
            >
              Descripción
            </Text>
          </View>

          <Text
            style={styles.descriptionText}
            numberOfLines={4}
          >
            {item.descripcion ||
              "Sin descripción"}
          </Text>
        </View>

        {/* Cuadro completo de prioridad */}
        {!!prioridad && (
          <View
            style={[
              styles.detailRow,
              {
                backgroundColor:
                  priorityStyle.background,
                borderColor:
                  priorityStyle.border,
              },
            ]}
          >
            <View
              style={[
                styles.detailIconContainer,
                styles.priorityIconContainer,
              ]}
            >
              <MaterialCommunityIcons
                name={
                  getPriorityIcon(
                    prioridad
                  ) as any
                }
                size={19}
                color={priorityStyle.text}
              />
            </View>

            <View
              style={
                styles.detailTextContainer
              }
            >
              <Text
                style={[
                  styles.detailLabel,
                  {
                    color:
                      priorityStyle.text,
                  },
                ]}
              >
                Prioridad
              </Text>

              <Text
                style={[
                  styles.detailValue,
                  styles.priorityValue,
                  {
                    color:
                      priorityStyle.text,
                  },
                ]}
                numberOfLines={1}
              >
                {prioridad}
              </Text>
            </View>
          </View>
        )}

        {/* Técnico */}
        {item.numStatus >= 2 && (
          <View style={styles.detailRow}>
            <View
              style={
                styles.detailIconContainer
              }
            >
              <MaterialCommunityIcons
                name="account-hard-hat-outline"
                size={18}
                color="#148248"
              />
            </View>

            <View
              style={
                styles.detailTextContainer
              }
            >
              <Text style={styles.detailLabel}>
                Técnico asignado
              </Text>

              <Text
                style={styles.detailValue}
                numberOfLines={2}
              >
                {getTecnicoAsignado(item)}
              </Text>
            </View>
          </View>
        )}

        {/* Estado */}
        <View style={styles.statusSection}>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  statusStyle.background,
              },
            ]}
          >
            <MaterialCommunityIcons
              name={
                getStatusIcon(
                  item.numStatus
                ) as any
              }
              size={16}
              color={statusStyle.text}
            />

            <Text
              style={[
                styles.statusText,
                {
                  color: statusStyle.text,
                },
              ]}
            >
              {getStatusName(
                item.numStatus
              )}
            </Text>
          </View>
        </View>

        {/* Acciones */}
        {canTakeAction(
          item.numStatus
        ) && (
          <View
            style={[
              styles.buttonsContainer,
              isSmallScreen &&
                styles.buttonsContainerSmall,
            ]}
          >
            <TouchableOpacity
              onPress={() => aceptar(item)}
              style={[
                styles.button,
                styles.accept,
                !isSmallScreen &&
                  styles.acceptSpacing,
              ]}
              activeOpacity={0.82}
              accessibilityLabel="Aceptar solicitud"
            >
              <Text
                style={styles.buttonText}
              >
                Aceptar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                abrirModalRechazo(item)
              }
              style={[
                styles.button,
                styles.reject,
                isSmallScreen &&
                  styles.rejectSmall,
              ]}
              activeOpacity={0.82}
              accessibilityLabel="Rechazar solicitud"
            >
              <Text
                style={styles.buttonText}
              >
                Rechazar
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Resumen y filtro */}
      <View style={styles.headerFilters}>
        <View style={styles.resultsContainer}>
          <View style={styles.resultsIcon}>
            <MaterialCommunityIcons
              name="inbox-arrow-down-outline"
              size={22}
              color="#148248"
            />
          </View>

          <View
            style={styles.resultsTextContainer}
          >
            <Text style={styles.resultsTitle}>
              Solicitudes recibidas
            </Text>

            <Text style={styles.resultsText}>
              {filteredRequests.length}{" "}
              {filteredRequests.length === 1
                ? "resultado"
                : "resultados"}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFiltersCount > 0 &&
              styles.filterButtonActive,
          ]}
          onPress={() =>
            setFilterModalOpen(true)
          }
          activeOpacity={0.8}
          accessibilityLabel="Abrir filtros"
        >
          <MaterialCommunityIcons
            name="filter-variant"
            size={23}
            color={
              activeFiltersCount > 0
                ? "#FFFFFF"
                : "#148248"
            }
          />

          {!isSmallScreen && (
            <Text
              style={[
                styles.filterButtonText,
                activeFiltersCount > 0 &&
                  styles.filterButtonTextActive,
              ]}
            >
              Filtros
            </Text>
          )}

          {activeFiltersCount > 0 && (
            <View style={styles.filterBadge}>
              <Text
                style={
                  styles.filterBadgeText
                }
              >
                {activeFiltersCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Filtros activos */}
      {activeFiltersCount > 0 && (
        <View style={styles.activeFiltersBar}>
          <MaterialCommunityIcons
            name="filter-check-outline"
            size={18}
            color="#148248"
          />

          <Text
            style={styles.activeFiltersText}
          >
            {activeFiltersCount}{" "}
            {activeFiltersCount === 1
              ? "filtro activo"
              : "filtros activos"}
          </Text>

          <TouchableOpacity
            style={styles.clearFiltersButton}
            onPress={() =>
              setFilters(
                EMPTY_REQUEST_FILTERS
              )
            }
            activeOpacity={0.75}
          >
            <Text
              style={styles.clearFiltersText}
            >
              Limpiar
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Lista */}
      <FlatList
        key={useGrid ? "grid" : "list"}
        data={visibleRequests}
        numColumns={useGrid ? 2 : 1}
        columnWrapperStyle={
          useGrid
            ? styles.columnWrapper
            : undefined
        }
        onEndReached={loadMoreRequests}
        onEndReachedThreshold={0.3}
        initialNumToRender={15}
        maxToRenderPerBatch={15}
        windowSize={7}
        removeClippedSubviews
        keyExtractor={(item) =>
          item.numSolicitud.toString()
        }
        renderItem={renderRequest}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBox}>
              <MaterialCommunityIcons
                name="inbox-outline"
                size={58}
                color="#148248"
              />
            </View>

            <Text style={styles.emptyTitle}>
              No hay solicitudes
            </Text>

            <Text style={styles.emptyText}>
              {activeFiltersCount > 0
                ? "No hay solicitudes que coincidan con los filtros seleccionados."
                : "Las nuevas solicitudes recibidas aparecerán aquí."}
            </Text>

            {activeFiltersCount > 0 && (
              <TouchableOpacity
                style={
                  styles.emptyClearButton
                }
                onPress={() =>
                  setFilters(
                    EMPTY_REQUEST_FILTERS
                  )
                }
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons
                  name="filter-remove-outline"
                  size={20}
                  color="#148248"
                />

                <Text
                  style={
                    styles.emptyClearButtonText
                  }
                >
                  Limpiar filtros
                </Text>
              </TouchableOpacity>
            )}
          </View>
        }
        contentContainerStyle={[
          styles.listContent,
          {
            paddingHorizontal:
              horizontalPadding,
          },
          visibleRequests.length === 0 &&
            styles.emptyListContent,
        ]}
      />

      <RequestFilterModal
        visible={filterModalOpen}
        filters={filters}
        setFilters={setFilters}
        onClose={() =>
          setFilterModalOpen(false)
        }
      />

      {/* Modal para rechazar */}
      <Modal
        visible={modalRechazoVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={
          cerrarModalRechazo
        }
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              {
                width: modalWidth,
              },
            ]}
          >
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.modalHeader}>
                <View
                  style={
                    styles.modalIconContainer
                  }
                >
                  <MaterialCommunityIcons
                    name="close-circle-outline"
                    size={34}
                    color="#991B1B"
                  />
                </View>

                <Text style={styles.modalTitle}>
                  Rechazar solicitud
                </Text>

                <Text style={styles.modalText}>
                  Escribe el motivo por el cual se
                  rechazará esta solicitud.
                </Text>
              </View>
              <Text
                style={styles.modalInputLabel}
              >
                Motivo del rechazo
              </Text>

              <View
                style={styles.modalTextAreaBox}
              >
                <MaterialCommunityIcons
                  name="text-box-edit-outline"
                  size={21}
                  color="#991B1B"
                  style={
                    styles.modalTextAreaIcon
                  }
                />

                <TextInput
                  style={styles.modalTextArea}
                  placeholder="Escribe el motivo de cancelación"
                  placeholderTextColor="#9CA3AF"
                  multiline
                  value={motivoCancelacion}
                  onChangeText={
                    setMotivoCancelacion
                  }
                  textAlignVertical="top"
                />
              </View>

              <View
                style={[
                  styles.modalButtons,
                  isSmallScreen &&
                    styles.modalButtonsSmall,
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.modalActionButton,
                    styles.modalCancelButton,
                    !isSmallScreen &&
                      styles.modalButtonSpacing,
                  ]}
                  onPress={
                    cerrarModalRechazo
                  }
                  activeOpacity={0.82}
                >
                  <Text
                    style={
                      styles.modalButtonText
                    }
                  >
                    Cerrar
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modalActionButton,
                    styles.modalRejectButton,
                    isSmallScreen &&
                      styles.modalRejectButtonSmall,
                  ]}
                  onPress={confirmarRechazo}
                  activeOpacity={0.82}
                >
                  <Text
                    style={
                      styles.modalButtonText
                    }
                  >
                    Rechazar
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    minHeight: 0,
    backgroundColor: "#F1F5F3",
  },

  headerFilters: {
    width: "100%",
    minHeight: 63,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    marginBottom: 8,
  },

  resultsContainer: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },

  resultsIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8F3ED",
    borderWidth: 1,
    borderColor: "#D6EADF",
    marginRight: 10,
    flexShrink: 0,
  },

  resultsTextContainer: {
    flex: 1,
    minWidth: 0,
  },

  resultsTitle: {
    color: "#26322C",
    fontSize: 15,
    fontWeight: "800",
  },

  resultsText: {
    color: "#748079",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },

  filterButton: {
    minWidth: 48,
    height: 46,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    backgroundColor: "#E8F3ED",
    borderWidth: 1,
    borderColor: "#D6EADF",
    borderRadius: 14,
    paddingHorizontal: 11,
  },

  filterButtonActive: {
    backgroundColor: "#148248",
    borderColor: "#148248",

    ...Platform.select({
      android: {
        elevation: 2,
      },

      ios: {
        shadowColor: "#148248",
        shadowOpacity: 0.2,
        shadowRadius: 5,
        shadowOffset: {
          width: 0,
          height: 2,
        },
      },
    }),
  },

  filterButtonText: {
    color: "#148248",
    fontSize: 13,
    fontWeight: "800",
    marginLeft: 6,
  },

  filterButtonTextActive: {
    color: "#FFFFFF",
  },

  filterBadge: {
    position: "absolute",
    top: -6,
    right: -5,
    minWidth: 21,
    height: 21,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#EF4444",
    borderWidth: 2,
    borderColor: "#F1F5F3",
    borderRadius: 11,
    paddingHorizontal: 4,
  },

  filterBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
  },

  activeFiltersBar: {
    minHeight: 41,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F3ED",
    borderWidth: 1,
    borderColor: "#D6EADF",
    borderRadius: 13,
    paddingHorizontal: 11,
    marginHorizontal: 10,
    marginBottom: 10,
  },

  activeFiltersText: {
    flex: 1,
    color: "#148248",
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 7,
  },

  clearFiltersButton: {
    minHeight: 30,
    justifyContent: "center",
    paddingHorizontal: 8,
  },

  clearFiltersText: {
    color: "#148248",
    fontSize: 12,
    fontWeight: "800",
  },

  listContent: {
    paddingTop: 2,
    paddingBottom: 100,
  },

  emptyListContent: {
    flexGrow: 1,
  },

  columnWrapper: {
    justifyContent: "space-between",
  },

  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E7E3",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,

    ...Platform.select({
      android: {
        elevation: 3,
      },

      ios: {
        shadowColor: "#000000",
        shadowOpacity: 0.08,
        shadowRadius: 7,
        shadowOffset: {
          width: 0,
          height: 3,
        },
      },
    }),
  },

  cardGrid: {
    width: "49%",
  },

  cardSmall: {
    padding: 14,
    borderRadius: 16,
  },

  cardHeader: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
  },

  cardIconContainer: {
    width: 49,
    height: 49,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8F3ED",
    marginRight: 11,
    flexShrink: 0,
  },

  cardTitleContainer: {
    flex: 1,
    minWidth: 0,
    marginRight: 7,
  },

  title: {
    color: "#1F2937",
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "800",
  },

  requestNumber: {
    color: "#737D78",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 3,
  },

  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "#EDF1EF",
    marginTop: 14,
    marginBottom: 13,
  },

  informationRow: {
    width: "100%",
    flexDirection: "row",
    marginBottom: 9,
  },

  informationBox: {
    flex: 1,
    minWidth: 0,
    minHeight: 59,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F9F8",
    borderWidth: 1,
    borderColor: "#E8EDEB",
    borderRadius: 13,
    paddingHorizontal: 9,
    paddingVertical: 8,
  },

  informationBoxLeft: {
    marginRight: 8,
  },

  informationIcon: {
    width: 33,
    height: 33,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8F3ED",
    marginRight: 8,
    flexShrink: 0,
  },

  informationTextContainer: {
    flex: 1,
    minWidth: 0,
  },

  informationLabel: {
    color: "#7A837E",
    fontSize: 10,
    fontWeight: "600",
  },

  informationValue: {
    color: "#27332D",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 2,
  },

  descriptionContainer: {
    width: "100%",
    backgroundColor: "#F7F9F8",
    borderWidth: 1,
    borderColor: "#E8EDEB",
    borderRadius: 13,
    padding: 11,
    marginBottom: 9,
  },

  descriptionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },

  descriptionLabel: {
    color: "#68736E",
    fontSize: 11,
    fontWeight: "800",
    marginLeft: 6,
  },

  descriptionText: {
    color: "#4B5563",
    fontSize: 13,
    lineHeight: 19,
  },

  detailRow: {
    width: "100%",
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F9F8",
    borderWidth: 1,
    borderColor: "#E8EDEB",
    borderRadius: 13,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 9,
  },

  detailIconContainer: {
    width: 33,
    height: 33,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8F3ED",
    marginRight: 9,
    flexShrink: 0,
  },

  priorityIconContainer: {
    backgroundColor:
      "rgba(255,255,255,0.58)",
  },

  detailTextContainer: {
    flex: 1,
    minWidth: 0,
  },

  detailLabel: {
    color: "#7A837E",
    fontSize: 10,
    fontWeight: "600",
  },

  detailValue: {
    color: "#37413C",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
    marginTop: 2,
  },

  priorityValue: {
    textTransform: "capitalize",
    fontWeight: "800",
  },

  statusSection: {
    width: "100%",
    flexDirection: "row",
    marginTop: 2,
  },

  statusBadge: {
    minHeight: 34,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: 17,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },

  statusText: {
    fontSize: 12,
    fontWeight: "800",
    marginLeft: 5,
  },

  buttonsContainer: {
    width: "100%",
    flexDirection: "row",
    marginTop: 14,
  },

  buttonsContainerSmall: {
    flexDirection: "column",
  },

  button: {
    flex: 1,
    minHeight: 45,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 10,

    ...Platform.select({
      android: {
        elevation: 2,
      },

      ios: {
        shadowColor: "#000000",
        shadowOpacity: 0.13,
        shadowRadius: 4,
        shadowOffset: {
          width: 0,
          height: 2,
        },
      },
    }),
  },

  accept: {
    backgroundColor: "#232323",
  },

  acceptSpacing: {
    marginRight: 9,
  },

  reject: {
    backgroundColor: "#870C0C",
  },

  rejectSmall: {
    marginTop: 9,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
    marginLeft: 7,
  },

  emptyContainer: {
    flex: 1,
    minHeight: 310,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 25,
    paddingBottom: 70,
  },

  emptyIconBox: {
    width: 104,
    height: 104,
    borderRadius: 52,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8F3ED",
    marginBottom: 17,
  },

  emptyTitle: {
    color: "#374151",
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
  },

  emptyText: {
    maxWidth: 390,
    color: "#737B87",
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 6,
  },

  emptyClearButton: {
    minHeight: 43,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0F8F4",
    borderWidth: 1,
    borderColor: "#D6EADF",
    borderRadius: 13,
    paddingHorizontal: 15,
    marginTop: 17,
  },

  emptyClearButtonText: {
    color: "#148248",
    fontSize: 13,
    fontWeight: "800",
    marginLeft: 7,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(10,20,15,0.52)",
    paddingHorizontal: 16,
    paddingVertical: 25,
  },

  modalContent: {
    maxHeight: "90%",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E7E3",
    borderRadius: 23,
    padding: 20,

    ...Platform.select({
      android: {
        elevation: 10,
      },

      ios: {
        shadowColor: "#000000",
        shadowOpacity: 0.2,
        shadowRadius: 14,
        shadowOffset: {
          width: 0,
          height: 6,
        },
      },
    }),
  },

  modalHeader: {
    alignItems: "center",
    marginBottom: 16,
  },

  modalIconContainer: {
    width: 68,
    height: 68,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    borderWidth: 1,
    borderColor: "#FECACA",
    marginBottom: 12,
  },

  modalTitle: {
    color: "#26322C",
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
  },

  modalText: {
    maxWidth: 400,
    color: "#6F7974",
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 6,
  },

  selectedRequestBox: {
    width: "100%",
    minHeight: 62,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F4F8F6",
    borderWidth: 1,
    borderColor: "#E0E9E4",
    borderRadius: 14,
    padding: 10,
    marginBottom: 15,
  },

  selectedRequestIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8F3ED",
    marginRight: 10,
  },

  selectedRequestText: {
    flex: 1,
    minWidth: 0,
  },

  selectedRequestTitle: {
    color: "#26322C",
    fontSize: 14,
    fontWeight: "800",
  },

  selectedRequestSubtitle: {
    color: "#737D78",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },

  modalInputLabel: {
    color: "#46524C",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
  },

  modalTextAreaBox: {
    width: "100%",
    minHeight: 125,
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F9FBFA",
    borderWidth: 1,
    borderColor: "#DDE5E0",
    borderRadius: 15,
    padding: 10,
  },

  modalTextAreaIcon: {
    marginTop: 7,
  },

  modalTextArea: {
    flex: 1,
    minWidth: 0,
    minHeight: 105,
    color: "#26322C",
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 10,
    paddingTop: 6,
    paddingBottom: 6,
  },

  modalButtons: {
    width: "100%",
    flexDirection: "row",
    marginTop: 17,
  },

  modalButtonsSmall: {
    flexDirection: "column",
  },

  modalActionButton: {
    flex: 1,
    minHeight: 49,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 13,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },

  modalButtonSpacing: {
    marginRight: 10,
  },

  modalCancelButton: {
    backgroundColor: "#232323",
  },

  modalRejectButton: {
    backgroundColor: "#870c0c",
  },

  modalRejectButtonSmall: {
    marginTop: 10,
  },

  modalButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
    marginLeft: 7,
  },
});