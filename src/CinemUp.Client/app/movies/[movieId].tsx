import React, {useEffect, useState} from "react";
import { View, Text, StyleSheet, Image, SafeAreaView, FlatList, ActivityIndicator, Pressable, ScrollView } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { WebView } from 'react-native-webview';
import {router, useLocalSearchParams } from "expo-router";

import {addMovieToFavorite, deleteMovieFromFavorite, getMovieOverviewById, addMovieToWatched, deleteMovieFromWatched} from "@/lib/movie";
import {getUserAchievements} from "@/lib/achievements";
import Colors from "@/constants/Colors";
import {LoadingOverlay} from "@/components/LoadingOverlay";
import AsyncStorage from "@react-native-async-storage/async-storage";
interface MovieData {
    id: number;
    title: string;
    genres: TmdbMovieGenres[];
    releaseYear: string;
    description: string;
    rating: number;
    imageUri: string;
    isFavorite: boolean;
    isWatched: boolean;
    actors: MovieActor[];
    trailer?: string;
    duration: number;
    directors: [];
    productionCountries:[],
    tagLine: string;
}

interface MovieActor {
    name: string;
    profileImageUri: string;
}

interface TmdbMovieGenres {
    id: number;
    name: string;
}
function extractYoutubeVideoId(url: string): string | null {
    const regex = /(?:v=|\/embed\/|\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

async function refreshAchievements() {
    const updated = await getUserAchievements();
    const achieved = updated.filter(a => a.IsAchieved).map(a => a.id);
    await AsyncStorage.setItem("achieved_ids", JSON.stringify(achieved));
}

const IMAGE_URL = "https://image.tmdb.org/t/p/original"
export default function MovieDescription(){
    const { movieId } = useLocalSearchParams();

    const [movieData, setMovieData] = useState<MovieData | null>(null);
    const [isFetching, setIsFetching] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isFavorite, setIsFavorite] = useState(false);
    const [isWatched, setIsWatched] = useState(false);
    const [achievements, setAchievements] = useState<any[]>([]);
    const [showTrailer, setShowTrailer] = useState(false);
    const [trailerLoading, setTrailerLoading] = useState(true);


    useEffect(() => {
        async function getMovieById(id: string){
            try{
                setIsFetching(true);
                const result = await getMovieOverviewById(id);

                if (result) {
                    setMovieData({
                        ...result,
                        genres: result.genres ?? [],
                    });
                    setIsFavorite(result.isFavorite);
                    setIsWatched(result.isWatched);
                }
                const jsonArray = JSON.parse(JSON.stringify(result))

                if (result) {
                    setMovieData(jsonArray);
                    setIsFavorite(result.isFavorite);
                    setIsWatched(result.isWatched);
                }
                setIsFetching(false);

                console.log(result)
            }
            catch(err){
                setMovieData(null);
                setIsFetching(false);
                console.log(err)
            }
        }
        getMovieById(movieId)
    }, [movieId]);

    useEffect(() => {
        async function fetchAchievements() {
            const achievementsData = await getUserAchievements();
            setAchievements(achievementsData);
        }
        fetchAchievements();
    }, []);

    if(isFetching){
        return <LoadingOverlay />
    }

    const handleImageLoadStart = () => {
        setLoading(true);
    };

    const handleImageLoadEnd = () => {
        setLoading(false);
    };

    const toggleFavorite = async () => {
        setIsFavorite((prevState) => {
            const newFavoriteStatus = !prevState;

            if (newFavoriteStatus) {
                addMovieToFavorite(movieId)
                    .then(async(result) => {
                        console.log("Added to favorites:", result);
                        await refreshAchievements();
                    })
                    .catch((error) => {
                        console.error("Error adding to favorites:", error);
                    });
            } else {
                deleteMovieFromFavorite(movieId)
                    .then((result) => {
                        console.log("Removed from favorites:", result);
                    })
                    .catch((error) => {
                        console.error("Error removing from favorites:", error);
                    });
            }

            return newFavoriteStatus;
        });
    };

    const toggleWatched = async () => {
        setIsWatched((prevState) => {
            const newWatchedStatus = !prevState;

            if (newWatchedStatus) {
                addMovieToWatched(movieId)
                    .then(async(result) => {
                        console.log("Added to watched:", result);
                        await refreshAchievements();
                    })
                    .catch((error) => {
                        console.error("Error adding to watched:", error);
                    });
            } else {
                deleteMovieFromWatched(movieId)
                    .then((result) => {
                        console.log("Removed from watched:", result);
                    })
                    .catch((error) => {
                        console.error("Error removing from watched:", error);
                    });
            }

            return newWatchedStatus;
        });

    };
    const handlePlayTrailer = () => {
        setShowTrailer(true);
    };

    return(
        <SafeAreaView style={{ flex: 1, backgroundColor: Colors.lightBlack, }}>
            <View style={{ justifyContent: "flex-start", margin: 10 }}>
                <Pressable onPress={() => router.back()} style={styles.cancel}>
                    <MaterialIcons name="arrow-back-ios" size={25} color={Colors.transparentWhite} />
                </Pressable>
            </View>
            <View style={{ flex: 1 }}>
                <ScrollView>
                    {movieData?.trailer && extractYoutubeVideoId(movieData.trailer) && (
                        <View style={styles.trailerContainer}>
                            {movieData?.trailer && extractYoutubeVideoId(movieData.trailer) && (
                                <>
                                    {!showTrailer ? (
                                        <Pressable style={styles.thumbnailContainer} onPress={handlePlayTrailer}>
                                            <Image
                                                source={{ uri: `https://img.youtube.com/vi/${extractYoutubeVideoId(movieData.trailer)}/hqdefault.jpg` }}
                                                style={styles.thumbnailImage}
                                            />
                                            <View style={styles.playButtonOverlay}>
                                                <MaterialIcons name="play-arrow" size={60} color={Colors.white} />
                                            </View>
                                        </Pressable>
                                    ) : (
                                        <View style={styles.trailerContainer}>
                                            <Pressable style={styles.closeButton} onPress={() => setShowTrailer(false)}>
                                                <MaterialIcons name="close" size={24} color={Colors.white200} />
                                            </Pressable>

                                            {trailerLoading && (
                                                <ActivityIndicator
                                                    size="large"
                                                    color={Colors.white}
                                                    style={styles.loadingIndicator}
                                                />
                                            )}
                                            <WebView
                                                style={styles.trailerVideo}
                                                javaScriptEnabled
                                                domStorageEnabled
                                                onLoadStart={() => setTrailerLoading(true)}
                                                onLoadEnd={() => setTrailerLoading(false)}
                                                source={{
                                                    uri: `https://www.youtube.com/embed/${extractYoutubeVideoId(movieData.trailer)}?autoplay=1`
                                                }}
                                                allowsFullscreenVideo
                                            />
                                        </View>
                                    )}
                                </>
                            )}
                        </View>
                    )}

                    {movieData ? (
                        <View key={movieData.id} style={styles.contentContainer}>
                            <Text style={styles.title}>{movieData.title}</Text>
                            {movieData?.tagLine && (
                                <Text style={styles.tagline}>{movieData.tagLine}</Text>
                            )}
                            <View style={styles.topRow}>
                                <View style={styles.infoColumn}>
                                    <View style={styles.infoItem}>
                                        <Text style={styles.infoLabel}>Жанри:</Text>
                                        <Text style={styles.infoText}>
                                            {movieData?.genres?.map(g => g.name).join(", ") || "Жанр невідомий"}
                                        </Text>
                                    </View>

                                    <View style={styles.infoItemRow}>
                                        <Text style={styles.infoLabel}>Рік: </Text>
                                        <Text style={styles.infoText}>
                                            {movieData?.releaseYear?.slice(0, 4) || "Невідомий"}
                                        </Text>
                                    </View>

                                    <View style={styles.infoItemRow}>
                                        <Text style={styles.infoLabel}>Тривалість: </Text>
                                        <Text style={styles.infoText}>
                                            {Math.floor(movieData?.duration / 60)} год {movieData?.duration % 60} хв
                                        </Text>
                                    </View>

                                    <View style={styles.infoItem}>
                                        <Text style={styles.infoLabel}>Режисери:</Text>
                                        <Text style={styles.infoText}>
                                            {movieData?.directors?.join(", ") || "Невідомо"}
                                        </Text>
                                    </View>

                                    <View style={styles.infoItem}>
                                        <Text style={styles.infoLabel}>Країни виробники:</Text>
                                        <Text style={styles.infoText}>
                                            {movieData?.productionCountries?.join(", ") || "Невідомо"}
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.imageContainer}>
                                    {loading && (
                                        <ActivityIndicator
                                            size="large"
                                            color={Colors.white}
                                            style={styles.loadingIndicator}
                                        />
                                    )}
                                    <Image
                                        style={styles.image}
                                        source={{ uri: `${IMAGE_URL}${movieData.imageUri}` }}
                                        onLoadStart={handleImageLoadStart}
                                        onLoadEnd={handleImageLoadEnd}
                                    />
                                </View>
                            </View>
                            <View style={styles.descriptionContainer}>
                                <Text style={styles.text}>{movieData.description}</Text>
                            </View>

                            <Text style={styles.sections}>Рейтинг:</Text>
                            <View style={styles.container}>
                                <Text style={styles.text}>⭐TMDb: {movieData.rating.toFixed(1)}/10</Text>
                            </View>
                            
                            <Text style={styles.sections}>Актори:</Text>
                            <FlatList
                                horizontal
                                data={movieData.actors}
                                keyExtractor={(item, index) => `${item.name}-${index}`}
                                contentContainerStyle={{ paddingVertical: 10 }}
                                renderItem={({ item }) => (
                                    <View style={styles.actorCard}>
                                        <Image
                                            source={{ uri: `${IMAGE_URL}${item.profileImageUri}` }}
                                            style={styles.actorImage}
                                        />
                                        <Text style={styles.actorName}>{item.name}</Text>
                                    </View>
                                )}
                                showsHorizontalScrollIndicator={false}
                            />
                        </View>
                    ) : (
                        <Text>Loading...</Text>
                    )}
                </ScrollView>
            </View>
            <View style={styles.stickyFooter}>
                <Pressable style={[styles.actionButton, isFetching && styles.disabledButton]} onPress={toggleFavorite} disabled={isFetching}>
                    <MaterialIcons
                        name={isFavorite ? "favorite" : "favorite-border"}
                        size={26}
                        color={Colors.white}
                    />
                    <Text style={styles.buttonLabel}>
                        {isFavorite ? "У бажаному" : "Хочу подивитись"}
                    </Text>
                </Pressable>

                <Pressable style={[styles.actionButton, isFetching && styles.disabledButton]} onPress={toggleWatched} disabled={isFetching}>
                    <MaterialIcons
                        name={isWatched ? "bookmark" : "bookmark-border"}
                        size={26}
                        color={Colors.white}
                    />
                    <Text style={styles.buttonLabel}>
                        {isWatched ? "Переглянуто" : "Не переглянуто"}
                    </Text>
                </Pressable>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    title: {
        fontWeight: 600,
        fontSize: 25,
        color: Colors.white,
        marginBlock: 15,
        paddingTop: 10,
    },
    imageContainer: {
        position: 'relative',
    },
    loadingIndicator: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: -20 }, { translateY: -20 }],
    },
    text: {
        color: Colors.transparentWhite,
        fontSize: 16,
    },
    genres: {
        color: Colors.transparentWhite50,
        fontSize: 15,
        fontWeight: 500,
        marginBottom: 20,
    },
    sections: {
        color: Colors.white200,
        fontSize: 18,
        fontWeight: 500,
        marginTop: 40,
    },
    image: {
        width: 180,
        height: 265,
        marginLeft: 5,
        marginRight: 5,
        marginTop: 20,
    },
    container: {
        padding: 19,
        backgroundColor: Colors.container,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "space-between",
        margin: 10,
        width: "40%",
    },
    cancel: {
        marginRight: 10,
    },
    actorCard: {
        alignItems: 'center',
        marginHorizontal: 10,
        width: 80,
    },
    actorImage: {
        width: 70,
        height: 70,
        borderRadius: 35,
        marginBottom: 5,
        backgroundColor: Colors.white200,
    },
    actorName: {
        color: Colors.white200,
        fontSize: 12,
        textAlign: 'center',
    },
    stickyFooter: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        paddingVertical: 5,
        paddingHorizontal: 20,
        backgroundColor: Colors.lightBlack,
        borderTopWidth: 1,
        borderTopColor: Colors.black,
    },
    actionButton: {
        alignItems: "center",
    },
    buttonLabel: {
        color: Colors.white200,
        fontSize: 13,
        marginTop: 4,
        textAlign: 'center',
    },
    disabledButton: {
        opacity: 0.5,
    },
    trailerContainer: {
        height: 220,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        backgroundColor: Colors.black,
    },
    trailerVideo: {
        flex: 1,
        backgroundColor: 'black',
    },
    thumbnailContainer: {
        height: 220,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        backgroundColor: Colors.black,
    },
    thumbnailImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    playButtonOverlay: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: -30 }, { translateY: -30 }],
        backgroundColor: 'rgba(0,0,0,0.4)',
        borderRadius: 30,
    },
    closeButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 2,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: 5,
        borderRadius: 20,
    },
    contentContainer: {
        paddingHorizontal: 12,
        paddingTop: 10,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    infoColumn: {
        flex: 1,
        marginRight: 5,
        padding: 10,
        marginTop: 20,
    },
    descriptionContainer: {
        marginTop: 20,
    },
    infoItem: {
        marginBottom: 10,
        paddingBottom: 5,
        borderBottomColor: Colors.transparentWhite,
    },
    infoLabel: {
        color: Colors.white200,
        fontWeight: '500',
        fontSize: 16,
        marginBottom: 3,
    },
    infoText: {
        color: Colors.transparentWhite,
        fontSize: 15,
    },
    infoItemRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "center",
        marginBottom: 5,
        paddingBottom: 5,
        gap: 3,
    },
    tagline: {
        fontSize: 18,
        fontWeight: "600",
        color: Colors.white200,
        marginTop: -10,
        marginBottom: 10,
    },
});
