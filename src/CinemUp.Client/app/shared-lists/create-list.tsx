import { View, StyleSheet, Text, Pressable, TextInput, Alert, SafeAreaView } from "react-native";
import Colors from "@/constants/Colors";
import {MaterialIcons} from "@expo/vector-icons";
import React, { useState } from "react";

import MainContainer from "@/components/MainContainer";
import {createSharedList} from "@/lib/shared-list";
import {router, useLocalSearchParams } from "expo-router";


export default function CreateList() {
    const { showToast } = useLocalSearchParams();
    
    const [listName, setListName] = useState("");
    
    const createList = async () => {
        try{
            const response = await createSharedList(listName);
            router.back()

            
            
            console.log("Список створено")
            console.log(response)
        } catch(error) {
            console.log(error)
        }
    }
    
    return (
        <SafeAreaView style={styles.mainContainer}>
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.cancel}>
                    <MaterialIcons name="arrow-back-ios" size={25} color={Colors.transparentWhite}/>
                </Pressable>
                <Text style={{color: "white", fontSize: 18, fontWeight: "600"}}>Створити список</Text>
            </View>
            <View style={{margin: 20}}>
                <Text style={{color: "white", fontSize: 18, fontWeight: "600", marginBottom: 10}}>Назва</Text>
                <TextInput placeholderTextColor={Colors.transparentWhite} onChangeText={setListName} style={styles.textInput} placeholder={"Назва списку"}></TextInput>
            </View>
            <View style={styles.createContainer}>
                <Pressable onPress={createList}>
                    <Text style={{color: "white", fontSize: 18, fontWeight: "600", marginBottom: 10}}>Створити</Text>
                </Pressable>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex:1,
        backgroundColor: Colors.lightBlack,
    },
    cancel: {
        marginLeft: "3%",
        marginRight: 10,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 30,
        width: "100%",
    },
    textInput: {
        width: "100%",
        height: 50,
        paddingHorizontal: 15,
        borderRadius: 5,
        fontSize: 18,
        color: Colors.white200,
        backgroundColor: Colors.transparentBlack50,
        marginBottom: 15,
        borderWidth: 1,
    },
    createContainer:{
        alignItems:"center",
        justifyContent:"center",
        position: 'absolute',
        bottom: 0,
        padding: 20,
        width: '100%',
        paddingBlockEnd: 70,
    },
    
});
