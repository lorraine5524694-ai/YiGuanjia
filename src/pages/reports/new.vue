<template>
  <view class="container">
    <TopSafeArea />
    <view class="header">
      <view class="header-left">
        <view class="back-btn" @click="goBack">
          <view class="icon-back"></view>
        </view>
        <text class="h1">上传报告</text>
      </view>
    </view>
    <scroll-view scroll-y class="scroll-content">
      <view class="section-card clickable" @click="pickImages">
        <view v-if="images.length" class="preview-grid">
          <image v-for="(src,i) in images" :key="i" :src="src" mode="aspectFill" class="preview" />
        </view>
        <view v-else class="placeholder">
          <view class="icon upload"></view>
          <text class="hint">点击上传按钮拍照或选图</text>
        </view>
      </view>

      <view class="section-card">
        <view class="row">
          <text class="title">识别与分析</text>
          <view class="chip primary" :class="{ disabled: !images.length }" @click="analyze">开始识别</view>
        </view>
        <view v-if="metrics.length" class="metrics">
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

      <view class="section-card" v-if="metrics.length">
        <view class="row">
          <text class="title">保存并查看详情</text>
          <view class="chip" @click="saveAndOpen">保存</view>
        </view>
      </view>

      <view class="safe-area-spacer"></view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import TopSafeArea from '@/components/TopSafeArea.vue';

import { analyzeImageContent, mockOCR } from '@/services/deepseek.js';

const images = ref([]);
const metrics = ref([]);
const pickImages = () => {
  uni.chooseImage({ count: 9, sizeType: ['compressed'], sourceType: ['camera','album'], success: (res) => { images.value = res.tempFilePaths || res.tempFiles?.map(f=>f.path) || []; } });
};
const analyze = async () => {
  if (!images.value.length) return;
  
  uni.showLoading({ title: 'AI 识别中...' });
  try {
    // 1. OCR (Mock for now)
    const ocrText = await mockOCR(images.value[0]);
    
    // 2. DeepSeek Analysis
    const result = await analyzeImageContent(ocrText, 'report');
    
    // 3. Map result to metrics
    // Assuming result is array or object. If array:
    if (Array.isArray(result)) {
      metrics.value = result;
    } else if (result.metrics) {
      metrics.value = result.metrics;
    } else {
       // Fallback if structure is different
       metrics.value = [
        { name: '白细胞计数 WBC', value: '12.5', ref: '3.5-9.5', flag: 'high' },
        { name: '红细胞计数 RBC', value: '4.1', ref: '3.8-5.1', flag: 'normal' },
        { name: '血红蛋白 HGB', value: '95', ref: '115-150', flag: 'low' },
      ];
    }
    
    uni.showToast({ title: '识别完成', icon: 'success' });
  } catch (e) {
    uni.showToast({ title: '识别失败', icon: 'none' });
    console.error(e);
  } finally {
    uni.hideLoading();
  }
};
const saveAndOpen = () => {
  const meta = { id: 'tmp'+Date.now(), date: new Date().toISOString().slice(0,10), hospital: '待填写', department: '检验科', abnormalCount: metrics.value.filter(m=>m.flag!=='normal').length };
  uni.setStorageSync('currentReportMeta', meta);
  uni.setStorageSync('currentReportMetrics', metrics.value);
  uni.navigateTo({ url: '/pages/reports/detail' });
};

const goBack = () => {
  uni.navigateBack();
};
</script>

<style lang="scss">
.container { display: flex; flex-direction: column; height: 100vh; background-color: $bg-body; font-family: -apple-system, BlinkMacSystemFont, "San Francisco", Helvetica, Arial, sans-serif; overflow: hidden; }
.header { padding: 20rpx 32rpx; background: $bg-body; position: sticky; top: 0; z-index: 10; display: flex; justify-content: space-between; align-items: center; }
.header-left { display: flex; align-items: center; gap: 8rpx; }
.back-btn { width: 64rpx; height: 64rpx; display: flex; align-items: center; justify-content: center; margin-left: -16rpx; }
.icon-back { width: 40rpx; height: 40rpx; background-color: $text-main; mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik0xNSAxOGwtNi02IDYtNiIvPjwvc3ZnPg=="); -webkit-mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik0xNSAxOGwtNi02IDYtNiIvPjwvc3ZnPg=="); mask-size: contain; -webkit-mask-size: contain; mask-repeat: no-repeat; -webkit-mask-repeat: no-repeat; mask-position: center; -webkit-mask-position: center; }
.h1 { font-size: 40rpx; font-weight: 700; color: $text-main; }
.actions { display: flex; gap: 12rpx; }
.scroll-content { flex: 1; padding: 0 32rpx; box-sizing: border-box; overflow-y: auto; }
.section-card { background: #fff; border-radius: 32rpx; padding: 32rpx; margin-bottom: 24rpx; }
.chip { padding: 8rpx 16rpx; border-radius: 999rpx; background: #fff; font-size: 24rpx; color: $text-main; }
.chip.primary { background: $primary-color; color: #fff; }
.chip.disabled { opacity: 0.5; }
.preview-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12rpx; }
.preview { width: 100%; height: 200rpx; border-radius: 20rpx; object-fit: cover; }
.placeholder { display: flex; flex-direction: column; align-items: center; gap: 12rpx; color: $text-sub; }
.icon { width: 80rpx; height: 80rpx; }
.upload { background-color: $primary-color; mask: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="white" fill="none" stroke-width="2"><path d="M12 16V4"/><path d="M6 10l6-6 6 6"/><path d="M4 20h16"/></svg>') no-repeat center / contain; }
.row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16rpx; }
.title { font-size: 32rpx; font-weight: 600; color: $text-main; }
.metrics { display: flex; flex-direction: column; gap: 12rpx; }
.metric { display: flex; justify-content: space-between; align-items: center; background: #f8f9fb; border-radius: 24rpx; padding: 24rpx; }
.metric.danger { background: #FFE8E6; }
.m-left { display: flex; flex-direction: column; gap: 6rpx; }
.m-name { font-size: 28rpx; color: $text-main; }
.m-ref { font-size: 24rpx; color: $text-sub; }
.m-right { display: flex; align-items: baseline; gap: 8rpx; }
.m-val { font-size: 36rpx; font-weight: 700; color: $text-main; }
.arrow { font-size: 32rpx; color: $alert-color; }
.safe-area-spacer { height: 180rpx; padding-bottom: env(safe-area-inset-bottom); }
</style>
