import AsyncStorage from "@react-native-async-storage/async-storage";
import {api} from "@/lib/api-client";
import { Alert } from 'react-native';

export async function getProfile() {
    try {
        const storedToken = await AsyncStorage.getItem('token');
        const response: any = await api.get(`/User/own-user-profile`, {headers: {Authorization: `Bearer ${storedToken}`}});
        return response;
    } catch (error) {
        console.log(error);
    }
}

export async function getProfileById(id: any) {
    const storedToken = await AsyncStorage.getItem('token');

    const response: any = await api.get(`/User/user-profile/` + id, {headers: {Authorization: `Bearer ${storedToken}`}})
    return response;
}

export async function getUserByUsername(UserName: string) {
    const storedToken = await AsyncStorage.getItem('token');

    const response: any = await api.get(`/User/search?UserName=${UserName}`, {headers: {Authorization: `Bearer ${storedToken}`}});
    return response;
}

export async function followUser(id: string) {
    const storedToken = await AsyncStorage.getItem('token');
    try {
        const response = await api.post(`/User/follow/${id}`, {id}, {headers: {Authorization: `Bearer ${storedToken}`}});
        return response;
    }catch (error: unknown) {
        if (error.response) {
            if (error.response.status === 400) {
                Alert.alert('Помилка', 'Ви вже підписані на цього користувача!');
            } else {
                console.error('Server response:', error.response);
            }
        }
        throw error;
    }
}

export async function unfollowUser(id: string) {
    const storedToken = await AsyncStorage.getItem('token');
    try {
        const response = await api.post(`/User/unfollow/${id}`, { id }, {headers: { Authorization: `Bearer ${storedToken}` }});
        return response;
    } catch (error: any) {
        if (error.response) {
            if (error.response.status === 400) {
                Alert.alert('Помилка', 'Ви не підписані на цього користувача!');
            } else {
                console.error('Server response:', error.response);
            }
        }
        throw error;
    }
}
export async function getUserFollowers() {
    const storedToken = await AsyncStorage.getItem('token');
    try {
        const response: any = await api.get(`/User/followers`, {headers: {Authorization: `Bearer ${storedToken}`}});
        return response;
    } catch (error) {
        console.error("Помилка отримання підписників:", error);
        return [];
    }
}

export async function getUserFollowing() {
    const storedToken = await AsyncStorage.getItem('token');
    try {
        const response = await api.get(`/User/following`, {headers: {Authorization: `Bearer ${storedToken}`}});
        return response
    } catch (error) {
        console.error("Помилка отримання підписок:", error);
        return [];
    }
}
