<template>
  <view class="container">
    <TopSafeArea />
  <view class="header">
      <text class="h1">记一笔</text>
    </view>
    <scroll-view scroll-y class="scroll-content">
      <view class="section-card clickable" @click="pickImage">
        <view v-if="imageSrc" class="preview-wrap">
          <image :src="imageSrc" mode="aspectFill" class="preview" />
        </view>
        <view v-else class="placeholder">
          <view class="icon upload"></view>
          <text class="hint">点击上方模块拍照或选图</text>
        </view>
      </view>

      <view class="section-card">
        <view class="row">
          <text class="title">AI 识别</text>
          <view class="chip primary" :class="{ disabled: !imageSrc }" @click="analyze">开始识别</view>
        </view>
        <view class="form">
          <view class="field">
            <text class="label">医院</text>
            <input class="input" v-model="form.hospital" placeholder="如：协和医院" />
          </view>
          <view class="field">
            <text class="label">科室</text>
            <input class="input" v-model="form.department" placeholder="如：皮肤科" />
          </view>
          <view class="field">
            <text class="label">日期</text>
            <input class="input" v-model="form.date" placeholder="YYYY-MM-DD" />
          </view>
          <view class="field">
            <text class="label">类别</text>
            <picker :range="categories" @change="onCategoryChange">
              <view class="picker-value">{{ form.category }}</view>
            </picker>
          </view>
          <view class="field">
            <text class="label">总金额</text>
            <input class="input" type="number" v-model.number="form.amount" placeholder="0.00" />
          </view>
          <view class="field toggle">
            <text class="label">医保报销</text>
            <switch :checked="form.insured" @change="onInsuredToggle" />
          </view>
          <view class="field" v-if="form.insured">
            <text class="label">报销金额</text>
            <input class="input" type="number" v-model.number="form.insuredAmount" placeholder="0.00" />
          </view>
          <view class="field readonly">
            <text class="label">自付金额</text>
            <view class="readonly-val">¥{{ selfAmount.toFixed(2) }}</view>
          </view>
        </view>
      </view>

      <view class="section-card">
        <view class="row">
          <text class="title">明细项目</text>
          <view class="chip" @click="addItem">添加</view>
        </view>
        <view class="items">
          <view v-for="(it,i) in items" :key="i" class="item">
            <input class="input name" v-model="it.name" placeholder="项目名" />
            <input class="input amt" type="number" v-model.number="it.amount" placeholder="0.00" />
            <view class="del" @click="removeItem(i)">×</view>
          </view>
        </view>
      </view>

      <view class="section-card">
        <view class="row">
          <text class="title">保存</text>
          <view class="chip primary" @click="saveAndOpen">保存并查看详情</view>
        </view>
      </view>

      <view class="safe-area-spacer"></view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue';
import TopSafeArea from '@/components/TopSafeArea.vue';

const imageSrc = ref('');
const form = ref({ hospital: '', department: '', date: '', category: '门诊', amount: 0, insured: true, insuredAmount: 0 });
const categories = ['药品','门诊','检查','住院','交通'];
const items = ref([]);

const pickImage = () => {
  uni.chooseImage({ count: 1, sourceType: ['camera','album'], success: (res) => { imageSrc.value = res.tempFilePaths?.[0] || res.tempFiles?.[0]?.path || ''; } });
};
const analyze = () => {
  if (!imageSrc.value) return;
  const today = new Date().toISOString().slice(0,10);
  form.value.hospital = '协和医院';
  form.value.department = '皮肤科';
  form.value.date = today;
  form.value.category = '门诊';
  form.value.amount = 128;
  form.value.insured = true;
  form.value.insuredAmount = 80;
  items.value = [
    { name: '挂号费', amount: 20 },
    { name: '诊疗费', amount: 80 },
    { name: '材料费', amount: 28 }
  ];
  uni.showToast({ title: '识别完成', icon: 'success' });
};
const onCategoryChange = (e) => { form.value.category = categories[e.detail.value]; };
const onInsuredToggle = (e) => { form.value.insured = e.detail.value; };
const selfAmount = computed(() => Math.max(0, (form.value.amount||0) - (form.value.insuredAmount||0)));
const addItem = () => { items.value.push({ name: '', amount: 0 }); };
const removeItem = (i) => { items.value.splice(i, 1); };
const saveAndOpen = () => {
  const bill = { id: 'b'+Date.now(), ...form.value };
  uni.setStorageSync('currentBill', bill);
  uni.setStorageSync('currentBillItems', items.value);
  uni.navigateTo({ url: '/pages/billing/detail' });
};
</script>

<style lang="scss">
.container { display: flex; flex-direction: column; height: 100vh; background-color: $bg-body; font-family: -apple-system, BlinkMacSystemFont, "San Francisco", Helvetica, Arial, sans-serif; overflow: hidden; }
.header { padding: 20rpx 32rpx; background: $bg-body; position: sticky; top: 0; z-index: 10; display: flex; justify-content: space-between; align-items: center; }
.h1 { font-size: 40rpx; font-weight: 700; color: $text-main; }
.actions { display: flex; gap: 12rpx; }
.chip { padding: 8rpx 16rpx; border-radius: 999rpx; background: #fff; font-size: 24rpx; color: $text-main; }
.chip.primary { background: $primary-color; color: #fff; }
.chip.disabled { opacity: 0.5; }
.scroll-content { flex: 1; padding: 0 32rpx; box-sizing: border-box; overflow-y: auto; }
.section-card { background: #fff; border-radius: 32rpx; padding: 32rpx; margin-bottom: 24rpx; }
.section-card.clickable { cursor: pointer; }
.preview-wrap { display: flex; }
.preview { width: 100%; height: 300rpx; border-radius: 24rpx; object-fit: cover; }
.placeholder { display: flex; flex-direction: column; align-items: center; gap: 12rpx; color: $text-sub; }
.icon { width: 80rpx; height: 80rpx; }
.upload { background-color: $primary-color; mask: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="white" fill="none" stroke-width="2"><path d="M12 16V4"/><path d="M6 10l6-6 6 6"/><path d="M4 20h16"/></svg>') no-repeat center / contain; }
.row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16rpx; }
.title { font-size: 32rpx; font-weight: 600; color: $text-main; }
.form { display: grid; grid-template-columns: 1fr; gap: 16rpx; }
.field { display: flex; flex-direction: column; gap: 8rpx; }
.field.toggle { flex-direction: row; justify-content: space-between; align-items: center; }
.label { font-size: 26rpx; color: $text-sub; }
.input { background: #f8f9fb; border-radius: 16rpx; padding: 20rpx; font-size: 28rpx; color: $text-main; }
.picker-value { background: #f8f9fb; border-radius: 16rpx; padding: 20rpx; font-size: 28rpx; color: $text-main; }
.readonly { flex-direction: row; justify-content: space-between; align-items: center; }
.readonly-val { font-size: 32rpx; font-weight: 700; color: $text-main; }
.items { display: flex; flex-direction: column; gap: 12rpx; }
.item { display: grid; grid-template-columns: 2fr 1fr auto; gap: 12rpx; align-items: center; }
.name { }
.amt { }
.del { width: 48rpx; height: 48rpx; border-radius: 12rpx; background: #FFE8E6; color: $alert-color; display: flex; align-items: center; justify-content: center; font-size: 32rpx; }
.safe-area-spacer { height: 180rpx; padding-bottom: env(safe-area-inset-bottom); }
</style>
