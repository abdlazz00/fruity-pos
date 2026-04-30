# Gunakan image PHP 8.3 dengan Apache
FROM php:8.3-apache

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