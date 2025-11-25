<template>
  <view class="container">
    <TopSafeArea />
    <view class="header">
      <text class="h1">添加药品用药计划</text>
      <view class="steps">
        <view class="step active">
          <text class="step-index">1</text>
          <text class="step-label">添加药品</text>
        </view>
        <view class="step-line"></view>
        <view class="step">
          <text class="step-index">2</text>
          <text class="step-label">设置用药计划</text>
        </view>
      </view>
    </view>
    <scroll-view scroll-y class="scroll-content">
      <view class="section-card">
        <view class="search-row">
          <view class="search-icon"></view>
          <input class="search-input" placeholder="输入药品名称，如“阿莫西林”" v-model="query" @input="onSearch" />
          <button class="secondary-btn" v-if="query" @click="clear">清除</button>
        </view>
        <view v-if="suggestions.length" class="suggest-list">
          <view v-for="(s, i) in suggestions" :key="s.name + i" class="suggest-item" @click="selectMed(s)">
            <text class="suggest-name">{{ s.name }}</text>
            <text class="suggest-spec">{{ s.spec }}</text>
          </view>
        </view>
      </view>

      <view class="section-card">
        <view class="ocr-row">
          <button class="primary-btn" @click="chooseImage">拍照识别</button>
          <button class="ghost-btn" @click="chooseAlbum">相册选择</button>
        </view>
        <view v-if="previewImg" class="preview">
          <image :src="previewImg" mode="aspectFill" class="preview-img"></image>
        </view>
      </view>

      <view v-if="selected" class="section-card">
        <view class="selected-card">
          <view class="med-icon-bg small"><view class="med-icon icon-bg-pill"></view></view>
          <view class="selected-info">
            <text class="selected-name">{{ selected.name }}</text>
            <text class="selected-spec">{{ selected.spec }}</text>
          </view>
        </view>

        <view v-if="selectedPlan" class="rule-card">
          <view class="rule-title">计划规则</view>
          <view class="rule-row"><text class="rule-label">剂量</text><text class="rule-val">{{ selectedPlan.dose || '按说明书' }}</text></view>
          <view class="rule-row"><text class="rule-label">饭前/饭后</text><text class="rule-val">{{ selectedPlan.meal }}</text></view>
          <view class="rule-row"><text class="rule-label">每日次数</text><text class="rule-val">{{ selectedPlan.freqLabel }}</text></view>
          <view class="rule-row"><text class="rule-label">时间</text><text class="rule-val">{{ (selectedPlan.times || []).join('、') }}</text></view>
          <view class="rule-row"><text class="rule-label">开始日期</text><text class="rule-val">{{ selectedPlan.startDate }}</text></view>
          <view class="rule-row"><text class="rule-label">循环提醒</text><text class="rule-val">{{ selectedPlan.repeat ? '开启' : '关闭' }}</text></view>
          <view class="rule-row"><text class="rule-label">提醒开关</text><text class="rule-val">{{ selectedPlan.notify ? '开启' : '关闭' }}</text></view>
        </view>

        <button class="primary-btn full" @click="goPlan">下一步：设置服用计划</button>
      </view>

      <view class="safe-area-spacer"></view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import TopSafeArea from '@/components/TopSafeArea.vue';

const query = ref('');
const suggestions = ref([]);
const selected = ref(null);
const previewImg = ref('');
const selectedPlan = ref(null);

const allMeds = [
  { name: '阿莫西林胶囊', spec: '0.5g' },
  { name: '厄贝沙坦片', spec: '150mg' },
  { name: '氨氯地平片', spec: '5mg' },
  { name: '布洛芬缓释胶囊', spec: '0.3g' },
  { name: '维生素C片', spec: '100mg' }
];

const onSearch = () => {
  const q = query.value.trim().toLowerCase();
  if (!q) { suggestions.value = []; return; }
  suggestions.value = allMeds.filter(m => (m.name + ' ' + m.spec).toLowerCase().includes(q)).slice(0, 8);
};

const clear = () => { query.value = ''; suggestions.value = []; };

