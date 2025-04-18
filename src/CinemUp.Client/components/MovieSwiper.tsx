import React from 'react';
import TinderCard from 'react-tinder-card';
import {View, Text, StyleSheet, Dimensions, Image} from 'react-native';
import {useState, useEffect} from 'react';
import {getMovieOverview, getMovieOverviewById} from "@/lib/movie";
import Colors from "@/constants/Colors";
import {LoadingOverlay} from "@/components/LoadingOverlay";

const { width, height } = Dimensions.get("window");
interface MovieData {
    id: number;
    title: string;
    description: string;
    imageUri: string;
}

type MovieSwiperProps = {
    onSwipe: (direction: string) => void;
    userId: string;
    code: string;
    connection: any;
    onSwipingComplete: () => void;
    setMatchedMovies: (movies: MovieData[]) => void;
}
const IMAGE_URL = "https://image.tmdb.org/t/p/w500"

function MovieSwiper({ onSwipe, userId, code, connection, onSwipingComplete, setMatchedMovies  }: MovieSwiperProps) {

    const [movies, setMovies] = useState<MovieData[]>([]);
    const [isFetching, setIsFetching] = useState<boolean>(true);
    const [lastDirection, setLastDirection] = useState<string>("");
    const [countMovie, setCountMovie] = useState(10);
    const [matchedMoviesId, setMatchedMoviesId] = useState([]);
    const [matchedMoviesOverview, setMatchedMoviesOverview] = useState()
    useEffect(() => {
        fetchMovies();

    }, []);

    const fetchMovies = async () => {
        try {
            setIsFetching(true);

            const results = await getMovieOverview();

            if (!results || results.length === 0) {
                throw new Error("The server returned an empty list.");
            }

            const moviesArray = Object.values(results)
                .flat()
                .slice(0, 10);

            setMovies(moviesArray);
            setIsFetching(false);
        } catch (err) {
            console.log(err)
            setMovies([]);
            setIsFetching(false);
        }
    };

    const swiped = async (direction: string, movieId: number) => {
        if (!connection) {
            console.log("No connection available, retrying...");
            return;
        }

        const isLiked = direction === "right";
        console.log("Movie id in swiped: " + movieId);
        console.log("Code in swiped: " + code);
        console.log("is liked: " + isLiked);
        if(isLiked)
        {
            try {
                await connection.invoke("LikeMovie", movieId).catch(err => console.log("LikeMovie Error:", err));
                console.log("Success")
            }catch(error)
            {
                console.log(error)
            }
        }
        setCountMovie((prev) => prev - 1);
        setLastDirection(direction);
        onSwipe(direction);
    };

    useEffect(() => {
        if (countMovie === 0) {
            onSwipingComplete(); 
            const completeSwiping = async () => {
                try {
                    connection.on("UserCompletedSwiping", (id) => {
                        console.log("Id of complete swiping user: " + id);
                    });

                    connection.on("SwipingCompleted", async (matchedMoviesList) => {
                        console.log("Matched movie list: ", matchedMoviesList);
                        
                        /*setMatchedMoviesId(matchedMoviesList);
                        console.log(matchedMoviesId)*/

                        try {
                            const movieDetailsPromises = matchedMoviesList.map((movieId) =>
                                getMovieOverviewById(movieId)
                            );

                            const movies = await Promise.all(movieDetailsPromises);

                            setMatchedMoviesOverview(movies);
                            setMatchedMovies(movies); 

                            console.log("Matched movies overview: " + matchedMoviesOverview)
                        } catch (error) {
                            console.error("Error fetching movie details:", error);
                        }
                    });

                    await connection.invoke("CompleteSwiping");
                    console.log("CompleteSwiping success");

                } catch (error) {
                    console.error("Error in completeSwiping:", error);
                }
            };

            completeSwiping();
        }
    }, [countMovie, connection]);

    useEffect(() => {
        console.log("Matched movie (updated): ", matchedMoviesId);
    }, [matchedMoviesId]);
    
    if(isFetching){
        return <LoadingOverlay />
    }
    
    return (
        <View style={styles.container}>
            {movies.map((movie, index) => (
                <TinderCard
                    key={`${movie.id}-${index}`}
                    onSwipe={(dir) => swiped(dir, movie.id)}
                    onCardLeftScreen={() => console.log(`${movie.title} left the screen`)}
                    preventSwipe={["up", "down"]}
                >
                    <View style={styles.card}>
                        <Image
                            style={styles.image}
                            source={{ uri: `${IMAGE_URL}${movie.imageUri}` }}
                        />
                        <Text style={styles.title}>{movie.title}</Text>
                    </View>
                </TinderCard>
            ))}
            {lastDirection ? <Text>You swiped {lastDirection}</Text> : null}
        </View>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 100
    },
    card: {
        width: width * 0.8,
        height: height * 0.6,
        borderRadius: 10,
        backgroundColor: Colors.white,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    image: {
        width: "100%",
        height: "85%",
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
    },
    title: {
        fontSize: 16,
        fontWeight: "bold",
        textAlign: "center",
        alignItems: "center",
        paddingHorizontal: 10,
        marginTop: 20
    },
    swipeText: {
        position: "absolute",
        bottom: 50,
        fontSize: 16,
        color: "gray",
    },
    outOfMoviesText: {
        fontSize: 20,
        textAlign: 'center',
        marginTop: 50,
        color: Colors.white,
    },

})
export default MovieSwiper;
