import {Modal, Pressable, SafeAreaView, StyleSheet, View, Text, Animated, Easing, TouchableOpacity, FlatList } from "react-native";
import Colors from "@/constants/Colors";
import {SearchUser} from "@/components/SearchUser";
import {useCallback, useContext, useEffect, useRef, useState} from "react";
import { MaterialIcons } from "@expo/vector-icons";
import {AuthContext} from "@/lib/auth-context";
import {getProfile} from "@/lib/profile";
import {getFavoriteMovies, getWatchedMovies} from "@/lib/movie";
import {getUserAchievements} from "@/lib/achievements";
import {getSharedListsForUser} from "@/lib/shared-list";
import { router, useFocusEffect  } from "expo-router";
import {SavedAndFavoriteMovies} from "@/components/SavedAndFavoriteMovies";
import {LoadingOverlay} from "@/components/LoadingOverlay";
import FollowersModal from "@/components/Followers";
import FollowingModal from "@/components/Following";

interface MovieData {
    id: number;
    title: string;
    genres: TmdbMovieGenres[];
    releaseYear: string;
    description: string;
    imageUri: string;
}
interface TmdbMovieGenres {
    id: number;
    name: string;
}

interface SharedList {
    id: string;
    name: string;
    description?: string;
    createdAt?: string;
}

