<template>
  <view class="container">
    <!-- 顶部状态栏占位 -->
    <TopSafeArea />
    
    <!-- 头部 -->
    <view class="header">
      <view class="user-info" @click="toggleFamily">
        <image class="avatar" src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100&h=100" mode="aspectFill"></image>
        <view class="greeting">
          <text class="h1">早安，张爷爷</text>
          <view class="sub-text">
            <text>当前管理: 我自己</text>
            <view class="arrow-down"></view>
          </view>
        </view>
      </view>
      <view class="notification-btn">
        <!-- 铃铛图标 -->
        <view class="icon-bell icon-bg"></view>
        <view class="dot"></view>
      </view>
    </view>

    <scroll-view scroll-y class="scroll-content">
      <!-- 抢号提醒卡片 -->
      <view class="reminder-card" :class="{ active: countdownState === 'upcoming', running: countdownState === 'running' }" @click="goBookingNew">
        <view class="card-bg-decoration"></view>
        <view class="reminder-header">
          <view class="flex-center">
            <view class="icon-small-white icon-bg-clock"></view>
            <text class="ml-4">抢号提醒</text>
          </view>
          <text>{{ isToday ? '今天' : nextDayLabel }}</text>
        </view>
        <view class="reminder-content">
          <view class="reminder-info">
            <text class="h2">{{ bookingTask.hospital }} - {{ bookingTask.department }}</text>
            <text class="p-white">{{ bookingTask.tag }}</text>
          </view>
          <view class="countdown">
            <text class="timer">{{ countdownText }}</text>
            <text class="timer-label">{{ countdownState === 'upcoming' ? '后开始抢号' : '开抢中' }}</text>
          </view>
        </view>
        <view class="remind-strategy">
          <view class="chip" :class="{ on: strategies.preDay }" @click.stop="toggleStrategy('preDay')">前1天</view>
          <view class="chip" :class="{ on: strategies.pre30 }" @click.stop="toggleStrategy('pre30')">前30分钟</view>
          <view class="chip" :class="{ on: strategies.pre5 }" @click.stop="toggleStrategy('pre5')">前5分钟</view>
          <view v-if="bookingTask.link" class="chip link" @click.stop="copyLink">复制链接</view>
          <view v-if="countdownState==='running'" class="chip cta" @click.stop="goToLink">去抢号</view>
        </view>
      </view>

      <!-- 快捷服务 Grid -->
      <view class="section-title">
        <text class="title-text">快捷服务</text>
      </view>
      <view class="grid-menu">
        <view class="menu-item" @click="goMedsAdd">
          <view class="icon-box box-blue">
            <view class="menu-icon icon-bg-pill"></view>
          </view>
          <text class="menu-text">拍药盒</text>
        </view>
        <view class="menu-item" @click="goReportsNew">
          <view class="icon-box box-green">
            <view class="ai-badge">AI</view>
            <view class="menu-icon icon-bg-report"></view>
          </view>
          <text class="menu-text">解报告</text>
        </view>
        <view class="menu-item" @click="goBillingNew">
          <view class="icon-box box-orange">
            <view class="menu-icon icon-bg-bill"></view>
          </view>
          <text class="menu-text">记费用</text>
        </view>
        <view class="menu-item" @click="goFilesClinic">
          <view class="icon-box box-purple">
            <view class="menu-icon icon-bg-folder"></view>
          </view>
          <text class="menu-text">病历夹</text>
        </view>
      </view>

      <!-- 今日用药 -->
      <view class="section-title">
        <text class="title-text">今日用药</text>
        <view class="more-link" @click="goMedsIndex">
          <text>全部 {{ medListAll.length }}</text>
          <text class="arrow-right">></text>
        </view>
      </view>

      <view class="med-time-tabs">
        <view
          v-for="tab in timeTabs"
          :key="tab.key"
          :class="['time-tab', { active: selectedTab === tab.key }]"
          @click="selectedTab = tab.key"
        >
          <text>{{ tab.label }}</text>
        </view>
      </view>

      <view class="med-list">
        <view 
          v-for="(item, index) in medList" 
          :key="index" 
          class="med-card" 
          :class="['slot-' + (item.slot || 'morning'), { checked: item.checked }]"
        >
          <view class="med-left">
            <view class="med-icon-bg">
              <!-- 药图标 -->
              <view class="med-icon icon-bg-med"></view>
            </view>
            <view class="med-info">
              <text class="med-name">{{ item.name }}</text>
              <text class="med-desc">{{ item.desc }}</text>
            </view>
          </view>
          <view class="check-btn" @click="toggleCheck(index)">
            <view v-if="item.checked" class="check-icon icon-bg-check"></view>
            <view v-else class="check-icon-placeholder icon-bg-check-gray"></view>
          </view>
        </view>
      </view>
      
      <!-- 底部安全区垫高 -->
      <view class="safe-area-spacer"></view>
    </scroll-view>

    <!-- 统一 TabBar -->
    <CustomTabBar active="home" />
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import CustomTabBar from '@/components/CustomTabBar.vue';
import TopSafeArea from '@/components/TopSafeArea.vue';

