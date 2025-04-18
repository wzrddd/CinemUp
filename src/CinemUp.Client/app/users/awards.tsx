import React, { useEffect, useState, useRef } from "react";
import { View, SafeAreaView, StyleSheet, Text, Pressable, SectionList, Animated, Vibration, Alert } from "react-native";
import Colors from "@/constants/Colors";
import { MaterialIcons } from "@expo/vector-icons";
import ConfettiCannon from "react-native-confetti-cannon";
import { getUserAchievements } from "@/lib/achievements";
import { Dimensions } from "react-native";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { router } from "expo-router";

const { width } = Dimensions.get("window");

type Achievement = {
    id: string;
    amountOfPoints: number;
    description: string;
    isAchieved: boolean;
    isNew: boolean;
    name: string;
};
const AchievementItem = ({ item, onCelebrate }: { item: Achievement; onCelebrate?: () => void }) => {
    const scaleAnim = useRef(new Animated.Value(item.isAchieved ? 1 : 0.8)).current;
    const bgColorAnim = useRef(new Animated.Value(item.isAchieved ? 1 : 0)).current;

    useEffect(() => {
        if (item.isAchieved && item.isNew && onCelebrate) {
            console.log("celebrate")
            onCelebrate();
        }

        if (item.isAchieved) {
            Animated.sequence([
                Animated.spring(scaleAnim, {
                    toValue: 1.2,
                    useNativeDriver: true,
                    friction: 3,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    useNativeDriver: true,
                }),
            ]).start();

            Animated.timing(bgColorAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: false,
            }).start();
        }
    }, [item.isAchieved]);

    const backgroundColor = bgColorAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ["#202022FF", "#2f2f2f"],
    });

    return (
        <Animated.View style={[styles.achievementBox, { backgroundColor }]}>
            <View style={styles.row}>
                <View style={styles.textContainer}>
                    <Text style={styles.title}>{item.name}</Text>
                </View>
                <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                    <MaterialIcons
                        name="emoji-events"
                        size={30}
                        color={item.isAchieved ? "gold" : Colors.transparentWhite50}
                        style={styles.icon}
                    />
                </Animated.View>
            </View>
            <Text style={styles.lockedText}>{item.description}</Text>
            {!item.isAchieved && <Text style={styles.pointsText}>Балів: {item.amountOfPoints}</Text>}
        </Animated.View>
    );
};

