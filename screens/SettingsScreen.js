import React from 'react';
import {Button, View} from "react-native";
import {useDispatch} from "react-redux";

export default function SettingsScreen({ navigation }) {
    const dispatch = useDispatch()
    const logout = () => {
        dispatch({type: 'RESET_TOKENS'});
    }
    return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Button
                title="Logout"
                color={'red'}
                onPress={logout}
            />
        </View>
    );
}