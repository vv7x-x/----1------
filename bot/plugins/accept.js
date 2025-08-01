
export default {
    name: "قبول",
    command: ["قبول"],
    category: "المجموعات",
    description: "يقبل جميع طلبات الانضمام المعلقة للمجموعة (للنخبة فقط).",
    args: [{ 
        id: 'count', 
        type: 'number', 
        description: 'عدد الأعضاء الذين سيتم قبولهم',
        required: true 
    }],
    execution: async ({ sock, m, args }) => {  
        if (!m.key.remoteJid.endsWith("@g.us")) {
            return sock.sendMessage(m.key.remoteJid, { text: "❌ هذا الأمر يعمل فقط في المجموعات." });
        }

        try {
            const senderNumber = m.key.participant;

            // التحقق مما إذا كان المستخدم من النخبة

            // تحديد العدد المطلوب من الأعضاء
            const requestedCount = args[0];
            if (isNaN(requestedCount) || requestedCount <= 0) {
                return sock.sendMessage(m.key.remoteJid, { text: "❌ يرجى تحديد عدد صحيح من الأعضاء." });
            }

            let requests = await sock.groupRequestParticipantsList(m.key.remoteJid);
            
            if (!requests || requests.length === 0) {
                return sock.sendMessage(m.key.remoteJid, { text: "✅ لا يوجد طلبات انضمام معلقة." });
            }

            // تحديد العدد الذي سيتم قبوله
            const usersToAdd = requests.slice(0, requestedCount).map(user => user.jid);

            if (usersToAdd.length === 0) {
                return sock.sendMessage(m.key.remoteJid, { text: "✅ جميع الطلبات قد تم قبولها أو العدد المطلوب أكبر من الطلبات المتاحة." });
            }

            let acceptedCount = 0;
            let failedCount = 0;

            try {
                await sock.groupParticipantsUpdate(m.key.remoteJid, usersToAdd, "add");
                acceptedCount = usersToAdd.length;
            } catch (err) {
                console.error("❌ خطأ أثناء إضافة الأعضاء:", err);
                failedCount = usersToAdd.length;
            }

            let responseMessage = `✅ تم قبول ${acceptedCount} طلب بنجاح.`;
            if (failedCount > 0) {
                responseMessage += `\n❌ فشل في قبول ${failedCount} طلب.`;
            }

            sock.sendMessage(m.key.remoteJid, { text: responseMessage });

        } catch (error) {
            console.error("❌ Error accepting requests:", error);
            sock.sendMessage(m.key.remoteJid, { text: "❌ حدث خطأ أثناء قبول الطلبات." });
        }
    },
    hidden: false,
};