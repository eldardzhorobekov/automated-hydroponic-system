import {UNAVAILABLE} from "./constants";

const INITIAL_STATE = {
    count: 0,
    tokens: null,
    brightness: 0,
    color: null,
    lightIsOn: false,
    wsActive: false,
    humidity: 0,
    temperature: 0,
    isLightAvailable: false,
    isTemperatureAvailable: false,
    isHumidityAvailable: false,
};

export default function reducer(state = INITIAL_STATE, action) {
    switch (action.type) {
        case 'SET_TOKENS':
            return {...state, tokens: action.payload}
        case 'RESET_TOKENS':
            return INITIAL_STATE
        case 'SET_WS_ACTIVE':
            return {...state, wsActive: true}
        case 'SET_WS_INACTIVE':
            return {...state, wsActive: false}
        case 'SET_LIGHT_ON':
            return {...state, lightIsOn: true}
        case 'SET_LIGHT_OFF':
            return {...state, lightIsOn: false}
        case 'SET_COLOR':
            return {...state, color: action.payload}
        case 'SET_BRIGHTNESS':
            return {...state, brightness: action.payload}
        case 'SET_TEMPERATURE':
            return {...state, temperature: action.payload}
        case 'SET_HUMIDITY':
            return {...state, humidity: action.payload}
        case 'SET_LIGHT_AVAILABLE':
            return {...state, isLightAvailable: action.payload !== UNAVAILABLE}
        case 'SET_TEMPERATURE_AVAILABLE':
            return {...state, isTemperatureAvailable: action.payload !== UNAVAILABLE}
        case 'SET_HUMIDITY_AVAILABLE':
            return {...state, isHumidityAvailable: action.payload !== UNAVAILABLE}
        default:
            return state
        // throw new Error(`NO ACTION NAMED: ${action.type}`);
    }
}
