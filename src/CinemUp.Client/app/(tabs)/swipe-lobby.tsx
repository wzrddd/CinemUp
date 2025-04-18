import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet, TextInput, Pressable, SafeAreaView, Alert, KeyboardAvoidingView } from "react-native";
import Colors from "@/constants/Colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { HubConnection, HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import {Info} from "@/components/Info";
import { router } from "expo-router";
import { setConnection as setGlobalConnection } from "../../lib/signalrStore";

export default function SwipeLobby() {
    const [code, setCode] = useState("");
    const [connection, setConnection] = useState<HubConnection | null>(null);
    const [userId, setUserId] = useState()

    useEffect(() => {
        const newConnection = new HubConnectionBuilder()
            .withUrl("https://cinemup.azurewebsites.net/api/Swiper", {
                accessTokenFactory: async () => {
                    let token = await AsyncStorage.getItem("token");
                    return token ?? "Error";
                }
            })
            .configureLogging(LogLevel.Information)
            .withAutomaticReconnect()
            .build();

        setConnection(newConnection);

        newConnection.on("RoomCreated", (roomCode) => {
            console.log("Room created with code:", roomCode);
            Alert.alert("Кімнату створено!", `Ваш код кімнати: ${roomCode}`, [
                {
                    text: "OK",
                    onPress: () => {
                        setGlobalConnection(newConnection);
                        router.push({
                            pathname: "/swipe/swipe",
                            params: { code: roomCode },
                        });
                    }
                }
            ]);
        });

        newConnection.on("UserConnected", (id) => {
            console.log("User connected with id:", id);
            setUserId(id);
            setGlobalConnection(newConnection); 

            router.push({
                pathname: "/swipe/swipe",
                params: { userId: id, code },
            });
        });

        newConnection.start()
            .then(() => console.log("SignalR Connected"))
            .catch((err) => console.log("Connection Error:", err));

        return () => {
            newConnection.stop();
        };
    }, []);

    const createRoom = async () => {
        if (connection) {
            await connection.invoke("CreateRoom").catch(err => console.log("CreateRoom Error:", err));
        } else {
            console.log("Connection not established yet.");
        }
    };

    const joinRoom = async () => {
        if (connection) {
            try {
                await connection.invoke("JoinRoom", code);
            } catch (err) {
                console.log("JoinRoom Error:", err);
            }
        } else {
            console.log("Connection not established yet.");
        }
    };
    return (
        <SafeAreaView style={styles.mainContainer}>
            <KeyboardAvoidingView behavior={"position"}>
                <View style={styles.mainContainer}>
                    <View style={styles.manageContainer}>
                        <Info isTitle={true} text={"Swipe"} style={styles.title} />

                        <Pressable style={({ pressed }) => [
                            pressed && styles.pressed,
                            styles.createRoomButton,
                        ]}
                                   onPress={createRoom}>
                            <Text style={styles.text}>Створити кімнату</Text>
                        </Pressable>


                        <Text style={styles.orText}>або</Text>

                        <View style={styles.joinRoomContainer}>
                            <TextInput onChangeText={setCode} style={styles.textInput} placeholder="Код кімнати" placeholderTextColor={Colors.black} autoCapitalize={"characters"}/>

                            <Pressable style={({ pressed }) => [
                                pressed && styles.pressed,
                                styles.joinRoomButton,
                            ]}
                                       onPress={joinRoom}>
                                <Text style={styles.text}>Увійти</Text>
                            </Pressable>

                        </View>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.lightBlack,
    },
    manageContainer: {
        width: 320,
        height: 380,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 15,
        backgroundColor: Colors.container,
        padding: 20,
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 5,
    },
    orText: {
        fontSize: 18,
        fontWeight: "600",
        color: Colors.white,
        marginVertical: 15,
    },
    createRoomButton: {
        width: "85%",
        height: 54,
        borderWidth: 1,
        borderRadius: 10,
        elevation: 2,
        backgroundColor: Colors.white,
        alignItems: "center",
        justifyContent: "center",
    },
    joinRoomContainer: {
        width: "85%",
        alignItems: "center",
    },
    textInput: {
        width: "100%",
        height: 50,
        paddingHorizontal: 15,
        borderRadius: 10,
        fontSize: 18,
        backgroundColor: Colors.white200,
        marginBottom: 15,
        borderWidth: 1,
    },
    joinRoomButton: {
        width: "100%",
        height: 50,
        borderWidth: 1,
        borderRadius: 10,
        backgroundColor: Colors.white,
        alignItems: "center",
        justifyContent: "center",
    },
    text: {
        fontWeight: "600",
        fontSize: 18,
        paddingHorizontal: 20,
    },
    pressed: {
        opacity: 0.7,
    },
    title: {
        paddingBottom: 25,
        fontSize: 40,
        fontWeight: "600",
    },
});
