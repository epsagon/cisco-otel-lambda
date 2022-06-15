"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = void 0;
const api_1 = require("@opentelemetry/api");
function verifyToken(token) {
    if (token.startsWith('Bearer')) {
        api_1.diag.info('\'Bearer\' prefix was attached to the provided cisco-token. We recommend using a "clean" token without the prefix');
        return token;
    }
    else {
        return `Bearer ${token}`;
    }
}
exports.verifyToken = verifyToken;
//# sourceMappingURL=utils.js.map