<template>
  <view class="container">
    <TopSafeArea />
    <view class="header">
      <text class="h1">费用票据</text>
      <view class="actions">
        <view class="chip primary" @click="goNew">记一笔</view>
      </view>
    </view>
    <scroll-view scroll-y class="scroll-content">
      <view class="summary-card">
        <view class="row">
          <text class="title">本月总额</text>
          <view class="chip" :class="{ success: insuredTotal>0 }">医保报销 ¥{{ insuredTotal.toFixed(2) }}</view>
        </view>
        <view class="number">¥{{ monthTotal.toFixed(2) }}</view>
        <view class="sub">自付 ¥{{ selfTotal.toFixed(2) }}</view>
      </view>

      <view class="filter-row">
        <view class="chip" :class="{ on: filter==='all' }" @click="setFilter('all')">全部</view>
        <view class="chip" :class="{ on: filter==='insured' }" @click="setFilter('insured')">医保</view>
        <view class="chip" :class="{ on: filter==='self' }" @click="setFilter('self')">自费</view>
        <view class="chip" :class="{ on: filter==='recent' }" @click="setFilter('recent')">近30天</view>
      </view>

      <view class="timeline">
        <view v-for="(b, idx) in filteredBills" :key="b.id" class="bill-card" @click="openDetail(b)">
          <view class="left">
            <view class="date">{{ formatDate(b.date) }}</view>
            <view class="hospital">{{ b.hospital }} · {{ b.department }}</view>
            <view class="tags">
              <view class="badge category" :class="categoryClass(b.category)">{{ b.category }}</view>
              <view class="badge" :class="{ success: b.insured, danger: !b.insured }">{{ b.insured ? '医保' : '自费' }}</view>
            </view>
          </view>
          <view class="right">
            <view class="amount">¥{{ b.amount.toFixed(2) }}</view>
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

const goNew = () => { uni.navigateTo({ url: '/pages/billing/new' }); };

const bills = ref([
  { id: 'b1', date: '2025-11-02', hospital: '协和医院', department: '皮肤科', category: '门诊', insured: true, amount: 128.00, insuredAmount: 80.00 },
  { id: 'b2', date: '2025-11-08', hospital: '市人民医院', department: '检验科', category: '检查', insured: false, amount: 260.50, insuredAmount: 0 },
  { id: 'b3', date: '2025-10-18', hospital: '北医三院', department: '药房', category: '药品', insured: true, amount: 86.60, insuredAmount: 40.00 },
  { id: 'b4', date: '2025-11-20', hospital: '市中医院', department: '住院部', category: '住院', insured: true, amount: 1520.00, insuredAmount: 900.00 },
  { id: 'b5', date: '2025-11-21', hospital: '协和医院', department: '后勤', category: '交通', insured: false, amount: 35.00, insuredAmount: 0 },
]);

const filter = ref('all');
const setFilter = (f) => { filter.value = f; };
const filteredBills = computed(() => {
  const now = new Date();
  let arr = bills.value.slice();
  if (filter.value === 'insured') arr = arr.filter(b => b.insured);
  if (filter.value === 'self') arr = arr.filter(b => !b.insured);
  if (filter.value === 'recent') arr = arr.filter(b => (now - new Date(b.date)) / (1000*3600*24) <= 30);
  return arr;
});

const monthTotal = computed(() => {
  const now = new Date();
  return bills.value
    .filter(b => { const d = new Date(b.date); return d.getFullYear()===now.getFullYear() && d.getMonth()===now.getMonth(); })
    .reduce((s,b) => s + b.amount, 0);
});
const insuredTotal = computed(() => {
  const now = new Date();
  return bills.value
    .filter(b => { const d = new Date(b.date); return d.getFullYear()===now.getFullYear() && d.getMonth()===now.getMonth(); })
    .reduce((s,b) => s + (b.insuredAmount||0), 0);
});
const selfTotal = computed(() => monthTotal.value - insuredTotal.value);

const formatDate = (str) => {
  const d = new Date(str);
  const w = ['周日','周一','周二','周三','周四','周五','周六'];
  return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())} · ${w[d.getDay()]}`;
};
const pad2 = (n) => (n<10 ? '0'+n : ''+n);
const categoryClass = (c) => ({
  'meds': c==='药品',
  'exam': c==='检查',
  'outp': c==='门诊',
  'inpt': c==='住院',
  'traffic': c==='交通'
});

const openDetail = (b) => {
  uni.setStorageSync('currentBill', b);
  uni.navigateTo({ url: '/pages/billing/detail' });
};
</script>

<style lang="scss">
.container { display: flex; flex-direction: column; height: 100vh; background-color: $bg-body; font-family: -apple-system, BlinkMacSystemFont, "San Francisco", Helvetica, Arial, sans-serif; overflow: hidden; }
.header { padding: 20rpx 32rpx; background: $bg-body; position: sticky; top: 0; z-index: 10; display: flex; align-items: center; justify-content: space-between; }
.h1 { font-size: 40rpx; font-weight: 700; color: $text-main; }
.actions { display: flex; gap: 12rpx; }
.chip { padding: 8rpx 16rpx; border-radius: 999rpx; background: #fff; font-size: 24rpx; color: $text-main; }
.chip.primary { background: $primary-color; color: #fff; }
.chip.success { background: #E8FCEF; color: $success-color; }
.chip.on { background: $primary-light; color: $primary-color; }
.scroll-content { flex: 1; padding: 0 32rpx; box-sizing: border-box; overflow-y: auto; }

.summary-card { background: #fff; border-radius: 32rpx; padding: 32rpx; margin: 12rpx 0 24rpx; box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.02); }
.row { display: flex; justify-content: space-between; align-items: center; }
.title { font-size: 32rpx; font-weight: 600; color: $text-main; }
.number { font-size: 56rpx; font-weight: 800; color: $text-main; margin: 8rpx 0; }
.sub { font-size: 26rpx; color: $text-sub; }

.filter-row { display: flex; gap: 12rpx; margin: 16rpx 0 24rpx; }

.timeline { display: flex; flex-direction: column; gap: 16rpx; }
.bill-card { display: flex; justify-content: space-between; align-items: center; background: #fff; border-radius: 28rpx; padding: 28rpx; box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.02); }
.left { display: flex; flex-direction: column; gap: 8rpx; }
.date { font-size: 28rpx; color: $text-sub; }
.hospital { font-size: 32rpx; font-weight: 600; color: $text-main; }
.tags { display: flex; gap: 8rpx; align-items: center; }
.badge { padding: 8rpx 14rpx; border-radius: 999rpx; background: #f8f9fb; color: $text-main; font-size: 22rpx; }
.badge.success { background: #E8FCEF; color: $success-color; }
.badge.danger { background: #FFE8E6; color: $alert-color; }
.badge.category { background: #EEF2FF; color: $primary-color; }
.badge.category.meds { background: #E5F1FF; color: $primary-color; }
.badge.category.exam { background: #FFF5E5; color: #FF9500; }
.badge.category.outp { background: #E5F1FF; color: $primary-color; }
.badge.category.inpt { background: #F7E5FF; color: #AF52DE; }
.badge.category.traffic { background: #F0F0F5; color: $text-sub; }
.right { display: flex; align-items: center; }
.amount { font-size: 40rpx; font-weight: 700; color: $text-main; }

.safe-area-spacer { height: 180rpx; padding-bottom: env(safe-area-inset-bottom); }
</style>