const timeTabs = [
  { key: 'all', label: '全部' },
  { key: 'morning', label: '早上' },
  { key: 'noon', label: '中午' },
  { key: 'evening', label: '晚上' }
];
const selectedTab = ref('morning');
const medListAll = ref([
  { name: '阿莫西林胶囊', desc: '0.5g x 2粒 · 饭后服用', checked: false, slot: 'noon' },
  { name: '降压药 (厄贝沙坦)', desc: '1粒 · 早餐前', checked: false, slot: 'morning' },
  { name: '维生素 C', desc: '1片 · 随餐', checked: true, slot: 'evening' }
]);
const medList = computed(() => {
  if (selectedTab.value === 'all') return medListAll.value;
  return medListAll.value.filter(i => i.slot === selectedTab.value);
});

const toggleCheck = (index) => {
  medList.value[index].checked = !medList.value[index].checked;
  if (medList.value[index].checked) {
    uni.showToast({ title: '已完成服药打卡', icon: 'success' });
  }
};

const showToast = (msg) => {
  uni.showToast({ title: msg, icon: 'none' });
};

const toggleFamily = () => {
  uni.showActionSheet({
    itemList: ['我自己', '张爷爷', '李奶奶'],
    success: (res) => {
      showToast('切换至: ' + ['我自己', '张爷爷', '李奶奶'][res.tapIndex]);
    }
  });
};

const goMedsIndex = () => {
  uni.navigateTo({ url: '/pages/meds/index' });
};
const goFilesClinic = () => {
  const tab = encodeURIComponent('门诊病历');
  uni.navigateTo({ url: `/pages/files/index?tab=${tab}` });
};
const goMedsAdd = () => {
  uni.navigateTo({ url: '/pages/meds/add' });
};
const goReportsNew = () => {
  uni.navigateTo({ url: '/pages/reports/new' });
};
const goBillingNew = () => {
  uni.navigateTo({ url: '/pages/billing/new' });
};
const goBookingNew = () => {
  uni.navigateTo({ url: '/pages/booking/index' });
};

const nowMs = () => new Date().getTime();
const inThirtyMinutes = () => nowMs() + 30 * 60 * 1000;
const bookingTask = ref({
  hospital: '协和医院',
  department: '皮肤科',
  tag: '专家号 / 周三上午',
  openTime: inThirtyMinutes(),
  link: 'https://www.hospital.example.com/booking'
});
const strategies = ref({ preDay: true, pre30: true, pre5: true });
const toggleStrategy = (k) => {
  strategies.value[k] = !strategies.value[k];
  uni.showToast({ title: `${strategies.value[k] ? '已开启' : '已关闭'}: ${k==='preDay'?'前1天':k==='pre30'?'前30分钟':'前5分钟'}`, icon: 'none' });
};
const copyLink = () => {
  if (!bookingTask.value.link) return;
  uni.setClipboardData({ data: bookingTask.value.link, success: () => uni.showToast({ title: '链接已复制', icon: 'success' }) });
};
const goToLink = () => {
  if (!bookingTask.value.link) return;
  if (typeof window !== 'undefined') {
    window.open(bookingTask.value.link, '_blank');
  }
};
const isToday = computed(() => {
  const t = new Date(bookingTask.value.openTime);
  const n = new Date();
  return t.getFullYear() === n.getFullYear() && t.getMonth() === n.getMonth() && t.getDate() === n.getDate();
});
const nextDayLabel = computed(() => {
  const t = new Date(bookingTask.value.openTime);
  const weekdays = ['周日','周一','周二','周三','周四','周五','周六'];
  return `${t.getMonth()+1}月${t.getDate()}日 · ${weekdays[t.getDay()]}`;
});
const remainingMs = ref(bookingTask.value.openTime - nowMs());
const countdownState = computed(() => (remainingMs.value > 0 ? 'upcoming' : 'running'));
const pad2 = (n) => (n < 10 ? '0' + n : '' + n);
const msToText = (ms) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  const hh = Math.floor(s / 3600);
  const mm = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  return `${pad2(hh)}:${pad2(mm)}:${pad2(ss)}`;
};
const countdownText = computed(() => (countdownState.value === 'upcoming' ? msToText(remainingMs.value) : '00:00:00'));
let timer;
onMounted(() => {
  timer = setInterval(() => {
    remainingMs.value = bookingTask.value.openTime - nowMs();
  }, 1000);
  const h = new Date().getHours();
  if (h >= 5 && h < 11) selectedTab.value = 'morning';
  else if (h >= 11 && h < 15) selectedTab.value = 'noon';
  else selectedTab.value = 'evening';
});
onUnmounted(() => { if (timer) clearInterval(timer); });
</script>

