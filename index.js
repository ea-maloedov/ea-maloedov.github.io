const BASE_URL = 'https://api.green-api.com';

function loadCredentials() {
    const id = localStorage.getItem('greenApi_idInstance');
    const token = localStorage.getItem('greenApi_apiToken');
    if (id) document.getElementById('idInstance').value = id;
    if (token) document.getElementById('apiToken').value = token;
}

function saveCredentials() {
    const id = document.getElementById('idInstance').value.trim();
    const token = document.getElementById('apiToken').value.trim();
    if (id && token) {
        localStorage.setItem('greenApi_idInstance', id);
        localStorage.setItem('greenApi_apiToken', token);
    }
}

window.addEventListener('load', () => {
    loadCredentials();
});

function getCredentials() {
    const idInstance = document.getElementById('idInstance').value.trim();
    const apiToken = document.getElementById('apiToken').value.trim();

    if (!idInstance || !apiToken) {
        alert('Заполните idInstance и ApiTokenInstance');
        throw new Error('Missing credentials');
    }

    saveCredentials();

    return {idInstance, apiToken};
}

async function callApi(method, endpoint, body = null, btn = null) {
    const {idInstance, apiToken} = getCredentials();
    let url = `${BASE_URL}${endpoint}`;
    url = url.replace('{idInstance}', idInstance).replace('{apiTokenInstance}', apiToken);

    if (btn) btn.classList.add('btn-loading');

    const options = {
        method,
        headers: {'Content-Type': 'application/json'},
    };
    if (body) options.body = JSON.stringify(body);

    try {
        const res = await fetch(url, options);
        let data;
        try {
            data = await res.json();
        } catch {
            data = {status: res.status, statusText: res.statusText};
        }
        displayResponse(data);
    } catch (err) {
        displayResponse({error: err.message});
    } finally {
        if (btn) btn.classList.remove('btn-loading');
    }
}

function displayResponse(data) {
    const responseArea = document.getElementById('responseArea');
    if (responseArea) {
        responseArea.textContent = JSON.stringify(data, null, 2);
    }
}

function callGetSettings(event) {
    const btn = event?.currentTarget;
    callApi('GET', `/waInstance{idInstance}/getSettings/{apiTokenInstance}`, null, btn);
}

function callGetStateInstance(event) {
    const btn = event?.currentTarget;
    callApi('GET', `/waInstance{idInstance}/getStateInstance/{apiTokenInstance}`, null, btn);
}

function callSendMessage(event) {
    const phone = document.getElementById('phoneMessage').value.trim();
    const message = document.getElementById('textMessage').value.trim();
    const btn = event?.currentTarget;


    if (!phone || !/^\d{10,15}$/.test(phone)) {
        alert('Введите корректный номер телефона (например: 79123456789)');
        return;
    }
    if (!message) {
        alert('Введите текст сообщения');
        return;
    }

    callApi('POST', `/waInstance{idInstance}/sendMessage/{apiTokenInstance}`, {
        chatId: `${phone}@c.us`,
        message
    }, btn);
}

function callSendFileByUrl(event) {
    const phone = document.getElementById('phoneFile').value.trim();
    const urlFile = document.getElementById('urlFile').value.trim();
    const fileName = document.getElementById('fileName').value.trim();
    const caption = document.getElementById('caption').value.trim();

    const btn = event?.currentTarget;

    if (!phone || !/^\d{10,15}$/.test(phone)) {
        alert('Введите корректный номер телефона');
        return;
    }
    if (!urlFile) {
        alert('Укажите URL файла');
        return;
    }
    if (!fileName) {
        alert('Укажите имя файла');
        return;
    }

    callApi('POST', `/waInstance{idInstance}/sendFileByUrl/{apiTokenInstance}`, {
        chatId: `${phone}@c.us`,
        urlFile,
        fileName,
        caption: caption || undefined
    }, btn);
}