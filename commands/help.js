const { MessageEmbed } = require("discord.js");
const { support_server } = require("../config.json");
const { LOCALE } = require("../util/EvobotUtil");
const i18n = require("i18n");

i18n.setLocale(LOCALE);

module.exports = {
  name: "help",
  aliases: ["h"],
  description: i18n.__("help.description"),
  execute(message) {
    let commands = message.client.commands.array();

    let helpEmbed = new MessageEmbed()
      .setAuthor(`${message.client.user.username}`, message.client.user.displayAvatarURL({ format: "png" }))
      .setTitle(`🚀 **${i18n.__mf("help.embedTitle", { botname: message.client.user.username })}**`)
      .setColor("#3498db") // Blue color for a futuristic look
      .setDescription(`Greetings, space explorer! 🌌 **${i18n.__("help.embedDescription")}** Ready to unleash my full potential? 🌟`)
      .setThumbnail("https://example.com/cool-bot-gif.gif") // Replace with a cool GIF or image
      .setFooter(`Requested by ${message.author.username}`, message.author.displayAvatarURL({ format: "png" }))
      .setTimestamp();

    commands.forEach((cmd) => {
      helpEmbed.addField(
        `**${message.client.prefix}${cmd.name}**`,
        `**Description:** ${cmd.description}\n**Aliases:** ${cmd.aliases ? `\`${cmd.aliases.join("`, `")}\`` : "None"}`,
        true
      );
    });

    helpEmbed.addFields(
      {
        name: "**Links!**",
        value: `**[Support Server](${support_server || "https://discord.gg/HMEKZdEExZ"}) • [Invite Me!](https://discord.com/oauth2/authorize?client_id=${message.client.user.id}&permissions=70282305&scope=bot)**`,
      },
      {
        name: "**Need more help?**",
        value: "🛸 Join our support server for intergalactic assistance and updates! 🌠",
      }
    );

    return message.channel.send(helpEmbed).catch(console.error);
  }
};
