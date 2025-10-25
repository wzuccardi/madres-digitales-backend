"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConflictError = void 0;
const base_error_1 = require("./base.error");
class ConflictError extends base_error_1.BaseError {
    constructor(message = 'Conflicto de datos') {
        super(message, 409);
        this.name = 'ConflictError';
    }
}
exports.ConflictError = ConflictError;
