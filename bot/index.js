const { fork } = require('child_process');
const { join } = require('path');
const fs = require('fs-extra');
const logger = require('./utils/console');

const maxRetries = 3;
const retryDelay = 5000;

let isRunning = false;
let retryCount = 0;

function handleConnection(retry = 0) {
    const currentPath = process.cwd();
    const connectionFolder = join(currentPath, 'ملف_الاتصال');

    if (!fs.existsSync(connectionFolder)) {
        logger.warn('⚠️ ملف الاتصال غير موجود، سيتم المتابعة على أي حال...');
    }

    if (isRunning) return;
    isRunning = true;
    logger.info('The bot is running... ⚡');

    const child = fork(join(__dirname, 'main.js'), [], {
        stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
        env: {
            ...process.env,
            CONNECTION_FOLDER: connectionFolder
        }
    });

    child.on('message', (data) => {
        if (data === 'ready') {
            retryCount = 0;
            logger.success('✅ تم تشغيل البوت بنجاح!');
        } else if (data === 'reset') {
            logger.warn('🔄 إعادة تشغيل البوت بطلب منه...');
            child.kill();
            setTimeout(() => handleConnection(0), 2000);
        } else if (data === 'uptime') {
            child.send(process.uptime());
        }
    });

    child.on('exit', async (code) => {
        isRunning = false;

        if (code === 0) {
            logger.info('✅ تم إغلاق البوت بشكل طبيعي.');
            return;
        }

        if (code === 429) {
            logger.warn('⚠️ تم تجاوز معدل الطلبات، الانتظار 10 ثواني...');
            await delay(10000);
            return handleConnection(retry);
        }

        if (retry < maxRetries) {
            retry++;
            logger.warn(`⚠️ إعادة التشغيل (${retry}/${maxRetries}) بعد ${retryDelay / 1000} ثواني...`);
            await delay(retryDelay);
            handleConnection(retry);
        } else {
            logger.error('❌ تجاوز الحد الأقصى لمحاولات التشغيل. سيتم الإيقاف.');
            process.exit(1);
        }
    });

    child.on('error', (err) => {
        isRunning = false;
        logger.error(`❌ خطأ في العملية الفرعية: ${err}`);
        if (retry < maxRetries) {
            retry++;
            setTimeout(() => handleConnection(retry), retryDelay);
        }
    });

    
    setTimeout(() => {
        if (!child.connected) {
            logger.error('❌ فشل الاتصال بالبوت خلال المهلة المحددة (10 ثواني)');
            child.kill();
            handleConnection(retry + 1);
        }
    }, 10000);
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


process.on('SIGINT', () => process.exit());

process.on('uncaughtException', (err) => {
    if (err.code === 'ECONNRESET' || err.code === 'rate-overlimit') {
        logger.warn('⚠️ تم تجاهل خطأ معروف.');
        return;
    }
    logger.error('❌ خطأ غير معالج:', err);
});

process.on('unhandledRejection', (reason) => {
    if (reason?.code === 429) {
        logger.warn('⚠️ تجاوز معدل الطلبات، جاري الانتظار...');
        return;
    }
    logger.error('❌ وعد غير معالج:', reason);
});

logger.info('🔓Startup... ');
handleConnection();