const { jidDecode } = require('@whiskeysockets/baileys');
const decode = jid => (jidDecode(jid)?.user || jid.split('@')[0]) + '@s.whatsapp.net';

const games = {};
const emojiNumbers = ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣'];

class TicTacToe {
    constructor(player1, player2, isBot = false) {
        this.board = Array(9).fill(null);
        this.players = { '❎': player1, '⭕': player2 };
        this.currentPlayer = '❎';
        this.winner = null;
        this.isBot = isBot;
    }

    renderBoard() {
        return this.board.map((v, i) => v ? v : emojiNumbers[i]);
    }

    play(index) {
        if (this.board[index] || this.winner) return false;
        this.board[index] = this.currentPlayer;
        this.checkWinner();
        if (!this.winner) {
            this.currentPlayer = this.currentPlayer === '❎' ? '⭕' : '❎';
        }
        return true;
    }

    checkWinner() {
        const wins = [
            [0,1,2],[3,4,5],[6,7,8],
            [0,3,6],[1,4,7],[2,5,8],
            [0,4,8],[2,4,6]
        ];
        for (let [a,b,c] of wins) {
            if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
                this.winner = this.board[a];
                return;
            }
        }
        if (this.board.every(cell => cell)) this.winner = 'draw';
    }

    getAvailableMoves() {
        return this.board.map((v, i) => v === null ? i : null).filter(v => v !== null);
    }

    botPlay() {
        const moves = this.getAvailableMoves();
        if (!moves.length) return;
        const move = moves[Math.floor(Math.random() * moves.length)];
        this.play(move);
    }
}

async function sendBoard(game, sock, jid) {
    const board = game.renderBoard();
    const lines = [
        `${board.slice(0,3).join(' | ')}`,
        `───────────`,
        `${board.slice(3,6).join(' | ')}`,
        `───────────`,
        `${board.slice(6,9).join(' | ')}`
    ];
    let text = `🎮 *لعبة إكس-أو*\n\n❎ = @${game.players['❎'].split('@')[0]}\n⭕ = @${game.players['⭕'].split('@')[0]}\n\n${lines.join('\n')}\n\n`;

    if (game.winner === 'draw') {
        text += `⚖️ *تعادل! لا يوجد فائز.*`;
    } else if (game.winner) {
        text += `🏆 *الفائز:* @${game.players[game.winner].split('@')[0]}`;
    } else {
        text += `🎲 *الدور على:* @${game.players[game.currentPlayer].split('@')[0]}`;
    }

    await sock.sendMessage(jid, { text, mentions: Object.values(game.players) });
}

module.exports = {
    command: 'اكس',
    description: 'لعبة إكس-أو ضد لاعب أو البوت',
    async execute(sock, msg) {
        const jid = msg.key.remoteJid;
        if (!jid.endsWith('@g.us')) return sock.sendMessage(jid, { text: '❗ الأمر يعمل فقط في المجموعات.' }, { quoted: msg });

        const sender = decode(msg.key.participant || msg.key.remoteJid);
        const text = msg.message?.conversation?.trim() || '';
        const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

        if (text.toLowerCase() === 'الغاء') {
            if (games[jid]) {
                delete games[jid];
                return sock.sendMessage(jid, { text: '🚪 تم إنهاء اللعبة.' });
            } else {
                return sock.sendMessage(jid, { text: '⚠️ لا توجد لعبة حالية.' });
            }
        }

        if (games[jid]) return sock.sendMessage(jid, { text: '⛔ هناك لعبة جارية بالفعل! أرسل "الغاء" لإنهائها.' });

        // اللعب ضد البوت
        if (/^.اكس بوت$/i.test(text)) {
            games[jid] = new TicTacToe(sender, 'BOT', true);
            await sendBoard(games[jid], sock, jid);
            return;
        }

        // اللعب ضد لاعب
        if (!mentioned.length || mentioned[0] === sender) {
            return sock.sendMessage(jid, { text: '👥 منشن لاعب حقيقي لبدء اللعبة.\nأو استخدم `.اكس بوت` للعب مع البوت.' });
        }

        games[jid] = new TicTacToe(sender, mentioned[0]);
        await sendBoard(games[jid], sock, jid);
    }
};

// مستمع للحركات
global.tictac_listener = global.tictac_listener || false;
if (!global.tictac_listener) {
    global.tictac_listener = true;
    const { ev } = require('@whiskeysockets/baileys');

    ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || !msg.key.remoteJid?.endsWith('@g.us')) return;

        const jid = msg.key.remoteJid;
        const game = games[jid];
        if (!game || game.winner) return;

        const sender = decode(msg.key.participant || msg.key.remoteJid);
        const body = msg.message.conversation?.trim();

        if (!/^[1-9]$/.test(body)) return;
        if (sender !== game.players[game.currentPlayer]) return;

        const index = parseInt(body) - 1;
        const valid = game.play(index);
        if (!valid) return await sock.sendMessage(jid, { text: '❌ خانة غير صالحة.' }, { quoted: msg });

        await sendBoard(game, sock, jid);
        if (game.winner) return delete games[jid];

        if (game.players['❎'] === 'BOT' || game.players['⭕'] === 'BOT') {
            game.botPlay();
            await sendBoard(game, sock, jid);
            if (game.winner) delete games[jid];
        }
    });
}