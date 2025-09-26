module.exports = {
  name: "نرد",
  description: "لعبة نرد وهمي",
  async execute(client, message, args) {
    const diceNumber = Math.floor(Math.random() * 6) + 1;
    const diceEmojis = ["🎲", "🎯", "🏀", "⚽️", "🎰"];
    const emoji = diceEmojis[0];

    await client.sendMessage(message.from, {
      text: \`لقد حصلت على الرقم: \${diceNumber} \${emoji}\`,
    });
  },
};