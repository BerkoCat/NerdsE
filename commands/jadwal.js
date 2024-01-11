const { MessageEmbed } = require('discord.js');
const { PREFIX } = require('../config.json');
const schedule = require('node-schedule');
const fs = require('fs');
const moment = require('moment-timezone');

const shikimoriIconURLs = [
    'https://pbs.twimg.com/media/FrEecEZWIAI4fso.png',
    'https://i.pinimg.com/736x/3b/5e/bf/3b5ebf67687e5ddc5e6b74f3ddd1476c.jpg',
    'https://i.pinimg.com/736x/26/61/1e/26611ec0fce1c2100b9925ef327c77be.jpg',
    // ...Tambahkan lebih banyak URL ikon Shikimori jika diperlukan
];
// Define jadwalSekolah variable
const jadwalSekolah = {
    senin: '**SENIN:** MTK, SEJARAH, PKK',
    selasa: '**SELASA:** AGAMA, BINDO, MULOK, PPKN',
    rabu: '**RABU:** DESAIN, BINGG, VIDEOGRAFI',
    kamis: '**KAMIS:** PHOTOGRAFI, E.CONVERS, VIDEO',
    jumat: '**JUMAT:** PEMINATAN, DESAIN, PJOK',
};

// Fungsi untuk menyimpan notifikasi ke file
function saveNotifierData(data) {
    try {
        fs.writeFileSync('notifierData.json', JSON.stringify(data, null, 2), 'utf-8');
        console.log('Notifikasi berhasil disimpan ke notifierData.json');
    } catch (error) {
        console.error('Gagal menyimpan data notifier:', error.message);
    }
}

// Fungsi untuk memuat notifikasi dari file
function loadNotifierData() {
    try {
        const filePath = 'notifierData.json';
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf-8');
            return JSON.parse(data);
        } else {
            console.log('File not found. Returning empty object.');
            return {};
        }
    } catch (error) {
        console.error('Gagal memuat data notifier:', error.message);
        return {};
    }
}

// Map untuk menyimpan notifikasi jadwal per server
let jadwalNotifiers = loadNotifierData();

module.exports = {
    name: 'jadwal',
    description: 'Menampilkan jadwal sekolah atau mengatur/menghapus notifikasi jadwal',
    execute(message, args) {
        // Cek apakah perintah adalah 'add', 'delete', 'list', 'deleteall', atau tidak ada
        if (args[0] === 'add') {
            handleNotifierCommand(message, args, PREFIX);
        } else if (args[0] === 'delete') {
            handleDeleteCommand(message, args, PREFIX);
        } else if (args[0] === 'list') {
            handleListNotifierCommand(message);
        } else if (args[0] === 'deleteall') {
            handleDeleteAllCommand(message, PREFIX);
        } else {
            handleJadwalCommand(message, args, PREFIX);
        }
    },
};

// Fungsi untuk menangani perintah jadwal
function handleJadwalCommand(message, args, prefix) {
    const hariIni = getHariIni();
    const jadwalHariIni = jadwalSekolah[hariIni];

    if (!jadwalHariIni) {
        return message.channel.send('LIBUR WOI INGAT LIBUR BUKAN SEKOLAH.');
    }

    const embed = new MessageEmbed()
        .setColor('#3498db')
        .setTitle(`Jadwal untuk hari **${hariIni}**`)
        .setDescription(jadwalHariIni)
        .setFooter(`Ingin setup notifikasi jadwal? Gunakan: ${prefix}jadwal add <channel_mention> Hh:mm`)
        .setThumbnail(getRandomShikimoriThumbnail());

    // Mengecek apakah pengguna memberikan argumen channel
    const targetChannel = message.mentions.channels.first() || message.channel;

    // Menampilkan jadwal di channel yang ditentukan dengan menggunakan embed
    targetChannel.send(embed);
}

