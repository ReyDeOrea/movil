import { FlatList } from "react-native";
import { TecnicoExterno } from "../../domain/proveedor";
import TecnicoExternoCard from "./proveedorCard";


interface Props {
  tecnicos: TecnicoExterno[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function TecnicoExternoList({
  tecnicos,
  onEdit,
  onDelete,
}: Props) {

  return (
    <FlatList
      data={tecnicos}
      keyExtractor={(item) =>
        item.numTecnicoExterno.toString()
      }
      renderItem={({ item }) => (
        <TecnicoExternoCard
          tecnico={item}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      )}
    />
  );
}