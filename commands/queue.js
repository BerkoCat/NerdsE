const { MessageEmbed } = require("discord.js");
const { LOCALE } = require("../util/EvobotUtil");
const i18n = require("i18n");

i18n.setLocale(LOCALE);

module.exports = {
  name: "queue",
  cooldown: 5,
  aliases: ["q"],
  description: i18n.__("queue.description"),
  async execute(message) {
    const permissions = message.channel.permissionsFor(message.client.user);
    if (!permissions.has(["MANAGE_MESSAGES", "ADD_REACTIONS"]))
      return message.reply(i18n.__("queue.missingPermissionMessage"));

    const queue = message.client.queue.get(message.guild.id);
    if (!queue) return message.channel.send(i18n.__("queue.errorNotQueue"));

    let currentPage = 0;
    const embeds = generateQueueEmbed(message, queue.songs);

    const queueEmbed = await message.channel.send(
      `**${i18n.__mf("queue.currentPage")} ${currentPage + 1}/${embeds.length}**`,
      embeds[currentPage]
    );

    try {
      for (const emoji of ["⬅️", "⏹", "➡️"]) {
        await queueEmbed.react(emoji);
      }
    } catch (error) {
      console.error(error);
      message.channel.send(error.message).catch(console.error);
    }

    const filter = (reaction, user) =>
      ["⬅️", "⏹", "➡️"].includes(reaction.emoji.name) && message.author.id === user.id;
    const collector = queueEmbed.createReactionCollector(filter, { time: 60000 });

    collector.on("collect", async (reaction, user) => {
      try {
        if (reaction.emoji.name === "➡️" && currentPage < embeds.length - 1) {
          currentPage++;
        } else if (reaction.emoji.name === "⬅️" && currentPage !== 0) {
          --currentPage;
        } else {
          collector.stop();
          reaction.message.reactions.removeAll();
        }

        queueEmbed.edit(
          `**${i18n.__mf("queue.currentPage")} ${currentPage + 1}/${embeds.length}**`,
          embeds[currentPage]
        );

        await reaction.users.remove(message.author.id);
      } catch (error) {
        console.error(error);
        return message.channel.send(error.message).catch(console.error);
      }
    });
  }
};

function generateQueueEmbed(message, queue) {
  const embeds = [];
  const itemsPerPage = 10;

  for (let i = 0; i < queue.length; i += itemsPerPage) {
    const current = queue.slice(i, i + itemsPerPage);
    const info = current.map((track, index) => `${i + index + 1} - [${track.title}](${track.url})`).join("\n");

    const embed = new MessageEmbed()
      .setTitle(i18n.__("queue.embedTitle"))
      .setThumbnail(message.guild.iconURL())
      .setColor("#F8AA2A")
      .setDescription(
        i18n.__mf("queue.embedCurrentSong", { title: queue[0].title, url: queue[0].url, info })
      )
      .setTimestamp();
    embeds.push(embed);
  }

  return embeds;
}
