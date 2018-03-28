"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const kHasNativePerformanceNow = typeof performance === 'object' && typeof performance.now === 'function';
exports.kHasNativePerformanceNow = kHasNativePerformanceNow;
let _now;
exports.now = _now;
if (kHasNativePerformanceNow) {
    exports.now = _now = function () {
        return performance.now();
    };
}
else {
    exports.now = _now = function () {
        return Date.now();
    };
}
