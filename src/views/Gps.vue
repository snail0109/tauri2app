<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from 'vue-router'
import {
  checkPermissions,
  requestPermissions,
  getCurrentPosition,
} from "@tauri-apps/plugin-geolocation";

const router = useRouter()

const latitude = ref(null);
const longitude = ref(null);
const accuracy = ref(null);
const altitude = ref(null);
const altitudeAccuracy = ref(null);
const error = ref(null);
const loading = ref(false);
const statusMsg = ref("");

function goBack() {
  router.push('/')
}

async function getLocation() {
  loading.value = true;
  error.value = null;
  latitude.value = null;
  longitude.value = null;
  accuracy.value = null;
  statusMsg.value = "正在获取权限...";

  try {
    let permissions = await checkPermissions();

    if (
      permissions.location === 'prompt' ||
      permissions.location === 'prompt-with-rationale'
    ) {
      statusMsg.value = "等待用户授权...";
      permissions = await requestPermissions(['location']);
    }

    if (permissions.location !== 'granted') {
      error.value = "权限被拒绝，无法获取位置";
      loading.value = false;
      statusMsg.value = "";
      return;
    }

    statusMsg.value = "正在搜索卫星(GPS)...";

    // 1. 尝试获取高精度位置 (30s 超时, 允许 5s 内的缓存)
    // 增加超时时间以应对冷启动
    const highAccuracyPos = await getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 30000,
      maximumAge: 5000
    });

    updatePosition(highAccuracyPos);
    loading.value = false;
    statusMsg.value = "";

  } catch (err) {
    console.warn("High accuracy GPS failed/timed out:", err);
    statusMsg.value = "GPS信号弱，尝试网络定位...";

    try {
      // 2. 降级尝试低精度/网络定位 (20s 超时, 允许 1min 内的缓存)
      const lowAccuracyPos = await getCurrentPosition({
        enableHighAccuracy: false,
        timeout: 20000,
        maximumAge: 60000
      });

      updatePosition(lowAccuracyPos);
      loading.value = false;
      statusMsg.value = "";

    } catch (retryErr) {
      console.error("All location attempts failed:", retryErr);
      handleError(err); // 优先显示高精度的错误信息（通常是超时）
    }
  }
}

function formatToDMS(value) {
  if (value === null || value === undefined) return null;
  const abs = Math.abs(value);
  const degrees = Math.floor(abs);
  const minutes = Math.floor((abs - degrees) * 60);
  const seconds = ((abs - degrees) * 60 - minutes) * 60;
  return `${degrees}° ${minutes}′ ${seconds.toFixed(2)}″`;
}

function updatePosition(position) {
  latitude.value = formatToDMS(position.coords.latitude);
  longitude.value = formatToDMS(position.coords.longitude);
  accuracy.value = position.coords.accuracy ? position.coords.accuracy.toFixed(2) : null;
  altitudeAccuracy.value = position.coords.altitudeAccuracy ? position.coords.altitudeAccuracy.toFixed(2) : null;
  altitude.value = position.coords.altitude ? position.coords.altitude.toFixed(2) : null;
}

function handleError(err) {
  let msg = "定位失败";
  if (typeof err === 'object' && err.message) {
    msg += `: ${err.message}`;
  } else if (typeof err === 'string') {
    msg = err;
  }

  if (msg.includes("denied")) {
    error.value = "定位权限被拒绝，请到设置中开启";
  } else if (msg.includes("timeout")) {
    error.value = "定位超时，请检查GPS或网络状态";
  } else {
    error.value = "无法获取位置，请确保开启了系统定位开关";
  }
  loading.value = false;
  statusMsg.value = "";
}

onMounted(() => {
  getLocation();
});
</script>

