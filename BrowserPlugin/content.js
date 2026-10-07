const INJECTED_ATTR = 'data-chamar-injected';

function injectStyles() {
  if (document.getElementById('chamar-esus-styles')) return;
  const style = document.createElement('style');
  style.id = 'chamar-esus-styles';
  style.textContent = `
    .chamar-btn-esus {
      background: #1a7a2e !important;
      color: #fff !important;
      border: none !important;
      padding: 5px 14px !important;
      border-radius: 4px !important;
      cursor: pointer !important;
      font-size: 13px !important;
      font-weight: 600 !important;
      margin-left: 8px !important;
      vertical-align: middle !important;
      transition: background 0.15s !important;
      line-height: 1.4 !important;
    }
    .chamar-btn-esus:hover:not(:disabled) { background: #145c22 !important; }
    .chamar-btn-esus:active:not(:disabled) { background: #0f4419 !important; }
    .chamar-btn-esus:disabled {
      background: #5a9e6a !important;
      cursor: wait !important;
      opacity: 0.8 !important;
    }
  `;
  document.head.appendChild(style);
}

function findPatientName(container) {
  let el = container;
  for (let i = 0; i < 10; i++) {
    el = el.parentElement;
    if (!el) break;
    const span = el.querySelector('.css-11zrb1w');
    if (span) return span.textContent.trim();
  }
  return null;
}

function injectChamarButton(container) {
  if (container.hasAttribute(INJECTED_ATTR)) return;
  container.setAttribute(INJECTED_ATTR, 'true');

  const btn = document.createElement('button');
  btn.className = 'chamar-btn-esus';
  btn.textContent = 'Chamar';

  btn.addEventListener('click', (e) => {
    e.stopPropagation();

    const currentPerson = findPatientName(container);
    const currentDoctor = document.querySelector('.css-1ejlzhz')?.textContent.trim();
    if (!currentPerson) return;

    btn.disabled = true;
    btn.textContent = 'Chamando...';

    chrome.runtime.sendMessage(
      { action: 'createCall', data: { currentPerson, currentDoctor } },
      (response) => {
        btn.disabled = false;
        btn.textContent = 'Chamar';

        if (chrome.runtime.lastError) return;

        if (!response?.ok) {
          alert(
            'Sem conexão com o servidor.\n\n' +
            'Verifique o endereço configurado na extensão e tente novamente.'
          );
        }
      }
    );
  });

  container.appendChild(btn);
}

function processContainers() {
  document.querySelectorAll(`.css-w94bws:not([${INJECTED_ATTR}])`).forEach(injectChamarButton);
}

injectStyles();
processContainers();

const observer = new MutationObserver(processContainers);
observer.observe(document.body, { subtree: true, childList: true });
