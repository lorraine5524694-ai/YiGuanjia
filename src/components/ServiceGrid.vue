<template>
  <view class="service-grid-container">
    <view class="section-title">
      <text class="title-text">快捷服务</text>
    </view>
    <view class="grid-menu">
      <view class="menu-item" @click="handleNavigate('medsAdd')">
        <view class="icon-box box-blue">
          <view class="menu-icon icon-bg-pill"></view>
        </view>
        <text class="menu-text">拍药盒</text>
      </view>
      <view class="menu-item" @click="handleNavigate('reportsNew')">
        <view class="icon-box box-green">
          <view class="ai-badge">AI</view>
          <view class="menu-icon icon-bg-report"></view>
        </view>
        <text class="menu-text">解报告</text>
      </view>
      <view class="menu-item" @click="handleNavigate('billingNew')">
        <view class="icon-box box-orange">
          <view class="menu-icon icon-bg-bill"></view>
        </view>
        <text class="menu-text">记费用</text>
      </view>
      <view class="menu-item" @click="handleNavigate('filesClinic')">
        <view class="icon-box box-purple">
          <view class="menu-icon icon-bg-folder"></view>
        </view>
        <text class="menu-text">病历夹</text>
      </view>
    </view>
  </view>
</template>

<script setup>
const emit = defineEmits(['navigate']);

const handleNavigate = (key) => {
  emit('navigate', key);
};
</script>

<style lang="scss" scoped>
.section-title {
  @include flex-between-center;
  margin-bottom: $spacing-lg;
}

.title-text {
  font-size: $font-size-xl;
  font-weight: $font-weight-bold;
  color: $text-main;
}

.grid-menu {
  @include flex-between-center;
  margin-bottom: 60rpx;
}

.menu-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-sm;
}

.icon-box {
  width: 112rpx;
  height: 112rpx;
  border-radius: $radius-lg;
  @include flex-center;
  position: relative;
  box-shadow: $shadow-sm;
}

.menu-icon {
  width: 48rpx;
  height: 48rpx;
}
.icon-bg-pill {
    background-color: $primary-color;
    mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiI+PHJlY3QgeD0iMiIgeT0iNiIgd2lkdGg9IjIwIiBoZWlnaHQ9IjEyIiByeD0iNiIvPjxwYXRoIGQ9Ik0xMiA2djEyIi8+PC9zdmc+");
    -webkit-mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiI+PHJlY3QgeD0iMiIgeT0iNiIgd2lkdGg9IjIwIiBoZWlnaHQ9IjEyIiByeD0iNiIvPjxwYXRoIGQ9Ik0xMiA2djEyIi8+PC9zdmc+");
    mask-size: contain; -webkit-mask-size: contain; mask-repeat: no-repeat; -webkit-mask-repeat: no-repeat; mask-position: center; -webkit-mask-position: center;
}
.icon-bg-report {
    background-color: $success-color;
    mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiI+PHBhdGggZD0iTTE0IDJINmEyIDIgMCAwIDAtMiAyejE2YTIgMiAwIDAgMCAyIDJoMTJhMiAyIDAgMCAwIDItMlY4eiIvPjxwb2x5bGluZSBwb2ludHM9IjE0IDIgMTQgOCAyMCA4Ii8+PHBhdGggZD0iTTEyIDE4di02Ii8+PHBhdGggZD0iTTkgMTVoNiIvPjwvc3ZnPg==");
    -webkit-mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiI+PHBhdGggZD0iTTE0IDJINmEyIDIgMCAwIDAtMiAyejE2YTIgMiAwIDAgMCAyIDJoMTJhMiAyIDAgMCAwIDItMlY4eiIvPjxwb2x5bGluZSBwb2ludHM9IjE0IDIgMTQgOCAyMCA4Ii8+PHBhdGggZD0iTTEyIDE4di02Ii8+PHBhdGggZD0iTTkgMTVoNiIvPjwvc3ZnPg==");
    mask-size: contain; -webkit-mask-size: contain; mask-repeat: no-repeat; -webkit-mask-repeat: no-repeat; mask-position: center; -webkit-mask-position: center;
}
.icon-bg-bill {
    background-color: #FF9500;
    mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiI+PHBhdGggZD0iTTQgNHYxNmEyIDIgMCAwIDAgMiAyaDEyYTIgMiAwIDAgMCAyLTJWOC4zNDJhMiAyIDAgMCAwLS42MDItMS40M2wtNC40NC00LjM0MkEyIDIgMCAwIDAgMTMuNTYgMkg2YTIgMiAwIDAgMC0yIDJ6Ii8+PHBhdGggZD0iTTkgMTNoNiIvPjxwYXRoIGQ9Ik05IDE3aDYiLz48cGF0aCBkPSJNMTQgMnY2aDYiLz48L3N2Zz4=");
    -webkit-mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiI+PHBhdGggZD0iTTQgNHYxNmEyIDIgMCAwIDAgMiAyaDEyYTIgMiAwIDAgMCAyLTJWOC4zNDJhMiAyIDAgMCAwLS42MDItMS40M2wtNC40NC00LjM0MkEyIDIgMCAwIDAgMTMuNTYgMkg2YTIgMiAwIDAgMC0yIDJ6Ii8+PHBhdGggZD0iTTkgMTNoNiIvPjxwYXRoIGQ9Ik05IDE3aDYiLz48cGF0aCBkPSJNMTQgMnY2aDYiLz48L3N2Zz4=");
    mask-size: contain; -webkit-mask-size: contain; mask-repeat: no-repeat; -webkit-mask-repeat: no-repeat; mask-position: center; -webkit-mask-position: center;
}
.icon-bg-folder {
    background-color: #AF52DE;
    mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiI+PHBhdGggZD0iTTIyIDE5YTIgMiAwIDAgMS0yIDJINGEyIDIgMCAwIDEtMi0yVjVhMiAyIDAgMCAxIDItMmg1bDIgM2g5YTIgMiAwIDAgMSAyIDJ6Ii8+PC9zdmc+");
    -webkit-mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiI+PHBhdGggZD0iTTIyIDE5YTIgMiAwIDAgMS0yIDJINGEyIDIgMCAwIDEtMi0yVjVhMiAyIDAgMCAxIDItMmg1bDIgM2g5YTIgMiAwIDAgMSAyIDJ6Ii8+PC9zdmc+");
    mask-size: contain; -webkit-mask-size: contain; mask-repeat: no-repeat; -webkit-mask-repeat: no-repeat; mask-position: center; -webkit-mask-position: center;
}

.menu-text {
  font-size: $font-size-sm;
  color: $text-main;
}

.box-blue { background: $primary-light; color: $primary-color; }
.box-green { background: #E8FCEF; color: $success-color; }
.box-orange { background: #FFF5E5; color: #FF9500; }
.box-purple { background: #F7E5FF; color: #AF52DE; }

.ai-badge {
  position: absolute;
  top: -10rpx;
  right: -10rpx;
  background: #000;
  color: #fff;
  font-size: 18rpx;
  padding: 4rpx 12rpx;
  border-radius: 16rpx;
  font-weight: bold;
  border: 4rpx solid #fff;
}
</style>