// Fungsi untuk menangani perintah notifier (jadwal add)
function handleNotifierCommand(message, args, prefix) {
    // Cek apakah perintah diikuti oleh argumen channel dan jam
    if (!args[1] || !args[2]) {
        return message.channel.send(`Format perintah salah. Gunakan: \`${prefix}jadwal add <channel_mention> Hh:mm\``);
    }

    const channelMention = args[1];
    const time = args[2];

    // Validasi format waktu dengan regex
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!time.match(timeRegex)) {
        return message.channel.send('Format waktu tidak valid. Gunakan format Hh:mm, misalnya 14:30.');
    }

    // Mendapatkan channel dari mention
    const targetChannel = message.mentions.channels.first();

    if (!targetChannel) {
        return message.channel.send('Channel yang dimention tidak valid.');
    }

    // Mendapatkan Map jadwalNotifier untuk server ini
    let jadwalNotifier = jadwalNotifiers[message.guild.id];

    if (!jadwalNotifier) {
        jadwalNotifier = [];
        jadwalNotifiers[message.guild.id] = jadwalNotifier;
    }

    // Menambahkan notifikasi ke dalam array jadwalNotifier
    jadwalNotifier.push({ channel: targetChannel.id, time });

    // Menjadwalkan notifikasi dengan menggunakan node-schedule
    schedule.scheduleJob({ hour: parseInt(time.split(':')[0]), minute: parseInt(time.split(':')[1]), tz: 'Asia/Jakarta' }, () => {
        handleJadwalCommand({ channel: targetChannel, mentions: { channels: { first: () => targetChannel } } }, [], PREFIX);
    });

    saveNotifierData(jadwalNotifiers); // Simpan notifikasi ke file

    message.channel.send(`Notifikasi berhasil dijadwalkan pada ${time} di channel ${targetChannel}`);
}

// Fungsi untuk menangani perintah delete
function handleDeleteCommand(message, args, prefix) {
    // Cek apakah perintah diikuti oleh argumen jam
    if (!args[1]) {
        return message.channel.send(`Format perintah delete salah. Gunakan: \`${prefix}jadwal delete Hh:mm\``);
    }

    const time = args[1];

    // Mendapatkan Map jadwalNotifier untuk server ini
    let jadwalNotifier = jadwalNotifiers[message.guild.id];

    if (!jadwalNotifier || jadwalNotifier.length === 0) {
        return message.channel.send('Tidak ada notifikasi jadwal yang diatur.');
    }

    // Menghapus notifikasi dari array jadwalNotifier berdasarkan jam
    const filteredNotifier = jadwalNotifier.filter(entry => entry.time !== time);
    jadwalNotifiers[message.guild.id] = filteredNotifier;

    saveNotifierData(jadwalNotifiers); // Simpan notifikasi ke file

    message.channel.send(`Notifikasi jadwal dihapus pada ${time}`);
}

// Fungsi untuk menangani perintah delete all
function handleDeleteAllCommand(message, prefix) {
    // Mendapatkan Map jadwalNotifier untuk server ini
    let jadwalNotifier = jadwalNotifiers[message.guild.id];

    if (!jadwalNotifier || jadwalNotifier.length === 0) {
        return message.channel.send('Tidak ada notifikasi jadwal yang diatur.');
    }

    // Menghapus semua notifikasi untuk server ini
    delete jadwalNotifiers[message.guild.id];
    saveNotifierData(jadwalNotifiers); // Simpan perubahan ke file

    message.channel.send(`Semua notifikasi jadwal dihapus.`);
}

// Fungsi untuk menangani perintah list notifier
function handleListNotifierCommand(message) {
    // Mendapatkan Map jadwalNotifier untuk server ini
    let jadwalNotifier = jadwalNotifiers[message.guild.id];

    if (!jadwalNotifier || jadwalNotifier.length === 0) {
        return message.channel.send('Tidak ada notifikasi jadwal yang diatur.');
    }

    const listEmbed = new MessageEmbed()
        .setColor('#3498db')
        .setTitle('Daftar Notifikasi Jadwal')
        .setDescription('Daftar notifikasi jadwal yang diatur.');

    jadwalNotifier.forEach((entry, index) => {
        const channel = message.guild.channels.cache.get(entry.channel);
        const channelName = channel ? channel.name : 'Unknown Channel';
        listEmbed.addField(`Notifikasi ${index + 1}`, `Channel: ${channelName} | Jam: ${entry.time}`);
    });

    message.channel.send(listEmbed);
}

// Fungsi untuk mendapatkan nama hari saat ini (dalam bahasa Indonesia)
function getHariIni() {
    const now = moment.tz('Asia/Jakarta'); // Menggunakan zona waktu Jakarta
    const days = ['minggu', 'senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'];
    return days[now.day()];
}

// Fungsi untuk mendapatkan URL thumbnail Shikimori secara acak
function getRandomShikimoriThumbnail() {
    return shikimoriIconURLs[Math.floor(Math.random() * shikimoriIconURLs.length)];
}

// Fungsi untuk mendapatkan embed Shikimori secara acak
function getRandomShikimoriEmbed() {
    return new MessageEmbed()
        .setColor('#3498db')
        .setTitle('Notifikasi Shikimori')
        .setDescription('Waktunya untuk Shikimori!')
        .setThumbnail(getRandomShikimoriThumbnail());
}
