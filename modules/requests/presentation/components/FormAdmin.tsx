import { MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

import { api } from "@/lib/api";
import { validateAdminAssignment } from "../../application/validateAdminAssignment";
import { Prioridad } from "../../domain/request";
import { SupabaseRequestsRepository } from "../../infraestructure/requestsDatasurce";
import EditRequestModal from "./ModalEditRequestAdmin";

type TipoTecnico = "externo" | "interno" | "ambos";

type TecnicoOption = {
  value: string;
  label: string;
  tipo: "interno" | "externo";
  id: number;
};

const repository = new SupabaseRequestsRepository();

const dateToApi = (date: Date) => {
  return date.toLocaleDateString("en-CA");
};

const parseRequestParam = (value: string | string[] | undefined) => {
  if (!value || Array.isArray(value)) return null;

  try {
    return JSON.parse(value);
  } catch {
    try {
      return JSON.parse(decodeURIComponent(value));
    } catch {
      return null;
    }
  }
};

const getIdFromPickerValue = (value: string) => {
  const id = value.split("-")[1];
  return Number(id);
};

export default function FormAdmin() {
  const router = useRouter();
  const { request } = useLocalSearchParams();
  const { width, height } = useWindowDimensions();

  const data = useMemo(() => parseRequestParam(request), [request]);

  const [solicitud, setSolicitud] = useState<any>(data);

  const [modalVisible, setModalVisible] = useState(false);
  const [tipoTecnico, setTipoTecnico] = useState<TipoTecnico>("interno");
  const [tecnicoInternoAsignado, setTecnicoInternoAsignado] = useState("");
  const [tecnicoExternoAsignado, setTecnicoExternoAsignado] = useState("");
  const [fechaAsignada] = useState(
    new Date().toLocaleDateString("en-CA")
  );
  const [fechaInicio, setFechaInicio] = useState(new Date());
  const [fechaFin, setFechaFin] = useState(new Date());
  const [showInicio, setShowInicio] = useState(false);
  const [showFin, setShowFin] = useState(false);
  const [prioridad, setPrioridad] = useState<Prioridad>("media");
  const [tecnicosInternos, setTecnicosInternos] = useState<
    TecnicoOption[]
  >([]);
  const [tecnicosExternos, setTecnicosExternos] = useState<
    TecnicoOption[]
  >([]);

  const isSmallScreen = width < 370 || height < 650;
  const isTablet = width >= 700;
  const isLandscape = width > height;
  const useTwoColumns = isTablet || (isLandscape && width >= 680);

  const contentWidth = Math.max(
    280,
    Math.min(width - (isTablet ? 64 : 24), 920)
  );

  const logoWidth = isTablet ? 195 : isSmallScreen ? 132 : 160;

  useEffect(() => {
    setSolicitud(data);
  }, [data]);

  useEffect(() => {
    cargarTecnicos();
  }, []);

  useEffect(() => {
    setTecnicoInternoAsignado("");
    setTecnicoExternoAsignado("");
  }, [tipoTecnico]);

  const cargarTecnicos = async () => {
    try {
      const [usuariosResponse, externosResponse] = await Promise.all([
        api.get("/usuarios/"),
        api.get("/tecnicos-externos/"),
      ]);

      const internos: TecnicoOption[] = (usuariosResponse.data ?? [])
        .filter((user: any) => Number(user.numrol) === 3)
        .map((user: any) => ({
          value: `interno-${user.numusuario}`,
          label: `${user.nombre} - Interno`,
          tipo: "interno",
          id: Number(user.numusuario),
        }));

      const externos: TecnicoOption[] = (externosResponse.data ?? []).map(
        (tecnico: any) => ({
          value: `externo-${tecnico.numtecnicoexterno}`,
          label: `${tecnico.nombre} - Externo${
            tecnico.empresa ? ` (${tecnico.empresa})` : ""
          }`,
          tipo: "externo",
          id: Number(tecnico.numtecnicoexterno),
        })
      );

      setTecnicosInternos(internos);
      setTecnicosExternos(externos);
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message || "No se pudieron cargar los técnicos"
      );
    }
  };

  const getTipo = (tipo: number) =>
    tipo === 1
      ? "Servicio"
      : tipo === 2
        ? "Mantenimiento"
        : "Desconocido";

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
    { background: string; text: string }
  > = {
    1: { background: "#E5E7EB", text: "#4B5563" },
    2: { background: "#FEF3C7", text: "#92400E" },
    3: { background: "#DBEAFE", text: "#1E40AF" },
    4: { background: "#D1FAE5", text: "#065F46" },
    5: { background: "#FECACA", text: "#991B1B" },
  };

  const getStatusStyle = (status: number) =>
    statusColors[status] ?? statusColors[1];

  const getStatusName = (estado: number) => {
    switch (estado) {
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

  const getStatusIcon = (estado: number) => {
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

  const getArea = (area: number | string) => {
    switch (Number(area)) {
      case 1:
        return "Administración";
      case 2:
        return "Fábrica";
      case 3:
        return "Campo";
      case 4:
        return "Zona habitacional";
      default:
        return "Desconocido";
    }
  };

  const formatDate = (date?: string | Date | null) => {
    if (!date) return "No asignada";

    if (date instanceof Date) {
      return date.toLocaleDateString();
    }

    const cleanDate = String(date).split(/[T ]/)[0];
    const parts = cleanDate.split("-");

    if (parts.length === 3) {
      const [year, month, day] = parts;
      return `${day}/${month}/${year}`;
    }

    return String(date);
  };

  const technicianOptions: Array<{
    value: TipoTecnico;
    label: string;
    description: string;
    icon: string;
  }> = [
    {
      value: "interno",
      label: "Interno",
      description: "Personal de la organización",
      icon: "account-hard-hat-outline",
    },
    {
      value: "externo",
      label: "Externo",
      description: "Proveedor o contratista",
      icon: "domain",
    },
    {
      value: "ambos",
      label: "Ambos",
      description: "Técnico interno y externo",
      icon: "account-multiple-outline",
    },
  ];

  const priorityColors: Record<
    string,
    { background: string; text: string; border: string }
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

  const getPriorityIcon = (value: string) => {
    switch (value) {
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

  const guardar = async () => {
    try {
      if (!solicitud?.numSolicitud) {
        Alert.alert("Error", "No se encontró el número de solicitud");
        return;
      }

      validateAdminAssignment({
        tipoTecnico,
        tecnicoInternoAsignado,
        tecnicoExternoAsignado,
        fechaInicio,
        fechaFin,
        prioridad,
      });

      await repository.updateRequest(solicitud.numSolicitud, {
        fechaAsignacion: fechaAsignada,
        fechaProgInicio: dateToApi(fechaInicio),
        fechaProgFin: dateToApi(fechaFin),
        prioridad,
        numStatus: 2,
      });

      if (tipoTecnico === "interno" || tipoTecnico === "ambos") {
        await repository.assignInternalTechnician(
          solicitud.numSolicitud,
          getIdFromPickerValue(tecnicoInternoAsignado)
        );
      }

      if (tipoTecnico === "externo" || tipoTecnico === "ambos") {
        await repository.assignExternalTechnician(
          solicitud.numSolicitud,
          getIdFromPickerValue(tecnicoExternoAsignado)
        );
      }

      Alert.alert("OK", "Solicitud asignada correctamente");
      router.replace("/requests");
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message || "No se pudo guardar la asignación"
      );
    }
  };

  if (!data || !solicitud) {
    return (
      <SafeAreaView style={styles.emptySafeArea}>
        <Stack.Screen options={{ headerShown: false }} />

        <View style={styles.emptyState}>
          <View style={styles.emptyIconBox}>
            <MaterialCommunityIcons
              name="file-alert-outline"
              size={48}
              color="#148248"
            />
          </View>

          <Text style={styles.emptyTitle}>Solicitud no encontrada</Text>
          <Text style={styles.emptyText}>
            No fue posible recuperar la información de la solicitud.
          </Text>

          <TouchableOpacity
            style={styles.returnButton}
            onPress={() => router.back()}
            activeOpacity={0.82}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={20}
              color="#FFFFFF"
            />
            <Text style={styles.returnButtonText}>Regresar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const statusStyle = getStatusStyle(solicitud.numStatus);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.screen}>
          <View
            style={[
              styles.header,
              isTablet && styles.headerTablet,
              isSmallScreen && styles.headerSmall,
            ]}
          >
            <View style={styles.headerDecorationOne} />
            <View style={styles.headerDecorationTwo} />

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.8}
              accessibilityLabel="Regresar"
            >
              <MaterialCommunityIcons
                name="arrow-left"
                size={25}
                color="#FFFFFF"
              />
            </TouchableOpacity>

            <View style={styles.headerCenter}>
              <Image
                source={require("../../../../assets/images/ZUCARMEX.png")}
                style={[styles.imageZucarmex, { width: logoWidth }]}
                resizeMode="contain"
              />
            </View>

            <View style={styles.headerSpacer} />
          </View>

          <ScrollView
            style={styles.container}
            contentContainerStyle={[
              styles.scrollContent,
              isTablet && styles.scrollContentTablet,
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={[styles.content, { width: contentWidth }]}>

              <View style={styles.introCenteredContainer}>
                <View style={styles.introIconBox}>
                  <MaterialCommunityIcons
                    name="account-cog-outline"
                    size={29}
                    color="#148248"
                  />
                </View>

                <Text style={styles.introTitle}>Asignar solicitud</Text>

                <Text style={styles.introSubtitle}>
                  Revisa la información y configura la asignación técnica.
                </Text>
              </View>

              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.requestTypeIcon}>
                    <MaterialCommunityIcons
                      name={getTipoIcon(solicitud.numTipo) as any}
                      size={27}
                      color="#148248"
                    />
                  </View>

                  <View style={styles.cardHeaderText}>
                    <Text style={styles.requestType}>
                    Información de solicitud 
                    </Text>
                  <Text style={styles.introSubtitle}>Datos proporcionados por el solicitante</Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View
                  style={[
                    styles.infoGrid,
                    useTwoColumns && styles.infoGridColumns,
                  ]}
                >
                  <View
                    style={[
                      styles.infoBox,
                      useTwoColumns && styles.infoBoxHalf,
                      useTwoColumns && styles.infoBoxSpacingRight,
                    ]}
                  >
                    <View style={styles.infoIconBox}>
                      <MaterialCommunityIcons
                        name="calendar-outline"
                        size={19}
                        color="#148248"
                      />
                    </View>
                    <View style={styles.infoTextContainer}>
                      <Text style={styles.infoLabel}>Fecha</Text>
                      <Text style={styles.infoValue}>
                        {formatDate(solicitud.fecha)}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.infoBox,
                      useTwoColumns && styles.infoBoxHalf,
                    ]}
                  >
                    <View style={styles.infoIconBox}>
                      <MaterialCommunityIcons
                        name="account-outline"
                        size={19}
                        color="#148248"
                      />
                    </View>
                    <View style={styles.infoTextContainer}>
                      <Text style={styles.infoLabel}>Solicitante</Text>
                      <Text style={styles.infoValue} numberOfLines={2}>
                        {solicitud.nombreSolicitante || "Sin nombre"}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.infoBox}>
                  <View style={styles.infoIconBox}>
                    <MaterialCommunityIcons
                      name="map-marker-outline"
                      size={19}
                      color="#148248"
                    />
                  </View>
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoLabel}>Área</Text>
                    <Text style={styles.infoValue}>
                      {getArea(solicitud.numArea)}
                    </Text>
                  </View>
                </View>

                <View style={styles.descriptionBox}>
                  <View style={styles.descriptionHeader}>
                    <MaterialCommunityIcons
                      name="text-box-outline"
                      size={19}
                      color="#65716B"
                    />
                    <Text style={styles.descriptionLabel}>Descripción</Text>
                  </View>

                  <Text style={styles.descriptionText}>
                    {solicitud.descripcion || "Sin descripción"}
                  </Text>
                </View>

                <View style={styles.statusSection}>
                  <View style={styles.statusSectionHeader}>
                    <MaterialCommunityIcons
                      name="list-status"
                      size={18}
                      color="#65716B"
                    />
                    <Text style={styles.statusSectionLabel}>Estatus</Text>
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: statusStyle.background },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={getStatusIcon(solicitud.numStatus) as any}
                      size={16}
                      color={statusStyle.text}
                    />

                    <Text
                      style={[
                        styles.statusText,
                        { color: statusStyle.text },
                      ]}
                    >
                      {getStatusName(solicitud.numStatus)}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => setModalVisible(true)}
                  activeOpacity={0.84}
                  accessibilityLabel="Editar información de la solicitud"
                >
                  <Text style={styles.editButtonText}>
                    Editar información
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.card}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIconBox}>
                    <MaterialCommunityIcons
                      name="account-hard-hat-outline"
                      size={23}
                      color="#148248"
                    />
                  </View>

                  <View style={styles.sectionTitleContainer}>
                    <Text style={styles.sectionTitle}>Asignación</Text>
                    <Text style={styles.sectionSubtitle}>
                      Selecciona técnicos, fechas programadas y prioridad.
                    </Text>
                  </View>
                </View>

                <View style={styles.fieldGroup}>
                  <View style={styles.labelRow}>
                    <MaterialCommunityIcons
                      name="calendar-check-outline"
                      size={17}
                      color="#148248"
                    />
                    <Text style={styles.label}>Fecha asignada</Text>
                  </View>

                  <View style={styles.disabledField}>
                    <Text style={styles.disabledValue}>
                      {formatDate(fechaAsignada)}
                    </Text>
                  </View>
                </View>

                <View style={styles.fieldGroup}>
                  <View style={styles.labelRow}>
                    <MaterialCommunityIcons
                      name="account-switch-outline"
                      size={17}
                      color="#148248"
                    />
                    <Text style={styles.label}>Tipo de técnico</Text>
                  </View>

                  <View
                    style={[
                      styles.technicianOptions,
                      useTwoColumns && styles.technicianOptionsRow,
                    ]}
                  >
                    {technicianOptions.map((option) => {
                      const selected = tipoTecnico === option.value;

                      return (
                        <TouchableOpacity
                          key={option.value}
                          style={[
                            styles.technicianOption,
                            useTwoColumns &&
                              styles.technicianOptionResponsive,
                            selected && styles.technicianOptionSelected,
                          ]}
                          onPress={() => setTipoTecnico(option.value)}
                          activeOpacity={0.82}
                        >
                          <View
                            style={[
                              styles.technicianOptionIcon,
                              selected &&
                                styles.technicianOptionIconSelected,
                            ]}
                          >
                            <MaterialCommunityIcons
                              name={option.icon as any}
                              size={22}
                              color={selected ? "#FFFFFF" : "#148248"}
                            />
                          </View>

                          <View style={styles.technicianOptionText}>
                            <Text
                              style={[
                                styles.technicianOptionTitle,
                                selected &&
                                  styles.technicianOptionTitleSelected,
                              ]}
                            >
                              {option.label}
                            </Text>
                            <Text style={styles.technicianOptionDescription}>
                              {option.description}
                            </Text>
                          </View>

                          <MaterialCommunityIcons
                            name={
                              selected
                                ? "check-circle"
                                : "circle-outline"
                            }
                            size={21}
                            color={selected ? "#148248" : "#A1AAA5"}
                          />
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                <View
                  style={[
                    styles.pickersGrid,
                    tipoTecnico === "ambos" &&
                      useTwoColumns &&
                      styles.pickersGridColumns,
                  ]}
                >
                  {(tipoTecnico === "interno" ||
                    tipoTecnico === "ambos") && (
                    <View
                      style={[
                        styles.fieldGroup,
                        tipoTecnico === "ambos" &&
                          useTwoColumns &&
                          styles.fieldHalf,
                        tipoTecnico === "ambos" &&
                          useTwoColumns &&
                          styles.fieldSpacingRight,
                      ]}
                    >
                      <View style={styles.labelRow}>
                        <MaterialCommunityIcons
                          name="account-hard-hat-outline"
                          size={17}
                          color="#148248"
                        />
                        <Text style={styles.label}>Técnico interno</Text>
                      </View>

                      <View style={styles.pickerContainer}>
                        <Picker
                          selectedValue={tecnicoInternoAsignado}
                          onValueChange={(itemValue) =>
                            setTecnicoInternoAsignado(String(itemValue))
                          }
                          style={styles.picker}
                          dropdownIconColor="#148248"
                        >
                          <Picker.Item
                            label="Seleccionar técnico interno..."
                            value=""
                            enabled={false}
                            color="#999999"
                          />

                          {tecnicosInternos.map((tecnico) => (
                            <Picker.Item
                              key={tecnico.value}
                              label={tecnico.label}
                              value={tecnico.value}
                            />
                          ))}
                        </Picker>
                      </View>
                    </View>
                  )}

                  {(tipoTecnico === "externo" ||
                    tipoTecnico === "ambos") && (
                    <View
                      style={[
                        styles.fieldGroup,
                        tipoTecnico === "ambos" &&
                          useTwoColumns &&
                          styles.fieldHalf,
                      ]}
                    >
                      <View style={styles.labelRow}>
                        <MaterialCommunityIcons
                          name="domain"
                          size={17}
                          color="#148248"
                        />
                        <Text style={styles.label}>Técnico externo</Text>
                      </View>

                      <View style={styles.pickerContainer}>
                        <Picker
                          selectedValue={tecnicoExternoAsignado}
                          onValueChange={(itemValue) =>
                            setTecnicoExternoAsignado(String(itemValue))
                          }
                          style={styles.picker}
                          dropdownIconColor="#148248"
                        >
                          <Picker.Item
                            label="Seleccionar técnico externo..."
                            value=""
                            enabled={false}
                            color="#999999"
                          />

                          {tecnicosExternos.map((tecnico) => (
                            <Picker.Item
                              key={tecnico.value}
                              label={tecnico.label}
                              value={tecnico.value}
                            />
                          ))}
                        </Picker>
                      </View>
                    </View>
                  )}
                </View>

                <View
                  style={[
                    styles.dateGrid,
                    useTwoColumns && styles.dateGridColumns,
                  ]}
                >
                  <View
                    style={[
                      styles.fieldGroup,
                      useTwoColumns && styles.fieldHalf,
                      useTwoColumns && styles.fieldSpacingRight,
                    ]}
                  >
                    <View style={styles.labelRow}>
                      <MaterialCommunityIcons
                        name="calendar-start-outline"
                        size={17}
                        color="#148248"
                      />
                      <Text style={styles.label}>Fecha de inicio</Text>
                    </View>

                    <TouchableOpacity
                      onPress={() => setShowInicio(true)}
                      style={styles.dateButton}
                      activeOpacity={0.82}
                    >
                      <View style={styles.dateButtonIcon}>
                        <MaterialCommunityIcons
                          name="calendar-outline"
                          size={19}
                          color="#148248"
                        />
                      </View>
                      <Text style={styles.dateButtonText}>
                        {fechaInicio.toLocaleDateString()}
                      </Text>
                      <MaterialCommunityIcons
                        name="chevron-down"
                        size={22}
                        color="#7B8680"
                      />
                    </TouchableOpacity>

                    {showInicio && (
                      <DateTimePicker
                        value={fechaInicio}
                        mode="date"
                        onChange={(_, d) => {
                          setShowInicio(false);
                          if (d) setFechaInicio(d);
                        }}
                      />
                    )}
                  </View>

                  <View
                    style={[
                      styles.fieldGroup,
                      useTwoColumns && styles.fieldHalf,
                    ]}
                  >
                    <View style={styles.labelRow}>
                      <MaterialCommunityIcons
                        name="calendar-end-outline"
                        size={17}
                        color="#148248"
                      />
                      <Text style={styles.label}>Fecha de fin</Text>
                    </View>

                    <TouchableOpacity
                      onPress={() => setShowFin(true)}
                      style={styles.dateButton}
                      activeOpacity={0.82}
                    >
                      <View style={styles.dateButtonIcon}>
                        <MaterialCommunityIcons
                          name="calendar-outline"
                          size={19}
                          color="#148248"
                        />
                      </View>
                      <Text style={styles.dateButtonText}>
                        {fechaFin.toLocaleDateString()}
                      </Text>
                      <MaterialCommunityIcons
                        name="chevron-down"
                        size={22}
                        color="#7B8680"
                      />
                    </TouchableOpacity>

                    {showFin && (
                      <DateTimePicker
                        value={fechaFin}
                        mode="date"
                        onChange={(_, d) => {
                          setShowFin(false);
                          if (d) setFechaFin(d);
                        }}
                      />
                    )}
                  </View>
                </View>

                <View style={[styles.fieldGroup, styles.fieldGroupLast]}>
                  <View style={styles.labelRow}>
                    <MaterialCommunityIcons
                      name="flag-outline"
                      size={17}
                      color="#148248"
                    />
                    <Text style={styles.label}>Prioridad</Text>
                  </View>

                  <View
                    style={[
                      styles.priorityOptions,
                      useTwoColumns && styles.priorityOptionsRow,
                    ]}
                  >
                    {(["baja", "media", "alta"] as Prioridad[]).map(
                      (priorityValue) => {
                        const selected = prioridad === priorityValue;
                        const priorityStyle =
                          priorityColors[priorityValue] ??
                          priorityColors.media;

                        return (
                          <TouchableOpacity
                            key={priorityValue}
                            style={[
                              styles.priorityOption,
                              useTwoColumns &&
                                styles.priorityOptionResponsive,
                              {
                                backgroundColor:
                                  priorityStyle.background,
                                borderColor: priorityStyle.border,
                              },
                              selected &&
                                styles.priorityOptionSelected,
                            ]}
                            onPress={() => setPrioridad(priorityValue)}
                            activeOpacity={0.82}
                          >
                            <View
                              style={[
                                styles.priorityIconBox,
                                {
                                  borderColor: priorityStyle.border,
                                },
                              ]}
                            >
                              <MaterialCommunityIcons
                                name={
                                  getPriorityIcon(priorityValue) as any
                                }
                                size={21}
                                color={priorityStyle.text}
                              />
                            </View>

                            <View style={styles.priorityTextContainer}>
                              <Text
                                style={[
                                  styles.priorityLabel,
                                  { color: priorityStyle.text },
                                ]}
                              >
                                Prioridad
                              </Text>
                              <Text
                                style={[
                                  styles.priorityValue,
                                  { color: priorityStyle.text },
                                ]}
                              >
                                {priorityValue}
                              </Text>
                            </View>

                            <MaterialCommunityIcons
                              name={
                                selected
                                  ? "check-circle"
                                  : "circle-outline"
                              }
                              size={21}
                              color={
                                selected
                                  ? priorityStyle.text
                                  : "#A5ADA9"
                              }
                            />
                          </TouchableOpacity>
                        );
                      }
                    )}
                  </View>
                </View>
              </View>

              <View
                style={[
                  styles.actionsContainer,
                  useTwoColumns && styles.actionsContainerRow,
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    useTwoColumns && styles.actionButtonHalf,
                  ]}
                  onPress={guardar}
                  activeOpacity={0.84}
                  accessibilityLabel="Guardar asignación"
                >
                  <Text style={styles.actionButtonText}>Guardar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.cancelButton,
                    useTwoColumns && styles.actionButtonHalf,
                    useTwoColumns && styles.cancelButtonRow,
                  ]}
                  onPress={() => router.back()}
                  activeOpacity={0.84}
                  accessibilityLabel="Cancelar"
                >
                  <Text style={styles.actionButtonText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          <EditRequestModal
            visible={modalVisible}
            solicitud={solicitud}
            onClose={() => setModalVisible(false)}
            onUpdated={(solicitudActualizada) => {
              setSolicitud(solicitudActualizada);
            }}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const cardShadow = Platform.select({
  android: {
    elevation: 3,
  },
  ios: {
    shadowColor: "#000000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },
});

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#148248",
  },

  emptySafeArea: {
    flex: 1,
    backgroundColor: "#F1F5F3",
  },

  keyboardView: {
    flex: 1,
  },

  screen: {
    flex: 1,
    backgroundColor: "#F1F5F3",
  },

  header: {
    minHeight: 86,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
    backgroundColor: "#148248",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },

  headerTablet: {
    minHeight: 96,
    paddingHorizontal: 28,
  },

  headerSmall: {
    minHeight: 76,
    paddingVertical: 8,
  },

  headerDecorationOne: {
    position: "absolute",
    top: -55,
    right: -28,
    width: 145,
    height: 145,
    borderRadius: 73,
    backgroundColor: "rgba(255,255,255,0.08)",
  },

  headerDecorationTwo: {
    position: "absolute",
    bottom: -48,
    left: 72,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "rgba(255,255,255,0.05)",
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    zIndex: 2,
  },

  headerCenter: {
    flex: 1,
    minWidth: 0,
    justifyContent: "center",
    alignItems: "center",
  },

  headerSpacer: {
    width: 44,
    height: 44,
  },

  imageZucarmex: {
    height: 58,
  },

  container: {
    flex: 1,
    backgroundColor: "#F1F5F3",
  },

  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    paddingTop: 14,
    paddingBottom: 48,
  },

  scrollContentTablet: {
    paddingTop: 22,
    paddingBottom: 70,
  },

  content: {
    alignSelf: "center",
  },

  introCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E7E3",
    borderRadius: 18,
    padding: 15,
    marginBottom: 12,
    ...cardShadow,
  },

  introCenteredContainer: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 4,
    marginBottom: 16,
  },

  introIconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8F3ED",
    borderWidth: 1,
    borderColor: "#D6EADF",
    marginBottom: 10,
    flexShrink: 0,
  },

  introTextContainer: {
    width: "100%",
    alignItems: "center",
  },

  introTitle: {
    color: "#243029",
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "800",
    textAlign: "center",
  },

  introSubtitle: {
    maxWidth: 390,
    color: "#748079",
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "500",
    textAlign: "center",
    marginTop: 3,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E7E3",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    ...cardShadow,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  requestTypeIcon: {
    width: 49,
    height: 49,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8F3ED",
    marginRight: 11,
    flexShrink: 0,
  },

  cardHeaderText: {
    flex: 1,
    minWidth: 0,
    marginRight: 8,
  },

  requestType: {
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

  statusBadge: {
    minHeight: 34,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 17,
    paddingHorizontal: 10,
    paddingVertical: 7,
    flexShrink: 0,
  },

  statusText: {
    fontSize: 11,
    fontWeight: "800",
    marginLeft: 5,
  },

  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "#EDF1EF",
    marginTop: 14,
    marginBottom: 13,
  },

  infoGrid: {
    width: "100%",
  },

  infoGridColumns: {
    flexDirection: "row",
    alignItems: "stretch",
  },

  infoBox: {
    minHeight: 59,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F9F8",
    borderWidth: 1,
    borderColor: "#E8EDEB",
    borderRadius: 13,
    paddingHorizontal: 10,
    paddingVertical: 9,
    marginBottom: 9,
  },

  infoBoxHalf: {
    flex: 1,
  },

  infoBoxSpacingRight: {
    marginRight: 9,
  },

  infoIconBox: {
    width: 35,
    height: 35,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8F3ED",
    marginRight: 9,
    flexShrink: 0,
  },

  infoTextContainer: {
    flex: 1,
    minWidth: 0,
  },

  infoLabel: {
    color: "#7A837E",
    fontSize: 10,
    fontWeight: "600",
  },

  infoValue: {
    color: "#27332D",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "800",
    marginTop: 2,
  },

  descriptionBox: {
    backgroundColor: "#F7F9F8",
    borderWidth: 1,
    borderColor: "#E8EDEB",
    borderRadius: 13,
    padding: 11,
    marginBottom: 13,
  },

  descriptionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 7,
  },

  descriptionLabel: {
    color: "#65716B",
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
    backgroundColor: "#F7F9F8",
    borderWidth: 1,
    borderColor: "#E8EDEB",
    borderRadius: 13,
    padding: 11,
    marginBottom: 13,
  },

  statusSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 9,
  },

  statusSectionLabel: {
    color: "#65716B",
    fontSize: 11,
    fontWeight: "800",
    marginLeft: 6,
  },

  editButton: {
    minHeight: 48,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#232323",
    borderRadius: 13,
    paddingHorizontal: 15,
    paddingVertical: 11,
  },

  editButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
    marginLeft: 7,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },

  sectionIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8F3ED",
    marginRight: 10,
    flexShrink: 0,
  },

  sectionTitleContainer: {
    flex: 1,
    minWidth: 0,
  },

  sectionTitle: {
    color: "#27332D",
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "800",
  },

  sectionSubtitle: {
    color: "#7A847F",
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "500",
    marginTop: 2,
  },

  fieldGroup: {
    width: "100%",
    marginBottom: 16,
  },

  fieldGroupLast: {
    marginBottom: 0,
  },

  fieldHalf: {
    flex: 1,
    width: undefined,
  },

  fieldSpacingRight: {
    marginRight: 12,
  },

  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 7,
  },

  label: {
    color: "#3F4A44",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "800",
    marginLeft: 6,
  },

  disabledField: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EDF2EF",
    borderWidth: 1,
    borderColor: "#D8E0DC",
    borderRadius: 13,
    paddingHorizontal: 12,
  },

  disabledValue: {
    flex: 1,
    color: "#66716B",
    fontSize: 14,
    fontWeight: "700",
  },

  technicianOptions: {
    width: "100%",
  },

  technicianOptionsRow: {
    flexDirection: "row",
    alignItems: "stretch",
  },

  technicianOption: {
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F9F8",
    borderWidth: 1,
    borderColor: "#E2E8E4",
    borderRadius: 14,
    padding: 11,
    marginBottom: 9,
  },

  technicianOptionResponsive: {
    flex: 1,
    marginRight: 8,
  },

  technicianOptionSelected: {
    backgroundColor: "#E8F3ED",
    borderColor: "#9ECAB3",
  },

  technicianOptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8F3ED",
    marginRight: 9,
    flexShrink: 0,
  },

  technicianOptionIconSelected: {
    backgroundColor: "#148248",
  },

  technicianOptionText: {
    flex: 1,
    minWidth: 0,
    marginRight: 5,
  },

  technicianOptionTitle: {
    color: "#36413B",
    fontSize: 13,
    fontWeight: "800",
    textTransform: "capitalize",
  },

  technicianOptionTitleSelected: {
    color: "#148248",
  },

  technicianOptionDescription: {
    color: "#7D8782",
    fontSize: 10,
    lineHeight: 14,
    marginTop: 2,
  },

  pickersGrid: {
    width: "100%",
  },

  pickersGridColumns: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  pickerContainer: {
    minHeight: 52,
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DCE3DF",
    borderRadius: 13,
  },

  picker: {
    color: "#27332D",
    backgroundColor: "transparent",
  },

  dateGrid: {
    width: "100%",
  },

  dateGridColumns: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  dateButton: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DCE3DF",
    borderRadius: 13,
    paddingHorizontal: 10,
  },

  dateButtonIcon: {
    width: 35,
    height: 35,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8F3ED",
    marginRight: 9,
    flexShrink: 0,
  },

  dateButtonText: {
    flex: 1,
    color: "#27332D",
    fontSize: 13,
    fontWeight: "700",
  },

  priorityOptions: {
    width: "100%",
  },

  priorityOptionsRow: {
    flexDirection: "row",
    alignItems: "stretch",
  },

  priorityOption: {
    minHeight: 66,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 14,
    padding: 11,
    marginBottom: 9,
  },

  priorityOptionResponsive: {
    flex: 1,
    marginRight: 8,
  },

  priorityOptionSelected: {
    borderWidth: 2,
  },

  priorityIconBox: {
    width: 39,
    height: 39,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.6)",
    borderWidth: 1,
    marginRight: 9,
    flexShrink: 0,
  },

  priorityTextContainer: {
    flex: 1,
    minWidth: 0,
  },

  priorityLabel: {
    fontSize: 10,
    fontWeight: "600",
  },

  priorityValue: {
    fontSize: 13,
    fontWeight: "800",
    textTransform: "capitalize",
    marginTop: 2,
  },

  actionsContainer: {
    width: "100%",
    marginTop: 2,
  },

  actionsContainerRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  actionButtonHalf: {
    flex: 1,
  },

  saveButton: {
    minHeight: 52,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#232323",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
    marginBottom: 10,
    ...Platform.select({
      android: {
        elevation: 2,
      },
      ios: {
        shadowColor: "#000000",
        shadowOpacity: 0.17,
        shadowRadius: 5,
        shadowOffset: {
          width: 0,
          height: 2,
        },
      },
    }),
  },

  cancelButton: {
    minHeight: 52,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#870C0C",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
    marginBottom: 10,
    ...Platform.select({
      android: {
        elevation: 2,
      },
      ios: {
        shadowColor: "#500505",
        shadowOpacity: 0.2,
        shadowRadius: 5,
        shadowOffset: {
          width: 0,
          height: 2,
        },
      },
    }),
  },

  cancelButtonRow: {
    marginLeft: 12,
  },

  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
    marginLeft: 8,
  },

  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 25,
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
    maxWidth: 360,
    color: "#737B87",
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 6,
  },

  returnButton: {
    minHeight: 46,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#232323",
    borderRadius: 13,
    paddingHorizontal: 17,
    marginTop: 18,
  },

  returnButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
    marginLeft: 7,
  },
});