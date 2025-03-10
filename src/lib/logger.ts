enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4,
}

// Mappa delle stringhe dei livelli di log ai valori enum
const LOG_LEVEL_MAP: Record<string, LogLevel> = {
  DEBUG: LogLevel.DEBUG,
  INFO: LogLevel.INFO,
  WARN: LogLevel.WARN,
  ERROR: LogLevel.ERROR,
  NONE: LogLevel.NONE,
};

// Tipo per i parametri di log
type LogParams = [message: string, ...args: any[]];

class Logger {
  private namespace: string;
  private logLevel: LogLevel;

  constructor(namespace: string = 'app') {
    this.namespace = namespace;

    // Imposta il livello di log in base all'ambiente
    const envLogLevel = process.env.LOG_LEVEL as keyof typeof LOG_LEVEL_MAP;
    this.logLevel =
      process.env.NODE_ENV === 'production'
        ? LogLevel.ERROR
        : envLogLevel && LOG_LEVEL_MAP[envLogLevel] !== undefined
          ? LOG_LEVEL_MAP[envLogLevel]
          : LogLevel.DEBUG;
  }

  private formatMessage(message: string): string {
    return `[${this.namespace}] ${message}`;
  }

  public debug(...args: LogParams): void {
    if (this.logLevel <= LogLevel.DEBUG) {
      console.debug(this.formatMessage(args[0]), ...args.slice(1));
    }
  }

  public info(...args: LogParams): void {
    if (this.logLevel <= LogLevel.INFO) {
      console.info(this.formatMessage(args[0]), ...args.slice(1));
    }
  }

  public warn(...args: LogParams): void {
    if (this.logLevel <= LogLevel.WARN) {
      console.warn(this.formatMessage(args[0]), ...args.slice(1));
    }
  }

  public error(...args: LogParams): void {
    if (this.logLevel <= LogLevel.ERROR) {
      console.error(this.formatMessage(args[0]), ...args.slice(1));
    }
  }
}

// Factory function per creare istanze del logger
export const createLogger = (namespace?: string): Logger =>
  new Logger(namespace);

// Istanza di default
const defaultLogger = new Logger();
export default defaultLogger;
