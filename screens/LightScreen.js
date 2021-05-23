import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome';
import ColorPicker from 'react-native-wheel-color-picker';
import Loading from '../components/Loading';
import {arraysEqual, hexToRGB, RGBToHex} from '../utils';
import Slider from '@react-native-community/slider';
import {LIGHT_ENTITY_ID, TYPES, WebsocketService} from "../services/WebsocketService";

// todo: authentication page
// todo: divide logic: 1)no connection to webserver 2)device is off

const domain = 'ws://homeassistant.local:8123/api/websocket';
const wsService = new WebsocketService();
const _refresh_token = "ae165f3e583d7db83d091b1b4f4b638d5eb45ab051dbaf4258b16fdf561794178f96305432ca2bf3b8e52cf91e277457596676327b737a07c1b716c5f66389d4";
let _access_token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiI4NzUzNmY4Zjk2ZWY0ZTZmOWUxMWJkODIxOTI2Y2U5NCIsImlhdCI6MTYyMTczMzM0NywiZXhwIjoxNjIxNzM1MTQ3fQ.qAGRO8z41H4wYO4eNz5G1RH7hVIIIDhAaADzNbUY6lg";

async function postData(url = '', data = {}) {
    // Default options are marked with *
    const formData = new FormData();

    for (const name in data) {
        formData.append(name, data[name]);
    }
    const response = await fetch(url, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        // headers: {
        //     // 'Content-Type': 'application/json'
        //     // 'Content-Type': 'application/x-www-form-urlencoded',
        // },
        redirect: 'follow', // manual, *follow, error
        referrerPolicy: 'no-referrer', // no-referrer, *client
        body: formData
    });
    return await response.json(); // parses JSON response into native JavaScript objects
}

export default function LightScreen({navigation}) {
    const [active, setActive] = useState(false);
    const [loading, setLoading] = useState(true);
    const [currentColor, setCurrentColor] = useState(null);
    const [colorPickerId, setColorPickerId] = useState(0);
    const [lightOn, setLightOn] = useState(false);
    const [brightness, setBrightness] = useState(40);

    const onPressLightButton = (event) => {
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
        const oldState = response.event.data.old_state;
        console.log('EVENT');
        switch (response.event.data.entity_id) {
            case LIGHT_ENTITY_ID:
                console.log("NEW STATE", newState);
                if (newState.state === 'on') {
                    setLightOn(true);
                    const brightness = newState.attributes.brightness;
                    if(typeof brightness !== 'undefined') {
                        setBrightness(brightness)
                    }
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
            wsService.authenticate(_access_token);
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
                    const domain = 'http://homeassistant.local:8123';
                    const url = `${domain}/auth/token`;
                    const data = {
                        client_id: "http://homeassistant.local:8123/",
                        grant_type: "refresh_token",
                        refresh_token: _refresh_token
                    }
                    await postData(url, data)
                        .then((data) => {
                            _access_token = data.access_token;
                        })
                        .catch((error) => {
                            console.error('COULD NOT VALIDATE REFRESH TOKEN. GOING TO LOGIN SCREEN');
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
            wsService.ws = null
            setTimeout(startWebsocket, 1000)
        };
    }
    useEffect(() => {
        startWebsocket();
    }, []);

    function lightControllers() {
        return !lightOn ? null : (
            <View>
                <View>
                    <Slider
                        style={{width: 200, height: 40}}
                        minimumValue={0}
                        maximumValue={255}
                        value={brightness}
                        onSlidingComplete={(e) => {
                            wsService.setBrightnessPct(e);
                        }}
                        onValueChange={setBrightness}
                    />
                </View>
                <View>
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
                        />
                    }
                </View>
            </View>
        )
    }

    return loading ? (<Loading/>) : (
        <View style={styles.lightScreen}>
            <Text>{active ? 'Active' : 'Inactive'}</Text>
            <View>
                <TouchableOpacity onPress={onPressLightButton}>
                    <Icon name={'lightbulb-o'} color={lightOn ? 'yellow' : 'black'} size={100}/>
                </TouchableOpacity>
            </View>
            {lightControllers()}
        </View>
    );
};

const styles = StyleSheet.create({
    lightScreen: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'column',
        flexWrap: 'wrap',
    }
});