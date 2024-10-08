const fs = require('fs');
const { v4: uuid } = require('uuid');
const { format } = require('date-fns');
const path = require('path');

const logDirectory = path.join(__dirname, 'logs');

const logEvents = async (message) => {
    const dateTime = format(new Date(), 'yyyyMMdd\tHH:mm:ss');
    const logItem = `${dateTime}\t${uuid()}\t${message}\n`;

    try {
        if (!fs.existsSync(logDirectory)) {
            await fs.promises.mkdir(logDirectory);
        }

        const logFilePath = path.join(logDirectory, 'eventLogs.txt');
        await fs.promises.appendFile(logFilePath, logItem);
        console.log(`Logged: ${logItem}`);
    } catch (err) {
        console.error('Error logging event:', err);
    }
};

module.exports = logEvents;
