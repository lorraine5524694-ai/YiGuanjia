<template>
  <view class="container">
  <TopSafeArea />
    
    <view class="header">
      <view class="page-title">
        <text class="h1">统计分析</text>
      </view>
    </view>

    <scroll-view scroll-y class="scroll-content">
      <!-- 费用总览卡片 -->
      <view class="expense-card">
        <view class="expense-header">
          <text class="card-title">本年度医疗支出</text>
          <view class="year-select" @click="showYearPicker">
            <text>{{ currentYear }}年</text>
            <view class="arrow-down-white"></view>
          </view>
        </view>
        <view class="expense-total">
          <text class="currency">¥</text>
          <text class="amount">{{ currentData.total }}</text>
        </view>
        <view class="expense-detail">
          <view class="detail-item">
            <text class="label">医保支付</text>
            <text class="val">¥ {{ currentData.insurance }}</text>
          </view>
          <view class="detail-divider"></view>
          <view class="detail-item">
            <text class="label">自费支出</text>
            <text class="val">¥ {{ currentData.self }}</text>
          </view>
        </view>
      </view>

      <!-- 费用构成 (模拟饼图) -->
      <view class="section-card">
        <view class="card-title-row">
          <text class="h2">费用构成</text>
        </view>
        <view class="chart-container">
          <!-- 模拟环形图 -->
          <view class="pie-chart">
            <view class="pie-segment segment-1"></view>
            <view class="pie-center">
              <text class="center-text">总支出</text>
            </view>
          </view>
          <view class="legend-list">
            <view class="legend-item" v-for="(item, index) in expenses" :key="index">
              <view class="legend-left">
                <view class="dot" :style="{ background: item.color }"></view>
                <text class="legend-name">{{ item.name }}</text>
              </view>
              <view class="legend-right">
                <text class="legend-val">{{ item.percent }}%</text>
                <text class="legend-money">¥{{ item.amount }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 健康趋势 (模拟折线图) -->
      <view class="section-card">
        <view class="card-title-row">
          <text class="h2">健康指标趋势</text>
          <text class="sub-link">空腹血糖</text>
        </view>
        <view class="trend-chart">
          <view class="chart-grid">
            <view class="grid-line" v-for="i in 5" :key="i"></view>
          </view>
          <!-- 模拟折线点和连线 (仅示意) -->
          <view class="chart-points">
            <view 
              v-for="(val, idx) in trendData" 
              :key="idx"
              class="point" 
              :style="{ left: (idx * 20 + 10) + '%', bottom: (val / 10 * 100 - 20) + '%' }"
            >
              <view class="tooltip" :class="{ warning: val > 7.0 }">{{ val }}</view>
            </view>
          </view>
          <view class="x-axis">
             <text>1月</text>
             <text>3月</text>
             <text>5月</text>
             <text>7月</text>
             <text>9月</text>
          </view>
        </view>
      </view>
      
      <!-- 底部安全区垫高 -->
      <view class="safe-area-spacer"></view>
    </scroll-view>

    <!-- 统一 TabBar -->
    <CustomTabBar active="stats" />
  </view>
</template>

<script setup>
import { ref, computed } from 'vue';
import CustomTabBar from '@/components/CustomTabBar.vue';
import TopSafeArea from '@/components/TopSafeArea.vue';

const currentYear = ref(2025);
const years = [2025, 2024, 2023];

const allData = {
  2025: {
    total: '12,450.00',
    insurance: '8,200.00',
    self: '4,250.00',
    expenses: [
      { name: '药品费', percent: 45, amount: '5,602', color: '#007AFF' },
      { name: '检查费', percent: 30, amount: '3,735', color: '#30D158' },
      { name: '治疗费', percent: 15, amount: '1,867', color: '#FF9500' },
      { name: '挂号费', percent: 10, amount: '1,245', color: '#AF52DE' }
    ],
    trend: [6.1, 6.3, 5.8, 7.1, 6.2]
  },
  2024: {
    total: '8,320.00',
    insurance: '5,000.00',
    self: '3,320.00',
    expenses: [
      { name: '药品费', percent: 50, amount: '4,160', color: '#007AFF' },
      { name: '检查费', percent: 20, amount: '1,664', color: '#30D158' },
      { name: '治疗费', percent: 20, amount: '1,664', color: '#FF9500' },
      { name: '挂号费', percent: 10, amount: '832', color: '#AF52DE' }
    ],
    trend: [5.9, 6.0, 5.7, 6.5, 6.0]
  },
  2023: {
    total: '5,100.00',
    insurance: '3,000.00',
    self: '2,100.00',
    expenses: [
      { name: '药品费', percent: 60, amount: '3,060', color: '#007AFF' },
      { name: '检查费', percent: 10, amount: '510', color: '#30D158' },
      { name: '治疗费', percent: 20, amount: '1,020', color: '#FF9500' },
      { name: '挂号费', percent: 10, amount: '510', color: '#AF52DE' }
    ],
    trend: [5.8, 5.9, 5.6, 6.0, 5.9]
  }
};

const currentData = computed(() => allData[currentYear.value] || allData[2025]);

const expenses = computed(() => currentData.value.expenses);
const trendData = computed(() => currentData.value.trend);

const showYearPicker = () => {
  uni.showActionSheet({
    itemList: years.map(y => y + '年'),
    success: (res) => {
      currentYear.value = years[res.tapIndex];
    }
  });
};

const showToast = (msg) => {
  uni.showToast({ title: msg, icon: 'none' });
};
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
  flex-shrink: 0;
}

