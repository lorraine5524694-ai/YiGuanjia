<template>
  <view class="container">
    <TopSafeArea />
    
    <view class="header">
      <view class="nav-back" @click="goBack">
        <text class="back-icon">←</text>
      </view>
      <text class="h1">添加药品</text>
      <view class="step-indicator">
        <text class="step-text">1/2</text>
      </view>
    </view>

    <scroll-view scroll-y class="scroll-content">
      <view class="intro-text">
        <text>你可以直接搜索药品名称，或者拍摄药盒包装来快速添加。</text>
      </view>

      <!-- 搜索区域 -->
      <view class="search-section">
        <view class="search-box" :class="{ focused: isFocused }">
          <view class="search-icon"></view>
          <input 
            class="search-input" 
            placeholder="搜索药品，如“阿莫西林”" 
            placeholder-class="input-placeholder"
            v-model="query" 
            @input="onInput"
            @focus="isFocused = true"
            @blur="isFocused = false"
          />
          <view class="clear-icon" v-if="query" @click="clear">×</view>
        </view>

        <!-- 搜索建议列表 -->
        <view v-if="suggestions.length" class="suggestions-box">
          <view v-for="(s, i) in suggestions" :key="s.name + i" class="suggestion-item" @click="selectMed(s)">
            <view class="suggestion-icon">💊</view>
            <view class="suggestion-info">
              <text class="s-name">{{ s.name }}</text>
              <text class="s-spec">{{ s.spec }}</text>
            </view>
            <view class="suggestion-arrow">→</view>
          </view>
        </view>
      </view>

      <!-- 快速操作卡片 -->
      <view class="action-grid" v-if="!suggestions.length && !selected">
        <view class="action-card primary" @click="chooseImage">
          <view class="action-icon icon-camera"></view>
          <text class="action-title">拍照识别</text>
          <text class="action-desc">拍摄药盒正面</text>
        </view>
        <view class="action-card secondary" @click="chooseAlbum">
          <view class="action-icon icon-album"></view>
          <text class="action-title">相册导入</text>
          <text class="action-desc">从相册选择图片</text>
        </view>
      </view>

      <!-- 图片预览 -->
      <view v-if="previewImg" class="preview-box">
        <image :src="previewImg" mode="aspectFill" class="preview-img"></image>
        <view class="re-upload-btn" @click="chooseImage">
          <text>重新拍摄</text>
        </view>
      </view>

      <!-- 选中药品展示 -->
      <view v-if="selected" class="result-card">
        <view class="result-header">
          <view class="result-icon-box">
            <view class="med-icon icon-pill"></view>
          </view>
          <view class="result-info">
            <text class="r-name">{{ selected.name }}</text>
            <text class="r-spec">{{ selected.spec }}</text>
          </view>
          <view class="check-badge">✓</view>
        </view>

        <view v-if="selectedPlan" class="conflict-box">
          <text class="conflict-title">⚠️ 已存在该药品的计划</text>
          <view class="conflict-detail">
            <text>剂量: {{ selectedPlan.dose || '-' }}</text>
            <text>频次: {{ selectedPlan.freqLabel || '-' }}</text>
          </view>
        </view>

        <button class="next-btn" @click="goPlan">
          <text>下一步：设置计划</text>
          <text class="btn-arrow">→</text>
        </button>
      </view>

      <view class="safe-area-spacer"></view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import TopSafeArea from '@/components/TopSafeArea.vue';
import { analyzeImageContent, performOCR, searchMedicines } from '@/services/deepseek.js';

const query = ref('');
const suggestions = ref([]);
const selected = ref(null);
const previewImg = ref('');
const selectedPlan = ref(null);
const isFocused = ref(false);
const searchTimer = ref(null);

const goBack = () => {
  uni.navigateBack();
};

const onInput = () => {
  previewImg.value = '';
  selected.value = null;
  selectedPlan.value = null;
  
  if (searchTimer.value) clearTimeout(searchTimer.value);
  searchTimer.value = setTimeout(() => {
    onSearch();
  }, 800);
};

