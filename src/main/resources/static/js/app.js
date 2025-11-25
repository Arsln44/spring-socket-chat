// Bu bizim cep telefonumuz.
// Henüz hattı açmadık, o yüzden null (kapalı).
// Bütün işlerimiz bu telefonla olacak
var stompClient = null;

function connect(){

    // → Bu, "Ben evin kapısına geldim, zile bastım" demek.
    // Java'da /stomp kapısını açmıştık ya, işte tam oraya zile basıyoruz.
    var socket = new SockJS('/stomp');


    // → Zile bastık ama Türkçe konuşuyoruz.
    // Karşı taraf sadece STOMP dilini anlıyor.
    // Bu satır şunu diyor: “Tamam, ben bu zil hattına STOMP dilini öğreteyim,
    // öyle konuşalım.
    stompClient = Stomp.over(socket);

    // → “Alo? Orada mısın? Bağlantı kuruldu mu?”
    // Eğer karşı taraf “Evet buradayım” derse, içindeki kod çalışır.
    stompClient.connect({}, function (frame) {

        console.log('Bağlandık: ' + frame);

        // UI GÜNCELLEME: Butonları değiştir (Birazdan yazacağız bu fonksiyonu)
        setConnected(true);

        // → Bu çok önemli!
        // Bu satır şunu diyor:
        // “Ben artık /topic/public kanalını dinliyorum.
        // Orada biri bir şey söylerse kulağım açık, hemen duymak istiyorum!
        stompClient.subscribe('/topic/public', function (gelenPaket) {

            // Sunucudan gelen veri "String" (JSON Yazısı) halindedir.
            // Bunu JS Nesnesine çevirmemiz lazım: JSON.parse()
            var mesajNesnesi = JSON.parse(gelenPaket.body);

            // Ekrana basma fonksiyonuna gönder (Birazdan yazacağız)
            showMessage(mesajNesnesi);
        });
    });
}

function sendMessage() {
    // HTML'DEN VERİYİ ÇEK (UI -> JS)
    // getElementById ile input kutularını buluyoruz.
    var isimKutusu = document.getElementById('name');
    var mesajKutusu = document.getElementById('message');

    // .value diyerek içindeki yazıyı alıyoruz.
    var gonderenIsim = isimKutusu.value;
    var mesajIcerigi = mesajKutusu.value;

    // → Bu satır şunu diyor:
    // “Ben sunucuya mektup yazıyorum, zarfın üstüne şunu yazdım: /app/sendMessage”
    // Java tarafında @MessageMapping("/sendMessage") vardı ya?
    // Tam olarak o zarf o metoda düşüyor!
    stompClient.send("/app/sendMessage", {}, JSON.stringify({
        'sender': gonderenIsim,
        'message': mesajIcerigi
    }));

    // TEMİZLİK
    // Mesaj gittikten sonra kutuyu temizleyelim ki yenisini yazabilsin.
    mesajKutusu.value = '';
}

function showMessage(mesaj) {
    // 1. LİSTEYİ BUL
    var listeAlani = document.getElementById('messages');

    // 2. YENİ BİR SATIR (li) OLUŞTUR
    // Havada sanal bir <li></li> etiketi yaratır.
    var yeniSatir = document.createElement('li');

    // 3. İÇİNİ DOLDUR
    // Gelen mesaj nesnesinin .sender ve .content özelliklerini yaz.
    // Örnek çıktı: <span>Ali:</span> Merhaba
    yeniSatir.innerHTML = "<span>" + mesaj.sender + ":</span> " + mesaj.message;

    // 4. LİSTEYE EKLE
    // Hazırladığımız satırı, listenin en sonuna ekle (Append).
    listeAlani.appendChild(yeniSatir);
}

function setConnected(bagliMi) {
    // bagliMi = true ise "Bağlan" butonu pasif, "Kopar" butonu aktif olsun.
    document.getElementById('connect').disabled = bagliMi;
    document.getElementById('disconnect').disabled = !bagliMi;

    // Sohbet panelini ve mesajları göster/gizle
    var chatPanel = document.getElementById('chat-panel');
    var conversationArea = document.getElementById('conversation-area');

    if (bagliMi) {
        // CSS'teki 'hidden' sınıfını kaldır -> Görünür olur.
        chatPanel.classList.remove('hidden');
        conversationArea.classList.remove('hidden');
    } else {
        // CSS'teki 'hidden' sınıfını ekle -> Gizlenir.
        chatPanel.classList.add('hidden');
        conversationArea.classList.add('hidden');
    }

    // Bağlantı değiştiğinde eski mesajları temizleyelim
    document.getElementById('messages').innerHTML = '';
}

// Bir de Bağlantıyı kesme fonksiyonu ekleyelim
function disconnect() {
    if (stompClient !== null) {
        stompClient.disconnect();
    }
    setConnected(false);
    console.log("Bağlantı kesildi");
}