import { usePaginatedCards } from "@/hooks/usePaginatedCards";
import { FlatList } from "react-native";
import { TecnicoExterno } from "../../domain/proveedor";
import TecnicoExternoCard from "./proveedorCard";

interface Props {
  tecnicos: TecnicoExterno[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  resetKey?: string;
}

export default function TecnicoExternoList({
  tecnicos,
  onEdit,
  onDelete,
  resetKey = "",
}: Props) {
  const {
    visibleData,
    loadMore,
  } = usePaginatedCards(tecnicos, 15, resetKey);

  return (
    <FlatList
      data={visibleData}
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
      onEndReached={loadMore}
      onEndReachedThreshold={0.3}
      initialNumToRender={15}
      maxToRenderPerBatch={15}
      windowSize={7}
      removeClippedSubviews
    />
  );
}