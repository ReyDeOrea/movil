import { useRouter } from "expo-router";
import { Alert, View } from "react-native";
import { CreateMaterialUseCase } from "../../application/createMaterials";
import { MaterialDataSource } from "../../infraestructure/materialesDatasource";
import MaterialForm from "../components/MaterialForm";


export default function CreateMaterialView() {

  const repository = new MaterialDataSource();
  const createMaterial = new CreateMaterialUseCase(repository);

  const router = useRouter();

  const handleCreate = async (
    numMaterial: number,
    nombre: string,
    cantidad?: number,
    unidad?: string
  ) => {

    try {

      await createMaterial.execute({
        numMaterial,
        nombreMaterial: nombre,
        cantidad,
        unidad,
      });

      Alert.alert(
        "Éxito",
        "Material creado"
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
    <View>
      <MaterialForm
        onSubmit={handleCreate}
      />
    </View>
  );
}