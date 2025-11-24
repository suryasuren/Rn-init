import React, { JSX, useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  SafeAreaView,
  StyleSheet,
  useWindowDimensions
} from "react-native";
import { MoviesList } from "../../services/MovieService";
import { toast } from "../../utils/Toast";
import MovieListSkeleton from "../../skeleton/MovieListSkeleton";
import SvgSearch from "../../assets/svg/Search";
import { MovieResponse } from "../../types/types";

const PLACEHOLDER_POSTER = "/mnt/data/0d6be87d-e0b0-426c-86fe-0a724d7b4849.png";
const PAGE_SIZE = 12;
const MIN_INITIAL_SHIMMER_MS = 2000; 

export default function MovieList(): JSX.Element {
  const { width } = useWindowDimensions();

  const columns = width >= 900 ? 4 : width >= 600 ? 3 : 2;

  const GAP = 16;
  const H_PADDING = 16;
  const cardWidth = (width - H_PADDING * 2 - GAP * (columns - 1)) / columns;

  const [rawData, setRawData] = useState<MovieResponse[]>([]);
  const [dataPage, setDataPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [total, setTotal] = useState<number | null>(null);

  const [query, setQuery] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);

  const currentReqRef = useRef(0);
  const mountedRef = useRef(true);
  const initialFetchStartRef = useRef<number | null>(null);
  const rawDataRef = useRef<MovieResponse[]>([]);
  const dataPageRef = useRef<number>(1);
  const totalRef = useRef<number | null>(null);

  useEffect(() => {
    rawDataRef.current = rawData;
  }, [rawData]);
  useEffect(() => {
    dataPageRef.current = dataPage;
  }, [dataPage]);
  useEffect(() => {
    totalRef.current = total;
  }, [total]);


  const trimmedQ = query.trim().toLowerCase();
  const displayedData = trimmedQ
    ? rawData.filter((m) => (m.movieName || "").toLowerCase().includes(trimmedQ))
    : rawData;


  const load = useCallback(async (page = 1, opts?: { replace?: boolean }) => {
    const token = ++currentReqRef.current;
    const replace = opts?.replace ?? false;

    const isInitial = page === 1 && (rawDataRef.current.length === 0 || replace === true);
    if (isInitial) initialFetchStartRef.current = Date.now();

    try {
      if (page === 1) setLoading(true);
      else setLoadingMore(true);

      const res = await MoviesList(page, PAGE_SIZE);

      if (token !== currentReqRef.current || !mountedRef.current) return;

      if (res?.code === 200) {
        const items: MovieResponse[] = Array.isArray(res.data) ? res.data : [];

        setTotal(res.pagination?.total ?? null);
        setDataPage(res.pagination?.page ?? page);
        if (page === 1) {
          setRawData(items);
        } else {
          setRawData((prev) => {
            const merged = [...prev, ...items];
            return merged;
          });
        }
      } else {
        if (page === 1) setRawData([]);
        toast.error(res?.message || "Unable to load movies");
      }
    } catch (err: unknown) {
      if (token !== currentReqRef.current || !mountedRef.current) return;

      const message =
        err instanceof Error ? err.message : typeof err === "string" ? err : JSON.stringify(err);
      toast.error(message || "Unable to load movies");
    } finally {
      if (token !== currentReqRef.current || !mountedRef.current) return;

      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);

      if (initialFetchStartRef.current) {
        const elapsed = Date.now() - initialFetchStartRef.current;
        const remaining = Math.max(0, MIN_INITIAL_SHIMMER_MS - elapsed);

        setTimeout(() => {
          if (!mountedRef.current) return;
          if (token !== currentReqRef.current) return;
          initialFetchStartRef.current = null;
          setInitialLoading(false);
        }, remaining);
      } else {
        setInitialLoading(false);
      }
    }

  }, []);

  useEffect(() => {
    mountedRef.current = true;

    load(1, { replace: true });

    return () => {
      mountedRef.current = false;
      currentReqRef.current++;
    };

  }, []); 

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setDataPage(1);
    load(1, { replace: true });
  }, [load]);

  const handleEndReached = useCallback(() => {
    if (loading || loadingMore) return;
    const totalNow = totalRef.current;
    const rawLen = rawDataRef.current.length;
    if (totalNow !== null && rawLen >= totalNow) return;
    const next = dataPageRef.current + 1;
    load(next);
  }, [load, loading, loadingMore]);

  const renderItem = useCallback(
    ({ item }: { item: MovieResponse }) => {
      const poster = item.media?.moviePoster
        ? { uri: item.media.moviePoster }
        : { uri: PLACEHOLDER_POSTER };

      const posterW = Math.max(80, Math.floor(cardWidth - 12));
      const posterH = Math.round(posterW * 1.25);
      const year = item.movieReleaseDate ? new Date(item.movieReleaseDate).getFullYear() : "—";

      return (
        <TouchableOpacity style={[styles.card, { width: cardWidth }]} activeOpacity={0.85}>
          <Image source={poster} style={[styles.poster, { width: posterW, height: posterH }]} resizeMode="cover" />
          <View style={styles.cardBody}>
            <Text numberOfLines={1} style={styles.movieTitle}>
              {item.movieName ?? "Untitled"}
            </Text>
            <Text numberOfLines={1} style={styles.meta}>
              {item.movieTypeId?.movieType ?? "N/A"} · {year}
            </Text>
          </View>
        </TouchableOpacity>
      );
    },
    [cardWidth]
  );

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.container}>
        <View style={styles.searchRow}>
          <SvgSearch />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search your movies here"
            placeholderTextColor="#999"
            style={styles.searchInput}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
        </View>

        {initialLoading ? (
          <MovieListSkeleton cardWidth={cardWidth} columns={columns} />
        ) : (
          <>
            {displayedData.length === 0 && !loading && !loadingMore ? (
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyText}>No movies found</Text>
              </View>
            ) : (
              <FlatList
                data={displayedData}
                key={`cols-${columns}`}
                keyExtractor={(item) => String(item._id)}
                renderItem={renderItem}
                numColumns={columns}
                columnWrapperStyle={{ justifyContent: "space-between", marginBottom: GAP }}
                showsVerticalScrollIndicator={false}
                onEndReached={handleEndReached}
                onEndReachedThreshold={0.4}
                ListFooterComponent={
                  loadingMore ? (
                    <View style={{ paddingVertical: 16 }}>
                      <MovieListSkeleton cardWidth={cardWidth} columns={columns} />
                    </View>
                  ) : null
                }
                refreshing={refreshing}
                onRefresh={handleRefresh}
                contentContainerStyle={{ paddingBottom: 120 }}
              />
            )}
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#FBFBFB" },

  header: {
    height: 60,
    justifyContent: "center",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#EFEFEF",
  },
  headerTitle: { textAlign: "center", fontSize: 18, fontWeight: "700" },

  container: { flex: 1, paddingHorizontal: 16, paddingTop: 12 },

  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F3F3",
    borderRadius: 24,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 16,
  },
  searchIcon: { marginRight: 8, fontSize: 16, color: "#8A8E91" },
  searchInput: { flex: 1, fontSize: 14, color: "#111", marginLeft: 8 },

  emptyWrap: { flex: 1, justifyContent: "center", alignItems: "center", paddingTop: 40 },
  emptyText: { color: "#666", fontSize: 15 },

  card: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  poster: {
    borderRadius: 8,
    alignSelf: "center",
    marginTop: 6,
  },
  cardBody: { paddingHorizontal: 6, paddingVertical: 8 },
  movieTitle: { fontSize: 14, fontWeight: "700", color: "#111" },
  meta: { marginTop: 4, fontSize: 12, color: "#888" },
});
