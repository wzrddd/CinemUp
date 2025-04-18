import {View, StyleSheet, ViewStyle, StyleProp } from "react-native";
import { ReactNode } from "react";

import Colors from "@/constants/Colors";

interface MainContainerProps{
    children: ReactNode;
    style?: StyleProp<ViewStyle>;
}
function MainContainer(props: MainContainerProps){
    return(
        <View style={[styles.mainContainer, props.style]}>
            {props.children}
        </View>
    )
}
const styles = StyleSheet.create({
    mainContainer:{
        backgroundColor:Colors.mainContainer,
        borderColor: Colors.black,
        borderRadius:30,
    },
})
export default MainContainer;