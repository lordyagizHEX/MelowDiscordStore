/**
 * @name HelloKittyUI
 * @version 1.0.0
 * @author MelowDiscord
 * @description MelowDiscord için sevimli imleç, sohbet süsleri, bildirimler ve medya HUD'u.
 */

'use strict';

const kittyImage = "https://i.ibb.co/nq8ZcnpN/resim.png";

const manifest = {
    name: "HelloKittyUI",
    version: "1.0.0",
    author: "MelowDiscord",
    description: "MelowDiscord arayüzüne sevimli pembe dokunuşlar ekler."
};

const {React, Data, DOM, Webpack} = new BdApi(manifest.name);

const defaults = {
    normalCursor: true,
    hoverCursor: true,
    decorations: true,
    chatBubbles: true,
    notificationSound: false,
    chatEffects: true,
    typingIndicator: true,
    musicHud: true
};

const settingLabels = {
    normalCursor: ["Özel imleç", "Normal imleci pembe fiyonk temasına uyarlar."],
    hoverCursor: ["Etkileşim imleci", "Buton ve bağlantılarda yıldızlı imleç kullanır."],
    decorations: ["Sohbet süsleri", "Mesaj alanına bulut, fiyonk, yıldız ve kalp ekler."],
    chatBubbles: ["Sohbet balonları", "Normal sohbet mesajlarını Hello Kitty tarzı balonlarda gösterir."],
    notificationSound: ["Mesaj sesi", "Yeni bir mesaj geldiğinde kısa bir ses çalar."],
    chatEffects: ["Sohbet efektleri", "Gönderim animasyonu ve pembe reaction vurgusu ekler."],
    typingIndicator: ["Yazıyor süsü", "Yazıyor göstergesine küçük bir kalp ekler."],
    musicHud: ["Spotify mini oynatıcı", "Çalan Spotify parçasını köşede gösterir."]
};

const cursor = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Cpath d='M3 2l19 19-8 1-4 8z' fill='%23fff' stroke='%23b84c78' stroke-width='1.7' stroke-linejoin='round'/%3E%3Cpath d='M22 3c-4-2-8 2-5 6l5 2 2-5zM22 11l-5 2c-3 4 1 8 5 6l3-4z' fill='%23f48ab4' stroke='%23b84c78' stroke-width='1.3'/%3E%3Ccircle cx='21' cy='10' r='1' fill='%23fff'/%3E%3C/svg%3E\") 2 2, auto";
const hoverCursor = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Cpath d='M3 2l19 19-8 1-4 8z' fill='%23fff' stroke='%23b84c78' stroke-width='1.7' stroke-linejoin='round'/%3E%3Cpath d='M22 3c-4-2-8 2-5 6l5 2 2-5zM22 11l-5 2c-3 4 1 8 5 6l3-4z' fill='%23f48ab4' stroke='%23b84c78' stroke-width='1.3'/%3E%3Cpath d='M7 3v3M5.5 4.5h3' stroke='%23df6597' stroke-width='1.2'/%3E%3C/svg%3E\") 2 2, pointer";

