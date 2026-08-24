/**
 * @name MelowTools
 * @author MelowDiscord
 * @description Kullanıcı profillerinde cihaz bilgisi (telefon/bilgisayar) gösterir.
 * @version 2.0.0
 */

module.exports = class MelowTools {
    constructor(meta) {
        this.meta = meta;
        this.styleId = "melowtools-style";
        this.observer = null;
        this.processedUsers = new WeakSet();
    }

    start() {
        this.injectStyle();
        this.startObserving();

        BdApi.showToast("MelowTools aktif edildi! Cihaz bilgileri gösteriliyor.", {
            type: "success"
        });

        console.log("[MelowTools] Plugin başlatıldı.");
    }

    stop() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }

        BdApi.DOM.removeStyle(this.styleId);
        this.processedUsers = new WeakSet();

        BdApi.showToast("MelowTools devre dışı bırakıldı.", {
            type: "info"
        });

        console.log("[MelowTools] Plugin durduruldu.");
    }

    startObserving() {
        // Ana konteyneri gözlemle
        const targetNode = document.querySelector('[class*="chat"]') || document.body;
        
        this.observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.addedNodes.length > 0) {
                    this.processNewNodes(mutation.addedNodes);
                }
            }
        });

        this.observer.observe(targetNode, {
            childList: true,
            subtree: true
        });

        // Mevcut kullanıcıları işle
        this.processExistingUsers();
    }

    processNewNodes(nodes) {
        for (const node of nodes) {
            if (node.nodeType === Node.ELEMENT_NODE) {
                // Kullanıcı profillerini bul
                const userProfiles = node.querySelectorAll('[class*="username"], [class*="displayName"], [class*="userInfo"]');
                for (const profile of userProfiles) {
                    this.processUserProfile(profile);
                }
                
                // Direkt olarak node kendisi bir profil olabilir
                if (node.matches && node.matches('[class*="username"], [class*="displayName"]')) {
                    this.processUserProfile(node);
                }
            }
        }
    }

    processExistingUsers() {
        const userElements = document.querySelectorAll('[class*="username"], [class*="displayName"], [class*="userInfo"]');
        for (const element of userElements) {
            this.processUserProfile(element);
        }
    }

    processUserProfile(element) {
        if (this.processedUsers.has(element)) return;
        
        // Kullanıcının mesajını bul
        const messageContainer = element.closest('[class*="message"]');
        if (!messageContainer) return;

        // Cihaz bilgisini al
        const deviceInfo = this.getDeviceInfo(messageContainer);
        if (!deviceInfo) return;

        // Cihaz ikonunu ekle
        this.addDeviceIcon(element, deviceInfo);
        this.processedUsers.add(element);
    }

    getDeviceInfo(messageContainer) {
        // Discord'un cihaz bilgisi için kullandığı class'lar
        const mobileIndicator = messageContainer.querySelector('[class*="mobile"]');
        const webIndicator = messageContainer.querySelector('[class*="web"]');
        const desktopIndicator = messageContainer.querySelector('[class*="desktop"]');

        if (mobileIndicator || messageContainer.textContent.includes('Mobil')) {
            return { type: 'mobile', label: 'Telefon', icon: '📱' };
        } else if (webIndicator || messageContainer.textContent.includes('Web')) {
            return { type: 'web', label: 'Web', icon: '🌐' };
        } else if (desktopIndicator || messageContainer.textContent.includes('Masaüstü')) {
            return { type: 'desktop', label: 'Bilgisayar', icon: '🖥️' };
        }

        // Alternatif olarak, mesajın yanındaki platform göstergesini kontrol et
        const platformBadge = messageContainer.querySelector('[class*="platform"]');
        if (platformBadge) {
            const text = platformBadge.textContent.toLowerCase();
            if (text.includes('mobile') || text.includes('telefon')) {
                return { type: 'mobile', label: 'Telefon', icon: '📱' };
            } else if (text.includes('web') || text.includes('tarayıcı')) {
                return { type: 'web', label: 'Web', icon: '🌐' };
            } else {
                return { type: 'desktop', label: 'Bilgisayar', icon: '🖥️' };
            }
        }

        return null;
    }

    addDeviceIcon(element, deviceInfo) {
        // Zaten icon eklenmiş mi kontrol et
        if (element.querySelector('.melowtools-device-icon')) return;

        const iconSpan = document.createElement('span');
        iconSpan.className = 'melowtools-device-icon';
        iconSpan.setAttribute('data-device', deviceInfo.type);
        iconSpan.title = `Bu kullanıcı ${deviceInfo.label} kullanıyor`;
        
        // İkon ve etiket
        iconSpan.innerHTML = `
            <span style="margin-right: 4px;">${deviceInfo.icon}</span>
            <span class="melowtools-device-label" style="font-size: 11px; opacity: 0.7;">${deviceInfo.label}</span>
        `;

        // Stil ekle
        iconSpan.style.cssText = `
            display: inline-flex;
            align-items: center;
            margin-left: 8px;
            font-size: 12px;
            background: var(--background-secondary-alt);
            padding: 2px 8px;
            border-radius: 12px;
            opacity: 0.8;
            transition: all 0.2s ease;
        `;

        // Hover efekti
        iconSpan.addEventListener('mouseenter', () => {
            iconSpan.style.opacity = '1';
            iconSpan.style.transform = 'scale(1.05)';
        });

        iconSpan.addEventListener('mouseleave', () => {
            iconSpan.style.opacity = '0.8';
            iconSpan.style.transform = 'scale(1)';
        });

        element.appendChild(iconSpan);
    }

    injectStyle() {
        BdApi.DOM.addStyle(this.styleId, `
            .melowtools-device-icon {
                display: inline-flex !important;
                align-items: center !important;
                margin-left: 8px !important;
                font-size: 12px !important;
                background: var(--background-secondary-alt) !important;
                padding: 2px 8px !important;
                border-radius: 12px !important;
                opacity: 0.8 !important;
                transition: all 0.2s ease !important;
                cursor: default !important;
                user-select: none !important;
            }

            .melowtools-device-icon:hover {
                opacity: 1 !important;
                transform: scale(1.05) !important;
            }

            .melowtools-device-icon[data-device="mobile"] {
                border-left: 2px solid #3ba55c !important;
            }

            .melowtools-device-icon[data-device="web"] {
                border-left: 2px solid #5865f2 !important;
            }

            .melowtools-device-icon[data-device="desktop"] {
                border-left: 2px solid #faa61a !important;
            }

            .melowtools-device-label {
                font-size: 11px !important;
                opacity: 0.7 !important;
                margin-left: 2px !important;
            }

            /* Responsive tasarım */
            @media (max-width: 768px) {
                .melowtools-device-label {
                    display: none !important;
                }
                .melowtools-device-icon {
                    padding: 2px 6px !important;
                    font-size: 14px !important;
                }
            }
        `);
    }

    getSettingsPanel() {
        const panel = document.createElement("div");
        panel.style.cssText = `
            padding: 20px;
            max-width: 600px;
            margin: 0 auto;
        `;

        panel.innerHTML = `
            <div style="text-align: center; margin-bottom: 30px;">
                <h2 style="color: var(--header-primary);">🛠️ MelowTools</h2>
                <p style="color: var(--text-secondary);">Kullanıcı cihaz bilgilerini gösteren gelişmiş plugin</p>
            </div>

            <div style="background: var(--background-secondary); padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                <h3 style="color: var(--header-primary); margin-bottom: 15px;">📱 Cihaz Bilgileri</h3>
                <div style="display: flex; gap: 15px; flex-wrap: wrap; justify-content: center;">
                    <div style="background: var(--background-tertiary); padding: 10px 15px; border-radius: 8px; border-left: 3px solid #3ba55c;">
                        <span style="font-size: 20px;">📱</span>
                        <span style="color: var(--text-normal);">Telefon</span>
                    </div>
                    <div style="background: var(--background-tertiary); padding: 10px 15px; border-radius: 8px; border-left: 3px solid #5865f2;">
                        <span style="font-size: 20px;">🌐</span>
                        <span style="color: var(--text-normal);">Web</span>
                    </div>
                    <div style="background: var(--background-tertiary); padding: 10px 15px; border-radius: 8px; border-left: 3px solid #faa61a;">
                        <span style="font-size: 20px;">🖥️</span>
                        <span style="color: var(--text-normal);">Bilgisayar</span>
                    </div>
                </div>
            </div>

            <div style="background: var(--background-secondary); padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                <h3 style="color: var(--header-primary); margin-bottom: 15px;">⚙️ Ayarlar</h3>
                <button id="melowtools-test-button" style="
                    background: var(--brand-experiment);
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                    transition: all 0.2s;
                    width: 100%;
                ">
                    🔔 Test Bildirimi Göster
                </button>
            </div>

            <div style="background: var(--background-secondary); padding: 20px; border-radius: 12px;">
                <h3 style="color: var(--header-primary); margin-bottom: 10px;">📊 İstatistikler</h3>
                <p style="color: var(--text-secondary);">Şu anda ${document.querySelectorAll('.melowtools-device-icon').length} kullanıcı cihaz bilgisi gösteriliyor.</p>
                <p style="color: var(--text-muted); font-size: 12px; margin-top: 10px;">ℹ️ Plugin otomatik olarak yeni mesajları ve kullanıcıları tespit eder.</p>
            </div>
        `;

        panel.querySelector("#melowtools-test-button").addEventListener("click", () => {
            BdApi.showToast("✅ MelowTools başarıyla çalışıyor!", {
                type: "success"
            });
        });

        return panel;
    }
};
