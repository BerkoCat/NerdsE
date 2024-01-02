const { canModifyQueue, LOCALE } = require("../util/EvobotUtil");
const i18n = require("i18n");
const { MessageEmbed } = require("discord.js");

i18n.setLocale(LOCALE);

module.exports = {
  name: "skip",
  aliases: ["s"],
  description: i18n.__("skip.description"),
  execute(message) {
    const queue = message.client.queue.get(message.guild.id);

    if (!queue) {
      return message.reply(i18n.__("skip.errorNotQueue")).catch(console.error);
    }

    if (!canModifyQueue(message.member)) {
      return message.reply(i18n.__("common.errorNotChannel"));
    }

    queue.playing = true;
    queue.connection.dispatcher.end();

    const skipEmbed = new MessageEmbed()
      .setColor("#3498DB") // Blue color for a cool vibe
      .setDescription(`⏭️ ${i18n.__mf("skip.result", { author: message.author })}`);

    message.channel.send(skipEmbed).catch(console.error);
  }
};
