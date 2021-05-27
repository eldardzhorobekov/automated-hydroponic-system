import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome';
import ColorPicker from 'react-native-wheel-color-picker';
import Loading from '../components/Loading';
import {hexToRGB, RGBToHex} from '../utils';
import Slider from '@react-native-community/slider';
import {LIGHT_ENTITY_ID, TYPES, WebsocketService} from "../services/WebsocketService";
import {postData} from "../services/utils";
import {useDispatch, useSelector} from "react-redux";
// todo: authentication page
// todo: divide logic: 1)no connection to webserver 2)device is off

const domain = 'ws://192.168.43.109:8123/api/websocket';
const wsService = new WebsocketService();

export default function LightScreen() {
    const _tokens = useSelector(state => state.tokens);
    const dispatch = useDispatch();
    const [active, setActive] = useState(false);
    const [loading, setLoading] = useState(true);
    const [currentColor, setCurrentColor] = useState(null);
    const [lightOn, setLightOn] = useState(false);
    const [brightness, setBrightness] = useState(40);

    const onPressLightButton = () => {
        console.log('CLICKED!');
        if (lightOn) {
            console.log("Turning Light ON")
            wsService.turnLightOff();
        } else {
            console.log("Turning Light OFF")
            wsService.turnLightOn();
        }
        setLightOn(!lightOn)
    };
    const processResult = (response) => {
        const responseId = response.id;
        const responseType = wsService.types[responseId];
        const result = response.result;
        console.log('RESULT');
        console.log('response type', responseType)
        switch (responseType) {
            case TYPES.GET_STATES:
                const lightEntity = result.find(entity => entity.entity_id === LIGHT_ENTITY_ID);
                if (lightEntity.state === 'on') {
                    setLightOn(true);
                    const [r, g, b] = lightEntity.attributes.rgb_color;
                    setCurrentColor(RGBToHex(r, g, b));
                } else {
                    setLightOn(false);
                }
                setLoading(false);
                break;
            case TYPES.CALL_SERVICE:
                break;
        }
    }

    const processEvent = (response) => {
        const newState = response.event.data.new_state;
        console.log('EVENT');
        switch (response.event.data.entity_id) {
            case LIGHT_ENTITY_ID:
                console.log("NEW STATE", newState);
                if (newState.state === 'on') {
                    setLightOn(true);
                    const brightness = newState.attributes.brightness;
                    const [r, g, b] = newState.attributes.rgb_color;
                    setBrightness(brightness)
                    setCurrentColor(RGBToHex(r, g, b));
                } else {
                    setLightOn(false);
                }
                break;
            default:
                console.warn('NO ENTITY FOUND');
        }
    }
    const startWebsocket = () => {
        wsService.ws = new WebSocket(domain);
        wsService.ws.onopen = () => {
            console.log('WEBSOCKET OPEN');
            console.log('TRYING TO AUTHENTICATE');
            wsService.authenticate(_tokens.access_token);
        }
        wsService.ws.onmessage = async (e) => {
            const response = JSON.parse(e.data);
            const type = response.type;
            console.log('TYPE', type);
            console.log(response)
            switch (type) {
                case 'result':
                    processResult(response);
                    break;
                case 'event':
                    processEvent(response);
                    break
                case 'auth_required':
                    setActive(false);
                    break;
                case 'auth_ok':
                    setActive(true);
                    wsService.getStates();
                    wsService.subscribeEvents();
                    break;
                case 'auth_invalid':
                    console.error('AUTH INVALID');
                    const domain = 'http://192.168.43.109:8123';
                    const url = `${domain}/auth/token`;
                    const data = {
                        client_id: "http://homeassistant.local:8123/",
                        grant_type: "refresh_token",
                        refresh_token: _tokens.refresh_token
                    }
                    await postData(url, data)
                        .then((data) => {
                            const _tokens = {...tokens, access_token: data.access_token};
                            dispatch({type: 'SET_TOKENS', payload: _tokens});
                        })
                        .catch((error) => {
                            console.error('COULD NOT VALIDATE REFRESH TOKEN. GOING TO LOGIN SCREEN', error);
                            dispatch({type: 'RESET_TOKENS'})
                            // todo: go to login screen
                        });
                    break;
            }
        };
        wsService.ws.onerror = (e) => {
            console.error("WEBSOCKET ERROR", e.message);
            setActive(false);
        };
        wsService.ws.onclose = (e) => {
            console.error("WEBSOCKET CLOSED", e.code, e.reason);
            setLoading(true);
            wsService.ws = null;
            setTimeout(startWebsocket, 1000);
        };
    }
    useEffect(() => {
        startWebsocket();
        // alert(JSON.stringify(_tokens));
    }, []);

    function lightControllers() {
        return !lightOn ? null : (
            <View style={{flex: 3}}>
                <View style={{}}>
                    <Slider
                        style={{width: '100%', height: 40, backgroundColor: 'white'}}
                        minimumValue={0}
                        maximumValue={255}
                        value={brightness}
                        onSlidingComplete={(e) => {
                            wsService.setBrightness(e);
                        }}
                        onValueChange={setBrightness}
                    />
                </View>
                <View style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start'}}>
                    {!currentColor ? null :
                        <ColorPicker
                            color={currentColor}
                            onColorChange={setCurrentColor}
                            onColorChangeComplete={color => {
                                wsService.setLightColor(hexToRGB(color));
                            }}
                            noSnap={true}
                            sliderSize={0}
                            swatches={false}
                            style={{backgroundColor: 'white', justifyContent: 'flex-start'}}
                        />
                    }
                </View>
            </View>
        )
    }

    return loading ? (<Loading/>) : (
        <View style={styles.lightScreen}>
            <Text>{active ? 'Active' : 'Inactive'}</Text>
            <View style={styles.light}>
                <TouchableOpacity onPress={onPressLightButton}>
                    <Icon name={'lightbulb-o'} color={lightOn ? '#f9ca24' : 'black'} size={200}/>
                </TouchableOpacity>
            </View>
            {lightControllers()}
        </View>
    );
};

const styles = StyleSheet.create({
    lightScreen: {
        flex: 1,
        backgroundColor: 'white'
    },
    light: {
        flex: 2,
        alignItems: 'center',
        justifyContent: 'center'
    }
});