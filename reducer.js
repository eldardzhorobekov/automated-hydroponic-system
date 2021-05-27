import {combineReducers} from "redux";

export default function reducer(state=INITIAL_STATE, action) {
    switch (action.type) {
        case 'SET_TOKENS':
            return {tokens: action.payload}
        case 'RESET_TOKENS':
            return INITIAL_STATE
        default:
            return state
            // throw new Error(`NO ACTION NAMED: ${action.type}`);
    }
}
const INITIAL_STATE = {
    count: 0,
    tokens: null
};
