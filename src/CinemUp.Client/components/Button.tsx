import {Pressable, Text, StyleSheet, StyleProp, ViewStyle} from "react-native";
import Colors from "@/constants/Colors";
interface ButtonProps {
    isPrimary?: boolean;
    text: string;
    onPress: () => void;
    style?: StyleProp<ViewStyle>;
}
export function Button(props: ButtonProps) {
    return(
        <Pressable onPress={props.onPress} style={({pressed}) => [
            props.isPrimary ? styles.lightButton : styles.darkButton,
            pressed && styles.pressed,
            styles.button, 
            props.style]}>
            <Text style={[props.isPrimary ? styles.lightButtonText : styles.darkButtonText, styles.buttonText]}>{props.text}</Text>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    button:{
        height: 54,
        alignItems: "center",
        justifyContent: "center",
        marginHorizontal: 17,
        borderWidth: 1,
        borderRadius: 15,
        elevation: 2,
    },
    buttonText:{
        fontSize: 20,
        fontWeight: 600,
    },
    lightButton: {
        backgroundColor: Colors.white200,
        borderColor: Colors.white,
    },
    lightButtonText: {
        color: Colors.black,
    },
    darkButton: {
        backgroundColor: Colors.lightBlack,
        borderColor: Colors.black,
    },
    darkButtonText: {
        color: Colors.white,
    },
    pressed: {
        opacity: 0.7,
    },
})