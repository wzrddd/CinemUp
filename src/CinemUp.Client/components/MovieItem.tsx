import React, {useState} from "react";
import { Image, StyleSheet, Pressable, View, Text, ActivityIndicator } from "react-native";
import Colors from "@/constants/Colors";

const IMAGE_URL = "https://image.tmdb.org/t/p/original"

interface MovieItemProps {
    movie: {
        id: string;
        title: string;
        description: string;
        imageUri?: any;
    };
    onPress: () => void;
}

function MovieItem({ movie, onPress }: MovieItemProps) {
    const [loading, setLoading] = useState(true);

    const handleImageLoadStart = () => {
        setLoading(true);
    };

    const handleImageLoadEnd = () => {
        setLoading(false);
    };
    
    return (
        <View>
            <Pressable onPress={onPress} style={styles.container}>
                {loading && (
                    <ActivityIndicator
                        size="small"
                        color={Colors.white}
                        style={styles.loadingIndicator}
                    />
                )}
                <Image
                    source={{ uri: `${IMAGE_URL}${movie.imageUri}` }}
                    style={styles.image}
                    onLoadStart={handleImageLoadStart}
                    onLoadEnd={handleImageLoadEnd}
                />
            </Pressable>
            <Text numberOfLines={1} style={styles.label}>{movie.title}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginRight: 10,
    },
    image: {
        width: 150/1.2,
        height: 230/1.2,
        borderRadius: 10,
    },
    label:{
        textAlign: "center",
        fontWeight: "bold",
        fontSize: 10,
        color: Colors.white,
        marginTop: 10,
        maxWidth: 120
    },
    loadingIndicator: {
        position: "absolute", 
        top: "50%",
        left: "50%",
        transform: [{ translateX: -20 }, { translateY: -20 }], 
    },
});

export default MovieItem;
