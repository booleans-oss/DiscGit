import chalk from 'chalk';

export default class Logger {
    err(message: string):void {
        console.log(chalk.red(`[ERR] :: ${message}`));
    }
    warn(message: string):void {
        console.log(chalk.yellow(`[WARN] :: ${message}`));
    }
    log(message: string):void {
        console.log(`[LOG] :: ${message}`);
    }
}