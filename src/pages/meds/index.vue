<template>
  <view class="container">
    <TopSafeArea />

    <view class="header">
      <text class="h1">用药管理</text>
      <button class="primary-btn" @click="goAdd">添加药品</button>
    </view>

    <scroll-view scroll-y class="scroll-content">
      <view class="section-card">
        <view class="search-row">
          <view class="search-icon"></view>
          <input class="search-input" placeholder="搜索药品 / 计划" v-model="keyword" @input="filterList" />
          <button class="secondary-btn" @click="clearKeyword" v-if="keyword">清除</button>
        </view>
      </view>

      <view class="section-title">
        <text class="title-text">今日用药任务</text>
      </view>

      <view v-if="tasks.length" class="task-list">
        <view v-for="(t, idx) in tasks" :key="t.id + '-' + idx" class="task-card" :class="{ done: t.done }">
          <view class="task-left">
            <view class="med-icon-bg">
              <view class="med-icon icon-bg-med"></view>
            </view>
            <view class="task-info">
              <text class="task-name">{{ t.name }}</text>
              <text class="task-desc">{{ t.dose }} · {{ t.meal }} · {{ t.time }}</text>
            </view>
          </view>
          <view class="task-actions">
            <button class="check-btn" :class="{ on: !t.done, disabled: t.done }" :disabled="t.done" @click="toggleDone(idx)">
              <view v-if="t.done" class="check-icon icon-bg-check"></view>
              <text>{{ t.done ? '已打卡' : '打卡' }}</text>
            </button>
            <button class="ghost-btn" @click="snooze(idx)" v-if="!t.done">稍后提醒</button>
          </view>
        </view>
      </view>
      <view v-else class="empty">
        <text class="empty-text">今天暂无用药任务</text>
        <button class="primary-btn" @click="goAdd">去添加</button>
      </view>

      <view class="section-title mt-24" v-if="plans.length">
        <text class="title-text">已设置的服用计划</text>
        <view class="more-link" @click="goAdd">
          <text>新增</text>
          <text class="arrow-right">></text>
        </view>
      </view>
      <view class="plan-list" v-if="plans.length">
        <view
          v-for="(p, i) in filteredPlans"
          :key="p.id"
          class="swipe-item"
          @touchstart="onTouchStart($event, p.id)"
          @touchmove="onTouchMove($event, p.id)"
          @touchend="onTouchEnd(p.id)"
        >
          <view class="plan-card" :style="{ transform: swipeMap[p.id] ? 'translateX(-200rpx)' : 'translateX(0)' }" @click="goPlan(p)">
            <view class="plan-left">
              <view class="med-icon-bg small">
                <view class="med-icon icon-bg-pill"></view>
              </view>
              <view class="plan-info">
                <text class="plan-name">{{ p.name }}</text>
                <text class="plan-desc">{{ p.freqLabel }} · {{ p.meal }} · 自{{ p.startDate }}起</text>
              </view>
            </view>
            <view class="plan-actions">
              <button class="ghost-btn" @click.stop="goPlan(p)">编辑</button>
              <button class="danger-btn filled" @click.stop="deletePlan(i, p)">删除</button>
            </view>
          </view>
          <view class="swipe-actions">
            <button class="danger-btn filled" @click.stop="deletePlan(i, p)">删除</button>
          </view>
        </view>
      </view>

      <view class="safe-area-spacer"></view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import TopSafeArea from '@/components/TopSafeArea.vue';

const keyword = ref('');
const plans = ref([]);
const tasks = ref([]);
const swipeMap = ref({});
const touchStartX = ref(0);
const touchStartY = ref(0);

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
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10);
  const doneKey = 'meds_done_' + dateStr;
  const doneMap = uni.getStorageSync(doneKey) || {};
  const result = [];
  plans.value.forEach((p) => {
    (p.times || []).forEach((t) => {
      result.push({
        id: p.id + '_' + t,
        name: p.name,
        dose: p.dose || '按医嘱',
        meal: p.meal || '随餐',
        time: t,
        done: !!doneMap[p.id + '_' + t]
      });
    });
  });
  result.sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    return a.time > b.time ? 1 : -1;
  });
  tasks.value = result;
};

