const kHasNativePerformanceNow =
    typeof performance === 'object' && typeof performance.now === 'function';
let _now;
if (kHasNativePerformanceNow) {
    _now = function () {
        return performance.now();
    };
} else {
    _now = function () {
        return Date.now();
    };
}
export {_now as now, kHasNativePerformanceNow};