import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext({
    token: '',
    isAuthenticated: false,
    isAuthLoading: false,
    authenticate: (token: string) => {},
    logout: () => {},
});

export function useAuth() {
    return useContext(AuthContext);
}
function AuthContextProvider({ children }: any) {
    const [authToken, setAuthToken] = useState<string | null>(null);

    const [isAuthLoading, setIsAuthLoading] = useState(true);

    useEffect(() => {
        async function checkAuth() {
            try {
                const storedToken = await AsyncStorage.getItem('token');
                if (storedToken) {
                    setAuthToken(storedToken);
                }
            } catch (error) {
                console.error("Error fetching token from AsyncStorage", error);
            } finally {
                setIsAuthLoading(false);
            }
        }
        checkAuth();
    }, []);

    function authenticate(token: string) {
        setAuthToken(token);
        AsyncStorage.setItem('token', token);
    }

    function logout() {
        setAuthToken(null);
        AsyncStorage.multiRemove(['token', 'redirectAfterAuth']);
    }

    const value = {
        token: authToken,
        isAuthenticated: !!authToken,
        isAuthLoading,
        authenticate,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContextProvider;
