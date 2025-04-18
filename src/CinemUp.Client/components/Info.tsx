import { Text, StyleSheet, Dimensions } from "react-native";
import Colors from "@/constants/Colors";

interface InfoProps {
    text: string;
    isTitle: boolean;
    style?:any;
}
export function Info(props: InfoProps){
    return(
        <Text style={[styles.text, props.isTitle ? styles.title : styles.info, props.style]}>{props.text}</Text>
    )
}

const deviceWidth = Dimensions.get("window").width

const styles = StyleSheet.create({
    info:{
        fontSize:16,
        marginHorizontal:25,
        marginBottom:deviceWidth < 380 ? 20 : 27,
    },
    title:{
        fontSize: deviceWidth < 380 ? 30 : 35,
    },
    text:{
        fontWeight: 600,
        color: Colors.white,
        textAlign: "center",
    },
})