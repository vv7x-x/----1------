const fetch = require('node-fetch');

module.exports = {
  command: 'whois',
  elite: false,
  group: false,
  desc: 'جلب معلومات WHOIS/RDAP عن نطاق (domain).',
  usage: '.whois <domain>',
  async execute(sock, message) {
    const jid = message.key.remoteJid;
    try {
      const text = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
      const parts = text.split(/\s+/).filter(Boolean);
      const domain = parts[1];
      if (!domain) {
        await sock.sendMessage(jid, { text: 'الاستخدام: .whois <domain>' });
        return;
      }
      const url = `https://rdap.org/domain/${encodeURIComponent(domain)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`RDAP HTTP ${res.status}`);
      const data = await res.json();

      const lines = [];
      if (data.ldhName) lines.push(`Domain: ${data.ldhName}`);
      if (data.handle) lines.push(`Handle: ${data.handle}`);
      if (data.status) lines.push(`Status: ${Array.isArray(data.status) ? data.status.join(', ') : data.status}`);
      if (data.events) {
        const created = data.events.find((e) => e.eventAction === 'registration');
        const expires = data.events.find((e) => e.eventAction === 'expiration');
        const updated = data.events.find((e) => e.eventAction === 'last changed');
        if (created) lines.push(`Created: ${created.eventDate}`);
        if (updated) lines.push(`Updated: ${updated.eventDate}`);
        if (expires) lines.push(`Expires: ${expires.eventDate}`);
      }
      if (data.nameservers) {
        const ns = data.nameservers.map((n) => n.ldhName || n.handle).filter(Boolean);
        if (ns.length) lines.push(`Name Servers: ${ns.join(', ')}`);
      }

      await sock.sendMessage(jid, { text: lines.length ? lines.join('\n') : 'لم يتم العثور على معلومات RDAP كافية.' });
    } catch (e) {
      try { await sock.sendMessage(jid, { text: 'تعذر جلب بيانات WHOIS/RDAP حالياً.' }); } catch {}
    }
  },
};
