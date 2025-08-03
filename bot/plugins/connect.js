const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { exec } = require('child_process');

const pendingInstallations = new Map();

const createNewConnectionFile = async (phoneNumber, prefix = 'co') => {
    const connectionFolderName = `${prefix}${phoneNumber}`;
    const connectionFolderPath = path.join(process.cwd(), connectionFolderName);
    if (!fs.existsSync(connectionFolderPath)) {
        fs.mkdirSync(connectionFolderPath, { recursive: true });
        console.log(chalk.green(`✅ تم إنشاء ملف الاتصال: ${connectionFolderName}`));
    } else {
        console.log(chalk.yellow(`⚠️ ملف الاتصال موجود بالفعل: ${connectionFolderName}`));
    }
    return connectionFolderPath;
};

const startNewBot = (connectionFolderPath, phoneNumber, sock, m) => {
    return new Promise((resolve, reject) => {
        try {
            const projectPath = process.cwd();
            const sourcePath = path.join(projectPath, 'index.js');
            const targetPath = path.join(connectionFolderPath, 'index.js');
            const indexContent = fs.readFileSync(sourcePath, 'utf8');
            const connectionName = path.basename(connectionFolderPath);
            const connectionSubFolderPath = path.join(connectionFolderPath, connectionName);
            if (!fs.existsSync(connectionSubFolderPath)) {
                fs.mkdirSync(connectionSubFolderPath, { recursive: true });
                console.log(chalk.green(`✅ تم إنشاء مجلد الاتصال: ${connectionName}`));
            }
            if (!fs.existsSync(path.join(connectionFolderPath, 'haykala'))) {
                fs.mkdirSync(path.join(connectionFolderPath, 'haykala'), { recursive: true });
            }
            const connectionInfoPath = path.join(connectionFolderPath, 'connection_info.json');
            const connectionInfo = {
                phone: phoneNumber,
                chatId: m.key.remoteJid,
                timestamp: new Date().toISOString()
            };
            fs.writeFileSync(connectionInfoPath, JSON.stringify(connectionInfo, null, 2), 'utf8');

            const setupScript = `
const fs = require('fs');
const path = require('path');
const pino = require('pino');
const http = require('http');
const { createServer } = require('http');
const { makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const NodeCache = require('node-cache');
const { exec } = require('child_process');

const connectionFolderName = path.basename(process.cwd());
const connectionInfoPath = path.join(process.cwd(), 'connection_info.json');
const connectionInfo = JSON.parse(fs.readFileSync(connectionInfoPath, 'utf8'));
const phoneNumber = connectionInfo.phone;
const originalChatId = connectionInfo.chatId;

const server = createServer((req, res) => {
    if (req.url === '/pairing-code' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                if (data.code) {
                    fs.writeFileSync(path.join(process.cwd(), '..', 'pairing_code.txt'),
                        JSON.stringify({
                            code: data.code,
                            phone: phoneNumber,
                            chatId: originalChatId,
                            timestamp: new Date().toISOString()
                        }, null, 2));
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true }));
                } else {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'No code provided' }));
                }
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: e.message }));
            }
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not found');
    }
});

const port = 9000 + Math.floor(Math.random() * 1000);
server.listen(port, () => {
    console.log(\`Server listening on port \${port}\`);
});

const savePairingCode = async (code) => {
    try {
        fs.writeFileSync(path.join(process.cwd(), 'pairing_code.txt'), code);
        console.log(\`🔐 Pairing code saved: \${code}\`);

        fs.writeFileSync(path.join(process.cwd(), '..', 'pairing_code.txt'),
            JSON.stringify({
                code,
                phone: phoneNumber,
                chatId: originalChatId,
                timestamp: new Date().toISOString()
            }, null, 2));

        const options = {
            hostname: 'localhost',
            port: port,
            path: '/pairing-code',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, res => {
            console.log(\`STATUS: \${res.statusCode}\`);
        });

        req.on('error', error => {
            console.error('Error sending code to server:', error);
        });

        req.write(JSON.stringify({ code }));
        req.end();
    } catch (error) {
        console.error('Error saving pairing code:', error);
    }
};

const startInstallation = async () => {
    const currentFolderPath = process.cwd();
    const connectionFolderName = path.basename(currentFolderPath);

    if (!fs.existsSync(connectionFolderName)) {
        fs.mkdirSync(connectionFolderName, { recursive: true });
        console.log(\`✅ تم إنشاء ملف الاتصال: \${connectionFolderName}\`);
    }

    const { state, saveCreds } = await useMultiFileAuthState(connectionFolderName);
    const sock = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' }),
        browser: ['Mac OS', 'Chrome', '12.1.0.166.117'],
        version: [2, 3000, 1015901300]
    });

    let connectionReady = false;
    sock.ev.on('connection.update', ({ connection, lastDisconnect }) => {
        if (connection === 'open') {
            connectionReady = true;
        }
    });

    await new Promise(resolve => setTimeout(resolve, 5000));

    try {
        if (!sock.authState.creds.registered) {
            const code = await sock.requestPairingCode(phoneNumber);
            console.log(\`🔐 تم الحصول على كود الاقتران: \${code}\`);
            await savePairingCode(code);
        }
    } catch (error) {
        console.error("❌ An error occurred while connecting to the file: " + error.message);

        await new Promise(resolve => setTimeout(resolve, 10000));

        try {
            const code = await sock.requestPairingCode(phoneNumber);
            console.log(\`🔐 تم الحصول على كود الاقتران (المحاولة الثانية): \${code}\`);
            await savePairingCode(code);
        } catch (retryError) {
            console.error('❌ فشلت المحاولة الثانية لطلب كود الاقتران:', retryError);
        }
    }

    sock.ev.on('creds.update', saveCreds);
    sock.ev.on('connection.update', ({ connection, lastDisconnect }) => {
        if (connection === 'close') {
            if (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut)
                startInstallation();
        } else if (connection === 'open') {
            // Start the bot after successful connection
            console.log('✅ Connection established, starting bot...');
            try {
                const child = exec('node .', {
                    cwd: process.cwd(),
                    shell: true
                });

                child.stdout.on('data', (data) => {
                    console.log('🤖 Bot Output:', data);
                });

                child.stderr.on('data', (data) => {
                    console.error('❌ Bot Error:', data);
                });
            } catch (error) {
                console.error('Failed to start bot:', error);
            }
        }
    });
};

startInstallation();
`;

            fs.writeFileSync(path.join(connectionFolderPath, 'setup.js'), setupScript, 'utf8');

            let modifiedContent = indexContent.replace(
                "useMultiFileAuthState('ملف_الاتصال')",
                "useMultiFileAuthState(path.basename(process.cwd()))"
            );

            if (!modifiedContent.includes("const path = require('path');")) {
                modifiedContent = "const path = require('path');\n" + modifiedContent;
            }
            fs.writeFileSync(targetPath, modifiedContent, 'utf8');
            console.log(chalk.green(`✅ تم إنشاء ملف index.js في المجلد الجديد ليستخدم اسم المجلد الحالي كملف اتصال`));

            const copyRecursively = (source, target) => {
                if (!fs.existsSync(target)) {
                    fs.mkdirSync(target, { recursive: true });
                }
                const entries = fs.readdirSync(source, { withFileTypes: true });

                for (const entry of entries) {
                    const sourcePath = path.join(source, entry.name);
                    const targetPath = path.join(target, entry.name);
                    if (entry.isDirectory()) {
                        copyRecursively(sourcePath, targetPath);
                    } else {
                        fs.copyFileSync(sourcePath, targetPath);
                    }
                }
            };

            const entries = fs.readdirSync(projectPath, { withFileTypes: true });
            const excludeDirs = ['node_modules', '.git', 'co*'];
            for (const entry of entries) {
                const entryName = entry.name;
                const sourcePath = path.join(projectPath, entryName);
                const targetPath = path.join(connectionFolderPath, entryName);
                if (excludeDirs.some(dir => {
                    if (dir.endsWith('*')) {
                        return entryName.startsWith(dir.slice(0, -1));
                    }
                    return entryName === dir;
                })) {
                    console.log(chalk.yellow(`⚠️ تخطي مجلد: ${entryName}`));
                    continue;
                }
                try {
                    if (entry.isDirectory()) {
                        copyRecursively(sourcePath, targetPath);
                        console.log(chalk.green(`✅ تم نسخ مجلد ${entryName} إلى المجلد الجديد`));
                    } else if (entry.isFile()) {
                        if (entryName !== 'index.js') {
                            fs.copyFileSync(sourcePath, targetPath);
                            console.log(chalk.green(`✅ تم نسخ ملف ${entryName} إلى المجلد الجديد`));
                        }
                    }
                } catch (error) {
                    console.error(chalk.red(`❌ خطأ في نسخ ${entryName}: ${error.message}`));
                }
            }
            try {
                const packageJsonPath = path.join(projectPath, 'package.json');
                if (fs.existsSync(packageJsonPath)) {
                    const packageContent = fs.readFileSync(packageJsonPath, 'utf8');
                    const packageJson = JSON.parse(packageContent);
                    packageJson.name = `${packageJson.name}-${phoneNumber}`;
                    fs.writeFileSync(
                        path.join(connectionFolderPath, 'package.json'),
                        JSON.stringify(packageJson, null, 2),
                        'utf8'
                    );
                    console.log(chalk.green(`✅ تم إنشاء ملف package.json مخصص`));
                }
            } catch (error) {
                console.error(chalk.red(`❌ خطأ في إنشاء ملف package.json: ${error.message}`));
            }
            try {
                const nodeModulesPath = path.join(projectPath, 'node_modules');
                const targetNodeModulesPath = path.join(connectionFolderPath, 'node_modules');
                if (fs.existsSync(nodeModulesPath) && !fs.existsSync(targetNodeModulesPath)) {
                    fs.symlinkSync(nodeModulesPath, targetNodeModulesPath, 'dir');
                    console.log(chalk.green(`✅ تم إنشاء رمز لمجلد node_modules`));
                }
            } catch (error) {
                console.error(chalk.red(`❌ خطأ في إنشاء رمز لمجلد node_modules: ${error.message}`));
            }
            const updateEliteFile = () => {
                try {
                    const elitePath = path.join(connectionFolderPath, 'haykala', 'elite.js');
                    let eliteContent = '';

                    if (fs.existsSync(elitePath)) {
                        eliteContent = fs.readFileSync(elitePath, 'utf8');
                        if (!eliteContent.includes(`'${phoneNumber}@s.whatsapp.net'`)) {
                            // هنا ممكن تضيف كود التعديل على eliteContent إذا احتجت
                        }
                    } else {
                        eliteContent = `module.exports.formatEliteNumber = (number) => {
    if (!number) return '';
    const cleaned = number.toString().replace(/\\D/g, '');
    return cleaned.endsWith('@s.whatsapp.net') ? cleaned : \`\${cleaned}@s.whatsapp.net\`;
};

const elite = {name: 'Elite Bot'};
`;
                    }
                    fs.writeFileSync(elitePath, eliteContent, 'utf8');
                    console.log(chalk.green(`✅ تم تحديث ملف elite.js وإضافة الرقم ${phoneNumber}`));

                    const child = exec(`cd "${connectionFolderPath}" && node setup.js`, (error, stdout, stderr) => {
                        if (error) {
                            console.error('❌', chalk.white(chalk.bgRed(` An error occurred while connecting to the file: ${error.message}`)));
                            reject(error);
                            return;
                        }
                    });
                    console.log('✅', chalk.white(chalk.bgGreen(` تم بدء عملية التنصيب بنجاح!`)));
                    resolve(true);

                } catch (error) {
                    console.error(chalk.red(`❌ Error updating elite.js: ${error.message}`));
                    reject(error);
                }
            };
            updateEliteFile();
            console.log('✅', chalk.white(chalk.bgGreen(` تم إنشاء ملف الاتصال: ${path.basename(connectionFolderPath)}`)));
            resolve(true);
        } catch (error) {
            console.error(chalk.red(`❌ An error occurred while connecting to the file: ${error.message}`));
            reject(error);
        }
    });
};

