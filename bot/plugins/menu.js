const { getPlugins } = require('../handlers/plugins.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  status: "on",
  name: 'قائمة الأوامر',
  command: ['الاوامر'],
  category: 'tools',
  description: 'عرض جميع الأوامر حسب تصنيفاتها',
  hidden: false,
  version: '3.1',

  async execute(sock, msg) {
    try {
      const zarf = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'zarf.json')));
      const text = msg.message?.extendedTextMessage?.text || msg.message?.conversation || '';
      const inputArgs = text.trim().split(' ').slice(1);
      const plugins = getPlugins();
      const groupedCommands = {};

      Object.values(plugins).forEach(plugin => {
        if (plugin.hidden) return;
        const cat = plugin.category ? plugin.category.toLowerCase() : 'بدون تصنيف';
        if (!groupedCommands[cat]) groupedCommands[cat] = [];

        let cmds = '';
        if (Array.isArray(plugin.command) && plugin.command.length > 1) {
          cmds = plugin.command.map(c => `\`${c}\``).join(' | ');
          cmds = `- ${cmds}`;
        } else {
          const singleCmd = Array.isArray(plugin.command) ? plugin.command[0] : plugin.command;
          cmds = `- \`${singleCmd}\``;
        }

        if (plugin.description) {
          cmds += `\n  🔸 الوصف: \`\`\`${plugin.description}\`\`\``;
        }

        groupedCommands[cat].push(cmds + '\n');
      });

      let output = '╔════════════════════╗\n';
      output += '⚡️ *بوت كيساكي - أوامر التحكم* ⚡️\n';
      output += '╚════════════════════╝\n\n';

      if (inputArgs.length === 0) {
        output += '╔═══ • التصنيفات المتاحة • ═══╗\n';
        for (const category of Object.keys(groupedCommands)) {
          output += `│ ➤ \`${category}\`\n`;
        }
        output += '│ ➤ `الكل`\n';
        output += '╚════════════════════════════╝\n\n';
        output += '📌 اكتب `.اوامر [اسم التصنيف]` لعرض أوامر هذا التصنيف.\n';
      } else if (inputArgs.join(' ').toLowerCase() === 'الكل') {
        output += '╔═══ • جميع الأوامر • ═══╗\n';
        for (const [cat, cmds] of Object.entries(groupedCommands)) {
          output += `\n🔹 *${cat.toUpperCase()}*\n`;
          output += cmds.join('\n');
        }
        output += '╚════════════════════════════╝\n';
      } else {
        const requestedCat = inputArgs.join(' ').toLowerCase();
        if (!groupedCommands[requestedCat]) {
          return await sock.sendMessage(msg.key.remoteJid, {
            text: `❗ التصنيف "${requestedCat}" غير موجود.\nجرب كتابة \`.اوامر\` لرؤية القائمة كاملة.`
          }, { quoted: msg });
        }

        output += `╔═══ • أوامر تصنيف: ${requestedCat.toUpperCase()} • ═══╗\n`;
        output += groupedCommands[requestedCat].join('\n');
        output += '╚════════════════════════════════╝\n';
      }

      output += '\n';
      output += '✨ حقوق الحماية محفوظة لمنظمة تروي و كيساكي ✨\n';
      output += '─────── «𝑻𝑹𝑶𝒀 & 𝑲𝒊𝒔𝒂𝒌𝒊» ───────\n';

      // تعديل المسار ليستخدم الصورة من المسار الخارجي
      const imagePath = '/storage/emulated/0/.bot/bot/image.jpeg';
      await sock.sendMessage(msg.key.remoteJid, {
        image: fs.readFileSync(imagePath),
        caption: output
      }, { quoted: msg });

    } catch (err) {
      console.error('❌ خطأ في عرض قائمة الأوامر:', err);
      await sock.sendMessage(msg.key.remoteJid, { text: '❌ حدث خطأ أثناء عرض القائمة.' }, { quoted: msg });
    }
  }
};