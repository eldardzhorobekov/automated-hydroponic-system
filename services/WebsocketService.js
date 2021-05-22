
export const TYPES = {
    CALL_SERVICE: 'call_service',
    AUTH: 'auth',
    GET_STATES: 'get_states'
}
export const LIGHT_ENTITY_ID = 'light.rgb_led_light';

export class WebsocketService {
    constructor() {
        this.domain = 'ws://homeassistant.local:8123/api/websocket';
        this.ws = new WebSocket(this.domain);
        this.id = 1;
        this.types = {}
    }

    authenticate(access_token) {
        const type = TYPES.AUTH;
        const data = {
            type: type,
            access_token: access_token
        };
        this._wsSend(data);
        this.id++;
    }

    turnLightOn() {
        this._changeLightState({service: "turn_on"});
    }

    turnLightOff() {
        this._changeLightState({service: "turn_off"});
    }

    setLightColor(rgb_color) {
        this._changeLightState({service: "turn_on", rgb_color: rgb_color});
    }

    setBrightnessPct(brightness_pct) {
        this._changeLightState({service: "turn_on", brightness_pct: brightness_pct})
    }

    _changeLightState({service, rgb_color, brightness_pct}) {
        const type = TYPES.CALL_SERVICE;
        this.types[this.id] = type;
        const data = {
            domain: "light",
            id: this.id++,
            service: service,
            service_data: {entity_id: "light.rgb_led_light"},
            type: type,
        };
        if (typeof rgb_color !== 'undefined') {
            data.service_data.rgb_color = rgb_color;
        }
        if (typeof brightness_pct !== 'undefined') {
            data.service_data.brightness_pct = brightness_pct;
        }
        this._wsSend(data);
    }

    getStates() {
        const type = TYPES.GET_STATES;
        this.types[this.id] = type;
        const data = {
            id: this.id++,
            type: type
        }
        this._wsSend(data)
    }

    _wsSend(data) {
        console.log("TRYING TO SEND", data);
        try {
            this.ws.send(JSON.stringify(data));
        } catch (e) {
            console.error('WS: COULD NOT SEND DATA', e);
        }
    }
}