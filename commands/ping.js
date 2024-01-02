const { LOCALE } = require("../util/EvobotUtil");
const i18n = require("i18n");
i18n.setLocale(LOCALE);
module.exports = {
  name: "ping",
  cooldown: 10,
  description: i18n.__("ping.description"),
  execute(message) {
    const pingEmbed = {
      color: 0x0099ff,
      title: i18n.__("Ping Pong"),
      description: i18n.__mf("ping.result", { ping: Math.round(message.client.ws.ping) }),
    };
    message.channel.send({ embed: pingEmbed }).catch(console.error);
  }
};