import { createLogger, format, transports, Logger } from 'winston'
import chalk from 'chalk'

const consoleTransport = new transports.Console()

type customLogger = Logger & {
  consoleTransport: any,
}

const logger = createLogger({
  level: 'info',
  format: format.printf((info) => {
    switch (info.level) {
      case 'error':
        return chalk.redBright(info.message)
      case 'info':
        return chalk.blueBright(JSON.stringify(info.message, null, 2))
      case 'verbose':
        return chalk.green(info.message)
      case 'debug':
        return chalk.white(info.message)
      default:
        return info.message
    }
  }),
  transports: [consoleTransport],
}) as customLogger

logger.consoleTransport = consoleTransport

export default logger
