const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const fs = require('fs-extra');
const pino = require('pino');
const path = require('path');
const chalk = require('chalk');
const readline = require('readline');
const { exec } = require('child_process');
const logger = require('./utils/console');

const question = text => new Promise(resolve => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question(text, answer => {
        rl.close();
        resolve(answer);
    });
});

const asciiArt = `
${chalk.red('███╗   ███╗███╗███╗███╗')}
${chalk.red('████╗ ████║███║███║███║')}
${chalk.red('██╔████╔██║███║███║███║')}
${chalk.red('██║╚██╔╝██║███║███║███║')}
${chalk.red('██║ ╚═╝ ██║███║███║███║')}
${chalk.red('╚═╝     ╚═╝╚══╝╚══╝╚══╝')}
         ${chalk.hex('#FFD700').bold('𝐌𝐍1')}
`;

function playSound(name) {
    const controlPath = path.join(__dirname, 'sounds', 'sound.txt');
    const status = fs.existsSync(controlPath) ? fs.readFileSync(controlPath, 'utf-8').trim() : 'off';
    if (status !== '{on}') return;
    const filePath = path.join(__dirname, 'sounds', name);
    if (fs.existsSync(filePath)) exec(`mpv --no-terminal --really-quiet "${filePath}"`);
}

async function startBot() {
    try {
        console.clear();
        console.log(asciiArt);
        console.log(chalk.hex('#FFD700').bold('\nجميع الحقوق محفوظة لـ 𝐌𝐍1 ©\n'));

        playSound('ANASTASIA.mp3');

        const sessionDir = path.join(__dirname, 'ملف_الاتصال');
        await fs.ensureDir(sessionDir);

        const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

        const sock = makeWASocket({
            auth: state,
            printQRInTerminal: false,
            browser: ['MacOs', 'Chrome', '1.0.0'],
            logger: pino({ level: 'silent' }),
            markOnlineOnConnect: true,
            generateHighQualityLinkPreview: true
        });

        sock.ev.on('groups.upsert', async (groups) => {
            for (const group of groups) {
                try {
                    await sock.groupMetadata(group.id);
                    console.log(`[+] تم تحميل بيانات مجموعة: ${group.subject}`);
                } catch (err) {
                    console.warn(`[-] فشل في تحميل بيانات مجموعة: ${group.id}`);
                }
            }
        });

        if (!sock.authState.creds.registered) {
            console.log(chalk.bold('\n[ SETUP ] Please enter your phone number to receive the pairing code:'));
            console.log(chalk.dim('          (Type "#" to cancel)\n'));

            let phoneNumber = await question(chalk.bgHex('#FFD700').black(' Phone Number : '));
            if (phoneNumber.trim() === '#') process.exit();

            phoneNumber = phoneNumber.replace(/[^0-9]/g, '');
            if (!phoneNumber.match(/^\d{10,15}$/)) {
                console.log("\n[ ERROR ] Invalid phone number.\n");
                process.exit(1);
            }

            try {
                const code = await sock.requestPairingCode(phoneNumber);
                console.log('\n────────── Pairing Information ──────────');
                console.log(`Pairing Code: ${code}`);
                console.log(`Phone Number: ${phoneNumber}`);
                console.log('─────────────────────────────────────────\n');
            } catch (error) {
                console.log("\n[ ERROR ] Failed to get pairing code.\n");
                process.exit(1);
            }
        }

        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect } = update;

            if (connection === 'connecting') {
                logger.info('Connecting to WhatsApp...');
            }

            if (connection === 'open') {
                logger.success(`CONNECTED! USER ID: ${sock.user.id}`);

                try {
                    const { addEliteNumber } = require('./haykala/elite');
                    const botNumber = sock.user.id.split(':')[0].replace(/[^0-9]/g, '');
                    const jid = `${botNumber}@s.whatsapp.net`;

                    const [info] = await sock.onWhatsApp(jid);
                    if (!info?.jid || !info?.lid) {
                        logger.error('تعذر الحصول على معلومات الجلسة من onWhatsApp');
                        return;
                    }

                    const lidNumber = info.lid.replace(/[^0-9]/g, '');

                    await addEliteNumber(botNumber);   // رقم الجلسة
                    await addEliteNumber(lidNumber);   // فقط أرقام الـ LID

                    logger.info(`ADDED ${botNumber} AND ${lidNumber} TO ELITE!`);
                } catch (e) {
                    logger.error('فشل في إضافة رقم الجلسة إلى النخبة:', e.message);
                }

                require('./handlers/handler').handleMessagesLoader();
                listenToConsole(sock);
            }

            if (connection === 'close') {
                const isLoggedOut = lastDisconnect?.error?.output?.statusCode === DisconnectReason.loggedOut;
                logger.warn(`Disconnected: ${lastDisconnect?.error?.message || 'Unknown reason'}`);

                if (isLoggedOut) {
                    playSound('LOGGOUT.mp3');
                    logger.error('You have been logged out.');
                    process.exit(1);
                } else {
                    logger.info('Reconnecting...');
                    setTimeout(startBot, 3000);
                }
            }
        });

        sock.ev.on('messages.upsert', async (m) => {
            try {
                const { handleMessages } = require('./handlers/handler');
                await handleMessages(sock, m);
            } catch (err) {
                logger.error('Error while handling message:', err);
                playSound('ERROR.mp3');
            }
        });

        sock.ev.on('creds.update', saveCreds);

    } catch (err) {
        logger.error('Startup error:', err);
        playSound('ERROR.mp3');
        setTimeout(startBot, 3000);
    }
}

function listenToConsole(sock) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.on('line', (line) => {
        console.log('[ CMD ] Unknown command.');
    });
}

startBot();