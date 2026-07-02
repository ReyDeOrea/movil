import FontAwesome from "@expo/vector-icons/FontAwesome";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Stack, useRouter, } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, } from "react-native";
import { loginUser } from "../../application/loginUser";
import { validateLoginData } from "../../application/validateLogin";



export default function LoginForm() {

  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);

      validateLoginData(email, password);

      console.log("EMAIL:", email);
      console.log("PASSWORD:", password);

      const user = await loginUser(email, password);

      console.log("USER:", user);

      router.replace("/requests");

    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (

    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <ScrollView
        contentContainerStyle={styles.container}>

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
              source={require('../../../../assets/images/ZUCARMEX.png')}
              style={styles.imageZucarmex}
              resizeMode="contain"
            />
            {/* <Text style={styles.title}>
              ServiceApp
            </Text>

            <MaterialCommunityIcons
              name="tools"
              size={30}
              color="#FFFFFF"
            /> */}

          </View>

        </View>

        <View style={styles.avatarBox}>

          {/* <Image
          source={require('../../../../assets/images/Cañero.png')}
          style ={styles.imagecanero}
          resizeMode="contain"
          /> */}

          <FontAwesome
            name="user-circle-o"
            size={170}
            color="#D1D5DB"
          /> 

        </View>

        <Text style={styles.txt}>
          ¡Bienvenido a Serviceapp!
        </Text>

        <Text style={styles.txt}>
          Accede a tu cuenta
        </Text>

        <View style={styles.BE}>

          <View style={styles.BI}>

            <FontAwesome
              name="envelope"
              size={22}
              color="#148248"
            />

            <TextInput
              style={styles.txtI}
              placeholder="Correo electrónico"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
            />

          </View>

          <View style={styles.BI}>

            <MaterialIcons
              name="password"
              size={22}
              color="#148248"
            />

            <TextInput
              style={styles.txtI}
              placeholder="Contraseña"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

          </View>

        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          disabled={loading}
        >

          {
            loading ? (
              <ActivityIndicator
                color="#fff"
              />
            ) : (
              <Text style={styles.txtB}>
                Entrar
              </Text>
            )
          }

        </TouchableOpacity>

        <View style={styles.rp}>

          <FontAwesome6
            name="shield-halved"
            size={22}
            color="#148248"
          />

          <TouchableOpacity
            onPress={() => router.push("/password") }
          >

            <Text style={styles.txtRP}>
              ¿Olvidaste tu contraseña?
            </Text>

          </TouchableOpacity>

        </View>

      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({

  container: {
    flexGrow: 1,
    backgroundColor: "#F5F5F5",
    paddingBottom: 40,
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

  rowHeader: {
  flex: 1,
  width: "100%",
  justifyContent: "center",
  alignItems: "center",
},

  title: {
    fontWeight: "bold",
    fontSize: 30,
    color: "#fff",
    marginRight: 6,
  },

  backBtn: {
    position: "absolute",
    left: 15,
    top: 45,
  },

  avatarBox: {
    alignItems: "center",
    marginVertical: 10,
  },

  txt: {
    textAlign: "center",
    marginVertical: 10,
    fontSize: 16,
    color: "#6B7280",
  },

  BE: {
    marginHorizontal: 20,
    marginTop: 10,
  },

  BI: {
    flexDirection: "row",
    alignItems: "center",
   // borderWidth: 1,
    //borderColor: "#d1dbd4",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginVertical: 8,
    backgroundColor: "#fff",
  },

  txtI: {
    fontSize: 16,
    flex: 1,
    marginLeft: 8,
    color: "#000",
  },

  button: {
    backgroundColor: "#232323",
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 60,
    alignSelf: "center",
    marginVertical: 20,
  },

  txtB: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
  txtRP: {
    color: "#00aeff",
    fontWeight: "bold",
    textDecorationLine: "underline",
    marginLeft: 6,
  },

  rp: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 5,
  },
  
  imageZucarmex: {
  width: '45%',
  height: 60,
},

imagecanero:{
 width: '80%',
 height: 190,
},

});