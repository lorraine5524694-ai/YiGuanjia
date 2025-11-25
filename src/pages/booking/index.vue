<template>
  <view class="container">
    <TopSafeArea />

    <view class="header">
      <text class="h1">抢号任务清单</text>
      <view class="actions">
        <button class="primary-btn" @click="goNew">新建任务</button>
      </view>
    </view>

    <scroll-view scroll-y class="scroll-content">

      <view class="section-card">
        <view class="search-row">
          <input class="search-input" placeholder="搜索医院 / 科室 / 标签" v-model="keyword" @input="filter" />
          <button class="secondary-btn" v-if="keyword" @click="clearKeyword">清除</button>
        </view>
      </view>

      <view v-if="filtered.length" class="task-list">
        <view v-for="t in filtered" :key="t.id" class="task-card" :class="statusClass(t)">
          <view class="card-bg-decoration"></view>
          <view class="task-header">
            <view class="left">
              <view class="icon-small"></view>
              <text class="label">抢号任务</text>
            </view>
            <text class="status-text">{{ statusText(t) }}</text>
          </view>

          <view class="task-content">
            <view class="info">
              <text class="h2">{{ t.hospital }} - {{ t.department }}</text>
              <text class="p-white">{{ t.tag }}</text>
            </view>
            <view class="countdown">
              <text class="timer">{{ countdownText(t) }}</text>
              <text class="timer-label">{{ countdownLabel(t) }}</text>
            </view>
          </view>

          <view class="task-actions">
            <view class="chip" :class="{ on: t.strategy.preDay }" @click="toggleStrategy(t, 'preDay')">前1天</view>
            <view class="chip" :class="{ on: t.strategy.pre30 }" @click="toggleStrategy(t, 'pre30')">前30分钟</view>
            <view class="chip" :class="{ on: t.strategy.pre5 }" @click="toggleStrategy(t, 'pre5')">前5分钟</view>
            <view v-if="t.link" class="chip link" @click="copyLink(t)">复制链接</view>
            <view v-if="isRunning(t) && t.link" class="chip cta" @click="goToLink(t)">去抢号</view>
          </view>

          <view class="op-row">
            <button class="ghost-btn" @click="editTask(t)">编辑</button>
            <button class="secondary-btn" @click="confirmDelete(t)">删除</button>
          </view>
        </view>
      </view>

      <view v-else class="empty">
        <text class="empty-text">暂无抢号任务</text>
        <button class="primary-btn" @click="goNew">去新建</button>
      </view>

      <view class="safe-area-spacer"></view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import TopSafeArea from '@/components/TopSafeArea.vue'

const STORAGE_KEY = 'booking_tasks'
const keyword = ref('')
const now = ref(Date.now())
let timer

const tasks = ref([])

const load = () => {
  try {
    const list = uni.getStorageSync(STORAGE_KEY) || []
    tasks.value = Array.isArray(list) ? list.sort((a,b)=>a.openTime-b.openTime) : []
  } catch (e) { tasks.value = [] }
}
const save = () => { try { uni.setStorageSync(STORAGE_KEY, tasks.value) } catch (e) {} }

const filter = () => {}
const clearKeyword = () => { keyword.value = '' }

const filtered = computed(() => {
  const k = (keyword.value || '').trim().toLowerCase()
  if (!k) return tasks.value
  return tasks.value.filter(t =>
    (t.hospital||'').toLowerCase().includes(k) ||
    (t.department||'').toLowerCase().includes(k) ||
    (t.tag||'').toLowerCase().includes(k)
  )
})

const goNew = () => { uni.navigateTo({ url: '/pages/booking/new' }) }
const editTask = (t) => {
  const q = encodeURIComponent(t.id)
  uni.navigateTo({ url: '/pages/booking/new?id=' + q })
}
const confirmDelete = (t) => {
  uni.showModal({ title: '删除确认', content: '确定删除该任务吗？', success: (res) => {
    if (res.confirm) { delTask(t.id) }
  } })
}
const delTask = (id) => {
  tasks.value = tasks.value.filter(x => x.id !== id)
  save()
  uni.showToast({ title: '已删除', icon: 'none' })
}

const isRunning = (t) => now.value >= t.openTime
const statusText = (t) => isRunning(t) ? '开抢中' : isToday(t.openTime) ? '今天' : nextDayLabel(t.openTime)
const statusClass = (t) => ({ active: !isRunning(t), running: isRunning(t) })

const countdownText = (t) => {
  const diff = t.openTime - now.value
  if (diff <= 0) return '00:00:00'
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  const s = Math.floor((diff % 60000) / 1000)
  const pad = (n)=> (n<10?'0':'') + n
  return `${pad(h)}:${pad(m)}:${pad(s)}`
}
const countdownLabel = (t) => (isRunning(t) ? '开抢中' : '后开始抢号')

const copyLink = (t) => { if (t.link) uni.setClipboardData({ data: t.link, success: ()=> uni.showToast({ title: '链接已复制', icon: 'success' }) }) }
const goToLink = (t) => { if (t.link && typeof window !== 'undefined') window.open(t.link, '_blank') }

const toggleStrategy = (t, k) => { t.strategy[k] = !t.strategy[k]; save(); uni.showToast({ title: `${t.strategy[k] ? '已开启' : '已关闭'}提醒`, icon: 'none' }) }

const isToday = (ts) => {
  const t = new Date(ts); const n = new Date(now.value)
  return t.getFullYear()===n.getFullYear() && t.getMonth()===n.getMonth() && t.getDate()===n.getDate()
}
const nextDayLabel = (ts) => {
  const t = new Date(ts); const w = ['周日','周一','周二','周三','周四','周五','周六']
  return `${t.getMonth()+1}月${t.getDate()}日 · ${w[t.getDay()]}`
}

