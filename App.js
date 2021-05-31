import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {NavigationContainer} from '@react-navigation/native';
import * as React from 'react';
import {useEffect} from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';
import SettingsScreen from './screens/SettingsScreen';
import LightScreen from './screens/LightScreen';
import TemperatureScreen from './screens/TemperatureScreen';
import LoginScreen from "./screens/LoginScreen";
import reducer from "./reducer";
import {Provider, useDispatch, useSelector} from "react-redux";
import {createStore} from "redux";
import {
    client_id,
    domain,
    HUMIDITY_ENTITY_ID,
    LIGHT_ENTITY_ID,
    SUN_ENTITY_ID,
    TEMPERATURE_ENTITY_ID,
    TYPES,
    ws_domain
} from "./constants";
import {postData} from "./services/utils";
import {RGBToHex} from "./utils";
import {WebsocketService} from "./services/WebsocketService";

const Tab = createBottomTabNavigator();
const store = createStore(reducer);

const wsService = new WebsocketService(ws_domain);

function App() {
    const dispatch = useDispatch();
    const _tokens = useSelector(state => state.tokens);

    const handleResult = (response) => {

        const responseId = response.id;
        const responseType = wsService.types[responseId];
        const result = response.result;
        console.log('RESULT');
        console.log('response type', responseType)
        switch (responseType) {
            case TYPES.GET_STATES:
                const lightEntity = result.find(entity => entity.entity_id === LIGHT_ENTITY_ID);
                if (lightEntity.state === 'on') {
                    const [r, g, b] = lightEntity.attributes.rgb_color;
                    dispatch({type: 'SET_LIGHT_ON'});
                    dispatch({type: 'SET_COLOR', payload: RGBToHex(r, g, b)})
                } else {
                    dispatch({type: 'SET_LIGHT_OFF'});
                }
                dispatch({type: 'SET_LOADING', payload: false});


                const temperatureEntity = result.find(entity => entity.entity_id === TEMPERATURE_ENTITY_ID);
                dispatch({type: 'SET_TEMPERATURE', payload: parseInt(temperatureEntity.state)});

                const humidityEntity = result.find(entity => entity.entity_id === HUMIDITY_ENTITY_ID);
                dispatch({type: 'SET_HUMIDITY', payload: parseInt(humidityEntity.state)});

                break;
            case TYPES.CALL_SERVICE:
                break;
        }
    };
    const handleEvent = (response) => {
        console.log('EVENT');
        const newState = response.event.data.new_state;
        switch (response.event.data.entity_id) {
            case LIGHT_ENTITY_ID:
                if (newState.state === 'on') {
                    dispatch({type: 'SET_LIGHT_ON', payload: {}});
                    const brightness = newState.attributes.brightness;
                    const [r, g, b] = newState.attributes.rgb_color;
                    dispatch({type: 'SET_COLOR', payload: RGBToHex(r, g, b)});
                    dispatch({type: 'SET_BRIGHTNESS', payload: brightness});
                } else {
                    dispatch({type: 'SET_LIGHT_OFF', payload: {}});
                }
                break;
            case HUMIDITY_ENTITY_ID:
                dispatch({type: 'SET_HUMIDITY', payload: parseInt(newState.state)});
                break;
            case TEMPERATURE_ENTITY_ID:
                dispatch({type: 'SET_TEMPERATURE', payload: parseInt(newState.state)});
                break;
            case SUN_ENTITY_ID:
                console.log('SUN IS SHINING!');
                break;
            default:
                console.warn('NO ENTITY FOUND', response.event.data.entity_id);
        }
    };

    const startWebsocket = () => {
        wsService.ws = new WebSocket(ws_domain);
        wsService.ws.onopen = () => {
            console.log('WEBSOCKET OPEN');
            console.log('TRYING TO AUTHENTICATE WITH', _tokens);
            wsService.authenticate(_tokens.access_token);
        }
        wsService.ws.onmessage = async (e) => {
            const response = JSON.parse(e.data);
            const type = response.type;
            console.log('TYPE', type);
            switch (type) {
                case 'result':
                    handleResult(response);
                    break;
                case 'event':
                    handleEvent(response);
                    break
                case 'auth_required':
                    dispatch({type: 'SET_WS_INACTIVE'})
                    break;
                case 'auth_ok':
                    wsService.getStates();
                    wsService.subscribeEvents();
                    dispatch({type: 'SET_WS_ACTIVE'});
                    break;
                case 'auth_invalid':
                    console.error('AUTH INVALID');
                    const url = `${domain}/auth/token`;
                    const data = {
                        client_id: client_id,
                        grant_type: "refresh_token",
                        refresh_token: _tokens.refresh_token
                    }
                    await postData(url, data)
                        .then((data) => {
                            dispatch({type: 'SET_TOKENS', payload: {..._tokens, access_token: data.access_token}});
                        })
                        .catch((error) => {
                            console.error('COULD NOT VALIDATE REFRESH TOKEN. GOING TO LOGIN SCREEN', error);
                            dispatch({type: 'RESET_TOKENS'})
                        });
                    break;
            }
        };
        wsService.ws.onerror = (e) => {
            console.error("WEBSOCKET ERROR", e.message);
            dispatch({type: 'SET_WS_INACTIVE'});
        };
        wsService.ws.onclose = (e) => {
            console.error("WEBSOCKET CLOSED", e.code, e.reason);
            dispatch({type: 'SET_WS_INACTIVE'});
            wsService.ws = null;
            setTimeout(startWebsocket, 1000);
        };
    }

    useEffect(() => {
        if (_tokens !== null && wsService.ws === null) {
            startWebsocket();
        }
    }, [_tokens]);
    return (
        <NavigationContainer>
            {
                _tokens === null ? <LoginScreen/> : (
                    <Tab.Navigator
                        screenOptions={({route}) => ({
                            tabBarIcon: ({focused, color, size}) => {
                                let iconName;

                                if (route.name === 'Settings') {
                                    iconName = focused ? 'list' : 'list';
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
                        <Tab.Screen name="Lights" children={() => <LightScreen wsService={wsService}/>}/>
                        <Tab.Screen name="Temperature" component={TemperatureScreen}/>
                        <Tab.Screen name="Settings" component={SettingsScreen}/>
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