const styles = `
body.hkui-cursor-enabled, body.hkui-cursor-enabled *:not(input):not(textarea):not([contenteditable="true"]):not(a):not(button):not([role="button"]):not([tabindex]) { cursor: ${cursor} !important; }
body.hkui-hover-enabled a, body.hkui-hover-enabled button, body.hkui-hover-enabled [role="button"], body.hkui-hover-enabled [tabindex]:not([tabindex="-1"]) { cursor: ${hoverCursor} !important; }
.hkui-composer-host { position: relative !important; }
.hkui-decoration { position: absolute; z-index: 2; top: -13px; right: 16px; padding: 1px 7px; border: 1px solid rgba(232, 121, 165, .32); border-radius: 999px; background: color-mix(in srgb, var(--background-secondary) 86%, #f7c5d9); color: #dc6595; font-size: 13px; line-height: 18px; pointer-events: none; animation: hkui-float 3s ease-in-out infinite; }
.hkui-inline-bubble { position: relative !important; display: inline-block !important; width: fit-content; min-width: min(180px, 60vw); max-width: min(560px, 72vw); margin: 8px 0 13px 0 !important; padding: 14px 26px 14px 20px !important; overflow: visible !important; border: 2px solid #ed70a2 !important; border-radius: 7px 23px 23px 23px !important; background: linear-gradient(105deg, #ffe4ef 0%, #fff8fb 54%, #ffddeb 100%) !important; color: #291328 !important; box-shadow: 0 0 14px rgba(239, 91, 156, .25), inset 0 1px 5px rgba(255, 255, 255, .9) !important; font-size: 15px !important; line-height: 1.5 !important; overflow-wrap: anywhere; }
.hkui-inline-bubble::before { position: absolute; bottom: -14px; left: -17px; z-index: 2; display: block; width: 38px; height: 38px; border-radius: 50%; background: #fff0f6 url("${kittyImage}") center/contain no-repeat; content: ""; filter: drop-shadow(0 2px 4px rgba(180, 72, 119, .28)); }
.hkui-inline-bubble::after { position: absolute; top: -17px; right: 3px; color: #d95791; content: "🎀"; font-size: 22px; filter: drop-shadow(0 2px 3px rgba(180, 72, 119, .2)); }
body.hkui-chat-bubbles-enabled [id^="chat-messages-"] [class*="username"] { color: #f04fa6 !important; }
.hkui-music-hud { position: fixed; z-index: 9998; right: 18px; bottom: 18px; display: grid; grid-template-columns: 58px minmax(0, 1fr); align-items: center; gap: 12px; width: min(360px, calc(100vw - 36px)); padding: 11px 14px 11px 11px; border: 1px solid color-mix(in srgb, #e879a5 28%, var(--background-modifier-accent)); border-radius: 15px; background: color-mix(in srgb, var(--background-secondary) 93%, #f7c5d9); color: var(--header-primary); box-shadow: 0 10px 30px rgba(26, 18, 22, .24); backdrop-filter: blur(18px); }
.hkui-music-cover { display: grid; place-items: center; width: 58px; height: 58px; overflow: hidden; border-radius: 10px; background: #f3b6cd; color: #b64f7a; font-size: 20px; object-fit: cover; box-shadow: 0 3px 10px rgba(102, 44, 69, .18); }
.hkui-music-copy { display: grid; min-width: 0; gap: 3px; }
.hkui-music-eyebrow { display: flex; align-items: center; gap: 5px; color: var(--text-muted); font-size: 9px; font-weight: 700; letter-spacing: .6px; text-transform: uppercase; }
.hkui-music-dot { width: 6px; height: 6px; border-radius: 50%; background: #1ed760; box-shadow: 0 0 8px rgba(30, 215, 96, .5); }
.hkui-music-title { overflow: hidden; color: var(--header-primary); font-size: 13px; font-weight: 700; text-overflow: ellipsis; text-decoration: none; white-space: nowrap; }
.hkui-music-title:hover { color: #c85887; }
.hkui-music-artist { overflow: hidden; color: var(--text-muted); font-size: 11px; text-overflow: ellipsis; white-space: nowrap; }
.hkui-music-progress-row { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: 8px; margin-top: 3px; }
.hkui-music-track { height: 3px; overflow: hidden; border-radius: 4px; background: var(--background-modifier-accent); }
.hkui-music-progress { width: 0; height: 100%; border-radius: inherit; background: #df6597; transition: width 900ms linear; }
.hkui-music-time { color: var(--text-muted); font-size: 9px; font-variant-numeric: tabular-nums; }
body.hkui-chat-enabled [class*="reaction"] { border-color: rgba(225, 105, 154, .28); border-radius: 9px; transition: background-color 120ms ease, border-color 120ms ease, transform 120ms ease; }
body.hkui-chat-enabled [class*="reaction"]:hover { border-color: #e879a5; background: rgba(232, 121, 165, .14); transform: translateY(-1px); }
.hkui-send-pop { position: relative !important; }
.hkui-send-pop::after { position: absolute; z-index: 5; top: -15px; right: 38px; color: #e879a5; content: "♡  ✦"; font-size: 17px; pointer-events: none; animation: hkui-send 520ms ease-out both; }
body.hkui-typing-enabled [class*="typing"]::after { display: inline-block; margin-left: 4px; color: #df6597; content: "♡"; animation: hkui-heart 1s ease-in-out infinite; }
.hkui-settings { display: grid; gap: 8px; max-width: 640px; padding: 8px; }
.hkui-settings-title { margin: 0 0 5px; color: var(--header-primary); font-size: 18px; }
.hkui-setting { display: flex; align-items: center; gap: 11px; padding: 10px 12px; border: 1px solid color-mix(in srgb, #e879a5 30%, var(--background-modifier-accent)); border-radius: 8px; background: color-mix(in srgb, var(--background-secondary) 95%, #f7c5d9); cursor: pointer; }
.hkui-setting input { width: 16px; height: 16px; accent-color: #df6597; }
.hkui-setting-copy { display: grid; gap: 2px; }
.hkui-setting-name { color: var(--header-primary); font-size: 13px; font-weight: 600; }
.hkui-setting-note { color: var(--text-muted); font-size: 11px; }
@keyframes hkui-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
@keyframes hkui-send { 0% { opacity: 0; transform: translateY(6px) scale(.8); } 35% { opacity: 1; } 100% { opacity: 0; transform: translateY(-14px) scale(1.1); } }
@keyframes hkui-heart { 0%, 100% { transform: scale(.9); opacity: .65; } 50% { transform: scale(1.15); opacity: 1; } }
@media (prefers-reduced-motion: reduce) { .hkui-decoration, .hkui-send-pop::after, body.hkui-typing-enabled [class*="typing"]::after { animation: none; } }
@media (max-width: 480px) { .hkui-inline-bubble { min-width: min(145px, 55vw); max-width: 68vw; padding: 11px 21px 11px 16px !important; font-size: 14px !important; } .hkui-music-hud { right: 10px; bottom: 10px; width: calc(100vw - 20px); } }
`;

