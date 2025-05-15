import { Injectable, LoggerService } from '@nestjs/common';
import { Ctx } from 'src/libs/modal/ctx/Ctx';
import { addColors, createLogger, format, transports } from 'winston';

const customLevels = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    verbose: 3,
    debug: 4,
  },
  colors: {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    verbose: 'blue',
    debug: 'cyan',
  },
};

addColors(customLevels.colors);

const colorizer = format.colorize();

@Injectable()
export class LogService implements LoggerService {
  private generalFormat = format.printf(
    ({
      level,
      message,
      timestamp,
      serviceContext,
      functionContext,
    }: {
      level: string;
      message: string;
      timestamp: string;
      serviceContext?: string;
      functionContext?: string;
    }) => {
      const coloredLevel = colorizer.colorize(
        level,
        `[${level.toUpperCase()}]`,
      );
      const coloredServiceName = serviceContext
        ? colorizer.colorize('warn', `[${serviceContext}] `)
        : '';
      const coloredFunctionName = functionContext
        ? colorizer.colorize('debug', `<${functionContext}> `)
        : '';
      const msg = colorizer.colorize(level, message);
      return `${coloredLevel} ${timestamp} ${coloredServiceName}${coloredFunctionName}${msg}`;
    },
  );

  private logger = createLogger({
    levels: customLevels.levels,
    level: 'info',
    format: format.combine(
      format.timestamp({ format: 'YYYY/MM/DD HH:mm:ss.SSS' }),
      this.generalFormat,
    ),
    transports: [new transports.Console()],
  });

  log(message: any, ctx?: Ctx) {
    this.logger.info(message, ctx);
  }

  error(message: string, ctx?: Ctx, trace?: string) {
    this.logger.error(`${message} - ${trace}`, ctx);
  }

  warn(message: string, ctx?: Ctx) {
    this.logger.warn(message, ctx);
  }

  debug(message: string, ctx?: Ctx) {
    this.logger.debug(message, ctx);
  }

  verbose(message: string, ctx?: Ctx) {
    this.logger.verbose(message, ctx);
  }
}
