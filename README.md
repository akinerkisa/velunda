# Velunda — Application & AI Security Lab

ProgrammixV eğitimi için hazırlanmış, tamamen yerel çalışan bir güvenlik laboratuvarı. **Velunda** adlı gerçekçi bir e-ticaret sitesi, alışveriş asistanı ve mobil uygulama simülasyonu içinde web, API ve AI güvenliğinin temel konularını kendi bilgisayarında denersin.

> **Uyarı:** Bu uygulama bilerek güvenlik açıkları içerir. Yalnızca kendi bilgisayarında (`127.0.0.1`) çalıştır, internete açma. Gerçek parola, kişisel bilgi veya API anahtarı girme. Burada öğrendiklerini yalnızca izin verilen sistemlerde uygula.

## Gereksinim

Python 3.10 veya üzeri.

## Kurulum ve çalıştırma

**Windows (PowerShell):**

```powershell
.\setup.ps1
.\run.ps1
```

PowerShell betik çalıştırmayı engellerse önce şunu çalıştır: `Set-ExecutionPolicy -Scope Process Bypass`

**macOS / Linux:**

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/python app.py
```

Ardından tarayıcıda `http://127.0.0.1:5000` adresini aç. Uygulamayı durdurmak için terminalde `Ctrl+C`.

## Neler var?

| Adres | İçerik |
|---|---|
| `/` | Velunda mağazası: katalog, arama, sepet, ödeme (gerçek ödeme alınmaz), hesap sayfaları |
| `/lab` | Görev panosu: web, API ve AI görevleri, hazır istekler ve canlı API konsolu |
| `/mobile` | Mobil uygulama simülasyonu ve uygulamanın attığı istekleri gösteren ağ paneli |
| `/api` | JSON API'sinin uç listesi |

Sağ alttaki **Yardım?** düğmesi Velunda alışveriş asistanını açar. Asistan, davranışı tekrarlanabilir olsun diye kurallı bir simülatördür; gerçek bir dil modeli kullanmaz.

Sayfanın üstündeki **Zafiyetli / Güvenli** anahtarı aynı uygulamanın iki halini karşılaştırır. Her görevi önce zafiyetli, sonra güvenli modda dene ve farkı yorumla.

## Demo hesaplar

Üç hesabın da parolası `demo123`:

- `demo@velunda.test`
- `mehmet@velunda.test`
- `zeynep@velunda.test`

Bunlar sentetik hesaplardır. Uygulamadaki tüm kullanıcı, sipariş ve adres bilgileri uydurmadır.

## Sıfırlama

Denemeler sırasında veritabanı bozulursa uygulamayı durdur, `instance/` klasörünü sil ve yeniden başlat. Veritabanı ilk açılışta yeniden oluşturulur.
