const { Client, LocalAuth } = require("whatsapp-web.js")
const qrcode = require("qrcode-terminal")
const Parser = require("rss-parser")

const parser = new Parser()

const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: "./session"
    }),
    puppeteer: {
        executablePath: "/usr/bin/google-chrome",
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
    }
})

client.on("qr", qr => {
    console.log("Escaneia o QR no WhatsApp")
    qrcode.generate(qr, { small: true })
})

client.on("ready", () => {
    console.log("Bot ligado")
    checkRSS()
})

client.initialize()

let lastLink = null
let firstRun = true

async function checkRSS() {

    setInterval(async () => {

        try {

            const feed = await parser.parseURL("https://pt.ign.com/news.xml")
            const latest = feed.items[0]

            if (latest.link !== lastLink) {

                if (firstRun) {
                    lastLink = latest.link
                    firstRun = false
                    return
                }

                lastLink = latest.link

                const chats = await client.getChats()
                const group = chats.find(c => c.name === "Cãimbras FC")

                if (group) {
                    group.sendMessage(latest.link)
                    console.log("Notícia enviada:", latest.link)
                }

            }

        } catch (err) {
            console.log("Erro RSS:", err)
        }

    }, 300000)

}
