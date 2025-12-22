<script setup>
import { ref, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 陀螺仪数据
const alpha = ref(null) // Z轴 - 绕垂直轴旋转
const beta = ref(null)  // X轴 - 前后倾斜
const gamma = ref(null) // Y轴 - 左右倾斜

// 旋转速率 (角速度)
const rotationAlpha = ref(null)
const rotationBeta = ref(null)
const rotationGamma = ref(null)

const isRunning = ref(false)
const error = ref(null)
const hasPermission = ref(false)

function goBack() {
  stopGyroscope()
  router.push('/')
}

// 处理设备方向事件
function handleOrientation(event) {
  alpha.value = event.alpha !== null ? event.alpha.toFixed(2) : null
  beta.value = event.beta !== null ? event.beta.toFixed(2) : null
  gamma.value = event.gamma !== null ? event.gamma.toFixed(2) : null
}

// 处理设备运动事件 (旋转速率)
function handleMotion(event) {
  if (event.rotationRate) {
    rotationAlpha.value = event.rotationRate.alpha !== null 
      ? event.rotationRate.alpha.toFixed(2) : null
    rotationBeta.value = event.rotationRate.beta !== null 
      ? event.rotationRate.beta.toFixed(2) : null
    rotationGamma.value = event.rotationRate.gamma !== null 
      ? event.rotationRate.gamma.toFixed(2) : null
  }
}

// 请求权限 (iOS 13+ 需要)
async function requestPermission() {
  if (typeof DeviceOrientationEvent !== 'undefined' && 
      typeof DeviceOrientationEvent.requestPermission === 'function') {
    try {
      const permission = await DeviceOrientationEvent.requestPermission()
      if (permission === 'granted') {
        hasPermission.value = true
        return true
      } else {
        error.value = '陀螺仪权限被拒绝'
        return false
      }
    } catch (err) {
      error.value = '请求权限失败: ' + err.message
      return false
    }
  }
  // Android 或其他不需要显式权限的平台
  hasPermission.value = true
  return true
}

// 启动陀螺仪
async function startGyroscope() {
  error.value = null
  
  // 检查是否支持
  if (!window.DeviceOrientationEvent) {
    error.value = '设备不支持陀螺仪'
    return
  }

  // 请求权限
  if (!hasPermission.value) {
    const granted = await requestPermission()
    if (!granted) return
  }

  // 添加事件监听器
  window.addEventListener('deviceorientation', handleOrientation)
  window.addEventListener('devicemotion', handleMotion)
  
  isRunning.value = true
}

// 停止陀螺仪
function stopGyroscope() {
  window.removeEventListener('deviceorientation', handleOrientation)
  window.removeEventListener('devicemotion', handleMotion)
  isRunning.value = false
}

// 切换启动/暂停
function toggleGyroscope() {
  if (isRunning.value) {
    stopGyroscope()
  } else {
    startGyroscope()
  }
}

// 清除数据
function clearData() {
  alpha.value = null
  beta.value = null
  gamma.value = null
  rotationAlpha.value = null
  rotationBeta.value = null
  rotationGamma.value = null
  error.value = null
}

// 组件卸载时清理
onUnmounted(() => {
  stopGyroscope()
})
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
        
        <div class="header-actions">
          <button class="action-btn clear-btn" @click="clearData" title="清除数据">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              <line x1="10" y1="11" x2="10" y2="17"/>
              <line x1="14" y1="11" x2="14" y2="17"/>
            </svg>
          </button>
        </div>
        
        <h2>陀螺仪</h2>
        <p class="subtitle">转动速率测量</p>
        
        <button 
          class="toggle-btn" 
          :class="{ running: isRunning }" 
          @click="toggleGyroscope"
        >
          <svg v-if="!isRunning" class="play-icon" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
          <svg v-else class="pause-icon" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16"/>
            <rect x="14" y="4" width="4" height="16"/>
          </svg>
          {{ isRunning ? '暂停' : '启动' }}
        </button>
      </div>

      <div class="error-box" v-if="error">
        <p class="error-text">{{ error }}</p>
      </div>

      <div class="data-section">
        <div class="section-title">
          <span class="dot orientation"></span>
          设备方向 (度)
        </div>
        <div class="data-card">
          <div class="data-row">
            <div class="data-item">
              <span class="axis-label alpha">α (Z轴)</span>
              <span class="data-value">{{ alpha ?? '--' }}°</span>
              <span class="axis-desc">绕垂直轴旋转</span>
            </div>
            <div class="data-item">
              <span class="axis-label beta">β (X轴)</span>
              <span class="data-value">{{ beta ?? '--' }}°</span>
              <span class="axis-desc">前后倾斜</span>
            </div>
            <div class="data-item">
              <span class="axis-label gamma">γ (Y轴)</span>
              <span class="data-value">{{ gamma ?? '--' }}°</span>
              <span class="axis-desc">左右倾斜</span>
            </div>
          </div>
        </div>
      </div>

      <div class="data-section">
        <div class="section-title">
          <span class="dot rotation"></span>
          旋转速率 (°/s)
        </div>
        <div class="data-card">
          <div class="data-row">
            <div class="data-item">
              <span class="axis-label alpha">α</span>
              <span class="data-value">{{ rotationAlpha ?? '--' }}</span>
            </div>
            <div class="data-item">
              <span class="axis-label beta">β</span>
              <span class="data-value">{{ rotationBeta ?? '--' }}</span>
            </div>
            <div class="data-item">
              <span class="axis-label gamma">γ</span>
              <span class="data-value">{{ rotationGamma ?? '--' }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="status-bar" :class="{ active: isRunning }">
        <span class="status-dot"></span>
        {{ isRunning ? '正在采集数据...' : '已暂停' }}
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
  color: #f857a6;
  font-size: 1rem;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  transition: background 0.2s;
}

.back-btn:active {
  background: rgba(248, 87, 166, 0.1);
}

.back-btn svg {
  width: 20px;
  height: 20px;
}

.header-actions {
  position: absolute;
  top: -20px;
  right: 0;
  display: flex;
  gap: 8px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-btn {
  background: rgba(255, 59, 48, 0.1);
  color: #ff3b30;
}

.clear-btn:active {
  background: rgba(255, 59, 48, 0.2);
  transform: scale(0.95);
}

.action-btn svg {
  width: 20px;
  height: 20px;
}

h2 {
  margin: 0 0 4px 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a1a;
}

.subtitle {
  margin: 0 0 16px 0;
  font-size: 0.9rem;
  color: #888;
}

.toggle-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 32px;
  border: none;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  background: linear-gradient(145deg, #f857a6 0%, #ff5858 100%);
  color: #fff;
  box-shadow: 0 4px 15px rgba(248, 87, 166, 0.4);
}

.toggle-btn.running {
  background: linear-gradient(145deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.toggle-btn:active {
  transform: scale(0.97);
}

.toggle-btn svg {
  width: 18px;
  height: 18px;
}

.error-box {
  background: #fff5f5;
  border: 1px solid #ffcccc;
  padding: 12px 16px;
  border-radius: 12px;
  text-align: center;
}

.error-text {
  color: #d8000c;
  margin: 0;
  font-size: 0.9rem;
  font-weight: 500;
}

.data-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.dot.orientation {
  background: linear-gradient(145deg, #00c6fb 0%, #005bea 100%);
}

.dot.rotation {
  background: linear-gradient(145deg, #f857a6 0%, #ff5858 100%);
}

.data-card {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.data-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.data-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 4px;
}

.axis-label {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 4px;
  text-transform: uppercase;
}

.axis-label.alpha {
  background: rgba(0, 198, 251, 0.15);
  color: #005bea;
}

.axis-label.beta {
  background: rgba(248, 87, 166, 0.15);
  color: #f857a6;
}

.axis-label.gamma {
  background: rgba(76, 175, 80, 0.15);
  color: #388e3c;
}

.data-value {
  font-size: 1.5rem;
  font-weight: 700;
  font-feature-settings: "tnum";
  color: #1a1a1a;
}

.axis-desc {
  font-size: 0.7rem;
  color: #999;
}

.status-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px;
  border-radius: 10px;
  background: #e0e0e0;
  color: #666;
  font-size: 0.85rem;
  font-weight: 500;
  margin-top: auto;
}

.status-bar.active {
  background: rgba(76, 175, 80, 0.15);
  color: #388e3c;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #999;
}

.status-bar.active .status-dot {
  background: #4caf50;
  animation: blink 1s ease-in-out infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
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

  .data-value {
    color: #fff;
  }

  .back-btn {
    color: #e94560;
  }

  .back-btn:active {
    background: rgba(233, 69, 96, 0.1);
  }

  .clear-btn {
    background: rgba(255, 59, 48, 0.15);
  }

  .section-title {
    color: #aaa;
  }

  .status-bar {
    background: #2a2a2a;
    color: #888;
  }

  .status-bar.active {
    background: rgba(76, 175, 80, 0.2);
    color: #81c784;
  }

  .axis-label.alpha {
    background: rgba(0, 198, 251, 0.2);
    color: #4dabf7;
  }

  .axis-label.beta {
    background: rgba(248, 87, 166, 0.2);
    color: #f06595;
  }

  .axis-label.gamma {
    background: rgba(76, 175, 80, 0.2);
    color: #81c784;
  }
}
</style>
