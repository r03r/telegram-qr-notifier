# Telegram QR Notifier

Este chatbot te avisa por Telegram cada vez que alguien escanea tu código QR y lleva un contador de escaneos persistente usando Vercel KV.

## Requisitos

1. **Telegram Bot Token**: Crea un bot con [@BotFather](https://t.me/botfather) y obtén el token.
2. **Cuenta de Vercel**: Para desplegar el proyecto.
3. **Vercel KV**: Configura una base de datos KV en tu proyecto de Vercel.

## Instalación y Despliegue

1. **Subir a GitHub**: Sube este repositorio a tu cuenta de GitHub.
2. **Importar en Vercel**: Importa el repositorio en Vercel.
3. **Configurar Variables de Entorno**:
   - `TELEGRAM_TOKEN`: El token que te dio BotFather.
   - `TELEGRAM_CHAT_ID`: Tu ID de chat (puedes obtenerlo usando el comando `/start` una vez configurado el webhook).
4. **Configurar el Webhook**:
   Una vez desplegado, debes decirle a Telegram dónde enviar las actualizaciones. Visita esta URL en tu navegador (reemplazando los datos):
   `https://api.telegram.org/bot<TU_TELEGRAM_TOKEN>/setWebhook?url=https://<TU_PROYECTO>.vercel.app/webhook`

## Cómo usar

1. Genera un código QR que apunte a: `https://<TU_PROYECTO>.vercel.app/scan`
2. Cuando alguien lo escanee:
   - El contador aumentará.
   - Recibirás un mensaje instantáneo en Telegram.
   - El usuario verá una página de agradecimiento.

## Estructura del Proyecto

- `/api/webhook.js`: Maneja los comandos de Telegram (como `/start`).
- `/api/scan.js`: Punto de entrada del código QR. Notifica y cuenta.
- `vercel.json`: Configuración de rutas para Vercel.
