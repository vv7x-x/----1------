const fs = require('fs');
const path = require('path');

// ملف حفظ التفضيلات
const PREFS_FILE = path.join(__dirname, 'font_prefs.json');

// تحميل التفضيلات من الملف
function loadPrefs() {
  try {
    if (!fs.existsSync(PREFS_FILE)) return new Map();
    const raw = fs.readFileSync(PREFS_FILE, 'utf8');
    const obj = JSON.parse(raw || '{}');
    return new Map(Object.entries(obj));
  } catch {
    return new Map();
  }
}

// حفظ التفضيلات إلى الملف
function savePrefs(map) {
  const obj = Object.fromEntries(map);
  fs.writeFileSync(PREFS_FILE, JSON.stringify(obj, null, 2), 'utf8');
}

// خرائط Unicode للأنماط
const maps = {
  bold: { a:"𝗮", b:"𝗯", c:"𝗰", d:"𝗱", e:"𝗲", f:"𝗳", g:"𝗴", h:"𝗵", i:"𝗶", j:"𝗷", k:"𝗸", l:"𝗹", m:"𝗺", n:"𝗻", o:"𝗼", p:"𝗽", q:"𝗾", r:"𝗿", s:"𝘀", t:"𝘁", u:"𝘂", v:"𝘃", w:"𝘄", x:"𝘅", y:"𝘆", z:"𝘇",
          A:"𝗔", B:"𝗕", C:"𝗖", D:"𝗗", E:"𝗘", F:"𝗙", G:"𝗚", H:"𝗛", I:"𝗜", J:"𝗝", K:"𝗞", L:"𝗟", M:"𝗠", N:"𝗡", O:"𝗢", P:"𝗣", Q:"𝗤", R:"𝗥", S:"𝗦", T:"𝗧", U:"𝗨", V:"𝗩", W:"𝗪", X:"𝗫", Y:"𝗬", Z:"𝗭",
          "0":"𝟬","1":"𝟭","2":"𝟮","3":"𝟯","4":"𝟰","5":"𝟱","6":"𝟲","7":"𝟳","8":"𝟴","9":"𝟵" },
  italic: { a:"𝘢", b:"𝘣", c:"𝘤", d:"𝘥", e:"𝘦", f:"𝘧", g:"𝘨", h:"𝘩", i:"𝘪", j:"𝘫", k:"𝘬", l:"𝘭", m:"𝘮", n:"𝘯", o:"𝘰", p:"𝘱", q:"𝘲", r:"𝘳", s:"𝘴", t:"𝘵", u:"𝘶", v:"𝘷", w:"𝘸", x:"𝘹", y:"𝘺", z:"𝘻",
          A:"𝘈", B:"𝘉", C:"𝘊", D:"𝘋", E:"𝘌", F:"𝘍", G:"𝘎", H:"𝘏", I:"𝘐", J:"𝘑", K:"𝘒", L:"𝘓", M:"𝘔", N:"𝘕", O:"𝘖", P:"𝘗", Q:"𝘘", R:"𝘙", S:"𝘚", T:"𝘛", U:"𝘜", V:"𝘝", W:"𝘞", X:"𝘟", Y:"𝘠", Z:"𝘡" },
  monospace: { a:"𝚊", b:"𝚋", c:"𝚌", d:"𝚍", e:"𝚎", f:"𝚏", g:"𝚐", h:"𝚑", i:"𝚒", j:"𝚓", k:"𝚔", l:"𝚕", m:"𝚖", n:"𝚗", o:"𝚘", p:"𝚙", q:"𝚚", r:"𝚛", s:"𝚜", t:"𝚝", u:"𝚞", v:"𝚟", w:"𝚠", x:"𝚡", y:"𝚢", z:"𝚣",
             A:"𝙰", B:"𝙱", C:"𝙲", D:"𝙳", E:"𝙴", F:"𝙵", G:"𝙶", H:"𝙷", I:"𝙸", J:"𝙹", K:"𝙺", L:"𝙻", M:"𝙼", N:"𝙽", O:"𝙾", P:"𝙿", Q:"𝚀", R:"𝚁", S:"𝚂", T:"𝚃", U:"𝚄", V:"𝚅", W:"𝚆", X:"𝚇", Y:"𝚈", Z:"𝚉" },
  serif: { a:"𝖆", b:"𝖇", c:"𝖈", d:"𝖉", e:"𝖊", f:"𝖋", g:"𝖌", h:"𝖍", i:"𝖎", j:"𝖏", k:"𝖐", l:"𝖑", m:"𝖒", n:"𝖓", o:"𝖔", p:"𝖕", q:"𝖖", r:"𝖗", s:"𝖘", t:"𝖙", u:"𝖚", v:"𝖛", w:"𝖜", x:"𝖝", y:"𝖞", z:"𝖟",
         A:"𝕬", B:"𝕭", C:"𝕮", D:"𝕯", E:"𝕰", F:"𝕱", G:"𝕲", H:"𝕳", I:"𝕴", J:"𝕵", K:"𝕶", L:"𝕷", M:"𝕸", N:"𝕹", O:"𝕺", P:"𝕻", Q:"𝕼", R:"𝕽", S:"𝕾", T:"𝕿", U:"𝖀", V:"𝖁", W:"𝖂", X:"𝖃", Y:"𝖄", Z:"𝖅" },
  sans: { a:"𝖺", b:"𝖻", c:"𝖼", d:"𝖽", e:"𝖾", f:"𝖿", g:"𝗀", h:"𝗁", i:"𝗂", j:"𝗃", k:"𝗄", l:"𝗅", m:"𝗆", n:"𝗇", o:"𝗈", p:"𝗉", q:"𝗊", r:"𝗋", s:"𝗌", t:"𝗍", u:"𝗎", v:"𝗏", w:"𝗐", x:"𝗑", y:"𝗒", z:"𝗓",
         A:"𝖠", B:"𝖡", C:"𝖢", D:"𝖣", E:"𝖤", F:"𝖥", G:"𝖦", H:"𝖧", I:"𝖨", J:"𝖩", K:"𝖪", L:"𝖫", M:"𝖬", N:"𝖭", O:"𝖮", P:"𝖯", Q:"𝖰", R:"𝖱", S:"𝖲", T:"𝖳", U:"𝖴", V:"𝖵", W:"𝖶", X:"𝖷", Y:"𝖸", Z:"𝖹" },
  smallcaps: { a:"ᴀ", b:"ʙ", c:"ᴄ", d:"ᴅ", e:"ᴇ", f:"ғ", g:"ɢ", h:"ʜ", i:"ɪ", j:"ᴊ", k:"ᴋ", l:"ʟ", m:"ᴍ", n:"ɴ", o:"ᴏ", p:"ᴘ", q:"ǫ", r:"ʀ", s:"s", t:"ᴛ", u:"ᴜ", v:"ᴠ", w:"ᴡ", x:"x", y:"ʏ", z:"ᴢ" },
  script: { a:"𝒶", b:"𝒷", c:"𝒸", d:"𝒹", e:"𝑒", f:"𝒻", g:"𝑔", h:"𝒽", i:"𝒾", j:"𝒿", k:"𝓀", l:"𝓁", m:"𝓂", n:"𝓃", o:"𝑜", p:"𝓅", q:"𝓆", r:"𝓇", s:"𝓈", t:"𝓉", u:"𝓊", v:"𝓋", w:"𝓌", x:"𝓍", y:"𝓎", z:"𝓏",
          A:"𝒜", B:"𝐵", C:"𝒞", D:"𝒟", E:"𝐸", F:"𝐹", G:"𝒢", H:"𝐻", I:"𝐼", J:"𝒥", K:"𝒦", L:"𝐿", M:"𝑀", N:"𝒩", O:"𝒪", P:"𝒫", Q:"𝒬", R:"𝑅", S:"𝒮", T:"𝒯", U:"𝒰", V:"𝒱", W:"𝒲", X:"𝒳", Y:"𝒴", Z:"𝒵" },
  fraktur: { a:"𝔞", b:"𝔟", c:"𝔠", d:"𝔡", e:"𝔢", f:"𝔣", g:"𝔤", h:"𝔥", i:"𝔦", j:"𝔧", k:"𝔨", l:"𝔩", m:"𝔪", n:"𝔫", o:"𝔬", p:"𝔭", q:"𝔮", r:"𝔯", s:"𝔰", t:"𝔱", u:"𝔲", v:"𝔳", w:"𝔴", x:"𝔵", y:"𝔶", z:"𝔷",
           A:"𝔄", B:"𝔅", C:"ℭ", D:"𝔇", E:"𝔈", F:"𝔉", G:"𝔊", H:"ℌ", I:"ℑ", J:"𝔍", K:"𝔎", L:"𝔏", M:"𝔐", N:"𝔑", O:"𝔒", P:"𝔓", Q:"𝔔", R:"ℜ", S:"𝔖", T:"𝔗", U:"𝔘", V:"𝔙", W:"𝔚", X:"𝔛", Y:"𝔜", Z:"ℨ" }
};