class HelloKittyUI {
    constructor() {
        this.settings = {...defaults, ...(Data.load("settings") || {})};
        this.observer = null;
        this.musicTimer = null;
        this.musicHud = null;
        this.musicTrackKey = null;
        this.musicElements = null;
        this.dispatcher = null;
        this.dispatcherSubscribed = false;
        this.timeouts = new Set();
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onMutations = this.onMutations.bind(this);
        this.onMessageCreate = this.onMessageCreate.bind(this);
    }

    getSettingsPanel() {
        const plugin = this;
        function SettingsPanel() {
            const [settings, setSettings] = React.useState({...plugin.settings});
            return React.createElement("section", {className: "hkui-settings"},
                React.createElement("h2", {className: "hkui-settings-title"}, "🎀 Hello Kitty görünümü"),
                Object.entries(settingLabels).map(([key, [label, note]]) => React.createElement("label", {
                    className: "hkui-setting",
                    key
                }, React.createElement("input", {
                    type: "checkbox",
                    checked: !!settings[key],
                    disabled: key === "notificationSound" && !settings.chatBubbles,
                    onChange: event => {
                        const next = {...settings, [key]: event.currentTarget.checked};
                        setSettings(next);
                        plugin.settings = next;
                        Data.save("settings", next);
                        plugin.applySettings();
                    }
                }), React.createElement("span", {className: "hkui-setting-copy"},
                    React.createElement("span", {className: "hkui-setting-name"}, label),
                    React.createElement("span", {className: "hkui-setting-note"}, note)
                )))
            );
        }
        return React.createElement(SettingsPanel);
    }

    start() {
        DOM.addStyle("HelloKittyUI", styles);
        document.addEventListener("keydown", this.onKeyDown, true);
        this.applySettings();
    }

    applySettings() {
        const body = document.body;
        body.classList.toggle("hkui-cursor-enabled", this.settings.normalCursor);
        body.classList.toggle("hkui-hover-enabled", this.settings.hoverCursor);
        body.classList.toggle("hkui-chat-enabled", this.settings.chatEffects);
        body.classList.toggle("hkui-chat-bubbles-enabled", this.settings.chatBubbles);
        body.classList.toggle("hkui-typing-enabled", this.settings.typingIndicator);

        if (this.settings.chatBubbles && this.settings.notificationSound && !this.dispatcherSubscribed) {
            this.dispatcher = Webpack.getByKeys("dispatch", "subscribe", {searchExports: true});
            if (this.dispatcher?.subscribe) {
                this.dispatcher.subscribe("MESSAGE_CREATE", this.onMessageCreate);
                this.dispatcherSubscribed = true;
            }
        } else if ((!this.settings.chatBubbles || !this.settings.notificationSound) && this.dispatcherSubscribed) {
            this.dispatcher.unsubscribe("MESSAGE_CREATE", this.onMessageCreate);
            this.dispatcherSubscribed = false;
            this.dispatcher = null;
        }

        const needsObserver = this.settings.decorations || this.settings.chatBubbles;
        if (needsObserver && !this.observer && document.body) {
            this.observer = new MutationObserver(this.onMutations);
            this.observer.observe(document.body, {childList: true, subtree: true});
            this.refreshDecorations();
            this.refreshChatBubbles();
        } else if (!needsObserver && this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }

        if (!this.settings.decorations) {
            document.querySelectorAll(".hkui-decoration").forEach(element => element.remove());
            document.querySelectorAll(".hkui-composer-host").forEach(element => element.classList.remove("hkui-composer-host"));
        }
        if (!this.settings.chatBubbles) document.querySelectorAll(".hkui-inline-bubble").forEach(element => element.classList.remove("hkui-inline-bubble"));

        if (this.settings.musicHud && !this.musicTimer) {
            this.musicHud = document.createElement("aside");
            this.musicHud.className = "hkui-music-hud";
            this.musicHud.hidden = true;
            this.musicHud.setAttribute("aria-live", "polite");
            document.body.appendChild(this.musicHud);
            this.updateMusicHud();
            this.musicTimer = setInterval(() => this.updateMusicHud(), 4000);
        } else if (!this.settings.musicHud && this.musicTimer) {
            clearInterval(this.musicTimer);
            this.musicTimer = null;
            this.musicHud?.remove();
            this.musicHud = null;
        }

    }

