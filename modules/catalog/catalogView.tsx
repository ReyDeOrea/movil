import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Stack, useRouter } from "expo-router";
import {
  Image,
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
      titulo: "Entradas",
      icono: "inbox-arrow-down",
      ruta: "/entradas",
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
    //{
    // titulo: "Mantenimiento",
    // icono: "cog",
    //  ruta: "/maintenance",
    // },
  ];

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <ScrollView contentContainerStyle={styles.container}>

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
              source={require('../../assets/images/ZUCARMEX.png')}
              style={styles.imageZucarmex}
              resizeMode="contain"
            />
          </View>
        </View>
        <Text style={styles.title}>Catálogos</Text>
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
                color="#b4d2a5"
              />

              <Text style={styles.cardText}>
                {item.titulo}
              </Text>

            </TouchableOpacity>
          ))}

        </View>

      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({

  container: {
    backgroundColor: "#F3F4F6",
    flexGrow: 1,
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    color: "#111827",
  },
  backBtn: {
    position: "absolute",
    left: 15,
    top: 45,
  },
  rowHeader: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: 20,
    justifyContent: "space-between",
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
  card: {
    width: "47%",
    backgroundColor: "#ffffff",
    borderRadius: 15,
    paddingVertical: 25,
    marginBottom: 15,
    alignItems: "center",
    elevation: 3,
  },
  imageZucarmex: {
    width: '45%',
    height: 60,
  },
  cardText: {
    marginTop: 10,
    fontWeight: "bold",
    fontSize: 16,
  },

});