import chalk from 'chalk';
import util from 'util';

function logInfo(...args: unknown[]) {
	console.log(chalk.bgBlue.white.bold(' INFO '), ...args.map((arg) => util.inspect(arg, { colors: true, depth: 3 })));
}

function logWarn(...args: unknown[]) {
	console.warn(chalk.bgYellow.black.bold(' WARN '), ...args.map((arg) => util.inspect(arg, { colors: true, depth: 3 })));
}

function logError(...args: unknown[]) {
	console.error(chalk.bgRed.white.bold(' ERROR '), ...args.map((arg) => util.inspect(arg, { colors: true, depth: 5 })));
}

function logDebug(...args: unknown[]) {
	console.debug(chalk.bgMagenta.white.bold(' DEBUG '), ...args.map((arg) => util.inspect(arg, { colors: true, depth: 4 })));
}

export { logInfo, logWarn, logError, logDebug };
