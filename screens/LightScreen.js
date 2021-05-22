import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome';
import ColorPicker from 'react-native-wheel-color-picker';
import Loading from '../components/Loading';
import {hexToRGB, RGBToHex} from '../utils';
import Slider from '@react-native-community/slider';

// todo: add brightness component
// todo: authentication page
// todo: subscribe events

const TYPES = {
    CALL_SERVICE: 'call_service',
    AUTH: 'auth',
    GET_STATES: 'get_states'
}
const LIGHT_ENTITY_ID = 'light.rgb_led_light';


class WebsocketService {
    constructor() {
        this.domain = 'ws://homeassistant.local:8123/api/websocket';
        this.ws = new WebSocket(this.domain);
        this.id = 1;
        this.types = {}
    }

    authenticate(access_token) {
        const type = TYPES.AUTH;
        const data = {
            type: type,
            access_token: access_token
        };
        this._wsSend(data);
        this.id++;
    }

    turnLightOn() {
        this._changeLightState({service: "turn_on"});
    }

    turnLightOff() {
        this._changeLightState({service: "turn_off"});
    }

    setLightColor(rgb_color) {
        this._changeLightState({service: "turn_on", rgb_color: rgb_color});
    }

    setBrightnessPct(brightness_pct) {
        this._changeLightState({service: "turn_on", brightness_pct: brightness_pct})
    }

    _changeLightState({service, rgb_color, brightness_pct}) {
        const type = TYPES.CALL_SERVICE;
        this.types[this.id] = type;
        const data = {
            domain: "light",
            id: this.id++,
            service: service,
            service_data: {entity_id: "light.rgb_led_light"},
            type: type,
        };
        if (rgb_color) {
            data.service_data.rgb_color = rgb_color;
        }
        if (brightness_pct) {
            data.service_data.brightness_pct = brightness_pct;
        }
        this._wsSend(data);
    }

    getStates() {
        const type = TYPES.GET_STATES;
        this.types[this.id] = type;
        const data = {
            id: this.id++,
            type: type
        }
        this._wsSend(data)
    }

    _wsSend(data) {
        console.log("TRYING TO SEND", data);
        try {
            this.ws.send(JSON.stringify(data));
        } catch (e) {
            console.error('WS: COULD NOT SEND DATA', e);
        }
    }
}

const wsService = new WebsocketService();
const _access_token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiI4NzUzNmY4Zjk2ZWY0ZTZmOWUxMWJkODIxOTI2Y2U5NCIsImlhdCI6MTYyMTY5NjA4MCwiZXhwIjoxNjIxNjk3ODgwfQ.vjRn5Nj18zbq-mu7EnZdDnRMuRDLryOTIlxJulAOWx4"

export default function LightScreen({navigation}) {
    const [active, setActive] = useState(false);
    const [loading, setLoading] = useState(true);
    const [currentColor, setCurrentColor] = useState('#ffffff');
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
        console.log(response);
        const responseId = response.id;
        const responseType = wsService.types[responseId];
        const result = response.result;

        console.log('response type', responseType)
        switch (responseType) {
            case TYPES.GET_STATES:
                const lightEntity = result.find(entity => entity.entity_id == LIGHT_ENTITY_ID);
                if (lightEntity.state == 'on') {
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

    useEffect(() => {
        wsService.ws.onopen = () => {
            // ws.send('something');
            wsService.authenticate(_access_token);
        };
        wsService.ws.onmessage = (e) => {
            const response = JSON.parse(e.data);
            const type = response.type;
            console.log('TYPE', type);
            switch (type) {
                case 'result':
                    processResult(response);
                    break;
                case 'auth_required':
                    setActive(false);
                    break;
                case 'auth_ok':
                    setActive(true);
                    wsService.getStates();
                    break;
                case 'auth_invalid':
                    // todo: go to login screen
                    console.error('AUTH INVALID');
                    break;
            }
        };
        wsService.ws.onerror = (e) => {
            console.log(e.message);
            setActive(false);
        };
        wsService.ws.onclose = (e) => {
            console.log(e.code, e.reason);
            setActive(false);
        };
    }, []);

    function lightOnControllers() {
        return (
            <View>
                <View>
                    <Slider
                        style={{width: 200, height: 40}}
                        minimumValue={0}
                        maximumValue={100}
                        value={brightness}
                        onSlidingComplete={(e) => {
                            wsService.setBrightnessPct(e);
                        }}
                        onValueChange={setBrightness}
                    />
                </View>
                <View>
                    <ColorPicker
                        color={currentColor}
                        onColorChange={setCurrentColor}
                        onColorChangeComplete={color => {
                            if (lightOn) {
                                console.log("Complete: ", color)
                                const rgb_color = hexToRGB(color);
                                wsService.setLightColor(rgb_color);
                            }
                        }}
                        noSnap={true}
                        discrete={true}
                        swatches={false}
                        disabled={true}
                    />
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
            {!lightOn ? '' : lightOnControllers()}
        </View>
    );
}

const styles = StyleSheet.create({
    lightScreen: {
        flex: 1,
        justifyContent: 'center',
        alignItems:  'center',
        display: 'flex',
        flexDirection: 'column',
        flexWrap: 'wrap',
    }
});