import { Slot, Stack, useRouter } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";

import AuthContextProvider, { AuthContext } from "@/lib/auth-context";

function RootLayoutInner() {
    const { isAuthenticated, authenticate } = useContext(AuthContext);
    const [isTryingLogin, setIsTryingLogin] = useState(true);
    const router = useRouter();

    useEffect(() => {
        async function checkAuthToken() {
            try {
                const storedToken = await AsyncStorage.getItem('token');
                if (storedToken) {
                    authenticate(storedToken);
                }
            } catch (err) {
                console.warn('Error loading auth token', err);
            } finally {
                setIsTryingLogin(false);
            }
        }

        checkAuthToken();
    }, [authenticate]);

    useEffect(() => {
        if (!isTryingLogin && !isAuthenticated) {
            router.replace('/auth/login');
        }
    }, [isTryingLogin, isAuthenticated]);
    
    return (
        <>
            <StatusBar style="light" />
            <Stack screenOptions={{headerShown: false}}>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

                <Stack.Screen name="auth/login" options={{ title: 'Login' }} />
                <Stack.Screen name="auth/signup" options={{ title: 'Sign Up' }} />

                <Stack.Screen name="movies/[movieId]" options={{ title: 'Movie Details' }} />

                <Stack.Screen name="shared-lists/[listId]" options={{ headerShown:false }} />
                <Stack.Screen name="shared-lists/create-list" options={{ headerShown:false , presentation: 'modal' }} />

                <Stack.Screen name="users/awards" options={{ title: 'Awards' }} />
                <Stack.Screen name="users/[userId]" options={{ title: 'User Profile' }} />
                
                <Stack.Screen name="search-user/[listId]" options={{ title: 'List User Search' }} />
                
                <Stack.Screen name="swipe/swipe" options={{ title: 'SwipeLobby Play' }} />
                
            </Stack>
        </>
    );
}

export default function RootLayout() {
    return (
        <AuthContextProvider>
            <RootLayoutInner />
        </AuthContextProvider>
    );
}
