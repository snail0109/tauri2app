<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function goToGps() {
  router.push('/gps')
}

function goToGyroscope() {
  router.push('/gyroscope')
}

function goToLightSensor() {
  router.push('/light-sensor')
}
</script>

<template>
  <div class="home-screen">
    <div class="home-content">
      <h1 class="app-title">传感器工具</h1>
      <p class="app-subtitle">选择要使用的功能</p>

      <div class="feature-grid">
        <button class="feature-card gps-card" @click="goToGps">
          <div class="icon-wrapper">
            <svg class="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
              <circle cx="12" cy="12" r="9" stroke-dasharray="4 2" />
            </svg>
          </div>
          <span class="feature-title">定位 GPS</span>
          <span class="feature-desc">获取当前位置坐标</span>
        </button>

        <button class="feature-card gyro-card" @click="goToGyroscope">
          <div class="icon-wrapper">
            <svg class="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <ellipse cx="12" cy="12" rx="3" ry="10" />
              <ellipse cx="12" cy="12" rx="10" ry="3" />
            </svg>
          </div>
          <span class="feature-title">陀螺仪</span>
          <span class="feature-desc">测量转动速率</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-screen {
  min-height: 100vh;
  width: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  box-sizing: border-box;
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
}

.home-content {
  text-align: center;
  width: 100%;
  max-width: 400px;
}

.app-title {
  font-size: 2rem;
  font-weight: 700;
  color: #fff;
  margin: 0 0 8px 0;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.app-subtitle {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.85);
  margin: 0 0 40px 0;
  font-weight: 400;
}

.feature-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.feature-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 28px 24px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.feature-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
  pointer-events: none;
}

.gps-card {
  background: linear-gradient(145deg, #00c6fb 0%, #005bea 100%);
  box-shadow: 0 8px 32px rgba(0, 91, 234, 0.4);
}

.gps-card:active {
  transform: scale(0.97);
  box-shadow: 0 4px 16px rgba(0, 91, 234, 0.4);
}

.gyro-card {
  background: linear-gradient(145deg, #f857a6 0%, #ff5858 100%);
  box-shadow: 0 8px 32px rgba(248, 87, 166, 0.4);
}

.gyro-card:active {
  transform: scale(0.97);
  box-shadow: 0 4px 16px rgba(248, 87, 166, 0.4);
}

.light-card {
  background: linear-gradient(145deg, #ffd93d 0%, #ff9800 100%);
  box-shadow: 0 8px 32px rgba(255, 152, 0, 0.4);
}

.light-card:active {
  transform: scale(0.97);
  box-shadow: 0 4px 16px rgba(255, 152, 0, 0.4);
}

.light-card .feature-title,
.light-card .feature-desc {
  color: #1a1a1a;
}

.light-card .feature-desc {
  color: rgba(0, 0, 0, 0.7);
}

.icon-wrapper {
  width: 64px;
  height: 64px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.feature-icon {
  width: 32px;
  height: 32px;
  color: #fff;
}

.feature-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #fff;
  letter-spacing: 0.5px;
}

.feature-desc {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 400;
}

@media (prefers-color-scheme: dark) {
  .home-screen {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  }

  .gps-card {
    background: linear-gradient(145deg, #00a8cc 0%, #003d5c 100%);
  }

  .gyro-card {
    background: linear-gradient(145deg, #e94560 0%, #7b2d3f 100%);
  }

  .light-card {
    background: linear-gradient(145deg, #cc9900 0%, #996600 100%);
  }

  .light-card .feature-title {
    color: #fff;
  }

  .light-card .feature-desc {
    color: rgba(255, 255, 255, 0.8);
  }
}
</style>
