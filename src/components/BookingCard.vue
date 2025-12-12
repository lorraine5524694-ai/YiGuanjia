<template>
  <view class="reminder-card" :class="{ active: countdownState === 'upcoming', running: countdownState === 'running' }" @click="handleClick">
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
        <text class="h2">{{ task.hospital }} - {{ task.department }}</text>
        <text class="p-white">{{ task.tag }}</text>
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
      <view v-if="task.link" class="chip link" @click.stop="copyLink">复制链接</view>
      <view v-if="countdownState==='running'" class="chip cta" @click.stop="goToLink">去抢号</view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  task: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['click']);

const strategies = ref({ preDay: true, pre30: true, pre5: true });
const remainingMs = ref(0);
let timer;

const nowMs = () => new Date().getTime();

const isToday = computed(() => {
  const t = new Date(props.task.openTime);
  const n = new Date();
  return t.getFullYear() === n.getFullYear() && t.getMonth() === n.getMonth() && t.getDate() === n.getDate();
});

const nextDayLabel = computed(() => {
  const t = new Date(props.task.openTime);
  const weekdays = ['周日','周一','周二','周三','周四','周五','周六'];
  return `${t.getMonth()+1}月${t.getDate()}日 · ${weekdays[t.getDay()]}`;
});

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

const handleClick = () => {
  emit('click');
};

const toggleStrategy = (k) => {
  strategies.value[k] = !strategies.value[k];
  uni.showToast({ title: `${strategies.value[k] ? '已开启' : '已关闭'}: ${k==='preDay'?'前1天':k==='pre30'?'前30分钟':'前5分钟'}`, icon: 'none' });
};

const copyLink = () => {
  if (!props.task.link) return;
  uni.setClipboardData({ data: props.task.link, success: () => uni.showToast({ title: '链接已复制', icon: 'success' }) });
};

const goToLink = () => {
  if (!props.task.link) return;
  // #ifdef H5
  window.open(props.task.link, '_blank');
  // #endif
};

onMounted(() => {
  remainingMs.value = props.task.openTime - nowMs();
  timer = setInterval(() => {
    remainingMs.value = props.task.openTime - nowMs();
  }, 1000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>

<style lang="scss" scoped>
.reminder-card {
  background: linear-gradient(135deg, #007AFF 0%, #00C6FF 100%);
  border-radius: $radius-xl;
  padding: $spacing-xl;
  color: #fff;
  margin-bottom: $spacing-xxl;
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
  @include flex-between-center;
  font-size: $font-size-sm;
  opacity: 0.9;
  margin-bottom: $spacing-sm;
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
  font-size: $font-size-xl;
  font-weight: $font-weight-bold;
}

.p-white {
  font-size: $font-size-base;
  opacity: 0.9;
}

.countdown {
  text-align: right;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.timer {
  font-size: $font-size-xxl;
  font-weight: $font-weight-heavy;
  font-feature-settings: "tnum";
  font-variant-numeric: tabular-nums;
}

.remind-strategy { margin-top: $spacing-base; display: flex; gap: 12rpx; flex-wrap: wrap; }
.chip { 
  padding: 12rpx 24rpx; 
  border-radius: 999rpx; 
  background: rgba(255,255,255,0.18); 
  color: #fff; 
  font-size: 24rpx; 
  transition: opacity 0.2s;
}
.chip:active { opacity: 0.7; }
.chip.on { background: rgba(255,255,255,0.28); }
.chip.link { background: rgba(0,0,0,0.25); }
.chip.cta { background: #fff; color: #007aff; font-weight: 700; }

.timer-label {
  font-size: 22rpx;
  opacity: 0.8;
}
</style>
