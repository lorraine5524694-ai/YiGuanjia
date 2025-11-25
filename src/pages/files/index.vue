<template>
  <view class="container" :style="{ '--scale': fontScale }">
  <TopSafeArea />
    
    <!-- 头部 -->
    <view class="header">
      <view class="page-title">
        <text class="h1">健康档案</text>
      </view>
      <view class="family-selector" @click="toggleFamily">
        <image class="avatar-small" src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100&h=100" mode="aspectFill"></image>
        <text class="current-family">张爷爷</text>
        <view class="arrow-down"></view>
      </view>
    </view>

    <scroll-view scroll-y class="scroll-content">
      <!-- 搜索栏 -->
      <view class="search-bar">
        <view class="search-icon icon-bg-search"></view>
        <input class="search-input" placeholder="搜索病历、报告、医院..." v-model="keyword" />
        <button class="clear-btn" v-if="keyword" @click="clearKeyword">清除</button>
      </view>

      <!-- 分类入口 -->
      <view class="category-scroll">
        <view
          v-for="c in categories"
          :key="c"
          class="category-item"
          :class="{ active: selectedCategory === c }"
          @click="selectedCategory = c"
        >
          <text>{{ c }}</text>
        </view>
      </view>

      <!-- 时间轴列表 -->
      <view class="timeline">
        <view class="timeline-item" v-for="(item, index) in filteredRecords" :key="item.id || `${item.year}-${item.day}-${item.hospital}-${item.type}`">
          <view class="time-node">
            <view class="node-dot"></view>
            <view class="node-line" v-if="index !== filteredRecords.length - 1"></view>
          </view>
          
          <view class="record-content">
            <view class="record-date">
              <text class="date-day">{{ item.day }}</text>
              <text class="date-year">{{ item.year }}</text>
            </view>
            
            <view class="record-card" @click="showDetail(item)">
              <view class="card-header">
                <text class="hospital-name">{{ item.hospital }}</text>
                <view class="tag" :class="item.typeClass">{{ item.type }}</view>
              </view>
              
              <view class="card-body">
                <view class="diagnosis-row">
                  <text class="label">诊断：</text>
                  <text class="value">{{ item.diagnosis || '未填写诊断' }}</text>
                </view>
                <view class="info-row" v-if="item.doctor">
                  <text class="label">医生：</text>
                  <text class="value">{{ item.doctor }}</text>
                </view>
              </view>
              
              <view class="card-footer" v-if="item.hasAI">
                <view class="ai-badge-small">
                  <text>AI 解读</text>
                </view>
                <text class="ai-summary">{{ item.aiSummary }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 底部安全区垫高 -->
      <view class="safe-area-spacer"></view>
    </scroll-view>

    <!-- 统一 TabBar -->
    <CustomTabBar active="files" />
  </view>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import TopSafeArea from '@/components/TopSafeArea.vue';
import CustomTabBar from '@/components/CustomTabBar.vue';

const categories = ['全部', '门诊病历', '检查报告', '住院记录']
const selectedCategory = ref('全部')

const records = ref([
  {
    day: '11月25日',
    year: '2025',
    hospital: '北京协和',
    type: '门诊',
    typeClass: 'tag-blue',
    diagnosis: '未填写诊断',
    doctor: '王',
    hasAI: false,
    aiSummary: ''
  },
  {
    day: '10月24日',
    year: '2023',
    hospital: '北京协和医院',
    type: '门诊',
    typeClass: 'tag-blue',
    diagnosis: '急性上呼吸道感染',
    doctor: '王主任 (呼吸内科)',
    hasAI: true,
    aiSummary: '白细胞计数偏高，建议多饮水，按时服用阿莫西林...'
  },
  {
    day: '09月15日',
    year: '2023',
    hospital: '积水潭医院',
    type: '检查',
    typeClass: 'tag-green',
    diagnosis: '膝关节核磁共振(MRI)',
    doctor: '',
    hasAI: true,
    aiSummary: '半月板轻度损伤，建议减少剧烈运动。'
  },
  {
    day: '08月02日',
    year: '2023',
    hospital: '朝阳医院',
    type: '住院',
    typeClass: 'tag-purple',
    diagnosis: '2型糖尿病常规检查',
    doctor: '李主治医师',
    hasAI: false,
    aiSummary: ''
  }
]);

const fontScale = ref(1);
const keyword = ref('');

const typeMap = { '全部': null, '门诊病历': '门诊', '检查报告': '检查', '住院记录': '住院' }
const filteredRecords = computed(() => {
  const t = typeMap[selectedCategory.value]
  const list = t ? records.value.filter(r => r.type === t) : records.value
  const k = keyword.value.trim().toLowerCase()
  if (!k) return list
  return list.filter(r => {
    const fields = [r.hospital, r.diagnosis, r.doctor, r.type, `${r.year} ${r.day}`]
    return fields.some(v => (v || '').toLowerCase().includes(k))
  })
})

const clearKeyword = () => { keyword.value = '' }

const toggleFamily = () => {
  uni.showActionSheet({
    itemList: ['我自己', '张爷爷', '李奶奶'],
    success: (res) => {
      uni.showToast({ title: '切换成功', icon: 'none' });
    }
  });
};

const showDetail = (item) => { uni.navigateTo({ url: '/pages/files/detail' }) };

onMounted(() => {
  const list = uni.getStorageSync('filesRecords') || []
  if (list.length) {
    records.value = list.concat(records.value)
  }
  const pref = uni.getStorageSync('mm_preferences') || {}
  fontScale.value = pref.fontScale || 1
})

onLoad((opts) => {
  const tab = opts?.tab ? decodeURIComponent(opts.tab) : ''
  if (categories.includes(tab)) {
    selectedCategory.value = tab
  }
})
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
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: $bg-body;
  z-index: 10;
  position: sticky;
  top: 0;
  flex-shrink: 0;
}

