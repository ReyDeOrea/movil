import { useRouter } from "expo-router";
import { Alert, View } from "react-native";
import { CreateTecnicoExternoUseCase } from "../../application/createProveedor";
import { TecnicoExternoDataSource } from "../../infraestructure/proveedorDataSource";
import TecnicoExternoForm from "../components/proveedorForm";


export default function CreateTecnicoExternoView() {

  const router = useRouter();

  const repository = new TecnicoExternoDataSource();

  const createTecnico = new CreateTecnicoExternoUseCase(repository);

  const handleCreate = async (
    numTecnicoExterno: number,
    nombre: string,
    empresa: string,
    telefono: string,
    especialidad: string
  ) => {

    try {

      await createTecnico.execute({
        numTecnicoExterno,
        nombre,
        empresa,
        telefono,
        especialidad,
      });

      Alert.alert(
        "Éxito",
        "Técnico creado"
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

      <TecnicoExternoForm
        onSubmit={handleCreate}
      />

    </View>
  );
}