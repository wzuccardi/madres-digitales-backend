"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForbiddenError = void 0;
const base_error_1 = require("./base.error");
class ForbiddenError extends base_error_1.BaseError {
    constructor(message = 'Acceso prohibido') {
        super(message, 403);
        this.name = 'ForbiddenError';
    }
}
exports.ForbiddenError = ForbiddenError;
