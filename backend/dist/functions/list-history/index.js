"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const utils_1 = require("../../shared/utils");
const handler = async (_event) => {
    if (_event.httpMethod === 'OPTIONS')
        return (0, utils_1.buildResponse)(200, {});
    try {
        const summaries = await (0, utils_1.listSummariesFromS3)();
        return (0, utils_1.buildResponse)(200, { summaries });
    }
    catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return (0, utils_1.buildResponse)(500, { error: message });
    }
};
exports.handler = handler;
