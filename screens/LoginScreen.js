import React, {useEffect, useState} from "react";
import {StyleSheet, Text, TextInput, TouchableOpacity, View} from "react-native";
import {postData, postFormData} from "../services/utils";
// import AsyncStorage from '@react-native-community/async-storage'


const client_id = "http://homeassistant.local:8123/"

// todo: implement auth flow with error checking
// todo: save tokens in localStorage

const _storeData = async () => {
    try {
        await AsyncStorage.setItem(
            '@MySuperStore:key',
            'I like to save it.'
        );
    } catch (error) {
        // Error saving data
    }
};
export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [authFlow, setAuthFlow] = useState(null);
    const [authCode, setAuthCode] = useState(null);
    const [tokens, setTokens] = useState(null);
    const [data, setData] = useState(null);
    const [error, setError] = useState();
    const getFlowId = async () => {
        const url = 'http://192.168.43.109:8123/auth/login_flow';
        const data = {
            "client_id": client_id,
            "handler": ["homeassistant", null],
            "redirect_uri": "http://homeassistant.local:8123/?auth_callback=1"
        };
        return postData(url, data)
    }
    const getAuthCode = async (flow_id) => {
        const url = `http://192.168.43.109:8123/auth/login_flow/${flow_id}`;
        const data = {
            "username": "SmartHome",
            "password": "SmartHome",
            "client_id": client_id
        };
        return postData(url, data)
    }
    const getAuthTokens = async () => {
        const url = 'http://192.168.43.109:8123/auth/token';
        const formData = {
            client_id: client_id,
            code: authCode.result,
            grant_type: 'authorization_code'
        }
        return postFormData(url, formData)
    }
    useEffect(() => {
        async function fetchData() {
            getFlowId()
                .then(_data => {
                    setAuthFlow(_data)
                    setData(_data)
                })
                .catch(e => setError(e))

            getAuthCode(authFlow.flow_id)
                .then(_data => {
                    setAuthCode(_data)
                })
                .catch(e => setError(e))

            getAuthTokens()
                .then(_data => {
                    setTokens(_data)
                })
                .catch(e => setError(e))
            // const flowId = await getFlowId();
            // const code = await getAuthCode();
            // const tokens = await getAuthTokens();
        }
        fetchData()
            .then(_data => setData(_data))
            .catch(e => setError(e));
    }, []);
    return (
        <View style={styles.loginView}>
            <Text style={styles.title}>Hydroponics</Text>
            <View style={styles.inputView}>
                <TextInput
                    style={styles.TextInput}
                    placeholder="Email."
                    placeholderTextColor="#003f5c"
                    onChangeText={(email) => setEmail(email)}
                />
            </View>
            <View style={styles.inputView}>
                <TextInput
                    style={styles.TextInput}
                    placeholder="Password."
                    placeholderTextColor="#003f5c"
                    secureTextEntry={true}
                    onChangeText={(password) => setPassword(password)}
                />
            </View>
            <TouchableOpacity style={styles.loginBtn}>
                <Text style={styles.loginText}>LOGIN</Text>
            </TouchableOpacity>
            <Text>Flow id: {JSON.stringify(authFlow)}</Text>
            <Text>Code id: {JSON.stringify(authCode)}</Text>
            <Text>Tokens: {JSON.stringify(tokens)}</Text>
            <Text>Data: {JSON.stringify(data)}</Text>
            <Text style={{ backgroundColor: 'red' }}>Error: {JSON.stringify(error)}</Text>
        </View>
    )
};


const styles = StyleSheet.create({
    loginView: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%'
    },
    title: {
        color: '#000',
        fontSize: 30,
        marginBottom: 20,
        fontWeight: 'bold'
    },
    inputView: {
        borderWidth: 1,
        borderColor: 'black',
        borderStyle: 'solid',
        borderRadius: 30,
        width: "70%",
        height: 45,
        marginBottom: 20,
        alignItems: "center",
    },
    TextInput: {
        height: 50,
        flex: 1,
        padding: 10,
        marginLeft: 10,
    },
    loginBtn: {
        width: "70%",
        borderRadius: 25,
        height: 50,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "lightblue",
    },
    loginText: {
        color: '#ffffff',
        fontWeight: 'bold'
    }
})