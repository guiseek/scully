import chalk from 'chalk';
import { appendFile } from 'fs';
import { join } from 'path';
import { loadConfig, scullyConfig } from '../utils/config';

export const orange = chalk.hex('#FFA500');
export const { white, red, yellow, green }: { [x: string]: any } = chalk;

export const enum LogSeverity {
  normal,
  warning,
  error,
  none,
}

const logToFile = Promise.resolve((string) => {
  return new Promise((res, rej) =>
    appendFile(join(__dirname, '../../', 'scully.log'), string, (e) =>
      e ? rej(e) : res
    )
  );
}).then((file) => {
  /** inject a couple of newlines to indicate new run */
  return file;
});

export const log = (...a) => enhancedLog(white, LogSeverity.normal, ...a);
export const logError = (...a) => enhancedLog(red, LogSeverity.error, ...a);
export const logWarn = (...a) => enhancedLog(orange, LogSeverity.warning, ...a);

function enhancedLog(colorFn, severity: LogSeverity, ...args: any[]) {
  const out = [];
  for (const item of args) {
    out.push(typeof item === 'string' ? makeRelative(item) : item);
  }
  logToFile
    .then((file) => {
      if (severity >= scullyConfig.logFileSeverity) {
        file(out.join('\n'));
        file('\n');
      }
    })
    .catch((e) => {
      /** silently ignore log errors */
      // console.log('log error', e)
    });
  console.log(colorFn(...out));
}

function makeRelative(txt: string) {
  const h = scullyConfig?.homeFolder || process.cwd();
  return txt.replace(h, '.');
}
