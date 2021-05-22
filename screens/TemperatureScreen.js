import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from "react-native";
// import RangeSlider from 'rn-range-slider';
import Label from "../components/Slider/Label";
import Notch from "../components/Slider/Notch";
import Rail from "../components/Slider/Rail";
import RailSelected from "../components/Slider/RailSelected";
import Thumb from "../components/Slider/Thumb";

export default function TemperatureScreen({ navigation }) {
    const [low, setLow] = useState(0);
    const [high, setHigh] = useState(100);
    const [min, setMin] = useState(17);
    const [max, setMax] = useState(26);

    const renderThumb = useCallback(() => <Thumb/>, []);
    const renderRail = useCallback(() => <Rail/>, []);
    const renderRailSelected = useCallback(() => <RailSelected/>, []);
    const renderLabel = useCallback(value => <Label text={value}/>, []);
    const renderNotch = useCallback(() => <Notch/>, []);
    const handleValueChange = useCallback((low, high) => {
        setLow(low);
        setHigh(high);
    }, []);

    return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Text>26°C</Text>
            <Text>{low}, {high}</Text>
            {/*<RangeSlider*/}
            {/*    style={styles.slider}*/}
            {/*    min={min}*/}
            {/*    max={max}*/}
            {/*    step={1}*/}
            {/*    disableRange={false}*/}
            {/*    renderThumb={renderThumb}*/}
            {/*    renderRail={renderRail}*/}
            {/*    renderRailSelected={renderRailSelected}*/}
            {/*    renderLabel={renderLabel}*/}
            {/*    renderNotch={renderNotch}*/}
            {/*    onValueChanged={handleValueChange}*/}
            {/*/>*/}
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        alignItems: 'stretch',
        padding: 12,
        flex: 1,
        backgroundColor: '#555',
    },
    slider: {
        width: '100%'
    },
    button: {
    },
    header: {
        alignItems: 'center',
        backgroundColor: 'black',
        padding: 12,
    },
    horizontalContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    text: {
        color: 'white',
        fontSize: 20,
    },
    valueText: {
        width: 50,
        color: 'white',
        fontSize: 20,
    },
});