<template>
  <div class="screen">
    <div class="content-wrapper">
      <div class="header">
        <button class="back-btn" @click="goBack">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          返回
        </button>
        <h2>GPS 定位</h2>
        <div class="status-badge" v-if="loading">
          <span class="loader"></span> {{ statusMsg || '定位中...' }}
        </div>
      </div>

      <div class="data-card" v-if="!error">
        <div class="coord-row">
          <div class="coord-item">
            <span class="label">纬度</span>
            <span class="value">{{ latitude || '--° --′ --″' }}</span>
          </div>
          <div class="coord-item">
            <span class="label">经度</span>
            <span class="value">{{ longitude || '--° --′ --″' }}</span>
          </div>
        </div>
        <div class="coord-row">
          <div class="coord-item">
            <span class="label">海拔</span>
            <span class="value">{{ altitude || '--.------' }}</span>
          </div>
          <div class="coord-item">
            <span class="label">海拔坐标精度等级</span>
            <span class="value">{{ altitudeAccuracy || '--.--' }} 米</span>
          </div>
        </div>

        <div class="meta-row" v-if="accuracy">
          <span class="accuracy-tag" :class="accuracy < 50 ? 'good' : 'bad'">
            精度: ±{{ accuracy }}米
          </span>
          <span class="source-tag">{{ accuracy < 50 ? 'GPS/高精度' : '网络/低精度' }}</span>
        </div>
      </div>

      <div class="error-box" v-else>
        <p class="error-text">{{ error }}</p>
      </div>

      <div class="action-area">
        <button class="reload-btn" @click="getLocation" :disabled="loading">
          {{ loading ? '正在定位...' : '重新定位' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.screen {
  height: 100%;
  width: 100%;
  background: #f0f2f5;
  color: #333;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 20px;
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  overscroll-behavior: none;
}

.content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 16px;
  max-width: 500px;
  margin: 0 auto;
  width: 100%;
  padding-top: 40px;
}

.header {
  text-align: center;
  position: relative;
}

.back-btn {
  position: absolute;
  top: -20px;
  left: 0;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: transparent;
  border: none;
  color: #007bff;
  font-size: 1rem;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  transition: background 0.2s;
}

.back-btn:active {
  background: rgba(0, 123, 255, 0.1);
}

.back-btn svg {
  width: 20px;
  height: 20px;
}

h2 {
  margin: 0 0 10px 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a1a;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #e6f7ff;
  color: #007bff;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
}

.data-card {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.coord-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.coord-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.label {
  font-size: 0.8rem;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.value {
  font-size: 1.4rem;
  font-weight: 600;
  font-feature-settings: "tnum";
  color: #2c3e50;
}

.meta-row {
  display: flex;
  justify-content: center;
  gap: 10px;
  border-top: 1px solid #eee;
  padding-top: 15px;
}

.accuracy-tag,
.source-tag {
  font-size: 0.85rem;
  padding: 4px 8px;
  border-radius: 4px;
  background: #f5f5f5;
  color: #666;
  font-weight: 500;
}

.accuracy-tag.good {
  background: #d4edda;
  color: #155724;
}

.accuracy-tag.bad {
  background: #fff3cd;
  color: #856404;
}

.error-box {
  background: #fff5f5;
  border: 1px solid #ffcccc;
  padding: 20px;
  border-radius: 12px;
  text-align: center;
}

.error-text {
  color: #d8000c;
  margin: 0;
  font-weight: 500;
}

.action-area {
  margin-top: auto;
  padding-bottom: 20px;
}

.reload-btn {
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: 12px;
  background: #007bff;
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.1s, background 0.2s;
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
}

.reload-btn:active {
  transform: scale(0.98);
}

.reload-btn:disabled {
  background: #a0c4ff;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.loader {
  width: 14px;
  height: 14px;
  border: 2px solid currentColor;
  border-bottom-color: transparent;
  border-radius: 50%;
  display: inline-block;
  animation: rotation 1s linear infinite;
}

@keyframes rotation {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

@media (prefers-color-scheme: dark) {
  .screen {
    background: #121212;
    color: #e0e0e0;
  }

  .data-card {
    background: #1e1e1e;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  }

  h2 {
    color: #fff;
  }

  .value {
    color: #fff;
  }

  .status-badge {
    background: #1a2733;
    color: #4dabf7;
  }

  .back-btn {
    color: #4dabf7;
  }

  .back-btn:active {
    background: rgba(77, 171, 247, 0.1);
  }

  .reload-btn {
    background: #0d6efd;
  }

  .meta-row {
    border-top-color: #333;
  }

  .accuracy-tag,
  .source-tag {
    background: #333;
    color: #ccc;
  }

  .accuracy-tag.good {
    background: #1e4620;
    color: #d4edda;
  }

  .accuracy-tag.bad {
    background: #4d3e04;
    color: #fff3cd;
  }
}
</style>

