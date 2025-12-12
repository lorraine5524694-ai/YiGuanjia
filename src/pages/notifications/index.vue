<template>
  <view class="container">
    <TopSafeArea />
    
    <!-- Header -->
    <view class="nav-header">
      <view class="back-btn" @click="goBack">
        <view class="icon-back"></view>
      </view>
      <text class="nav-title">通知清单</text>
      <view class="placeholder"></view>
    </view>

    <!-- Tabs -->
    <view class="tabs-container">
      <view 
        class="tab-item" 
        :class="{ active: activeTab === 'mine' }"
        @click="activeTab = 'mine'"
      >
        <text class="tab-text">我的通知</text>
        <view class="badge" v-if="myUnreadCount > 0">{{ myUnreadCount }}</view>
        <view class="active-line" v-if="activeTab === 'mine'"></view>
      </view>
      <view 
        class="tab-item" 
        :class="{ active: activeTab === 'family' }"
        @click="activeTab = 'family'"
      >
        <text class="tab-text">家人通知</text>
        <view class="badge" v-if="familyUnreadCount > 0">{{ familyUnreadCount }}</view>
        <view class="active-line" v-if="activeTab === 'family'"></view>
      </view>
    </view>

    <!-- Content -->
    <scroll-view scroll-y class="content-area">
      <view class="notification-list" v-if="currentList.length > 0">
        <view 
          class="notification-item" 
          v-for="(item, index) in currentList" 
          :key="item.id"
          :class="{ unread: !item.read }"
          @click="markAsRead(item)"
        >
          <view class="icon-box" :class="item.type">
            <view class="type-icon"></view>
          </view>
          <view class="item-content">
            <view class="item-header">
              <text class="item-title">{{ item.title }}</text>
              <text class="item-time">{{ item.time }}</text>
            </view>
            <text class="item-desc">{{ item.content }}</text>
          </view>
          <view class="unread-dot" v-if="!item.read"></view>
        </view>
      </view>

      <!-- Empty State -->
      <view class="empty-state" v-else>
        <view class="empty-icon"></view>
        <text class="empty-text">暂无通知</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue';
import TopSafeArea from '@/components/TopSafeArea.vue';

const activeTab = ref('mine');

const myNotifications = ref([
  {
    id: 1,
    type: 'med',
    title: '用药提醒',
    content: '该吃维生素 C 了 (1片 · 随餐)',
    time: '10分钟前',
    read: false
  },
  {
    id: 2,
    type: 'booking',
    title: '预约提醒',
    content: '协和医院 - 皮肤科 专家号预约即将开始',
    time: '30分钟前',
    read: false
  },
  {
    id: 3,
    type: 'system',
    title: '系统通知',
    content: '您的健康周报已生成，点击查看',
    time: '昨天',
    read: true
  }
]);

const familyNotifications = ref([
  {
    id: 101,
    type: 'med',
    title: '张爷爷 - 用药提醒',
    content: '降压药 (厄贝沙坦) 尚未服用',
    time: '1小时前',
    read: false
  },
  {
    id: 102,
    type: 'report',
    title: '李奶奶 - 检查报告',
    content: '血常规检查报告已出，请及时查看',
    time: '2小时前',
    read: true
  }
]);

const currentList = computed(() => {
  return activeTab.value === 'mine' ? myNotifications.value : familyNotifications.value;
});

const myUnreadCount = computed(() => {
  return myNotifications.value.filter(n => !n.read).length;
});

const familyUnreadCount = computed(() => {
  return familyNotifications.value.filter(n => !n.read).length;
});

const goBack = () => {
  uni.navigateBack();
};

const markAsRead = (item) => {
  item.read = true;
};
</script>

<style lang="scss">
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: $bg-body;
}

.nav-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx $spacing-lg;
  background-color: #fff;
}

.back-btn {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-back {
  width: 40rpx;
  height: 40rpx;
  background-color: $text-main;
  mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMTUgMThsLTYtNiA2LTYiLz48L3N2Zz4=");
  -webkit-mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMTUgMThsLTYtNiA2LTYiLz48L3N2Zz4=");
  mask-size: contain;
  -webkit-mask-size: contain;
  mask-repeat: no-repeat;
  -webkit-mask-repeat: no-repeat;
  mask-position: center;
  -webkit-mask-position: center;
}

.nav-title {
  font-size: 34rpx;
  font-weight: 600;
  color: $text-main;
}

.placeholder {
  width: 64rpx;
}

.tabs-container {
  display: flex;
  background-color: #fff;
  padding: 0 $spacing-lg;
  border-bottom: 1rpx solid #f0f0f0;
}

.tab-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30rpx 0;
  position: relative;
  gap: 8rpx;
}

