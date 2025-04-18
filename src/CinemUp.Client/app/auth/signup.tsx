import React, {useContext, useEffect, useState} from "react";
import {StyleSheet, Text, Dimensions, KeyboardAvoidingView, Alert, TextInput, SafeAreaView, ImageBackground, Pressable, Platform} from "react-native";
import {useForm} from "react-hook-form"

import {Input} from "@/components/Input";
import {Button} from "@/components/Button";
import {Info} from "@/components/Info";
import MainContainer from "@/components/MainContainer";
     
import {createUser} from "@/lib/auth";
import {AuthContext, useAuth} from "@/lib/auth-context";

import Colors from "@/constants/Colors";
import { router, useRouter } from "expo-router";
import { LoadingOverlay } from "@/components/LoadingOverlay";

export default function Signup(this: any) {
    
    const router = useRouter();
    const {control, handleSubmit, formState:{errors}} = useForm({
        defaultValues: {
            username: '',
            email: '',
            password: '',
        }
    });
    const [isFetching, setIsFetching] = useState(false);
    const [isHidePassword, setIsHidePassword] = useState(true);
    
    const authCtx = useContext(AuthContext);
    const signUpHandler = async (data: any) => {
        try {
            setIsFetching(true);
            const token = await createUser(data.email, data.password, data.username);

            authCtx.authenticate(token); 
            setIsFetching(false);

            router.replace("/"); 
        } catch (error) {
            setIsFetching(false);
            Alert.alert('Registration failed!', 'Please check your email, username or password!');
        }
    }


   if(isFetching){
        return <LoadingOverlay />
    }
   
    return (
            <SafeAreaView style={styles.safeArea}>
                    <MainContainer style={styles.signUpContainer}>
                        <Info text={"Реєстрація"} isTitle={true} style={styles.title} />
                        <Input placeholder={"Ім'я користувача"} control={control} name={"username"} rules={{ required: "Введіть ім'я користувача" }} />
                        <Input placeholder={"Пошта"} control={control} name={"email"} keyboardType={'email-address'} rules={{
                            required: "Введіть електронну пошту",
                            pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i, message: "Некоректна електронна пошта" }
                        }} />
                        <Input secureTextEntry={isHidePassword} placeholder={"Пароль"} control={control} name={"password"} rules={{
                            required: "Введіть пароль",
                            minLength: { value: 8, message: "Пароль повинен містити не менше, ніж 8 символів" },
                            maxLength: { value: 20, message: "Пароль повинен містити не більше, ніж 20 символів" },
                            pattern: { value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).*$/, message: "Пароль повинен містити: літери (A-Z), літери (a-z), цифри (0-9)" },
                        }} />
                        <Pressable onPress={() => { isHidePassword ? setIsHidePassword(false) : setIsHidePassword(true) }}>
                            <Text style={styles.hidePasswordText}>{isHidePassword ? "Показати пароль" : "Сховати пароль"}</Text>
                        </Pressable>
                        <Text style={styles.alreadyRegText}>Уже зареєстровані? <Text onPress={() => { router.push("/auth/login") }} style={styles.loginText}>Увійти</Text></Text>
                        <Button text={"Зареєструватись"} onPress={handleSubmit(signUpHandler)} style={styles.button} isPrimary={true} />
                    </MainContainer>
            </SafeAreaView>
)}


const deviceWidth = Dimensions.get("window").width

const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
        backgroundColor: Colors.lightBlack,
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
    },
    signUpContainer: {
        height: deviceWidth < 380 ? "70%" : "64%",
        width: "85%",
        alignItems:"center",
        justifyContent:"center",
    },
    alreadyRegText: {
        color: Colors.white,
        fontWeight: 600,
        marginVertical: deviceWidth < 380 ? 5 : 8
    },
    loginText: {
        color: Colors.lightBlue,
    },
    button: {
        width: 265,
        marginVertical: 20
    },
    title: {
        marginBottom:deviceWidth < 380 ? 13 : 18,
    },
    errorText:{
        color:Colors.error
    },
    blankText:{
        display: "none"
    },
    hidePasswordText:{
        color: Colors.darkGray,
        marginRight:150,
        marginBottom:15
    }
})