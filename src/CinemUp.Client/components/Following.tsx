import React, { useState, useEffect, useCallback } from "react";
import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator, SafeAreaView, Image } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { StackParams } from "@/app";
import { MaterialIcons } from "@expo/vector-icons";

import {getUserFollowers, getUserFollowing} from "@/lib/profile";
import Colors from "@/constants/Colors";
import MainContainer from "@/components/MainContainer";
import { router } from "expo-router";

interface User {
    id: number;
    username: string;
}

export default function FollowingModal({ onClose }: { onClose: () => void }) {
    
    const [following, setFollowing] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchFollowers() {
            try {
                const response = await getUserFollowing();
                setFollowing(response);
            } catch (err) {
                console.error("Error loading followers", err);
            } finally {
                setLoading(false);
            }
        }
        fetchFollowers();
    }, []);

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center", padding: 20 }}>
                <Pressable onPress={onClose}>
                    <MaterialIcons name="close" size={25} color={Colors.white} />
                </Pressable>
                <Text style={[styles.header, { paddingLeft: 10 }]}>Підписники</Text>
            </View>
            {loading ? (
                <ActivityIndicator size="large" color={Colors.white} />
            ) : following.length === 0 ? (
                <Text style={styles.emptyText}>Ви нікого не відстежуєте</Text>
            ) : (
                <FlatList
                    data={following}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
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
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        width: "100%",
        height: "100%",
        borderRadius: 0,
        backgroundColor: Colors.lightBlack,
        borderColor: Colors.black,
    },
    header: {
        fontSize: 20,
        fontWeight: "600",
        color: Colors.white,
        alignSelf: "center",
        paddingLeft: "8%"
    },
    loader: {
        marginTop: 20,
    },
    emptyText: {
        fontSize: 16,
        color: Colors.transparentWhite50,
        textAlign: "center",
        marginTop: 20,
    },
    userItem: {
        padding: 15,
        backgroundColor: Colors.black,
        marginBottom: 10,
        borderRadius: 10,
    },
    username: {
        fontSize: 16,
        color: Colors.white,
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
});