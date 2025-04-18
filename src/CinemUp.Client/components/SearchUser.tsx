import {useState} from "react";
import {TextInput, View, StyleSheet, FlatList, SafeAreaView, Text, Pressable, Image} from "react-native";
import {MaterialIcons} from "@expo/vector-icons";

import {getUserByUsername} from "@/lib/profile";

import Colors from "@/constants/Colors";
import { router } from "expo-router";

export function SearchUser({ onClose }: { onClose: () => void }) {
    const [username, setUsername] = useState("");
    const [users, setUsers] = useState<any[]>([]);
    const [notFound, setNotFound] = useState(false);
    
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
        } catch (err) {
            setUsers([]);
            setNotFound(true);
            console.log(err)
        }
    }

    return (
        <SafeAreaView style={styles.mainContainer}>
            <View style={styles.header}>
                <Pressable onPress={onClose} style={styles.cancel}>
                    <MaterialIcons name="arrow-back-ios" size={25} color={Colors.transparentWhite}/>
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
                    renderItem={({item}) => (
                        <Pressable
                            onPress={() => {
                                onClose(); 
                                router.push({
                                    pathname: "/users/[userId]",
                                    params: { userId: item.id },
                                });
                            }}
                            style={styles.notificationCard}
                        >
                            <Image
                                style={styles.avatar}
                                source={require("../assets/images/account-circle-custom.png")}
                            />
                            <View style={styles.notificationTextContainer}>
                                <Text style={styles.sender}>{item.username}</Text>
                                <Text style={styles.message}>Переглянути профіль</Text>
                            </View>
                        </Pressable>
                    )}
                />
            )}
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    mainContainer:{
        flex: 1,
        backgroundColor:Colors.lightBlack,
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
    notificationCard: {
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
    notificationTextContainer: {
        flexDirection: "column",
    },
    sender: {
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
})