const filteredPlans = computed(() => plans.value.filter((p) => matchKeyword(p.name + ' ' + (p.dose || '') + ' ' + (p.freqLabel || ''))));

const matchKeyword = (text) => {
  if (!keyword.value) return true;
  return text.toLowerCase().includes(keyword.value.trim().toLowerCase());
};

const filterList = () => {
  buildTodayTasks();
};

const clearKeyword = () => {
  keyword.value = '';
  buildTodayTasks();
};

const toggleDone = (idx) => {
  const item = tasks.value[idx];
  item.done = !item.done;
  const dateStr = new Date().toISOString().slice(0, 10);
  const doneKey = 'meds_done_' + dateStr;
  const doneMap = uni.getStorageSync(doneKey) || {};
  doneMap[item.id] = item.done;
  uni.setStorageSync(doneKey, doneMap);
  if (item.done) {
    uni.showToast({ title: '已完成服药打卡', icon: 'success' });
  }
  tasks.value.sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    return a.time > b.time ? 1 : -1;
  });
};

const snooze = (idx) => {
  uni.showToast({ title: '已推迟 15 分钟', icon: 'none' });
};

const goPlan = (p) => {
  const q = encodeURIComponent(JSON.stringify(p));
  uni.navigateTo({ url: '/pages/meds/plan?plan=' + q });
};

const deletePlan = (index, p) => {
  uni.showModal({
    title: '删除计划',
    content: '确认删除该服用计划？',
    confirmText: '删除',
    cancelText: '取消'
  }).then((res) => {
    if (res.confirm) {
      const list = plans.value.slice();
      list.splice(index, 1);
      plans.value = list;
      uni.setStorageSync('meds_plans', list);
      buildTodayTasks();
      uni.showToast({ title: '已删除', icon: 'success' });
    }
  });
};

const onTouchStart = (e, id) => {
  touchStartX.value = e.touches[0].clientX;
  touchStartY.value = e.touches[0].clientY;
};

const onTouchMove = (e, id) => {
  const dx = e.touches[0].clientX - touchStartX.value;
  const dy = e.touches[0].clientY - touchStartY.value;
  if (Math.abs(dy) > 20) return;
  if (dx < -30) {
    swipeMap.value = { ...swipeMap.value, [id]: true };
  } else if (dx > 20) {
    swipeMap.value = { ...swipeMap.value, [id]: false };
  }
};

