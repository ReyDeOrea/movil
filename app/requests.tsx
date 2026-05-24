import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import RequestsAssigned from "@/modules/requests/presentation/views/RequestAsigned";
import RequestsCompleted from "@/modules/requests/presentation/views/RequestCompleted";
import RequestsInProgress from "@/modules/requests/presentation/views/RequestProgress";
import RequestsReceived from "@/modules/requests/presentation/views/RequestReceived";
import RequestsRejected from "@/modules/requests/presentation/views/RequestRejected";
import RequestsSent from "@/modules/requests/presentation/views/RequestSent";
import { ModalMenu } from "@/modules/user/presentation/components/modalMenu";

export default function Requests() {

  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("enviadas");
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const userData = await AsyncStorage.getItem("user");
    if (!userData) return;

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);

    if (parsedUser.rol === "administrador") {
      setActiveTab("recibidas");
    }
  };

  if (!user) return null;

  const renderContent = () => {
    switch (activeTab) {
      case "recibidas":
        return <RequestsReceived />;
      case "enviadas":
        return <RequestsSent />;
      case "asignadas":
        return <RequestsAssigned />;
      case "proceso":
        return <RequestsInProgress />;
      case "completadas":
        return <RequestsCompleted />;
      case "rechazadas":
        return <RequestsRejected />;
      default:
        return null;
    }
  };

  const renderTab = (key: string, label: string) => (
    <TouchableOpacity
      style={[
        styles.tabButton,
        activeTab === key && styles.activeTab,
      ]}
      onPress={() => setActiveTab(key)}
    >
      <Text
        style={[
          styles.tabText,
          activeTab === key && styles.activeTabText,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.container}>

         <View style={styles.b}>
          <View style={styles.row}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={styles.appName}>ServiceApp</Text>
            <MaterialCommunityIcons
              name="clipboard-text"
              size={32}
              color="#fff"
            />
                  </View>
            <TouchableOpacity
              style={styles.menuBtn}
              onPress={() => setModalOpen(true)}
            >
              <Feather name="menu" size={28} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.body}>

          <View style={styles.topSection}>
            <Text style={styles.title}>Solicitudes</Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tabs}
            >
              {user.rol === "administrador" && (
                <>
                  {renderTab("recibidas", "Recibidas")}
                  {renderTab("proceso", "En proceso")}
                  {renderTab("completadas", "Completadas")}
                  {renderTab("rechazadas", "Rechazadas")}
                </>
              )}

              {user.rol === "tecnico" && (
                <>
                  {renderTab("enviadas", "Enviadas")}
                  {renderTab("asignadas", "Asignadas")}
                  {renderTab("completadas", "Completadas")}
                </>
              )}

              {user.rol === "solicitante" && (
                <>
                  {renderTab("enviadas", "Enviadas")}
                  {renderTab("proceso", "En proceso")}
                  {renderTab("completadas", "Completadas")}
                  {renderTab("rechazadas", "Rechazadas")}
                </>
              )}
            </ScrollView>
          </View>

          <View style={styles.content}>
            {renderContent()}
            <ModalMenu
              visible={modalOpen}
              onClose={() => setModalOpen(false)}
              user={user}
              setUser={setUser}
              onUpdate={() => { }}
            />
          </View>

        </View>
      </View>
    </>
  );
}
const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  row: {
     flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "90%",
    marginVertical: 10,
  },
  appName: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 25,
    marginRight: 6,
  },
  backBtn: {
    position: "absolute",
    left: 15,
    top: 40,
  },
  body: {
    flex: 1,
  },
  topSection: {
    paddingTop: 4,
    paddingBottom: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 4,
    color: "#111827",
  },
  tabs: {
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
    marginRight: 10,
  },
  activeTab: {
    borderBottomColor: "#4F46E5",
  },
  tabText: {
    fontSize: 15,
    color: "#9CA3AF",
  },
  activeTabText: {
    color: "#4F46E5",
    fontWeight: "bold",
  },
  menuBtn: {
  position: "absolute",
  right: 15,
  top: 10, 
  },
  content: {
    flex: 1,
  },
   b: {
    width: "100%",
    height: 100,
    backgroundColor: "#4F46E5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
});