    onMutations() {
        if (this.settings.decorations) this.refreshDecorations();
        if (this.settings.chatBubbles) this.refreshChatBubbles();
    }

    refreshDecorations() {
        document.querySelectorAll('[class*="channelTextArea"]').forEach(host => {
            if (host.querySelector(":scope > .hkui-decoration")) return;
            host.classList.add("hkui-composer-host");
            const decoration = document.createElement("span");
            decoration.className = "hkui-decoration";
            decoration.textContent = "☁️  🎀  ✦  ♡";
            decoration.setAttribute("aria-hidden", "true");
            host.appendChild(decoration);
        });
    }

    refreshChatBubbles() {
        document.querySelectorAll('[id^="chat-messages-"]').forEach(message => {
            const content = message.querySelector('[class*="markup"]');
            if (content?.textContent?.trim()) content.classList.add("hkui-inline-bubble");
        });
    }

    onMessageCreate(event) {
        const message = event?.message || event?.data?.message || event;
        const authorId = message?.author?.id;
        if (!authorId) return;
        const currentUserId = Webpack.getStore("UserStore")?.getCurrentUser?.()?.id;
        if (currentUserId && authorId === currentUserId) return;

        const mentions = Array.isArray(message.mentions) ? message.mentions : [];
        const wasMentioned = !!currentUserId && (
            message.mentioned === true ||
            mentions.some(user => (typeof user === "string" ? user : user?.id) === currentUserId) ||
            (typeof message.content === "string" && new RegExp(`<@!?${currentUserId}>`).test(message.content))
        );

        const channel = message.channel_id && Webpack.getStore("ChannelStore")?.getChannel?.(message.channel_id);
        const isDirectMessage = channel
            ? channel.type === 1 || channel.type === 3
            : !message.guild_id;

        if (wasMentioned || isDirectMessage) this.playNotificationSound();
    }

