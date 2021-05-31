import {domain} from "../constants";

export async function postData(url = '', data = {}) {
    const response = await fetch(url, {
        method: 'POST',
        mode: 'no-cors',
        cache: 'no-cache',
        credentials: 'omit',
        headers: {
            'Content-Type': 'application/json',
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
        body: JSON.stringify(data)
    });
    return await response.json();
}

export async function getData(url='', query_params={}) {
    const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiI4NzUzNmY4Zjk2ZWY0ZTZmOWUxMWJkODIxOTI2Y2U5NCIsImlhdCI6MTYyMjUwMjA0NiwiZXhwIjoxNjIyNTAzODQ2fQ.G5xb20qGq95t17GTyhf_8sq6k2hPxp--T8yeVA4PK9U';
    url = `${url}?${new URLSearchParams(query_params)}`
    const response = await fetch(url, {
        method: 'GET',
        mode: 'no-cors',
        cache: 'no-cache',
        credentials: 'omit',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
    });
    return await response.json();

}

export async function postFormData(url = '', data = {}) {
    const formData = new FormData();
    for (const name in data) {
        formData.append(name, data[name]);
    }
    const response = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
        body: formData
    });
    return await response.json();
}


function getUTCTime(timezoneOffset=-6) {
    const _date = new Date();
    return new Date(_date.getTime() - timezoneOffset*60000)
}

export async function fetchHistory(filter_entity_id) {
    const DAYS_BEFORE = 1;
    const now = getUTCTime()
    const from_time = new Date();
    from_time.setDate(now.getDate() - DAYS_BEFORE);
    const query_params = {
        'filter_entity_id': filter_entity_id,
        'end_time': now.toISOString()
    }
    const url = `${domain}/api/history/period/${from_time.toISOString()}`;
    return await getData(url, query_params);
}