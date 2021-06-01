import React, {useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome';
import ColorPicker from 'react-native-wheel-color-picker';
import Loading from '../components/Loading';
import {hexToRGB} from '../utils';
import Slider from '@react-native-community/slider';
import {useDispatch, useSelector} from "react-redux";

// todo: divide logic: 1)no connection to webserver 2)device is off

export default function LightScreen({wsService}) {
    const dispatch = useDispatch();
    const isLightAvailable = useSelector(state => state.isLightAvailable);
    const _wsActive = useSelector(state => state.wsActive);
    const _lightIsOn = useSelector(state => state.lightIsOn);
    const _currentColor = useSelector(state => state.color);
    const _brightness = useSelector(state => state.brightness);
    const [_, setBrightness] = useState(0);

    const onPressLightButton = () => {
        if (_lightIsOn) {
            wsService.turnLightOff();
        } else {
            wsService.turnLightOn();
        }
    };

    const setCurrentColor = (val) => {
        dispatch({type: 'SET_COLOR', payload: val})
    }

    function lightControllers() {
        return !_lightIsOn ? null : (
            <View style={{flex: 3}}>
                <View style={{}}>
                    <Slider
                        style={{width: '100%', height: 40, backgroundColor: 'white'}}
                        minimumValue={0}
                        maximumValue={255}
                        value={_brightness}
                        onSlidingComplete={(e) => {
                            wsService.setBrightness(e);
                        }}
                        onValueChange={setBrightness}
                    />
                </View>
                <View style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start'}}>
                    {!_currentColor ? null :
                        <ColorPicker
                            color={_currentColor}
                            onColorChange={setCurrentColor}
                            onColorChangeComplete={val => {
                                wsService.setLightColor(hexToRGB(val));
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

    return !_wsActive ? (<Loading/>) : (
        <View style={styles.lightScreen}>
            <View style={styles.light}>
                <TouchableOpacity onPress={onPressLightButton}>
                    <Text style={{textAlign: 'center'}}>{isLightAvailable ? '' : 'Unavailable'}</Text>
                    <Icon name={'lightbulb-o'} color={_lightIsOn ? '#f9ca24' : 'black'} size={200}/>
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