<style lang="scss">
/* 变量已在 uni.scss 中引入 src/styles/theme.scss */

.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: $bg-body;
  font-family: -apple-system, BlinkMacSystemFont, "San Francisco", Helvetica, Arial, sans-serif;
  overflow: hidden;
}

.status-bar-placeholder {
  height: var(--status-bar-height);
  height: constant(safe-area-inset-top);
  height: env(safe-area-inset-top);
  width: 100%;
  background-color: transparent;
  flex-shrink: 0;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 32rpx;
  margin-bottom: 10rpx;
  flex-shrink: 0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.avatar {
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  border: 4rpx solid #fff;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.1);
}

.greeting {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.h1 {
  font-size: 36rpx;
  font-weight: 700;
  color: $text-main;
}

.sub-text {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 24rpx;
  color: $text-sub;
}

.arrow-down {
  width: 0; 
  height: 0; 
  border-left: 8rpx solid transparent;
  border-right: 8rpx solid transparent;
  border-top: 10rpx solid $text-sub;
}

.notification-btn {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.05);
}

.icon-bell {
  width: 40rpx;
  height: 40rpx;
}

/* 图标样式处理 */
.icon-bg {
    background-color: #333;
    mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMTggOEE2IDYgMCAwIDAgNiA4YzAgNy0zIDktMyA5aDE4cy0zLTItMy05Ii8+PHBhdGggZD0iTTEzLjczIDIxYTIgMiAwIDAgMS0zLjQ2IDAiLz48L3N2Zz4=");
    -webkit-mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMTggOEE2IDYgMCAwIDAgNiA4YzAgNy0zIDktMyA5aDE4cy0zLTItMy05Ii8+PHBhdGggZD0iTTEzLjczIDIxYTIgMiAwIDAgMS0zLjQ2IDAiLz48L3N2Zz4=");
    mask-size: contain;
    -webkit-mask-size: contain;
    mask-repeat: no-repeat;
    -webkit-mask-repeat: no-repeat;
    mask-position: center;
    -webkit-mask-position: center;
}

.dot {
  position: absolute;
  top: 20rpx;
  right: 20rpx;
  width: 16rpx;
  height: 16rpx;
  background: $alert-color;
  border-radius: 50%;
  border: 2rpx solid #fff;
}

.scroll-content {
  flex: 1;
  padding: 0 32rpx;
  box-sizing: border-box;
  overflow-y: auto;
}

/* 抢号卡片 */
.reminder-card {
  background: linear-gradient(135deg, #007AFF 0%, #00C6FF 100%);
  border-radius: 40rpx;
  padding: 40rpx;
  color: #fff;
  margin-bottom: 48rpx;
  position: relative;
  overflow: hidden;
  box-shadow: 0 16rpx 40rpx rgba(0, 122, 255, 0.25);
}

.reminder-card.active { animation: pulseGlow 2s infinite; }
.reminder-card.running { background: linear-gradient(135deg, #0a84ff 0%, #34c759 100%); box-shadow: 0 16rpx 40rpx rgba(52, 199, 89, 0.25); }

@keyframes pulseGlow { 0% { box-shadow: 0 16rpx 40rpx rgba(0,122,255,0.25); } 50% { box-shadow: 0 24rpx 56rpx rgba(0,122,255,0.45); } 100% { box-shadow: 0 16rpx 40rpx rgba(0,122,255,0.25); } }

.card-bg-decoration {
  position: absolute;
  top: -40rpx;
  right: -40rpx;
  width: 200rpx;
  height: 200rpx;
  background: rgba(255,255,255,0.1);
  border-radius: 50%;
  pointer-events: none;
}

.reminder-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 24rpx;
  opacity: 0.9;
  margin-bottom: 16rpx;
}

.flex-center {
  display: flex;
  align-items: center;
}

.ml-4 {
  margin-left: 8rpx;
}

.icon-small-white {
  width: 28rpx;
  height: 28rpx;
}
.icon-bg-clock {
    background-color: #fff;
    mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiI+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiLz48cG9seWxpbmUgcG9pbnRzPSIxMiA2IDEyIDEyIDE2IDE0Ii8+PC9zdmc+");
    -webkit-mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiI+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiLz48cG9seWxpbmUgcG9pbnRzPSIxMiA2IDEyIDEyIDE2IDE0Ii8+PC9zdmc+");
    mask-size: contain; -webkit-mask-size: contain; mask-repeat: no-repeat; -webkit-mask-repeat: no-repeat; mask-position: center; -webkit-mask-position: center;
}

.reminder-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.reminder-info {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.h2 {
  font-size: 40rpx;
  font-weight: 700;
}

.p-white {
  font-size: 26rpx;
  opacity: 0.9;
}

.countdown {
  text-align: right;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.timer {
  font-size: 48rpx;
  font-weight: 800;
  font-feature-settings: "tnum";
  font-variant-numeric: tabular-nums;
}

.remind-strategy { margin-top: 24rpx; display: flex; gap: 12rpx; }
.chip { padding: 8rpx 16rpx; border-radius: 999rpx; background: rgba(255,255,255,0.18); color: #fff; font-size: 22rpx; }
.chip.on { background: rgba(255,255,255,0.28); }
.chip.link { background: rgba(0,0,0,0.25); }
.chip.cta { background: #fff; color: #007aff; font-weight: 700; }

.timer-label {
  font-size: 22rpx;
  opacity: 0.8;
}

/* 快捷菜单 */
.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32rpx;
}

.title-text {
  font-size: 36rpx;
  font-weight: 700;
  color: $text-main;
}

.more-link {
  font-size: 26rpx;
  color: $primary-color;
  display: flex;
  align-items: center;
  gap: 4rpx;
}

.arrow-right {
  font-family: monospace;
  font-weight: bold;
}

.grid-menu {
  display: flex;
  justify-content: space-between;
  margin-bottom: 60rpx;
}

.menu-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
}

.icon-box {
  width: 112rpx;
  height: 112rpx;
  border-radius: 32rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  box-shadow: 0 8rpx 24rpx rgba(0,0,0,0.03);
}

.menu-icon {
  width: 48rpx;
  height: 48rpx;
}
.icon-bg-pill {
    background-color: $primary-color;
    mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiI+PHJlY3QgeD0iMiIgeT0iNiIgd2lkdGg9IjIwIiBoZWlnaHQ9IjEyIiByeD0iNiIvPjxwYXRoIGQ9Ik0xMiA2djEyIi8+PC9zdmc+");
    -webkit-mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiI+PHJlY3QgeD0iMiIgeT0iNiIgd2lkdGg9IjIwIiBoZWlnaHQ9IjEyIiByeD0iNiIvPjxwYXRoIGQ9Ik0xMiA2djEyIi8+PC9zdmc+");
    mask-size: contain; -webkit-mask-size: contain; mask-repeat: no-repeat; -webkit-mask-repeat: no-repeat; mask-position: center; -webkit-mask-position: center;
}
.icon-bg-report {
    background-color: $success-color;
    mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiI+PHBhdGggZD0iTTE0IDJINmEyIDIgMCAwIDAtMiAyejE2YTIgMiAwIDAgMCAyIDJoMTJhMiAyIDAgMCAwIDItMlY4eiIvPjxwb2x5bGluZSBwb2ludHM9IjE0IDIgMTQgOCAyMCA4Ii8+PHBhdGggZD0iTTEyIDE4di02Ii8+PHBhdGggZD0iTTkgMTVoNiIvPjwvc3ZnPg==");
    -webkit-mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiI+PHBhdGggZD0iTTE0IDJINmEyIDIgMCAwIDAtMiAyejE2YTIgMiAwIDAgMCAyIDJoMTJhMiAyIDAgMCAwIDItMlY4eiIvPjxwb2x5bGluZSBwb2ludHM9IjE0IDIgMTQgOCAyMCA4Ii8+PHBhdGggZD0iTTEyIDE4di02Ii8+PHBhdGggZD0iTTkgMTVoNiIvPjwvc3ZnPg==");
    mask-size: contain; -webkit-mask-size: contain; mask-repeat: no-repeat; -webkit-mask-repeat: no-repeat; mask-position: center; -webkit-mask-position: center;
}
.icon-bg-bill {
    background-color: #FF9500;
    mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiI+PHBhdGggZD0iTTQgNHYxNmEyIDIgMCAwIDAgMiAyaDEyYTIgMiAwIDAgMCAyLTJWOC4zNDJhMiAyIDAgMCAwLS42MDItMS40M2wtNC40NC00LjM0MkEyIDIgMCAwIDAgMTMuNTYgMkg2YTIgMiAwIDAgMC0yIDJ6Ii8+PHBhdGggZD0iTTkgMTNoNiIvPjxwYXRoIGQ9Ik05IDE3aDYiLz48cGF0aCBkPSJNMTQgMnY2aDYiLz48L3N2Zz4=");
    -webkit-mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiI+PHBhdGggZD0iTTQgNHYxNmEyIDIgMCAwIDAgMiAyaDEyYTIgMiAwIDAgMCAyLTJWOC4zNDJhMiAyIDAgMCAwLS42MDItMS40M2wtNC40NC00LjM0MkEyIDIgMCAwIDAgMTMuNTYgMkg2YTIgMiAwIDAgMC0yIDJ6Ii8+PHBhdGggZD0iTTkgMTNoNiIvPjxwYXRoIGQ9Ik05IDE3aDYiLz48cGF0aCBkPSJNMTQgMnY2aDYiLz48L3N2Zz4=");
    mask-size: contain; -webkit-mask-size: contain; mask-repeat: no-repeat; -webkit-mask-repeat: no-repeat; mask-position: center; -webkit-mask-position: center;
}
.icon-bg-folder {
    background-color: #AF52DE;
    mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiI+PHBhdGggZD0iTTIyIDE5YTIgMiAwIDAgMS0yIDJINGEyIDIgMCAwIDEtMi0yVjVhMiAyIDAgMCAxIDItMmg1bDIgM2g5YTIgMiAwIDAgMSAyIDJ6Ii8+PC9zdmc+");
    -webkit-mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiI+PHBhdGggZD0iTTIyIDE5YTIgMiAwIDAgMS0yIDJINGEyIDIgMCAwIDEtMi0yVjVhMiAyIDAgMCAxIDItMmg1bDIgM2g5YTIgMiAwIDAgMSAyIDJ6Ii8+PC9zdmc+");
    mask-size: contain; -webkit-mask-size: contain; mask-repeat: no-repeat; -webkit-mask-repeat: no-repeat; mask-position: center; -webkit-mask-position: center;
}

.menu-text {
  font-size: 24rpx;
  color: $text-main;
}

.box-blue { background: $primary-light; color: $primary-color; }
.box-green { background: #E8FCEF; color: $success-color; }
.box-orange { background: #FFF5E5; color: #FF9500; }
.box-purple { background: #F7E5FF; color: #AF52DE; }

.ai-badge {
  position: absolute;
  top: -10rpx;
  right: -10rpx;
  background: #000;
  color: #fff;
  font-size: 18rpx;
  padding: 4rpx 12rpx;
  border-radius: 16rpx;
  font-weight: bold;
  border: 4rpx solid #fff;
}

.med-time-tabs {
  display: flex;
  gap: 12rpx;
  margin-bottom: 24rpx;
}
.time-tab {
  flex: 1;
  height: 72rpx;
  border-radius: 999rpx;
  background: #fff;
  border: 2rpx solid #eee;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $text-main;
  font-size: 26rpx;
}
.time-tab.active {
  background: $primary-light;
  border-color: $primary-color;
  color: $primary-color;
  font-weight: 700;
}

/* 药品列表 */
.med-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.med-card {
  background: $bg-card;
  padding: 32rpx;
  border-radius: 28rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 6rpx 24rpx rgba(0,0,0,0.03);
  transition: transform 0.15s ease, background 0.2s ease, border-color 0.2s ease;
  border: 2rpx solid rgba(0,0,0,0.04);
  position: relative;
}

.med-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 8rpx;
  border-top-left-radius: 28rpx;
  border-bottom-left-radius: 28rpx;
  background: var(--accent-color, #0a84ff);
}

.med-card.checked {
  background: #F5F6F8;
  border-color: #E5E6EA;
  transform: translateY(-2rpx);
  --accent-color: #E5E5EA;
}

.med-card.checked .med-name,
.med-card.checked .med-desc {
  color: #9A9AA1;
}

.med-left {
  display: flex;
  gap: 28rpx;
  align-items: center;
}

.med-icon-bg {
  width: 80rpx;
  height: 80rpx;
  border-radius: 22rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: inset 0 0 0 2rpx rgba(0,0,0,0.03);
  background: var(--icon-bg, $primary-light);
}

.med-icon {
  width: 36rpx;
  height: 36rpx;
}
.icon-bg-med {
    background-color: $primary-color;
    mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiI+PHBhdGggZD0iTTEwLjUgMjAuNWwxMC0xMGE0Ljk1IDQuOTUgMCAxIDAtNy03bC0xMCAxMGE0Ljk1IDQuOTUgMCAxIDAgNyA3eiIvPjxwYXRoIGQ9Ik04LjUgOC41bDcgNyIvPjwvc3ZnPg==");
    -webkit-mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiI+PHBhdGggZD0iTTEwLjUgMjAuNWwxMC0xMGE0Ljk1IDQuOTUgMCAxIDAtNy03bC0xMCAxMGE0Ljk1IDQuOTUgMCAxIDAgNyA3eiIvPjxwYXRoIGQ9Ik04LjUgOC41bDcgNyIvPjwvc3ZnPg==");
    mask-size: contain; -webkit-mask-size: contain; mask-repeat: no-repeat; -webkit-mask-repeat: no-repeat; mask-position: center; -webkit-mask-position: center;
}


.med-info {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.med-name {
  font-size: 32rpx;
  font-weight: 600;
  color: $text-main;
}

.med-desc {
  font-size: 24rpx;
  color: $text-sub;
}

.med-card.checked .med-icon-bg { --icon-bg: #F0F0F3; }
.med-card.checked .icon-bg-med { background-color: #B0B0B5; }

.check-btn {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  border: 4rpx solid #eee;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #fff;
  transition: background 0.2s ease, border-color 0.2s ease, transform 0.15s ease;
}

.med-card.checked .check-btn {
  background: $success-color;
  border-color: $success-color;
  transform: scale(1.05);
}

.check-icon {
  width: 32rpx;
  height: 32rpx;
}
.icon-bg-check {
    background-color: #fff;
    mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMyI+PHBvbHlsaW5lIHBvaW50cz0iMjAgNiA5IDE3IDQgMTIiLz48L3N2Zz4=");
    -webkit-mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMyI+PHBvbHlsaW5lIHBvaW50cz0iMjAgNiA5IDE3IDQgMTIiLz48L3N2Zz4=");
    mask-size: contain; -webkit-mask-size: contain; mask-repeat: no-repeat; -webkit-mask-repeat: no-repeat; mask-position: center; -webkit-mask-position: center;
}

.check-icon-placeholder {
    width: 32rpx;
    height: 32rpx;
    opacity: 0;
}
.icon-bg-check-gray {
    background-color: #ddd;
    mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiI+PHBvbHlsaW5lIHBvaW50cz0iMjAgNiA5IDE3IDQgMTIiIG9wYWNpdHk9IjAiLz48L3N2Zz4=");
    -webkit-mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiI+PHBvbHlsaW5lIHBvaW50cz0iMjAgNiA5IDE3IDQgMTIiIG9wYWNpdHk9IjAiLz48L3N2Zz4=");
    mask-size: contain; -webkit-mask-size: contain; mask-repeat: no-repeat; -webkit-mask-repeat: no-repeat; mask-position: center; -webkit-mask-position: center;
}

.safe-area-spacer {
  height: 180rpx; 
  padding-bottom: env(safe-area-inset-bottom);
}

/* 时段配色 */
.slot-morning { --accent-color: #FFCC00; }
.slot-noon { --accent-color: #0A84FF; }
.slot-evening { --accent-color: #AF52DE; }
.slot-morning::before { background: #FFCC00; }
.slot-noon::before { background: #0A84FF; }
.slot-evening::before { background: #AF52DE; }
.slot-morning .med-icon-bg { --icon-bg: #FFF5CC; }
.slot-noon .med-icon-bg { --icon-bg: #E6F2FF; }
.slot-evening .med-icon-bg { --icon-bg: #F3E8FF; }
</style>
