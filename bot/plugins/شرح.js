const path = require('path');
const { getPlugins } = require('../handlers/plugins'); // عدّل المسار حسب مكان ملف plugins.js

module.exports = {
  command: ['شرح'],
  description: 'يعرض شرحًا مفصلًا لكل أمر متاح',
  async execute(sock, msg) {
    try {
      const plugins = getPlugins();
      if (!plugins || Object.keys(plugins).length === 0) {
        return sock.sendMessage(msg.key.remoteJid, {
          text: '❌ لا توجد أوامر متاحة حاليًا.',
        }, { quoted: msg });
      }

      let menu = '📖 *شرح الأوامر المتاحة:*\n\n';

      for (const cmdName in plugins) {
        const plugin = plugins[cmdName];
        menu += `👑 *الأمر:* ${Array.isArray(plugin.command) ? plugin.command.join(', ') : plugin.command}\n`;
        menu += `⚡ *الفئة:* ${plugin.category || 'غير مصنف'}\n`;
        menu += `⛓️ *الوصف:* ${plugin.description || 'لا يوجد وصف'}\n`;
        menu += '\n❴✾❵──━━━━❨🍷❩━━━━──❴✾❵\n';
      }

      await sock.sendMessage(msg.key.remoteJid, {
        text: menu
      }, { quoted: msg });

    } catch (err) {
      await sock.sendMessage(msg.key.remoteJid, {
        text: '❌ حدث خطأ أثناء عرض الشرح.'
      }, { quoted: msg });
      console.error(err);
    }
  }
};