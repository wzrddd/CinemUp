import {useState} from "react";
import {TextInput, View, StyleSheet, FlatList, SafeAreaView, Text, Pressable, Image} from "react-native";
import {MaterialIcons} from "@expo/vector-icons";

import {getUserByUsername} from "@/lib/profile";

import Colors from "@/constants/Colors";
import {addUserToSharedList} from "@/lib/shared-list";
import {router, useLocalSearchParams } from "expo-router";

export default function ListSearchUser()
{
    const { listId } = useLocalSearchParams();

    console.log('List ID[users/listId]:', listId);
    
    const [username, setUsername] = useState("");
    const [userId, setUserId] = useState("");
    const [users, setUsers] = useState<any[]>([]);
    const [notFound, setNotFound] = useState(false);
    const [isPressed, setIsPressed] = useState(false);
    const [toastVisible, setToastVisible] = useState(false);
    const [addedUserIds, setAddedUserIds] = useState<number[]>([]);

    async function getUser() {
        try {
            const user = await getUserByUsername(username);
            const jsonArray = JSON.parse(JSON.stringify(user))
            if (jsonArray.length === 0) {
                setNotFound(true);
            } else {
                setNotFound(false);
            }

            setUsers(jsonArray);
            console.log(jsonArray)
        } catch (err) {
            setUsers([]);
            setNotFound(true);
            console.log(err)
        }
    }

    const handleAddUser = async (userId: number) => {
        const response = await addUserToSharedList(userId, listId);
        console.log("Додано користувача:", userId);
        setToastVisible(true);
        setAddedUserIds((prev) => [...prev, userId]);

        setTimeout(() => {
            setToastVisible(false);
        }, 3000);
    };

    return (
        <SafeAreaView style={styles.mainContainer}>
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.cancel}>
                    <MaterialIcons
                        name="arrow-back-ios"
                        size={25}
                        color={Colors.transparentWhite}
                    />
                </Pressable>
                <View style={styles.searchContainer}>
                    <TextInput
                        style={styles.searchInput}
                        onEndEditing={getUser}
                        onChangeText={setUsername}
                        placeholderTextColor={Colors.transparentWhite50}
                        placeholder="Введіть ім'я користувача..."
                    />
                </View>
            </View>

            {notFound ? (
                <Text style={styles.notFoundText}>Користувача не знайдено</Text>
            ) : (
                <FlatList
                    data={users}
                    keyExtractor={(item) => item.id.toString()}
                    initialNumToRender={6}
                    scrollEnabled={users.length > 6}
                    renderItem={({ item }) => {
                        const isAdded = addedUserIds.includes(item.id);
                        return (
                            <View style={styles.userCard}>
                                <View style={styles.userInfo}>
                                    <Image
                                        style={styles.avatar}
                                        source={require("../../assets/images/account-circle-custom.png")}
                                    />
                                    <View style={styles.userTextContainer}>
                                        <Text style={styles.user}>{item.username}</Text>
                                    </View>
                                </View>
                                <Pressable
                                    onPressIn={() => setIsPressed(true)}
                                    onPressOut={() => setIsPressed(false)}
                                    onPress={() => !isAdded && handleAddUser(item.id)}
                                    disabled={isAdded}
                                    style={[
                                        styles.addButton,
                                        isPressed ? styles.addButtonPressed : styles.addButtonUnpressed,
                                    ]}
                                >
                                    <MaterialIcons
                                        name={isAdded ? "check" : "person-add"}
                                        size={20}
                                        color={Colors.transparentWhite}
                                    />
                                </Pressable>
                            </View>
                        );
                    }}
                />
            )}

            {toastVisible && (
                <View style={styles.toast}>
                    <Text style={styles.toastText}>Користувача успішно додано!</Text>
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
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 30,
        width: "100%",
        marginBlockEnd: 10,
    },
    cancel: {
        marginLeft: "3%",
        marginRight: 10,
    },
    searchContainer: {
        backgroundColor: "#1c1c1e",
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 15,
        width: "82%",
    },
    title: {
        marginLeft: 30,
        fontSize: 18,
        color: Colors.white,
    },
    searchInput: {
        fontSize: 18,
        fontWeight: "regular",
        color: Colors.white,
    },
    userContainer: {
        margin: 10,
    },
    userData: {
        fontSize: 16,
        color: Colors.white,
        marginVertical: 3,
    },
    userCard: {
        flexDirection: "row",
        alignItems: "center",
        padding: 10,
        marginVertical: 8,
        backgroundColor: "#202022FF",
        borderRadius: 10,
        marginHorizontal: "4%",
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
    },
    userTextContainer: {
        flexDirection: "column",
    },
    user: {
        fontSize: 16,
        fontWeight: "bold",
        color: Colors.white,
    },
    message: {
        fontSize: 14,
        color: "#b0b0b0",
    },
    notFoundText: {
        textAlign: "center",
        fontSize: 16,
        color: Colors.transparentWhite50,
        marginTop: 20,
    },
    userInfo: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    addButton: {
        backgroundColor: Colors.transparentBlack50,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    addButtonText: {
        color: Colors.white,
        fontWeight: "600",
        fontSize: 14,
    },
    addButtonUnpressed: {
        backgroundColor: Colors.transparentBlack50,
        elevation: 5,
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    addButtonPressed: {
        backgroundColor: Colors.transparentBlack70,
        elevation: 8,
        shadowColor: Colors.darkGray,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
    },
    toast: {
        position: "absolute",
        bottom: 50,
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