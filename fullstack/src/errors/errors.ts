export class CustomError extends Error {
    code: number;
    constructor(message: string, code: number) {
        super(message);
        this.name = 'CustomError';
        this.code = code;
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
}

export class NotFoundError extends CustomError {
    constructor(message: string) {
        super(message, 404);
        this.name = 'NotFoundError';
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
}

export class UnauthorizedError extends CustomError {
    constructor(message: string) {
        super(message, 401);
        this.name = 'UnauthorizedError';
        Object.setPrototypeOf(this, UnauthorizedError.prototype);
    }
}

export class ForbiddenError extends CustomError {
    constructor(message: string) {
        super(message, 403);
        this.name = 'ForbiddenError';
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
}

export class ConflictError extends CustomError {
    constructor(message: string) {
        super(message, 409);
        this.name = 'ConflictError';
        Object.setPrototypeOf(this, ConflictError.prototype);
    }
}

export class ValidationError extends CustomError {
    constructor(message: string) {
        super(message, 400);
        this.name = 'ValidationError';
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
}
