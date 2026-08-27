/**
 * @name MessageLoggerBasic
 * @description Silinen mesajları gösteren basit bir plugin.
 * @version 1.0.0
 * @author SeninAdın
 * @source https://github.com/seninrepo
 */

module.exports = class MessageLoggerBasic {
    // Plugin başlatıldığında çalışacak
    start() {
        // Discord'un mesaj silme olayını yakala
        this.handleMessageDelete = this.handleMessageDelete.bind(this);
        
        // Discord'un Webpack modüllerini bul
        const MessageStore = BdApi.Webpack.getModule(
            m => m?.getMessage && m?.getMessages
        );
        
        const ChannelStore = BdApi.Webpack.getModule(
            m => m?.getChannel && m?.getChannels
        );
        
        const UserStore = BdApi.Webpack.getModule(
            m => m?.getUser && m?.getUsers
        );
        
        // Bunları plugin instance'ına kaydet
        this.MessageStore = MessageStore;
        this.ChannelStore = ChannelStore;
        this.UserStore = UserStore;
        
        // Discord'un mesaj silme olayını dinle
        this.dispatcher = BdApi.Webpack.getModule(
            m => m?.subscribe && typeof m.subscribe === 'function'
        );
        
        if (this.dispatcher) {
            this.dispatcher.subscribe('MESSAGE_DELETE', this.handleMessageDelete);
        }
        
        console.log('[MessageLoggerBasic] Plugin başlatıldı!');
    }
    
    // Mesaj silme olayı yakalandığında
    handleMessageDelete(data) {
        try {
            // Silinen mesajın ID'si ve kanal ID'si
            const messageId = data.id;
            const channelId = data.channelId;
            
            // Mesajı ve kanalı bul (Discord'un cache'inden)
            const channel = this.ChannelStore?.getChannel(channelId);
            const message = this.MessageStore?.getMessage(channelId, messageId);
            
            if (!message) {
                // Mesaj cache'de yoksa (Discord zaten silmiş)
                console.log('[MessageLoggerBasic] Mesaj cache\'de bulunamadı (çok eski veya Discord tarafından silinmiş)');
                return;
            }
            
            // Mesajı yazan kullanıcıyı bul
            const author = this.UserStore?.getUser(message.authorId);
            const authorName = author ? author.username : 'Bilinmeyen Kullanıcı';
            
            // Silinen mesajın içeriği
            const content = message.content || '(Boş mesaj veya dosya)';
            
            // Mesajı bildirim olarak göster
            BdApi.UI.showToast(
                `🗑️ ${authorName} silinen mesaj: "${content}"`,
                {
                    type: 'warning',
                    icon: '🗑️',
                    timeout: 8000 // 8 saniye göster
                }
            );
            
            // Konsola da yaz
            console.log(`[MessageLoggerBasic] ${authorName} sildi: ${content}`);
            console.log(`   Kanal: #${channel?.name || 'bilinmiyor'}`);
            console.log(`   Mesaj ID: ${messageId}`);
            
        } catch (error) {
            console.error('[MessageLoggerBasic] Hata:', error);
        }
    }
    
    // Plugin durdurulduğunda (devre dışı bırakıldığında)
    stop() {
        if (this.dispatcher && this.handleMessageDelete) {
            this.dispatcher.unsubscribe('MESSAGE_DELETE', this.handleMessageDelete);
        }
        console.log('[MessageLoggerBasic] Plugin durduruldu!');
    }
}
