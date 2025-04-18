import Axios, { InternalAxiosRequestConfig } from "axios";
import {useContext} from "react";
import {AuthContext} from "@/lib/auth-context";
import AsyncStorage from '@react-native-async-storage/async-storage';

function authRequestInterceptor(config: InternalAxiosRequestConfig) {
    
    if (config.headers) {
        config.headers.Accept = 'application/json';
    }
    
    config.withCredentials = true;
    return config;
}

export const api = Axios.create({
    baseURL: "https://cinemup.azurewebsites.net/api",
});

api.interceptors.request.use(authRequestInterceptor);
api.interceptors.response.use(
    (response) => {
        return response.data;
    },
);
