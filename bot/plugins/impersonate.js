const { setPersona, getPersona } = require('../utils/impersonation');

module.exports = {
  command: 'impersonate',
  elite: false,
  group: false,
  desc: 'تفعيل وضع الانتحال بإضافة اسم مستعار يسبق كل رد في هذه الدردشة',
  usage: '.impersonate <اسم>',
  async execute(sock, message) {
    const jid = message.key.remoteJid;
    try {
      const text = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
      const parts = text.split(/\s+/).filter(Boolean);
      const alias = parts.slice(1).join(' ').trim();
      if (!alias) {
        await sock.sendMessage(jid, { text: 'الاستخدام: .impersonate <اسم مستعار>' });
        return;
      }
      const maxLen = 24;
      const safe = alias.replace(/\s{2,}/g, ' ').slice(0, maxLen);
      const persona = await setPersona(jid, safe);
      await sock.sendMessage(jid, { text: `تم تفعيل الانتحال بهذه الهوية: [${persona.name}]\nأي رد من البوت هنا سيبدأ بها.` });
    } catch (e) {
      try { await sock.sendMessage(jid, { text: 'تعذر تفعيل وضع الانتحال حالياً.' }); } catch {}
    }
  },
};
