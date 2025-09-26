module.exports = {
  name: "وهمي",
  description: "حالة الوهمي: كتابة، تسجيلات صوت، فيديو، ...",
  async execute(client, message, args) {
    if (!args.length)
      return client.sendMessage(message.from, "✳️ اكتب نوع الوهمي وعدد الثواني\nمثال: .وهمي كتابة 10");

    const type = args[0].toLowerCase();
    const seconds = parseInt(args[1]) || 10;

    const validTypes = {
      كتابة: "composing",
      صوت: "recording",
      فيديو: "recording",
      لعبه: "playing",
      صوره: "upload_photo",
      موقع: "upload_location",
      جهات: "upload_contact",
      ملف: "upload_document",
      مرئي: "recording",
    };

    if (!validTypes[type])
      return client.sendMessage(message.from, "❌ نوع الوهمي غير معروف");

    await client.sendPresenceUpdate(validTypes[type], message.from);
    await client.sendMessage(message.from, \`✅ جاري وضع وضع الوهمي "\${type}" لمدة \${seconds} ثانية\`);
    setTimeout(async () => {
      await client.sendPresenceUpdate("paused", message.from);
      await client.sendMessage(message.from, "✅ تم إيقاف حالة الوهمي");
    }, seconds * 1000);
  },
};