import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { Alert, Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { CreateTecnicoExternoUseCase } from "../../application/createProveedor";
import { TecnicoExternoDataSource } from "../../infraestructure/proveedorDataSource";
import TecnicoExternoForm from "../components/proveedorForm";


export default function CreateTecnicoExternoView() {

  const router = useRouter();

  const repository = new TecnicoExternoDataSource();

  const createTecnico = new CreateTecnicoExternoUseCase(repository);

  const handleCreate = async (
    numTecnicoExterno: number,
    nombre: string,
    empresa: string,
    telefono: string,
    especialidad: string
  ) => {

    try {

      await createTecnico.execute({
        numTecnicoExterno,
        nombre,
        empresa,
        telefono,
        especialidad,
      });

      Alert.alert(
        "Éxito",
        "Técnico creado"
      );

      router.back();

    } catch (error: any) {

      Alert.alert(
        "Error",
        error.message
      );

    }
  };

  return (
  <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <View style={styles.container}>
        
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() =>
              router.back()
            }
          >

            <MaterialCommunityIcons
              name="arrow-left"
              size={28}
              color="#FFFFFF"
            />

          </TouchableOpacity>

          <View style={styles.rowHeader}>
            <Image
              source={require('../../../../../assets/images/ZUCARMEX.png')}
              style={styles.imageZucarmex}
              resizeMode="contain"
            />
          </View>
        </View>

      <TecnicoExternoForm
        onSubmit={handleCreate}
      />

    </View>
    </>
  );
}
const styles = StyleSheet.create({
  container: {
    flex:1,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  loading: {
    marginTop: 40,
    textAlign: "center",
  },
  rowHeader: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  backBtn: {
    position: "absolute",
    left: 15,
    top: 45,
  },
  imageZucarmex: {
    width: '45%',
    height: 60,
  },
  header: {
    width: "100%",
    height: 100,
    paddingTop: 35,
    backgroundColor: "#148248",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  createButton: {
    position: "absolute",
    bottom: 60,
    right: 20,
    backgroundColor: "#67B346",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center"
  },
  fabText: {
    color: "white",
    fontSize: 30
  },
});
