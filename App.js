import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import * as React from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';
import HomeScreen from './screens/HomeScreen';
import LightScreen from './screens/LightScreen';
import TemperatureScreen from './screens/TemperatureScreen';

const Tab = createBottomTabNavigator();

export default function App() {
    return (
        <NavigationContainer>
            <Tab.Navigator
                screenOptions={({ route }) => ({
                    tabBarIcon: ({ focused, color, size }) => {
                        let iconName, iconType;

                        if (route.name === 'Home') {
                            iconName = focused ? 'home' : 'home';
                        } else if (route.name === 'Temperature') {
                            iconName = focused ? 'thermometer-half' : 'thermometer-half';
                        } else if (route.name === 'Lights') {
                            iconName = focused ? 'lightbulb-o' : 'lightbulb-o';
                        }

                        // You can return any component that you like here!
                        return <Icon name={iconName} size={size} color={color} />;
                    },
                })}
                tabBarOptions={{
                    activeTintColor: 'green',
                    inactiveTintColor: 'gray',
                }}
            >
                <Tab.Screen name="Lights" component={LightScreen} />
                <Tab.Screen name="Temperature" component={TemperatureScreen} />
                <Tab.Screen name="Home" component={HomeScreen} />
            </Tab.Navigator>
        </NavigationContainer>
    );
}