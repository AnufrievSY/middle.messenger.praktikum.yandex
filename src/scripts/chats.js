(function () {
    function escapeHtml(s) {
        return String(s)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    function getChatIdFromUrl() {
        const sp = new URLSearchParams(window.location.search);
        return sp.get("chat");
    }

    function xhrGetJson(url) {
        return new Promise(function (resolve, reject) {
            const xhr = new XMLHttpRequest();
            xhr.open("GET", url, true);
            xhr.responseType = "json";
            xhr.onload = function () {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve(xhr.response ?? []);
                } else {
                    reject(new Error("HTTP " + xhr.status));
                }
            };
            xhr.onerror = function () {
                reject(new Error("Network error"));
            };
            xhr.send();
        });
    }

    function renderEmpty() {
        const panel = document.getElementById("chat-panel");
        if (!panel) return;
        panel.innerHTML = '<div class="chat-empty">Select chat</div>';
    }

    function renderChatHeader(chat) {
        const avatar = chat.avatar || ("/data/users/" + chat.id + "avatar.jpg");
        return `
      <div class="chat__header">
        <img class="chat__header__avatar" src="${escapeHtml(avatar)}" alt="Изображение пользователя ${escapeHtml(chat.title_name)}" />
        <div class="chat__header_title_name">${escapeHtml(chat.title_name)}</div>
        <div class="chat__header_settings"></div>
      </div>
    `;
    }

    function renderMessages(messages) {
        if (!Array.isArray(messages) || messages.length === 0) {
            return `<div class="chat__body_empty">No messages</div>`;
        }

        return `
      <div class="chat__body_messages">
        ${messages.map(function (m) {
            const cls = m.isMine ? "message--mine" : "message--their";
            return `
            <div class="message ${cls}">
              <div class="message__text">${escapeHtml(m.text ?? "")}</div>
              <div class="message__time">${escapeHtml(m.time ?? "")}</div>
            </div>
          `;
        }).join("")}
      </div>
    `;
    }

    function renderInput() {
        return `
      <form class="chat__input" novalidate>
        <input class="chat__input_message" name="message" type="text" placeholder="Message" />
        <button class="chat__input_send_message" type="submit"></button>
      </form>
    `;
    }

    function setActiveChatLink(chatId) {
        document.querySelectorAll(".chat-item").forEach(function (el) {
            if (String(el.getAttribute("data-chat-id")) === String(chatId)) {
                el.classList.add("chat-item--active");
            } else {
                el.classList.remove("chat-item--active");
            }
        });
    }

    async function loadAndRender(chatId) {
        const panel = document.getElementById("chat-panel");
        if (!panel) return;

        const chats = window.__CHATS__ || [];
        const chat = chats.find(function (c) { return String(c.id) === String(chatId); });

        if (!chat) {
            renderEmpty();
            return;
        }

        setActiveChatLink(chatId);

        panel.innerHTML = renderChatHeader(chat) + `<div class="chat__body"><div class="chat__body_loading">Loading...</div></div>` + renderInput();

        const userId = window.__USER_ID__ ?? 0;
        const url = `/data/users/${userId}/messages/${chatId}.json`;

        try {
            const messages = await xhrGetJson(url);
            const body = panel.querySelector(".chat__body");
            if (body) body.innerHTML = renderMessages(messages);
        } catch (e) {
            const body = panel.querySelector(".chat__body");
            if (body) body.innerHTML = `<div class="chat__body_empty">Failed to load messages</div>`;
            // eslint-disable-next-line no-console
            console.error(e);
        }
    }

    function goToChat(chatId) {
        const sp = new URLSearchParams(window.location.search);
        sp.set("chat", chatId);
        const nextUrl = window.location.pathname + "?" + sp.toString();
        history.pushState({ chatId: chatId }, "", nextUrl);
        loadAndRender(chatId);
    }

    document.addEventListener("click", function (e) {
        const a = e.target.closest(".chat-item");
        if (!a) return;

        e.preventDefault();
        const chatId = a.getAttribute("data-chat-id");
        if (!chatId) return;
        goToChat(chatId);
    });

    window.addEventListener("popstate", function () {
        const chatId = getChatIdFromUrl();
        if (chatId) loadAndRender(chatId);
        else renderEmpty();
    });

    // initial
    const initialChatId = getChatIdFromUrl();
    if (initialChatId) loadAndRender(initialChatId);
    else renderEmpty();
})();
