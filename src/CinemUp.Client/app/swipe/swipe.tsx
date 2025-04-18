import { View, StyleSheet, Dimensions, Text, Image, ScrollView, Pressable, SafeAreaView, Alert } from "react-native";
import Colors from "@/constants/Colors";
import MovieSwiper from "@/components/MovieSwiper";
import { MaterialIcons } from "@expo/vector-icons";
import {useEffect, useState } from "react";
import {router, useLocalSearchParams } from "expo-router";
import { getConnection } from "@/lib/signalrStore";

const { width, height } = Dimensions.get("window");

interface MovieData {
    id: number;
    title: string;
    description: string;
    imageUri: string;
}
const IMAGE_URL = "https://image.tmdb.org/t/p/original"

export default function  Swipe() {
    const [swipeDirection, setSwipeDirection] = useState<string>("");
    const [iconColor, setIconColor] = useState<{ left: string, right: string }>({ left: "white", right: "white" });
    const [iconScale, setIconScale] = useState<{ left: number, right: number }>({ left: 1, right: 1 });
    const [isFinished, setIsFinished] = useState(false);
    const [matchedMovies, setMatchedMovies] = useState<MovieData[]>([]);

    const { userId, code } = useLocalSearchParams();
    const connection = getConnection();

    useEffect(() => {
        if (!connection) {
            Alert.alert("Помилка", "Підключення не встановлено. Спробуйте ще раз.");
            router.replace("/swipe");
        }
    }, []);
    const handleSwipe = (direction: string) => {
        setSwipeDirection(direction);

        setIconColor({
            left: direction === "left" ? "red" : "white",
            right: direction === "right" ? "red" : "white",
        });

        setIconScale({
            left: direction === "left" ? 1.2 : 1,
            right: direction === "right" ? 1.2 : 1,
        });

        setTimeout(() => {
            setIconColor({
                left: "white",
                right: "white",
            });
            setIconScale({
                left: 1,
                right: 1,
            });
        }, 1000);
    };
    const handleMoviePress = (movieId: string) => {
        router.push({
            pathname: "/movies/[movieId]",
            params: { movieId: movieId }
        });
    };

    return (
        <SafeAreaView style={styles.mainContainer}>
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.cancel}>
                    <MaterialIcons name="arrow-back-ios" size={25} color={Colors.transparentWhite}/>
                </Pressable>
                {code && (
                    <View style={styles.roomCodeContainer}>
                        <Text style={styles.roomCodeText}>Код кімнати: {code}</Text>
                    </View>
                )}
            </View>
            <View style={styles.movieSwiperContainer}>
                <MovieSwiper onSwipingComplete={() => setIsFinished(true)} onSwipe={handleSwipe} userId={userId} connection={connection} code={code} setMatchedMovies={setMatchedMovies} />
            </View>
            {!isFinished && (
                <View style={styles.iconContainer}>
                    <MaterialIcons
                        name={"close"}
                        size={50}
                        color={iconColor.left}
                        style={[styles.icon, swipeDirection === "left" && styles.leftSwipe, { transform: [{ scale: iconScale.left }] }]}
                    />
                    <MaterialIcons
                        name={"favorite"}
                        size={50}
                        color={iconColor.right}
                        style={[styles.icon, swipeDirection === "right" && styles.rightSwipe, { transform: [{ scale: iconScale.right }] }]}
                    />
                </View>
            )}
            {isFinished && matchedMovies.length === 0 && (
                <View style={styles.finishedContainer}>
                    <View style={styles.finishedMessageBox}>
                        <Text style={styles.finishedMessageText}>
                            🎬 Ви закінчили свайпати фільми!{"\n"}
                            Зачекайте, поки ваш друг зробить свій вибір 💬
                        </Text>
                    </View>
                </View>
            )}

            {isFinished && matchedMovies.length > 0 && (
                <View style={styles.resultContainer}>
                    <Text style={styles.resultTitle}>🎉 Збіглись фільми!</Text>
                    <Text style={styles.resultSubtitle}>Ось фільми, які сподобались вам обом:</Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.resultScrollContent}
                    >
                        {matchedMovies.map((movie) => (
                            <Pressable key={movie.id} onPress={() => handleMoviePress(movie.id)} style={styles.resultMovieItem}>
                                <Image
                                    source={{ uri: IMAGE_URL + movie.imageUri }}
                                    style={styles.resultImage}
                                />
                                <Text style={styles.resultMovieTitle}>{movie.title}</Text>
                            </Pressable>
                        ))}
                    </ScrollView>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: Colors.lightBlack,
    },
    movieSwiperContainer: {
        justifyContent: "center",
        alignItems: "center",
    },
    iconContainer: {
        position: "absolute",
        bottom: 90,
        left: 0,
        right: 0,
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 40,
        zIndex: 1,
    },
    icon: {
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
        transition: "color 0.3s ease-in-out",
    },
    leftSwipe: {
        transform: [{ scale: 1.2 }],
    },
    rightSwipe: {
        transform: [{ scale: 1.2 }],
    },
    image: {
        width: 180,
        height: 265,
        borderRadius: 15,
        marginLeft: 10,
    },
    matchedContainer: {
        position: "absolute",
        top: 20,
        width: "100%",
        zIndex: 10,
    },
    matchedTitle: {
        color: "white",
        fontSize: 18,
        fontWeight: "600",
        textAlign: "left",
        marginBottom: 10,
        alignItems: "center",
        justifyContent: "center"
    },
    matchedMovieItem: {
        marginRight: 15,
        alignItems: "center",
    },
    movieTitleText: {
        color: "white",
        marginTop: 8,
        fontSize: 14,
        textAlign: "center",
        maxWidth: 120,
    },
    matchedScrollContent: {
        alignItems: "flex-start",
        paddingHorizontal: 10,
    },
    header: {
        position: "absolute",
        top: 50,
        left: 20,
        flexDirection: "row",
        alignItems: "center",
    },
    cancel: {
        marginLeft: "3%",
        marginTop: 10,
    },
    finishedContainer: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
        backgroundColor: Colors.lightBlack,
        zIndex: 10,
    },
    finishedMessageBox: {
        backgroundColor: "#1c1c1e",
        borderRadius: 15,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 6,
        elevation: 8,
    },
    finishedMessageText: {
        color: "white",
        fontSize: 18,
        textAlign: "center",
        lineHeight: 26,
    },
    resultContainer: {
        marginTop: 40,
        alignItems: "center",
    },
    resultTitle: {
        color: "white",
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 8,
        textAlign: "center",
    },
    resultSubtitle: {
        color: "white",
        fontSize: 16,
        marginBottom: 20,
        textAlign: "center",
    },
    resultScrollContent: {
        paddingHorizontal: 20,
    },
    resultMovieItem: {
        marginRight: 15,
        alignItems: "center",
    },
    resultImage: {
        width: 160,
        height: 240,
        borderRadius: 15,
        marginBottom: 8,
    },
    resultMovieTitle: {
        color: "white",
        fontSize: 14,
        textAlign: "center",
        maxWidth: 140,
    },
    roomCodeContainer: {
        marginLeft: 10,
        marginTop: 10,
        backgroundColor: "#2c2c2e",
        borderRadius: 8,
        paddingVertical: 4,
        paddingHorizontal: 10,
    },
    roomCodeText: {
        color: Colors.transparentWhite,
        fontSize: 14,
        fontWeight: "500",
    },
});