<template>
  <view class="container">
    <TopSafeArea />
    <view class="header">
      <text class="h1">编辑个人信息</text>
    </view>
    <scroll-view scroll-y class="scroll-content">
      <view class="section-card">
        <text>头像、昵称、手机号建设中</text>
      </view>
      <view class="safe-area-spacer"></view>
    </scroll-view>
  </view>
</template>

<script setup>
import TopSafeArea from '@/components/TopSafeArea.vue';
</script>

<style lang="scss">
.container { display: flex; flex-direction: column; height: 100vh; background-color: $bg-body; font-family: -apple-system, BlinkMacSystemFont, "San Francisco", Helvetica, Arial, sans-serif; overflow: hidden; }
.status-bar-placeholder { height: var(--status-bar-height); height: constant(safe-area-inset-top); height: env(safe-area-inset-top); width: 100%; flex-shrink: 0; }
.header { padding: 20rpx 32rpx; background: $bg-body; position: sticky; top: 0; z-index: 10; flex-shrink: 0; }
.h1 { font-size: 40rpx; font-weight: 700; color: $text-main; }
.scroll-content { flex: 1; padding: 0 32rpx; box-sizing: border-box; overflow-y: auto; }
.section-card { background: #fff; border-radius: 32rpx; padding: 32rpx; margin-bottom: 32rpx; }
.safe-area-spacer { height: 180rpx; padding-bottom: env(safe-area-inset-bottom); }
</style>
