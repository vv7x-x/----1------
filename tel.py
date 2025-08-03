from telethon import TelegramClient, events, functions
from telethon.tl.types import User, Chat, Channel
import asyncio

api_id = 26206434
api_hash = 'a0f3e321f4d822a8c3e2618235417e23'
session_name = 'my_session'

client = TelegramClient(session_name, api_id, api_hash)

def chunk_text(text, max_size=3500):
    """تقسيم نص طويل لأجزاء صغيرة"""
    return [text[i:i+max_size] for i in range(0, len(text), max_size)]

@client.on(events.NewMessage(pattern=r'^\.شاتات$'))
async def handler(event):
    # رسالة انتظار متحركة
    msg = await event.reply("⌛ جارٍ البحث عن الشاتات...")

    dialogs = await client.get_dialogs()

    users = []
    groups = []
    channels = []

    for dialog in dialogs:
        entity = dialog.entity
        username = getattr(entity, 'username', None)
        link = None
        display_name = getattr(entity, 'title', None) or getattr(entity, 'first_name', None) or "مجهول"

        if username:
            link = f"https://t.me/{username}"
        else:
            try:
                if isinstance(entity, (Channel, Chat)):
                    result = await client(functions.messages.ExportChatInviteRequest(dialog.id))
                    link = result.link
            except Exception:
                link = None

        if link:
            entry = f"[{display_name}]({link})"
        else:
            entry = display_name

        if isinstance(entity, User):
            users.append(str(entry))
        elif isinstance(entity, Chat):
            groups.append(str(entry))
        elif isinstance(entity, Channel):
            if entity.megagroup:
                groups.append(str(entry))
            else:
                channels.append(str(entry))

    # نص الرسالة بصيغة منظمة
    message = "<b>📩 الشاتات الفردية:</b>\n"
    message += "\n".join(users) if users else "لا توجد شاتات فردية"
    message += "\n\n<b>👥 المجموعات:</b>\n"
    message += "\n".join(groups) if groups else "لا توجد مجموعات"
    message += "\n\n<b>📢 القنوات:</b>\n"
    message += "\n".join(channels) if channels else "لا توجد قنوات"

    # نقسم الرسالة جزئين (أو أقل لو أصغر)
    chunks = chunk_text(message, max_size=3500)

    # نعدل نفس رسالة الانتظار بالجزء الأول
    await msg.edit(chunks[0], parse_mode='html', link_preview=False)

    # لو فيه جزء ثاني، نرسله برسالة جديدة
    if len(chunks) > 1:
        await event.reply(chunks[1], parse_mode='html', link_preview=False)

async def main():
    print("Bot is running...")
    await client.start()
    await client.run_until_disconnected()

asyncio.run(main())
