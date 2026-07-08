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
  | "fechaInicio"
  | "fechaFin"
  | "fechaCompletadaInicio"
  | "fechaCompletadaFin";

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
  const [activeDateFilter, setActiveDateFilter] =
    useState<DateFilterKey | null>(null);

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

  const onChangeDate = (
    event: DateTimePickerEvent,
    selectedDate?: Date
  ) => {
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
    onPress: () => void
  ) => {
    const isActive = selectedValue === value;

    return (
      <TouchableOpacity
        style={[
          styles.filterOption,
          isActive && styles.filterOptionActive,
        ]}
        onPress={onPress}
      >
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
    keyName: DateFilterKey
  ) => {
    return (
      <View style={styles.dateColumn}>
        <Text style={styles.dateSmallLabel}>
          {label}
        </Text>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setActiveDateFilter(keyName)}
        >
          <View pointerEvents="none">
            <TextInput
              style={styles.dateInput}
              editable={false}
              value={value}
              placeholder={placeholder}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <MaterialCommunityIcons
            name="calendar-month"
            size={22}
            color="#148248"
            style={styles.calendarIcon}
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
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.filterModal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              Filtros
            </Text>

            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons
                name="close"
                size={26}
                color="#111827"
              />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.modalContent}
          >
            <Text style={styles.filterLabel}>
              Tipo de solicitud
            </Text>

            <View style={styles.optionsRow}>
              {renderFilterOption(
                "Todos",
                "",
                filters.tipo,
                () => updateFilter("tipo", "")
              )}

              {renderFilterOption(
                "Servicio",
                "servicio",
                filters.tipo,
                () => updateFilter("tipo", "servicio")
              )}

              {renderFilterOption(
                "Mantenimiento",
                "mantenimiento",
                filters.tipo,
                () => updateFilter("tipo", "mantenimiento")
              )}
            </View>

            <Text style={styles.filterLabel}>
              Tipo de mantenimiento
            </Text>

            <View style={styles.optionsRow}>
              {renderFilterOption(
                "Todos",
                "",
                filters.tipoMantenimiento,
                () => updateFilter("tipoMantenimiento", "")
              )}

              {renderFilterOption(
                "Preventivo",
                "preventivo",
                filters.tipoMantenimiento,
                () => updateFilter("tipoMantenimiento", "preventivo")
              )}

              {renderFilterOption(
                "Correctivo",
                "correctivo",
                filters.tipoMantenimiento,
                () => updateFilter("tipoMantenimiento", "correctivo")
              )}

              {renderFilterOption(
                "Reactivo",
                "reactivo",
                filters.tipoMantenimiento,
                () => updateFilter("tipoMantenimiento", "reactivo")
              )}
            </View>

            <Text style={styles.filterLabel}>
              Prioridad
            </Text>

            <View style={styles.optionsRow}>
              {renderFilterOption(
                "Todas",
                "",
                filters.prioridad,
                () => updateFilter("prioridad", "")
              )}

              {renderFilterOption(
                "Alta",
                "alta",
                filters.prioridad,
                () => updateFilter("prioridad", "alta")
              )}

              {renderFilterOption(
                "Media",
                "media",
                filters.prioridad,
                () => updateFilter("prioridad", "media")
              )}

              {renderFilterOption(
                "Baja",
                "baja",
                filters.prioridad,
                () => updateFilter("prioridad", "baja")
              )}
            </View>

            <Text style={styles.filterLabel}>
              Fecha de solicitud
            </Text>

            <View style={styles.dateRow}>
              {renderDateInput(
                "Desde",
                filters.fechaInicio,
                "Fecha inicial",
                "fechaInicio"
              )}

              {renderDateInput(
                "Hasta",
                filters.fechaFin,
                "Fecha final",
                "fechaFin"
              )}
            </View>

            <TouchableOpacity
              style={styles.clearDateButton}
              onPress={clearSolicitudDates}
            >
              <MaterialCommunityIcons
                name="calendar-remove"
                size={20}
                color="#374151"
              />

              <Text style={styles.clearDateButtonText}>
                Quitar fechas de solicitud
              </Text>
            </TouchableOpacity>

            <Text style={styles.filterLabel}>
              Fecha de solicitud completada
            </Text>

            <View style={styles.dateRow}>
              {renderDateInput(
                "Desde",
                filters.fechaCompletadaInicio,
                "Fecha inicial",
                "fechaCompletadaInicio"
              )}

              {renderDateInput(
                "Hasta",
                filters.fechaCompletadaFin,
                "Fecha final",
                "fechaCompletadaFin"
              )}
            </View>

            <TouchableOpacity
              style={styles.clearDateButton}
              onPress={clearCompletadaDates}
            >
              <MaterialCommunityIcons
                name="calendar-remove"
                size={20}
                color="#374151"
              />

              <Text style={styles.clearDateButtonText}>
                Quitar fechas completadas
              </Text>
            </TouchableOpacity>

            {activeDateFilter && (
              <DateTimePicker
                value={getDateValue(activeDateFilter)}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={onChangeDate}
              />
            )}

            {Platform.OS === "ios" && activeDateFilter && (
              <TouchableOpacity
                style={styles.closeDateButton}
                onPress={() => setActiveDateFilter(null)}
              >
                <Text style={styles.closeDateButtonText}>
                  Listo
                </Text>
              </TouchableOpacity>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={clearFilters}
              >
                <Text style={styles.clearButtonText}>
                  Limpiar todo
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.applyButton}
                onPress={onClose}
              >
                <Text style={styles.applyButtonText}>
                  Aplicar
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  filterModal: {
    width: "100%",
    maxHeight: "85%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111827",
  },

  modalContent: {
    paddingBottom: 5,
  },

  filterLabel: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#374151",
    marginTop: 16,
    marginBottom: 8,
  },

  optionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  filterOption: {
    paddingVertical: 9,
    paddingHorizontal: 13,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginRight: 8,
    marginBottom: 8,
  },

  filterOptionActive: {
    backgroundColor: "#148248",
    borderColor: "#148248",
  },

  filterOptionText: {
    color: "#374151",
    fontWeight: "600",
    fontSize: 13,
  },

  filterOptionTextActive: {
    color: "#FFFFFF",
  },

  dateRow: {
    flexDirection: "row",
    gap: 10,
  },

  dateColumn: {
    flex: 1,
  },

  dateSmallLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 5,
  },

  dateInput: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingVertical: 12,
    paddingLeft: 12,
    paddingRight: 38,
    color: "#111827",
    marginBottom: 10,
  },

  calendarIcon: {
    position: "absolute",
    right: 10,
    top: 11,
  },

  clearDateButton: {
    backgroundColor: "#F3F4F6",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
    marginBottom: 8,
  },

  clearDateButtonText: {
    color: "#374151",
    fontWeight: "bold",
  },

  closeDateButton: {
    backgroundColor: "#148248",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },

  closeDateButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },

  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 24,
  },

  clearButton: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    marginRight: 10,
  },

  clearButtonText: {
    color: "#374151",
    fontWeight: "bold",
  },

  applyButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: "#148248",
  },

  applyButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
});