import { Dispatch, SetStateAction } from "react";
import {TextInput, StyleSheet, KeyboardTypeOptions, View, Text} from "react-native";
import Colors from "@/constants/Colors";
import {Control, Controller, FieldValues } from "react-hook-form";

interface InputProps{
    placeholder: string;
    name: string;
    onChangeText?: Dispatch<SetStateAction<string>>;
    onBlur?: () => void;
    value?:string;
    control: Control<FieldValues>;
    secureTextEntry?: boolean;
    rules: {};
    keyboardType?: KeyboardTypeOptions | undefined;
}
export function Input(props: InputProps){
    return(
        <Controller
            control={props.control}
            name={props.name}
            rules={props.rules}
            render={({field: {value, onChange, onBlur}, fieldState: {error}}) => (
                <>
                    <View style={[styles.container, {borderColor: error ? Colors.error : Colors.white }]}>
                        <TextInput value={value} keyboardType={props.keyboardType} autoCapitalize={"none"} onChangeText={onChange} onBlur={onBlur} placeholder={props.placeholder} secureTextEntry={props.secureTextEntry} style={styles.input} placeholderTextColor={Colors.transparentWhite} />
                    </View>
                    {error && (<Text style={{color: "red", alignSelf:'stretch', paddingHorizontal:35}}>{error.message || "Error"}</Text>)}
                </>
            )}
        />
    )   
}
const styles = StyleSheet.create({
    container:{
        width: "80%",
        height: 54,
        borderRadius:15,
        marginVertical:10,
        paddingHorizontal: 20,
        backgroundColor:Colors.lightBlack,
        justifyContent: "center",
    },
    input:{
        fontSize:18,
        fontWeight:600,
        color:Colors.white,
        textAlign: "left"
    },
})