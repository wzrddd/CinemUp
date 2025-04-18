import { View, Text, Pressable, SafeAreaView, StyleSheet, TextInput, SectionList, Modal } from "react-native"
import {router} from "expo-router"
import Colors from "@/constants/Colors";
import { MaterialIcons } from "@expo/vector-icons";
import MovieSection from "@/components/MovieSection";
import {getMovieOverview} from "@/lib/movie";
import {useEffect, useState } from "react";
import {LoadingOverlay} from "@/components/LoadingOverlay";
import SearchMovie from "@/components/SearchMovie";

const getGenreTitle = (key: string) => {
    const genreMap: Record<string, string> = {
        "ukrainianMovies": "Популярні українські фільми💙💛",
        "nowPlayingUkrainianMovies": "У кінотеатрах 🎫",
        "popularMovies": "Популярні фільми🔥",
        "comedies": "Комедії🎭",
        "fantasy": "Фентезі✨",
        "actions": "Бойовики💥",
        "horrors": "Хорори💀",
        "dramas": "Драми😭",
        "adventure": "Пригодницькі🌋",
        "documentaries": "Документальні фільми📰",
    };
    return genreMap[key] || "Інше";
};

const Index = () => {
    const [data, setData] = useState<{ title: string; data: any }[]>([]);
    const [isFetching, setIsFetching] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    
    useEffect(() => {
        const getMovies = async () => {
            try {
                setIsFetching(true);
                const results = await getMovieOverview();
                setIsFetching(false);

                const sections = Object.entries(results)
                    .filter(([_, movies]) => Array.isArray(movies)) 
                    .map(([key, movies]) => ({
                        title: getGenreTitle(key),
                        data: movies ? movies : [], 
                    }));
                setData(sections);
                console.log(sections);
            } catch (err) {
                setData([])
                console.log(err)
            }
        }
        getMovies()
    }, []);

    const handleMoviePress = (id: string) => {
        router.push({
            pathname: "/movies/[movieId]",
            params: { movieId: id }
        });
    };

    if(isFetching){
        return <LoadingOverlay />
    }
    
    return(
        <SafeAreaView style={styles.mainContainer}>
            <Pressable onPress={() => setModalVisible(true)} style={styles.searchContainer}>
                <MaterialIcons name="search" size={25} color={Colors.transparentWhite50} />
                <TextInput onPress={() => setModalVisible(true)} style={styles.searchInput} placeholderTextColor={Colors.transparentWhite50} placeholder="Пошук..." editable={false}/>
            </Pressable>
            <Modal visible={modalVisible} animationType="slide" transparent={true} onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.bottomSheet}>
                        <SearchMovie onClose={() => setModalVisible(false)} />
                    </View>
                </View>            
            </Modal>
            
            <SectionList
                style={styles.section}
                sections={data}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{paddingBottom: 50}}
                renderItem={() => null}
                renderSectionHeader={({ section }) => (
                    <MovieSection title={section.title} movies={section.data} onPressMovie={handleMoviePress} />
                )}
                showsVerticalScrollIndicator={false}
                stickySectionHeadersEnabled={false}
            />
        </SafeAreaView>
    )
}

export default Index;

const styles = StyleSheet.create({
    mainContainer:{
        flex: 1,
        backgroundColor:Colors.lightBlack,
    },
    searchContainer: {
        flexDirection: "row",
        backgroundColor: "#1c1c1e",
        borderRadius: 10,
        paddingVertical: 6,
        paddingHorizontal: 20,
        marginBlockEnd: 10,
        margin: 10
    },
    searchInput: {
        flex: 1,
        fontSize: 18,
        fontWeight: 'regular',
        textAlign: "center",
    },
    section: {
        fontSize: 20,
        fontWeight: "bold",
        color: Colors.white,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.87)",
        justifyContent: 'flex-end',
    },

    bottomSheet: {
        height: '95%',
        backgroundColor: Colors.lightBlack,
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        paddingTop: 5,
        overflow: 'hidden',
    },
})