<template>
  <view class="container">
    <TopSafeArea />
    <view class="header">
      <text class="h1">新建病历</text>
    </view>
    <scroll-view scroll-y class="scroll-content">
      <view class="section-card">
        <view class="section-title">
          <text>基础信息</text>
        </view>
        <view class="form-row">
          <text class="label">就诊日期</text>
          <picker mode="date" :value="form.date" @change="onDateChange">
            <view class="picker-value">{{ form.date || '请选择' }}</view>
          </picker>
        </view>
        <view class="form-row">
          <text class="label">医院</text>
          <input class="input" v-model="form.hospital" placeholder="如：北京协和医院" />
        </view>
        <view class="form-row">
          <text class="label">科室</text>
          <input class="input" v-model="form.department" placeholder="如：呼吸内科" />
        </view>
        <view class="form-row">
          <text class="label">医生</text>
          <input class="input" v-model="form.doctor" placeholder="选填" />
        </view>
      </view>

      <view class="section-card">
        <view class="section-title">
          <text>病历照片</text>
        </view>
        <view class="upload-grid">
          <view v-for="(img, idx) in images" :key="idx" class="thumb" @click="preview(idx)">
            <image :src="img" mode="aspectFill" class="thumb-img"></image>
          </view>
          <view class="thumb add" @click="chooseImages">
            <view class="add-icon"></view>
          </view>
        </view>
        <view class="btn-row">
          <button class="btn-primary" :disabled="images.length===0||ocrLoading" @click="runOCR">{{ ocrLoading ? '提取中...' : 'OCR 提取' }}</button>
        </view>
      </view>

      <view class="section-card">
        <view class="section-title">
          <text>结构化内容</text>
        </view>
        <view class="form-text">
          <text class="label">主诉</text>
          <textarea class="textarea" v-model="form.complaint" auto-height placeholder="如：咳嗽 3 天" />
        </view>
        <view class="form-text">
          <text class="label">现病史</text>
          <textarea class="textarea" v-model="form.history" auto-height placeholder="症状、用药、检查" />
        </view>
        <view class="form-text">
          <text class="label">诊断结果</text>
          <textarea class="textarea" v-model="form.diagnosis" auto-height placeholder="如：急性上呼吸道感染" />
        </view>
      </view>

      <view class="section-card">
        <view class="section-title ai">
          <text>AI 病历解读</text>
          <view class="ai-badge">AI</view>
        </view>
        <view class="ai-disclaimer">AI 内容仅供参考，请遵循医嘱</view>
        <view class="ai-output" v-if="aiOutput">{{ aiOutput }}</view>
        <view class="btn-row">
          <button class="btn-primary" :disabled="aiLoading" @click="generateAI">{{ aiLoading ? '生成中...' : '生成 AI 解读' }}</button>
        </view>
      </view>

      <view class="btn-fixed">
        <button class="btn-primary big" :disabled="saving" @click="saveRecord">{{ saving ? '保存中...' : '保存病历' }}</button>
      </view>
      <view class="safe-area-spacer"></view>
    </scroll-view>
  </view>
  
</template>

<script setup>
import { ref } from 'vue'
import TopSafeArea from '@/components/TopSafeArea.vue'

const form = ref({ date: '', hospital: '', department: '', doctor: '', complaint: '', history: '', diagnosis: '' })
const images = ref([])
const ocrLoading = ref(false)
const aiLoading = ref(false)
const aiOutput = ref('')
const saving = ref(false)

const onDateChange = (e) => { form.value.date = e.detail.value }

const chooseImages = () => {
  uni.chooseImage({ count: 9, sizeType: ['compressed'], sourceType: ['camera','album'], success: (res) => { images.value = images.value.concat(res.tempFilePaths) } })
}

const preview = (idx) => { uni.previewImage({ current: images.value[idx], urls: images.value }) }

const runOCR = () => {
  if (images.value.length === 0) return
  ocrLoading.value = true
  setTimeout(() => {
    form.value.complaint = form.value.complaint || '咳嗽伴咽痛 3 天'
    form.value.history = form.value.history || '发热 38.3℃，自行口服对乙酰氨基酚'
    form.value.diagnosis = form.value.diagnosis || '急性上呼吸道感染'
    ocrLoading.value = false
    uni.showToast({ title: '已提取', icon: 'none' })
  }, 1200)
}

const generateAI = () => {
  aiLoading.value = true
  aiOutput.value = ''
  const segments = ['症状与体征提示为上呼吸道炎症。', '建议充足休息与补水，避免刺激性食物。', '若持续高热或呼吸困难，应及时就医复查。']
  let i = 0
  const timer = setInterval(() => {
    aiOutput.value += (i>0 ? '\n' : '') + segments[i]
    i++
    if (i >= segments.length) { clearInterval(timer); aiLoading.value = false }
  }, 600)
}

