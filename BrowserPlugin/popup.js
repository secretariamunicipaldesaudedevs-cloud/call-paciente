const message = document.getElementById('message');
const messageServer = document.getElementById('messageServer');
const messageMedico = document.getElementById('messageMedico');
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');
const roomNameInput = document.getElementById('roomNameInput');
const serverUrlInput = document.getElementById('serverUrlInput');
const medicoNameInput = document.getElementById('medicoNameInput');

let currentServerUrl = ''; //Armazena a URL do servidor atual para verificar a conexão periodicamente

chrome.storage.local.get(['roomName', 'serverUrl', 'medicoName'], (data) => { // Recupera os valores salvos da extensão do navegador
  if (data.roomName) { // Se houver um nome de sala salvo, atualiza o campo de entrada e exibe uma mensagem de feedback
    roomNameInput.value = data.roomName;
    showFeedback(message, `"${data.roomName}"`);
  }
  if (data.serverUrl) { // Se houver uma URL de servidor salva, atualiza o campo de entrada, exibe uma mensagem de feedback e verifica a conexão
    currentServerUrl = data.serverUrl;
    serverUrlInput.value = data.serverUrl;
    showFeedback(messageServer, `"${data.serverUrl}"`);
    checkConnection(data.serverUrl);
  }
  if (data.medicoName) { // Se houver um nome de médico salvo, atualiza o campo de entrada e exibe uma mensagem de feedback
    medicoNameInput.value = data.medicoName;
    showFeedback(messageMedico, `"${data.medicoName}"`);
    console.log('Nome do médico recuperado:', data.medicoName); // Log para depuração
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
