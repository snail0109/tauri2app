import AMapLoader from "@amap/amap-jsapi-loader";

const AMAP_KEY = import.meta.env.VITE_AMAP_KEY;
const AMAP_SECURITY_JS_CODE = import.meta.env.VITE_AMAP_SECURITY_JS_CODE;

let amapSdkLoadingPromise = null;

export function loadAmapSdk() {
  if (window.AMap) return Promise.resolve(window.AMap);
  if (amapSdkLoadingPromise) return amapSdkLoadingPromise;
  if (!AMAP_KEY) {
    return Promise.reject(new Error("未配置 VITE_AMAP_KEY"));
  }
  if (!AMAP_SECURITY_JS_CODE) {
    return Promise.reject(new Error("未配置 VITE_AMAP_SECURITY_JS_CODE"));
  }

  window._AMapSecurityConfig = {
    securityJsCode: AMAP_SECURITY_JS_CODE,
  };

  amapSdkLoadingPromise = AMapLoader.load({
    key: AMAP_KEY,
    version: "2.0",
    plugins: ["AMap.Geolocation"],
  });

  return amapSdkLoadingPromise;
}

export function getAmapPosition() {
  return new Promise(async (resolve, reject) => {
    try {
      const AMap = await loadAmapSdk();
      const geolocation = new AMap.Geolocation({
        enableHighAccuracy: true,
        timeout: 10000,
        convert: true,
        needAddress: false
      });

      geolocation.getCurrentPosition((status, result) => {
        if (status !== "complete" || !result || !result.position) {
          const errMsg = result?.message || "高德定位返回异常";
          reject(new Error(errMsg));
          return;
        }
        const lng = typeof result.position.lng === "number" ? result.position.lng : result.position.getLng?.();
        const lat = typeof result.position.lat === "number" ? result.position.lat : result.position.getLat?.();
        if (typeof lat !== "number" || typeof lng !== "number") {
          reject(new Error("高德定位坐标解析失败"));
          return;
        }

        resolve({
          coords: {
            latitude: lat,
            longitude: lng,
            accuracy: typeof result.accuracy === "number" ? result.accuracy : null,
            altitude: null,
            altitudeAccuracy: null
          }
        });
      });
    } catch (e) {
      reject(e);
    }
  });
}
