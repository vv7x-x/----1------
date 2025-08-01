module.exports = {
    command: 'اقترح',
    async execute(sock, m) {
        const chatId = m.key.remoteJid;

        const animeSuggestions = [
            {
                title: "Attack on Titan (شونين/أكشن)",
                description: "صراع البشر ضد العمالقة في عالم مظلم مليء بالغموض والأسرار.",
                link: "https://zoro.to/attack-on-titan-112"
            },
            {
                title: "Demon Slayer (أكشن/فانتازيا)",
                description: "صبي يسعى للانتقام من الشياطين وإنقاذ أخته التي تحولت.",
                link: "https://zoro.to/demon-slayer-kimetsu-no-yaiba-47"
            },
            {
                title: "Death Note (غموض/نفسي)",
                description: "دفتر قاتل يقع في يد طالب عبقري ويبدأ لعبة قط وفأر ضد الشرطة.",
                link: "https://zoro.to/death-note-60"
            },
            {
                title: "Jujutsu Kaisen (أرواح شريرة/مدرسة)",
                description: "طالب ثانوي يدخل عالم اللعنات ليحارب الأرواح الشريرة.",
                link: "https://zoro.to/jujutsu-kaisen-tv-534"
            },
            {
                title: "Your Name (رومانسي/دراما)",
                description: "فتى وفتاة يتبادلان الأجساد ويكتشفان رابطًا عميقًا بينهما.",
                link: "https://zoro.to/your-name-592"
            },
            {
                title: "Erased (غموض/سفر عبر الزمن)",
                description: "شاب يعود للماضي لمحاولة منع جريمة قتل.",
                link: "https://zoro.to/erased-165"
            },
            {
                title: "Solo Leveling (أكشن/خيال)",
                description: "أضعف صائد يتحول لأقوى شخصية في عالم مليء بالوحوش.",
                link: "https://zoro.to/solo-leveling-18785"
            },
            {
                title: "Blue Lock (رياضي/كرة قدم)",
                description: "مشروع ياباني مجنون لصناعة أفضل مهاجم في العالم.",
                link: "https://zoro.to/blue-lock-17406"
            },
            {
                title: "Steins;Gate (خيال علمي/غموض)",
                description: "عالم مجنون يخترع آلة ترسل الرسائل للماضي فيؤثر على المستقبل.",
                link: "https://zoro.to/steinsgate-157"
            },
            {
                title: "Violet Evergarden (دراما/رومانسي)",
                description: "جندية سابقة تبحث عن معنى الحب والعمل ككاتبة رسائل.",
                link: "https://zoro.to/violet-evergarden-396"
            },
            {
                title: "Mob Psycho 100 (أكشن/كوميدي)",
                description: "فتى بقوى نفسية خارقة يحاول عيش حياة طبيعية، لكن المشاكل تلاحقه دائمًا.",
                link: "https://zoro.to/mob-psycho-100-168"
            },
            {
                title: "One Punch Man (كوميدي/أكشن)",
                description: "بطل خارق يستطيع هزيمة أي عدو بضربة واحدة ويشعر بالملل من قوته.",
                link: "https://zoro.to/one-punch-man-63"
            },
            {
                title: "Made in Abyss (مغامرة/مظلم)",
                description: "فتاة صغيرة تنزل إلى أعماق هاوية غامضة للبحث عن والدتها المفقودة.",
                link: "https://zoro.to/made-in-abyss-542"
            },
            {
                title: "Vinland Saga (تاريخي/درامي/حربي)",
                description: "قصة فتى محارب في زمن الفايكنج، مليئة بالدماء والانتقام والبطولة.",
                link: "https://zoro.to/vinland-saga-499"
            },
            {
                title: "Konosuba (إيسيكاي/كوميديا)",
                description: "شخص غبي يُستدعى إلى عالم خيالي ويعيش مغامرات فكاهية مع فريق فاشل.",
                link: "https://zoro.to/konosuba-gods-blessing-on-this-wonderful-world-227"
            },
            {
                title: "Dororo (فانتازيا/دموي)",
                description: "محارب فقد جسده بسبب صفقة مع شياطين، يستعيده بقتلهم واحدًا تلو الآخر.",
                link: "https://zoro.to/dororo-1558"
            },
            {
                title: "Parasyte (رعب/نفسي)",
                description: "شاب يحاول التعايش مع طفيلي غريب حل بجسده، وسط غزو الكائنات.",
                link: "https://zoro.to/parasyte-the-maxim-43"
            },
            {
                title: "Elfen Lied (رعب/نفسي)",
                description: "فتاة بقوى قاتلة تهرب من المختبر وتكشف عن ماضي دموي مأساوي.",
                link: "https://zoro.to/elfen-lied-354"
            }
        ];

        const random = animeSuggestions[Math.floor(Math.random() * animeSuggestions.length)];

        const message = `
💙💨 *سونيك يرشحلك أنمي خارق!*  
🎬 *${random.title}*  
📝 ${random.description}

🔗 *شوفه من هنا:*  
${random.link}

🎲 ابعت نفس الأمر لو عايز اقتراح تاني!
        `;

        await sock.sendMessage(chatId, {
            text: message
        });
    }
};