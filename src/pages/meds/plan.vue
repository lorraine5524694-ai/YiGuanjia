<template>
  <view class="container">
    <TopSafeArea />
    <view class="header">
      <text class="h1">服用计划</text>
      <text class="sub">{{ name || '未选择药品' }}</text>
      <view class="steps">
        <view class="step">
          <text class="step-index">1</text>
          <text class="step-label">添加药品</text>
        </view>
        <view class="step-line"></view>
        <view class="step active">
          <text class="step-index">2</text>
          <text class="step-label">设置用药计划</text>
        </view>
      </view>
    </view>

    <scroll-view scroll-y class="scroll-content">
      <view class="section-card">
        <view class="form-row">
          <text class="label">剂量</text>
          <input class="input" placeholder="例如：0.5g x 2粒" v-model="dose" />
        </view>

        <view class="form-row">
          <text class="label">饭前/饭后</text>
          <picker :range="mealOptions" @change="onMealChange">
            <view class="picker">
              <text>{{ meal }}</text>
            </view>
          </picker>
        </view>

        <view class="form-row">
          <text class="label">每日次数</text>
          <picker :range="freqRange" @change="onFreqChange">
            <view class="picker">
              <text>{{ freqLabel }}</text>
            </view>
          </picker>
        </view>

        <view class="time-list">
          <view v-for="(t, i) in times" :key="i" class="time-row">
            <text class="label">时间 {{ i + 1 }}</text>
            <picker mode="time" :value="t" @change="(e)=>updateTime(i, e.detail.value)">
              <view class="picker">
                <text>{{ t }}</text>
              </view>
            </picker>
          </view>
        </view>
      </view>

      <view class="section-card">
        <view class="form-row">
          <text class="label">开始日期</text>
          <picker mode="date" :value="startDate" @change="(e)=>startDate = e.detail.value">
            <view class="picker"><text>{{ startDate }}</text></view>
          </picker>
        </view>
        <view class="form-row">
          <text class="label">循环提醒</text>
          <switch :checked="repeat" @change="(e)=>repeat = e.detail.value" />
        </view>
        <view class="form-row" v-if="repeat">
          <text class="label">提醒开关</text>
          <switch :checked="notify" @change="(e)=>notify = e.detail.value" />
        </view>
      </view>

      <view class="section-card">
        <button class="primary-btn full" @click="savePlan">保存计划</button>
      </view>

      <view class="safe-area-spacer"></view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import TopSafeArea from '@/components/TopSafeArea.vue';

const name = ref('');
const dose = ref('');
const mealOptions = ['随餐', '饭前', '饭后', '空腹', '晨起', '睡前', '不影响'];
const meal = ref(mealOptions[0]);

const freqRange = Array.from({ length: 10 }, (_, i) => `每日 ${i + 1} 次`);
const freqLabel = ref(freqRange[0]);
const times = ref(['08:00']);

const startDate = ref(new Date().toISOString().slice(0, 10));
const repeat = ref(true);
const notify = ref(true);

const onMealChange = (e) => { meal.value = mealOptions[e.detail.value]; };
const onFreqChange = (e) => {
  const idx = Number(e.detail.value);
  freqLabel.value = freqRange[idx];
  const count = idx + 1;
  const base = ['08:00', '12:30', '20:00'];
  const prev = times.value.slice();
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
    // 如果是编辑模式，根据 name + startDate 简单替换
    const idx = list.findIndex((x) => x.name === plan.name && x.startDate === plan.startDate);
    if (idx >= 0) list[idx] = { ...list[idx], ...plan };
    else list.push(plan);
    uni.setStorageSync('meds_plans', list);
    uni.showToast({ title: '已保存计划', icon: 'success' });
    setTimeout(() => { uni.redirectTo({ url: '/pages/meds/index' }); }, 500);
  } catch (e) {
    uni.showToast({ title: '保存失败', icon: 'none' });
  }
};
</script>

<style lang="scss">
.container { display: flex; flex-direction: column; height: 100vh; background-color: $bg-body; font-family: -apple-system, BlinkMacSystemFont, "San Francisco", Helvetica, Arial, sans-serif; overflow: hidden; }
.status-bar-placeholder { height: var(--status-bar-height); height: constant(safe-area-inset-top); height: env(safe-area-inset-top); width: 100%; flex-shrink: 0; }
.header { padding: 20rpx 32rpx; background: $bg-body; position: sticky; top: 0; z-index: 10; flex-shrink: 0; display: flex; flex-direction: column; gap: 12rpx; }
.h1 { font-size: 40rpx; font-weight: 700; color: $text-main; }
.sub { display: block; margin-top: 8rpx; font-size: 24rpx; color: $text-sub; }
.steps { display: flex; align-items: center; gap: 16rpx; }
.step { display: flex; align-items: center; gap: 12rpx; color: $text-sub; }
.step.active { color: $text-main; }
.step-index { width: 36rpx; height: 36rpx; border-radius: 50%; background: $primary-light; color: $primary-color; display: flex; align-items: center; justify-content: center; font-size: 24rpx; font-weight: 600; }
.step.active .step-index { background: $primary-color; color: #fff; }
.step-label { font-size: 26rpx; }
.step-line { flex: 1; height: 2rpx; background: #eaeaea; }
.scroll-content { flex: 1; padding: 0 32rpx; box-sizing: border-box; overflow-y: auto; }
.section-card { background: #fff; border-radius: 32rpx; padding: 24rpx; margin-bottom: 24rpx; box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.03); }
.form-row { display: flex; justify-content: space-between; align-items: center; padding: 12rpx 0; }
.label { font-size: 28rpx; color: $text-main; }
.btn { display: inline-flex; align-items: center; justify-content: center; border-radius: 24rpx; padding: 16rpx 28rpx; font-size: 26rpx; transition: transform .08s ease, box-shadow .2s ease, background-color .2s ease, color .2s ease; }
.btn:active { transform: scale(0.98); }
.primary-btn { @extend .btn; background: $primary-color; color: #fff; box-shadow: 0 10rpx 28rpx rgba(0, 122, 255, 0.22); }
.primary-btn:active { box-shadow: 0 4rpx 12rpx rgba(38, 93, 255, 0.22); }
.picker { flex: 1; display: flex; align-items: center; justify-content: flex-end; background: #f7f7fa; border-radius: 20rpx; padding: 14rpx 16rpx; }
.input { flex: 1; text-align: right; background: #f7f7fa; border-radius: 20rpx; padding: 14rpx 16rpx; }
.time-list { display: flex; flex-direction: column; gap: 8rpx; }
.time-row { display: flex; align-items: center; gap: 12rpx; }
.primary-btn { background: $primary-color; color: #fff; border: none; border-radius: 24rpx; padding: 16rpx 28rpx; font-size: 26rpx; }
.full { width: 100%; }
.safe-area-spacer { height: 180rpx; padding-bottom: env(safe-area-inset-bottom); }
</style>
