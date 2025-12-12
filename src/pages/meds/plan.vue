<template>
  <view class="container">
    <TopSafeArea />
    
    <view class="header">
      <view class="nav-back" @click="goBack">
        <text class="back-icon">←</text>
      </view>
      <text class="h1">设置计划</text>
      <view class="step-indicator">
        <text class="step-text">2/2</text>
      </view>
    </view>

    <scroll-view scroll-y class="scroll-content">
      <!-- 药品信息卡片 -->
      <view class="med-summary-card">
        <view class="med-icon-box">
          <view class="med-icon icon-pill"></view>
        </view>
        <view class="med-info">
          <text class="med-name">{{ name || '未命名药品' }}</text>
          <text class="med-desc">请完善以下用药细节</text>
        </view>
      </view>

      <view class="form-group-title">基础设置</view>
      <view class="form-group">
        <view class="form-item">
          <text class="label">单次剂量</text>
          <input class="input" placeholder="如：1粒" placeholder-class="placeholder" v-model="dose" />
        </view>
        <view class="divider"></view>
        
        <picker :range="mealOptions" @change="onMealChange">
          <view class="form-item clickable">
            <text class="label">服用时机</text>
            <view class="value-box">
              <text class="value">{{ meal }}</text>
              <text class="chevron">></text>
            </view>
          </view>
        </picker>
        <view class="divider"></view>

        <picker :range="freqRange" @change="onFreqChange">
          <view class="form-item clickable">
            <text class="label">每日频率</text>
            <view class="value-box">
              <text class="value">{{ freqLabel }}</text>
              <text class="chevron">></text>
            </view>
          </view>
        </picker>
      </view>

      <view class="form-group-title">提醒时间</view>
      <view class="form-group">
        <view v-for="(t, i) in times" :key="i">
          <picker mode="time" :value="t" @change="(e)=>updateTime(i, e.detail.value)">
            <view class="form-item clickable">
              <text class="label">第 {{ i + 1 }} 次</text>
              <view class="value-box">
                <text class="value highlight">{{ t }}</text>
                <text class="chevron">></text>
              </view>
            </view>
          </picker>
          <view class="divider" v-if="i < times.length - 1"></view>
        </view>
      </view>

      <view class="form-group-title">更多选项</view>
      <view class="form-group">
        <picker mode="date" :value="startDate" @change="(e)=>startDate = e.detail.value">
          <view class="form-item clickable">
            <text class="label">开始日期</text>
            <view class="value-box">
              <text class="value">{{ startDate }}</text>
              <text class="chevron">></text>
            </view>
          </view>
        </picker>
        <view class="divider"></view>
        
        <view class="form-item">
          <text class="label">每日循环</text>
          <switch :checked="repeat" color="#007AFF" @change="(e)=>repeat = e.detail.value" />
        </view>
        <view class="divider" v-if="repeat"></view>
        
        <view class="form-item" v-if="repeat">
          <text class="label">开启提醒</text>
          <switch :checked="notify" color="#007AFF" @change="(e)=>notify = e.detail.value" />
        </view>
      </view>

      <view class="safe-area-spacer"></view>
    </scroll-view>

    <view class="bottom-action">
      <button class="save-btn" @click="savePlan">完成设置</button>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import TopSafeArea from '@/components/TopSafeArea.vue';

const name = ref('');
const dose = ref('');
const mealOptions = ['随餐服用', '饭前服用', '饭后服用', '空腹服用', '晨起服用', '睡前服用', '不影响'];
const meal = ref(mealOptions[0]);

const freqRange = Array.from({ length: 6 }, (_, i) => `每日 ${i + 1} 次`);
const freqLabel = ref(freqRange[0]);
const times = ref(['08:00']);

const startDate = ref(new Date().toISOString().slice(0, 10));
const repeat = ref(true);
const notify = ref(true);

const goBack = () => {
  uni.navigateBack();
};

const onMealChange = (e) => { meal.value = mealOptions[e.detail.value]; };
const onFreqChange = (e) => {
  const idx = Number(e.detail.value);
  freqLabel.value = freqRange[idx];
  const count = idx + 1;
  const base = ['08:00', '12:00', '18:00', '22:00', '10:00', '16:00'];
  const prev = times.value.slice();
  // Keep previous times if possible, else use defaults
  times.value = Array.from({ length: count }, (_, i) => prev[i] ?? base[i] ?? '08:00');
};
const updateTime = (i, v) => { times.value[i] = v; };

