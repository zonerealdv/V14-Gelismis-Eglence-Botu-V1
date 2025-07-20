# Discord Gelişmiş Eğlence Botu

Bu Discord botu, sunucunuza eğlence katmak için tasarlanmış çeşitli komutlar ve oyunlar içerir.

## Kurulum

1. `npm install` komutunu çalıştırarak gerekli paketleri yükleyin
2. `config.json` dosyasını düzenleyin:
   ```json
   {
       "token": "your_bot_token_here",
       "clientId": "your_client_id_here"
   }
   ```
3. Discord Developer Portal'dan bir bot oluşturun ve token'ı `config.json` dosyasına ekleyin
4. `node deploy-commands.js` komutunu çalıştırarak slash komutlarını kaydedin
5. `node index.js` komutu ile botu başlatın
