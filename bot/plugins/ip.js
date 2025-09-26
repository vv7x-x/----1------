const fetch = require('node-fetch');

module.exports = {
  command: 'ip',
  elite: false,
  group: false,
  desc: 'جلب معلومات عامة عن عنوان IP (عام) من خدمة ipapi.co',
  usage: '.ip <address> (مثال: .ip 8.8.8.8)'
  ,async execute(sock, message) {
    const jid = message.key.remoteJid;
    try {
      const text = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
      const parts = text.split(/\s+/).filter(Boolean);
      const target = parts[1];
      if (!target) {
        await sock.sendMessage(jid, { text: 'الاستخدام: .ip <address>' });
        return;
      }

      const url = `https://ipapi.co/${encodeURIComponent(target)}/json/`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`IP API HTTP ${res.status}`);
      const data = await res.json();

      const fields = [
        ['IP', data.ip],
        ['Version', data.version],
        ['City', data.city],
        ['Region', data.region],
        ['Country', data.country_name],
        ['CountryCode', data.country],
        ['Org', data.org],
        ['ASN', data.asn],
        ['Latitude', data.latitude],
        ['Longitude', data.longitude],
        ['Timezone', data.timezone],
      ].filter(([, v]) => v !== undefined && v !== null);

      const lines = fields.map(([k, v]) => `${k}: ${v}`);
      const textOut = lines.length ? lines.join('\n') : 'لا توجد معلومات متاحة.';
      await sock.sendMessage(jid, { text: textOut });
    } catch (e) {
      try { await sock.sendMessage(jid, { text: 'تعذر جلب معلومات IP حالياً.' }); } catch {}
    }
  },
};
