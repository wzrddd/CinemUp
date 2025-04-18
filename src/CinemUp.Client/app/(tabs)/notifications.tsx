import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, StyleSheet, Image, FlatList } from "react-native";
import { useRouter } from 'expo-router';

import {getNotifications} from "@/lib/notifications";
import {Info} from "@/components/Info";
import {LoadingOverlay} from "@/components/LoadingOverlay";
import Colors from "@/constants/Colors";
export default function Notifications(){

    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const fetchNotifications = async () => {
        try {
            const response: any = await getNotifications();
            console.log(response)
            setNotifications(response);
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchNotifications();
    }, [router]);

    if (loading) {
        return <LoadingOverlay />
    }
    
    return(
        <SafeAreaView style={styles.mainContainer}>
            <View style={styles.mainPanel}>
                <Image style={styles.image} source = {require('../../assets/images/bell-outline-custom.png')} />
                <Info isTitle={true} text={"Сповіщення"} style={styles.title}/>
                <Image style={styles.image}/>
            </View>

            <View style={{margin: 13}}>
                {notifications.length === 0 ? (
                    <Text style={styles.notNotification}>У вас поки немає сповіщень</Text>
                ) : (
                    <FlatList
                        data={notifications}
                        keyExtractor={(item) => item.id.toString()}
                        contentContainerStyle={{marginTop: 90}}
                        inverted
                        initialNumToRender={6}
                        scrollEnabled={notifications.length > 6}
                        renderItem={({ item }) => (
                            <View style={styles.notificationCard}>
                                <Image style={styles.avatar} source = {require('../../assets/images/account-circle-custom.png')} />
                                <View style={styles.notificationTextContainer}>
                                    <Text style={styles.sender}>{item.sender}</Text>
                                    <Text style={styles.message}>{item.message}</Text>
                                    <Text style={styles.time}>{item.time}</Text>
                                </View>
                            </View>
                        )}
                    />
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
    mainPanel: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginTop: 15
    },
    title: {
        fontSize: 30,
        fontWeight: 600,
        color: Colors.white,
    },
    image: {
        width : 30,
        height : 30,
    },
    notificationCard: {
        backgroundColor: Colors.container,
        paddingHorizontal: 8,
        paddingVertical: 4,
        marginTop: 20,
        borderRadius: 15,
        flexDirection: "row",
        alignItems: "center",
    },
    avatar: {
        width : 45,
        height : 45,
        borderRadius: 25,
        marginRight: 4,
    },
    notificationTextContainer: {
        flex: 1,
        justifyContent: "flex-start",
    },
    notNotification: {
        color: Colors.transparentWhite50,
        fontSize: 16,
        fontWeight: "regular",
        alignSelf: "center",
        flex: 1,
        paddingVertical: "70%"
    },
    sender: {
        color: Colors.white200,
        fontSize: 16,
        fontWeight: "bold",
    },
    message: {
        fontSize: 16,
        color: "#b0b0b0",
    },
    time: {
        fontSize: 12,
        marginTop: 4,
        color: "#6e6e73"
    },
    error: {
        color: 'red',
        textAlign: 'center',
        marginTop: 10,
    },
})