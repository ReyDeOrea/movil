import AsyncStorage from "@react-native-async-storage/async-storage";

export const getUserProfile = async () => {
  const u = await AsyncStorage.getItem("user");
  if (!u) return null;
  return JSON.parse(u);
};