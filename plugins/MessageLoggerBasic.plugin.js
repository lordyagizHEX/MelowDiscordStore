/**
 * @name MessageKeeper
 * @author YourName
 * @version 1.2.0
 * @description Silinen mesajları MelowApi Events ile kaydeder ve BetterDiscord MessageLogger tarzında gösterir.
 */

module.exports = class MessageKeeper {
    constructor() {
        this.name = "MessageKeeper";
        this.messages = new Map();
        this.deletedMessages = new Map();
        this.unsubscribers = [];
        this.root = null;
    }

    start() {
        try {
            this.injectStyles();
            this.createPanel();
            this.registerEvents();

            MelowApi.UI.showToast(
                "MessageKeeper aktif. Silinen mesajlar kaydedilecek.",
                {type: "success", timeout: 3000}
            );

            MelowApi.Logger.info(this.name, "Plugin başlatıldı.");
        }
        catch (error) {
            MelowApi.Logger.error(this.name, "Başlatma hatası:", error);
            MelowApi.UI.showToast("MessageKeeper başlatılamadı.", {
                type: "error",
                timeout: 3000
            });
        }
    }

    injectStyles() {
        MelowApi.DOM.addStyle("message-keeper-styles", `
            #message-keeper-panel {
                position: fixed;
                right: 18px;
                bottom: 18px;
                width: min(420px, calc(100vw - 36px));
                max-height: min(60vh, 600px);
                overflow-y: auto;
                z-index: 10000;
                display: flex;
                flex-direction: column;
                padding: 8px 0;
                border-radius: 8px;
                background: var(--background-primary, #313338);
                box-shadow: 0 8px 24px rgba(0, 0, 0, .4);
                pointer-events: auto;
            }

            #message-keeper-panel:empty {
                display: none;
            }

            /* BetterDiscord MessageLogger tarzı silinmiş mesaj */
            .message-keeper-card {
                position: relative;
                display: flex;
                gap: 16px;
                padding: 2px 48px 2px 16px;
                margin: 1px 0;
                background: rgba(240, 71, 71, .15);
                box-shadow: inset 2px 0 0 #f04747;
                font-family: inherit;
            }

            .message-keeper-card:hover {
                background: rgba(240, 71, 71, .2);
            }

            .message-keeper-avatar {
                flex: 0 0 40px;
                width: 40px;
                height: 40px;
                margin-top: 4px;
                border-radius: 50%;
                object-fit: cover;
                background: var(--background-secondary, #2b2d31);
            }

            .message-keeper-body {
                min-width: 0;
                padding: 2px 0;
            }

            .message-keeper-header {
                display: flex;
                align-items: baseline;
                gap: 8px;
                line-height: 1.375;
            }

            .message-keeper-author {
                color: var(--header-primary, #f2f3f5);
                font-size: 16px;
                font-weight: 500;
            }

            .message-keeper-time {
                color: var(--text-muted, #949ba4);
                font-size: 12px;
            }

            .message-keeper-content {
                color: #f04747;
                white-space: pre-wrap;
                overflow-wrap: anywhere;
                font-size: 16px;
                line-height: 1.375;
            }

            .message-keeper-remove {
                position: absolute;
                top: 4px;
                right: 8px;
                display: none;
                border: 0;
                border-radius: 4px;
                padding: 2px 8px;
                color: #fff;
                background: #f04747;
                font-size: 12px;
                cursor: pointer;
            }

            .message-keeper-card:hover .message-keeper-remove {
                display: block;
            }
        `);
    }

    createPanel() {
        this.root = document.createElement("div");
        this.root.id = "message-keeper-panel";
        document.body.append(this.root);
    }

    registerEvents() {
        this.unsubscribers.push(
            MelowApi.Events.on("MESSAGE_CREATE", event => {
                this.cacheMessage(event?.message ?? event);
            })
        );

        this.unsubscribers.push(
            MelowApi.Events.on("MESSAGE_UPDATE", event => {
                this.cacheMessage(event?.message ?? event);
            })
        );

        this.unsubscribers.push(
            MelowApi.Events.on("MESSAGE_DELETE", event => {
                this.handleDelete(event);
            })
        );

        this.unsubscribers.push(
            MelowApi.Events.on("MESSAGE_DELETE_BULK", event => {
                this.handleBulkDelete(event);
            })
        );
    }

    cacheMessage(message) {
        if (!message?.id) return;

        const previous = this.messages.get(message.id);

        this.messages.set(message.id, {
            id: message.id,
            channelId: message.channel_id ?? message.channelId ?? previous?.channelId,
            content: message.content ?? previous?.content ?? "",
            author: message.author ?? previous?.author ?? null,
            timestamp: message.timestamp ?? previous?.timestamp ?? Date.now()
        });
    }

    handleDelete(event) {
        const messageId = event?.id ?? event?.messageId ?? event?.message_id;
        if (!messageId || this.deletedMessages.has(messageId)) return;

        const cached = this.messages.get(messageId);
        const message = event?.message ?? cached;

        if (!message) {
            MelowApi.Logger.debug(
                this.name,
                "Silinen mesaj cache içinde bulunamadı:",
                messageId
            );
            return;
        }

        const deleted = {
            ...message,
            id: messageId,
            deletedAt: Date.now()
        };

        this.deletedMessages.set(messageId, deleted);
        this.messages.delete(messageId);

        this.renderDeletedMessage(deleted);

        MelowApi.UI.showToast(
            `${deleted.author?.username ?? "Birisi"} bir mesaj sildi.`,
            {type: "warning", timeout: 3000}
        );
    }

    handleBulkDelete(event) {
        const ids = event?.ids ?? event?.messageIds ?? event?.message_ids ?? [];

        for (const id of ids) {
            this.handleDelete({
                id,
                channelId: event?.channelId ?? event?.channel_id
            });
        }
    }

    getAvatarUrl(author) {
        if (!author?.id) return "https://cdn.discordapp.com/embed/avatars/0.png";

        if (author.avatar) {
            return `https://cdn.discordapp.com/avatars/${author.id}/${author.avatar}.png?size=80`;
        }

        let index = 0;
        try {
            index = Number((BigInt(author.id) >> 22n) % 6n);
        }
        catch {
            index = 0;
        }

        return `https://cdn.discordapp.com/embed/avatars/${index}.png`;
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        const today = new Date();
        const time = date.toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"});

        return date.toDateString() === today.toDateString()
            ? `Bugün saat ${time}`
            : `${date.toLocaleDateString()} ${time}`;
    }

    renderDeletedMessage(message) {
        if (!this.root || this.root.querySelector(`[data-message-id="${message.id}"]`)) {
            return;
        }

        const card = document.createElement("div");
        card.className = "message-keeper-card";
        card.dataset.messageId = message.id;

        const avatar = document.createElement("img");
        avatar.className = "message-keeper-avatar";
        avatar.src = this.getAvatarUrl(message.author);
        avatar.alt = "";

        const body = document.createElement("div");
        body.className = "message-keeper-body";

        const header = document.createElement("div");
        header.className = "message-keeper-header";

        const author = document.createElement("span");
        author.className = "message-keeper-author";
        author.textContent = message.author?.global_name
            ?? message.author?.username
            ?? "Bilinmeyen kullanıcı";

        const time = document.createElement("span");
        time.className = "message-keeper-time";
        time.textContent = this.formatTime(message.timestamp ?? message.deletedAt);

        const content = document.createElement("div");
        content.className = "message-keeper-content";
        content.textContent = message.content || "[Metin içeriği yok]";

        const remove = document.createElement("button");
        remove.className = "message-keeper-remove";
        remove.textContent = "Sil";
        remove.onclick = () => this.permanentlyDelete(message.id);

        header.append(author, time);
        body.append(header, content);
        card.append(avatar, body, remove);
        this.root.prepend(card);
    }

    permanentlyDelete(messageId) {
        this.deletedMessages.delete(messageId);
        this.root?.querySelector(`[data-message-id="${messageId}"]`)?.remove();

        MelowApi.UI.showToast("Kayıt kalıcı olarak kaldırıldı.", {
            type: "info",
            timeout: 2000
        });
    }

    stop() {
        for (const unsubscribe of this.unsubscribers) {
            try {
                unsubscribe?.();
            }
            catch (error) {
                MelowApi.Logger.error(this.name, "Listener temizleme hatası:", error);
            }
        }

        this.unsubscribers = [];
        this.messages.clear();
        this.deletedMessages.clear();

        this.root?.remove();
        this.root = null;

        MelowApi.DOM.removeStyle("message-keeper-styles");
        MelowApi.Patcher.unpatchAll(this.name);

        MelowApi.Logger.info(this.name, "Plugin durduruldu.");
    }
};
