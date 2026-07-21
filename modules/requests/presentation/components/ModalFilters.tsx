import { MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Dispatch, SetStateAction, useState } from "react";
import {
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

export type RequestFilters = {
  tipo: string;
  tipoMantenimiento: string;
  prioridad: string;

  fechaInicio: string;
  fechaFin: string;

  fechaCompletadaInicio: string;
  fechaCompletadaFin: string;
};

export const EMPTY_REQUEST_FILTERS: RequestFilters = {
  tipo: "",
  tipoMantenimiento: "",
  prioridad: "",

  fechaInicio: "",
  fechaFin: "",

  fechaCompletadaInicio: "",
  fechaCompletadaFin: "",
};

type DateFilterKey =
  "fechaInicio" | "fechaFin" | "fechaCompletadaInicio" | "fechaCompletadaFin";

type Props = {
  visible: boolean;
  filters: RequestFilters;
  setFilters: Dispatch<SetStateAction<RequestFilters>>;
  onClose: () => void;
};

export default function RequestFilterModal({
  visible,
  filters,
  setFilters,
  onClose,
}: Props) {
  const { width, height } = useWindowDimensions();

  const [activeDateFilter, setActiveDateFilter] =
    useState<DateFilterKey | null>(null);

  const isSmallScreen = width < 390 || height < 650;
  const updateFilter = (key: keyof RequestFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setFilters(EMPTY_REQUEST_FILTERS);
    setActiveDateFilter(null);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-CA");
  };

  const getDateValue = (key: DateFilterKey) => {
    const value = filters[key];

    if (!value) {
      return new Date();
    }

    return new Date(`${value}T00:00:00`);
  };

  const onChangeDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setActiveDateFilter(null);
    }

    if (event.type === "dismissed") {
      return;
    }

    if (selectedDate && activeDateFilter) {
      updateFilter(activeDateFilter, formatDate(selectedDate));
    }
  };

  const clearSolicitudDates = () => {
    updateFilter("fechaInicio", "");
    updateFilter("fechaFin", "");
    setActiveDateFilter(null);
  };

  const clearCompletadaDates = () => {
    updateFilter("fechaCompletadaInicio", "");
    updateFilter("fechaCompletadaFin", "");
    setActiveDateFilter(null);
  };

  const renderFilterOption = (
    label: string,
    value: string,
    selectedValue: string,
    onPress: () => void,
  ) => {
    const isActive = selectedValue === value;

    return (
      <TouchableOpacity
        style={[styles.filterOption, isActive && styles.filterOptionActive]}
        onPress={onPress}
        activeOpacity={0.82}
      >
        <MaterialCommunityIcons
          name={isActive ? "check-circle" : "circle-outline"}
          size={17}
          color={isActive ? "#FFFFFF" : "#8A948F"}
        />

        <Text
          style={[
            styles.filterOptionText,
            isActive && styles.filterOptionTextActive,
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderDateInput = (
    label: string,
    value: string,
    placeholder: string,
    keyName: DateFilterKey,
  ) => {
    return (
      <View
        style={[styles.dateColumn, isSmallScreen && styles.dateColumnSmall]}
      >
        <Text style={styles.dateSmallLabel}>{label}</Text>

        <TouchableOpacity
          activeOpacity={0.82}
          onPress={() => setActiveDateFilter(keyName)}
          style={styles.dateTouchable}
        >
          <View style={styles.dateIconBox}>
            <MaterialCommunityIcons
              name="calendar-month-outline"
              size={20}
              color="#148248"
            />
          </View>

          <View pointerEvents="none" style={styles.dateInputContainer}>
            <TextInput
              style={styles.dateInput}
              editable={false}
              value={value}
              placeholder={placeholder}
              placeholderTextColor="#98A19C"
            />
          </View>

          <MaterialCommunityIcons
            name="chevron-down"
            size={21}
            color="#78837D"
          />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.filterModal}>
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderIcon}>
              <MaterialCommunityIcons
                name="filter-variant"
                size={26}
                color="#148248"
              />
            </View>

            <View style={styles.modalHeaderText}>
              <Text style={styles.modalTitle}>Filtros</Text>
              <Text style={styles.modalSubtitle}>
                Ajusta los resultados de las solicitudes.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.8}
              accessibilityLabel="Cerrar filtros"
            >
              <MaterialCommunityIcons name="close" size={23} color="#59645E" />
            </TouchableOpacity>
          </View>

          <View style={styles.headerDivider} />

          <ScrollView
            style={styles.modalScroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[
              styles.modalContent,
              isSmallScreen && styles.modalContentSmall,
            ]}
          >
            <View style={styles.filterSection}>
              <View style={styles.sectionHeading}>
                <View style={styles.sectionIconBox}>
                  <MaterialCommunityIcons
                    name="clipboard-text-outline"
                    size={20}
                    color="#148248"
                  />
                </View>

                <View style={styles.sectionHeadingText}>
                  <Text style={styles.filterLabel}>Tipo de solicitud</Text>
                  <Text style={styles.filterDescription}>
                    Selecciona la categoría que deseas mostrar.
                  </Text>
                </View>
              </View>

              <View style={styles.optionsRow}>
                {renderFilterOption("Todos", "", filters.tipo, () =>
                  updateFilter("tipo", ""),
                )}

                {renderFilterOption("Servicio", "servicio", filters.tipo, () =>
                  updateFilter("tipo", "servicio"),
                )}

                {renderFilterOption(
                  "Mantenimiento",
                  "mantenimiento",
                  filters.tipo,
                  () => updateFilter("tipo", "mantenimiento"),
                )}
              </View>
            </View>

            <View style={styles.filterSection}>
              <View style={styles.sectionHeading}>
                <View style={styles.sectionIconBox}>
                  <MaterialCommunityIcons
                    name="wrench-clock-outline"
                    size={20}
                    color="#148248"
                  />
                </View>

                <View style={styles.sectionHeadingText}>
                  <Text style={styles.filterLabel}>Tipo de mantenimiento</Text>
                  <Text style={styles.filterDescription}>
                    Filtra por la clase de mantenimiento.
                  </Text>
                </View>
              </View>

              <View style={styles.optionsRow}>
                {renderFilterOption(
                  "Todos",
                  "",
                  filters.tipoMantenimiento,
                  () => updateFilter("tipoMantenimiento", ""),
                )}

                {renderFilterOption(
                  "Preventivo",
                  "preventivo",
                  filters.tipoMantenimiento,
                  () => updateFilter("tipoMantenimiento", "preventivo"),
                )}

                {renderFilterOption(
                  "Correctivo",
                  "correctivo",
                  filters.tipoMantenimiento,
                  () => updateFilter("tipoMantenimiento", "correctivo"),
                )}

                {renderFilterOption(
                  "Reactivo",
                  "reactivo",
                  filters.tipoMantenimiento,
                  () => updateFilter("tipoMantenimiento", "reactivo"),
                )}
              </View>
            </View>

            <View style={styles.filterSection}>
              <View style={styles.sectionHeading}>
                <View style={styles.sectionIconBox}>
                  <MaterialCommunityIcons
                    name="flag-outline"
                    size={20}
                    color="#148248"
                  />
                </View>

                <View style={styles.sectionHeadingText}>
                  <Text style={styles.filterLabel}>Prioridad</Text>
                  <Text style={styles.filterDescription}>
                    Muestra solicitudes según su nivel de atención.
                  </Text>
                </View>
              </View>

              <View style={styles.optionsRow}>
                {renderFilterOption("Todas", "", filters.prioridad, () =>
                  updateFilter("prioridad", ""),
                )}

                {renderFilterOption("Alta", "alta", filters.prioridad, () =>
                  updateFilter("prioridad", "alta"),
                )}

                {renderFilterOption("Media", "media", filters.prioridad, () =>
                  updateFilter("prioridad", "media"),
                )}

                {renderFilterOption("Baja", "baja", filters.prioridad, () =>
                  updateFilter("prioridad", "baja"),
                )}
              </View>
            </View>

            <View style={styles.filterSection}>
              <View style={styles.sectionHeading}>
                <View style={styles.sectionIconBox}>
                  <MaterialCommunityIcons
                    name="calendar-start-outline"
                    size={20}
                    color="#148248"
                  />
                </View>

                <View style={styles.sectionHeadingText}>
                  <Text style={styles.filterLabel}>Fecha de solicitud</Text>
                  <Text style={styles.filterDescription}>
                    Define un intervalo para la fecha de registro.
                  </Text>
                </View>
              </View>

              <View
                style={[styles.dateRow, isSmallScreen && styles.dateRowSmall]}
              >
                {renderDateInput(
                  "Desde",
                  filters.fechaInicio,
                  "Fecha inicial",
                  "fechaInicio",
                )}

                {renderDateInput(
                  "Hasta",
                  filters.fechaFin,
                  "Fecha final",
                  "fechaFin",
                )}
              </View>

              <TouchableOpacity
                style={styles.clearDateButton}
                onPress={clearSolicitudDates}
                activeOpacity={0.82}
              >
                <MaterialCommunityIcons
                  name="calendar-remove-outline"
                  size={20}
                  color="#5D6862"
                />

                <Text style={styles.clearDateButtonText}>
                  Quitar fechas de solicitud
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.filterSection}>
              <View style={styles.sectionHeading}>
                <View style={styles.sectionIconBox}>
                  <MaterialCommunityIcons
                    name="calendar-check-outline"
                    size={20}
                    color="#148248"
                  />
                </View>

                <View style={styles.sectionHeadingText}>
                  <Text style={styles.filterLabel}>
                    Fecha de solicitud completada
                  </Text>
                  <Text style={styles.filterDescription}>
                    Define un intervalo para solicitudes terminadas.
                  </Text>
                </View>
              </View>

              <View
                style={[styles.dateRow, isSmallScreen && styles.dateRowSmall]}
              >
                {renderDateInput(
                  "Desde",
                  filters.fechaCompletadaInicio,
                  "Fecha inicial",
                  "fechaCompletadaInicio",
                )}

                {renderDateInput(
                  "Hasta",
                  filters.fechaCompletadaFin,
                  "Fecha final",
                  "fechaCompletadaFin",
                )}
              </View>

              <TouchableOpacity
                style={styles.clearDateButton}
                onPress={clearCompletadaDates}
                activeOpacity={0.82}
              >
                <MaterialCommunityIcons
                  name="calendar-remove-outline"
                  size={20}
                  color="#5D6862"
                />

                <Text style={styles.clearDateButtonText}>
                  Quitar fechas completadas
                </Text>
              </TouchableOpacity>
            </View>

            {activeDateFilter && (
              <View style={styles.datePickerContainer}>
                <DateTimePicker
                  value={getDateValue(activeDateFilter)}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={onChangeDate}
                />
              </View>
            )}

            {Platform.OS === "ios" && activeDateFilter && (
              <TouchableOpacity
                style={styles.closeDateButton}
                onPress={() => setActiveDateFilter(null)}
                activeOpacity={0.84}
              >
                <MaterialCommunityIcons
                  name="check"
                  size={20}
                  color="#FFFFFF"
                />
                <Text style={styles.closeDateButtonText}>Listo</Text>
              </TouchableOpacity>
            )}
          </ScrollView>

          <View style={styles.footerDivider} />

          <View
            style={[
              styles.modalActions,
              isSmallScreen && styles.modalActionsSmall,
            ]}
          >
            <TouchableOpacity
              style={[
                styles.clearButton,
                isSmallScreen && styles.actionButtonSmall,
                isSmallScreen && styles.clearButtonSmall,
              ]}
              onPress={clearFilters}
              activeOpacity={0.84}
            >
              <MaterialCommunityIcons
                name="filter-remove-outline"
                size={20}
                color="#4C5751"
              />
              <Text style={styles.clearButtonText}>Limpiar todo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.applyButton,
                isSmallScreen && styles.actionButtonSmall,
                isSmallScreen && styles.applyButtonSmall,
              ]}
              onPress={onClose}
              activeOpacity={0.84}
            >
              <Text style={styles.applyButtonText}>Aplicar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const cardShadow = Platform.select({
  android: {
    elevation: 12,
  },
  ios: {
    shadowColor: "#000000",
    shadowOpacity: 0.2,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 8,
    },
  },
});

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(10,20,15,0.55)",
    paddingHorizontal: 20,
  },

  filterModal: {
    width: "100%",
    maxHeight: "85%",
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E7E3",
    borderRadius: 22,
    ...cardShadow,
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
  },

  modalHeaderIcon: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8F3ED",
    borderWidth: 1,
    borderColor: "#D6EADF",
    borderRadius: 15,
    marginRight: 11,
    flexShrink: 0,
  },

  modalHeaderText: {
    flex: 1,
    minWidth: 0,
    marginRight: 8,
  },

  modalTitle: {
    color: "#25312B",
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "800",
  },

  modalSubtitle: {
    color: "#77827C",
    fontSize: 11,
    lineHeight: 16,
    marginTop: 3,
  },

  closeButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F2F5F3",
    borderWidth: 1,
    borderColor: "#E4E9E6",
    borderRadius: 12,
    flexShrink: 0,
  },

  headerDivider: {
    width: "100%",
    height: 1,
    backgroundColor: "#E9EEEB",
  },

  modalScroll: {
    flexShrink: 1,
  },

  modalContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 18,
  },

  modalContentSmall: {
    paddingTop: 12,
    paddingBottom: 14,
  },

  filterSection: {
    width: "100%",
    backgroundColor: "#F8FAF9",
    borderWidth: 1,
    borderColor: "#E5EBE7",
    borderRadius: 16,
    padding: 13,
    marginBottom: 12,
  },

  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  sectionIconBox: {
    width: 39,
    height: 39,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8F3ED",
    borderRadius: 12,
    marginRight: 9,
    flexShrink: 0,
  },

  sectionHeadingText: {
    flex: 1,
    minWidth: 0,
  },

  filterLabel: {
    color: "#344139",
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "800",
  },

  filterDescription: {
    color: "#7A857F",
    fontSize: 10,
    lineHeight: 15,
    marginTop: 2,
  },

  optionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginRight: -8,
    marginBottom: -8,
  },

  filterOption: {
    minHeight: 39,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DDE4E0",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },

  filterOptionActive: {
    backgroundColor: "#148248",
    borderColor: "#148248",
  },

  filterOptionText: {
    color: "#46514B",
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 6,
  },

  filterOptionTextActive: {
    color: "#FFFFFF",
  },

  dateRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  dateRowSmall: {
    flexDirection: "column",
  },

  dateColumn: {
    flex: 1,
    marginRight: 9,
  },

  dateColumnSmall: {
    width: "100%",
    marginRight: 0,
    marginBottom: 10,
  },

  dateSmallLabel: {
    color: "#68736D",
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 6,
  },

  dateTouchable: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DCE3DF",
    borderRadius: 13,
    paddingHorizontal: 9,
  },

  dateIconBox: {
    width: 34,
    height: 34,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8F3ED",
    borderRadius: 10,
    marginRight: 8,
    flexShrink: 0,
  },

  dateInputContainer: {
    flex: 1,
    minWidth: 0,
  },

  dateInput: {
    color: "#27332D",
    fontSize: 12,
    fontWeight: "700",
    paddingVertical: 10,
    paddingHorizontal: 0,
  },

  clearDateButton: {
    minHeight: 44,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#EEF2F0",
    borderWidth: 1,
    borderColor: "#DFE6E2",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 10,
  },

  clearDateButtonText: {
    color: "#515D56",
    fontSize: 12,
    fontWeight: "800",
    marginLeft: 7,
  },

  datePickerContainer: {
    overflow: "hidden",
    backgroundColor: "#F7F9F8",
    borderWidth: 1,
    borderColor: "#E2E8E4",
    borderRadius: 14,
    marginBottom: 10,
  },

  closeDateButton: {
    minHeight: 46,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#148248",
    borderRadius: 13,
    paddingHorizontal: 15,
    paddingVertical: 11,
    marginBottom: 4,
  },

  closeDateButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
    marginLeft: 6,
  },

  footerDivider: {
    width: "100%",
    height: 1,
    backgroundColor: "#E9EEEB",
  },

  modalActions: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 13,
    paddingBottom: Platform.OS === "ios" ? 18 : 14,
  },

  modalActionsSmall: {
    flexDirection: "column",
  },

  actionButtonSmall: {
    flex: 0,
    width: "100%",
  },

  clearButtonSmall: {
    marginRight: 0,
    marginBottom: 10,
  },

  applyButtonSmall: {
    marginBottom: 0,
  },

  clearButton: {
    minHeight: 50,
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#EEF2F0",
    borderWidth: 1,
    borderColor: "#DFE6E2",
    borderRadius: 13,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginRight: 10,
  },

  clearButtonText: {
    color: "#4C5751",
    fontSize: 13,
    fontWeight: "800",
    marginLeft: 7,
  },

  applyButton: {
    minHeight: 50,
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#232323",
    borderRadius: 13,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },

  applyButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
    marginLeft: 7,
  },
});