const onSearch = async () => {
  const q = query.value.trim();
  if (!q) { suggestions.value = []; return; }
  
  try {
    const res = await searchMedicines(q);
    suggestions.value = res;
  } catch (e) {
    console.error(e);
    suggestions.value = [];
  }
};

const clear = () => { query.value = ''; suggestions.value = []; };

const selectMed = (m) => {
  selected.value = { ...m };
  previewImg.value = '';
  query.value = '';
  suggestions.value = [];
  
  uni.vibrateShort();
  loadSelectedPlan();
  
  if (selectedPlan.value) {
    uni.showModal({
      title: '已存在同名药品',
      content: `已存在药品“${selected.value.name}”的用药计划，是否前往编辑？`,
      confirmText: '去编辑',
      cancelText: '重新选择',
      success: (res) => {
        if (res.confirm) {
          const q = encodeURIComponent(JSON.stringify(selectedPlan.value));
          uni.navigateTo({ url: '/pages/meds/plan?plan=' + q });
        } else {
          selected.value = null;
          selectedPlan.value = null;
        }
      }
    });
  }
};

const processImage = async (path) => {
  query.value = '';
  suggestions.value = [];
  selected.value = null;
  
  previewImg.value = path;
  uni.showLoading({ title: 'AI 识别中...', mask: true });
  
  try {
    const ocrText = await performOCR(path);
    if (!ocrText) throw new Error('无法识别图片文字');
    
    const result = await analyzeImageContent(ocrText, 'med');
    uni.hideLoading();
    
    if (result && result.name) {
      selected.value = { 
        name: result.name, 
        spec: result.spec || '按说明书' 
      };
      uni.vibrateShort();
      uni.showToast({ title: '识别成功', icon: 'success' });
    } else {
      throw new Error('识别结果为空');
    }
  } catch (e) {
    uni.hideLoading();
    console.error(e);
    selected.value = { name: '识别结果 · ' + (query.value || '未知药品'), spec: '按说明书' };
    uni.showToast({ title: '识别失败，已使用默认值', icon: 'none' });
  } finally {
    loadSelectedPlan();
  }
};

const chooseImage = () => {
  uni.chooseImage({ count: 1, sourceType: ['camera'], success: (res) => processImage(res.tempFilePaths[0]) });
};

const chooseAlbum = () => {
  uni.chooseImage({ count: 1, sourceType: ['album'], success: (res) => processImage(res.tempFilePaths[0]) });
};

const loadSelectedPlan = () => {
  try {
    const list = uni.getStorageSync('meds_plans') || [];
    const n = selected.value && selected.value.name;
    selectedPlan.value = n ? (list.find(x => x.name === n) || null) : null;
  } catch (e) {
    selectedPlan.value = null;
  }
};

const goPlan = () => {
  if (!selected.value) return;
  if (selectedPlan.value) {
    const q = encodeURIComponent(JSON.stringify(selectedPlan.value));
    uni.navigateTo({ url: '/pages/meds/plan?plan=' + q });
  } else {
    const name = encodeURIComponent(selected.value.name);
    uni.navigateTo({ url: '/pages/meds/plan?name=' + name });
  }
};

onShow(() => { loadSelectedPlan(); });
</script>

<style lang="scss">
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: $bg-body;
  font-family: -apple-system, BlinkMacSystemFont, "San Francisco", Helvetica, Arial, sans-serif;
}

.header {
  padding: 20rpx 32rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: $bg-body;
}

.nav-back {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: 50%;
  box-shadow: $shadow-sm;
}

.back-icon {
  font-size: 36rpx;
  color: $text-main;
  font-weight: bold;
}

.h1 {
  font-size: 36rpx;
  font-weight: 700;
  color: $text-main;
}

.step-indicator {
  padding: 8rpx 16rpx;
  background: $primary-light;
  border-radius: 24rpx;
}

.step-text {
  font-size: 24rpx;
  font-weight: 600;
  color: $primary-color;
}

.scroll-content {
  flex: 1;
  padding: 32rpx;
}

.intro-text {
  margin-bottom: 40rpx;
  color: $text-sub;
  font-size: 28rpx;
  line-height: 1.5;
}

