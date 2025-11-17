import fs from 'fs';
import path from 'path';
import moment from 'moment';

export class Logger {
  constructor(logFile = 'bot.log') {
    const __dirname = path.dirname(new URL(import.meta.url).pathname);
    this.logDir = path.join(__dirname, 'logs');

    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }

    this.logPath = path.join(this.logDir, logFile);
    this.consoleShow = false;
  }

  setConsoleShow(option) {
    this.consoleShow = option;
  }

  log(
    level,
    message,
    color = null,
    bgColor = null,
    isBold = false,
    isUnderlined = false,
  ) {
    const date = moment().format('YYYY-MM-DD HH:mm:ss');
    const logMessage = `[${date}] [${level}] ${message.replaceAll(
      /\n/g,
      ' ',
    )}\n`;

    fs.appendFile(this.logPath, logMessage, (err) => {
      if (err) {
        console.error('Error al escribir en el archivo de registro:', err);
      }
    });

    if (this.consoleShow) {
      this.consoleLog(level, message, color, bgColor, isBold, isUnderlined);
    }
  }

  info(message, color, bgColor, isBold, isUnderlined) {
    this.log('INFO', message, color, bgColor, isBold, isUnderlined);
  }

  warn(message, color, bgColor, isBold, isUnderlined) {
    this.log('WARN', message, color, bgColor, isBold, isUnderlined);
  }

  error(message, color, bgColor, isBold, isUnderlined) {
    this.log('ERROR', message, color, bgColor, isBold, isUnderlined);
  }

  consoleLog(
    level,
    message,
    color = 'white',
    bgColor = null,
    isBold = false,
    isUnderlined = false,
  ) {
    const styles = {
      reset: '\x1b[0m',
      bright: '\x1b[1m',
      dim: '\x1b[2m',
      underscore: '\x1b[4m',
      blink: '\x1b[5m',
      reverse: '\x1b[7m',
      hidden: '\x1b[8m',
      fg: {
        black: '\x1b[30m',
        red: '\x1b[31m',
        green: '\x1b[32m',
        yellow: '\x1b[33m',
        blue: '\x1b[34m',
        magenta: '\x1b[35m',
        cyan: '\x1b[36m',
        white: '\x1b[37m',
      },
      bg: {
        black: '\x1b[40m',
        red: '\x1b[41m',
        green: '\x1b[42m',
        yellow: '\x1b[43m',
        blue: '\x1b[44m',
        magenta: '\x1b[45m',
        cyan: '\x1b[46m',
        white: '\x1b[47m',
      },
    };

    let style = styles.fg[color] || styles.fg.white;
    let resetStyle = styles.reset;
    if (bgColor) style += styles.bg[bgColor] || '';
    if (isBold) style += styles.bright;
    if (isUnderlined) style += styles.underscore;

    console.log(`${style} [${level}] ${message} ${resetStyle}`);
  }
}
