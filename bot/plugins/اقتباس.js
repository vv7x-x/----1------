module.exports = {
  command: ['اقتباس'],
  description: 'يرسل اقتباس عميق مزخرف مع إيموجيات.',
  category: 'مفيد',

  async execute(sock, msg) {
    try {
      const chatId = msg.key.remoteJid;
      const quotes = [
  { ar: "✨❝ يدبر أمرك بينما أنت غارق بأفكارك. ❞✨", en: "✨❝ Your affairs are managed while you drown in your thoughts. ❞✨" },
  { ar: "🖼️🌟 نادرة ومميزة لك لوحة أثرية. 🌟🖼️", en: "🖼️🌟 A rare and unique antique painting for you. 🌟🖼️" },
  { ar: "🌙💭 لعل خيالي أوضح من واقعي. 💭🌙", en: "🌙💭 Perhaps my imagination is clearer than my reality. 💭🌙" },
  { ar: "⏳💡 الحياة لا تنتظر أحدًا، فكن مستعدًا دائماً. 💡⏳", en: "⏳💡 Life waits for no one, so always be ready. 💡⏳" },
  { ar: "🧠💫 العقل زينة، فلا تبخل عليه بالتفكير. 💫🧠", en: "🧠💫 The mind is an ornament, so don't sting on thinking. 💫🧠" },
  { ar: "🕊️⏰ الصبر مفتاح الفرج. ⏰🕊️", en: "🕊️⏰ Patience is the key to relief. ⏰🕊️" },
  { ar: "🌈😌 لا شيء يدوم، فابتسم رغم الألم. 😌🌈", en: "🌈😌 Nothing lasts forever, so smile despite the pain. 😌🌈" },
  { ar: "🔄🔥 المحاولة مرة أخرى هي سر النجاح. 🔥🔄", en: "🔄🔥 Trying again is the secret to success. 🔥🔄" },
  { ar: "🌍💖 كن أنت التغيير الذي تريد أن تراه في العالم. 💖🌍", en: "🌍💖 Be the change you want to see in the world. 💖🌍" },
  { ar: "🌟💭 الأمل هو حلم اليقظة. 💭🌟", en: "🌟💭 Hope is the dream of the awake. 💭🌟" },

  { ar: "👑✨ العظمة تبدأ من الإيمان بالنفس. ✨👑", en: "👑✨ Greatness begins with believing in yourself. ✨👑" },
  { ar: "🌅🌸 كل بداية لها نهاية، فاجعل نهايتك مشرقة. 🌸🌅", en: "🌅🌸 Every beginning has an end, so make your end bright. 🌸🌅" },
  { ar: "📚🌞 تعلم من الأمس، عش اليوم، وتطلع للغد. 🌞📚", en: "📚🌞 Learn from yesterday, live today, hope for tomorrow. 🌞📚" },
  { ar: "💡🎯 الفشل هو ببساطة الفرصة للبدء من جديد بشكل أذكى. 🎯💡", en: "💡🎯 Failure is simply the opportunity to start again smarter. 🎯💡" },
  { ar: "❤️‍🔥💬 القلب لا يكذب أبدًا. 💬❤️‍🔥", en: "❤️‍🔥💬 The heart never lies. 💬❤️‍🔥" },
  { ar: "🏆⏳ النجاح لا يأتي إلا بعد التعب. ⏳🏆", en: "🏆⏳ Success only comes after hard work. ⏳🏆" },
  { ar: "🤫🧘‍♂️ العقل الحكيم يفضل الصمت أحيانًا. 🧘‍♂️🤫", en: "🤫🧘‍♂️ The wise mind sometimes prefers silence. 🧘‍♂️🤫" },
  { ar: "🚀🌠 لا تنتظر الفرصة بل اصنعها. 🌠🚀", en: "🚀🌠 Don’t wait for the opportunity, create it. 🌠🚀" },
  { ar: "🌿🍃 الوحدة في بعض الأحيان هي أفضل هدية. 🍃🌿", en: "🌿🍃 Sometimes solitude is the best gift. 🍃🌿" },
  { ar: "🕊️🔓 الحرية تبدأ حين تتخلص من قيود الخوف. 🔓🕊️", en: "🕊️🔓 Freedom begins when you break free from fear’s chains. 🔓🕊️" },

  { ar: "💞🌹 الحب الحقيقي لا يموت. 🌹💞", en: "💞🌹 True love never dies. 🌹💞" },
  { ar: "🦁🔥 كن شجاعًا، فالفرص لا تنتظر. 🔥🦁", en: "🦁🔥 Be brave, opportunities don’t wait. 🔥🦁" },
  { ar: "🧠🌜 العقل لا ينام، فكن دائمًا مستيقظًا. 🌜🧠", en: "🧠🌜 The mind never sleeps, so always stay awake. 🌜🧠" },
  { ar: "📖💫 لا تقارن نفسك بالآخرين، فلك قصتك الخاصة. 💫📖", en: "📖💫 Don’t compare yourself to others, you have your own story. 💫📖" },
  { ar: "📝🌅 الغد هو صفحة جديدة، فاكتبها بحكمة. 🌅📝", en: "📝🌅 Tomorrow is a new page, write it wisely. 🌅📝" },
  { ar: "🌠💪 الأحلام الكبيرة تحتاج إرادة أكبر. 💪🌠", en: "🌠💪 Big dreams require bigger willpower. 💪🌠" },
  { ar: "😊🌈 الابتسامة أجمل لغة. 🌈😊", en: "😊🌈 A smile is the most beautiful language. 🌈😊" },
  { ar: "☀️🌧️ لا تيأس، فالشمس تشرق بعد الظلام. 🌧️☀️", en: "☀️🌧️ Don’t despair, the sun rises after the darkness. 🌧️☀️" },
  { ar: "🤫🛠️ العمل الصامت هو سر النجاح. 🛠️🤫", en: "🤫🛠️ Silent work is the secret of success. 🛠️🤫" },
  { ar: "🦉📜 الحكمة تأتي من التجربة. 📜🦉", en: "🦉📜 Wisdom comes from experience. 📜🦉" },

  { ar: "🛡️❤️ لا تترك مكانًا للخوف في قلبك. ❤️🛡️", en: "🛡️❤️ Don’t leave room for fear in your heart. ❤️🛡️" },
  { ar: "🚶‍♂️🌍 الحياة رحلة وليست وجهة. 🌍🚶‍♂️", en: "🚶‍♂️🌍 Life is a journey, not a destination. 🌍🚶‍♂️" },
  { ar: "⏳📚 الماضي مدرسة، لا مكان له في حاضرنا. 📚⏳", en: "⏳📚 The past is a school, no place for it in our present. 📚⏳" },
  { ar: "🌱🔄 التغيير يبدأ من الداخل. 🔄🌱", en: "🌱🔄 Change starts from within. 🔄🌱" },
  { ar: "🙅‍♂️🗣️ تعلم أن تقول لا حين يجب. 🗣️🙅‍♂️", en: "🙅‍♂️🗣️ Learn to say no when you must. 🗣️🙅‍♂️" },
  { ar: "🌟⚡ الأمل هو الطاقة التي تحركنا للأمام. ⚡🌟", en: "🌟⚡ Hope is the energy that moves us forward. ⚡🌟" },
  { ar: "👤🔥 كن أنت النسخة الأفضل من نفسك. 🔥👤", en: "👤🔥 Be the best version of yourself. 🔥👤" },
  { ar: "💪🌈 القوة الحقيقية تأتي من الداخل. 🌈💪", en: "💪🌈 True strength comes from within. 🌈💪" },
  { ar: "❌😱 لا تخف من الفشل، بل خف من عدم المحاولة. 😱❌", en: "❌😱 Don’t fear failure, fear not trying. 😱❌" },
  { ar: "⏳🌟 كل لحظة هي فرصة جديدة للتغيير. 🌟⏳", en: "⏳🌟 Every moment is a new chance to change. 🌟⏳" },

  { ar: "🤝💎 الأصدقاء الحقيقيون هم كنوز الحياة. 💎🤝", en: "🤝💎 True friends are life’s treasures. 💎🤝" },
  { ar: "🙏🌙 الإيمان بالله هو نور القلب. 🌙🙏", en: "🙏🌙 Faith in God is the light of the heart. 🌙🙏" },
  { ar: "🤲🎩 التواضع يرفع الإنسان. 🎩🤲", en: "🤲🎩 Humility raises the person. 🎩🤲" },
  { ar: "🤝✨ احترام الآخرين بداية الاحترام لنفسك. ✨🤝", en: "🤝✨ Respecting others is the start of self-respect. ✨🤝" },
  { ar: "🤥➡️🕊️ الصدق طريق السلام الداخلي. 🕊️⬅️🤥", en: "🤥➡️🕊️ Honesty is the path to inner peace. 🕊️⬅️🤥" },
  { ar: "🤗💖 التسامح يحرر الروح. 💖🤗", en: "🤗💖 Forgiveness frees the soul. 💖🤗" },
  { ar: "🌅🔄 كل يوم هو بداية جديدة. 🔄🌅", en: "🌅🔄 Every day is a new beginning. 🔄🌅" },
  { ar: "💔➡️❤️‍🔥 تقبل نفسك بكل عيوبك قبل أن تحب الآخرين. ❤️‍🔥⬅️💔", en: "💔➡️❤️‍🔥 Accept yourself with all your flaws before loving others. ❤️‍🔥⬅️💔" },
  { ar: "🚫🔍 لا تبحث عن الكمال، بل عن التقدم. 🔍🚫", en: "🚫🔍 Don’t seek perfection, but progress. 🔍🚫" },
  { ar: "🤐📢 الصمت أحيانًا هو أبلغ رد. 📢🤐", en: "🤐📢 Silence is sometimes the most eloquent response. 📢🤐" },

  { ar: "💰🚫 النجاح لا يقاس بالمال، بل بالسعادة. 🚫💰", en: "💰🚫 Success is not measured by money, but by happiness. 🚫💰" },
  { ar: "⚔️🏅 التحديات تصنع الأبطال. 🏅⚔️", en: "⚔️🏅 Challenges create champions. 🏅⚔️" },
  { ar: "🧠🌞 الفكر الإيجابي يفتح الأبواب المغلقة. 🌞🧠", en: "🧠🌞 Positive thinking opens closed doors. 🌞🧠" },
  { ar: "🎯🔥 اجعل هدفك أكبر من مخاوفك. 🔥🎯", en: "🎯🔥 Make your goal bigger than your fears. 🔥🎯" },
  { ar: "😄🕊️ السعادة قرار، فاتخذ القرار اليوم. 🕊️😄", en: "😄🕊️ Happiness is a choice, make it today. 🕊️😄" },
  { ar: "🌠🎉 الأحلام تتحقق بالعمل وليس بالأماني. 🎉🌠", en: "🌠🎉 Dreams come true through work, not wishes. 🎉🌠" },
  { ar: "📚🌱 اجعل كل يوم فرصة للتعلم. 🌱📚", en: "📚🌱 Make every day a chance to learn. 🌱📚" },
  { ar: "🤗💪 الرحمة قوة لا يملكها الجميع. 💪🤗", en: "🤗💪 Compassion is a strength not everyone has. 💪🤗" },
  { ar: "👫🌹 الحياة أجمل حين نشاركها مع الآخرين. 🌹👫", en: "👫🌹 Life is more beautiful when shared with others. 🌹👫" },
  { ar: "❤️‍🩹🤍 تعلم كيف تحب بدون شروط. 🤍❤️‍🩹", en: "❤️‍🩹🤍 Learn how to love unconditionally. 🤍❤️‍🩹" }
];

      const randomIndex = Math.floor(Math.random() * quotes.length);
      const quote = quotes[randomIndex];

      await sock.sendMessage(chatId, { text: `🌸✨ اقتباس مميز ✨🌸\n\n${quote}` });
    } catch (error) {
      console.error('Error in quote command:', error);
      if (msg.key && msg.key.remoteJid) {
        await sock.sendMessage(msg.key.remoteJid, {
          text: '❌ حدث خطأ أثناء تنفيذ الأمر، حاول مرة أخرى لاحقاً.'
        });
      }
    }
  }
};