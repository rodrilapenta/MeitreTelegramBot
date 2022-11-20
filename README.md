# Meitre Telegram bot
Bot de Telegram que notifica por un chat sobre cuándo hay disponibilidad en sitios que usen el sistema de reservación [Meitre](https://meitre.com)

Para funcionar requiere de un archivo `.env` con las siguientes variables (se provee un ejemplo en el repositorio):

- `MEITRES`: una lista JSON con cada uno de los lugares sobre los cuales consultar disponibilidad; de cada uno se deberá proveer:
    - `active(true/false)`: flag para apagar/encender el polling sobre el elemento
	- `id`: id del lugar en Meitre; para conocer el id de algún lugar en particular, se debe abrir el sitio web del lugar, ir a consultar turnos y revisar en la consola (en Network) un request con la siguiente estructura → [https://api.meitre.com/api/calendar-availability-new/**ID DEL LUGAR**/CANTIDAD DE PERSONAS/LUNCH O DINNER](https://api.meitre.com/api/calendar-availability-new/ID-DEL-LUGAR/CANTIDAD-DE-PERSONAS/LUNCH-O-DINNER)
	- `name`: el nombre del lugar, para usarse al enviar la notificación
	- `link`: la URL del lugar, simplemente para enviar el link en la notificación y facilitar al usuario el ingreso haciendo click
	- `sendWhenNotAvailable(true/false)`: true para que el bot envíe notificación también cuando no hay disponibilidad, false para lo opuesto
	- `daysToCheck`: cantidad de días para revisar disponibilidad; tener en cuenta que cuantos más días se pidan, más tiempo tardará el bot en consultar ya que implica más API calls
	- `chatId`: ID (Telegram) del chat donde debe notificar el bot; **IMPORTANTE**: el bot debe ser administrador para poder enviar mensajes si se hace en un canal
	- `pollingCron`: cron expression que definirá cada cuánto se consultará la disponibilidad para el lugar; ejemplo: */60 * * * * * (cada 60 segundos)
	- `type(dinner/lunch)`: lunch para **almuerzo**, dinner para **cena**; **NOTA**: si se quiere consultar ambos, se debe agregar 2 elementos a la lista idénticos pero con distinto type (uno con dinner y otro con lunch)
	- `peopleAmount`: cantidad de personas para las que se quiere reservar
- `TELEGRAM_API_KEY`: API Key provista por Telegram (se consigue creando un nuevo bot hablándole por Telegram a [BotFather](https://t.me/BotFather))
	
Si encontrás algún error o querés contribuir, podés forkear el proyecto o crear un Issue :D
