import { FlatList } from "react-native";
import { Material } from "../../domain/material";
import MaterialCard from "./MaterialCard";

interface Props {
  materials: Material[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function MaterialList({
  materials,
  onEdit,
  onDelete,
}: Props) {
  return (
    <FlatList
      data={materials}
      keyExtractor={(item) =>
        item.numMaterial.toString()
      }
      renderItem={({ item }) => (
        <MaterialCard
          material={item}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      )}
    />
  );
}