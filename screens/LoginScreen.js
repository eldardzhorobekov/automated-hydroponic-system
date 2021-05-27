import React, {useEffect, useState} from "react";
import {StyleSheet, Text, TextInput, TouchableOpacity, View} from "react-native";
import {postData, postFormData} from "../services/utils";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome'
import {faSpinner} from '@fortawesome/free-solid-svg-icons'
import {useDispatch} from "react-redux";


const client_id = "http://homeassistant.local:8123/"

// todo: save tokens in localStorage

export default function LoginScreen() {
    const dispatch = useDispatch();

    const [username, setUsername] = useState('SmartHome');
    const [password, setPassword] = useState('SmartHome');
    const [loading, setLoading] = useState(false);
    const [tokens, setTokens] = useState(null);
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
    const getAuthCode = async () => {
        let _flowId = null;
        await getFlowId()
            .then(_data => {
                _flowId = _data.flow_id;
            })
            .catch(_error => {
                setError(_error);
                setLoading(false);
                alert('COULD NOT GET FLOW_ID. MAYBE SERVER IS DOWN.')
            })

        const url = `http://192.168.43.109:8123/auth/login_flow/${_flowId}`;
        const data = {
            "username": username,
            "password": password,
            "client_id": client_id
        };
        return postData(url, data);
    }
    const getAuthTokens = async () => {
        let _authCode = null;
        await getAuthCode()
            .then(_data => {
                _authCode = _data.result;
            })
            .catch(_error => {
                setError(_error);
                setLoading(false);
                alert('COULD NOT GET AUTH_CODE. MAYBE SERVER IS DOWN.')
            });
        const url = 'http://192.168.43.109:8123/auth/token';
        const formData = {
            client_id: client_id,
            code: _authCode,
            grant_type: 'authorization_code'
        }
        return postFormData(url, formData)
    }
    const onPressLogin = async () => {
        setLoading(true);
        await getAuthTokens()
            .then(_data => {
                if(_data.error) {
                    setError(_data.error_description);
                } else {
                    setTokens(_data)
                    dispatch({type: 'SET_TOKENS', payload: _data})
                }
            })
            .catch(_error => {
                setError(_error)
                alert('COULD NOT GET TOKENS!');
                console.error(_error);
            })
        setLoading(false);
    }

    useEffect(() => {
        const saveTokens = async () => {
            if(tokens != null) {
                try {
                    const jsonTokens = JSON.stringify(tokens)
                    console.log('SAVING IN LOCAL STORAGE', jsonTokens);
                    await AsyncStorage.setItem('@tokens', jsonTokens);
                } catch (error) {
                    console.error('COULD NOT SAVE TOKENS!')
                }
            }
        }
        saveTokens()
            .then(_data => console.log(_data, 'SAVED!'))
            .catch(_error => console.error(_error, 'ERROR!'));
    }, [tokens]);

    return (
        <View style={styles.loginView}>
            <Text style={styles.title}>Hydroponics</Text>
            <View style={styles.inputView}>
                <TextInput
                    style={styles.TextInput}
                    placeholder="Email."
                    placeholderTextColor="#003f5c"
                    onChangeText={(username) => setUsername(username)}
                    value={username}
                />
            </View>
            <View style={styles.inputView}>
                <TextInput
                    style={styles.TextInput}
                    placeholder="Password."
                    placeholderTextColor="#003f5c"
                    secureTextEntry={true}
                    onChangeText={(password) => setPassword(password)}
                    value={password}
                />
            </View>
            <TouchableOpacity onPress={onPressLogin} style={styles.loginBtn}>
                <Text style={styles.loginText}>LOGIN {loading ? <FontAwesomeIcon icon={faSpinner}/> : ''}</Text>
            </TouchableOpacity>
            <Text style={styles.errorText}>{error}</Text>
            {/*<Text>{JSON.stringify(tokens)}</Text>*/}
            {/*<Text>Flow id: {JSON.stringify(authFlow)}</Text>*/}
            {/*<Text>Code id: {JSON.stringify(authCode)}</Text>*/}
            {/*<Text>Tokens: {JSON.stringify(tokens)}</Text>*/}
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
        width: '100%',
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
        display: 'flex',
        color: '#ffffff',
    },
    loginText: {
        color: '#ffffff',
        fontWeight: 'bold'
    },
    errorText: {
        color: 'red',
        marginTop: 5
    }
})