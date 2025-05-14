import { Injectable, LoggerService } from '@nestjs/common';
import { createLogger, format, transports } from 'winston';

@Injectable()
export class LogService implements LoggerService {
  private generalFormat = format.printf(
    ({
      level,
      message,
      timestamp,
    }: {
      level: string;
      message: string;
      timestamp: string;
    }) => {
      return `[${level.toUpperCase()}] ${timestamp} ${message}`;
    },
  );

  private logger = createLogger({
    level: 'info',
    format: format.combine(format.timestamp(), this.generalFormat),
    transports: [new transports.Console()],
  });

  log(message: any) {
    this.logger.info(message);
  }

  error(message: string, trace?: string) {
    this.logger.error(`${message} - ${trace}`);
  }

  warn(message: string) {
    this.logger.warn(message);
  }

  debug(message: string) {
    this.logger.debug(message);
  }

  verbose(message: string) {
    this.logger.verbose(message);
  }
}
