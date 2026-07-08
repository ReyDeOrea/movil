import { usePaginatedCards } from "@/hooks/usePaginatedCards";
import { FlatList, Text, View } from "react-native";
import { Entrada } from "../../domain/entrada";
import EntradaCard from "./EntradaCard";

interface Props {
  entradas: Entrada[];
  onEdit: (entrada: Entrada) => void;
  onDelete: (idEntrada: string) => void;
  resetKey?: string;
}

export default function EntradaList({
  entradas,
  onEdit,
  onDelete,
  resetKey = "",
}: Props) {
  const {
    visibleData,
    loadMore,
  } = usePaginatedCards(entradas, 15, resetKey);

  return (
    <FlatList
      data={visibleData}
      keyExtractor={(item) => item.idEntrada}
      renderItem={({ item }) => (
        <EntradaCard
          entrada={item}
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
      ListEmptyComponent={
        <View style={{ paddingTop: 20 }}>
          <Text style={{ textAlign: "center", color: "#6B7280" }}>
            No hay entradas registradas
          </Text>
        </View>
      }
      contentContainerStyle={{ paddingBottom: 120 }}
    />
  );
}