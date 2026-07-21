import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  useFocusEffect,
  useRouter,
} from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View
} from "react-native";

import { usePaginatedCards } from "@/hooks/usePaginatedCards";
import { GetRequestsByTecnicoInterno } from "../../application/getRequestAsignedInterno";
import { SupabaseRequestsRepository } from "../../infraestructure/requestsDatasurce";
import RequestFilterModal, {
  EMPTY_REQUEST_FILTERS,
  RequestFilters,
} from "../components/ModalFilters";

const repository =
  new SupabaseRequestsRepository();

const getRequestsInterno =
  new GetRequestsByTecnicoInterno(
    repository
  );

export default function RequestsAssigned() {
  const router = useRouter();

  const { width, height } =
    useWindowDimensions();

  const [requests, setRequests] =
    useState<any[]>([]);

  const [
    actualizandoId,
    setActualizandoId,
  ] = useState<number | null>(null);

  const [
    filterModalOpen,
    setFilterModalOpen,
  ] = useState(false);

  const [filters, setFilters] =
    useState<RequestFilters>(
      EMPTY_REQUEST_FILTERS
    );

  /*
   * Valores usados únicamente para adaptar
   * la interfaz a celulares y tablets.
   */
  const isSmallScreen =
    width < 370 || height < 650;

  const isTablet = width >= 700;
  const useGrid = width >= 760;

  const horizontalPadding =
    isTablet ? 18 : 10;

  useFocusEffect(
    useCallback(() => {
      loadRequests();
    }, [])
  );

  const getValue = (
    obj: any,
    ...keys: string[]
  ) => {
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

  const loadRequests = async () => {
    try {
      const userData =
        await AsyncStorage.getItem("user");

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

      const data =
        await getRequestsInterno.execute(
          numUsuario
        );

      const solicitudesAsignadas =
        (data ?? []).filter((item) => {
          const status = Number(
            getValue(
              item,
              "numStatus",
              "numstatus",
              "num_status"
            )
          );

          return status === 2;
        });

      setRequests(solicitudesAsignadas);
    } catch (error) {
      console.log(
        "ERROR loading assigned requests:",
        error
      );

      setRequests([]);
    }
  };

  const normalizeText = (
    text: string
  ) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  };

  const getTipoText = (
    tipo: number
  ) => {
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
    if (!date) {
      return "Sin fecha";
    }

    const cleanDate =
      String(date).split(/[T ]/)[0];

    const parts =
      cleanDate.split("-");

    if (parts.length === 3) {
      const [year, month, day] =
        parts;

      return `${day}/${month}/${year}`;
    }

    return String(date);
  };

  const normalizarFechaFiltro = (
    date?: string | null
  ) => {
    if (!date) {
      return "";
    }

    return String(date).split(/[T ]/)[0];
  };

  const fechaEstaEnRango = (
    fechaItem:
      | string
      | null
      | undefined,
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
    requests.filter((item) => {
      const tipo = getTipoText(
        getValue(
          item,
          "numTipo",
          "numtipo",
          "num_tipo"
        )
      );

      const tipoMantenimiento =
        getTipoMantenimientoText(
          getValue(
            item,
            "numTipoMantenimiento",
            "numtipomantenimiento",
            "num_tipo_mantenimiento"
          )
        );

      const prioridad = normalizeText(
        String(
          getValue(
            item,
            "prioridad"
          ) ?? ""
        )
      );

      const fechaSolicitud = String(
        getValue(
          item,
          "fecha",
          "fechaSolicitud",
          "fechasolicitud",
          "fecha_solicitud"
        ) ?? ""
      );

      const fechaCompletada = String(
        getValue(
          item,
          "fechafinreal",
          "fechaFinReal",
          "fecha_fin_real",
          "fechaCompletada",
          "fechacompletada",
          "fecha_completada"
        ) ?? ""
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
      (value) =>
        String(value ?? "").trim() !== ""
    ).length;

  const viewRequest = (
    request: any
  ) => {
    router.push({
      pathname: "/viewRequestForm",
      params: {
        request:
          JSON.stringify(request),
      },
    });
  };

  const actualizarEstadoSolicitud =
    async (
      numSolicitud: number,
      nuevoEstado: number
    ) => {
      const repo: any = repository;

      if (
        typeof repo.updateRequestStatus ===
        "function"
      ) {
        return await repo.updateRequestStatus(
          numSolicitud,
          nuevoEstado
        );
      }

      if (
        typeof repo.updateStatus ===
        "function"
      ) {
        return await repo.updateStatus(
          numSolicitud,
          nuevoEstado
        );
      }

      if (
        typeof repo.updateSolicitudStatus ===
        "function"
      ) {
        return await repo.updateSolicitudStatus(
          numSolicitud,
          nuevoEstado
        );
      }

      if (
        typeof repo.changeRequestStatus ===
        "function"
      ) {
        return await repo.changeRequestStatus(
          numSolicitud,
          nuevoEstado
        );
      }

      if (
        typeof repo.updateRequest ===
        "function"
      ) {
        return await repo.updateRequest(
          numSolicitud,
          {
            numStatus: nuevoEstado,
            numstatus: nuevoEstado,
          }
        );
      }

      throw new Error(
        "No se encontró un método en el repositorio para actualizar el estado."
      );
    };

  const confirmarMarcarEnProceso = (
    request: any
  ) => {
    const numSolicitud = Number(
      getValue(
        request,
        "numSolicitud",
        "numsolicitud",
        "num_solicitud"
      )
    );

    if (!numSolicitud) {
      Alert.alert(
        "Error",
        "No se encontró el número de solicitud."
      );

      return;
    }

    Alert.alert(
      "Marcar en proceso",
      "¿Seguro que quieres marcar esta solicitud como en proceso?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Sí, marcar",
          onPress: () =>
            marcarEnProceso(numSolicitud),
        },
      ]
    );
  };

  const marcarEnProceso = async (
    numSolicitud: number
  ) => {
    try {
      setActualizandoId(
        numSolicitud
      );

      await actualizarEstadoSolicitud(
        numSolicitud,
        3
      );

      setRequests((prevRequests) =>
        prevRequests.filter((item) => {
          const id = Number(
            getValue(
              item,
              "numSolicitud",
              "numsolicitud",
              "num_solicitud"
            )
          );

          return id !== numSolicitud;
        })
      );

      Alert.alert(
        "Listo",
        "La solicitud se marcó como en proceso."
      );
    } catch (error) {
      console.log(
        "ERROR marcando solicitud en proceso:",
        error
      );

      Alert.alert(
        "Error",
        "No se pudo marcar la solicitud como en proceso."
      );
    } finally {
      setActualizandoId(null);
    }
  };

  const renderStatusColor = (
    status: number
  ) => {
    switch (Number(status)) {
      case 2:
        return "#FEF3C7";

      default:
        return "#E5E7EB";
    }
  };

  const renderStatusTextColor = (
    status: number
  ) => {
    switch (Number(status)) {
      case 2:
        return "#92400E";

      default:
        return "#374151";
    }
  };

  const renderStatusName = (
    status: number
  ) => {
    switch (Number(status)) {
      case 2:
        return "Asignada";

      default:
        return "Desconocido";
    }
  };

  const renderTipo = (
    tipo: number
  ) => {
    switch (Number(tipo)) {
      case 1:
        return "Servicio";

      case 2:
        return "Mantenimiento";

      default:
        return "Desconocido";
    }
  };

  const getTipoIcon = (
    tipo: number
  ) => {
    switch (Number(tipo)) {
      case 1:
        return "clipboard-text-outline";

      case 2:
        return "tools";

      default:
        return "file-document-outline";
    }
  };

  /*
   * Colores dinámicos para conservar
   * el cuadro completo de prioridad.
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
      priorityColors[
        normalizedPriority
      ] ?? {
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

  const renderRequest = ({
    item,
  }: {
    item: any;
  }) => {
    const numSolicitud = Number(
      getValue(
        item,
        "numSolicitud",
        "numsolicitud",
        "num_solicitud"
      )
    );

    const numStatus = Number(
      getValue(
        item,
        "numStatus",
        "numstatus",
        "num_status"
      )
    );

    const numTipo = Number(
      getValue(
        item,
        "numTipo",
        "numtipo",
        "num_tipo"
      )
    );

    const fecha = getValue(
      item,
      "fecha",
      "fechaSolicitud",
      "fechasolicitud",
      "fecha_solicitud"
    );

    const nombreSolicitante =
      getValue(
        item,
        "nombreSolicitante",
        "nombresolicitante",
        "nombre_solicitante"
      ) ?? "Sin nombre";

    const prioridad = String(
      getValue(
        item,
        "prioridad"
      ) ?? "Sin prioridad"
    ).trim();

    const descripcion =
      getValue(
        item,
        "descripcion",
        "description"
      ) ?? "Sin descripción";

    const estaActualizando =
      actualizandoId === numSolicitud;

    const priorityStyle =
      getPriorityStyle(prioridad);

    const statusBackground =
      renderStatusColor(numStatus);

    const statusTextColor =
      renderStatusTextColor(numStatus);

    return (
      <TouchableOpacity
        style={[
          styles.card,
          useGrid && styles.cardGrid,
          isSmallScreen &&
            styles.cardSmall,
        ]}
        onPress={() =>
          viewRequest(item)
        }
        activeOpacity={0.86}
        accessibilityLabel={`Ver solicitud ${numSolicitud}`}
      >
        {/* Encabezado */}
        <View style={styles.cardHeader}>
          <View
            style={
              styles.cardIconContainer
            }
          >
            <MaterialCommunityIcons
              name={
                getTipoIcon(
                  numTipo
                ) as any
              }
              size={27}
              color="#148248"
            />
          </View>

          <View
            style={
              styles.cardTitleContainer
            }
          >
            <Text
              style={styles.title}
              numberOfLines={1}
            >
              {renderTipo(numTipo)}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Fecha y solicitante */}
        <View
          style={
            styles.informationRow
          }
        >
          <View
            style={[
              styles.informationBox,
              styles.informationBoxLeft,
            ]}
          >
            <View
              style={
                styles.informationIcon
              }
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
                style={
                  styles.informationLabel
                }
              >
                Fecha
              </Text>

              <Text
                style={
                  styles.informationValue
                }
                numberOfLines={1}
              >
                {formatDate(fecha)}
              </Text>
            </View>
          </View>

          <View
            style={
              styles.informationBox
            }
          >
            <View
              style={
                styles.informationIcon
              }
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
                style={
                  styles.informationLabel
                }
              >
                Solicitante
              </Text>

              <Text
                style={
                  styles.informationValue
                }
                numberOfLines={1}
              >
                {nombreSolicitante}
              </Text>
            </View>
          </View>
        </View>

        {/* Cuadro completo de prioridad */}
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

        {/* Descripción */}
        <View
          style={
            styles.descriptionContainer
          }
        >
          <View
            style={
              styles.descriptionHeader
            }
          >
            <MaterialCommunityIcons
              name="text-box-outline"
              size={18}
              color="#68736E"
            />

            <Text
              style={
                styles.descriptionLabel
              }
            >
              Descripción
            </Text>
          </View>

          <Text
            style={
              styles.descriptionText
            }
            numberOfLines={4}
          >
            {descripcion}
          </Text>
        </View>

        {/* Estado */}
        <View
          style={styles.statusSection}
        >
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  statusBackground,
              },
            ]}
          >
            <MaterialCommunityIcons
              name="account-check-outline"
              size={16}
              color={statusTextColor}
            />

            <Text
              style={[
                styles.statusText,
                {
                  color:
                    statusTextColor,
                },
              ]}
            >
              {renderStatusName(
                numStatus
              )}
            </Text>
          </View>
        </View>

        {/* Acción */}
        <TouchableOpacity
          style={[
            styles.processButton,
            estaActualizando &&
              styles.processButtonDisabled,
          ]}
          disabled={estaActualizando}
          onPress={(event) => {
            event.stopPropagation();

            confirmarMarcarEnProceso(
              item
            );
          }}
          activeOpacity={0.84}
          accessibilityLabel="Marcar solicitud como en proceso"
        >
          {estaActualizando ? (
            <>
              <Text
                style={
                  styles.processButtonText
                }
              >
                Actualizando...
              </Text>
            </>
          ) : (
            <>

              <Text
                style={
                  styles.processButtonText
                }
              >
                Marcar en proceso
              </Text>
            </>
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Resumen y filtro */}
      <View style={styles.headerFilters}>
        <View
          style={
            styles.resultsContainer
          }
        >
          <View
            style={styles.resultsIcon}
          >
            <MaterialCommunityIcons
              name="account-check-outline"
              size={23}
              color="#148248"
            />
          </View>

          <View
            style={
              styles.resultsTextContainer
            }
          >
            <Text
              style={styles.resultsTitle}
            >
              Solicitudes asignadas
            </Text>

            <Text
              style={styles.resultsText}
            >
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
            <View
              style={styles.filterBadge}
            >
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
        <View
          style={
            styles.activeFiltersBar
          }
        >
          <MaterialCommunityIcons
            name="filter-check-outline"
            size={18}
            color="#148248"
          />

          <Text
            style={
              styles.activeFiltersText
            }
          >
            {activeFiltersCount}{" "}
            {activeFiltersCount === 1
              ? "filtro activo"
              : "filtros activos"}
          </Text>

          <TouchableOpacity
            style={
              styles.clearFiltersButton
            }
            onPress={() =>
              setFilters(
                EMPTY_REQUEST_FILTERS
              )
            }
            activeOpacity={0.75}
          >
            <Text
              style={
                styles.clearFiltersText
              }
            >
              Limpiar
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Lista */}
      <FlatList
        key={
          useGrid
            ? "assigned-grid"
            : "assigned-list"
        }
        data={visibleRequests}
        numColumns={useGrid ? 2 : 1}
        columnWrapperStyle={
          useGrid
            ? styles.columnWrapper
            : undefined
        }
        onEndReached={
          loadMoreRequests
        }
        onEndReachedThreshold={0.3}
        initialNumToRender={15}
        maxToRenderPerBatch={15}
        windowSize={7}
        removeClippedSubviews
        keyExtractor={(item) =>
          String(
            getValue(
              item,
              "numSolicitud",
              "numsolicitud",
              "num_solicitud"
            )
          )
        }
        renderItem={renderRequest}
        showsVerticalScrollIndicator={
          false
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
        ListEmptyComponent={
          <View
            style={
              styles.emptyContainer
            }
          >
            <View
              style={
                styles.emptyIconBox
              }
            >
              <MaterialCommunityIcons
                name="account-check-outline"
                size={58}
                color="#148248"
              />
            </View>

            <Text
              style={styles.emptyTitle}
            >
              No tienes solicitudes asignadas
            </Text>

            <Text
              style={styles.emptyText}
            >
              {activeFiltersCount > 0
                ? "No hay solicitudes asignadas que coincidan con los filtros seleccionados."
                : "Las solicitudes que te sean asignadas aparecerán en este apartado."}
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
      />

      <RequestFilterModal
        visible={filterModalOpen}
        filters={filters}
        setFilters={setFilters}
        onClose={() =>
          setFilterModalOpen(false)
        }
      />
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
    paddingBottom: 110,
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

  processButton: {
    width: "100%",
    minHeight: 48,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#232323",
    borderRadius: 13,
    paddingHorizontal: 15,
    paddingVertical: 11,
    marginTop: 14,

    ...Platform.select({
      android: {
        elevation: 2,
      },

      ios: {
        shadowColor: "#1F4A13",
        shadowOpacity: 0.2,
        shadowRadius: 5,
        shadowOffset: {
          width: 0,
          height: 2,
        },
      },
    }),
  },

  processButtonDisabled: {
    opacity: 0.65,
  },

  processButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
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
    borderWidth: 1,
    borderColor: "#D6EADF",
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
});