const message = document.getElementById('message');
const messageServer = document.getElementById('messageServer');
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');
const roomNameInput = document.getElementById('roomNameInput');
const serverUrlInput = document.getElementById('serverUrlInput');

let currentServerUrl = '';

chrome.storage.local.get(['roomName', 'serverUrl'], (data) => {
  if (data.roomName) {
    roomNameInput.value = data.roomName;
    showFeedback(message, `"${data.roomName}"`);
  }
  if (data.serverUrl) {
    currentServerUrl = data.serverUrl;
    serverUrlInput.value = data.serverUrl;
    showFeedback(messageServer, `"${data.serverUrl}"`);
    checkConnection(data.serverUrl);
  }
});

document.getElementById('setRoom').addEventListener('click', () => {
  const roomName = roomNameInput.value.trim();
  if (roomName) {
    chrome.runtime.sendMessage({ action: 'saveRoomName', roomName }).then(() => {
      showFeedback(message, `"${roomName}"`);
    });
  } else {
    showFeedback(message, 'Informe o nome do consultório.');
  }
});

document.getElementById('setServer').addEventListener('click', () => {
  const serverUrl = serverUrlInput.value.trim();
  if (serverUrl) {
    chrome.runtime.sendMessage({ action: 'saveServerUrl', serverUrl }).then(() => {
      currentServerUrl = serverUrl;
      showFeedback(messageServer, `"${serverUrl}"`);
      checkConnection(serverUrl);
    });
  } else {
    showFeedback(messageServer, 'Informe o endereço do servidor.');
  }
});

function showFeedback(el, text) {
  el.textContent = text;
  el.style.display = 'block';
}

function setStatus(connected) {
  statusDot.className = connected ? 'dot-connected' : 'dot-disconnected';
  statusText.textContent = connected ? 'Conectado' : 'Desconectado';
}

async function checkConnection(url) {
  if (!url) { setStatus(false); return; }
  try {
    const pingUrl = url.replace(/\/?$/, '/ping');
    const res = await fetch(pingUrl, { cache: 'no-store', signal: AbortSignal.timeout(3000) });
    setStatus(res.ok);
  } catch {
    setStatus(false);
  }
}

setInterval(() => {
  if (currentServerUrl) checkConnection(currentServerUrl);
}, 5000);
