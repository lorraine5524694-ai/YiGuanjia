<template>
  <view class="container">
    <TopSafeArea />
    <view class="header">
      <text class="h1">病历详情</text>
      <view class="action" @click="edit">编辑</view>
    </view>
    <scroll-view scroll-y class="scroll-content">
      <view class="section-card">
        <view class="section-title">
          <text>就诊信息</text>
        </view>
        <view class="info-grid">
          <view class="info-item"><text class="label">日期</text><text class="value">{{ record.day }} {{ record.year }}</text></view>
          <view class="info-item"><text class="label">医院</text><text class="value">{{ record.hospital }}</text></view>
          <view class="info-item"><text class="label">科室</text><text class="value">{{ record.detail?.department || '未填写' }}</text></view>
          <view class="info-item"><text class="label">医生</text><text class="value">{{ record.doctor || '未填写' }}</text></view>
        </view>
      </view>

      <view class="section-card">
        <view class="section-title">
          <text>病历内容</text>
        </view>
        <view class="kv"><text class="label">主诉</text><text class="value">{{ record.detail?.complaint || '未填写' }}</text></view>
        <view class="kv"><text class="label">现病史</text><text class="value">{{ record.detail?.history || '未填写' }}</text></view>
        <view class="kv"><text class="label">诊断</text><text class="value">{{ record.detail?.diagnosis || record.diagnosis }}</text></view>
      </view>

      <view class="section-card" v-if="record.images && record.images.length">
        <view class="section-title">
          <text>病历照片</text>
        </view>
        <view class="upload-grid">
          <view v-for="(img, idx) in record.images" :key="idx" class="thumb" @click="preview(idx)">
            <image :src="img" mode="aspectFill" class="thumb-img"></image>
          </view>
        </view>
      </view>

      <view class="section-card">
        <view class="section-title ai">
          <text>AI 解读</text>
          <view class="ai-badge">AI</view>
        </view>
        <view class="ai-disclaimer">AI 内容仅供参考，请遵循医嘱</view>
        <view class="ai-output">{{ record.aiSummary || '暂无 AI 内容' }}</view>
      </view>

      <view class="safe-area-spacer"></view>
    </scroll-view>

    <view v-if="needAuth && !authed" class="auth-mask">
      <view class="auth-card">
        <text class="auth-title">敏感信息确认</text>
        <text class="auth-desc">为保护隐私，请进行确认后查看病历详情</text>
        <button class="btn-primary" @click="confirmAuth">确认</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import TopSafeArea from '@/components/TopSafeArea.vue'

const record = ref({ day: '', year: '', hospital: '', diagnosis: '', doctor: '', images: [], detail: {} })
const needAuth = ref(true)
const authed = ref(false)

onMounted(() => {
  const list = uni.getStorageSync('filesRecords') || []
  if (list.length) record.value = list[0]
  setTimeout(() => { authed.value = false }, 0)
})

const confirmAuth = () => { authed.value = true }
const edit = () => { uni.navigateTo({ url: '/pages/files/edit?index=0' }) }
const preview = (idx) => { uni.previewImage({ current: record.value.images[idx], urls: record.value.images }) }
</script>

<style lang="scss">
.container { display: flex; flex-direction: column; height: 100vh; background-color: $bg-body; font-family: -apple-system, BlinkMacSystemFont, "San Francisco", Helvetica, Arial, sans-serif; overflow: hidden; }
.status-bar-placeholder { height: var(--status-bar-height); height: constant(safe-area-inset-top); height: env(safe-area-inset-top); width: 100%; flex-shrink: 0; }
.header { padding: 20rpx 32rpx; background: $bg-body; position: sticky; top: 0; z-index: 10; flex-shrink: 0; display: flex; justify-content: space-between; align-items: center; }
.h1 { font-size: 40rpx; font-weight: 700; color: $text-main; }
.action { font-size: 26rpx; color: $primary-color; }
.scroll-content { flex: 1; padding: 0 32rpx; box-sizing: border-box; overflow-y: auto; }
.section-card { background: #fff; border-radius: 32rpx; padding: 32rpx; margin-bottom: 32rpx; }
.section-title { font-size: 30rpx; font-weight: 600; color: $text-main; margin-bottom: 24rpx; display: flex; align-items: center; gap: 16rpx; }
.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16rpx; }
.info-item { background: #F7F7F8; border-radius: 20rpx; padding: 20rpx; display: flex; justify-content: space-between; }
.label { color: $text-sub; font-size: 26rpx; }
.value { color: $text-main; font-size: 28rpx; }
.kv { display: flex; justify-content: space-between; align-items: flex-start; background: #F7F7F8; border-radius: 20rpx; padding: 20rpx; margin-bottom: 12rpx; }
.upload-grid { display: flex; flex-wrap: wrap; gap: 20rpx; }
.thumb { width: 200rpx; height: 200rpx; border-radius: 20rpx; background: #F7F7F8; display: flex; justify-content: center; align-items: center; }
.thumb-img { width: 100%; height: 100%; border-radius: 20rpx; }
.section-title.ai { justify-content: space-between; }
.ai-badge { background: linear-gradient(90deg,#007AFF,#00C6FF); color: #fff; border-radius: 12rpx; padding: 6rpx 12rpx; font-size: 20rpx; }
.ai-disclaimer { background: #F2F2F7; color: $text-sub; font-size: 22rpx; padding: 12rpx 16rpx; border-radius: 12rpx; margin-bottom: 16rpx; }
.ai-output { white-space: pre-wrap; font-size: 28rpx; color: $text-main; line-height: 1.6; }
.safe-area-spacer { height: 180rpx; padding-bottom: env(safe-area-inset-bottom); }
.auth-mask { position: fixed; inset: 0; background: rgba(0,0,0,0.35); display: flex; justify-content: center; align-items: center; z-index: 9999; }
.auth-card { width: 600rpx; background: #fff; border-radius: 24rpx; padding: 32rpx; display: flex; flex-direction: column; gap: 20rpx; align-items: center; }
.auth-title { font-size: 32rpx; color: $text-main; font-weight: 600; }
.auth-desc { font-size: 26rpx; color: $text-sub; }
.btn-primary { background: $primary-color; color: #fff; border-radius: 24rpx; font-size: 28rpx; padding: 16rpx 24rpx; }
</style>
