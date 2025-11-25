<template>
  <view class="container">
    <TopSafeArea />
    <view class="header">
      <text class="h1">报告详情</text>
      <view class="header-sub">
        <text>{{ meta.hospital || '未填写' }} · {{ meta.department }}</text>
        <view class="chip" :class="{ danger: meta.abnormalCount>0 }">{{ meta.date }} · {{ meta.abnormalCount>0 ? meta.abnormalCount + '项异常' : '正常' }}</view>
      </view>
    </view>
    <scroll-view scroll-y class="scroll-content">
      <view class="section-card">
        <text class="title">指标列表</text>
        <view class="metrics">
          <view v-for="(m,i) in metrics" :key="i" class="metric" :class="{ danger: m.flag!=='normal' }">
            <view class="m-left">
              <text class="m-name">{{ m.name }}</text>
              <text class="m-ref">参考: {{ m.ref }}</text>
            </view>
            <view class="m-right">
              <text class="m-val">{{ m.value }}</text>
              <text v-if="m.flag==='high'" class="arrow">↑</text>
              <text v-else-if="m.flag==='low'" class="arrow">↓</text>
            </view>
          </view>
        </view>
      </view>

      <view class="section-card">
        <text class="title">趋势对比</text>
        <view class="trend-list">
          <view v-for="(t,idx) in trends" :key="idx" class="trend-item">
            <text class="trend-name">{{ t.name }}</text>
            <view class="bars">
              <view v-for="(v,i) in t.values" :key="i" class="bar" :style="{ height: 12 + v*2 + 'rpx', background: v>t.refHigh || v<t.refLow ? '#ff453a' : '#30d158' }"></view>
            </view>
          </view>
        </view>
      </view>

      <view class="section-card">
        <view class="row">
          <text class="title">AI 解读</text>
          <view class="chip">生成</view>
        </view>
        <view class="ai-box">
          <text class="ai-text">{{ aiText }}</text>
          <view class="disclaimer">AI 内容仅供参考，具体诊疗请遵循医嘱</view>
        </view>
      </view>

      <view class="safe-area-spacer"></view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import TopSafeArea from '@/components/TopSafeArea.vue';

const meta = ref({ date: '', hospital: '', department: '', abnormalCount: 0 });
const metrics = ref([]);
const trends = ref([]);
const aiText = ref('');
onMounted(() => {
  try {
    const m = uni.getStorageSync('currentReportMeta') || {};
    const arr = uni.getStorageSync('currentReportMetrics') || [];
    meta.value = m;
    metrics.value = arr;
    trends.value = [
      { name: '白细胞 WBC', values: [7.2, 8.1, 12.5], refLow: 3.5, refHigh: 9.5 },
      { name: '血红蛋白 HGB', values: [118, 110, 95], refLow: 115, refHigh: 150 },
    ];
    aiText.value = '根据当前报告，存在部分指标异常：白细胞计数偏高可能与感染或炎症相关，建议结合症状就医进一步检查；血红蛋白偏低提示可能存在贫血风险，可与医生讨论饮食与复查计划。';
  } catch(e) {}
});
</script>

<style lang="scss">
.container { display: flex; flex-direction: column; height: 100vh; background-color: $bg-body; font-family: -apple-system, BlinkMacSystemFont, "San Francisco", Helvetica, Arial, sans-serif; overflow: hidden; }
.header { padding: 20rpx 32rpx; background: $bg-body; position: sticky; top: 0; z-index: 10; }
.h1 { font-size: 40rpx; font-weight: 700; color: $text-main; }
.header-sub { display: flex; justify-content: space-between; align-items: center; margin-top: 8rpx; }
.chip { padding: 8rpx 16rpx; border-radius: 999rpx; background: #E8FCEF; color: $success-color; font-size: 24rpx; }
.chip.danger { background: #FFE8E6; color: $alert-color; }
.scroll-content { flex: 1; padding: 0 32rpx; box-sizing: border-box; overflow-y: auto; }
.section-card { background: #fff; border-radius: 32rpx; padding: 32rpx; margin-bottom: 24rpx; }
.title { font-size: 32rpx; font-weight: 600; color: $text-main; }
.metrics { display: flex; flex-direction: column; gap: 12rpx; margin-top: 12rpx; }
.metric { display: flex; justify-content: space-between; align-items: center; background: #f8f9fb; border-radius: 24rpx; padding: 24rpx; }
.metric.danger { background: #FFE8E6; }
.m-left { display: flex; flex-direction: column; gap: 6rpx; }
.m-name { font-size: 28rpx; color: $text-main; }
.m-ref { font-size: 24rpx; color: $text-sub; }
.m-right { display: flex; align-items: baseline; gap: 8rpx; }
.m-val { font-size: 36rpx; font-weight: 700; color: $text-main; }
.arrow { font-size: 32rpx; color: $alert-color; }
.trend-list { display: flex; flex-direction: column; gap: 16rpx; margin-top: 12rpx; }
.trend-item { background: #f8f9fb; border-radius: 24rpx; padding: 24rpx; }
.trend-name { font-size: 28rpx; color: $text-main; margin-bottom: 8rpx; }
.bars { display: flex; gap: 8rpx; align-items: flex-end; height: 80rpx; }
.bar { width: 24rpx; border-radius: 12rpx; }
.row { display: flex; justify-content: space-between; align-items: center; }
.ai-box { margin-top: 12rpx; background: $primary-light; border-radius: 24rpx; padding: 24rpx; }
.ai-text { font-size: 28rpx; color: $text-main; }
.disclaimer { margin-top: 12rpx; font-size: 22rpx; color: $alert-color; }
.safe-area-spacer { height: 180rpx; padding-bottom: env(safe-area-inset-bottom); }
</style>