const selectMed = (m) => {
  selected.value = { ...m };
  previewImg.value = '';
  uni.showToast({ title: '已选择：' + m.name, icon: 'none' });
  loadSelectedPlan();
  if (selectedPlan.value) {
    uni.showModal({
      title: '已存在同名药品',
      content: `已存在药品“${selected.value.name}”的用药计划，为避免重复创建，是否前往编辑？`,
      confirmText: '去编辑',
      cancelText: '更换药品',
      success: (res) => {
        if (res.confirm) {
          const q = encodeURIComponent(JSON.stringify(selectedPlan.value));
          uni.navigateTo({ url: '/pages/meds/plan?plan=' + q });
        }
      }
    });
  }
};

const chooseImage = () => {
  uni.chooseImage({ count: 1, sourceType: ['camera'], success: (res) => {
    previewImg.value = res.tempFilePaths[0];
    // 识别结果占位：模拟提取药品名称
    selected.value = { name: '识别结果 · ' + (query.value || '某药品'), spec: '按说明书' };
    uni.showToast({ title: '已识别示例', icon: 'none' });
  }});
};

const chooseAlbum = () => {
  uni.chooseImage({ count: 1, sourceType: ['album'], success: (res) => {
    previewImg.value = res.tempFilePaths[0];
    selected.value = { name: '识别结果 · ' + (query.value || '某药品'), spec: '按说明书' };
    uni.showToast({ title: '已选择图片', icon: 'none' });
    loadSelectedPlan();
  }});
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

onShow(() => { loadSelectedPlan(); });

const goPlan = () => {
  if (!selected.value) { uni.showToast({ title: '请先选择药品', icon: 'none' }); return; }
  if (selectedPlan.value) {
    const q = encodeURIComponent(JSON.stringify(selectedPlan.value));
    uni.navigateTo({ url: '/pages/meds/plan?plan=' + q });
  } else {
    const name = encodeURIComponent(selected.value.name);
    uni.navigateTo({ url: '/pages/meds/plan?name=' + name });
  }
};
</script>

<style lang="scss">
.container { display: flex; flex-direction: column; height: 100vh; background-color: $bg-body; font-family: -apple-system, BlinkMacSystemFont, "San Francisco", Helvetica, Arial, sans-serif; overflow: hidden; }
.status-bar-placeholder { height: var(--status-bar-height); height: constant(safe-area-inset-top); height: env(safe-area-inset-top); width: 100%; flex-shrink: 0; }
.header { padding: 20rpx 32rpx; background: $bg-body; position: sticky; top: 0; z-index: 10; flex-shrink: 0; display: flex; flex-direction: column; gap: 12rpx; }
.h1 { font-size: 40rpx; font-weight: 700; color: $text-main; }
.steps { display: flex; align-items: center; gap: 16rpx; }
.step { display: flex; align-items: center; gap: 12rpx; color: $text-sub; }
.step.active { color: $text-main; }
.step-index { width: 36rpx; height: 36rpx; border-radius: 50%; background: $primary-light; color: $primary-color; display: flex; align-items: center; justify-content: center; font-size: 24rpx; font-weight: 600; }
.step.active .step-index { background: $primary-color; color: #fff; }
.step-label { font-size: 26rpx; }
.step-line { flex: 1; height: 2rpx; background: #eaeaea; }
.scroll-content { flex: 1; padding: 0 32rpx; box-sizing: border-box; overflow-y: auto; }
.section-card { background: #fff; border-radius: 32rpx; padding: 24rpx; margin-bottom: 24rpx; box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.03); }
.search-row { display: flex; gap: 12rpx; align-items: center; background: #f7f7fa; border-radius: 24rpx; padding: 12rpx 16rpx; }
.search-icon { width: 32rpx; height: 32rpx; background-color: $text-sub; mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiI+PGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iNiIvPjxsaW5lIHgxPSIxNSIgeTE9IjE1IiB4Mj0iMjIiIHkyPSIyMiIvPjwvc3ZnPg=="); -webkit-mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiI+PGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iNiIvPjxsaW5lIHgxPSIxNSIgeTE9IjE1IiB4Mj0iMjIiIHkyPSIyMiIvPjwvc3ZnPg=="); mask-size: contain; -webkit-mask-size: contain; mask-repeat: no-repeat; -webkit-mask-repeat: no-repeat; mask-position: center; -webkit-mask-position: center; }
.search-input { flex: 1; background: transparent; border-radius: 16rpx; padding: 12rpx 8rpx; font-size: 26rpx; border: 2rpx solid transparent; }
.btn { display: inline-flex; align-items: center; justify-content: center; border-radius: 24rpx; padding: 16rpx 28rpx; font-size: 26rpx; transition: transform .08s ease, box-shadow .2s ease, background-color .2s ease, color .2s ease; }
.btn:active { transform: scale(0.98); }
.primary-btn { @extend .btn; background: $primary-color; color: #fff; box-shadow: 0 10rpx 28rpx rgba(0, 122, 255, 0.22); }
.primary-btn:active { box-shadow: 0 4rpx 12rpx rgba(38, 93, 255, 0.22); }
.secondary-btn { @extend .btn; background: #fff; color: $text-main; border: 2rpx solid #e5e7eb; }
.ghost-btn { @extend .btn; background: #fff; color: $primary-color; border: 2rpx solid $primary-color; }
.suggest-list { margin-top: 16rpx; display: flex; flex-direction: column; }
.suggest-item { display: flex; justify-content: space-between; padding: 18rpx 12rpx; border-radius: 16rpx; }
.suggest-item:hover { background: #f7f7fa; }
.suggest-name { font-size: 28rpx; color: $text-main; }
.suggest-spec { font-size: 24rpx; color: $text-sub; }
.ocr-row { display: flex; gap: 16rpx; }
.preview { margin-top: 16rpx; }
.preview-img { width: 100%; height: 320rpx; border-radius: 20rpx; object-fit: cover; }
.selected-card { display: flex; gap: 16rpx; align-items: center; margin-bottom: 16rpx; }
.med-icon-bg.small { width: 56rpx; height: 56rpx; background: linear-gradient(180deg, #f0f6ff 0%, #e5f1ff 100%); border-radius: 20rpx; display: flex; justify-content: center; align-items: center; box-shadow: 0 6rpx 14rpx rgba(0,0,0,0.04); }
.med-icon { width: 36rpx; height: 36rpx; }
.selected-info { display: flex; flex-direction: column; gap: 6rpx; }
.selected-name { font-size: 30rpx; font-weight: 600; color: $text-main; }
.selected-spec { font-size: 24rpx; color: $text-sub; }
.rule-card { margin: 16rpx 0 0; background: #f8f8fb; border-radius: 24rpx; padding: 16rpx; }
.rule-title { font-size: 26rpx; font-weight: 600; color: $text-main; margin-bottom: 12rpx; }
.rule-row { display: flex; justify-content: space-between; align-items: center; padding: 10rpx 0; }
.rule-label { font-size: 24rpx; color: $text-sub; }
.rule-val { font-size: 26rpx; color: $text-main; }
.full { width: 100%; }
.safe-area-spacer { height: 180rpx; padding-bottom: env(safe-area-inset-bottom); }

.icon-bg-pill { background-color: $primary-color; mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiI+PHJlY3QgeD0iMiIgeT0iNiIgd2lkdGg9IjIwIiBoZWlnaHQ9IjEyIiByeD0iNiIvPjxwYXRoIGQ9Ik0xMiA2djEyIi8+PC9zdmc+"); -webkit-mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiI+PHJlY3QgeD0iMiIgeT0iNiIgd2lkdGg9IjIwIiBoZWlnaHQ9IjEyIiByeD0iNiIvPjxwYXRoIGQ9Ik0xMiA2djEyIi8+PC9zdmc+"); mask-size: contain; -webkit-mask-size: contain; mask-repeat: no-repeat; -webkit-mask-repeat: no-repeat; mask-position: center; -webkit-mask-position: center; }
</style>
