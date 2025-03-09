# Performance Test dengan JMeter

Repositori ini berisi pengujian performa API menggunakan Apache JMeter.

## 🛠️ Setup

1. **Download & Install JMeter**
   - Unduh JMeter dari [Apache JMeter](https://jmeter.apache.org/download_jmeter.cgi)
   - Ekstrak dan tambahkan JMeter ke PATH jika perlu

2. **Clone Repository**
   ```bash
   git clone https://github.com/An-Ra/Fkt-jmter.git
   cd Fkt-jmter
   ```

3. **Persiapkan Test Plan**
   - Pastikan file `Api Performance Foklatech.jmx` ada di dalam direktori proyek
   - Buat direktori hasil jika belum ada: `mkdir Results`

## 🚀 Menjalankan Pengujian

Jalankan perintah berikut untuk melakukan pengujian:

```bash
jmeter -n -t Api\ Performance\ Foklatech.jmx -l test-dir/report.csv -e -o Results/
```

## 📊 Hasil & Statistik

Laporan hasil pengujian akan tersedia dalam bentuk statistik dan grafik di direktori `Results/`. Berikut contoh hasil yang bisa diisi nanti:

<img width="1411" alt="image" src="https://github.com/user-attachments/assets/7e885d4c-3582-44a5-a9e5-9b10a234b895" />

*Gambar 1:Data hasil pengujian JMeter.*
<img width="1374" alt="image" src="https://github.com/user-attachments/assets/c503747a-7140-4415-9362-e36e9d9981be" />
*Gambar 2:Ringkasan Error Hasil Pengujian.*
<img width="1405" alt="image" src="https://github.com/user-attachments/assets/387e3227-879e-48c7-84f6-fa77f354417f" />
*Gambar 3:Chart TPS.*

<img width="289" alt="image" src="https://github.com/user-attachments/assets/8e2381fe-fe6d-4ce6-8e99-da0c42fcffde" />

*Gambar 4:Queue Request.*


## 🔎 Temuan

- **Endpoint POST `/api/report`** memiliki validasi hanya 60 request dalam satu waktu, selebihnya akan error **429 Too Many Requests**.
- **100% error 429 Too Many Requests** saat batas request terlampaui.
- Dari **140 request gagal**, dengan rate **3.3 request/detik**, API baru bisa menerima request kembali setelah **42.42 detik**.
- **Throughput tanpa error** berada di **0.84 request/detik**.
- Jika **100 request dikirim dalam 1 detik**, beberapa request mengalami kegagalan dalam satu antrian

## 💡 Insight & Solusi

- Implementasi **queue system** untuk menangani **race condition**, sehingga request yang melebihi batas tetap dapat diproses secara antrian.

