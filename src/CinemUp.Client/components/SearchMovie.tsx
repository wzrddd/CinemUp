import React, {useState} from "react";
import {TextInput, View, StyleSheet, SafeAreaView, Dimensions, Text, Image, ScrollView, Pressable, ActivityIndicator} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import {LoadingOverlay} from "@/components/LoadingOverlay";

import {searchMovie} from "@/lib/movie";

import Colors from "@/constants/Colors";
import { router } from "expo-router";

const IMAGE_URL = "https://image.tmdb.org/t/p/original"
export default function SearchMovie({ onClose }: { onClose: () => void }) {
    
    const [inputValues, setInputValues] = useState("")
    const [isFetching, setIsFetching] = useState(false);
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true);
    const [searched, setSearched] = useState(false);
    
    const handleImageLoadStart = () => {
        setLoading(true);
    };

    const handleImageLoadEnd = () => {
        setLoading(false);
    };

    async function getMovies() {
        try {
            setIsFetching(true);
            setSearched(true);
            
            const results = await searchMovie(inputValues)
            setIsFetching(false);

            const jsonArray = JSON.parse(JSON.stringify(results))

            setData(jsonArray)
            console.log(jsonArray)
        } catch (err) {
            setData([])
            console.log(err)
        }
    }
   
    if(isFetching){
        return <LoadingOverlay />
    }
    
    return (
        <SafeAreaView>
            <View style={styles.mainContainer}>
                <View style={styles.container}>
                    <Pressable onPress={onClose} style={styles.cancel}>
                        <View style={styles.container}>
                            <MaterialIcons name="arrow-back-ios" size={25} color={Colors.transparentWhite} />
                        </View>
                    </Pressable>
                    
                    <View style={styles.searchContainer}>
                        <TextInput onEndEditing={getMovies} onChangeText={setInputValues} style={styles.searchInput}
                                   placeholderTextColor={Colors.transparentWhite50} placeholder="Введіть назву фільму..."/>
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
                        data.map((items: any) => (
                            <View key={items.id} style={styles.movieContainer}>
                                <Pressable onPress={() => { onClose(); 
                                    router.push({ pathname: "/movies/[movieId]", params: { movieId: items.id } }); }}>
                                    {loading && (
                                        <ActivityIndicator size="small" color={Colors.white} style={styles.loadingIndicator} />
                                    )}
                                    <Image
                                        style={styles.image}
                                        source={{ uri: `${IMAGE_URL}${items.imageUri}` }}
                                        onLoadStart={handleImageLoadStart}
                                        onLoadEnd={handleImageLoadEnd}
                                    />
                                </Pressable>
                                <View style={{ paddingTop: 20, }}>
                                    <Text style={styles.movieTitle} numberOfLines={3} ellipsizeMode="tail">
                                        {items.title}
                                    </Text>
                                    <Text style={styles.movieDescription} numberOfLines={3} ellipsizeMode="tail">{items.description}</Text>
                                </View>
                            </View>
                        ))
                    )}
                </ScrollView>
            </View>
        </SafeAreaView>
    )
}

const deviceWidth = Dimensions.get("window").width

const styles = StyleSheet.create({
    mainContainer: {
        backgroundColor: Colors.lightBlack,
        justifyContent: "center",
        alignItems: "flex-start",
    },
    searchContainer: {
        backgroundColor: Colors.searchContainer,
        borderRadius: 10,
        paddingVertical: 8,
        marginTop: 40,
        paddingHorizontal: 15,
        width:"80%",
    },
    searchInput: {
        fontSize: 18,
        fontWeight: 'regular',
        textAlign: "left",
        color:Colors.white,
    },
    movieTitle: {
        color: Colors.white,
        fontSize: 17,
        fontWeight: "500",
        marginLeft: 15,
        marginTop: 10,
        lineHeight: 18,
        flexWrap: "wrap",
        maxWidth: deviceWidth * 0.4,
        marginBlockEnd: 10,
    },
    movieContainer: {
        margin: 10,
        flexDirection: "row",
        flexWrap: "nowrap",
    },
    image: {
        width: 150/1.2,
        height: 230/1.2,
        borderRadius: 10,
        marginRight: 10,
    },
    cancel:{
        marginTop: 25,
        marginRight:10
    },
    cancelText:{
        fontSize:17,
        color:Colors.transparentWhite,
    },
    container:{
        flexDirection: "row",
        alignItems: "center",
        marginLeft: 10,
        flexWrap: "wrap",
    },
    loadingIndicator: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: [{ translateX: -20 }, { translateY: -20 }],
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
    movieDescription: {
        color: Colors.transparentWhite,
        fontSize: 15,
        fontWeight: "500",
        lineHeight: 18,
        flexWrap: "wrap",
        maxWidth: deviceWidth * 0.6,
        paddingLeft: 15,
    },
    movieInfoContainer: {
        flex: 1,
        justifyContent: "space-between",
        paddingTop: 30,
        paddingLeft: 6,
    },
    genres: {
        color: Colors.transparentWhite50,
        fontSize: 14,
        fontWeight: 500,
        paddingBlockEnd: 10,
        paddingLeft: 15,
    },
});
