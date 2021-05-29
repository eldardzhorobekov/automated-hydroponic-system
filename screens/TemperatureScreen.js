import React, {useState} from 'react';
import {Dimensions, StyleSheet, Text, View} from "react-native";
import {LineChart} from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

const chartConfig = {
    // backgroundColor: "#ffffff",
    backgroundColor: "#ffffff",
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    decimalPlaces: 2, // optional, defaults to 2dp
    // rgb(250,188,89)
    color: (opacity = 1) => `rgba(250, 188, 89, .9)`,
    // labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
        borderRadius: 16
    },
    propsForDots: {
        r: "0",
        // strokeWidth: "1",
        // stroke: "#ffa726"
    }
}
const initialData = [21, 22, 23, 25, 28, 26, 25, 22];

function StateHistory() {
    const [data, setData] = useState(initialData)
    const dataWrapper = {
        // labels: ["January", "February", "March", "April", "May", "June"],
        datasets: [
            {
                data
            }
        ]
    };
    const onPress = () => {
        setData([...data, 45]);
    }
    return (
        <View>
            <LineChart
                key={data}
                data={{datasets: [{data}]}}
                width={screenWidth}
                height={130}
                verticalLabelRotation={30}
                chartConfig={chartConfig}
                bezier
            />
            {/*<Button onPress={onPress} title={'Press'}/>*/}
        </View>
    );
}

function StateContainer({title, text}) {

    return (
        <View style={style.stateContainer}>
            <Text style={style.stateContainerTitle}>{title}</Text>
            <Text style={style.stateContainerText}>{text}</Text>
            <StateHistory/>
        </View>
    );
}


export default function TemperatureScreen() {
    const [low, setLow] = useState(0);
    const [high, setHigh] = useState(100);
    const [temperature, setTemperature] = useState(26);
    const [humidity, setHumidity] = useState(30);

    return (
        <View
            style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#fff'
            }}>

            <StateContainer title={'Temperature'} text={temperature + '°C'}/>
            <View style={style.divider}/>
            <StateContainer title={'Humidity'} text={humidity + '%'}/>
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