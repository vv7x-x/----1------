const { default: makeWASocket, useSingleFileAuthState } = require('@adiwajshing/baileys');
const plugin = require('./plugin'); // عدّل المسار حسب مكان ملف البلوجين

const { state, saveState } = useSingleFileAuthState('./auth_info.json');

async function startBot() {
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true
  });

  sock.ev.on('creds.update', saveState);

  // استماع للرسائل
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;

    for (const msg of messages) {
      if (!msg.message) continue;

      // استدعاء onMessage من البلوجين
      await plugin.onMessage(sock, msg);

      // هنا تقدر تضيف تنفيذ أوامر ثانية لو عندك
      if (msg.message.conversation?.startsWith('.خط')) {
        await plugin.execute(sock, msg);
      }
    }
  });
}

startBot();
