import { useRouter } from "expo-router";
import { Alert, View } from "react-native";

import { CreateMaterialUseCase } from "../../application/createMaterials";
import { TipoMaterial } from "../../domain/material";
import { MaterialDataSource } from "../../infraestructure/materialesDatasource";
import MaterialForm from "../components/MaterialForm";

export default function CreateMaterialView() {
  const repository = new MaterialDataSource();
  const createMaterial = new CreateMaterialUseCase(repository);
  const router = useRouter();

  const handleCreate = async (
    numMaterial: number,
    nombre: string,
    cantidad: number,
    unidad: string,
    tipoMaterial: TipoMaterial
  ) => {
    try {
      await createMaterial.execute({
        numMaterial,
        nombreMaterial: nombre,
        cantidad,
        unidad,
        tipoMaterial,
      });

      Alert.alert(
        "Éxito",
        tipoMaterial === "herramienta"
          ? "Herramienta creada correctamente"
          : "Material creado correctamente"
      );

      router.back();
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.response?.data?.detail ??
          error?.message ??
          "No se pudo crear el registro"
      );
    }
  };

  return (
    <View>
      <MaterialForm onSubmit={handleCreate} />
    </View>
  );
}
