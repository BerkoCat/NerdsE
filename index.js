const { Client, Collection } = require("discord.js");
const { readdirSync } = require("fs");
const { join } = require("path");
const { TOKEN, PREFIX } = require("./util/EvobotUtil");
const path = require("path");
const i18n = require("i18n");
const keep_alive = require('./keep_alive.js') //UPTIME

const client = new Client({
  disableMentions: "everyone",
  restTimeOffset: 0
});

// Map to store server prefixes
const serverPrefixes = new Map();

client.login(TOKEN);
client.commands = new Collection();
client.prefix = PREFIX;
client.queue = new Map();
const cooldowns = new Collection();
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

i18n.configure({
  locales: ["en", "es", "ko", "fr", "tr", "pt_br", "zh_cn", "zh_tw"],
  directory: path.join(__dirname, "locales"),
  defaultLocale: "en",
  objectNotation: true,
  register: global,

  logWarnFn: (msg) => console.log("warn", msg),
  logErrorFn: (msg) => console.log("error", msg),
  missingKeyFn: (locale, value) => value,
  mustacheConfig: { tags: ["{{", "}}"], disable: false }
});

/**
 * Client Events
 */
client.on("ready", () => {
  console.log(`${client.user.username} is ready!![Meaning of no error]`);
  const statuses = [
    `${PREFIX}help, I Love You Guys!`,
    `${PREFIX}help, Imagine Music`,
    "NerdsE's Music BOT!",
    "NerdsE's Experiment",
    "Dannnn Wake Up",
  ];

  let index = 0;
  setInterval(() => {
    client.user.setActivity(statuses[index], { type: "PLAYING" });
    index = (index + 1) % statuses.length;
<<<<<<< HEAD
  }, 15000);
=======
  }, 9000);
>>>>>>> bc5da24c0e258893db6ed0e94ba585bdf35fbd20
});

client.on("warn", (info) => console.log(info));
client.on("error", console.error);

/**
 * Import all commands
 */
const commandFiles = readdirSync(join(__dirname, "commands")).filter((file) => file.endsWith(".js"));
for (const file of commandFiles) {
  const command = require(join(__dirname, "commands", file));
  client.commands.set(command.name, command);
}

client.on("message", async (message) => {
  // Check if the message is from a guild (server)
  if (!message.guild) return;

  // Check if the bot was mentioned
  if (message.mentions.has(client.user)) {
    const guildPrefix = serverPrefixes.get(message.guild.id) || PREFIX;
    return message.reply(`Hello <:emoji_name:1188128983234125925>, what can I help you? My prefix is ${guildPrefix}`);
  }

  // Retrieve the server prefix from the map, or use the default prefix
  const guildPrefix = serverPrefixes.get(message.guild.id) || PREFIX;

  // Check if the message starts with the server prefix
  if (!message.content.startsWith(guildPrefix)) return;

  // Parse the command and arguments
  const args = message.content.slice(guildPrefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  // Check if the command exists
  if (!client.commands.has(commandName)) return;

  // Execute the command
  const command = client.commands.get(commandName);
  command.execute(message, args, serverPrefixes, PREFIX);
});

client.login(TOKEN);
