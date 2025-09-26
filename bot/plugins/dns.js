const fetch = require('node-fetch');

module.exports = {
  command: 'dns',
  elite: false,
  group: false,
  desc: 'استعلام DNS عبر DoH (A/AAAA/TXT/MX/CNAME/NS) باستخدام Google DoH',
  usage: '.dns <domain> [type] (مثال: .dns example.com A)',
  async execute(sock, message) {
    const jid = message.key.remoteJid;
    try {
      const text = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
      const parts = text.split(/\s+/).filter(Boolean);
      const domain = parts[1];
      const type = (parts[2] || 'A').toUpperCase();
      const allowed = ['A', 'AAAA', 'TXT', 'MX', 'CNAME', 'NS'];
      if (!domain) {
        await sock.sendMessage(jid, { text: 'الاستخدام: .dns <domain> [A|AAAA|TXT|MX|CNAME|NS]' });
        return;
      }
      if (!allowed.includes(type)) {
        await sock.sendMessage(jid, { text: `نوع غير مدعوم. الأنواع المدعومة: ${allowed.join(', ')}` });
        return;
      }

      const url = `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=${encodeURIComponent(type)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`DoH HTTP ${res.status}`);
      const data = await res.json();
      if (data.Status !== 0 || !data.Answer) {
        await sock.sendMessage(jid, { text: 'لا توجد إجابة DNS مناسبة.' });
        return;
      }

      const lines = data.Answer.map((a) => `• ${a.name} ${a.TTL}s ${a.type} ${a.data}`);
      await sock.sendMessage(jid, { text: `نتائج DNS (${type}) لـ ${domain}:\n${lines.join('\n')}` });
    } catch (e) {
      try { await sock.sendMessage(jid, { text: 'تعذر إجراء استعلام DNS حالياً.' }); } catch {}
    }
  },
};
