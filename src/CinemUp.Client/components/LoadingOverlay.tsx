import { View, ActivityIndicator, StyleSheet, ImageBackground, Dimensions } from "react-native";
import Colors from "@/constants/Colors";
import MainContainer from "@/components/MainContainer";

export function LoadingOverlay(){
    return(
        <MainContainer style={styles.container}>
            <ActivityIndicator size={"large"} color={Colors.white} />
        </MainContainer>
    );
}
const deviceWidth = Dimensions.get("screen").width
const deviceHeight = Dimensions.get("screen").height

const styles = StyleSheet.create({
    container:{
        width:"100%",
        height:"100%",
        borderRadius:0,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.lightBlack,
        borderColor: Colors.black,
    }
})

