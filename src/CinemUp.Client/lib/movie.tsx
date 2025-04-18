import {api} from "@/lib/api-client";
import AsyncStorage from "@react-native-async-storage/async-storage";

export async function searchMovie(Query: string){
    const response: any = await api.get(`/Movies/search?Query=${Query}`);
    return response;
}

export async function getMovieOverview(){
    const response: any = await api.get('/Movies/overview');
    return response;
}

export async function getMovieOverviewById(id: string){
    const storedToken = await AsyncStorage.getItem('token');

    const response: any = await api.get(`/Movies/${id}`, {headers: {Authorization: `Bearer ${storedToken}`}});
    return response;
}

export async function getFavoriteMovies(){
    const storedToken = await AsyncStorage.getItem('token');

    const response: any = await api.get(`/Movies/user-movies?movieStatus=0`, {headers: {Authorization: `Bearer ${storedToken}`}});
    return response;
}

export async function addMovieToFavorite(id: string){
    const storedToken = await AsyncStorage.getItem('token');

    try {
        const response: any = await api.post(`/Movies/add-movie-to-user?Id=${id}&MovieStatus=0`, {id},{
            headers: { Authorization: `Bearer ${storedToken}` }
        });

        return response;
    } catch (error) {
        console.error("Error adding movie to favorite:", error);
        throw error;
    }
}

export async function deleteMovieFromFavorite(id: string){
    const storedToken = await AsyncStorage.getItem('token');

    try{
        const response: any = await api.delete(`/Movies/delete-movie-user?Id=${id}&MovieStatus=0`, {headers: { Authorization: `Bearer ${storedToken}` }})
        return response;

    } catch(error){
        console.error("Error deleting movie from favorite:", error);
        throw error;
    }
}
export async function getWatchedMovies(){
    const storedToken = await AsyncStorage.getItem('token');

    const response: any = await api.get(`/Movies/user-movies?movieStatus=1`, {headers: {Authorization: `Bearer ${storedToken}`}});
    return response;
}
export async function addMovieToWatched(id: string){
    const storedToken = await AsyncStorage.getItem('token');

    try {
        const response: any = await api.post(`/Movies/add-movie-to-user?Id=${id}&MovieStatus=1`, {id},{
            headers: { Authorization: `Bearer ${storedToken}` }
        });

        return response;
    } catch (error) {
        console.error("Error adding movie to watched:", error);
        throw error;
    }
}
export async function deleteMovieFromWatched(id: string){
    const storedToken = await AsyncStorage.getItem('token');

    try{
        const response: any = await api.delete(`/Movies/delete-movie-user?Id=${id}&MovieStatus=1`, {headers: { Authorization: `Bearer ${storedToken}` }})
        return response;

    } catch(error){
        console.error("Error deleting movie from watched:", error);
        throw error;
    }
}