import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  useFocusEffect,
  useRouter,
} from "expo-router";
import { useCallback, useState } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

import { usePaginatedCards } from "@/hooks/usePaginatedCards";
import { GetRequestsCompleted } from "../../application/getRequestCompleted";
import { RequestsForm } from "../../domain/request";
import { SupabaseRequestsRepository } from "../../infraestructure/requestsDatasurce";
import RequestFilterModal, {
  EMPTY_REQUEST_FILTERS,
  RequestFilters,
} from "../components/ModalFilters";

const repository =
  new SupabaseRequestsRepository();

const getRequests =
  new GetRequestsCompleted(repository);

const ROL_TECNICO = 3;

export default function RequestsCompleted() {
  const router = useRouter();

  const { width, height } =
    useWindowDimensions();

  const [requests, setRequests] =
    useState<RequestsForm[]>([]);

  const [
    filterModalOpen,
    setFilterModalOpen,
  ] = useState(false);

  const [filters, setFilters] =
    useState<RequestFilters>(
      EMPTY_REQUEST_FILTERS
    );

  /*
   * Valores utilizados únicamente para adaptar
   * la interfaz.
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

  const normalizeText = (
    text: string
  ) => {
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
      return tecnicos.some(
        (tecnico: any) => {
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

          const tecnicoName =
            normalizeText(
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
            (userName !== "" &&
              tecnicoName === userName)
          );
        }
      );
    }

    const tecnicoAsignado =
      normalizeText(
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

    if (
      userName !== "" &&
      tecnicoAsignado !== ""
    ) {
      return (
        tecnicoAsignado === userName ||
        tecnicoAsignado.includes(userName)
      );
    }

    return false;
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

      const numRol = Number(
        getValue(
          user,
          "numRol",
          "numrol",
          "num_rol"
        )
      );

      const data =
        await getRequests.execute(
          numUsuario,
          numRol
        );

      const solicitudesCompletadas =
        (data ?? []).filter(
          (item: any) => {
            const status = Number(
              getValue(
                item,
                "numStatus",
                "numstatus",
                "num_status"
              )
            );

            return status === 4;
          }
        );

      if (numRol === ROL_TECNICO) {
        const solicitudesDelTecnico =
          solicitudesCompletadas.filter(
            (item: any) =>
              isAssignedToCurrentTecnico(
                item,
                user,
                numUsuario
              )
          );

        setRequests(
          solicitudesDelTecnico
        );

        return;
      }

      setRequests(
        solicitudesCompletadas
      );
    } catch (error) {
      console.log(
        "ERROR loading completed requests:",
        error
      );

      setRequests([]);
    }
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
    if (!date) return "Sin fecha";

    const cleanDate =
      String(date).split("T")[0];

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
    if (!date) return "";

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
    requests.filter((request) => {
      const item = request as any;

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
          "fechaFinReal",
          "fechafinreal",
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
    request: RequestsForm
  ) => {
    router.push({
      pathname: "/viewRequestForm",
      params: {
        request:
          JSON.stringify(request),
      },
    });
  };

  const renderStatusColor = (
    status: number
  ) => {
    switch (Number(status)) {
      case 4:
        return "#D1FAE5";

      default:
        return "#E5E7EB";
    }
  };

  const renderStatusTextColor = (
    status: number
  ) => {
    switch (Number(status)) {
      case 4:
        return "#065F46";

      default:
        return "#374151";
    }
  };

  const renderStatusText = (
    status: number
  ) => {
    switch (Number(status)) {
      case 4:
        return "Completada";

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
   * Colores de prioridad. Se conserva
   * el cuadro completo.
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
    item: RequestsForm;
  }) => {
    const requestItem = item as any;

    const numSolicitud = getValue(
      requestItem,
      "numSolicitud",
      "numsolicitud"
    );

    const numTipo = Number(
      getValue(
        requestItem,
        "numTipo",
        "numtipo",
        "num_tipo"
      )
    );

    const numStatus = Number(
      getValue(
        requestItem,
        "numStatus",
        "numstatus",
        "num_status"
      )
    );

    const fecha = getValue(
      requestItem,
      "fecha",
      "fechaSolicitud",
      "fechasolicitud",
      "fecha_solicitud"
    );

    const fechaFinReal = getValue(
      requestItem,
      "fechaFinReal",
      "fechafinreal",
      "fecha_fin_real",
      "fechaCompletada",
      "fechacompletada",
      "fecha_completada"
    );

    const nombreSolicitante =
      getValue(
        requestItem,
        "nombreSolicitante",
        "nombresolicitante",
        "nombre_solicitante"
      ) ?? "Sin nombre";

    const prioridad = String(
      getValue(
        requestItem,
        "prioridad"
      ) ?? "Sin prioridad"
    ).trim();

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

        {/* Fecha de finalización */}
        <View
          style={
            styles.completedDateContainer
          }
        >
          <View
            style={
              styles.completedDateIcon
            }
          >
            <MaterialCommunityIcons
              name="calendar-check-outline"
              size={21}
              color="#065F46"
            />
          </View>

          <View
            style={
              styles.completedDateTextContainer
            }
          >
            <Text
              style={
                styles.completedDateLabel
              }
            >
              Finalizó
            </Text>

            <Text
              style={
                styles.completedDateValue
              }
              numberOfLines={1}
            >
              {formatDate(fechaFinReal)}
            </Text>
          </View>
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
              name="check-circle-outline"
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
              {renderStatusText(
                numStatus
              )}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Resumen y filtros */}
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
              name="clipboard-check-outline"
              size={22}
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
              Solicitudes completadas
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
            ? "completed-grid"
            : "completed-list"
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
              "numsolicitud"
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
                name="clipboard-check-outline"
                size={58}
                color="#148248"
              />
            </View>

            <Text
              style={styles.emptyTitle}
            >
              No hay solicitudes completadas
            </Text>

            <Text
              style={styles.emptyText}
            >
              {activeFiltersCount > 0
                ? "No hay solicitudes completadas que coincidan con los filtros seleccionados."
                : "Las solicitudes finalizadas aparecerán en este apartado."}
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

  completedDateContainer: {
    width: "100%",
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    borderRadius: 13,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 9,
  },

  completedDateIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#D1FAE5",
    marginRight: 9,
    flexShrink: 0,
  },

  completedDateTextContainer: {
    flex: 1,
    minWidth: 0,
  },

  completedDateLabel: {
    color: "#047857",
    fontSize: 10,
    fontWeight: "600",
  },

  completedDateValue: {
    color: "#065F46",
    fontSize: 13,
    fontWeight: "800",
    marginTop: 2,
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
});