/* Search Box */
.search-section {
  margin-bottom: 40rpx;
  position: relative;
}

.search-box {
  background: #fff;
  border-radius: 32rpx;
  padding: 24rpx 32rpx;
  display: flex;
  align-items: center;
  gap: 20rpx;
  box-shadow: $shadow-sm;
  border: 2rpx solid transparent;
  transition: all 0.3s ease;
}

.search-box.focused {
  border-color: $primary-color;
  box-shadow: 0 8rpx 24rpx rgba(0, 122, 255, 0.15);
}

.search-icon {
  width: 40rpx;
  height: 40rpx;
  background-color: $text-sub;
  mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiI+PGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iNiIvPjxsaW5lIHgxPSIxNSIgeTE9IjE1IiB4Mj0iMjIiIHkyPSIyMiIvPjwvc3ZnPg==");
  -webkit-mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiI+PGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iNiIvPjxsaW5lIHgxPSIxNSIgeTE9IjE1IiB4Mj0iMjIiIHkyPSIyMiIvPjwvc3ZnPg==");
  mask-size: contain; -webkit-mask-size: contain; mask-repeat: no-repeat; -webkit-mask-repeat: no-repeat; mask-position: center; -webkit-mask-position: center;
}

.search-input {
  flex: 1;
  font-size: 30rpx;
  color: $text-main;
  height: 48rpx;
}

.input-placeholder {
  color: #C0C4CC;
}

.clear-icon {
  width: 40rpx;
  height: 40rpx;
  background: #F0F2F5;
  color: #999;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
}

/* Suggestions */
.suggestions-box {
  position: absolute;
  top: 110%;
  left: 0;
  right: 0;
  background: #fff;
  border-radius: 24rpx;
  box-shadow: $shadow-lg;
  z-index: 100;
  overflow: hidden;
  padding: 16rpx;
}

.suggestion-item {
  display: flex;
  align-items: center;
  padding: 24rpx;
  border-radius: 16rpx;
  gap: 20rpx;
}

.suggestion-item:active {
  background: $bg-body;
}

.suggestion-icon {
  font-size: 32rpx;
}

.suggestion-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.s-name { font-size: 28rpx; color: $text-main; font-weight: 500; }
.s-spec { font-size: 24rpx; color: $text-sub; }
.suggestion-arrow { color: $text-sub; font-size: 24rpx; }

/* Action Grid */
.action-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24rpx;
  margin-bottom: 40rpx;
}

.action-card {
  background: #fff;
  border-radius: 32rpx;
  padding: 40rpx 24rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
  box-shadow: $shadow-sm;
  transition: transform 0.1s;
}

.action-card:active {
  transform: scale(0.98);
}

.action-icon {
  width: 80rpx;
  height: 80rpx;
  margin-bottom: 8rpx;
  background-color: $primary-color;
  mask-size: contain; -webkit-mask-size: contain; mask-repeat: no-repeat; -webkit-mask-repeat: no-repeat; mask-position: center; -webkit-mask-position: center;
}

.icon-camera {
  mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiI+PHBhdGggZD0iTTIzIDE5YTIgMiAwIDAgMS0yIDJIMUMyYTIgMiAwIDAgMS0yLTJWOYTJgMiAwIDAgMSAyLTJoM2wyLTNoNGwyIDNoM2EyIDIgMCAwIDEgMiAyeg0iLz48Y2lyY2xlIGN4PSIxMiIgY3k9IjEzIiByPSI0Ii8+PC9zdmc+");
  -webkit-mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiI+PHBhdGggZD0iTTIzIDE5YTIgMiAwIDAgMS0yIDJIMUMyYTIgMiAwIDAgMS0yLTJWOYTJgMiAwIDAgMSAyLTJoM2wyLTNoNGwyIDNoM2EyIDIgMCAwIDEgMiAyeg0iLz48Y2lyY2xlIGN4PSIxMiIgY3k9IjEzIiByPSI0Ii8+PC9zdmc+");
}

