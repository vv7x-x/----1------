module.exports = {
  command: ['طرد_المالك'],
  description: 'بلجن تعليمي يشرح محاولات طرد مالك القروب في واتساب (غير فعلي)',

  async execute(sock, msg) {
    const from = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;

    // جلب بيانات الجروب
    const metadata = await sock.groupMetadata(from);
    const ownerId = metadata.owner;
    const participants = metadata.participants;

    // هل المرسل هو المالك؟
    if (sender === ownerId) {
      return sock.sendMessage(from, { text: '🚫 انت المالك ولا يمكن طردك!' });
    }

    // يحاول يطرد المالك (محاكاة فقط)
    try {
  // محاولة طرد المالك (ownerId) من الجروب (from)
  await sock.groupParticipantsUpdate(from, [ownerId], 'remove');

  // إرسال رسالة في الجروب تأكد نجاح الطرد
  await sock.sendMessage(from, { text: `✅ تم طرد المالك: @${ownerId.split('@')[0]}`, mentions: [ownerId] });
} catch (error) {
  // لو الطرد فشل (معظم الوقت هيفشل) نطبع رسالة خطأ
  await sock.sendMessage(from, { text: `❌ فشل في طرد المالك: ${error.message}` });
}


⚠️ لكن هذه المحاولة مرفوضة من واتساب ولن تنجح.
    
🔍 كيف قد يحاول الهاكر ذلك:
1. انتحال جلسة أدمن.
2. خداع البوت ليظن أن المالك عضو عادي.
3. استغلال ثغرات قديمة أو غير معروفة.
4. الهندسة الاجتماعية لإقناع المالك بنقل الملكية.

*هذه مجرد محاكاة تعليمية ولا يحدث طرد فعلي.*
      `});
    } catch (e) {
      console.error('خطأ في المحاكاة:', e.message);
    }
  }
};