onMounted(() => {
  load()
  timer = setInterval(() => { now.value = Date.now() }, 1000)
})
onShow(() => { load() })
onUnmounted(() => { if (timer) clearInterval(timer) })
</script>

<style lang="scss">
@import "@/styles/theme.scss";
.container { display: flex; flex-direction: column; height: 100vh; background-color: $bg-body; font-family: -apple-system, BlinkMacSystemFont, "San Francisco", Helvetica, Arial, sans-serif; overflow: hidden; }
.header { padding: 20rpx 32rpx; background: $bg-body; position: sticky; top: 0; z-index: 10; flex-shrink: 0; display: flex; justify-content: space-between; align-items: center; }
.h1 { font-size: 40rpx; font-weight: 700; color: $text-main; }
.actions { display: flex; gap: 12rpx; }
.primary-btn { background: linear-gradient(135deg, #0A84FF 0%, #00C6FF 100%); color: #fff; border: none; border-radius: 999rpx; padding: 18rpx 32rpx; font-size: 26rpx; box-shadow: 0 8rpx 16rpx rgba(10,132,255,0.25); }
.secondary-btn { background: #fff; color: $text-main; border: none; border-radius: 24rpx; padding: 16rpx 24rpx; font-size: 24rpx; box-shadow: 0 8rpx 16rpx rgba(0,0,0,0.06); }
.ghost-btn { background: rgba(255,255,255,0.18); color: #fff; border: 2rpx dashed rgba(255,255,255,0.6); border-radius: 24rpx; padding: 14rpx 24rpx; font-size: 24rpx; }

.scroll-content { flex: 1; padding: 0 32rpx; box-sizing: border-box; overflow-y: auto; }
.section-card { background: #fff; border-radius: 32rpx; padding: 24rpx; margin: 12rpx 0 24rpx; box-shadow: 0 8rpx 16rpx rgba(0,0,0,0.04); }
.search-row { display: flex; gap: 12rpx; }
.search-input { flex: 1; background: #F2F2F7; border-radius: 24rpx; padding: 16rpx; font-size: 28rpx; box-shadow: inset 0 0 0 2rpx #eee; }

.task-list { display: flex; flex-direction: column; gap: 24rpx; }
.task-card { position: relative; color: #fff; border-radius: 40rpx; padding: 32rpx; overflow: hidden; box-shadow: 0 24rpx 56rpx rgba(0,122,255,0.20); background: linear-gradient(135deg, #007AFF 0%, #00B4FF 50%, #00C6FF 100%); }
.task-card.running { background: linear-gradient(135deg, #0a84ff 0%, #34c759 100%); box-shadow: 0 24rpx 56rpx rgba(52,199,89,0.25); }
.task-card.active { animation: pulseGlow 2s infinite; }
@keyframes pulseGlow { 0%{ box-shadow:0 24rpx 56rpx rgba(0,122,255,0.22);} 50%{ box-shadow:0 32rpx 72rpx rgba(0,122,255,0.42);} 100%{ box-shadow:0 24rpx 56rpx rgba(0,122,255,0.22);} }

.card-bg-decoration { position: absolute; top: -60rpx; right: -100rpx; width: 340rpx; height: 340rpx; background: radial-gradient(circle at center, rgba(255,255,255,0.42), transparent 62%); filter: blur(12rpx); }

.task-header { display: flex; align-items: center; justify-content: space-between; }
.left { display: flex; align-items: center; gap: 8rpx; }
.icon-small { width: 28rpx; height: 28rpx; border-radius: 8rpx; background: rgba(255,255,255,0.25); }
.label { font-size: 26rpx; }
.status-text { font-size: 26rpx; opacity: 0.9; background: rgba(255,255,255,0.18); padding: 6rpx 12rpx; border-radius: 999rpx; }

.task-content { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 12rpx; }
.info { display: flex; flex-direction: column; gap: 6rpx; }
.h2 { font-size: 36rpx; font-weight: 800; letter-spacing: 0.5rpx; }
.p-white { font-size: 26rpx; opacity: 0.9; }
.countdown { display: flex; flex-direction: column; align-items: flex-end; }
.timer { font-size: 48rpx; font-weight: 800; letter-spacing: 1rpx; }
.timer-label { font-size: 24rpx; opacity: 0.92; }

.task-actions { display: flex; flex-wrap: wrap; gap: 12rpx; margin-top: 20rpx; }
.chip { padding: 10rpx 18rpx; border-radius: 999rpx; background: rgba(255,255,255,0.18); border: 1rpx solid rgba(255,255,255,0.45); font-size: 24rpx; color: #fff; font-weight: 600; backdrop-filter: saturate(120%); transition: all .2s ease; }
.chip.on { background: rgba(255,255,255,0.30); border-color: rgba(255,255,255,0.55); }
.chip.link { background: rgba(255,255,255,0.22); border-color: rgba(255,255,255,0.40); }
.chip.cta { background: #fff; color: #0a84ff; font-weight: 800; box-shadow: 0 8rpx 16rpx rgba(10,132,255,0.25); border: none; }

.op-row { display: flex; gap: 12rpx; margin-top: 16rpx; }

.empty { display: flex; flex-direction: column; align-items: center; gap: 16rpx; padding: 60rpx 0; }
.empty-text { font-size: 28rpx; color: $text-sub; }

.safe-area-spacer { height: 180rpx; padding-bottom: env(safe-area-inset-bottom); }
</style>