.icon-album {
  background-color: $secondary-color;
  mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiI+PHJlY3QgeD0iMyIgeT0iMyIgd2lkdGg9IjE4IiBoZWlnaHQ9IjE4IiByeD0iMiIgcnk9IjIiLz48Y2lyY2xlIGN4PSI4LjUiIGN5PSI4LjUiIHI9IjEuNSIvPjxwb2x5bGluZSBwb2ludHM9IjIxIDE1IDE2IDEwIDUgMjEiLz48L3N2Zz4=");
  -webkit-mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiI+PHJlY3QgeD0iMyIgeT0iMyIgd2lkdGg9IjE4IiBoZWlnaHQ9IjE4IiByeD0iMiIgcnk9IjIiLz48Y2lyY2xlIGN4PSI4LjUiIGN5PSI4LjUiIHI9IjEuNSIvPjxwb2x5bGluZSBwb2ludHM9IjIxIDE1IDE2IDEwIDUgMjEiLz48L3N2Zz4=");
}

.action-title { font-size: 30rpx; font-weight: 600; color: $text-main; }
.action-desc { font-size: 24rpx; color: $text-sub; }

/* Preview Box */
.preview-box {
  margin-bottom: 40rpx;
  border-radius: 32rpx;
  overflow: hidden;
  position: relative;
  box-shadow: $shadow-base;
}

.preview-img {
  width: 100%;
  height: 400rpx;
  background: #000;
}

.re-upload-btn {
  position: absolute;
  bottom: 24rpx;
  right: 24rpx;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(10px);
  padding: 12rpx 24rpx;
  border-radius: 32rpx;
  color: #fff;
  font-size: 24rpx;
}

/* Result Card */
.result-card {
  background: #fff;
  border-radius: 32rpx;
  padding: 32rpx;
  box-shadow: $shadow-base;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from { transform: translateY(20rpx); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.result-header {
  display: flex;
  align-items: center;
  gap: 24rpx;
  margin-bottom: 32rpx;
}

.result-icon-box {
  width: 96rpx;
  height: 96rpx;
  background: $primary-light;
  border-radius: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.med-icon {
  width: 48rpx;
  height: 48rpx;
  background-color: $primary-color;
  mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiI+PHJlY3QgeD0iMiIgeT0iNiIgd2lkdGg9IjIwIiBoZWlnaHQ9IjEyIiByeD0iNiIvPjxwYXRoIGQ9Ik0xMiA2djEyIi8+PC9zdmc+");
  -webkit-mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiI+PHJlY3QgeD0iMiIgeT0iNiIgd2lkdGg9IjIwIiBoZWlnaHQ9IjEyIiByeD0iNiIvPjxwYXRoIGQ9Ik0xMiA2djEyIi8+PC9zdmc+");
  mask-size: contain; -webkit-mask-size: contain; mask-repeat: no-repeat; -webkit-mask-repeat: no-repeat; mask-position: center; -webkit-mask-position: center;
}

.result-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.r-name { font-size: 36rpx; font-weight: 700; color: $text-main; }
.r-spec { font-size: 26rpx; color: $text-sub; }

.check-badge {
  width: 48rpx;
  height: 48rpx;
  background: $success-color;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.conflict-box {
  background: #FFF8E1;
  border-radius: 20rpx;
  padding: 24rpx;
  margin-bottom: 32rpx;
  border: 2rpx solid #FFE082;
}

.conflict-title {
  font-size: 26rpx;
  font-weight: 600;
  color: #F57F17;
  margin-bottom: 8rpx;
  display: block;
}

.conflict-detail {
  font-size: 24rpx;
  color: #FFB300;
  display: flex;
  gap: 24rpx;
}

.next-btn {
  background: $primary-color;
  color: #fff;
  border-radius: 28rpx;
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  font-size: 32rpx;
  font-weight: 600;
  box-shadow: 0 12rpx 32rpx rgba(0, 122, 255, 0.3);
  transition: all 0.2s;
}

.next-btn:active {
  transform: scale(0.98);
  box-shadow: 0 6rpx 16rpx rgba(0, 122, 255, 0.2);
}

.safe-area-spacer { height: 100rpx; }
</style>
