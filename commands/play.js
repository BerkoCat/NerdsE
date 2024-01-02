const { play } = require("../include/play");
const ytdl = require("ytdl-core");
const YouTubeAPI = require("simple-youtube-api");
const scdl = require("soundcloud-downloader").default;
const https = require("https");
const { MessageEmbed } = require("discord.js");
const { YOUTUBE_API_KEY, SOUNDCLOUD_CLIENT_ID, LOCALE, DEFAULT_VOLUME } = require("../util/EvobotUtil");
const youtube = new YouTubeAPI(YOUTUBE_API_KEY);
const i18n = require("i18n");

i18n.setLocale(LOCALE);

module.exports = {
  name: "play",
  cooldown: 3,
  aliases: ["p"],
  description: i18n.__("play.description"),
  async execute(message, args) {
    const { channel } = message.member.voice;

    const serverQueue = message.client.queue.get(message.guild.id);
    if (!channel) return message.reply(i18n.__("play.errorNotChannel")).catch(console.error);
    if (serverQueue && channel !== message.guild.me.voice.channel)
      return message.reply(i18n.__mf("play.errorNotInSameChannel", { user: message.client.user }))
        .catch(console.error);

    if (!args.length)
      return message.reply(i18n.__mf("play.usageReply", { prefix: message.client.prefix }))
        .catch(console.error);

    const permissions = channel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT")) return message.reply(i18n.__("play.missingPermissionConnect"));
    if (!permissions.has("SPEAK")) return message.reply(i18n.__("play.missingPermissionSpeak"));

    const search = args.join(" ");
    const videoPattern = /^(https?:\/\/)?(www\.)?(m\.)?(youtube\.com|youtu\.?be)\/.+$/gi;
    const playlistPattern = /^.*(list=)([^#\&\?]*).*/gi;
    const scRegex = /^https?:\/\/(soundcloud\.com)\/(.*)$/;
    const mobileScRegex = /^https?:\/\/(soundcloud\.app\.goo\.gl)\/(.*)$/;
    const url = args[0];
    const urlValid = videoPattern.test(args[0]);

    const queueConstruct = {
      textChannel: message.channel,
      channel,
      connection: null,
      songs: [],
      loop: false,
      volume: DEFAULT_VOLUME || 100,
      playing: true
    };

    let songInfo = null;
    let song = null;

    try {
      if (urlValid) {
        songInfo = await ytdl.getInfo(url);
      } else if (scRegex.test(url)) {
        const trackInfo = await scdl.getInfo(url, SOUNDCLOUD_CLIENT_ID);
        songInfo = {
          videoDetails: {
            title: trackInfo.title,
            video_url: trackInfo.permalink_url,
            lengthSeconds: Math.ceil(trackInfo.duration / 1000)
          }
        };
      } else {
        const results = await youtube.searchVideos(search, 1, { part: "snippet" });
        songInfo = await ytdl.getInfo(results[0].url);
      }

      song = {
        title: songInfo.videoDetails.title,
        url: songInfo.videoDetails.video_url,
        duration: songInfo.videoDetails.lengthSeconds
      };
    } catch (error) {
      console.error(error);
      return message.reply(error.message).catch(console.error);
    }

    if (serverQueue) {
      serverQueue.songs.push(song);
      const playAddedEmbed = new MessageEmbed()
        .setColor("#3498db")
        .setAuthor("Music Bot", "https://example.com/music-bot-icon.png")
        .setTitle("Added to Queue 🎶")
        .setDescription(`**[${song.title}](${song.url})**\nAdded by: ${message.author}`)
        .setThumbnail("https://example.com/music-bot-thumbnail.png")
        .setFooter("Enjoy the music!", "https://example.com/music-bot-footer.png");
      return serverQueue.textChannel.send(playAddedEmbed).catch(console.error);
    }

    queueConstruct.songs.push(song);
    message.client.queue.set(message.guild.id, queueConstruct);

    try {
      queueConstruct.connection = await channel.join();
      await queueConstruct.connection.voice.setSelfDeaf(true);
      play(queueConstruct.songs[0], message);
    } catch (error) {
      console.error(error);
      message.client.queue.delete(message.guild.id);
      await channel.leave();
      return message.channel.send(i18n.__('play.cantJoinChannel', {error: error}))
        .catch(console.error);
    }
  }
};
