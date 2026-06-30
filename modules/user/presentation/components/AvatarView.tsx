import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import { Alert, Button, Image, StyleSheet, View } from "react-native";
import { downloadAvatar } from "../../application/downloadAvatar";
import { uploadAvatarFile } from "../../application/uploadAvatar";

interface Props {
  size: number;
  url: string | null;
  editable?: boolean;
  onUpload?: (filePath: string) => void;
}

export default function AvatarView({
  url,
  size = 150,
  editable = false,
  onUpload,
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const avatarSize = {
    width: size,
    height: size,
  };

  useEffect(() => {
    if (!url) {
      setAvatarUrl(null);
      return;
    }

    if (url.startsWith("file://")) {
      setAvatarUrl(url);
      return;
    }

    if (url.startsWith("http")) {
      setAvatarUrl(url);
      return;
    }

    loadImage(url);
  }, [url]);

  const loadImage = async (path: string) => {
    try {
      const image = await downloadAvatar(path);
      setAvatarUrl(image);
    } catch (error) {
      console.log("Error downloading avatar:", error);
    }
  };

  const uploadImage = async (uri: string, mimeType?: string) => {
    try {
      setAvatarUrl(uri);

      const path = await uploadAvatarFile(uri, mimeType);
      const publicUrl = await downloadAvatar(path);

      setAvatarUrl(publicUrl || uri);

      if (onUpload) {
        onUpload(path);
      }
    } catch (error) {
      Alert.alert("Error", (error as Error).message);
    }
  };

  const pickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets.length > 0) {
      await uploadImage(
        result.assets[0].uri,
        result.assets[0].mimeType
      );
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permiso requerido",
        "Necesitas permitir el uso de la cámara para tomar una foto."
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets.length > 0) {
      await uploadImage(
        result.assets[0].uri,
        result.assets[0].mimeType
      );
    }
  };

  const openImageOptions = () => {
    Alert.alert(
      "Foto de perfil",
      "Elige una opción",
      [
        {
          text: "Galería",
          onPress: async () => {
            try {
              setUploading(true);
              await pickFromGallery();
            } finally {
              setUploading(false);
            }
          },
        },
        {
          text: "Cámara",
          onPress: async () => {
            try {
              setUploading(true);
              await takePhoto();
            } finally {
              setUploading(false);
            }
          },
        },
        {
          text: "Cancelar",
          style: "cancel",
        },
      ]
    );
  };

  return (
    <View style={{ alignItems: "center" }}>
      {avatarUrl ? (
        <Image
          source={{ uri: avatarUrl }}
          style={[avatarSize, styles.avatar, styles.image]}
        />
      ) : (
        <View style={[avatarSize, styles.avatar, styles.placeholder]} />
      )}

      {editable && (
        <Button
          title={uploading ? "Subiendo..." : "Subir foto"}
          onPress={openImageOptions}
          disabled={uploading}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    borderRadius: 100,
    overflow: "hidden",
    maxWidth: "100%",
  },
  image: {
    objectFit: "cover",
    paddingTop: 0,
  },
  placeholder: {
    backgroundColor: "#E5E7EB",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  boton:{
    backgroundColor: '#67B346'
  },
});
