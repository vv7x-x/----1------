const stats = {
  messagesSent: 0,
  messagesReceived: 0,
};

module.exports = {
  command: ["احصائيات", "analytics"],
  description: "عرض إحصائيات الرسائل المرسلة والمستلمة",
  category: "analytics",

  async execute(sock, msg, args = []) {
    const groupId = msg.key.remoteJid;

    const text = `📊 إحصائيات الرسائل:\n- الرسائل المرسلة: ${stats.messagesSent}\n- الرسائل المستلمة: ${stats.messagesReceived}`;

    await sock.sendMessage(groupId, { text }, { quoted: msg });
  },

  incrementSent() {
    stats.messagesSent++;
  },

  incrementReceived() {
    stats.messagesReceived++;
  },
};