    playNotificationSound() {
        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (!AudioContextClass) return;
            const context = new AudioContextClass();
            const gain = context.createGain();
            gain.gain.setValueAtTime(0.0001, context.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.045, context.currentTime + 0.025);
            gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.22);
            gain.connect(context.destination);
            for (const [index, frequency] of [880, 1174].entries()) {
                const oscillator = context.createOscillator();
                oscillator.type = "sine";
                oscillator.frequency.value = frequency;
                oscillator.connect(gain);
                oscillator.start(context.currentTime + index * 0.1);
                oscillator.stop(context.currentTime + index * 0.1 + 0.09);
            }
            setTimeout(() => context.close(), 400);
        } catch {}
    }

    onKeyDown(event) {
        if (!this.settings.chatEffects || !(event.target instanceof HTMLTextAreaElement)) return;
        if (event.key !== "Enter" || event.shiftKey || event.isComposing) return;
        const composer = event.target.closest('[class*="channelTextArea"]');
        if (!composer || !event.target.value.trim()) return;
        composer.classList.remove("hkui-send-pop");
        void composer.offsetWidth;
        composer.classList.add("hkui-send-pop");
        const timeout = setTimeout(() => {
            composer.classList.remove("hkui-send-pop");
            this.timeouts.delete(timeout);
        }, 600);
        this.timeouts.add(timeout);
    }

    updateMusicHud() {
        if (!this.musicHud) return;
        try {
            const userId = Webpack.getStore("UserStore")?.getCurrentUser?.()?.id;
            const activity = userId && Webpack.getStore("SpotifyStore")?.getActivity?.(userId);
            if (!activity || !activity.details) {
                this.musicHud.hidden = true;
                this.musicTrackKey = null;
                return;
            }

            this.musicHud.hidden = false;
            const image = activity.assets?.large_image?.replace(/^spotify:/, "");
            const syncId = activity.syncId || activity.sync_id;
            const trackKey = [syncId, activity.details, activity.state, image].join("|");
            if (trackKey !== this.musicTrackKey) {
                this.musicTrackKey = trackKey;
                this.musicHud.replaceChildren();
                if (image) {
                    const cover = document.createElement("img");
                    cover.className = "hkui-music-cover";
                    cover.src = `https://i.scdn.co/image/${encodeURIComponent(image)}`;
                    cover.alt = "";
                    cover.onerror = () => { cover.replaceWith(this.makeMusicFallback()); };
                    this.musicHud.appendChild(cover);
                } else {
                    this.musicHud.appendChild(this.makeMusicFallback());
                }
                const copy = document.createElement("span");
                copy.className = "hkui-music-copy";
                const eyebrow = document.createElement("span");
                eyebrow.className = "hkui-music-eyebrow";
                const dot = document.createElement("span");
                dot.className = "hkui-music-dot";
                const platform = document.createElement("span");
                platform.textContent = "NOW PLAYING · SPOTIFY";
                eyebrow.append(dot, platform);
                const title = document.createElement("a");
                title.className = "hkui-music-title";
                title.target = "_blank";
                title.rel = "noopener noreferrer";
                title.textContent = activity.details;
                if (syncId) title.href = `https://open.spotify.com/track/${encodeURIComponent(syncId)}`;
                const artist = document.createElement("span");
                artist.className = "hkui-music-artist";
                artist.textContent = activity.state || activity.assets?.large_text || "Spotify'da çalıyor";
                const progressRow = document.createElement("span");
                progressRow.className = "hkui-music-progress-row";
                const track = document.createElement("span");
                track.className = "hkui-music-track";
                const progress = document.createElement("span");
                progress.className = "hkui-music-progress";
                track.appendChild(progress);
                const timer = document.createElement("span");
                timer.className = "hkui-music-time";
                progressRow.append(track, timer);
                copy.append(eyebrow, title, artist, progressRow);
                this.musicHud.appendChild(copy);
                this.musicElements = {progress, timer};
            }

            const start = activity.timestamps?.start;
            const end = activity.timestamps?.end;
            const duration = start && end ? Math.max(0, end - start) : 0;
            const elapsed = duration ? Math.min(duration, Math.max(0, Date.now() - start)) : 0;
            const percent = duration ? (elapsed / duration) * 100 : 0;
            if (this.musicElements) {
                this.musicElements.progress.style.width = `${percent}%`;
                this.musicElements.timer.textContent = duration ? `${this.formatTime(elapsed)} / ${this.formatTime(duration)}` : "♪";
            }
        } catch {
            this.musicHud.hidden = true;
        }
    }

    makeMusicFallback() {
        const cover = document.createElement("span");
        cover.className = "hkui-music-cover";
        cover.textContent = "♫";
        return cover;
    }

    formatTime(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
    }

    stop() {
        document.removeEventListener("keydown", this.onKeyDown, true);
        this.observer?.disconnect();
        this.observer = null;
        if (this.musicTimer) clearInterval(this.musicTimer);
        this.musicTimer = null;
        if (this.dispatcherSubscribed) this.dispatcher?.unsubscribe("MESSAGE_CREATE", this.onMessageCreate);
        this.dispatcherSubscribed = false;
        this.dispatcher = null;
        for (const timeout of this.timeouts) clearTimeout(timeout);
        this.timeouts.clear();
        document.body.classList.remove("hkui-cursor-enabled", "hkui-hover-enabled", "hkui-chat-enabled", "hkui-chat-bubbles-enabled", "hkui-typing-enabled");
        document.querySelectorAll(".hkui-decoration").forEach(element => element.remove());
        document.querySelectorAll(".hkui-composer-host").forEach(element => element.classList.remove("hkui-composer-host"));
        document.querySelectorAll(".hkui-inline-bubble").forEach(element => element.classList.remove("hkui-inline-bubble"));
        this.musicHud?.remove();
        DOM.removeStyle("HelloKittyUI");
    }
}

module.exports = HelloKittyUI;
