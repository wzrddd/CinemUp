import MainContainer from "@/components/MainContainer";
import Colors from "@/constants/Colors";
import { MaterialIcons } from "@expo/vector-icons";
import {Pressable, SafeAreaView, ScrollView, TextInput, View, Image, Text, ActivityIndicator, StyleSheet } from "react-native";
import {searchMovie} from "@/lib/movie";
import { useState } from "react";
import {LoadingOverlay} from "@/components/LoadingOverlay";
const IMAGE_URL = "https://image.tmdb.org/t/p/original"

type Props = {
    setIsSearchVisible: (visible: boolean) => void;
    handlePress: (movieId: number) => void;
    addMovieToList: (movieId: number, listId: number) => void;
    listId: number;
    toastVisible: boolean;
};

export default function SearchMovieInList({ setIsSearchVisible, handlePress, addMovieToList, listId, toastVisible }: Props)
{
    const [searched, setSearched] = useState(false);
    const [data, setData] = useState([])
    const [isFetching, setIsFetching] = useState(false);
    const [inputValues, setInputValues] = useState("")
    const [loading, setLoading] = useState(false);

    const getMovies = async () => {
        try {
            setIsFetching(true);
            setSearched(true);

            const results = await searchMovie(inputValues);
            setIsFetching(false);

            const jsonArray = JSON.parse(JSON.stringify(results));
            setData(jsonArray);
            console.log(jsonArray);
        } catch (err) {
            setData([]);
            console.log(err);
        }
    };

    const handleImageLoadStart = () => {
        setLoading(true);
    };

    const handleImageLoadEnd = () => {
        setLoading(false);
    };

    if(isFetching){
        return <LoadingOverlay />
    }

    return(
        <SafeAreaView>
            <MainContainer style={styles.mainContainer}>
                <View style={styles.container}>
                    <Pressable onPress={() => {
                        setIsSearchVisible(false)
                    }} style={styles.cancel}>
                        <View style={styles.container}>
                            <MaterialIcons name="arrow-back-ios" size={25}
                                           color={Colors.transparentWhite}/>
                        </View>
                    </Pressable>
                    <View style={styles.searchContainer}>
                        <TextInput onEndEditing={getMovies} onChangeText={setInputValues}
                                   style={styles.searchInput}
                                   placeholderTextColor={Colors.transparentWhite50}
                                   placeholder="Введіть назву фільму..."/>
                    </View>
                </View>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={styles.scrollContainer}
                >
                    {searched && data.length === 0 ? (
                        <Text style={styles.notFoundText}>На жаль, даний фільм не знайдено</Text>
                    ) : (
                        data.map((item: any) => (
                            
                            <View key={item.id} style={styles.movieContainer}>
                                {loading && (
                                    <ActivityIndicator size="small" color={Colors.white} style={styles.loadingIndicator} />
                                )}
                                <Image
                                    style={styles.image}
                                    source={{ uri: `${IMAGE_URL}${item.imageUri}` }}
                                    onLoadStart={handleImageLoadStart}
                                    onLoadEnd={handleImageLoadEnd}
                                />
                                <View>
                                    <Text style={styles.movieTitle} numberOfLines={1} ellipsizeMode="tail">
                                        {item.title}
                                    </Text>
                                    <Pressable onPress={() => addMovieToList(item.id, listId)} style={{marginLeft: 15, marginTop: 10}}>
                                        <Text style={{color: "lightblue", fontSize: 16}}>Додати фільм</Text>
                                    </Pressable>
                                </View>
                            </View>

                        ))
                    )}
                </ScrollView>
                {toastVisible && (
                    <View style={styles.toast}>
                        <Text style={styles.toastText}>Фільм успішно додано до списку!</Text>
                    </View>
                )}
            </MainContainer>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    mainContainer: {
        width: "100%",
        height: "100%",
        borderRadius: 0,
        backgroundColor: Colors.lightBlack,
        borderColor: Colors.black,
    },
    container: {
        flexDirection: "row",
        alignItems: "center",
        marginLeft: 10,
        flexWrap: "wrap",
    },
    cancel: {
        marginTop: 25,
        marginRight: 10
    },
    scrollContainer: {
        color: Colors.white200,
        fontSize: 18,
        fontWeight: "500",
        alignSelf: "center",
    },
    notFoundText: {
        fontSize: 16,
        fontWeight: "regular",
        color: Colors.transparentWhite50,
        justifyContent: "center",
        textAlign: "center",
        alignSelf: "center",
        margin: "30%",
    },
    searchContainer: {
        backgroundColor: Colors.searchContainer,
        borderRadius: 10,
        paddingVertical: 8,
        marginTop: 40,
        paddingHorizontal: 15,
        width: "80%",
    },
    searchInput: {
        fontSize: 18,
        fontWeight: 'regular',
        textAlign: "left",
        color: Colors.white
    },
    movieContainer: {
        flexDirection: "row",
        padding: 15,
        marginBottom: 10,
        borderRadius: 10,
    },
    loadingIndicator: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: [{translateX: -20}, {translateY: -20}],
    },
    image: {
        width: 150/1.2,
        height: 230/1.2,
        borderRadius: 10,
        marginRight: 10,
    },
    movieTitle: {
        fontSize: 18,
        color: Colors.white,
        fontWeight: "bold",
        width: 200
    },
    toast: {
        position: "absolute",
        bottom: 0,
        width: "100%",
        backgroundColor: "#4CAF50",
        padding: 12,
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
    },
    toastText: {
        fontSize: 14,
        color: "white",
        fontWeight: "bold",
    },
})