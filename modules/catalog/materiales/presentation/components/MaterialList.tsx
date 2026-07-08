import { usePaginatedCards } from "@/hooks/usePaginatedCards";
import { FlatList } from "react-native";
import { Material } from "../../domain/material";
import MaterialCard from "./MaterialCard";

interface Props {
  materials: Material[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  resetKey?: string;
}

export default function MaterialList({
  materials,
  onEdit,
  onDelete,
  resetKey = "",
}: Props) {
  const {
    visibleData,
    loadMore,
  } = usePaginatedCards(materials, 15, resetKey);

  return (
    <FlatList
      data={visibleData}
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
      onEndReached={loadMore}
      onEndReachedThreshold={0.3}
      initialNumToRender={15}
      maxToRenderPerBatch={15}
      windowSize={7}
      removeClippedSubviews
    />
  );
}