import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function CatalogosView() {

  const router = useRouter();

  const catalogos = [
    {
      titulo: "Materiales",
      icono: "hammer",
      ruta: "/materials",
    },
    {
      titulo: "Servicios",
      icono: "briefcase-cog",
      ruta: "/services",
    },
    {
      titulo: "Proveedores",
      icono: "truck",
      ruta: "/proveedor",
    },
    {
      titulo: "Cuentas",
      icono: "account-group",
      ruta: "/user",
    },
    {
      titulo: "Mantenimiento",
      icono: "cog",
      ruta: "/maintenance",
    },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>

      <Text style={styles.title}>
        Catálogos
      </Text>

      <View style={styles.grid}>

        {catalogos.map((item) => (
          <TouchableOpacity
            key={item.titulo}
            style={styles.card}
            onPress={() => router.push(item.ruta as any)}
          >
            <MaterialCommunityIcons
              name={item.icono as any}
              size={55}
              color="#4F46E5"
            />

            <Text style={styles.cardText}>
              {item.titulo}
            </Text>

          </TouchableOpacity>
        ))}

      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({

  container: {
    padding: 20,
    backgroundColor: "#F3F4F6",
    flexGrow: 1,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 25,
    textAlign: "center",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  card: {
    width: "47%",
    backgroundColor: "#FFF",
    borderRadius: 15,
    paddingVertical: 25,
    marginBottom: 15,
    alignItems: "center",
    elevation: 3,
  },

  cardText: {
    marginTop: 10,
    fontWeight: "bold",
    fontSize: 16,
  },

});