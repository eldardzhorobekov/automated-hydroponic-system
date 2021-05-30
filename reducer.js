
const INITIAL_STATE = {
    count: 0,
    tokens: null,
    brightness: 0,
    color: null,
    lightIsOn: false,
    wsActive: false,
};

export default function reducer(state=INITIAL_STATE, action) {
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
        default:
            return state
            // throw new Error(`NO ACTION NAMED: ${action.type}`);
    }
}
