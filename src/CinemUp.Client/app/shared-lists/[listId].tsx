import {View, Text, FlatList, ActivityIndicator, Pressable, StyleSheet, Modal, Dimensions, Image, Alert, Animated, SafeAreaView} from "react-native";
import {addMovieToSharedList, deleteSharedListById, deleteUserFromSharedList, getSharedListById, leaveSharedListById} from "@/lib/shared-list";
import React, {useEffect, useState} from "react";
import Colors from "@/constants/Colors";
import {MaterialIcons} from "@expo/vector-icons";

import SearchMovieInList from "@/components/SearchMovieInList";
import {router, useLocalSearchParams } from "expo-router";

const IMAGE_URL = "https://image.tmdb.org/t/p/original"

export default function ListOverview() {

    const { listId } = useLocalSearchParams();

    console.log('List ID([listId]):', listId);

    const [isListOwner, setIsListOwner] = useState(false);
    const [listName, setListName] = useState<string | undefined>();
    const [listMembers, setListMembers] = useState<any[] | undefined>();
    const [listMovies, setListMovies] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const [toastVisible, setToastVisible] = useState(false);
    const [isMembersVisible, setIsMembersVisible] = useState(false);
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const menuAnimation = useState(new Animated.Value(0))[0];
    const [ownerId, setOwnerId] = useState<number | null>(null);

    const [isFetching, setIsFetching] = useState(false);

    useEffect(() => {
        const fetchSharedList = async () => {
            try {
                const result = await getSharedListById(listId);
                console.log(result);
                setOwnerId(result?.ownerId);

                setIsListOwner(result?.isOwner);
                setListName(result?.name);
                setListMembers(result?.members);
                setListMovies(result?.movies ?? []);
            } catch (error) {
                console.log(error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSharedList();

        const intervalId = setInterval(() => {
            fetchSharedList();
        }, 2000);

        return () => clearInterval(intervalId);
    }, [listId]);

   
    const renderMovieItem = ({ item }: { item: any }) => (
        <Pressable
            onPress={() => {
            router.push({
                pathname: "/movies/[movieId]",
                params: { movieId: item.id }
        })}}
            style={styles.movieContainer}
        >
            <Image source={{ uri: `${IMAGE_URL}${item.imageUri}` }} style={styles.image} />
            <View style={styles.movieDetails}>
                <Text style={styles.movieTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.movieDescription} numberOfLines={2}>{item.description}</Text>
            </View>
        </Pressable>
    );
    const addMovieToList = async (movieId: number, listId: number) => {
        try {
            console.log("MovieId " + movieId)
            console.log("listId " + listId)

            setIsFetching(true);
            const results = await addMovieToSharedList(movieId, listId);
            console.log("Movie added:", results);
            setListMovies((prevMovies) => [...prevMovies, results.movie]);

            setToastVisible(true);

            setTimeout(() => {
                setToastVisible(false);
            }, 3000);

            setIsFetching(false);
        } catch (error) {
            console.log("Error adding movie:", error);
        }
    };
    
    const leaveSharedList = async () => {
        try {
            setIsFetching(true);
            const response = await leaveSharedListById(listId)
            router.back()
            setIsFetching(false);
            console.log(response)
        }
        catch(error)
        {
            console.log(error)
        }
    }
    
    const handlePress = (movieId: number) => {
        setIsSearchVisible(false);
        setTimeout(() => {
            router.push({
                pathname: "/movies/[movieId]",
                params: {movieId: movieId}
            })
        }, 300);
    };

    const handleRemoveUser = (user: any) => {
        Alert.alert(
            "Підтвердження",
            `Ви впевнені, що хочете видалити ${user.username || user.email}?`,
            [
                {
                    text: "Скасувати",
                    style: "cancel"
                },
                {
                    text: "Видалити",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteUserFromSharedList(user.id, listId);

                            await new Promise(resolve => setTimeout(resolve, 300));

                            const updatedList = await getSharedListById(listId);
                            console.log("Updated list after deletion:", updatedList);
                            setListMembers(updatedList.members);

                        } catch (error) {
                            console.log("Помилка видалення користувача:", error);
                        }
                    }
                }
            ]
        );
    };

    const handleDeleteList = () => {
        Alert.alert(
            "Підтвердження",
            `Ви впевнені, що хочете видалити список?`,
            [
                {
                    text: "Скасувати",
                    style: "cancel"
                },
                {
                    text: "Видалити",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            setIsFetching(true);
                            const response = await deleteSharedListById(listId)
                            router.back()
                            setIsFetching(false);
                            console.log(response)

                        } catch (error) {
                            console.log("Помилка видалення cписку:", error);
                        }
                    }
                }
            ]
        );
    };

    if (isLoading) {
        return (
            <View style={{flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.lightBlack}}>
                <ActivityIndicator size="large" color="white"/>
                <Text style={{color: "white", marginTop: 10}}>Завантаження...</Text>
            </View>
        );
    }

    const renderMembersModal = () => {
        const sortedMembers = listMembers?.length > 0 ? [
            ...listMembers.filter(member => member.id === ownerId),
            ...listMembers.filter(member => member.id !== ownerId),
        ] : [];

        return (
            <Modal
                visible={isMembersVisible}
                animationType="slide"
                onRequestClose={() => setIsMembersVisible(false)}
                transparent
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.membersSheet}>
                        <View style={styles.topBar}>
                            <Pressable onPress={() => setIsMembersVisible(false)}>
                                <MaterialIcons name="arrow-back-ios" size={25} color={Colors.transparentWhite} />
                            </Pressable>
                            <Text style={styles.listTitle}>Учасники</Text>
                            <View style={{ width: 28 }} />
                        </View>

                        {sortedMembers.length === 0 ? (
                            <Text style={styles.noMembersText}>Немає учасників</Text>
                        ) : (
                            <FlatList
                                data={sortedMembers}
                                keyExtractor={(item) => item.id.toString()}
                                contentContainerStyle={{ padding: 20 }}
                                renderItem={({ item }) => (
                                    <View style={styles.memberItem}>
                                        <Image
                                            style={styles.avatar}
                                            source={require("../../assets/images/account-circle-custom.png")}
                                        />
                                        <View style={styles.notificationTextContainer}>
                                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                                <Text style={styles.sender}>{item.username}</Text>
                                                {item.id === ownerId && (
                                                    <MaterialIcons
                                                        name="star"
                                                        size={20}
                                                        color="#f1c40f"
                                                        style={{ marginLeft: 10 }}
                                                    />
                                                )}
                                            </View>
                                        </View>
                                        {isListOwner && item.id !== ownerId && (
                                            <Pressable
                                                onPress={() => handleRemoveUser(item)}
                                                style={styles.removeIcon}
                                            >
                                                <MaterialIcons name="close" size={22} color="red" />
                                            </Pressable>
                                        )}
                                    </View>
                                )}
                            />
                        )}
                    </View>
                </View>
            </Modal>
        );
    };


    const openMenu = () => {
        setIsMenuVisible(true);
        Animated.timing(menuAnimation, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
        }).start();
    };

    const closeMenu = () => {
        Animated.timing(menuAnimation, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
        }).start(() => setIsMenuVisible(false));
    };

    const renderAnimatedMenu = () => {
        const translateY = menuAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [-10, 0],
        });

        const opacity = menuAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
        });

        return (
            isMenuVisible && (
                <Pressable style={styles.fullscreenPressable} onPress={closeMenu}>
                    <Animated.View style={[styles.dropdownMenu, { opacity, transform: [{ translateY }] }]}>
                        <Pressable
                            style={styles.menuItem}
                            onPress={() => {
                                closeMenu();
                                router.push({pathname: "/search-user/[listId]",
                                    params: { listId: listId }});
                            }}
                        >
                            <Text style={styles.menuText}>Додати користувача</Text>
                        </Pressable>
                        <Pressable
                            style={styles.menuItem}
                            onPress={() => {
                                closeMenu();
                                setIsMembersVisible(true);
                            }}
                        >
                            <Text style={styles.menuText}>Користувачі</Text>
                        </Pressable>
                        <Pressable
                            style={styles.menuItem}
                            onPress={async () => {
                                closeMenu();
                                await leaveSharedList();
                            }}
                        >
                            <Text style={styles.menuText}>Покинути</Text>
                        </Pressable>
                        {isListOwner && (
                        <Pressable
                            style={styles.menuItem}
                            onPress={async () => {
                                closeMenu();
                                handleDeleteList();
                            }}
                        >
                            <Text style={styles.removeListText}>Видалити</Text>
                        </Pressable>)}
                    </Animated.View>
                </Pressable>
            )
        );
        }
    return (
        <SafeAreaView style={styles.mainContainer}>
            <Modal
                visible={isSearchVisible}
                animationType="slide"
                onRequestClose={() => setIsSearchVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.bottomSheet}>
                        <SearchMovieInList
                            toastVisible={toastVisible}
                            setIsSearchVisible={setIsSearchVisible}
                            handlePress={handlePress}
                            addMovieToList={addMovieToList}
                            listId={listId}
                        />
                    </View>
                </View>
            </Modal>

            {renderMembersModal()}
            {renderAnimatedMenu()}

            <View style={styles.topBar}>
                <Pressable onPress={() => router.back()}>
                    <MaterialIcons name="arrow-back-ios" size={25} color={Colors.transparentWhite} />
                </Pressable>

                <Text style={styles.listTitle}>
                    {listName || "Назва списку не знайдена"}
                </Text>

                <View style={{ flexDirection: "row" }}>
                    <Pressable onPress={openMenu}>
                        <MaterialIcons name="menu" size={28} color={Colors.transparentWhite} />
                    </Pressable>
                </View>
            </View>

            {listMovies.length === 0 ? (
                <Text style={{ color: Colors.transparentWhite50, fontSize: 16, textAlign: "center", marginTop: 10 }}>
                    Ваш список фільмів поки порожній
                </Text>
            ) : (
                <FlatList
                    data={listMovies.filter(item => item && item.id)}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={{
                        paddingBottom: listMovies.length > 1 ? 50 : 10,
                    }}
                    renderItem={renderMovieItem}
                />
            )}

            <View style={styles.bottomTextContainer}>
                <Pressable onPress={() => setIsSearchVisible(true)}>
                    <Text style={styles.bottomText}>Додати фільм</Text>
                </Pressable>
            </View>
        </SafeAreaView>
    );

}

