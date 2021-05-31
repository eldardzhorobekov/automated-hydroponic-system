import React, {useState} from 'react';
import {Dimensions, StyleSheet, Text, View} from "react-native";
import {LineChart} from "react-native-chart-kit";
import {useSelector} from "react-redux";
import {fetchHistory} from "../services/utils";
import {HISTORY_UPDATE_S, HUMIDITY_ENTITY_ID, TEMPERATURE_ENTITY_ID} from "../constants";
import useInterval from "../components/useInterval";

const screenWidth = Dimensions.get("window").width;

const chartConfig = {
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    color: (opacity = 1) => `rgba(250, 188, 89, .9)`,
    style: {
        borderRadius: 16
    },
    propsForDots: {
        r: "0",
    }
}

function StateContainer({title, text, data}) {
    return (
        <View style={style.stateContainer}>
            <Text style={style.stateContainerTitle}>{title}</Text>
            <Text style={style.stateContainerText}>{text}</Text>
            <LineChart
                key={data}
                data={{datasets: [{data}]}}
                width={screenWidth}
                height={140}
                verticalLabelRotation={30}
                chartConfig={chartConfig}
                bezier
            />
        </View>
    );
}


export default function TemperatureScreen() {
    const _temperature = useSelector(state => state.temperature);
    const _humidity = useSelector(state => state.humidity);
    const [temperatureData, setTemperatureData] = useState([21]);
    const [humidityData, setHumidityData] = useState([30]);

    useInterval(() => {
        fetchHistory(TEMPERATURE_ENTITY_ID)
            .then(_data => {
                const temperature_states = _data[0].map(x => parseInt(x.state)).filter(Number);
                setTemperatureData(temperature_states);
            })
            .catch(_error => {
                console.error(_error);
            })
    }, HISTORY_UPDATE_S);

    useInterval(() => {
        fetchHistory(HUMIDITY_ENTITY_ID)
            .then(_data => {
                const humidity_states = _data[0].map(x => parseInt(x.state)).filter(Number);
                setHumidityData(humidity_states);
            })
            .catch(_error => {
                console.error(_error);
            })
    }, HISTORY_UPDATE_S);

    return (
        <View
            style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#fff'
            }}>
            <StateContainer title={'Temperature'}
                            text={_temperature + '°C'}
                            data={temperatureData}
            />
            <View style={style.divider}/>
            <StateContainer title={'Humidity'}
                            text={_humidity + '%'}
                            data={humidityData}
            />
        </View>
    );
}

const style = StyleSheet.create({
    stateContainer: {
        paddingTop: 20,
        paddingBottom: 20,
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        width: '100%',
    },
    divider: {
        width: '100%',
        height: 1,
        borderBottomColor: '#cccccc',
        borderBottomWidth: 1
    },
    stateContainerTitle: {
        fontSize: 20,
        textAlign: 'left',
        width: '100%',
        marginBottom: 15,
        paddingLeft: 20,
        color: '#A2A2A2'
        // backgroundColor: 'blue',
    },
    stateContainerText: {
        fontSize: 30,
        marginBottom: 25,
        paddingLeft: 20
    }
})