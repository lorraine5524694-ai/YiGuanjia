<template>
  <view class="tab-bar">
    <view
      v-for="item in tabs"
      :key="item.key"
      :class="['tab-item', { active: active === item.key }, item.add && 'tab-item-add']"
      @click="handleClick(item)"
    >
      <template v-if="item.add">
        <view class="add-btn-inner">
          <view class="add-icon icon-bg-plus"></view>
        </view>
      </template>
      <template v-else>
        <view :class="['tab-icon', item.icon]"></view>
        <text>{{ item.label }}</text>
      </template>
    </view>
  </view>
</template>

<script setup>
const props = defineProps({
  active: {
    type: String,
    required: true
  }
});

const tabs = [
  { key: 'home', label: '首页', icon: 'icon-bg-home', url: '/pages/index/index' },
  { key: 'files', label: '档案', icon: 'icon-bg-file', url: '/pages/files/index' },
  { key: 'add', label: '', icon: '', add: true },
  { key: 'stats', label: '统计', icon: 'icon-bg-stats', url: '/pages/stats/index' },
  { key: 'profile', label: '我的', icon: 'icon-bg-user', url: '/pages/profile/index' }
];

const handleClick = (item) => {
  if (item.add || item.key === props.active) {
    if (item.add) {
      uni.showActionSheet({
        itemList: ['记病历', '存报告', '记用药'],
        success: (res) => {
          const i = res.tapIndex
          if (i === 0) uni.navigateTo({ url: '/pages/files/new' })
          if (i === 1) uni.navigateTo({ url: '/pages/reports/new' })
          if (i === 2) uni.navigateTo({ url: '/pages/meds/add' })
        }
      })
    }
    return;
  }
  uni.reLaunch({ url: item.url });
};
</script>

<style lang="scss">
@import "@/styles/theme.scss";

.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 160rpx;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  display: flex;
  justify-content: space-around;
  align-items: flex-start;
  padding-top: 20rpx;
  border-top: 1rpx solid rgba(0, 0, 0, 0.05);
  z-index: 999;
  @include safe-area-padding(padding-bottom, 20rpx);
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  width: 100rpx;
}

.tab-icon {
  width: 48rpx;
  height: 48rpx;
  background-color: #c7c7cc;
  transition: background-color .2s ease;
}

.tab-item text {
  font-size: 20rpx;
  color: #c7c7cc;
  font-weight: 500;
}

.tab-item.active text {
  color: $primary-color;
}

.tab-item.active .tab-icon {
  background-color: $primary-color;
}

.tab-item-add {
  position: relative;
  top: -40rpx;
}

.add-btn-inner {
  width: 96rpx;
  height: 96rpx;
  background: $primary-color;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 8rpx 24rpx rgba(0, 122, 255, 0.3);
}

.add-icon {
  width: 40rpx;
  height: 40rpx;
}

.icon-bg-home {
  mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiI+PHBhdGggZD0iTTMgOWw5LTcgOSA3djExYTIgMiAwIDAgMS0yIDJINWEyIDIgMCAwIDEtMi0yeiIvPjxwb2x5bGluZSBwb2ludHM9IjkgMjIgOSAxMiAxNSAxMiAxNSAyMiIvPjwvc3ZnPg==");
  -webkit-mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiI+PHBhdGggZD0iTTMgOWw5LTcgOSA3djExYTIgMiAwIDAgMS0yIDJINWEyIDIgMCAwIDEtMi0yeiIvPjxwb2x5bGluZSBwb2ludHM9IjkgMjIgOSAxMiAxNSAxMiAxNSAyMiIvPjwvc3ZnPg==");
  mask-size: contain;
  -webkit-mask-size: contain;
  mask-repeat: no-repeat;
  -webkit-mask-repeat: no-repeat;
  mask-position: center;
  -webkit-mask-position: center;
}

.icon-bg-file,
.icon-bg-stats,
.icon-bg-user {
  mask-size: contain;
  -webkit-mask-size: contain;
  mask-repeat: no-repeat;
  -webkit-mask-repeat: no-repeat;
  mask-position: center;
  -webkit-mask-position: center;
}

.icon-bg-file {
  mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiI+PHBhdGggZD0iTTE0IDJINmEyIDIgMCAwIDAtMiAyejE2YTIgMiAwIDAgMCAyIDJoMTJhMiAyIDAgMCAwIDItMlY4eiIvPjxwb2x5bGluZSBwb2ludHM9IjE0IDIgMTQgOCAyMCA4Ii8+PHBhdGggZD0iTTE2IDEzSDgiLz48cGF0aCBkPSJNMTYgMTdIODgiLz48cGF0aCBkPSJNMTAgOUg4Ii8+PC9zdmc+");
  -webkit-mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiI+PHBhdGggZD0iTTE0IDJINmEyIDIgMCAwIDAtMiAyejE2YTIgMiAwIDAgMCAyIDJoMTJhMiAyIDAgMCAwIDItMlY4eiIvPjxwb2x5bGluZSBwb2ludHM9IjE0IDIgMTQgOCAyMCA4Ii8+PHBhdGggZD0iTTE2IDEzSDgiLz48cGF0aCBkPSJNMTYgMTdIODgiLz48cGF0aCBkPSJNMTAgOUg4Ii8+PC9zdmc+");
}

.icon-bg-stats {
  mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiI+PHBhdGggZD0iTTIxLjIxIDE1Ljg5QTEwIDEwIDAgMSAxIDggMi44MyIvPjxwYXRoIGQ9Ik0yMiAxMkExMCAxMCAwIDAgMCAxMiAydjEweiIvPjwvc3ZnPg==");
  -webkit-mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiI+PHBhdGggZD0iTTIxLjIxIDE1Ljg5QTEwIDEwIDAgMSAxIDggMi44MyIvPjxwYXRoIGQ9Ik0yMiAxMkExMCAxMCAwIDAgMCAxMiAydjEweiIvPjwvc3ZnPg==");
}

.icon-bg-user {
  mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiI+PHBhdGggZD0iTTIwIDIxdi0yYTQgNCAwIDAgMC00LTRIOGE0IDQgMCAwIDAtNCA0djIiLz48Y2lyY2xlIGN4PSIxMiIgY3k9IjciIHI9IjQiLz48L3N2Zz4=");
  -webkit-mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiI+PHBhdGggZD0iTTIwIDIxdi0yYTQgNCAwIDAgMC00LTRIOGE0IDQgMCAwIDAtNCA0djIiLz48Y2lyY2xlIGN4PSIxMiIgY3k9IjciIHI9IjQiLz48L3N2Zz4=");
}

.icon-bg-plus {
  background-color: #fff;
  mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMyI+PGxpbmUgeDE9IjEyIiB5MT0iNSIgeDI9IjEyIiB5Mj0iMTkiLz48bGluZSB4MT0iNSIgeTE9IjEyIiB4Mj0iMTkiIHkyPSIxMiIvPjwvc3ZnPg==");
  -webkit-mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMyI+PGxpbmUgeDE9IjEyIiB5MT0iNSIgeDI9IjEyIiB5Mj0iMTkiLz48bGluZSB4MT0iNSIgeTE9IjEyIiB4Mj0iMTkiIHkyPSIxMiIvPjwvc3ZnPg==");
  mask-size: contain;
  -webkit-mask-size: contain;
  mask-repeat: no-repeat;
  -webkit-mask-repeat: no-repeat;
  mask-position: center;
  -webkit-mask-position: center;
}
</style>
