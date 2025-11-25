<template>
  <view class="container">
    <TopSafeArea />
    <view class="header">
      <text class="h1">编辑病历</text>
    </view>
    <scroll-view scroll-y class="scroll-content">
      <view class="section-card">
        <view class="section-title">
          <text>病历内容</text>
        </view>
        <view class="form-text">
          <text class="label">主诉</text>
          <textarea class="textarea" v-model="form.complaint" auto-height placeholder="请输入主诉" />
        </view>
        <view class="form-text">
          <text class="label">现病史</text>
          <textarea class="textarea" v-model="form.history" auto-height placeholder="请输入现病史" />
        </view>
        <view class="form-text">
          <text class="label">诊断</text>
          <textarea class="textarea" v-model="form.diagnosis" auto-height placeholder="请输入诊断" />
        </view>
      </view>

      <view class="btn-fixed">
        <button class="btn-primary big" :disabled="saving" @click="save">{{ saving ? '保存中...' : '保存修改' }}</button>
      </view>
      <view class="safe-area-spacer"></view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import TopSafeArea from '@/components/TopSafeArea.vue'

const form = ref({ complaint: '', history: '', diagnosis: '' })
const saving = ref(false)
const indexRef = ref(0)

onLoad((opts) => {
  const idx = Number(opts?.index ?? 0)
  indexRef.value = Number.isFinite(idx) ? idx : 0
  const list = uni.getStorageSync('filesRecords') || []
  const record = list[indexRef.value] || {}
  const d = record.detail || {}
  form.value.complaint = d.complaint || ''
  form.value.history = d.history || ''
  form.value.diagnosis = d.diagnosis || record.diagnosis || ''
})

const save = () => {
  saving.value = true
  const key = 'filesRecords'
  const list = uni.getStorageSync(key) || []
  if (!list[indexRef.value]) { saving.value = false; uni.showToast({ title: '记录不存在', icon: 'none' }); return }
  const record = list[indexRef.value]
  record.detail = record.detail || {}
  record.detail.complaint = form.value.complaint
  record.detail.history = form.value.history
  record.detail.diagnosis = form.value.diagnosis
  record.diagnosis = form.value.diagnosis || record.diagnosis
  uni.setStorageSync(key, list)
  setTimeout(() => {
    saving.value = false
    uni.showToast({ title: '已保存', icon: 'success' })
    uni.navigateTo({ url: '/pages/files/detail' })
  }, 300)
}
</script>

<style lang="scss">
.container { display: flex; flex-direction: column; height: 100vh; background-color: $bg-body; font-family: -apple-system, BlinkMacSystemFont, "San Francisco", Helvetica, Arial, sans-serif; overflow: hidden; }
.header { padding: 20rpx 32rpx; background: $bg-body; position: sticky; top: 0; z-index: 10; flex-shrink: 0; }
.h1 { font-size: 40rpx; font-weight: 700; color: $text-main; }
.scroll-content { flex: 1; padding: 0 32rpx; box-sizing: border-box; overflow-y: auto; }
.section-card { background: #fff; border-radius: 32rpx; padding: 32rpx; margin-bottom: 32rpx; }
.section-title { font-size: 30rpx; font-weight: 600; color: $text-main; margin-bottom: 24rpx; display: flex; align-items: center; gap: 16rpx; }
.form-text { margin-bottom: 16rpx; }
.label { color: $text-sub; font-size: 26rpx; }
.textarea { width: 100%; min-height: 120rpx; background: #F7F7F8; border-radius: 20rpx; padding: 20rpx; font-size: 28rpx; color: $text-main; }
.btn-fixed { position: fixed; bottom: calc(env(safe-area-inset-bottom) + 24rpx); left: 0; width: 100%; padding: 0 32rpx; box-sizing: border-box; }
.btn-primary { background: $primary-color; color: #fff; border-radius: 24rpx; font-size: 28rpx; padding: 16rpx 24rpx; }
.btn-primary.big { width: 100%; padding: 24rpx 0; font-size: 32rpx; border-radius: 32rpx; }
.safe-area-spacer { height: 180rpx; padding-bottom: env(safe-area-inset-bottom); }
</style>

