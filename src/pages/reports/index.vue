<template>
  <view class="container">
    <TopSafeArea />
    <view class="header">
      <text class="h1">检查报告</text>
      <view class="actions">
        <view class="chip" @click="goNew">上传</view>
      </view>
    </view>
    <scroll-view scroll-y class="scroll-content">
      <view class="filter-row">
        <view class="chip" :class="{ on: filter==='all' }" @click="setFilter('all')">全部</view>
        <view class="chip" :class="{ on: filter==='abnormal' }" @click="setFilter('abnormal')">仅异常</view>
        <view class="chip" :class="{ on: filter==='recent' }" @click="setFilter('recent')">近30天</view>
      </view>
      <view class="timeline">
        <view v-for="(item, idx) in filtered" :key="idx" class="report-card" @click="openDetail(item)">
          <view class="left">
            <view class="date">{{ item.date }}</view>
            <view class="hospital">{{ item.hospital }} · {{ item.department }}</view>
          </view>
          <view class="right">
            <view class="badge" :class="{ danger: item.abnormalCount>0 }">
              {{ item.abnormalCount>0 ? item.abnormalCount + '项异常' : '正常' }}
            </view>
          </view>
        </view>
      </view>
      <view class="safe-area-spacer"></view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue';
import TopSafeArea from '@/components/TopSafeArea.vue';

const goNew = () => { uni.navigateTo({ url: '/pages/reports/new' }); };
const filter = ref('all');
const setFilter = (f) => { filter.value = f; };
const list = ref([
  { id: 'r1', date: '2025-11-20', hospital: '协和医院', department: '检验科', abnormalCount: 2 },
  { id: 'r2', date: '2025-10-02', hospital: '市人民医院', department: '影像科', abnormalCount: 0 },
  { id: 'r3', date: '2025-09-18', hospital: '北医三院', department: '检验科', abnormalCount: 1 },
]);
const filtered = computed(() => {
  const now = new Date();
  if (filter.value === 'abnormal') return list.value.filter(i => i.abnormalCount>0);
  if (filter.value === 'recent') {
    return list.value.filter(i => (now - new Date(i.date)) / (1000*3600*24) <= 30);
  }
  return list.value;
});
const openDetail = (item) => {
  uni.setStorageSync('currentReportMeta', item);
  uni.navigateTo({ url: '/pages/reports/detail' });
};
</script>

<style lang="scss">
.container { display: flex; flex-direction: column; height: 100vh; background-color: $bg-body; font-family: -apple-system, BlinkMacSystemFont, "San Francisco", Helvetica, Arial, sans-serif; overflow: hidden; }
.header { padding: 20rpx 32rpx; background: $bg-body; position: sticky; top: 0; z-index: 10; display: flex; align-items: center; justify-content: space-between; }
.h1 { font-size: 40rpx; font-weight: 700; color: $text-main; }
.actions { display: flex; gap: 12rpx; }
.scroll-content { flex: 1; padding: 0 32rpx; box-sizing: border-box; overflow-y: auto; }
.filter-row { display: flex; gap: 12rpx; margin: 16rpx 0 24rpx; }
.chip { padding: 8rpx 16rpx; border-radius: 999rpx; background: #fff; font-size: 24rpx; color: $text-main; }
.chip.on { background: $primary-light; color: $primary-color; }
.timeline { display: flex; flex-direction: column; gap: 16rpx; }
.report-card { display: flex; justify-content: space-between; align-items: center; background: #fff; border-radius: 28rpx; padding: 28rpx; box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.02); }
.left { display: flex; flex-direction: column; gap: 6rpx; }
.date { font-size: 28rpx; color: $text-sub; }
.hospital { font-size: 32rpx; font-weight: 600; color: $text-main; }
.badge { padding: 10rpx 16rpx; border-radius: 999rpx; background: #E8FCEF; color: $success-color; font-size: 24rpx; }
.badge.danger { background: #FFE8E6; color: $alert-color; }
.safe-area-spacer { height: 180rpx; padding-bottom: env(safe-area-inset-bottom); }
</style>
