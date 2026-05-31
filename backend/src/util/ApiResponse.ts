import { Response } from "express";

export class ApiResponse {
    public readonly success: boolean;
    public readonly status: number;
    public readonly message: string;
    public readonly data?: any;

    constructor(status: number, message: string, data?: any) {
        this.success = status >= 200 && status < 300;
        this.status = status;
        this.message = message;
        this.data = data;
    }

    static send(res: Response, status: number, message: string, data?: any) {
        const response = new ApiResponse(status, message, data);
        return res.status(status).json(response);
    }
}
