const { LOCALE } = require("../util/EvobotUtil");
const i18n = require("i18n");
const { MessageEmbed } = require("discord.js");

i18n.setLocale(LOCALE);

module.exports = {
  name: "invite",
  description: i18n.__('invite.description'),
  execute(message, args) {
    const permissions = 70282305;

    const inviteEmbed = new MessageEmbed()
      .setTitle("**Invite Me to Your Server!**")
      .setDescription(
        "You can invite me to your server by clicking the link below:\n\n" +
        `[**Invite Link**](https://discord.com/oauth2/authorize?client_id=908921338280943666&permissions=8&scope=bot)`
      )
      .setColor("RANDOM")
      .setFooter("Thank you for inviting me!");

    return message.channel.send(inviteEmbed);
  }
};
