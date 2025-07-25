#!/bin/bash

# Script para instalar SSL con Let's Encrypt
# Ejecutar como root: sudo bash install-ssl.sh

echo "🔒 Instalando SSL para CineSnacks API..."

# Actualizar sistema
apt update && apt upgrade -y

# Instalar Certbot
apt install certbot python3-certbot-nginx -y

# Obtener certificado SSL
echo "📋 Configurando SSL para apiempresacinesnack.acstree.xyz..."
certbot --nginx -d apiempresacinesnack.acstree.xyz --non-interactive --agree-tos --email admin@acstree.xyz

# Configurar renovación automática
echo "🔄 Configurando renovación automática..."
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -

# Verificar instalación
echo "✅ Verificando certificado..."
certbot certificates

# Test de renovación
echo "🧪 Probando renovación..."
certbot renew --dry-run

echo "🎉 SSL instalado correctamente!"
echo "🌐 Tu sitio ahora es seguro: https://apiempresacinesnack.acstree.xyz"
echo "🔄 La renovación automática está configurada"

# Mostrar estado del certificado
openssl x509 -in /etc/letsencrypt/live/apiempresacinesnack.acstree.xyz/fullchain.pem -text -noout | grep -A 2 "Validity"