const onTouchEnd = (id) => {};

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
.container { display: flex; flex-direction: column; height: 100vh; background-color: $bg-body; font-family: -apple-system, BlinkMacSystemFont, "San Francisco", Helvetica, Arial, sans-serif; overflow: hidden; }
.status-bar-placeholder { height: var(--status-bar-height); height: constant(safe-area-inset-top); height: env(safe-area-inset-top); width: 100%; flex-shrink: 0; }
.header { padding: 20rpx 32rpx; background: $bg-body; position: sticky; top: 0; z-index: 10; flex-shrink: 0; display: flex; align-items: center; }
.header .h1 { flex: 1; }
.header .primary-btn { margin-left: auto; }
.h1 { font-size: 40rpx; font-weight: 700; color: $text-main; }
.btn { display: inline-flex; align-items: center; justify-content: center; border-radius: 24rpx; padding: 16rpx 28rpx; font-size: 26rpx; transition: transform .08s ease, box-shadow .2s ease, background-color .2s ease, color .2s ease; -webkit-font-smoothing: antialiased; }
.btn:active { transform: scale(0.98); }
.primary-btn { @extend .btn; background: $primary-color; color: #fff; box-shadow: 0 10rpx 28rpx rgba(0, 122, 255, 0.22); }
.primary-btn:active { box-shadow: 0 4rpx 12rpx rgba(38, 93, 255, 0.22); }
.secondary-btn { @extend .btn; background: #fff; color: $text-main; border: 2rpx solid #e5e7eb; }
.ghost-btn { @extend .btn; background: #fff; color: $primary-color; border: 2rpx solid $primary-color; }
.danger-btn { @extend .btn; background: #fff; color: $alert-color; border: 2rpx solid $alert-color; }
.danger-btn.filled { background: $alert-color; color: #fff; }
.scroll-content { flex: 1; padding: 0 32rpx; box-sizing: border-box; overflow-y: auto; }
.section-card { background: #fff; border-radius: 32rpx; padding: 24rpx; margin-bottom: 24rpx; box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.03); }
.search-row { display: flex; gap: 12rpx; align-items: center; background: #f7f7fa; border-radius: 24rpx; padding: 12rpx 16rpx; }
.search-icon { width: 32rpx; height: 32rpx; background-color: $text-sub; mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiI+PGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iNiIvPjxsaW5lIHgxPSIxNSIgeTE9IjE1IiB4Mj0iMjIiIHkyPSIyMiIvPjwvc3ZnPg=="); -webkit-mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiI+PGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iNiIvPjxsaW5lIHgxPSIxNSIgeTE9IjE1IiB4Mj0iMjIiIHkyPSIyMiIvPjwvc3ZnPg=="); mask-size: contain; -webkit-mask-size: contain; mask-repeat: no-repeat; -webkit-mask-repeat: no-repeat; mask-position: center; -webkit-mask-position: center; }
.search-input { flex: 1; background: transparent; border-radius: 16rpx; padding: 12rpx 8rpx; font-size: 26rpx; border: 2rpx solid transparent; }
.section-title { display: flex; justify-content: space-between; align-items: center; margin: 24rpx 0; }
.title-text { font-size: 32rpx; font-weight: 700; color: $text-main; }
.more-link { font-size: 26rpx; color: $primary-color; display: flex; align-items: center; gap: 4rpx; }
.arrow-right { font-family: monospace; font-weight: bold; }
.task-list { display: flex; flex-direction: column; gap: 20rpx; }
.task-card { background: #fff; border-radius: 28rpx; padding: 24rpx; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.03); border: 2rpx solid transparent; transition: transform .08s ease, box-shadow .2s ease; }
.task-card:active { transform: scale(0.99); box-shadow: 0 8rpx 24rpx rgba(0,0,0,0.06); }
.task-card.done { background: #f7f7fa; border-color: #e5e7eb; }
.task-card.done .task-name { color: #9aa0a6; }
.task-card.done .task-desc { color: #b0b6bb; }
.task-card.done .med-icon-bg { background: #eef2f6; }
.task-card.done .med-icon { background-color: #c4c9d1; }
.task-left { display: flex; gap: 20rpx; align-items: center; }
.med-icon-bg { width: 72rpx; height: 72rpx; background: linear-gradient(180deg, #f0f6ff 0%, #e5f1ff 100%); border-radius: 20rpx; display: flex; justify-content: center; align-items: center; box-shadow: 0 6rpx 14rpx rgba(0,0,0,0.04); }
.med-icon { width: 36rpx; height: 36rpx; }
.task-info { display: flex; flex-direction: column; gap: 6rpx; }
.task-name { font-size: 30rpx; font-weight: 600; color: $text-main; }
.task-desc { font-size: 24rpx; color: $text-sub; }
.task-actions { display: flex; gap: 12rpx; align-items: center; }
.check-btn { @extend .btn; padding: 12rpx 22rpx; border-radius: 24rpx; gap: 8rpx; background: #fff; color: $primary-color; border: 2rpx solid $primary-color; }
.check-btn.on { background: $primary-light; color: $primary-color; border-color: $primary-color; }
.check-btn.disabled { background: $success-color; color: #fff; border-color: $success-color; }
.plan-list { display: flex; flex-direction: column; gap: 20rpx; }
.swipe-item { position: relative; overflow: hidden; }
.plan-card { background: #fff; border-radius: 28rpx; padding: 24rpx; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.03); transition: transform .2s ease, box-shadow .2s ease; }
.plan-card:active { transform: scale(0.99); box-shadow: 0 8rpx 24rpx rgba(0,0,0,0.06); }
.swipe-actions { position: absolute; top: 0; right: 0; bottom: 0; display: flex; align-items: center; padding: 0 24rpx; background: #fff; }
.plan-left { display: flex; gap: 16rpx; align-items: center; }
.med-icon-bg.small { width: 56rpx; height: 56rpx; }
.plan-info { display: flex; flex-direction: column; gap: 4rpx; }
.plan-name { font-size: 28rpx; font-weight: 600; color: $text-main; }
.plan-desc { font-size: 22rpx; color: $text-sub; }
.plan-actions { display: flex; gap: 12rpx; align-items: center; }
.empty { background: #fff; border-radius: 32rpx; padding: 40rpx; display: flex; flex-direction: column; gap: 16rpx; align-items: center; }
.empty-text { color: $text-sub; }
.mt-24 { margin-top: 24rpx; }
.safe-area-spacer { height: 180rpx; padding-bottom: env(safe-area-inset-bottom); }

.icon-bg-med { background-color: $primary-color; mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiI+PHBhdGggZD0iTTEwLjUgMjAuNWwxMC0xMGE0Ljk1IDQuOTUgMCAxIDAtNy03bC0xMCAxMGE0Ljk1IDQuOTUgMCAxIDAgNyA3eiIvPjxwYXRoIGQ9Ik04LjUgOC41bDcgNyIvPjwvc3ZnPg=="); -webkit-mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiI+PHBhdGggZD0iTTEwLjUgMjAuNWwxMC0xMGE0Ljk1IDQuOTUgMCAxIDAtNy03bC0xMCAxMGE0Ljk1IDQuOTUgMCAxIDAgNyA3eiIvPjxwYXRoIGQ9Ik04LjUgOC41bDcgNyIvPjwvc3ZnPg=="); mask-size: contain; -webkit-mask-size: contain; mask-repeat: no-repeat; -webkit-mask-repeat: no-repeat; mask-position: center; -webkit-mask-position: center; }
.icon-bg-pill { background-color: $primary-color; mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiI+PHJlY3QgeD0iMiIgeT0iNiIgd2lkdGg9IjIwIiBoZWlnaHQ9IjEyIiByeD0iNiIvPjxwYXRoIGQ9Ik0xMiA2djEyIi8+PC9zdmc+"); -webkit-mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiI+PHJlY3QgeD0iMiIgeT0iNiIgd2lkdGg9IjIwIiBoZWlnaHQ9IjEyIiByeD0iNiIvPjxwYXRoIGQ9Ik0xMiA2djEyIi8+PC9zdmc+"); mask-size: contain; -webkit-mask-size: contain; mask-repeat: no-repeat; -webkit-mask-repeat: no-repeat; mask-position: center; -webkit-mask-position: center; }
.check-icon { width: 32rpx; height: 32rpx; }
.icon-bg-check { background-color: #fff; mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjMiPjxwb2x5bGluZSBwb2ludHM9IjIwIDYgOSAxNyA0IDEyIi8+PC9zdmc+"); -webkit-mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjMiPjxwb2x5bGluZSBwb2ludHM9IjIwIDYgOSAxNyA0IDEyIi8+PC9zdmc+"); mask-size: contain; -webkit-mask-size: contain; mask-repeat: no-repeat; -webkit-mask-repeat: no-repeat; mask-position: center; -webkit-mask-position: center; }
</style>
