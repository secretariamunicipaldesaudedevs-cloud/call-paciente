const socket = io();
const audio = new Audio("../assets/sound/ring.mp3");

function mostRecentCall(data) {
  const destaque = document.getElementById("destaque");
  const firstDiv = document.createElement("div");
  firstDiv.classList.add("chamada");
  firstDiv.innerHTML = `
        <p class="nome-paciente">
            ${data[0].currentPerson}
          </p>
          <p class="nome-sala">${data[0].roomName.toUpperCase()}</p>
          <div class="chamada-detalhes">
            <p class="nome-responsavel">Dr(a). ${data[0].currentDoctor}</p>
            <p class="hora">${data[0].time}</p>
          </div>
          `;
  destaque.innerHTML = firstDiv.outerHTML;
}

function createHistory(data) {
  const historicoDiv = document.getElementById("historico");
  historicoDiv.innerHTML = "";

  for (let i = 1; i < data.length; i++) {
    const hChamada = document.createElement("div");
    hChamada.classList.add("h-chamada");
    hChamada.innerHTML = `
      <p class="h-nome">${data[i].currentPerson}</p>
      <p class="h-sala">${data[i].roomName.toUpperCase()}</p>
      <p class="h-hora">${data[i].time}</p>
      `;
    historicoDiv.appendChild(hChamada);
  }
}

function speak(text) {
  if ("speechSynthesis" in window) {
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "pt-BR";
    speech.rate = 1.15;
    window.speechSynthesis.speak(speech);
  } else {
    console.error("API Web Speech não é suportada neste navegador.");
  }
}

socket.on("newData", (data) => {
  mostRecentCall(data);
  createHistory(data);
  audio.play();
  setTimeout(() => {
    speak(data[0].currentPerson);
  }, 1000);
});

function updateTime() {
  const timeElement = document.getElementById("time");
  const dateElement = document.getElementById("date");

  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  const formattedHours = hours.toString().padStart(2, "0");
  const formattedMinutes = minutes.toString().padStart(2, "0");
  const formattedSeconds = seconds.toString().padStart(2, "0");

  const timeString = `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  timeElement.textContent = timeString;

  const daysOfWeek = [
    "Domingo",
    "Segunda-Feira",
    "Terça-Feira",
    "Quarta-Feira",
    "Quinta-Feira",
    "Sexta-Feira",
    "Sábado",
  ];
  const months = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
  ];

  const dayOfWeek = daysOfWeek[now.getDay()];
  const day = now.getDate();
  const month = months[now.getMonth()];
  const year = now.getFullYear();

  const dateString = `${dayOfWeek}, ${month} ${day}, ${year}`;
  dateElement.textContent = dateString;
}

setInterval(updateTime, 1000);
updateTime();

// Atualiza automaticamente o painel quando o servidor solicitar
socket.on("reload", () => {
  console.log("Recebido comando de atualização.");
  location.reload();
});
