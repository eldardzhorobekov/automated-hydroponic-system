import AnimatedLoader from "react-native-animated-loader";
import {StyleSheet, View} from "react-native";
import React from "react";

const Loading = () => {
    return (
        <View style={styles.center}>
            <AnimatedLoader
                visible={true}
                overlayColor="rgba(255,255,255,0.75)"
                // source={require("./loader.json")}
                animationStyle={styles.lottie}
                speed={1}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    lottie: {
        width: 100,
        height: 100
    }
});

export default Loading;