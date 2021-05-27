import React, {useState} from 'react';
import {Text, View} from "react-native";
import Slider from '@react-native-community/slider';

export default function TemperatureScreen() {
    const [low, setLow] = useState(0);
    const [high, setHigh] = useState(100);
    const [temperature, setTemperature] = useState(10);
    return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Text>26°C</Text>
            <Text>{low}, {high}</Text>
            <Slider
                style={{width: '100%', height: 40, backgroundColor: 'white'}}
                minimumValue={0}
                maximumValue={40}
                value={temperature}
                onSlidingComplete={() => {
                    // todo: implement service call
                }}
                onValueChange={setTemperature}
            />
        </View>
    );
}