export default function Awards() {
    const [achievements, setAchievements] = useState<{ id: string; amountOfPoints: number; description: string; isAchieved: boolean, isNew: boolean; name: string; }>([]);
    const [isFetching, setIsFetching] = useState(true);
    const [showConfetti, setShowConfetti] = useState(false);
    const [unlockedName, setUnlockedName] = useState<string | null>(null);
    const [pendingCelebrations, setPendingCelebrations] = useState<string[]>([]);
    const [shouldCelebrate, setShouldCelebrate] = useState(false);
    const toastAnim = useRef(new Animated.Value(0)).current;
    
    const fetchAchievements = async () => {
        const res = await getUserAchievements();
        const sorted = res.sort((a, b) => Number(b.isAchieved) - Number(a.isAchieved));
        const newOnes = sorted.filter(a => a.isAchieved && a.isNew).map(a => a.name);
        setPendingCelebrations(newOnes);
        const hasNew = sorted.some(a => a.isAchieved && a.isNew);

        if (hasNew) setShouldCelebrate(true);

        setAchievements(sorted);
        console.log(res[0])
        setIsFetching(false);
    };
    
    useEffect(() => {
        fetchAchievements();
    }, [router]);
    
    useEffect(() => {
        if (pendingCelebrations.length > 0 && unlockedName === null) {
            const next = pendingCelebrations[0];
            handleCelebrate(next);
        }
    }, [pendingCelebrations, unlockedName]);

    const handleCelebrate = (name: string) => {
        setUnlockedName(name);
        setShowConfetti(true);
        Vibration.vibrate(200);

        Animated.timing(toastAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();

        setTimeout(() => {
            Animated.timing(toastAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start(() => {
                setUnlockedName(null);
                setShowConfetti(false);

                setPendingCelebrations((prev) => prev.slice(1));
            });
        }, 4000);
    };

    const achieved = achievements.filter((a) => a.isAchieved);
    const locked = achievements.filter((a) => !a.isAchieved);

    if (isFetching) return <LoadingOverlay />;

    return (
        <SafeAreaView style={styles.mainContainer}>
            {shouldCelebrate && (
                <>
                    <ConfettiCannon
                        count={150}
                        origin={{ x: width / 2, y: 100 }}
                        autoStart
                        fadeOut
                        fallSpeed={2500}
                        explosionSpeed={500}
                        style={{ position: "absolute", bottom: 0, zIndex: 99999 }}
                    />
                    <Animated.View
                        style={[
                            styles.toast,
                            {
                                opacity: toastAnim,
                                transform: [
                                    {
                                        translateY: toastAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [-30, 0],
                                        }),
                                    },
                                ],
                            },
                        ]}
                    >
                        <Text style={styles.toastText}>🎉 Ви отримали нові досягнення!</Text>
                    </Animated.View>
                </>
            )}

            <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", paddingTop: 20, paddingHorizontal: 20, paddingBottom: 10 }}>
                    <Pressable onPress={() => router.back()}>
                        <MaterialIcons name="arrow-back-ios" size={25} color={Colors.transparentWhite} />
                    </Pressable>
                    <Text style={styles.header}>Ваші досягнення 🏆</Text>
                </View>

                {unlockedName && (
                    <Animated.View
                        style={[
                            styles.toast,
                            {
                                opacity: toastAnim,
                                transform: [
                                    {
                                        translateY: toastAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [-30, 0],
                                        }),
                                    },
                                ],
                            },
                        ]}
                    >
                        <Text style={styles.toastText}>Вітаємо! Ви отримали нагороду 🏆{"\n"}{unlockedName}</Text>
                    </Animated.View>
                )}

                {achieved.length === 0 && (
                    <Text style={styles.emptyText}>
                        У вас ще немає досягнень. 🎯{"\n"}Почніть додавати фільми, дивитись їх і збирати нагороди!
                    </Text>
                )}

                <SectionList
                    sections={[
                        ...(achieved.length > 0 ? [{ title: "Отримані", data: achieved }] : []),
                        ...(locked.length > 0 ? [{ title: "Доступні для отримання", data: locked }] : []),
                    ]}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => <AchievementItem item={item} />}
                    renderSectionHeader={({ section: { title } }) => (
                        <Text style={styles.sectionTitle}>{title}</Text>
                    )}
                    contentContainerStyle={{ padding: 20, paddingBottom: 50 }}
                    showsVerticalScrollIndicator={false}
                    stickySectionHeadersEnabled={false}
                />
            </View>
        </SafeAreaView>
    );
}


const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: Colors.lightBlack,
    },
    header: {
        fontSize: 20,
        fontWeight: "500",
        color: Colors.white,
        alignSelf: "center",
        paddingLeft: "8%",
    },
    achievementBox: {
        backgroundColor: "#202022FF",
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    title: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
    },
    lockedText: {
        marginTop: 6,
        fontSize: 12,
        color: Colors.transparentWhite50,
    },
    pointsText: {
        marginTop: 4,
        fontSize: 14,
        color: Colors.transparentWhite,
        fontWeight: "600",
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    textContainer: {
        flex: 1,
        paddingRight: 10,
    },
    icon: {
        marginLeft: 10,
    },
    toast: {
        position: "absolute",
        top: 80,
        alignSelf: "center",
        backgroundColor: "#FFD700",
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 16,
        zIndex: 1000,
        shadowColor: "#000",
        shadowOpacity: 0.4,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 6,
        elevation: 10,
    },
    toastText: {
        color: "#202020",
        fontSize: 16,
        fontWeight: "600",
        textAlign: "center",
        lineHeight: 22,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: Colors.transparentWhite,
        marginTop: 10,
        marginBottom: 10,
        paddingLeft: 10,
    },
    emptyText: {
        fontSize: 16,
        color: Colors.transparentWhite50,
        textAlign: "center",
        marginVertical: 20,
        fontStyle: "italic",
    },
});