.tab-text {
  font-size: 30rpx;
  color: $text-sub;
  transition: all 0.3s;
}

.tab-item.active .tab-text {
  color: $primary-color;
  font-weight: 600;
}

.active-line {
  position: absolute;
  bottom: 0;
  width: 40rpx;
  height: 6rpx;
  background-color: $primary-color;
  border-radius: 4rpx;
}

.badge {
  background-color: $alert-color;
  color: #fff;
  font-size: 20rpx;
  padding: 2rpx 10rpx;
  border-radius: 20rpx;
  line-height: 1.2;
}

.content-area {
  flex: 1;
  padding: $spacing-lg;
  box-sizing: border-box;
}

.notification-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-base;
}

.notification-item {
  background-color: #fff;
  border-radius: 24rpx;
  padding: 30rpx;
  display: flex;
  gap: 24rpx;
  position: relative;
  transition: all 0.2s;
}

.notification-item:active {
  transform: scale(0.98);
  background-color: #f9f9f9;
}

.icon-box {
  width: 80rpx;
  height: 80rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-box.med { background-color: rgba(255, 149, 0, 0.1); color: $warning-color; }
.icon-box.booking { background-color: rgba(0, 122, 255, 0.1); color: $primary-color; }
.icon-box.system { background-color: rgba(50, 50, 50, 0.1); color: $text-main; }
.icon-box.report { background-color: rgba(52, 199, 89, 0.1); color: $success-color; }

.type-icon {
  width: 40rpx;
  height: 40rpx;
  background-color: currentColor;
  mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMTggOEE2IDYgMCAwIDAgNiA4YzAgNy0zIDktMyA5aDE4cy0zLTItMy05Ii8+PHBhdGggZD0iTTEzLjczIDIxYTIgMiAwIDAgMS0zLjQ2IDAiLz48L3N2Zz4=");
  -webkit-mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMTggOEE2IDYgMCAwIDAgNiA4YzAgNy0zIDktMyA5aDE4cy0zLTItMy05Ii8+PHBhdGggZD0iTTEzLjczIDIxYTIgMiAwIDAgMS0zLjQ2IDAiLz48L3N2Zz4=");
  mask-size: contain;
  -webkit-mask-size: contain;
  mask-repeat: no-repeat;
  -webkit-mask-repeat: no-repeat;
  mask-position: center;
  -webkit-mask-position: center;
}

.item-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-title {
  font-size: 30rpx;
  font-weight: 600;
  color: $text-main;
}

.item-time {
  font-size: 24rpx;
  color: $text-sub;
}

.item-desc {
  font-size: 26rpx;
  color: $text-sub;
  line-height: 1.4;
}

.unread-dot {
  position: absolute;
  top: 30rpx;
  right: 30rpx;
  width: 16rpx;
  height: 16rpx;
  background-color: $alert-color;
  border-radius: 50%;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 200rpx;
  gap: 20rpx;
}

.empty-icon {
  width: 120rpx;
  height: 120rpx;
  background-color: #ddd;
  mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMTggOEE2IDYgMCAwIDAgNiA4YzAgNy0zIDktMyA5aDE4cy0zLTItMy05Ii8+PHBhdGggZD0iTTEzLjczIDIxYTIgMiAwIDAgMS0zLjQ2IDAiLz48L3N2Zz4=");
  -webkit-mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMTggOEE2IDYgMCAwIDAgNiA4YzAgNy0zIDktMyA5aDE4cy0zLTItMy05Ii8+PHBhdGggZD0iTTEzLjczIDIxYTIgMiAwIDAgMS0zLjQ2IDAiLz48L3N2Zz4=");
  mask-size: contain;
  -webkit-mask-size: contain;
  mask-repeat: no-repeat;
  -webkit-mask-repeat: no-repeat;
  mask-position: center;
  -webkit-mask-position: center;
}

.empty-text {
  font-size: 28rpx;
  color: $text-sub;
}
</style>
