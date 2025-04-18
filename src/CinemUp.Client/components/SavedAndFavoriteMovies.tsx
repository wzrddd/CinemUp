import React, {useState} from "react";
import { View, FlatList, Text, ActivityIndicator, Pressable, Image, StyleSheet } from "react-native";
import Colors from "@/constants/Colors";
import { router } from "expo-router";

const IMAGE_URL = "https://image.tmdb.org/t/p/original"

export function SavedAndFavoriteMovies({activeTab, getCurrentMovies}) {
    
    const [loading, setLoading] = useState(false);

    if (!loading && getCurrentMovies().length === 0) {
        return (
            <Text style={styles.noFavoriteText}>
                {activeTab === 'liked'
                    ? 'У вас поки немає вподобаних фільмів'
                    : 'У вас поки немає переглянутих фільмів'}
            </Text>
        );
    }
    const handleImageLoadStart = () => {
        setLoading(true);
    };

    const handleImageLoadEnd = () => {
        setLoading(false);
    };
    return (
        <FlatList
            data={getCurrentMovies()}
            contentContainerStyle={{
                paddingBottom: getCurrentMovies().length > 1 ? 50 : 10,
            }}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
                <View key={item.id} style={styles.movieContainer}>
                    <Pressable onPress={() => {
                        router.push({
                        pathname: "/movies/[movieId]",
                        params: { movieId: item.id }
                    })}}>
                        {loading && (
                            <ActivityIndicator
                                size="small"
                                color={Colors.white}
                                style={styles.loadingIndicator}
                            />
                        )}
                        <Image
                            style={styles.image}
                            source={{ uri: `${IMAGE_URL}${item.imageUri}` }}
                            onLoadStart={handleImageLoadStart}
                            onLoadEnd={handleImageLoadEnd}
                        />
                    </Pressable>
                    <View style={styles.movieInfoContainer}>
                        <Text style={styles.movieTitle}>{item.title}</Text>
                        <Text style={styles.genres}>
                            {item?.genres?.map(g => g.name).join(", ") || "Жанр невідомий"} | {item?.releaseYear?.slice(0, 4) || "Рік невідомий"}
                        </Text>
                        <Text style={styles.movieDescription} numberOfLines={2} ellipsizeMode="tail">
                            {item.description}
                        </Text>
                    </View>
                </View>
            )}
        />
    );
}

const styles = StyleSheet.create({
    movieDescription: {
        color: Colors.transparentWhite,
        fontSize: 14,
        fontWeight: "500",
        lineHeight: 18,
    },
    movieContainer: {
        marginVertical: 10,
        flexDirection: "row",
        alignItems: "flex-start",
        paddingHorizontal: 10,
    },
    loadingIndicator: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: [{ translateX: -20 }, { translateY: -20 }],
    },
    image: {
        width: 150/1.2,
        height: 230/1.2,
        borderRadius: 10,
        marginRight: 10,
    },
    movieInfoContainer: {
        flex: 1,
        justifyContent: "space-between",
        paddingTop: 30,
        paddingLeft: 6,
    },
    movieTitle: {
        color: Colors.white,
        fontSize: 17,
        fontWeight: "500",
        marginBlockEnd: 10,
    },
    movieInfo: {
        color: Colors.transparentWhite,
        fontSize: 14,
        fontWeight: "500",
        justifyContent: "space-evenly",
    },
    noFavoriteText: {
        color: Colors.transparentWhite50,
        fontSize: 15,
        fontWeight: "500",
        textAlign: "center",
        marginTop: 20,
    },
    genres: {
        color: Colors.transparentWhite50,
        fontSize: 14,
        fontWeight: 500,
        paddingBlockEnd: 10
    },
})