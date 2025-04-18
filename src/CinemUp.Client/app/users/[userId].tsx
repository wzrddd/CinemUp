import React, { useEffect, useState} from 'react'
import {StyleSheet, Text, SafeAreaView, View, Alert, Pressable} from 'react-native'

import MainContainer from '@/components/MainContainer';
import {LoadingOverlay} from "@/components/LoadingOverlay";
import { MaterialIcons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import {followUser, unfollowUser, getProfileById} from "@/lib/profile";
import { router, useLocalSearchParams } from 'expo-router';

export default function OtherUserProfile() {
    
    const { userId  } = useLocalSearchParams();
    console.log("User id in OtherUserProfile",userId)
    const [profile, setProfile] = useState<{ id: string; username: string; amountOfSubscriptions: number; amountOfFollowers: number, isFollowing: boolean; } | null>(null);
    const [isFetching, setIsFetching] = useState(false);
    
    useEffect(() => {
        const getUserProfileById = async (id: string) => {
            try {
                setIsFetching(true);
                const response: any = await getProfileById(id);
                setProfile(response)
                
                setIsFetching(false);
            } catch (error) {
                setIsFetching(false);
                console.log(error);
            }
        };

        getUserProfileById(userId);
    }, [userId]);


    if(isFetching){
        return <LoadingOverlay />
    }

    const handleFollowUser = async () => {
        if (profile?.isFollowing) {
            Alert.alert('Помилка', 'Ви вже підписані на цього користувача!');
            return;
        }
        try {
            await followUser(userId);
            setProfile(prev => prev ? { ...prev, isFollowing: true, amountOfFollowers: prev.amountOfFollowers + 1 } : null);
            Alert.alert('Успішно', 'Ви підписалися на користувача!');
        } catch (error) {
            console.log(error);
        }
    };

    const handleUnfollowUser = async () => {
        if (!profile?.isFollowing) {
            Alert.alert('Помилка', 'Ви не підписані на цього користувача!');
            return;
        }
        try {
            const response: any = await unfollowUser(userId);
            console.log(response.success);
            Alert.alert('Успішно', 'Ви відписались від користувача!');
            
            setProfile((prev) => prev ? { ...prev, isFollowing: false, amountOfFollowers: prev.amountOfFollowers - 1 } : null);
        } catch (error) {
            console.log(error);
        }
    };
    
    return (
        <SafeAreaView style={styles.mainContainer}>
                <View style={ {justifyContent: "space-between", flexDirection: "row", paddingTop: 20, paddingLeft: 20, paddingRight: 20}}>
                    <Pressable onPress={() => router.back()} style={styles.cancel}>
                        <MaterialIcons name="arrow-back-ios" size={25} color={Colors.transparentWhite}/>
                    </Pressable>
                </View>

                <MaterialIcons style={{alignSelf: "center"}} name="account-circle" size={80} color={Colors.white}/>
                <Text style={styles.userName}>{profile?.username || "Завантаження..."}</Text>

                <View style={styles.infoPanel}>
                    <View style={styles.statItem}>
                        <Text style={styles.amount}>{profile?.amountOfFollowers || 0}</Text>
                        <Text style={styles.textInfo}>Підписники</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.amount}>{profile?.amountOfSubscriptions || 0}</Text>
                        <Text style={styles.textInfo}>Відслідковує</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.amount}>0</Text>
                        <Text style={styles.textInfo}>Сінепоінти</Text>
                    </View>
                </View>
                <Pressable
                    style={[styles.button, profile?.isFollowing ? styles.buttonUnFollow : styles.buttonFollow]}
                    onPress={profile?.isFollowing ? handleUnfollowUser : handleFollowUser}
                >
                    <Text style={styles.buttonText}>
                        {profile?.isFollowing ? "Ви підписані" : "Підписатись"}
                    </Text>
                </Pressable>
        </ SafeAreaView>
    )
}

const styles = StyleSheet.create({
    text: {
        fontSize: 20,
        color: Colors.white,
        alignSelf: "center",
        justifyContent: "center",
        padding: 10
    },
    mainContainer: {
        flex: 1,
        backgroundColor: Colors.lightBlack,
    },
    userName: {
        fontSize: 16,
        color: Colors.white,
        alignSelf: "center",
        justifyContent: "center",
        padding: 5,
        fontWeight: '600',
    },
    usersData:{
        fontSize: 16,
        color: Colors.white,
        marginVertical: 3
    },
    textInfo: {
        fontSize: 16,
        color: Colors.white,
        alignSelf: "center",
        justifyContent: "center",
        fontWeight: "regular"
    },
    infoPanel: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingLeft: 20,
        paddingRight: 20,
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
    cancel: {
        marginLeft: "1%",
        marginTop: 10,
        marginRight: 10
    },
    button: {
        backgroundColor: '#008bfd',
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 20,
        width: "40%",
        alignSelf: "center",
    },
    buttonText: {
        fontSize: 16,
        color: Colors.white,
        fontWeight: "600",
        textTransform: "none",
    },
    buttonUnFollow: {
        backgroundColor: 'rgba(73,69,69,0.59)',
    },
    buttonFollow: {
        backgroundColor: '#008bfd',
    },
})