const styles = StyleSheet.create({
        mainContainer: {
            flex: 1,
            backgroundColor: Colors.lightBlack,
        },
    movieDescription: {
        fontSize: 14,
        color: Colors.white200,
        marginVertical: 5,
    },
    movieTitle: {
        fontSize: 18,
        color: Colors.white,
        fontWeight: "bold",
        width: 200
    },
    movieInfo: {
        color: Colors.white200,
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 4,
        justifyContent: "space-evenly",
    },
    bottomTextContainer: {
        position: "absolute",
        bottom: 40,
        width: "100%",
        alignItems: "center",
    },
    bottomText: {
        color: Colors.white200,
        fontWeight: "500", 
        fontSize: 17,
    },
    modalOverlay: {
            flex:1,
        backgroundColor: Colors.black,
        justifyContent: 'flex-end',
    },
    membersSheet: {
        height: '95%',
        backgroundColor: Colors.lightBlack,
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        paddingTop: 10,
        overflow: 'hidden',
    },
    bottomSheet: {
        height: '95%',
        backgroundColor: Colors.lightBlack,
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        paddingTop: 5,
        overflow: 'hidden',
    },
    searchContainer: {
        backgroundColor: Colors.searchContainer,
        borderRadius: 10,
        paddingVertical: 8,
        marginTop: 40,
        paddingHorizontal: 15,
        width: "80%",
    },
    movieContainer: {
        flexDirection: "row",
        padding: 15,
        marginBottom: 10,
        borderRadius: 10,
    },
    image: {
        width: 150/1.2,
        height: 230/1.2,
        borderRadius: 10,
        marginRight: 10,
    },
    container: {
        flexDirection: "row",
        alignItems: "center",
        marginLeft: 10,
        flexWrap: "wrap",
    },
    topBar: {
        marginTop: 30,
        marginHorizontal: 15,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    listTitle: {
        fontSize: 20,
        color: Colors.white200,
        fontWeight: "bold",
        textAlign: "center",
        flex: 1,
        marginHorizontal: 10,
    },
    movieDetails:{
        flex: 1,
        justifyContent: "center",
        marginLeft: 15,
    },
    menuModal: {
        backgroundColor: Colors.lightBlack,
        marginTop: 100,
        marginHorizontal: 30,
        borderRadius: 2,
        paddingVertical: 10,
        paddingHorizontal: 15,
        elevation: 5,
    },
    fullscreenPressable: {
        position: "absolute",
        top: 110,
        right: 10,
        width: "100%",
        height: "100%",
        zIndex: 100,
    },
    dropdownMenu: {
        position: "absolute",
        top: 0,
        right: 10,
        backgroundColor: "#1d1f22",
        borderColor: "#222427",
        borderRadius: 10,
        borderWidth: 0.5,
        paddingVertical: 8,
        paddingHorizontal: 12,
        zIndex: 101,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    menuItem: {
        paddingVertical: 10,
        borderBottomColor: Colors.transparentWhite50,
    },
    menuText: {
        color: Colors.white,
        fontSize: 13,
        fontWeight: "bold"
    },
    leaveListText:{
        color: Colors.white,
        fontSize: 13,
        fontWeight: "bold"   
    },
    removeListText:{
        color: "#ef0000",
        fontSize: 13,
        fontWeight: "bold"
    },
    removeIcon: {
        position: "absolute",
        right: 0,
        top: "50%",
        transform: [{ translateY: -11 }],
        padding: 10,
    },
    noMembersText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#ccc',
        padding: 20,
    },
    memberItem: {
        paddingVertical: 10,
        borderBottomColor: Colors.transparentWhite50,
        borderBottomWidth: 0.5,
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
    },
    notificationTextContainer: {
        flexDirection: 'column',
    },
    sender: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.white,
    },
    message: {
        fontSize: 14,
        color: '#b0b0b0',
    },
})