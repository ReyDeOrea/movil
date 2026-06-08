import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, View } from "react-native";
import { EditTecnicoExternoUseCase } from "../../application/editProveedor";
import { GetTecnicoExternoByIdUseCase } from "../../application/getProvedor";
import { TecnicoExterno } from "../../domain/proveedor";
import { TecnicoExternoDataSource } from "../../infraestructure/proveedorDataSource";
import TecnicoExternoForm from "../components/proveedorForm";


export default function EditTecnicoExternoView() {

  const router = useRouter();

  const { id } = useLocalSearchParams();

  const repository = new TecnicoExternoDataSource();

  const getTecnico = new GetTecnicoExternoByIdUseCase(repository);

  const editTecnico = new EditTecnicoExternoUseCase(repository);

  const [tecnico, setTecnico] = useState<TecnicoExterno | null>(null);

  useEffect(() => {
    loadTecnico();
  }, []);

  const loadTecnico = async () => {

    try {

      const data =
        await getTecnico.execute(Number(id));

      if (!data) {

        Alert.alert(
          "Error",
          "Técnico no encontrado"
        );

        router.back();

        return;
      }

      setTecnico(data);

    } catch (error: any) {

      Alert.alert(
        "Error",
        error.message
      );

    }
  };

  const handleUpdate = async (
    numTecnicoExterno: number,
    nombre: string,
    empresa: string,
    telefono: string,
    especialidad: string
  ) => {

    try {

      if (!tecnico) return;

      await editTecnico.execute({
        ...tecnico,
        numTecnicoExterno,
        nombre,
        empresa,
        telefono,
        especialidad,
      });

      Alert.alert(
        "Éxito",
        "Técnico actualizado"
      );

      router.back();

    } catch (error: any) {

      Alert.alert(
        "Error",
        error.message
      );

    }
  };

  if (!tecnico) return null;

  return (
    <View>

      <TecnicoExternoForm
       initialNumTecnicoExterno={
    tecnico.numTecnicoExterno.toString()
  }
        initialNombre={tecnico.nombre}
        initialEmpresa={tecnico.empresa}
        initialTelefono={tecnico.telefono}
        initialEspecialidad={tecnico.especialidad}
        onSubmit={handleUpdate}
      />

    </View>
  );
}