import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View, } from "react-native";
import { DeleteTecnicoExternoUseCase } from "../../application/deleteProveedor";
import { GetTecnicosExternosUseCase } from "../../application/getProveedores";
import { TecnicoExterno } from "../../domain/proveedor";
import { TecnicoExternoDataSource } from "../../infraestructure/proveedorDataSource";
import TecnicoExternoList from "../components/proveedorList";


export default function TecnicosExternosView() {

  const router = useRouter();

  const repository = new TecnicoExternoDataSource();
  const getTecnicos = new GetTecnicosExternosUseCase(repository);
  const deleteTecnico = new DeleteTecnicoExternoUseCase(repository);

  const [tecnicos, setTecnicos] = useState<TecnicoExterno[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadTecnicos();
    }, [])
  );

  const loadTecnicos = async () => {
    try {

      const data =
        await getTecnicos.execute();

      setTecnicos(data);

    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id: number) => {
    router.push({
      pathname: "/editproveedor",
      params: {
        id: id.toString(),
      },
    });
  };

  const handleDelete = async (id: number) => {

    try {

      await deleteTecnico.execute(id);

      loadTecnicos();

    } catch (error: any) {

      alert(error.message);

    }
  };

  if (loading) {

    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );

  }

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

        <Text style={styles.title}>
          Técnicos Externos
        </Text>

        <TecnicoExternoList
          tecnicos={tecnicos}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
        
         <TouchableOpacity
          style={styles.createButton}
          onPress={() => router.push("/createproveedor")}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>


      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
 title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    color: "#111827",
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
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});