onLoad((opts) => {
  if (opts && opts.name) { name.value = decodeURIComponent(opts.name); }
  if (opts && opts.plan) {
    try {
      const p = JSON.parse(decodeURIComponent(opts.plan));
      name.value = p.name || name.value;
      dose.value = p.dose || '';
      meal.value = p.meal || meal.value;
      freqLabel.value = p.freqLabel || freqLabel.value;
      times.value = p.times && p.times.length ? p.times : times.value;
      startDate.value = p.startDate || startDate.value;
      repeat.value = typeof p.repeat === 'boolean' ? p.repeat : repeat.value;
      notify.value = typeof p.notify === 'boolean' ? p.notify : notify.value;
    } catch (err) {}
  }
});

const savePlan = () => {
  if (!name.value) { uni.showToast({ title: '请先选择药品', icon: 'none' }); return; }
  
  const plan = {
    id: Date.now().toString(36),
    name: name.value,
    dose: dose.value,
    meal: meal.value,
    freqLabel: freqLabel.value,
    times: times.value,
    startDate: startDate.value,
    repeat: repeat.value,
    notify: notify.value
  };
  
  try {
    const list = uni.getStorageSync('meds_plans') || [];
    // Simple update logic: if same name exists, update it, else add new
    // In a real app, we might want to allow multiple plans for same drug or use a unique ID passed from prev page
    const idx = list.findIndex((x) => x.name === plan.name);
    
    if (idx >= 0) {
      // Merge to keep original ID if possible, though we generated a new one above
      // actually let's just overwrite for simplicity but keep ID if we had one in editing
      // Ideally we should have passed ID in query params if editing
      list[idx] = { ...plan, id: list[idx].id }; 
    } else {
      list.push(plan);
    }
    
    uni.setStorageSync('meds_plans', list);
    uni.showToast({ title: '已保存', icon: 'success' });
    setTimeout(() => { 
      // Go back to index, relaunch to ensure state refresh
      uni.reLaunch({ url: '/pages/meds/index' }); 
    }, 500);
  } catch (e) {
    uni.showToast({ title: '保存失败', icon: 'none' });
  }
};
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

.back-icon { font-size: 36rpx; color: $text-main; font-weight: bold; }

.h1 { font-size: 36rpx; font-weight: 700; color: $text-main; }

.step-indicator {
  padding: 8rpx 16rpx;
  background: $primary-light;
  border-radius: 24rpx;
}

.step-text { font-size: 24rpx; font-weight: 600; color: $primary-color; }

.scroll-content {
  flex: 1;
  padding: 32rpx;
}

/* Med Summary */
.med-summary-card {
  background: #fff;
  border-radius: 32rpx;
  padding: 32rpx;
  display: flex;
  align-items: center;
  gap: 24rpx;
  margin-bottom: 40rpx;
  box-shadow: $shadow-sm;
}

.med-icon-box {
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

.med-info {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.med-name { font-size: 36rpx; font-weight: 700; color: $text-main; }
.med-desc { font-size: 26rpx; color: $text-sub; }

/* Form Groups */
.form-group-title {
  font-size: 28rpx;
  color: $text-sub;
  margin-bottom: 16rpx;
  margin-left: 16rpx;
  font-weight: 500;
}

.form-group {
  background: #fff;
  border-radius: 32rpx;
  /* Removed padding from container to allow dividers to reach edges if needed, 
     but mainly to ensure standard list styling */
  padding: 0; 
  margin-bottom: 40rpx;
  box-shadow: $shadow-sm;
  overflow: hidden; /* Ensure border-radius clips children */
}

/* Ensure picker components take full width so proper layout is maintained */
picker {
  width: 100%;
  display: block;
}

.form-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100rpx;
  /* Apply padding directly to items */
  padding: 0 32rpx;
  box-sizing: border-box;
}

.form-item.clickable:active {
  opacity: 0.6;
  background-color: #f9f9f9; /* Add check feedback color */
}

.label { font-size: 30rpx; color: $text-main; }

.input {
  flex: 1;
  text-align: right;
  font-size: 30rpx;
  color: $text-main;
  height: 100%;
}

.placeholder { color: #C0C4CC; }

.value-box {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.value { font-size: 30rpx; color: $text-sub; }
.value.highlight { color: $primary-color; font-weight: 600; }

.chevron { font-family: monospace; color: #DCDFE6; font-size: 32rpx; }

.divider {
  height: 2rpx;
  background: #F5F7FA;
  /* Indented divider style (iOS standard) */
  margin-left: 32rpx;
  width: calc(100% - 32rpx);
}

/* Bottom Action */
.bottom-action {
  padding: 24rpx 40rpx;
  background: #fff;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  box-shadow: 0 -4rpx 20rpx rgba(0,0,0,0.05);
}

.save-btn {
  background: $primary-color;
  color: #fff;
  border-radius: 28rpx;
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  font-weight: 600;
  box-shadow: 0 12rpx 32rpx rgba(0, 122, 255, 0.3);
}

.save-btn:active {
  transform: scale(0.98);
}

.safe-area-spacer { height: 100rpx; }
</style>
