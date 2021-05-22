import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome';
import ColorPicker from 'react-native-wheel-color-picker';
import Loading from '../components/Loading';
import {hexToRGB, RGBToHex} from '../utils';
import Slider from '@react-native-community/slider';
import {LIGHT_ENTITY_ID, TYPES, WebsocketService} from "../services/WebsocketService";

// todo: refresh token
// todo: authentication page
// todo: subscribe events
// todo: divide logic: 1)no connection to webserver 2)device is off

const wsService = new WebsocketService();
const _access_token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiI4NzUzNmY4Zjk2ZWY0ZTZmOWUxMWJkODIxOTI2Y2U5NCIsImlhdCI6MTYyMTcyNTQ4MSwiZXhwIjoxNjIxNzI3MjgxfQ.FeiiMbyAiYq7OE5beNdvtonsUBPXvC-cTYIIJi9U1uQ"

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

    function lightControllers() {
        return !lightOn ? null : (
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
                        sliderSize={0}
                        swatches={false}
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
            {lightControllers()}
        </View>
    );
};

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