import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {NavigationContainer} from '@react-navigation/native';
import * as React from 'react';
import {useEffect} from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';
import HomeScreen from './screens/HomeScreen';
import LightScreen from './screens/LightScreen';
import TemperatureScreen from './screens/TemperatureScreen';
import LoginScreen from "./screens/LoginScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import reducer from "./reducer";
import {Provider, useSelector} from "react-redux";
import {createStore} from "redux";

const Tab = createBottomTabNavigator();
const store = createStore(reducer);


function App() {
    const _tokens = useSelector(state => state.tokens);
    useEffect(() => {
        const getToken = async () => {
            try {
                await AsyncStorage.getItem('@tokens');
            } catch (error) {
                console.error('COULD NOT GET TOKENS!')
            }
        }
        getToken()
            .then((tokens) => {
                console.log(tokens);
            })
    }, []);
    return (
        <NavigationContainer>
            {
                !_tokens ? <LoginScreen/> : (
                    <Tab.Navigator
                        screenOptions={({route}) => ({
                            tabBarIcon: ({focused, color, size}) => {
                                let iconName;

                                if (route.name === 'Home') {
                                    iconName = focused ? 'home' : 'home';
                                } else if (route.name === 'Temperature') {
                                    iconName = focused ? 'thermometer-half' : 'thermometer-half';
                                } else if (route.name === 'Lights') {
                                    iconName = focused ? 'lightbulb-o' : 'lightbulb-o';
                                }

                                // You can return any component that you like here!
                                return <Icon name={iconName} size={size} color={color}/>;
                            },
                        })}
                        tabBarOptions={{
                            activeTintColor: 'green',
                            inactiveTintColor: 'gray',
                        }}
                    >
                        <Tab.Screen name="Lights" component={LightScreen}/>
                        <Tab.Screen name="Temperature" component={TemperatureScreen}/>
                        <Tab.Screen name="Home" component={HomeScreen}/>
                    </Tab.Navigator>
                )}
        </NavigationContainer>
    );
}

export default function AppWrapper() {
    return (
        <Provider store={store}>
            <App/>
        </Provider>
    )
}