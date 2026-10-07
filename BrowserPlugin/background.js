function getStorageData(keys) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(keys, (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(result);
      }
    });
  });
}

async function handleEnterAtendimento(request) {
  try {
    const { roomName } = await getStorageData(["roomName"]);
    const { serverUrl } = await getStorageData(["serverUrl"]);

    if (!serverUrl) return false;

    const res = await fetch(serverUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        roomName: roomName || "",
        currentPerson: request.currentPerson,
        currentDoctor: request.currentDoctor,
      }),
      signal: AbortSignal.timeout(5000),
    });

    return res.ok;
  } catch (e) {
    console.error("Error during handling atendimento:", e);
    return false;
  }
}

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  switch (request.action) {
    case "saveServerUrl": {
      const serverUrl = request.serverUrl;
      chrome.storage.local.set({ serverUrl }).then(() => {
        sendResponse({ ok: true });
      });
      return true;
    }

    case "saveRoomName": {
      const roomName = request.roomName;
      chrome.storage.local.set({ roomName }).then(() => {
        sendResponse({ ok: true });
      });
      return true;
    }

    case "createCall":
    case "callAgain":
      handleEnterAtendimento(request.data).then((ok) => {
        sendResponse({ ok });
      });
      return true;

    default:
      console.error("Unknown action:", request.action);
  }
});
