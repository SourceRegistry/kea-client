/** Thrown when a Kea command response entry has a non-zero `result` code. */
export class KeaApiError extends Error {
  /** Kea result code: 1 error, 2 unsupported, 3 empty/not-found, 4 conflict, 5 partial failure. */
  readonly result: number;
  readonly command: string;
  readonly service?: string;

  constructor(command: string, result: number, text: string | undefined, service?: string) {
    super(text ?? `Kea command "${command}" failed with result ${result}`);
    this.name = "KeaApiError";
    this.result = result;
    this.command = command;
    this.service = service;
  }
}

/** Thrown when the Control Agent responds with a non-2xx HTTP status or unparseable body. */
export class KeaTransportError extends Error {
  readonly statusCode?: number;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = "KeaTransportError";
    this.statusCode = statusCode;
  }
}
