import {TYPES} from "../constants";

export class WebsocketService {
    constructor() {
        this.ws = null;
        this.id = 1;
        this.types = {}
        this.cur_color = [];
    }

    authenticate(access_token) {
        console.log('AUTHENTICATING');
        const type = TYPES.AUTH;
        const data = {
            type: type,
            access_token: access_token
        };
        this._wsSend(data);
        this.id++;
    }

    subscribeEvents() {
        const type = TYPES.SUBSCRIBE_EVENTS;
        this.types[this.id] = type;
        const data = {
            type: type,
            event_type: "state_changed",
            id: this.id++
        };
        this._wsSend(data);
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

    setBrightness(brightness) {
        this._changeLightState({service: "turn_on", brightness: brightness})
    }

    _changeLightState({service, rgb_color, brightness}) {
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
        if (typeof brightness !== 'undefined') {
            data.service_data.brightness = brightness;
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

    isOpen() {
        return this.ws.readyState === this.ws.OPEN
    }

    _wsSend(data) {
        if(this.isOpen()) {
            console.log("TRYING TO SEND", data);
            this.ws.send(JSON.stringify(data));
        }
    }
}