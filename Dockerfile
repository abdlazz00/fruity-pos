*(Perintah ini akan membuat file SQLite, menjalankan migrasi tabel POS kamu, mengisi data seeder, lalu menyalakan server Apache).*

### Langkah 5: Klik Deploy!
Klik tombol **Create Web Service**. 
Tunggu sekitar 5-10 menit. Render akan memproses `Dockerfile`, menginstal PHP dan Node.js, serta mem-*build* file React/Vite kamu. 

Kalau indikatornya sudah hijau, URL demo Fruity POS kamu sudah siap dikunjungi! Kalau aplikasinya *loading* agak lama saat pertama kali dibuka, itu wajar karena versi gratis Render akan "tidur" jika tidak adaSiapp, kita gaskan pakai Render! Pilihan yang oke karena *dashboard*-nya sangat rapi dan gampang dipahami.

Tapi ada satu hal penting yang perlu kamu tahu: berbeda dengan Node.js atau Python, Render **tidak punya dukungan bawaan (native) untuk PHP**. Jadi, agar project Fruity POS kamu yang berbasis Laravel dan React/Inertia ini bisa berjalan di Render, kita wajib menggunakan **Docker**.

Jangan khawatir, kamu cuma perlu menambahkan satu file ke dalam projectmu. Berikut adalah panduan lengkapnya:

### Langkah 1: Buat File `Dockerfile`
Buat satu file baru tanpa ekstensi dengan nama persis `Dockerfile` di direktori utama (root) project `fruity-pos` kamu[cite: 1]. Isi dengan kode berikut:
```dockerfile
# Gunakan image PHP 8.2 dengan Apache
FROM php:8.2-apache

# Aktifkan mod_rewrite Apache (wajib untuk Laravel)
RUN a2enmod rewrite

# Ubah document root Apache ke folder public Laravel
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# Install dependensi sistem (termasuk Node.js untuk build frontend)
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libzip-dev \
    zip \
    unzip \
    curl \
    && curl -fsSL [https://deb.nodesource.com/setup_20.x](https://deb.nodesource.com/setup_20.x) | bash - \
    && apt-get install -y nodejs \
    && docker-php-ext-install pdo pdo_mysql zip gd

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copy seluruh file project ke dalam container
WORKDIR /var/www/html
COPY . .

# Install dependensi PHP dan Node.js, lalu build frontend (Inertia/React)
RUN composer install --no-dev --optimize-autoloader
RUN npm install
RUN npm run build

# Atur permission agar Laravel bisa menulis file log/cache
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache