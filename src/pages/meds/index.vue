<template>
  <view class="container">
    <!-- 顶部头部区域 -->
    <view class="header-section">
      <TopSafeArea />
      <view class="user-info">
        <view class="greeting-box">
          <text class="greeting">{{ greeting }}</text>
          <text class="sub-greeting">愿你今天充满活力</text>
        </view>
        <view class="avatar-placeholder">L</view>
      </view>
      
      <!-- 仪表盘卡片 -->
      <view class="dashboard-card">
        <view class="progress-content">
          <view class="progress-text">
            <text class="progress-label">今日服药进度</text>
            <text class="progress-value">{{ progress }}%</text>
          </view>
          <view class="progress-bar-bg">
            <view class="progress-bar-fill" :style="{ width: progress + '%' }"></view>
          </view>
        </view>
        <view class="dashboard-decoration"></view>
      </view>
    </view>

    <scroll-view scroll-y class="scroll-content">
      <!-- 日历条 (简化版) -->
      <view class="calendar-strip">
        <view class="day-item active">
          <text class="day-name">今天</text>
          <text class="day-num">{{ todayDate }}</text>
        </view>
        <view class="day-item">
          <text class="day-name">明天</text>
          <text class="day-num">{{ tomorrowDate }}</text>
        </view>
        <view class="day-item">
          <text class="day-name">后天</text>
          <text class="day-num">{{ afterTomorrowDate }}</text>
        </view>
      </view>

      <!-- 时间轴任务列表 -->
      <view class="timeline-container">
        <template v-for="(group, key) in groupedTasks" :key="key">
          <view class="time-section" v-if="group.length > 0">
            <view class="section-header">
              <view class="time-dot" :class="key"></view>
              <text class="section-title">{{ getTimeLabel(key) }}</text>
            </view>
            
            <view class="task-list">
              <view 
                v-for="(t, idx) in group" 
                :key="t.id" 
                class="med-card" 
                :class="{ done: t.done }"
                @click="toggleDone(t)"
              >
                <view class="med-icon-box">
                  <view class="med-icon icon-pill"></view>
                </view>
                <view class="med-info">
                  <text class="med-name">{{ t.name }}</text>
                  <text class="med-detail">{{ t.dose }} · {{ t.meal }}</text>
                </view>
                <view class="med-time">
                  <text>{{ t.time }}</text>
                </view>
                <view class="checkbox" :class="{ checked: t.done }">
                  <view class="check-mark" v-if="t.done"></view>
                </view>
              </view>
            </view>
          </view>
        </template>

        <!-- 空状态 -->
        <view v-if="tasks.length === 0" class="empty-state">
          <view class="empty-icon icon-leaf"></view>
          <text class="empty-text">今天没有用药任务</text>
          <text class="empty-sub">好好休息，保持健康</text>
        </view>
      </view>

      <view class="safe-area-spacer"></view>
    </scroll-view>

    <!-- 悬浮添加按钮 (FAB) -->
    <view class="fab-btn" @click="goAdd">
      <view class="fab-icon">+</view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import TopSafeArea from '@/components/TopSafeArea.vue';

const plans = ref([]);
const tasks = ref([]);
const groupedTasks = ref({ morning: [], noon: [], evening: [] });

// 日期相关
const today = new Date();
const todayDate = today.getDate();
const tomorrowDate = new Date(today.getTime() + 86400000).getDate();
const afterTomorrowDate = new Date(today.getTime() + 86400000 * 2).getDate();

// 问候语
const greeting = computed(() => {
  const hour = new Date().getHours();
  if (hour < 11) return '早上好';
  if (hour < 13) return '中午好';
  if (hour < 18) return '下午好';
  return '晚上好';
});

// 进度计算
const progress = computed(() => {
  if (tasks.value.length === 0) return 0;
  const doneCount = tasks.value.filter(t => t.done).length;
  return Math.round((doneCount / tasks.value.length) * 100);
});

const goAdd = () => {
  uni.navigateTo({ url: '/pages/meds/add' });
};

const loadPlans = () => {
  try {
    const list = uni.getStorageSync('meds_plans') || [];
    plans.value = list;
  } catch (e) {
    plans.value = [];
  }
};

const buildTodayTasks = () => {
  const dateStr = new Date().toISOString().slice(0, 10);
  const doneKey = 'meds_done_' + dateStr;
  const doneMap = uni.getStorageSync(doneKey) || {};
  
  const allTasks = [];
  plans.value.forEach((p) => {
    (p.times || []).forEach((t) => {
      allTasks.push({
        id: p.id + '_' + t,
        originalId: p.id,
        name: p.name,
        dose: p.dose || '按医嘱',
        meal: p.meal || '随餐',
        time: t,
        done: !!doneMap[p.id + '_' + t]
      });
    });
  });

  // 排序：时间优先
  allTasks.sort((a, b) => a.time.localeCompare(b.time));
  tasks.value = allTasks;

  // 分组
  const groups = { morning: [], noon: [], evening: [] };
  allTasks.forEach(t => {
    const hour = parseInt(t.time.split(':')[0]);
    if (hour < 11) groups.morning.push(t);
    else if (hour < 17) groups.noon.push(t);
    else groups.evening.push(t);
  });
  groupedTasks.value = groups;
};

const getTimeLabel = (key) => {
  const map = { morning: '晨间时段', noon: '午间时段', evening: '晚间时段' };
  return map[key];
};

const toggleDone = (item) => {
  item.done = !item.done;
  const dateStr = new Date().toISOString().slice(0, 10);
  const doneKey = 'meds_done_' + dateStr;
  const doneMap = uni.getStorageSync(doneKey) || {};
  doneMap[item.id] = item.done;
  uni.setStorageSync(doneKey, doneMap);
  
  if (item.done) {
    uni.vibrateShort(); // 震动反馈
    uni.showToast({ title: '已打卡', icon: 'none' });
  }
};

onMounted(() => {
  loadPlans();
  buildTodayTasks();
});

onShow(() => {
  loadPlans();
  buildTodayTasks();
});
</script>

<style lang="scss">
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: $bg-body;
  font-family: -apple-system, BlinkMacSystemFont, "San Francisco", Helvetica, Arial, sans-serif;
}

/* Header Section */
.header-section {
  background-color: #fff;
  padding: 20rpx 40rpx 40rpx;
  border-bottom-left-radius: 48rpx;
  border-bottom-right-radius: 48rpx;
  box-shadow: 0 10rpx 30rpx rgba(0,0,0,0.03);
  z-index: 10;
}

.user-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32rpx;
}

.greeting {
  font-size: 48rpx;
  font-weight: 800;
  color: $text-main;
  margin-bottom: 8rpx;
}

.sub-greeting {
  font-size: 28rpx;
  color: $text-sub;
}

.avatar-placeholder {
  width: 80rpx;
  height: 80rpx;
  background: $primary-light;
  color: $primary-color;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
  font-weight: bold;
}

/* Dashboard Card */
.dashboard-card {
  background: $bg-gradient-primary;
  border-radius: 32rpx;
  padding: 32rpx;
  position: relative;
  overflow: hidden;
  box-shadow: 0 16rpx 32rpx rgba(0, 122, 255, 0.25);
}

.progress-content {
  position: relative;
  z-index: 2;
}

.progress-text {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 16rpx;
}

.progress-label {
  color: rgba(255, 255, 255, 0.9);
  font-size: 28rpx;
}

.progress-value {
  color: #fff;
  font-size: 48rpx;
  font-weight: 700;
}

.progress-bar-bg {
  height: 12rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 6rpx;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: #fff;
  border-radius: 6rpx;
  transition: width 0.5s ease;
}