.h1 {
  font-size: 40rpx;
  font-weight: 700;
  color: $text-main;
}

.family-selector {
  display: flex;
  align-items: center;
  background: rgba(255,255,255,0.8);
  padding: 8rpx 16rpx;
  border-radius: 32rpx;
  gap: 12rpx;
}

.avatar-small {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
}

.current-family {
  font-size: 28rpx;
  font-weight: 600;
  color: $text-main;
}

.arrow-down {
  width: 0; 
  height: 0; 
  border-left: 8rpx solid transparent;
  border-right: 8rpx solid transparent;
  border-top: 10rpx solid $text-sub;
}

.scroll-content {
  flex: 1;
  padding: 0 32rpx;
  box-sizing: border-box;
  overflow-y: auto;
}

/* 搜索栏 */
.search-bar {
  background: #E5E5EA;
  border-radius: 20rpx;
  padding: 16rpx 24rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.search-input {
  flex: 1;
  font-size: 28rpx;
  color: $text-main;
  background: transparent;
  border: 0;
  outline: none;
}

.clear-btn {
  background: #fff;
  color: $text-sub;
  padding: 8rpx 16rpx;
  border-radius: 32rpx;
  font-size: 24rpx;
}

.search-icon {
  width: 32rpx;
  height: 32rpx;
}
.icon-bg-search {
  background-color: $text-sub;
  mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiI+PGNpcmNsZSBjeD0iMTEiIGN5PSIxMSIgcj0iOCIvPjxsaW5lIHgxPSIyMSIgeTE9IjIxIiB4Mj0iMTYuNjUiIHkyPSIxNi42NSIvPjwvc3ZnPg==");
  -webkit-mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiI+PGNpcmNsZSBjeD0iMTEiIGN5PSIxMSIgcj0iOCIvPjxsaW5lIHgxPSIyMSIgeTE9IjIxIiB4Mj0iMTYuNjUiIHkyPSIxNi42NSIvPjwvc3ZnPg==");
  mask-size: contain; -webkit-mask-size: contain; mask-repeat: no-repeat; -webkit-mask-repeat: no-repeat; mask-position: center; -webkit-mask-position: center;
}

.search-placeholder {
  color: $text-sub;
  font-size: 28rpx;
}

/* 分类 */
.category-scroll {
  display: flex;
  gap: 24rpx;
  margin-bottom: 40rpx;
  overflow-x: auto;
}

.category-item {
  padding: 12rpx 32rpx;
  background: #fff;
  border-radius: 32rpx;
  color: $text-sub;
  font-size: calc(28rpx * var(--scale));
  font-weight: 500;
  line-height: 1;
  white-space: nowrap;
}

.category-item.active {
  background: $primary-color;
  color: #fff;
  font-size: calc(30rpx * var(--scale));
  font-weight: 700;
}

/* 时间轴 */
.timeline {
  display: flex;
  flex-direction: column;
}

.timeline-item {
  display: flex;
  gap: 24rpx;
  margin-bottom: 40rpx;
}

.time-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 40rpx;
  flex-shrink: 0;
}

.node-dot {
  width: 24rpx;
  height: 24rpx;
  background: $primary-color;
  border-radius: 50%;
  border: 4rpx solid #D0E3FF;
}

.node-line {
  flex: 1;
  width: 2rpx;
  background: #D1D1D6;
  margin-top: 8rpx;
}

.record-content {
  flex: 1;
}

.record-date {
  margin-bottom: 16rpx;
  display: flex;
  align-items: baseline;
  gap: 12rpx;
}

.date-day {
  font-size: 32rpx;
  font-weight: 700;
  color: $text-main;
}

.date-year {
  font-size: 24rpx;
  color: $text-sub;
}

.record-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.03);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24rpx;
}

.hospital-name {
  font-size: 30rpx;
  font-weight: 600;
  color: $text-main;
}

.tag {
  font-size: 20rpx;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
}
.tag-blue { background: #E5F1FF; color: #007AFF; }
.tag-green { background: #E8FCEF; color: #30D158; }
.tag-purple { background: #F7E5FF; color: #AF52DE; }

.card-body {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  margin-bottom: 24rpx;
}

.info-row, .diagnosis-row {
  font-size: 26rpx;
  color: $text-main;
}

.label {
  color: $text-sub;
}

.card-footer {
  background: #F2F2F7;
  border-radius: 16rpx;
  padding: 16rpx;
  display: flex;
  align-items: flex-start;
  gap: 12rpx;
}

.ai-badge-small {
  background: linear-gradient(90deg, #007AFF, #00C6FF);
  color: #fff;
  font-size: 16rpx;
  padding: 2rpx 8rpx;
  border-radius: 8rpx;
  flex-shrink: 0;
}

.ai-summary {
  font-size: 24rpx;
  color: $text-main;
  line-height: 1.4;
}

.safe-area-spacer {
  height: 180rpx;
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
