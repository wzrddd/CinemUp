import AsyncStorage from "@react-native-async-storage/async-storage";
import {api} from "@/lib/api-client";

export async function getNotifications() {
    try {
        const storedToken = await AsyncStorage.getItem('token');
        const response = await api.get('/User/notifications', { headers: { Authorization: `Bearer ${storedToken}`}});
        return response;
    } catch (error) {
        console.log(error);
    }
}