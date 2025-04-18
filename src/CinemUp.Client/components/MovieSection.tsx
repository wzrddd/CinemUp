import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";

import MovieItem from "@/components/MovieItem";
import Colors from "@/constants/Colors";

interface Movie {
    id: string;
    title: string;
    image?: any;
}

interface MovieSectionProps {
    title: string;
    movies: Movie[];
    onPressMovie: (id: string) => void;
}

function MovieSection({ title, movies, onPressMovie }: MovieSectionProps) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>{title}</Text>
            <FlatList
                data={movies}
                horizontal
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item, index }) => (
                    <View style={[{marginLeft: 0}, index === 0 && styles.first]}>
                        <MovieItem movie={item} onPress={() => onPressMovie(item.id)} />
                    </View>
                )}
                showsHorizontalScrollIndicator={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 10,
    },
    title: {
        fontSize: 17,
        marginLeft: 15,
        fontWeight: "bold",
        marginBottom: 10,
        color: Colors.white,
    },
    first: {
        marginLeft: 15,
    }
});

export default MovieSection;
