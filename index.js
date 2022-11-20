require('isomorphic-fetch')
require('dotenv').config()
require('node-cron')

const cron = require('node-cron')

const TelegramBot = require('node-telegram-bot-api')

const telegramToken = process.env.TELEGRAM_API_KEY
const meitres = process.env.MEITRES

const bot = new TelegramBot(telegramToken, { polling: true })

const meitresList = JSON.parse(meitres);

for(let meitre of meitresList) {
	const isActive = meitre.active;
	const name = meitre.name;
	const daysToCheck = meitre.daysToCheck;
	
	if(isActive) {
		console.log("Buscando (" + meitre.pollingCron + ") disponibilidad de " + (meitre.type === "dinner" ? "cena" : "almuerzo") +  " en " + name + " para los próximos " + daysToCheck + " días");
	
		cron.schedule(meitre.pollingCron, async () => {
			let messages = [];
			let message = ''
			try {
				const meitreId = meitre.id;
				const url = meitre.link;
				const chatId = meitre.chatId;
				const peopleAmount = meitre.peopleAmount;
				const type = meitre.type;
				
				const headers = new Headers({
				  "Accept": "application/json, text/plain, */*",
				  "Accept-Language": "es-419,es;q=0.9,en;q=0.8",
				  "Origin": url,
				  "Referrer": url
				});
				
				const dateRes = await fetch(`https://api.meitre.com/api/calendar-availability-new/${meitreId}/${peopleAmount}/${type}`, { method: 'GET', headers: headers})
				const { calendarInfo } = await dateRes.json()
				
				const dates = calendarInfo.filter(date => parseInt(date.isAvailable))

				const sendWhenNotAvailable = meitre.sendWhenNotAvailable;
				
				if (!dates.length) {
					console.log("No hay turnos disponibles en " + name);
					
					if(sendWhenNotAvailable) {
						console.log("Enviando disponibilidad de " + name);
						message = 'No hay turnos disponibles en ' + name + '\n'
						bot.sendMessage(chatId, message)
					}
				}
				else {
					message = 'Disponibilidad: \n'
					for (let {date} of dates) {
						const d = new Date(date)
						
						if(isLinkExpiryDateWithinRange(d, daysToCheck)) {
							const slotsRes = await fetch(
								`https://api.meitre.com/api/search-all-hours/en/${peopleAmount}/${d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate()}/dinner/${meitreId}`
							)
							const slots = await slotsRes.json()
							message += `${d.getDate()}/${(d.getMonth() + 1)}/${d.getFullYear()}\n`

							for (let slot of slots.center.slots) {
								if(message.length > 4000) {
									messages.push(message);
									message = "";
								}
								message += `    ${slot.hour}\n`
							}
						}
					}
					
					message += `\n\nLink: ${url}\n`
					messages.push(message);
					
					console.log("Enviando disponibilidad de " + name + " para los próximos " + daysToCheck + " días");
					for(message of messages) {
						bot.sendMessage(chatId, message)
					}
				}
			}
			catch (e) {
				message += `Error: ${e.message}`
				bot.sendMessage(chatId, message)
			}
		})
	}
}

function isLinkExpiryDateWithinRange(then, daysToCheck) {
	const now = new Date();

	const msBetweenDates = Math.abs(then.getTime() - now.getTime());

	// 👇️ convert ms to days                 hour   min  sec   ms
	const daysBetweenDates = msBetweenDates / (24 * 60 * 60 * 1000);

	if (daysBetweenDates < daysToCheck) {
	  return true;
	}
	return false;
}

function getChatId(msg) {
  return process.env.CHAT_ID || msg.chat.id
}
