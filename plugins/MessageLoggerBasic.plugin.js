/**
 * @name MessageKeeper
 * @author YourName
 * @version 1.1.0
 * @description Silinen mesajları MelowApi Events ile kaydeder ve kırmızı kartlar halinde gösterir.
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
                width: min(380px, calc(100vw - 36px));
                max-height: min(60vh, 600px);
                overflow-y: auto;
                z-index: 10000;
                display: flex;
                flex-direction: column;
                gap: 8px;
                pointer-events: auto;
            }

            .message-keeper-card {
                position: relative;
                padding: 12px;
                border: 2px solid #ed4245;
                border-radius: 8px;
                background: color-mix(in srgb, #ed4245 14%, var(--background-floating, #1e1f22));
                box-shadow: 0 6px 20px rgba(0, 0, 0, .35);
                color: var(--text-normal, #f2f3f5);
                font-family: inherit;
            }

            .message-keeper-title {
                color: #ff7b82;
                font-size: 12px;
                font-weight: 700;
                margin-bottom: 6px;
            }

            .message-keeper-author {
                color: var(--header-secondary, #b5bac1);
                font-size: 12px;
                margin-bottom: 6px;
            }

            .message-keeper-content {
                white-space: pre-wrap;
                overflow-wrap: anywhere;
                font-size: 13px;
                line-height: 1.4;
            }

            .message-keeper-time {
                color: var(--text-muted, #949ba4);
                font-size: 11px;
                margin-top: 8px;
            }

            .message-keeper-remove {
                position: absolute;
                top: 8px;
                right: 8px;
                border: 0;
                border-radius: 4px;
                padding: 3px 7px;
                color: white;
                background: #ed4245;
                cursor: pointer;
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

        this.messages.set(message.id, {
            id: message.id,
            channelId: message.channel_id ?? message.channelId,
            content: message.content ?? "",
            author: message.author ?? null,
            timestamp: message.timestamp ?? Date.now()
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

    renderDeletedMessage(message) {
        if (!this.root || this.root.querySelector(`[data-message-id="${message.id}"]`)) {
            return;
        }

        const card = document.createElement("div");
        card.className = "message-keeper-card";
        card.dataset.messageId = message.id;

        const remove = document.createElement("button");
        remove.className = "message-keeper-remove";
        remove.textContent = "Sil";
        remove.onclick = () => this.permanentlyDelete(message.id);

        const title = document.createElement("div");
        title.className = "message-keeper-title";
        title.textContent = "🗑️ SİLİNEN MESAJ";

        const author = document.createElement("div");
        author.className = "message-keeper-author";
        author.textContent = `👤 ${message.author?.username ?? "Bilinmeyen kullanıcı"}`;

        const content = document.createElement("div");
        content.className = "message-keeper-content";
        content.textContent = message.content || "[Metin içeriği yok]";

        const time = document.createElement("div");
        time.className = "message-keeper-time";
        time.textContent = `Silinme zamanı: ${new Date(message.deletedAt).toLocaleString()}`;

        card.append(remove, title, author, content, time);
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
