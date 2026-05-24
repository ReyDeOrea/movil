import RequestsReceived from "@/modules/requests/presentation/views/RequestReceived";
import RequestsSent from "@/modules/requests/presentation/views/RequestSent";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Requests() {

  const [activeTab, setActiveTab] = useState<"sent" | "received">("sent");
  const router = useRouter();

  return (
     <>
      <Stack.Screen options={{ headerShown: false }} />
    <View style={styles.container}>

        <View style={styles.b}>

              <TouchableOpacity
                style={styles.backBtn}
                onPress={() => router.back()}
              >
                <MaterialCommunityIcons name="arrow-left" size={28} color="#fff" />
              </TouchableOpacity>

              <View style={styles.row}>
                <Text style={styles.txtN}>Animaland</Text>

                <MaterialCommunityIcons
                  name="dog"
                  size={33}
                  color="#fff"
                />
              </View>

            </View>

      <Text style={styles.title}>Solicitudes de adopción</Text>

      <View style={styles.tabs}>

        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "sent" && styles.activeTab
          ]}
          onPress={() => setActiveTab("sent")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "sent" && styles.activeTabText
            ]}
          >
            Enviadas
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "received" && styles.activeTab
          ]}
          onPress={() => setActiveTab("received")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "received" && styles.activeTabText
            ]}
          >
            Recibidas
          </Text>
        </TouchableOpacity>

      </View>

      <View style={styles.content}>
        {activeTab === "sent" ? < RequestsSent/> : <  RequestsReceived/>}
      </View>

    </View>
     </>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  b: {
    width: "100%",
    height: 100,
    paddingTop: 10,
    backgroundColor: "#B7C979",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10
  },
  row: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center"
  },
  txtN: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 25,
    marginRight: 5
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20
  },
 backBtn: {
    position: "absolute",
    left: 15,
    top: 40
  },
  tabs: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderBottomWidth: 2,
    borderBottomColor: "transparent"
  },
  activeTab: {
    borderBottomColor: "#D09100"
  },
  tabText: {
    fontSize: 16,
    color: "#999"
  },
  activeTabText: {
    color: "#D09100",
    fontWeight: "bold"
  },
  content: {
    flex: 1
  }

});