.dashboard-decoration {
  position: absolute;
  right: -20rpx;
  top: -20rpx;
  width: 160rpx;
  height: 160rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

/* Scroll Content */
.scroll-content {
  flex: 1;
  padding: 32rpx 40rpx;
  box-sizing: border-box;
}

/* Calendar Strip */
.calendar-strip {
  display: flex;
  gap: 24rpx;
  margin-bottom: 40rpx;
}

.day-item {
  flex: 1;
  background: #fff;
  border-radius: 24rpx;
  padding: 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  border: 2rpx solid transparent;
  transition: all 0.2s;
}

.day-item.active {
  background: $primary-color;
  box-shadow: 0 8rpx 20rpx rgba(0, 122, 255, 0.2);
}

.day-item .day-name {
  font-size: 24rpx;
  color: $text-sub;
}

.day-item.active .day-name {
  color: rgba(255, 255, 255, 0.8);
}

.day-item .day-num {
  font-size: 32rpx;
  font-weight: 700;
  color: $text-main;
}

.day-item.active .day-num {
  color: #fff;
}

/* Timeline */
.timeline-container {
  display: flex;
  flex-direction: column;
  gap: 40rpx;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.time-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background: $text-sub;
}

.time-dot.morning { background: $warning-color; box-shadow: 0 0 0 6rpx rgba(255, 149, 0, 0.15); }
.time-dot.noon { background: $secondary-color; box-shadow: 0 0 0 6rpx rgba(93, 156, 236, 0.15); }
.time-dot.evening { background: $primary-color; box-shadow: 0 0 0 6rpx rgba(0, 122, 255, 0.15); }

.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: $text-sub;
  letter-spacing: 1rpx;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.med-card {
  background: #fff;
  border-radius: 32rpx;
  padding: 24rpx 32rpx;
  display: flex;
  align-items: center;
  gap: 24rpx;
  box-shadow: $shadow-sm;
  transition: all 0.2s ease;
  border: 2rpx solid transparent;
}

.med-card:active {
  transform: scale(0.98);
}

.med-card.done {
  background: #F8F9FA;
  box-shadow: none;
}

.med-card.done .med-name { color: $text-sub; text-decoration: line-through; }
.med-card.done .med-detail { color: #CBD5E0; }
.med-card.done .med-time { color: #CBD5E0; }
.med-card.done .med-icon-box { background: #E2E8F0; }
.med-card.done .med-icon { background-color: #A0AEC0; }

.med-icon-box {
  width: 88rpx;
  height: 88rpx;
  background: $primary-light;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.med-icon {
  width: 48rpx;
  height: 48rpx;
  background-color: $primary-color;
  mask-size: contain;
  -webkit-mask-size: contain;
  mask-repeat: no-repeat;
  -webkit-mask-repeat: no-repeat;
  mask-position: center;
  -webkit-mask-position: center;
}

.icon-pill {
  mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiI+PHJlY3QgeD0iMiIgeT0iNiIgd2lkdGg9IjIwIiBoZWlnaHQ9IjEyIiByeD0iNiIvPjxwYXRoIGQ9Ik0xMiA2djEyIi8+PC9zdmc+");
  -webkit-mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiI+PHJlY3QgeD0iMiIgeT0iNiIgd2lkdGg9IjIwIiBoZWlnaHQ9IjEyIiByeD0iNiIvPjxwYXRoIGQ9Ik0xMiA2djEyIi8+PC9zdmc+");
}

.med-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.med-name {
  font-size: 32rpx;
  font-weight: 600;
  color: $text-main;
}

.med-detail {
  font-size: 24rpx;
  color: $text-sub;
}

.med-time {
  font-size: 28rpx;
  font-weight: 600;
  color: $text-main;
  background: $bg-body;
  padding: 8rpx 16rpx;
  border-radius: 12rpx;
}

.checkbox {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  border: 4rpx solid $primary-color;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.checkbox.checked {
  background: $primary-color;
}

.check-mark {
  width: 24rpx;
  height: 12rpx;
  border-left: 4rpx solid #fff;
  border-bottom: 4rpx solid #fff;
  transform: rotate(-45deg) translate(2rpx, -2rpx);
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 0;
  opacity: 0.6;
}

.empty-icon {
  width: 120rpx;
  height: 120rpx;
  background-color: $text-sub;
  margin-bottom: 24rpx;
  mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiI+PHBhdGggZD0iTTEyIDJMMiA3bDEwIDUgMTAtNS0xMC01ek0yIDE3bDEwIDUgMTAtNSIvPjxwYXRoIGQ9Ik0yIDEybDEwIDUgMTAtNSIvPjwvc3ZnPg==");
  -webkit-mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiI+PHBhdGggZD0iTTEyIDJMMiA3bDEwIDUgMTAtNS0xMC01ek0yIDE3bDEwIDUgMTAtNSIvPjxwYXRoIGQ9Ik0yIDEybDEwIDUgMTAtNSIvPjwvc3ZnPg==");
}

.empty-text {
  font-size: 32rpx;
  font-weight: 600;
  color: $text-main;
  margin-bottom: 8rpx;
}

.empty-sub {
  font-size: 26rpx;
  color: $text-sub;
}

/* FAB */
.fab-btn {
  position: fixed;
  right: 40rpx;
  bottom: calc(40rpx + env(safe-area-inset-bottom));
  width: 112rpx;
  height: 112rpx;
  background: $primary-color;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 16rpx 40rpx rgba(0, 122, 255, 0.4);
  transition: transform 0.2s ease;
  z-index: 100;
}

.fab-btn:active {
  transform: scale(0.9);
}

.fab-icon {
  font-size: 64rpx;
  color: #fff;
  font-weight: 300;
  margin-top: -8rpx;
}

.safe-area-spacer {
  height: 200rpx;
}
</style>
