<template>
  <view class="header">
    <view class="user-info" @click="handleToggleFamily">
      <image class="avatar" :src="avatarUrl" mode="aspectFill"></image>
      <view class="greeting">
        <text class="h1">{{ greetingText }}</text>
        <view class="sub-text">
          <text>当前管理: {{ currentMember }}</text>
          <view class="arrow-down"></view>
        </view>
      </view>
    </view>
    <view class="notification-btn" @click="handleNotificationClick">
      <view class="icon-bell icon-bg"></view>
      <view class="dot" v-if="hasUnread"></view>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  currentMember: {
    type: String,
    default: '我自己'
  },
  reminders: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['toggle-family', 'click-notification']);

const avatarUrl = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100&h=100";

const greetingText = computed(() => {
  const hour = new Date().getHours();
  if (hour < 12) return `早安，${props.currentMember}`;
  if (hour < 18) return `午安，${props.currentMember}`;
  return `晚上好，${props.currentMember}`;
});

const hasUnread = computed(() => props.reminders.length > 0);

const handleToggleFamily = () => {
  emit('toggle-family');
};

const handleNotificationClick = () => {
  emit('click-notification');
};
</script>

<style lang="scss" scoped>
.header {
  @include flex-between-center;
  padding: 20rpx $spacing-lg;
  margin-bottom: 10rpx;
  flex-shrink: 0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: $spacing-base;
}

.avatar {
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  border: 4rpx solid #fff;
  box-shadow: $shadow-sm;
}

.greeting {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.h1 {
  font-size: $font-size-xl;
  font-weight: $font-weight-bold;
  color: $text-main;
}

.sub-text {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  font-size: $font-size-sm;
  color: $text-sub;
}

.arrow-down {
  width: 0; 
  height: 0; 
  border-left: 8rpx solid transparent;
  border-right: 8rpx solid transparent;
  border-top: 10rpx solid $text-sub;
}

.notification-btn {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: #fff;
  @include flex-center;
  position: relative;
  box-shadow: $shadow-sm;
}

.icon-bell {
  width: 40rpx;
  height: 40rpx;
}

.icon-bg {
    background-color: #333;
    mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMTggOEE2IDYgMCAwIDAgNiA4YzAgNy0zIDktMyA5aDE4cy0zLTItMy05Ii8+PHBhdGggZD0iTTEzLjczIDIxYTIgMiAwIDAgMS0zLjQ2IDAiLz48L3N2Zz4=");
    -webkit-mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMTggOEE2IDYgMCAwIDAgNiA4YzAgNy0zIDktMyA5aDE4cy0zLTItMy05Ii8+PHBhdGggZD0iTTEzLjczIDIxYTIgMiAwIDAgMS0zLjQ2IDAiLz48L3N2Zz4=");
    mask-size: contain;
    -webkit-mask-size: contain;
    mask-repeat: no-repeat;
    -webkit-mask-repeat: no-repeat;
    mask-position: center;
    -webkit-mask-position: center;
}

.dot {
  position: absolute;
  top: 20rpx;
  right: 20rpx;
  width: 16rpx;
  height: 16rpx;
  background: $alert-color;
  border-radius: 50%;
  border: 2rpx solid #fff;
}
</style>
