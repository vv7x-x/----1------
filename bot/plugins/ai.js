const axios = require("axios");

module.exports = {
  command: ["ai"],
  description: "ذكاء اصطناعي يجيب على أي سؤال",
  category: "ai",

  async execute(sock, msg, args = []) {
    const apiKey = "AIzaSyDOnGiUKf2Shu3TmfAeQqbwHtD2PNbu5VU"; // 🔴 استبدل بمفتاحك
    const sender = msg.key.participant || msg.key.remoteJid;
    const senderMention = `@${sender.split("@")[0]}`;
    const groupId = msg.key.remoteJid;

    // ✅ إرسال تفاعل
    await sock.sendMessage(groupId, {
      react: { text: "💫", key: msg.key },
    });

    // ✅ صورة البروفايل
    let imageUrl;
    try {
      const target = msg.key.remoteJid.endsWith("@g.us") ? groupId : sender;
      imageUrl = await sock.profilePictureUrl(target, "image");
    } catch {
      imageUrl = "https://i.pinimg.com/736x/2f/c1/fc/2fc1fc7bea93f5b93a5d0d817a2bc7c8.jpg";
    }

    // ✅ قراءة نص الرسالة بالكامل
    const fullText =
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text ||
      msg.message?.imageMessage?.caption ||
      msg.message?.videoMessage?.caption ||
      "";

    const lowered = fullText.trim().toLowerCase();
    const question = fullText.replace(/^[,،]?ai\s*/i, "").trim();

    // ✅ الرد بمثال إذا لم يوجد سؤال بعد "ai" أو "،ai"
    if (!question) {
      const examples = [
        "متى توفى الرسول صلى الله عليه وسلم؟",
        "ما هو أكبر كوكب في المجموعة الشمسية؟",
        "من هو مخترع الهاتف؟",
        "ما هي عاصمة اليابان؟",
        "كم عدد عظام جسم الإنسان؟",
      ];
      const randomExample = examples[Math.floor(Math.random() * examples.length)];
      const caption = `*⊱ ────── {.⋅ 🌙 ⋅.} ───── ⊰*\n*الامر ده عباره عن ذكاء اصطناعي تقدر تساله او تخليه يعمل اي حاجه*\n> مثال🌹 : ${randomExample}\n*⊱ ────── {.⋅ 🍃 ⋅.} ───── ⊰*\n> KING ❄️🍃`;

      return await sock.sendMessage(groupId, {
        image: { url: imageUrl },
        caption,
      }, { quoted: msg });
    }

    // ✅ رسالة انتظار
    await sock.sendMessage(groupId, {
      text: "*انتـــظر قليـــلا مــن فــضلــلك*❄️",
    }, { quoted: msg });

    try {
      const res = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        { contents: [{ parts: [{ text: question }] }] },
        { headers: { "Content-Type": "application/json" } }
      );

      let botReply = res?.data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (botReply) {
        botReply = botReply
          .replace(/\*\*(.*?)\*\*/g, "*$1*")
          .replace(/\n/g, "\n➤ ")
          .replace(/- /g, "• ");

        const caption = `*⊱ ────── {.⋅ 🌙 ⋅.} ───── ⊰*\n${botReply}\n*❴✾❵──━━━━❨🍷❩━━━━──❴✾❵*\n> KING ❄️⚡`;

        return await sock.sendMessage(groupId, {
          image: { url: imageUrl },
          caption,
        }, { quoted: msg });
      } else {
        const caption = `*❴✾❵──━━━━❨🍷❩━━━━──❴✾❵*\nلم أتمكن من إيجاد إجابة، حاول مجددًا! ${senderMention}\n*⊱ ❴✾❵──━━━━❨🍷❩━━━━──❴✾❵*\n> KING⚡`;

        return await sock.sendMessage(groupId, {
          image: { url: imageUrl },
          caption,
        }, { quoted: msg });
      }
    } catch (e) {
      console.error("❌ خطأ في الاتصال بـ Gemini API:", e);
      const caption = `*⊱ ────── {.⋅ 🌙 ⋅.} ───── ⊰*\nحدث خطأ، حاول لاحقًا. ${senderMention}\n*❴✾❵──━━━━❨🍷❩━━━━──❴✾❵*\n> KING 🍃`;

      return await sock.sendMessage(groupId, {
        image: { url: imageUrl },
        caption,
      }, { quoted: msg });
    }
  },
};