const handleInstallationMessage = async (text, m, sock) => {
    try {
        if (m.key.remoteJid.endsWith('@g.us')) {
            return false;
        }
        const messageContent = text ||
            m.message?.conversation ||
            m.message?.extendedTextMessage?.text ||
            m.text ||
            (typeof m.message === 'string' ? m.message : null);
        const isReplyToBot = (m.message?.extendedTextMessage?.contextInfo?.participant === sock.user.id ||
            m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.includes(sock.user.id)) &&
            m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (/^\d+$/.test(messageContent?.trim() || '') && !isReplyToBot) {
            return false;
        }
        if (isReplyToBot && /^\d+$/.test(messageContent?.trim() || '')) {
            const phoneNumber = messageContent?.replace(/[^0-9]/g, '');
            if (!phoneNumber || phoneNumber.length < 10) {
                await sock.sendMessage(m.key.remoteJid, {
                    text: '❌ رقم الهاتف غير صالح. الرجاء إدخال رقم صحيح.'
                }, { quoted: m });
                return true;
            }
            const statusMsg = await sock.sendMessage(m.key.remoteJid, {
                text: `🔄 *حالة التنصيب:*\n\n⏳ جاري إنشاء ملف الاتصال لرقم ${phoneNumber}...`
            }, { quoted: m });
            const updateStatus = async (newStatus) => {
                await sock.sendMessage(m.key.remoteJid, {
                    text: newStatus,
                    edit: statusMsg.key
                });
            };
            const connectionFolderPath = await createNewConnectionFile(phoneNumber);
            await updateStatus(`🔄 *حالة التنصيب:*\n\n✅ تم إنشاء ملف الاتصال\n⏳ جاري تشغيل البوت الجديد...`);
            await startNewBot(connectionFolderPath, phoneNumber, sock, m);
            await updateStatus(`🔄 *حالة التنصيب:*\n\n✅ تم إنشاء ملف الاتصال\n✅ تم تشغيل البوت الجديد\n⏳ في انتظار كود الاقتران...\n\n📂 المسار: ${connectionFolderPath}`);
            const pairingCodePath = path.join(process.cwd(), 'pairing_code.txt');
            let checkInterval = setInterval(async () => {
                if (fs.existsSync(pairingCodePath)) {
                    try {
                        const pairingInfo = JSON.parse(fs.readFileSync(pairingCodePath, 'utf8'));
                        if (pairingInfo && pairingInfo.code) {
                            clearInterval(checkInterval);
                            await updateStatus(`🔄 *حالة التنصيب:*\n\n✅ تم إنشاء ملف الاتصال\n✅ تم تشغيل البوت الجديد\n✅ تم استلام كود الاقتران\n\n🔐 *كود الاقتران للرقم ${phoneNumber}*\n*${pairingInfo.code}*\n\nقم بإدخال هذا الكود في واتساب لإكمال عملية الاقتران.\n\n📂 المسار: ${connectionFolderPath}`);
                            fs.unlinkSync(pairingCodePath);
                        }
                    } catch (error) {
                        console.error('خطأ في قراءة ملف كود الاقتران:', error);
                    }
                }
            }, 2000);
            setTimeout(() => {
                clearInterval(checkInterval);
            }, 120000);
            return true;
        }
        return false;
    } catch (error) {
        console.error('خطأ في عملية التنصيب:', error);
        await sock.sendMessage(m.key.remoteJid, {
            text: `❌ حدث خطأ أثناء عملية التنصيب: ${error.message}`
        }, { quoted: m });
        return true;
    }
};

