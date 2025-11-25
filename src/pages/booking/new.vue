<template>
  <view class="container">
    <TopSafeArea />
    <view class="header">
      <text class="h1">{{ isEdit ? '编辑抢号任务' : '新建抢号任务' }}</text>
    </view>
    <scroll-view scroll-y class="scroll-content">
      <view class="section-card">
        <view class="form-row">
          <text class="label">医院</text>
          <input class="input" v-model="form.hospital" placeholder="如：协和医院" />
        </view>
        <view class="form-row">
          <text class="label">科室</text>
          <input class="input" v-model="form.department" placeholder="如：皮肤科" />
        </view>
        <view class="form-row">
          <text class="label">标签</text>
          <input class="input" v-model="form.tag" placeholder="如：专家号 / 周三上午" />
        </view>
      </view>

      <view class="section-card">
        <view class="form-row">
          <text class="label">开抢日期</text>
          <picker mode="date" :value="dateStr" @change="(e)=>dateStr = e.detail.value">
            <view class="picker"><text>{{ dateStr }}</text></view>
          </picker>
        </view>
        <view class="form-row">
          <text class="label">开抢时间</text>
          <picker mode="time" :value="timeStr" @change="(e)=>timeStr = e.detail.value">
            <view class="picker"><text>{{ timeStr }}</text></view>
          </picker>
        </view>
        <view class="form-row">
          <text class="label">官网链接</text>
          <input class="input" v-model="form.link" placeholder="https://..." />
        </view>
      </view>

      <view class="section-card">
        <view class="row">
          <text class="title">提醒策略</text>
        </view>
        <view class="chips">
          <view class="chip" :class="{ on: form.strategy.preDay }" @click="toggle('preDay')">前1天</view>
          <view class="chip" :class="{ on: form.strategy.pre30 }" @click="toggle('pre30')">前30分钟</view>
          <view class="chip" :class="{ on: form.strategy.pre5 }" @click="toggle('pre5')">前5分钟</view>
        </view>
      </view>

      <view class="section-card">
        <button class="primary-btn full" @click="saveTask">{{ isEdit ? '保存修改' : '创建任务' }}</button>
      </view>

      <view class="safe-area-spacer"></view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import TopSafeArea from '@/components/TopSafeArea.vue'

const STORAGE_KEY = 'booking_tasks'
const isEdit = ref(false)
const editId = ref('')

const form = ref({
  hospital: '',
  department: '',
  tag: '',
  link: '',
  strategy: { preDay: true, pre30: true, pre5: true },
  openTime: Date.now() + 30 * 60 * 1000
})

const toDateStr = (ts)=> new Date(ts).toISOString().slice(0,10)
const toTimeStr = (ts)=>{
  const d = new Date(ts)
  const h = (d.getHours()<10?'0':'') + d.getHours()
  const m = (d.getMinutes()<10?'0':'') + d.getMinutes()
  return `${h}:${m}`
}
let baseDate = new Date(form.value.openTime)
let dateStr = ref(toDateStr(form.value.openTime))
let timeStr = ref(toTimeStr(form.value.openTime))

const rebuildTs = ()=>{
  try {
    const [h,m] = timeStr.value.split(':').map(Number)
    const d = new Date(dateStr.value + 'T00:00:00')
    d.setHours(h); d.setMinutes(m); d.setSeconds(0); d.setMilliseconds(0)
    form.value.openTime = d.getTime()
  } catch (e) {}
}

const toggle = (k)=>{ form.value.strategy[k] = !form.value.strategy[k] }

onLoad((opts)=>{
  if (opts && opts.id) {
    try {
      const id = decodeURIComponent(opts.id)
      const list = uni.getStorageSync(STORAGE_KEY) || []
      const found = list.find(x => x.id === id)
      if (found) {
        isEdit.value = true
        editId.value = id
        form.value = { ...found }
        dateStr.value = toDateStr(form.value.openTime)
        timeStr.value = toTimeStr(form.value.openTime)
      }
    } catch (e) {}
  }
})

const saveTask = () => {
  if (!form.value.hospital || !form.value.department) { uni.showToast({ title: '请完善医院与科室', icon: 'none' }); return }
  rebuildTs()
  let list = []
  try { list = uni.getStorageSync(STORAGE_KEY) || [] } catch (e) {}
  if (isEdit.value) {
    const idx = list.findIndex(x => x.id === editId.value)
    if (idx >= 0) list[idx] = { ...list[idx], ...form.value }
  } else {
    const id = Date.now().toString(36)
    list.push({ ...form.value, id })
  }
  try { uni.setStorageSync(STORAGE_KEY, list) } catch (e) {}
  uni.showToast({ title: isEdit.value ? '已保存' : '已创建', icon: 'success' })
  setTimeout(()=>{ uni.navigateBack() }, 500)
}
</script>

<style lang="scss">
.container { display: flex; flex-direction: column; height: 100vh; background-color: $bg-body; font-family: -apple-system, BlinkMacSystemFont, "San Francisco", Helvetica, Arial, sans-serif; overflow: hidden; }
.header { padding: 20rpx 32rpx; background: $bg-body; position: sticky; top: 0; z-index: 10; flex-shrink: 0; }
.h1 { font-size: 40rpx; font-weight: 700; color: $text-main; }
.scroll-content { flex: 1; padding: 0 32rpx; box-sizing: border-box; overflow-y: auto; }
.section-card { background: #fff; border-radius: 32rpx; padding: 24rpx; margin: 12rpx 0 24rpx; }
.form-row { display: flex; justify-content: space-between; align-items: center; padding: 12rpx 0; }
.label { font-size: 28rpx; color: $text-main; width: 200rpx; }
.input { flex: 1; background: #F2F2F7; border-radius: 16rpx; padding: 16rpx; font-size: 28rpx; }
.picker { flex: 1; background: #F2F2F7; border-radius: 16rpx; padding: 16rpx; font-size: 28rpx; }
.row { display: flex; justify-content: space-between; align-items: center; }
.title { font-size: 32rpx; font-weight: 600; color: $text-main; }
.chips { display: flex; gap: 12rpx; margin-top: 12rpx; flex-wrap: wrap; }
.chip { padding: 8rpx 16rpx; border-radius: 999rpx; background: #F2F2F7; font-size: 24rpx; color: $text-main; }
.chip.on { background: $primary-light; color: $primary-color; }
.primary-btn { background: $primary-color; color: #fff; border: none; border-radius: 24rpx; padding: 16rpx 28rpx; font-size: 26rpx; }
.primary-btn.full { width: 100%; }
.safe-area-spacer { height: 180rpx; padding-bottom: env(safe-area-inset-bottom); }
</style>
