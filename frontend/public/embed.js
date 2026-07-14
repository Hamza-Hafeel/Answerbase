/**
 * Answerbase Embeddable Chat Widget
 *
 * Usage: <script src="https://yourapp.com/embed.js" data-api-key="ab_xxxxx"></script>
 *
 * This script creates a floating chat bubble that customers can use to
 * ask questions. Answers come from the organization's uploaded documents
 * via the RAG pipeline.
 */
(function () {
  'use strict';

  // ── Config ──
  var script = document.currentScript;
  var API_KEY = script && script.getAttribute('data-api-key');
  if (!API_KEY) {
    console.error('[Answerbase] Missing data-api-key attribute on embed script.');
    return;
  }
  var API_BASE = script.getAttribute('data-api-url') || script.src.replace(/\/embed\.js.*$/, '');
  // Ensure API_BASE points to the backend. If same origin, use /api prefix.
  if (!script.getAttribute('data-api-url')) {
    API_BASE = API_BASE.replace(/\/$/, '');
  }

  // ── State ──
  var conversationId = null;
  var isOpen = false;
  var isLoading = false;
  var config = { name: 'Support', widget_name: 'Support', widget_welcome: 'Hi! How can I help you?' };

  // ── Styles ──
  var STYLES = '\
    #ab-widget-root * { box-sizing: border-box; margin: 0; padding: 0; font-family: Inter, -apple-system, sans-serif; }\
    #ab-bubble { position: fixed; bottom: 24px; right: 24px; width: 56px; height: 56px; border-radius: 50%; background: linear-gradient(135deg, #7c3aed, #6366f1); color: white; border: none; cursor: pointer; box-shadow: 0 4px 20px rgba(124,58,237,0.4); z-index: 99999; display: flex; align-items: center; justify-content: center; transition: transform 0.2s; }\
    #ab-bubble:hover { transform: scale(1.08); }\
    #ab-bubble svg { width: 24px; height: 24px; }\
    #ab-panel { position: fixed; bottom: 92px; right: 24px; width: 380px; max-height: 560px; border-radius: 16px; background: #0f0f14; border: 1px solid rgba(255,255,255,0.08); box-shadow: 0 16px 48px rgba(0,0,0,0.5); z-index: 99999; display: none; flex-direction: column; overflow: hidden; }\
    #ab-panel.open { display: flex; animation: ab-slide-up 0.3s ease-out; }\
    @keyframes ab-slide-up { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }\
    #ab-header { background: linear-gradient(135deg, #7c3aed, #6366f1); padding: 16px; display: flex; align-items: center; gap: 12px; }\
    #ab-header-avatar { width: 36px; height: 36px; border-radius: 50%; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; }\
    #ab-header-avatar svg { width: 18px; height: 18px; color: white; }\
    #ab-header-info { flex: 1; }\
    #ab-header-name { font-size: 14px; font-weight: 600; color: white; }\
    #ab-header-status { font-size: 11px; color: rgba(255,255,255,0.7); }\
    #ab-close { background: none; border: none; color: rgba(255,255,255,0.7); cursor: pointer; padding: 4px; border-radius: 4px; }\
    #ab-close:hover { color: white; background: rgba(255,255,255,0.1); }\
    #ab-messages { flex: 1; overflow-y: auto; padding: 16px; min-height: 280px; max-height: 380px; }\
    .ab-msg { display: flex; gap: 8px; margin-bottom: 12px; animation: ab-slide-up 0.2s ease-out; }\
    .ab-msg-bot { justify-content: flex-start; }\
    .ab-msg-user { justify-content: flex-end; }\
    .ab-msg-avatar { width: 28px; height: 28px; border-radius: 8px; background: rgba(124,58,237,0.15); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }\
    .ab-msg-avatar svg { width: 14px; height: 14px; color: #7c3aed; }\
    .ab-msg-bubble { max-width: 75%; padding: 10px 14px; border-radius: 16px; font-size: 13px; line-height: 1.5; }\
    .ab-msg-bot .ab-msg-bubble { background: #1e1e2a; color: #e5e5f0; border-bottom-left-radius: 4px; }\
    .ab-msg-user .ab-msg-bubble { background: #7c3aed; color: white; border-bottom-right-radius: 4px; }\
    .ab-typing { display: flex; gap: 4px; padding: 10px 14px; }\
    .ab-typing span { width: 6px; height: 6px; border-radius: 50%; background: #666; animation: ab-bounce 1s infinite; }\
    .ab-typing span:nth-child(2) { animation-delay: 0.15s; }\
    .ab-typing span:nth-child(3) { animation-delay: 0.3s; }\
    @keyframes ab-bounce { 0%, 80%, 100% { transform: scale(0.6); } 40% { transform: scale(1); } }\
    #ab-input-area { border-top: 1px solid rgba(255,255,255,0.06); padding: 12px; display: flex; gap: 8px; }\
    #ab-input { flex: 1; background: #1e1e2a; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 10px 14px; font-size: 13px; color: #e5e5f0; outline: none; resize: none; }\
    #ab-input::placeholder { color: #666; }\
    #ab-input:focus { border-color: #7c3aed; }\
    #ab-send { width: 40px; height: 40px; border-radius: 10px; background: #7c3aed; border: none; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.15s; }\
    #ab-send:hover { background: #6d28d9; }\
    #ab-send:disabled { opacity: 0.5; cursor: not-allowed; }\
    #ab-send svg { width: 16px; height: 16px; }\
    #ab-powered { text-align: center; padding: 6px; font-size: 10px; color: #555; }\
  ';

  // ── DOM ──
  var root = document.createElement('div');
  root.id = 'ab-widget-root';

  var style = document.createElement('style');
  style.textContent = STYLES;
  root.appendChild(style);

  var svgChat = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
  var svgBot = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 8V4H8"/><rect x="5" y="8" width="14" height="12" rx="2"/><path d="M2 14h2M20 14h2M9 13v2M15 13v2"/></svg>';
  var svgSend = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>';
  var svgX = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M18 6L6 18M6 6l12 12"/></svg>';

  // Bubble
  var bubble = document.createElement('button');
  bubble.id = 'ab-bubble';
  bubble.innerHTML = svgChat;
  bubble.setAttribute('aria-label', 'Open chat');
  root.appendChild(bubble);

  // Panel
  var panel = document.createElement('div');
  panel.id = 'ab-panel';
  panel.innerHTML = '\
    <div id="ab-header">\
      <div id="ab-header-avatar">' + svgBot + '</div>\
      <div id="ab-header-info">\
        <div id="ab-header-name">Support</div>\
        <div id="ab-header-status">Online</div>\
      </div>\
      <button id="ab-close">' + svgX + '</button>\
    </div>\
    <div id="ab-messages"></div>\
    <div id="ab-input-area">\
      <input id="ab-input" placeholder="Type a message…" />\
      <button id="ab-send" disabled>' + svgSend + '</button>\
    </div>\
    <div id="ab-powered">Powered by Answerbase</div>\
  ';
  root.appendChild(panel);
  document.body.appendChild(root);

  var messagesEl = panel.querySelector('#ab-messages');
  var inputEl = panel.querySelector('#ab-input');
  var sendBtn = panel.querySelector('#ab-send');
  var closeBtn = panel.querySelector('#ab-close');
  var headerName = panel.querySelector('#ab-header-name');

  // ── Helpers ──
  function addMessage(role, text) {
    var div = document.createElement('div');
    div.className = 'ab-msg ab-msg-' + role;
    if (role === 'bot') {
      div.innerHTML = '<div class="ab-msg-avatar">' + svgBot + '</div><div class="ab-msg-bubble">' + escapeHtml(text) + '</div>';
    } else {
      div.innerHTML = '<div class="ab-msg-bubble">' + escapeHtml(text) + '</div>';
    }
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return div;
  }

  function showTyping() {
    var div = document.createElement('div');
    div.className = 'ab-msg ab-msg-bot';
    div.id = 'ab-typing';
    div.innerHTML = '<div class="ab-msg-avatar">' + svgBot + '</div><div class="ab-msg-bubble"><div class="ab-typing"><span></span><span></span><span></span></div></div>';
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function hideTyping() {
    var el = document.getElementById('ab-typing');
    if (el) el.remove();
  }

  function escapeHtml(t) {
    var d = document.createElement('div');
    d.textContent = t;
    return d.innerHTML;
  }

  // ── API ──
  function fetchConfig() {
    fetch(API_BASE + '/widget/config', { headers: { 'X-API-Key': API_KEY } })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        config = data;
        headerName.textContent = data.widget_name || 'Support';
      })
      .catch(function () {});
  }

  function sendMessage(text) {
    if (isLoading || !text.trim()) return;
    isLoading = true;
    sendBtn.disabled = true;
    addMessage('user', text);
    showTyping();

    var body = { message: text };
    if (conversationId) body.conversation_id = conversationId;

    fetch(API_BASE + '/widget/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': API_KEY },
      body: JSON.stringify(body),
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        hideTyping();
        conversationId = data.conversation_id;
        addMessage('bot', data.answer || 'Sorry, something went wrong.');
      })
      .catch(function () {
        hideTyping();
        addMessage('bot', 'Sorry, I couldn\'t connect. Please try again.');
      })
      .finally(function () {
        isLoading = false;
        sendBtn.disabled = false;
        inputEl.focus();
      });
  }

  // ── Events ──
  bubble.addEventListener('click', function () {
    isOpen = !isOpen;
    if (isOpen) {
      panel.classList.add('open');
      bubble.innerHTML = svgX;
      if (messagesEl.children.length === 0) {
        fetchConfig();
        setTimeout(function () {
          addMessage('bot', config.widget_welcome || 'Hi! How can I help you?');
        }, 300);
      }
      inputEl.focus();
    } else {
      panel.classList.remove('open');
      bubble.innerHTML = svgChat;
    }
  });

  closeBtn.addEventListener('click', function () {
    isOpen = false;
    panel.classList.remove('open');
    bubble.innerHTML = svgChat;
  });

  inputEl.addEventListener('input', function () {
    sendBtn.disabled = !inputEl.value.trim() || isLoading;
  });

  inputEl.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      var text = inputEl.value;
      inputEl.value = '';
      sendBtn.disabled = true;
      sendMessage(text);
    }
  });

  sendBtn.addEventListener('click', function () {
    var text = inputEl.value;
    inputEl.value = '';
    sendBtn.disabled = true;
    sendMessage(text);
  });

  // Initial config fetch
  fetchConfig();
})();