const saveRecord = () => {
  if (!form.value.date || !form.value.hospital) { uni.showToast({ title: '请完善日期与医院', icon: 'none' }); return }
  saving.value = true
  const record = { 
    day: formatDay(form.value.date), 
    year: form.value.date.split('-')[0], 
    hospital: form.value.hospital || '未填写医院', 
    type: '门诊', 
    typeClass: 'tag-blue', 
    diagnosis: form.value.diagnosis || '未填写诊断', 
    doctor: form.value.doctor || '', 
    hasAI: !!aiOutput.value, 
    aiSummary: aiOutput.value ? aiOutput.value.split('\n')[0] : '' ,
    images: images.value,
    detail: { complaint: form.value.complaint, history: form.value.history, diagnosis: form.value.diagnosis, department: form.value.department }
  }
  const key = 'filesRecords'
  const list = uni.getStorageSync(key) || []
  list.unshift(record)
  uni.setStorageSync(key, list)
  setTimeout(() => {
    saving.value = false
    uni.showToast({ title: '已保存', icon: 'success' })
    uni.navigateTo({ url: '/pages/files/detail' })
  }, 500)
}

const formatDay = (dateStr) => {
  const [y,m,d] = dateStr.split('-')
  return Number(m) + '月' + Number(d) + '日'
}
</script>

<style lang="scss">
.container { display: flex; flex-direction: column; height: 100vh; background-color: $bg-body; font-family: -apple-system, BlinkMacSystemFont, "San Francisco", Helvetica, Arial, sans-serif; overflow: hidden; }
.status-bar-placeholder { height: var(--status-bar-height); height: constant(safe-area-inset-top); height: env(safe-area-inset-top); width: 100%; flex-shrink: 0; }
.header { padding: 20rpx 32rpx; background: $bg-body; position: sticky; top: 0; z-index: 10; flex-shrink: 0; }
.h1 { font-size: 40rpx; font-weight: 700; color: $text-main; }
.scroll-content { flex: 1; padding: 0 32rpx; box-sizing: border-box; overflow-y: auto; }
.section-card { background: #fff; border-radius: 32rpx; padding: 32rpx; margin-bottom: 32rpx; }
.section-title { font-size: 30rpx; font-weight: 600; color: $text-main; margin-bottom: 24rpx; display: flex; align-items: center; gap: 16rpx; }
.form-row { display: flex; align-items: center; justify-content: space-between; background: #F7F7F8; border-radius: 20rpx; padding: 20rpx 24rpx; margin-bottom: 16rpx; }
.label { color: $text-sub; font-size: 26rpx; }
.picker-value { font-size: 28rpx; color: $text-main; }
.input { flex: 1; text-align: right; font-size: 28rpx; color: $text-main; }
.upload-grid { display: flex; flex-wrap: wrap; gap: 20rpx; }
.thumb { width: 200rpx; height: 200rpx; border-radius: 20rpx; background: #F7F7F8; display: flex; justify-content: center; align-items: center; }
.thumb-img { width: 100%; height: 100%; border-radius: 20rpx; }
.thumb.add { background: $primary-light; }
.add-icon { width: 60rpx; height: 60rpx; background-color: $primary-color; mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDA3QUZGIiBzdHJva2Utd2lkdGg9IjIiPjxsaW5lIHgxPSIxMiIgeTE9IjUiIHgyPSIxMiIgeTI9IjE5Ii8+PGxpbmUgeDE9IjUiIHkxPSIxMiIgeDI9IjE5IiB5Mj0iMTIiLz48L3N2Zz4="); mask-size: contain; -webkit-mask-size: contain; mask-repeat: no-repeat; -webkit-mask-repeat: no-repeat; mask-position: center; -webkit-mask-position: center; }
.btn-row { display: flex; justify-content: flex-end; gap: 16rpx; margin-top: 20rpx; }
.btn-primary { background: $primary-color; color: #fff; border-radius: 24rpx; font-size: 28rpx; padding: 16rpx 24rpx; }
.form-text { margin-bottom: 16rpx; }
.textarea { width: 100%; min-height: 120rpx; background: #F7F7F8; border-radius: 20rpx; padding: 20rpx; font-size: 28rpx; color: $text-main; }
.section-title.ai { justify-content: space-between; }
.ai-badge { background: linear-gradient(90deg,#007AFF,#00C6FF); color: #fff; border-radius: 12rpx; padding: 6rpx 12rpx; font-size: 20rpx; }
.ai-disclaimer { background: #F2F2F7; color: $text-sub; font-size: 22rpx; padding: 12rpx 16rpx; border-radius: 12rpx; margin-bottom: 16rpx; }
.ai-output { white-space: pre-wrap; font-size: 28rpx; color: $text-main; line-height: 1.6; }
.btn-fixed { position: fixed; bottom: calc(env(safe-area-inset-bottom) + 24rpx); left: 0; width: 100%; padding: 0 32rpx; box-sizing: border-box; }
.btn-primary.big { width: 100%; padding: 24rpx 0; font-size: 32rpx; border-radius: 32rpx; }
.safe-area-spacer { height: 180rpx; padding-bottom: env(safe-area-inset-bottom); }
</style>
