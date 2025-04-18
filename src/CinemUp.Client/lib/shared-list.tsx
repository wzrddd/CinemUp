import {api} from "@/lib/api-client";
import AsyncStorage from "@react-native-async-storage/async-storage";

export async function createSharedList(listName: string) {
    const storedToken = await AsyncStorage.getItem('token');
    try{
        const response: any = await api.post(`/Movies/create-shared-list?listName=${listName}`, {listName}, {headers: {Authorization: `Bearer ${storedToken}`}})
        return response;
    } catch (error) {
        console.log(error);
    }
}

export async function addUserToSharedList(userId: number, sharedListId: number) {
    const storedToken = await AsyncStorage.getItem('token');
    try{
        const response: any = await api.post(`/Movies/add-user-to-shared-list?userId=${userId}&sharedListId=${sharedListId}`, {userId, sharedListId}, {headers: {Authorization: `Bearer ${storedToken}`}})
        return response;
    }catch(error) {
        console.log(error);
    }
}

export async function addMovieToSharedList(movieId: number, sharedListId: number) {
    const storedToken = await AsyncStorage.getItem('token');
    try{
        const response: any = await api.post(`/Movies/add-movie-to-shared-list?movieId=${movieId}&sharedListId=${sharedListId}`, {movieId, sharedListId}, {headers: {Authorization: `Bearer ${storedToken}`}})
        return response;
    }catch(error) {
        console.log(error);
    }
}

export async function getSharedListById(listId: number) {
    const storedToken = await AsyncStorage.getItem('token');
    try{
        const response: any = await api.get(`/Movies/get-shared-list/${listId}`, {headers: {Authorization: `Bearer ${storedToken}`}})
        return response;
    } catch(error) {
        console.log(error);
    }
}

export async function getSharedListsForUser() {
    const storedToken = await AsyncStorage.getItem('token');
    try{
        const response: any = await api.get(`/Movies/get-shared-lists-for-user`, {headers: {Authorization: `Bearer ${storedToken}`}})
        return response;
    } catch(error) {
        console.log(error);
    }
}
export async function deleteSharedListById(listId: number) {
    const storedToken = await AsyncStorage.getItem('token');
    try{
        const response: any = await api.delete(`/Movies/delete-shared-list-for-user?sharedListId=${listId}`, {headers: {Authorization: `Bearer ${storedToken}`}})
        return response;
    } catch(error) {
        console.log(error);
    }
}

export async function leaveSharedListById(listId: number) {
    const storedToken = await AsyncStorage.getItem('token');
    try{
        const response: any = await api.delete(`/Movies/leave-shared-list?sharedListId=${listId}`, {headers: {Authorization: `Bearer ${storedToken}`}})
        return response;
    } catch(error) {
        console.log(error);
    }
}

export async function deleteUserFromSharedList(userId: number, listId: number) {
    const storedToken = await AsyncStorage.getItem('token');
    try{
        const response: any = await api.delete(`/Movies/delete-user-from-shared-lists?userToDeleteId=${userId}&sharedListId=${listId}`, {headers: {Authorization: `Bearer ${storedToken}`}})
        return response;
    } catch(error) {
        console.log(error);
    }
}