.header {
  padding: 20rpx 32rpx;
  background: $bg-body;
  position: sticky;
  top: 0;
  z-index: 10;
  flex-shrink: 0;
}

.h1 {
  font-size: 40rpx;
  font-weight: 700;
  color: $text-main;
}

.scroll-content {
  flex: 1;
  padding: 0 32rpx;
  box-sizing: border-box;
  overflow-y: auto;
}

/* 费用总卡片 */
.expense-card {
  background: linear-gradient(135deg, #FF9500 0%, #FFCC00 100%);
  border-radius: 40rpx;
  padding: 40rpx;
  color: #fff;
  margin-bottom: 32rpx;
  box-shadow: 0 16rpx 40rpx rgba(255, 149, 0, 0.25);
}

.expense-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
  opacity: 0.9;
}

.card-title {
  font-size: 28rpx;
}

.year-select {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 24rpx;
  background: rgba(255,255,255,0.2);
  padding: 4rpx 16rpx;
  border-radius: 20rpx;
}

.arrow-down-white {
  width: 0; height: 0;
  border-left: 8rpx solid transparent;
  border-right: 8rpx solid transparent;
  border-top: 8rpx solid #fff;
}

.expense-total {
  margin-bottom: 32rpx;
}

.currency {
  font-size: 32rpx;
  font-weight: 600;
  margin-right: 8rpx;
}

.amount {
  font-size: 64rpx;
  font-weight: 700;
  font-feature-settings: "tnum";
}

.expense-detail {
  display: flex;
  background: rgba(255,255,255,0.15);
  border-radius: 24rpx;
  padding: 24rpx;
}

.detail-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.detail-divider {
  width: 2rpx;
  background: rgba(255,255,255,0.3);
  margin: 0 24rpx;
}

.label {
  font-size: 24rpx;
  opacity: 0.8;
}

.val {
  font-size: 32rpx;
  font-weight: 600;
}

/* 模块卡片 */
.section-card {
  background: #fff;
  border-radius: 32rpx;
  padding: 32rpx;
  margin-bottom: 32rpx;
}

.card-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32rpx;
}

.h2 {
  font-size: 32rpx;
  font-weight: 700;
  color: $text-main;
}

.sub-link {
  font-size: 24rpx;
  color: $primary-color;
}

/* 图表容器 */
.chart-container {
  display: flex;
  align-items: center;
  gap: 32rpx;
}

.pie-chart {
  width: 240rpx;
  height: 240rpx;
  border-radius: 50%;
  background: conic-gradient(
    #007AFF 0% 45%, 
    #30D158 45% 75%, 
    #FF9500 75% 90%, 
    #AF52DE 90% 100%
  );
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.pie-center {
  width: 160rpx;
  height: 160rpx;
  background: #fff;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.center-text {
  font-size: 24rpx;
  color: $text-sub;
}

.legend-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.legend-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 26rpx;
}

.legend-left {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.dot {
  width: 20rpx;
  height: 20rpx;
  border-radius: 6rpx;
}

.legend-name {
  color: $text-sub;
}

.legend-val {
  font-weight: 600;
  color: $text-main;
  margin-right: 12rpx;
}

.legend-money {
  color: $text-sub;
  font-size: 24rpx;
}

/* 趋势图 */
.trend-chart {
  height: 300rpx;
  position: relative;
  border-left: 2rpx solid #E5E5EA;
  border-bottom: 2rpx solid #E5E5EA;
  margin: 20rpx 0 40rpx 40rpx; 
}

.chart-grid {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.grid-line {
  width: 100%;
  height: 2rpx;
  background: #f5f5f5;
}

.chart-points {
  position: absolute;
  width: 100%;
  height: 100%;
}

.point {
  position: absolute;
  width: 16rpx;
  height: 16rpx;
  background: $primary-color;
  border-radius: 50%;
  transform: translate(-50%, 50%);
  border: 4rpx solid #fff;
  box-shadow: 0 4rpx 8rpx rgba(0,0,0,0.1);
}

.tooltip {
  position: absolute;
  bottom: 24rpx;
  left: 50%;
  transform: translateX(-50%);
  background: $text-main;
  color: #fff;
  font-size: 20rpx;
  padding: 4rpx 8rpx;
  border-radius: 8rpx;
  white-space: nowrap;
}

.tooltip.warning {
  background: #FF453A;
}

.x-axis {
  position: absolute;
  bottom: -40rpx;
  width: 100%;
  display: flex;
  justify-content: space-between;
  font-size: 22rpx;
  color: $text-sub;
}

.safe-area-spacer {
  height: 180rpx;
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