export default function Profile() {
    const authCtx = useContext(AuthContext);
    const underlineAnim = useRef(new Animated.Value(0)).current;
    const tabsRef = useRef<View>(null);
    
    const [isFetching, setIsFetching] = useState(false);
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const [isFollowersVisible, setIsFollowersVisible] = useState(false);
    const [isFollowingVisible, setIsFollowingVisible] = useState(false);
    const [profile, setProfile] = useState<{username: string; amountOfSubscriptions: number; amountOfFollowers: number; amountofPoints: number;} | null>(null);
    const [favoriteMovies, setFavoriteMovies] = useState<MovieData[]>([]);
    const [watchedMovies, setWatchedMovies] = useState<MovieData[]>([]);
    const [achievements, setAchievements] = useState([]);
    const [userLists, setUserLists] = useState<SharedList[]>([]);
    const [activeTab, setActiveTab] = useState('liked');
    const [toastVisible, setToastVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    
    console.log(authCtx.token)
    const fetchProfile = async () => {
        if (!authCtx.token) {
            setProfile({ username: "Error", amountOfSubscriptions: 0, amountOfFollowers: 0, amountofPoints: 0 });
            setIsFetching(false);
            return;
        }
        try {
            const response = await getProfile();
            const resultsFavorite = await getFavoriteMovies();
            const resultsWatched = await getWatchedMovies();
            const achievementsResponse = await getUserAchievements();
            const resultsList = await getSharedListsForUser();

            console.log(resultsList)
            console.log("Get lists working")

            setFavoriteMovies(resultsFavorite.slice().reverse());
            setWatchedMovies(resultsWatched.slice().reverse());
            setProfile(response);
            setAchievements(achievementsResponse);
            setUserLists(resultsList)

            console.log(resultsFavorite)
            console.log(response)
            console.log(authCtx.token)

        } catch (error) {
            console.log("Error fetching data:", error);
            setProfile({ username: "Error", amountOfSubscriptions: 0, amountOfFollowers: 0, amountofPoints: 0, });
            setFavoriteMovies([]);
            setWatchedMovies([]);
            setUserLists([]);
        }
        finally {
            setIsFetching(false);
        }
    }

    useFocusEffect(
        useCallback(() => {
            fetchProfile();
        }, [authCtx.token])
    );

    const handleImageLoadStart = () => {
        setLoading(true);
    };

    const handleImageLoadEnd = () => {
        setLoading(false);
    };
    
    const animateUnderline = (index: number) => {
        tabsRef.current?.measure((x, y, width) => {
            const tabWidth = width / 3;
            Animated.timing(underlineAnim, {
                toValue: index * tabWidth,
                duration: 250,
                easing: Easing.out(Easing.ease),
                useNativeDriver: false,
            }).start();
        });
    };
    const handleTabPress = (tab: string, index: number) => {
        setActiveTab(tab);
        animateUnderline(index);
    };
    
    const navigateToUsers = (type: "followers" | "following") => {
        if (type === "followers") setIsFollowersVisible(true);
        else setIsFollowingVisible(true);
    };
    
    function logoutHandler(){
        authCtx.logout()
        router.replace("/auth/login");
    }

    const getCurrentMovies = useCallback(() => {
        if (activeTab === 'liked') return favoriteMovies;
        if (activeTab === 'saved') return watchedMovies;
        return [];
    }, [activeTab, favoriteMovies, watchedMovies]);
    
    if(isFetching){
        return <LoadingOverlay />
    }
    
    const shouldScroll = userLists.length > 4;
    
    return(
        
        <SafeAreaView style={styles.mainContainer}>
            <Modal visible={isSearchVisible} animationType="slide" transparent={true} onRequestClose={() => setIsSearchVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.bottomSheet}>
                        <SearchUser onClose={() => setIsSearchVisible(false)} />
                    </View>
                </View>
            </Modal>

            <Modal
                visible={isFollowersVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsFollowersVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.bottomSheet}>
                        <FollowersModal onClose={() => setIsFollowersVisible(false)} />
                    </View>
                </View>
            </Modal>

            <Modal
                visible={isFollowingVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsFollowingVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.bottomSheet}>
                        <FollowingModal onClose={() => setIsFollowingVisible(false)} />
                    </View>
                </View>
            </Modal>
            <View style={ {justifyContent: "space-between", flexDirection: "row", paddingTop: 20, paddingLeft: 20, paddingRight: 20}}>
                <Pressable onPress={() => setIsSearchVisible(true)}>
                    <MaterialIcons name="search" size={30} color={Colors.white200}/>
                </Pressable>

                <Pressable onPress={logoutHandler}>
                    <MaterialIcons name="settings" size={30} color={Colors.white200}/>
                </Pressable>
            </View>

            <MaterialIcons style={{alignSelf: "center"}} name="account-circle" size={80} color={Colors.white}/>
            <Text style={styles.userName}>{profile?.username || "Завантаження..."}</Text>

            <View style={styles.infoPanel}>
                <Pressable style={styles.statItem} onPress={() => navigateToUsers("followers")}>
                    <Text style={styles.amount}>{profile?.amountOfFollowers || 0}</Text>
                    <Text style={styles.textInfo}>Підписники</Text>
                </Pressable>
                <Pressable style={styles.statItem} onPress={() => navigateToUsers("following")}>
                    <Text style={styles.amount}>{profile?.amountOfSubscriptions || 0}</Text>
                    <Text style={styles.textInfo}>Відслідковує</Text>
                </Pressable>
                <Pressable style={styles.statItem} onPress={() => router.push('/users/awards')}>
                    <Text style={styles.amount}>{profile?.amountofPoints || 0}</Text>
                    <Text style={styles.textInfo}>Сінепоінти</Text>
                </Pressable>
            </View>
            <View ref={tabsRef} style={styles.tabs}>
                <TouchableOpacity onPress={() => handleTabPress('liked', 0)} style={styles.tab}>
                    <MaterialIcons name="favorite-border" size={30} color={Colors.white}/>
                </TouchableOpacity>

                <View style={styles.separator}/>
                <TouchableOpacity onPress={() => handleTabPress('saved', 1)} style={styles.tab}>
                    <MaterialIcons name="bookmark-border" size={30} color={Colors.white}/>
                </TouchableOpacity>

                <View style={styles.separator}/>
                <TouchableOpacity onPress={() => handleTabPress('lists', 2)} style={styles.tab}>
                    <MaterialIcons name="format-list-bulleted" size={30} color={Colors.white}/>
                </TouchableOpacity>

                <View style={styles.bottomLine}/>
                <Animated.View style={[styles.activeTabUnderline, {left: underlineAnim}]}/>
            </View>
            
            <View style={{ flex: 1 }}>
                {activeTab === 'lists' ? (
                    <SafeAreaView style={styles.mainContainer}>
                        <FlatList
                            data={userLists}
                            keyExtractor={(item) => item.id.toString()}
                            ListHeaderComponent={
                                <View style={styles.header}>
                                    <Text style={styles.title}>Ваші списки</Text>
                                </View>
                            }
                            ListEmptyComponent={
                                <Text style={styles.noListsText}>У вас поки немає створених списків</Text>
                            }
                            contentContainerStyle={{ paddingBottom: 100, flexGrow: 1 }}
                            showsVerticalScrollIndicator={false}
                            scrollEnabled={shouldScroll}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={styles.listItem}
                                    onPress={() =>
                                        router.push({
                                                pathname: "/shared-lists/[listId]",
                                                params: { listId: item.id }
                                    })}
                                >
                                    <Text style={styles.listName}>{item.name}</Text>
                                </TouchableOpacity>
                            )}
                        />

                        {activeTab === 'lists' && (
                            <View style={styles.listsContainer}>
                                <TouchableOpacity style={styles.listButton} onPress={() =>
                                {
                                    router.push({
                                        pathname: "/shared-lists/create-list",
                                    });
                                }}>
                                    <MaterialIcons name="add" size={25} color={Colors.white200} />
                                </TouchableOpacity>
                            </View>
                        )}
                        {toastVisible ? (
                            <View style={styles.toast}>
                                <Text style={styles.toastText}>Список успішно створено!</Text>
                            </View>
                        ) : null}
                    </SafeAreaView>
                ) : (
                    <SavedAndFavoriteMovies getCurrentMovies={getCurrentMovies} activeTab={activeTab}/>
                )}
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    mainContainer:{
        flex: 1,
        backgroundColor:Colors.lightBlack,
    },
    userName: {
        fontSize: 16,
        color: Colors.white,
        alignSelf: "center",
        justifyContent: "center",
        padding: 5,
        fontWeight: '600',
    },
    infoPanel: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingLeft: 20,
        paddingRight: 20,
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
    statItem: {
        alignItems: "center",
    },
    amount: {
        color: Colors.white200,
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 4,
        paddingTop: 20,
    },
    textInfo: {
        fontSize: 16,
        color: Colors.white,
        alignSelf: "center",
        justifyContent: "center",
        fontWeight: "regular"
    },
    tabs: {
        flexDirection: "row",
        justifyContent: "space-evenly",
        marginVertical: 10,
        position: "relative",
    },
    tab: {
        padding: 10,
        borderRadius: 10,
    },
    separator: {
        width: 1.5,
        height: 20,
        backgroundColor: Colors.white,
        alignSelf: "center",
        opacity: 0.7,
    },
    bottomLine: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: 1.5,
        backgroundColor: Colors.white,
        opacity: 0.5,
    },
    activeTabUnderline: {
        position: 'absolute',
        width: "33.3%",
        height: 2,
        backgroundColor: Colors.white,
        bottom: -1,
        left: 0,
        borderRadius: 2,
    },
    header: {
        marginVertical: 20,
        marginLeft: 15,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.white,
    },
    noListsText: {
        color: Colors.transparentWhite50,
        fontSize: 16,
        fontWeight: "500",
        textAlign: "center",
        marginTop: 20,
    },
    listsContainer: {
        bottom: 40,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.lightBlack,
        paddingVertical: 5,
    },
    listItem: {
        backgroundColor: Colors.container,
        padding: 15,
        marginVertical: 10,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 15,
    },
    listName: {
        fontSize: 18,
        color: Colors.white,
        fontWeight: 'bold',
    },
    listButton: {
        backgroundColor: "#1c1c1e",
        paddingVertical: 8,
        paddingHorizontal: 8,
        borderRadius: 10,
        width: "15%",
        justifyContent: "center",
        alignItems: "center",
        margin: 5,
    },
    toast: {
        position: "absolute",
        bottom: 100,
        width: "100%",
        backgroundColor: "#4CAF50",
        padding: 12,
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1001,
    },
    toastText: {
        fontSize: 14,
        color: "white",
        fontWeight: "bold",
    },
})