const plugin = {
    name: "InstallPlugin",
    command: ["اتصال"],
    category: "settings",
    description: "خاصية تنصيب نسخة جديدة من البوت",
    usage: "تنصيب",
    version: "1.7.0",
    status: "on",
    execution: async ({ sock, m, args, prefix, sleep }) => {
        try {
            if (m.key.remoteJid.endsWith('@g.us')) {
                await sock.sendMessage(m.key.remoteJid, {
                    text: '❌ عذراً، يمكن استخدام أمر التنصيب في المحادثات الخاصة فقط.'
                }, { quoted: m });
                return;
            }
            if (args[0] === 'حذف') {
                const phoneNumber = args[1];
                if (!phoneNumber) {
                    await sock.sendMessage(m.key.remoteJid, {
                        text: '❌ الرجاء إدخال رقم الهاتف المراد حذفه'
                    }, { quoted: m });
                    return;
                }
                const folderName = `co${phoneNumber}`;
                const folderPath = path.join(process.cwd(), folderName);
                if (fs.existsSync(folderPath)) {
                    try {
                        fs.rmSync(folderPath, { recursive: true, force: true });
                        await sock.sendMessage(m.key.remoteJid, {
                            text: `✅ تم حذف البوت للرقم ${phoneNumber} بنجاح`
                        }, { quoted: m });
                    } catch (error) {
                        await sock.sendMessage(m.key.remoteJid, {
                            text: `❌ حدث خطأ أثناء حذف البوت: ${error.message}`
                        }, { quoted: m });
                    }
                } else {
                    await sock.sendMessage(m.key.remoteJid, {
                        text: `❌ لا يوجد بوت مثبت للرقم ${phoneNumber}`
                    }, { quoted: m });
                }
                return;
            }
            const senderJid = m.key.remoteJid;
            const phoneNumber = senderJid.split('@')[0];
            const statusMsg = await sock.sendMessage(m.key.remoteJid, {
                text: `🔄 *جاري تنصيب البوت...*\n\n⏳ جاري إنشاء ملف الاتصال لرقمك ${phoneNumber}...`
            }, { quoted: m });
            const updateStatus = async (newStatus) => {
                await sock.sendMessage(m.key.remoteJid, {
                    text: newStatus,
                    edit: statusMsg.key
                });
            };
            const connectionFolderPath = await createNewConnectionFile(phoneNumber);
            await updateStatus(`🔄 *جاري تنصيب البوت...*\n\n✅ تم إنشاء ملف الاتصال\n⏳ جاري تشغيل البوت الجديد...`);
            await startNewBot(connectionFolderPath, phoneNumber, sock, m);
            await updateStatus(`🔄 *جاري تنصيب البوت...*\n\n⏳ في انتظار كود الاقتران...`);
            const pairingCodePath = path.join(process.cwd(), 'pairing_code.txt');
            let checkInterval = setInterval(async () => {
                if (fs.existsSync(pairingCodePath)) {
                    try {
                        const pairingInfo = JSON.parse(fs.readFileSync(pairingCodePath, 'utf8'));
                        if (pairingInfo && pairingInfo.code) {
                            clearInterval(checkInterval);
                            await updateStatus(`🔐 *كود الاقتران:* *${pairingInfo.code}*\n\nاضغط على إشعار واتساب ثم قم بإدخال الكود لإكمال عملية الربط.`);
                            fs.unlinkSync(pairingCodePath);
                        }
                    } catch (error) {
                        console.error('خطأ في قراءة ملف كود الاقتران:', error);
                    }
                }
            }, 2000);
            setTimeout(() => {
                clearInterval(checkInterval);
            }, 120000);
        } catch (error) {
            console.error('خطأ في تنفيذ أمر التنصيب:', error);
            await sock.sendMessage(m.key.remoteJid, {
                text: `❌ حدث خطأ أثناء تنفيذ أمر التنصيب: ${error.message}`
            }, { quoted: m });
        }
    }
};

module.exports = plugin;
