module.exports = {
  name: 'changeprefix',
  description: 'Change the bot\'s prefix for this server',
<<<<<<< HEAD
  aliases: ["cp"],
=======
>>>>>>> bc5da24c0e258893db6ed0e94ba585bdf35fbd20
  execute(message, args, serverPrefixes, DEFAULT_PREFIX) {
    if (!message.member.permissions.has('ADMINISTRATOR')) {
      return message.reply('You do not have the required permissions to use this command.');
    }

    if (!args.length) {
      return message.reply(`Please provide a new prefix. To reset to the default prefix (${DEFAULT_PREFIX}), use "${DEFAULT_PREFIX}" as the new prefix.`);
    }

    if (args[0].toLowerCase() === 'default') {
      serverPrefixes.delete(message.guild.id);
      return message.reply(`Prefix has been reset to the default: ${DEFAULT_PREFIX}`);
    }

    const newPrefix = args[0];
    serverPrefixes.set(message.guild.id, newPrefix);

    return message.reply(`Prefix has been updated to ${newPrefix}`);
  },
};