function transform(text, style) {
  const map = maps[style];
  if (!map) return null;
  let out = '';
  for (const ch of text) {
    const repl = map[ch] ?? (/[A-Za-z]/.test(ch) ? map[ch.toLowerCase()] : undefined);
    if (repl) {
      out += (ch === ch.toUpperCase() && map[ch.toUpperCase()]) ? map[ch.toUpperCase()] : repl;
    } else {
      out += ch;
    }
  }
  return out;
}

function availableStyles() {
  return Object.keys(maps);
}

const userPrefs = loadPrefs();
const prefix = '.';

function parseBody(msg) {
  const m = msg.message || {};
  if (m.conversation) return m.conversation;
  if (m.extendedTextMessage?.text) return m.extendedTextMessage.text;
  if (m.imageMessage?.caption) return m.imageMessage.caption;
  if (m.videoMessage?.caption) return m.videoMessage.caption;
  if (m.ephemeralMessage?.message?.extendedTextMessage?.text)
    return m.ephemeralMessage.message.extendedTextMessage.text;
  return '';
}

module.exports = {
  command: 'خط',
  description: 'تحويل النصوص إلى أنماط خطوط مختلفة مع حفظ النمط المختار حتى الإلغاء',
  usage: '.الأنماط | .خط <نمط> <نص> | .تعيين_خط <نمط> | .إلغاء_الخط',

  async execute(sock, msg) {
    const from = msg.key.remoteJid;
    const text = parseBody(msg).trim();
    if (!text) return;

    // .الأنماط
    if (text === `${prefix}الأنماط` || text === `${prefix}الانماط`) {
      return sock.sendMessage(from, { text: `الأنماط المتاحة: ${availableStyles().join(', ')}` }, { quoted: msg });
    }

    // .إلغاء_الخط
    if (text === `${prefix}إلغاء_الخط` || text === `${prefix}الغاء_الخط`) {
      const sender = msg.key.participant || from;
      userPrefs.delete(sender);
      savePrefs(userPrefs);
      return sock.sendMessage(from, { text: `تم إلغاء النمط الافتراضي.` }, { quoted: msg });
    }

    // .تعيين_خط <نمط>
    if (text.startsWith(`${prefix}تعيين_خط`)) {
      const parts = text.split(' ').filter(Boolean);
      const style = parts[1];
      if (!style) {
        return sock.sendMessage(from, { text: `الاستخدام: .تعيين_خط <نمط>\nالأنماط المتاحة: ${availableStyles().join(', ')}` }, { quoted: msg });
      }
      if (!availableStyles().includes(style)) {
        return sock.sendMessage(from, { text: `نمط غير معروف. جرّب: ${availableStyles().join(', ')}` }, { quoted: msg });
      }
      const sender = msg.key.participant || from;
      userPrefs.set(sender, style);
      savePrefs(userPrefs);
      return sock.sendMessage(from, { text: `تم تعيين النمط الافتراضي لك إلى: ${style}` }, { quoted: msg });
    }

    // .خط <نمط> <نص>
    if (text.startsWith(`${prefix}خط`)) {
      const parts = text.split(' ').filter(Boolean);
      const style = parts[1];
      const content = parts.slice(2).join(' ').trim();

      if (!style || !content) {
        return sock.sendMessage(from, { text: `الاستخدام: .خط <نمط> <نص>\nالأنماط المتاحة: ${availableStyles().join(', ')}` }, { quoted: msg });
      }

      const out = transform(content, style);
      if (!out) {
        return sock.sendMessage(from, { text: `نمط غير معروف. جرّب: ${availableStyles().join(', ')}` }, { quoted: msg });
      }
      return sock.sendMessage(from, { text: out }, { quoted: msg });
    }

    // تطبيق النمط الافتراضي تلقائياً
    const sender = msg.key.participant || from;
    const pref = userPrefs.get(sender);
    if (pref && !text.startsWith(prefix)) {
      const out = transform(text, pref) || text;
      return sock.sendMessage(from, { text: out }, { quoted: msg });
    }
  }
};