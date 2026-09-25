export class ApiRes<T = unknown> {
  statusCode: number;
  data: T | null;
  message: string;
  success: boolean;

  constructor(statusCode = 200, message = "Success", data: T | null = null) {
    this.statusCode = statusCode;
    this.success = statusCode < 400;
    this.message = message;
    this.data = data;
  }
}

export class ApiErr<T = unknown> extends Error {
    statusCode: number;
    success: false;
    error: T | null;
    constructor(statusCode = 500, message = "Something Went Wrong", error: T | null = null) {
        super(message);
        this.name = "ApiErr";
        this.statusCode = statusCode;
        this.success = false as const;
        this.message = message;
        this.error = error;
        Object.setPrototypeOf(this, ApiErr.prototype);
    }
}