<template>
  <view class="container">
    <TopSafeArea />
    <view class="header">
      <text class="h1">账单详情</text>
      <view class="header-sub">
        <text>{{ bill.hospital || '未填写' }} · {{ bill.department }}</text>
        <view class="chip" :class="{ success: bill.insured, danger: !bill.insured }">{{ bill.date }} · {{ bill.insured ? '医保' : '自费' }}</view>
      </view>
    </view>
    <scroll-view scroll-y class="scroll-content">
      <view class="section-card">
        <view class="row">
          <text class="title">基本信息</text>
          <view class="chip">{{ bill.category }}</view>
        </view>
        <view class="info-grid">
          <view class="info-item">
            <text class="label">总金额</text>
            <text class="value">¥{{ bill.amount?.toFixed(2) }}</text>
          </view>
          <view class="info-item">
            <text class="label">医保报销</text>
            <text class="value success">¥{{ insuredAmount.toFixed(2) }}</text>
          </view>
          <view class="info-item">
            <text class="label">自付金额</text>
            <text class="value danger">¥{{ selfAmount.toFixed(2) }}</text>
          </view>
        </view>
      </view>

      <view class="section-card">
        <text class="title">明细项目</text>
        <view class="items">
          <view v-for="(it,i) in items" :key="i" class="item">
            <text class="name">{{ it.name }}</text>
            <text class="amt">¥{{ Number(it.amount).toFixed(2) }}</text>
          </view>
        </view>
      </view>

      <view class="section-card">
        <view class="row">
          <text class="title">报销建议</text>
          <view class="chip">去报销</view>
        </view>
        <view class="ai-box">
          <text class="ai-text">建议准备病历、发票、费用清单等原件，前往医保窗口办理；部分项目如材料费可能不予报销，详情以当地政策为准。</text>
        </view>
      </view>

      <view class="safe-area-spacer"></view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import TopSafeArea from '@/components/TopSafeArea.vue';

const bill = ref({ id: '', date: '', hospital: '', department: '', category: '', amount: 0, insured: true, insuredAmount: 0 });
const items = ref([]);
onMounted(() => {
  try {
    const b = uni.getStorageSync('currentBill') || {};
    const arr = uni.getStorageSync('currentBillItems') || [];
    bill.value = b;
    items.value = arr.length ? arr : [
      { name: '挂号费', amount: 20 },
      { name: '诊疗费', amount: 80 },
      { name: '材料费', amount: 28 }
    ];
  } catch(e) {}
});
const insuredAmount = computed(() => Number(bill.value.insuredAmount || 0));
const selfAmount = computed(() => Math.max(0, Number(bill.value.amount || 0) - insuredAmount.value));
</script>

<style lang="scss">
.container { display: flex; flex-direction: column; height: 100vh; background-color: $bg-body; font-family: -apple-system, BlinkMacSystemFont, "San Francisco", Helvetica, Arial, sans-serif; overflow: hidden; }
.header { padding: 20rpx 32rpx; background: $bg-body; position: sticky; top: 0; z-index: 10; }
.h1 { font-size: 40rpx; font-weight: 700; color: $text-main; }
.header-sub { display: flex; justify-content: space-between; align-items: center; margin-top: 8rpx; }
.chip { padding: 8rpx 16rpx; border-radius: 999rpx; background: #E8FCEF; color: $success-color; font-size: 24rpx; }
.chip.success { background: #E8FCEF; color: $success-color; }
.chip.danger { background: #FFE8E6; color: $alert-color; }
.scroll-content { flex: 1; padding: 0 32rpx; box-sizing: border-box; overflow-y: auto; }
.section-card { background: #fff; border-radius: 32rpx; padding: 32rpx; margin-bottom: 24rpx; }
.row { display: flex; justify-content: space-between; align-items: center; }
.title { font-size: 32rpx; font-weight: 600; color: $text-main; }
.info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12rpx; margin-top: 12rpx; }
.info-item { background: #f8f9fb; border-radius: 24rpx; padding: 24rpx; display: flex; flex-direction: column; gap: 8rpx; }
.label { font-size: 24rpx; color: $text-sub; }
.value { font-size: 32rpx; font-weight: 700; color: $text-main; }
.value.success { color: $success-color; }
.value.danger { color: $alert-color; }
.items { display: flex; flex-direction: column; gap: 12rpx; margin-top: 12rpx; }
.item { display: flex; justify-content: space-between; align-items: center; background: #f8f9fb; border-radius: 24rpx; padding: 24rpx; }
.name { font-size: 28rpx; color: $text-main; }
.amt { font-size: 32rpx; font-weight: 700; color: $text-main; }
.ai-box { margin-top: 12rpx; background: $primary-light; border-radius: 24rpx; padding: 24rpx; }
.ai-text { font-size: 28rpx; color: $text-main; }
.safe-area-spacer { height: 180rpx; padding-bottom: env(safe-area-inset-bottom); }
</style>
