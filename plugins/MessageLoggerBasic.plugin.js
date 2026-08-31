/**
 * @name MessageKeeper
 * @author YourName
 * @version 1.2.0
 * @description Silinen mesajları sohbet akışı içinde kırmızı renk ve ikonla gösterir.
 */

module.exports = class MessageKeeper {
    constructor() {
        this.name = "MessageKeeper";
        this.messages = new Map();
        this.deletedMessages = new Map();
        this.unsubscribers = [];
    }

    start() {
        try {
            this.injectStyles();
            this.registerEvents();

            MelowApi.UI.showToast(
                "MessageKeeper aktif. Silinen mesajlar sohbet içinde gösterilecek.",
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
            .message-keeper-deleted {
                color: #ed4245 !important;
            }
            .message-keeper-icon {
                margin-left: 6px;
                font-size: 14px;
                vertical-align: middle;
                cursor: pointer;
            }
        `);
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

        this.renderInChat(deleted);
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

    renderInChat(message) {
        // Eğer mesaj DOM üzerindeyse (şu an ekranda göriniyorsa) doğrudan bulup kırmızı yapabiliriz
        const messageElement = document.querySelector(`[data-message-id="${message.id}"]`);
        if (messageElement) {
            const contentElement = messageElement.querySelector("[id^='message-content-'], .messageContent-2qWWQC, [class*='messageContent']");
            if (contentElement && !contentElement.classList.contains("message-keeper-deleted")) {
                contentElement.classList.add("message-keeper-deleted");
                
                const emojiSpan = document.createElement("span");
                emojiSpan.className = "message-keeper-icon";
                emojiSpan.textContent = "🙁";
                emojiSpan.title = `Silinme zamanı: ${new Date(message.deletedAt).toLocaleTimeString()}`;
                contentElement.appendChild(emojiSpan);
            }
        } else {
            // Eğer DOM'da o an görünmüyorsa MelowApi arayüzü ile bilgi verilebilir
            MelowApi.UI.showToast(
                `${message.author?.username ?? "Birisi"}: "${message.content}" mesajını sildi.`,
                {type: "warning", timeout: 4000}
            );
        }
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

        MelowApi.DOM.removeStyle("message-keeper-styles");
        MelowApi.Patcher.unpatchAll(this.name);

        MelowApi.Logger.info(this.name, "Plugin durduruldu.");
    }
};
