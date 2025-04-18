import React, {useContext, useEffect, useState } from "react";
import {StyleSheet, Dimensions, Text, KeyboardAvoidingView, Alert, SafeAreaView} from "react-native";
import { useForm } from "react-hook-form";

import {Info} from "@/components/Info";
import {Input} from "@/components/Input";
import {Button} from "@/components/Button";
import MainContainer from "@/components/MainContainer";

import {loginUser} from "@/lib/auth";
import {AuthContext, useAuth} from "@/lib/auth-context";

import Colors from "@/constants/Colors";
import { router, useRouter } from "expo-router";
import { LoadingOverlay } from "@/components/LoadingOverlay";

export default function Login(this: any)  {
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
    const loginHandler = async (data: any) => {
        try {
            setIsFetching(true);
            const token = await loginUser(data.email, data.password);
            setIsFetching(false);

            authCtx.authenticate(token);
            router.replace("/");

            console.log(token);
        } catch(error) {
            setIsFetching(false);
            Alert.alert('Authentication failed!', 'Please check your email or password!');
        }
    };

    if(isFetching){
        return <LoadingOverlay />
    }

    return(
            <SafeAreaView style={styles.safeArea}>
                <MainContainer style={styles.loginContainer}>
                    <Info isTitle={true} text={"Вхід"} style={styles.title} />
                    <Info isTitle={false} text={"З поверненням!"}/>

                    <Input placeholder={"Пошта"} control={control} name={"email"} keyboardType={'email-address'} rules={{
                        required: "Введіть електронну пошту",
                        pattern:{value:/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i, message: "Некоректна електронна пошта"}
                    }}/>

                    <Input secureTextEntry={isHidePassword} placeholder={"Пароль"} control={control} name={"password"} rules={{
                        required: "Введіть пароль",
                    }}/>
                    <Text style={styles.hidePasswordText} onPress={() => {isHidePassword ? setIsHidePassword(false) : setIsHidePassword(true)}}>{isHidePassword ? "Показати пароль" : "Сховати пароль"}</Text>
                    <Button text={"Вхід"} onPress={handleSubmit(loginHandler)} style={styles.button} isPrimary={true} />
                    <Text onPress={() => { router.push("/auth/signup")}} style={styles.createAccount}>Створити обліковий запис</Text>  
                </MainContainer>
            </SafeAreaView>
    )}

const deviceWidth = Dimensions.get("window").width

const styles = StyleSheet.create({
    screen: {
        flex: 1
    },
    safeArea: {
        flex: 1,
        backgroundColor: Colors.lightBlack,
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
    },
    loginContainer: {
        height: deviceWidth < 380 ? "70%" : "58%",
        width: "85%",
        alignItems:"center",
        justifyContent:"center",
    },
    button:{
        width:270,
        marginVertical:12
    },
    title:{
        marginTop:deviceWidth < 380 ? 5 : 10,
        marginBottom:deviceWidth < 380 ? 10 : 15,
    },
    createAccount:{
        color: Colors.lightBlue,
        fontWeight: 600,
        marginVertical: deviceWidth < 380 ? 8 : 12
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