import Loader from "react-loader-spinner";
import {StyleSheet, View} from "react-native";
import React from "react";

const Loading = () => {
    return (
        <View style={styles.center}>
            <Loader type="ThreeDots" color="#00BFFF" height={80} width={80}/>
        </View>
    );
}

const styles = StyleSheet.create({
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default Loading;