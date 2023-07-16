abstract class ApiResponse {
  success: boolean;
  message: string;

  constructor(success: boolean, message: string) {
    this.success = success;
    this.message = message;
  }
}

export class SuccessResponse extends ApiResponse {
  data: any;

  constructor(message: string, data?: any) {
    super(true, message);
    if (data) {
      this.data = data;
    }
  }
}

export class ErrorResponse extends ApiResponse {
  constructor(message: string) {
    super(false, message);
  }
}
