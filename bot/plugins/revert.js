const { clearPersona, getPersona } = require('../utils/impersonation');

module.exports = {
  command: 'revert',
  elite: false,
  group: false,
  desc: 'إلغاء وضع الانتحال لهذه الدردشة والرجوع للوضع الطبيعي',
  usage: '.revert',
  async execute(sock, message) {
    const jid = message.key.remoteJid;
    try {
      const current = await getPersona(jid);
      await clearPersona(jid);
      await sock.sendMessage(jid, { text: current ? `تم إلغاء الانتحال: [${current.name}]` : 'لم يكن هناك انتحال مفعّل.' });
    } catch (e) {
      try { await sock.sendMessage(jid, { text: 'تعذر إلغاء وضع الانتحال حالياً.' }); } catch {}
    }
  },
};
