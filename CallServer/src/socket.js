const socket = io();
const params = new URLSearchParams(location.search);

// true = mostra "Maria S." em vez do nome completo (LGPD)
const ABREVIAR_NOMES = false;
// quantas chamadas anteriores aparecem na linha do tempo
const MAX_HISTORICO = 6;

const audio = new Audio("/assets/sound/mixkit-software-interface-start-2574.wav");

// /?ubs=Pioneiros preenche o título do painel
const ubs = params.get("ubs");
if (ubs) document.getElementById("ubs").textContent = `UBS ${ubs}`;

function el(tag, classe, texto) {
  const e = document.createElement(tag);
  if (classe) e.className = classe;
  if (texto !== undefined) e.textContent = texto; // textContent evita injeção de HTML
  return e;
}

function nomeExibido(nome) {
  if (!ABREVIAR_NOMES) return nome;
  const partes = nome.trim().split(/\s+/);
  return partes.length > 1 ? `${partes[0]} ${partes[partes.length - 1][0]}.` : partes[0];
}

// chamada atual (bloco grande)
function mostRecentCall(c) {
  const box = el("div", "chamada");
  const detalhes = el("div", "chamada-detalhes");
  detalhes.append(
    el("p", "nome-responsavel", c.currentDoctor ? `Dr(a). ${c.currentDoctor}` : ""),
    el("p", "hora", c.time)
  );
  box.append(
    el("p", "nome-paciente", nomeExibido(c.currentPerson)),
    el("p", "nome-sala", c.roomName.toUpperCase()),
    detalhes
  );
  document.getElementById("destaque").replaceChildren(box);
}

// chamadas anteriores em linha do tempo
function createHistory(data) {
  const itens = data.slice(1, 1 + MAX_HISTORICO).map((c) => {
    const item = el("div", "tl-item");
    const info = el("div", "tl-info");
    info.append(
      el("p", "tl-nome", nomeExibido(c.currentPerson)),
      el("p", "tl-sala", c.roomName.toUpperCase())
    );
    item.append(el("span", "tl-hora", c.time), el("span", "tl-ponto"), info);
    return item;
  });
  document.getElementById("historico").replaceChildren(...itens);
}

function render(data) {
  if (!data.length) {
    document
      .getElementById("destaque")
      .replaceChildren(el("p", "aguardando", "Aguardando chamadas…"));
    document.getElementById("historico").replaceChildren();
    return;
  }
  mostRecentCall(data[0]);
  createHistory(data);
}

// --- voz ---
let vozPt = null;
function carregarVoz() {
  const vozes = speechSynthesis.getVoices();
  vozPt =
    vozes.find((v) => v.lang.startsWith("pt") && v.name.includes("Maria")) ||
    vozes.find((v) => v.lang === "pt-BR") ||
    null;
}
if ("speechSynthesis" in window) {
  carregarVoz();
  speechSynthesis.onvoiceschanged = carregarVoz; // no Chrome a lista chega depois
}

function speak(texto) {
  if (!("speechSynthesis" in window)) return;
  const fala = new SpeechSynthesisUtterance(texto);
  if (vozPt) fala.voice = vozPt;
  fala.lang = "pt-BR";
  fala.rate = 1.15;
  fala.pitch = 1.0;
  speechSynthesis.speak(fala);
}

function anunciar(c) {
  audio.play().catch((e) => console.error("Erro no áudio:", e));
  setTimeout(() => {
    speak(`${nomeExibido(c.currentPerson).replace(".", "")}, ${c.roomName}`);
  }, 1000);
}

// --- eventos do servidor ---
socket.on("init", render); // abriu ou reconectou: só desenha, sem som
socket.on("newData", (data) => {
  render(data);
  if (data.length) anunciar(data[0]);
});

// --- botão de teste (escondido em produção) ---
const btn = document.getElementById("btn-chamar");
if (params.has("debug")) btn.hidden = false;
socket.on("debug", () => {
  btn.hidden = !btn.hidden;
});

let testes = 0;
btn.addEventListener("click", async () => {
  testes++;
  let resultado = "✓";
  try {
    const resposta = await fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        roomName: `Consultório ${(testes % 3) + 1}`,
        currentPerson: `Paciente Teste ${testes}`,
        currentDoctor: "Teste",
      }),
    });
    if (!resposta.ok) resultado = resposta.status;
  } catch (erro) {
    resultado = "!";
    console.error("Erro ao enviar chamada de teste:", erro);
  }
  // mostra o resultado no próprio botão por 2,5 segundos
  btn.style.fontSize = "1.1rem";
  btn.textContent = resultado;
  setTimeout(() => {
    btn.textContent = "+";
    btn.style.fontSize = "";
  }, 2500);
});

// --- relógio ---
function updateTime() {
  const now = new Date();
  document.getElementById("time").textContent = now.toLocaleTimeString("pt-BR");
  const data = now.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  document.getElementById("date").textContent = data.charAt(0).toUpperCase() + data.slice(1);
}
setInterval(updateTime, 1000);
updateTime();

socket.on("reload", () => {
  console.log("Recebido comando de atualização.");
  location.reload();
});