const fs = require('fs-extra');
const path = require('path');
const logger = require('../utils/console');
const { loadPlugins, getPlugins } = require('../handlers/plugins');

function isPlainObject(v) {
  return v && typeof v === 'object' && !Array.isArray(v);
}

function validateExport(p) {
  const issues = [];
  if (!isPlainObject(p)) {
    issues.push('التصدير ليس كائناً صالحاً.');
    return issues;
  }
  if (!p.command || typeof p.command !== 'string') {
    issues.push('حقل command مفقود أو ليس نصاً.');
  } else {
    const ok = /^[a-z0-9._:-]+$/i.test(p.command);
    if (!ok) issues.push(`اسم الأمر يحتوي محارف غير مناسبة: ${p.command}`);
  }
  if (typeof p.execute !== 'function') {
    issues.push('دالة execute مفقودة أو ليست دالة.');
  }
  if ('elite' in p && typeof p.elite !== 'boolean') issues.push('الحقل elite يجب أن يكون منطقياً.');
  if ('group' in p && typeof p.group !== 'boolean') issues.push('الحقل group يجب أن يكون منطقياً.');
  if ('desc' in p && typeof p.desc !== 'string') issues.push('الحقل desc يجب أن يكون نصاً.');
  if ('usage' in p && typeof p.usage !== 'string') issues.push('الحقل usage يجب أن يكون نصاً.');
  return issues;
}

module.exports = {
  command: 'testplugins',
  elite: true,
  group: false,
  desc: 'فحص جميع الإضافات والإبلاغ عن المشاكل البنيوية دون تنفيذها',
  usage: '.testplugins',
  async execute(sock, message) {
    const jid = message.key.remoteJid;
    try {
      const pluginsDir = path.join(__dirname);
      const files = (await fs.readdir(pluginsDir)).filter((f) => f.endsWith('.js'));

      // أعد التحميل لضمان أحدث حالة
      await loadPlugins();
      const loaded = getPlugins();

      const report = {
        totalFiles: files.length,
        loadedCount: Object.keys(loaded).length,
        missing: [], // ملفات لم تُحمّل
        invalid: [], // ملفات غير صالحة ببنائها
        duplicates: [],
        ok: [],
      };

      // رصد التكرارات حسب أسماء الأوامر
      const nameCounts = {};

      for (const file of files) {
        const full = path.join(pluginsDir, file);
        let exp;
        let parseErr = null;
        try {
          delete require.cache[require.resolve(full)];
          exp = require(full);
        } catch (e) {
          parseErr = e;
        }

        if (parseErr) {
          report.invalid.push({ file, reason: `فشل require: ${parseErr.message}` });
          continue;
        }

        const issues = validateExport(exp);
        if (issues.length) {
          report.invalid.push({ file, issues });
        } else {
          // صالح بنيوياً
          report.ok.push({ file, command: exp.command });
          nameCounts[exp.command] = (nameCounts[exp.command] || 0) + 1;
          // هل هو محمّل فعلاً؟
          if (!loaded[exp.command]) {
            report.missing.push({ file, command: exp.command, reason: 'غير موجود ضمن loadedPlugins' });
          }
        }
      }

      // تكرارات بالأسماء
      for (const [name, count] of Object.entries(nameCounts)) {
        if (count > 1) report.duplicates.push({ command: name, count });
      }

      const lines = [];
      lines.push('نتيجة فحص الإضافات:');
      lines.push(`• عدد ملفات الإضافات: ${report.totalFiles}`);
      lines.push(`• عدد الإضافات المحمّلة: ${report.loadedCount}`);
      if (report.duplicates.length) {
        lines.push('\nتكرارات أسماء الأوامر:');
        for (const d of report.duplicates) lines.push(`- ${d.command} (x${d.count})`);
      }
      if (report.invalid.length) {
        lines.push('\nإضافات غير صالحة:');
        for (const inv of report.invalid) {
          if (inv.issues) lines.push(`- ${inv.file}: ${inv.issues.join('; ')}`);
          else lines.push(`- ${inv.file}: ${inv.reason}`);
        }
      }
      if (report.missing.length) {
        lines.push('\nملفات صالحة لكن غير محمّلة:');
        for (const m of report.missing) lines.push(`- ${m.file} (${m.command}): ${m.reason}`);
      }
      if (!report.duplicates.length && !report.invalid.length && !report.missing.length) {
        lines.push('\nكل شيء يبدو جيداً ✔️');
      } else {
        lines.push('\nملاحظات: أصلح العناصر أعلاه ثم نفّذ .reload وأعد الفحص.');
      }

      await sock.sendMessage(jid, { text: lines.join('\n') });
    } catch (e) {
      logger.error('Plugin test error:', e);
      try { await sock.sendMessage(message.key.remoteJid, { text: 'تعذر إجراء فحص الإضافات حالياً.' }); } catch {}
    }
  },
};
