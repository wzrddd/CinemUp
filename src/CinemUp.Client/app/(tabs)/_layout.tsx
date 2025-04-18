import { Tabs } from "expo-router";
import { BlurView } from 'expo-blur';
import { StyleSheet } from 'react-native';
import Colors from "@/constants/Colors";
import { MaterialIcons } from "@expo/vector-icons";

const TabsLayout = () => {
    return (
        <Tabs
            initialRouteName="index"
            screenOptions={({ route }) => ({
                tabBarIcon: ({ color }) => {
                    let iconName: keyof typeof MaterialIcons.glyphMap = 'home';

                    if (route.name === 'index') iconName = 'home';
                    else if (route.name === 'notifications') iconName = 'notifications';
                    else if (route.name === 'profile') iconName = 'person';
                    else if (route.name === 'swipe-lobby') iconName = 'layers'
                    return <MaterialIcons name={iconName} size={28} color={color} />;
                },
                tabBarActiveTintColor: '#fff',
                tabBarInactiveTintColor: '#bbb',
                headerShown: false,
                tabBarHideOnKeyboard: false,
                tabBarStyle: styles.tabBar,
                tabBarBackground: () => (
                    <BlurView tint="dark" intensity={80} style={StyleSheet.absoluteFill} />
                ),
            })}
        >
            <Tabs.Screen options={{ tabBarLabel: "Сповіщення" }} name="notifications" />
            <Tabs.Screen options={{ tabBarLabel: "Головна" }} name="index" />
            <Tabs.Screen options={{ tabBarLabel: "Swipe" }} name="swipe-lobby" />
            <Tabs.Screen options={{ tabBarLabel: "Профіль" }} name="profile" />
        </Tabs>
    );
};

export default TabsLayout;

const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: Colors.transparentBlack50,
        height: "8%",
        position: 'absolute',
        elevation: 0,
        borderTopWidth: 0,
        overflow: 'hidden',
    },
});
