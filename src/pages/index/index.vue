<template>
  <view class="container">
    <!-- 顶部状态栏占位 -->
    <TopSafeArea />
    
    <!-- 头部 -->
    <AppHeader 
      :current-member="currentMember" 
      :reminders="reminderList"
      @toggle-family="toggleFamily"
      @click-notification="handleNotificationClick"
    />

    <scroll-view scroll-y class="scroll-content">
      <!-- 抢号提醒卡片 -->
      <BookingCard 
        :task="bookingTask" 
        @click="goBookingNew"
      />

      <!-- 快捷服务 Grid -->
      <ServiceGrid @navigate="handleGridNavigate" />

      <!-- 今日用药 -->
      <view class="section-title">
        <text class="title-text">今日用药</text>
        <view class="more-link" @click="goMedsIndex">
          <text>全部 {{ medListAll.length }}</text>
          <text class="arrow-right">></text>
        </view>
      </view>

      <view class="med-time-tabs">
        <view
          v-for="tab in timeTabs"
          :key="tab.key"
          :class="['time-tab', { active: selectedTab === tab.key }]"
          @click="selectedTab = tab.key"
        >
          <text>{{ tab.label }}</text>
        </view>
      </view>

      <view class="med-list" v-if="medList.length > 0">
        <MedCard 
          v-for="(item, index) in medList" 
          :key="index" 
          :item="item" 
          @check="toggleCheck(index)"
        />
      </view>
      <view class="empty-state" v-else>
        <view class="empty-icon icon-bg-empty"></view>
        <text class="empty-text">当前时段暂无用药计划</text>
        <view class="add-btn-small" @click="goMedsIndex">去添加</view>
      </view>
      
      <!-- 底部安全区垫高 -->
      <view class="safe-area-spacer"></view>
    </scroll-view>

    <!-- 统一 TabBar -->
    <CustomTabBar active="home" />
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import CustomTabBar from '@/components/CustomTabBar.vue';
import TopSafeArea from '@/components/TopSafeArea.vue';
import AppHeader from '@/components/AppHeader.vue';
import BookingCard from '@/components/BookingCard.vue';
import ServiceGrid from '@/components/ServiceGrid.vue';
import MedCard from '@/components/MedCard.vue';

const currentMember = ref('我自己');

const timeTabs = [
  { key: 'all', label: '全部' },
  { key: 'morning', label: '早上' },
  { key: 'noon', label: '中午' },
  { key: 'evening', label: '晚上' }
];
const selectedTab = ref('morning');
const medListAll = ref([
  { name: '阿莫西林胶囊', desc: '0.5g x 2粒 · 饭后服用', checked: false, slot: 'noon' },
  { name: '降压药 (厄贝沙坦)', desc: '1粒 · 早餐前', checked: false, slot: 'morning' },
  { name: '维生素 C', desc: '1片 · 随餐', checked: true, slot: 'evening' }
]);
const medList = computed(() => {
  if (selectedTab.value === 'all') return medListAll.value;
  return medListAll.value.filter(i => i.slot === selectedTab.value);
});

const toggleCheck = (index) => {
  // Find the item in the original list based on the filtered list item
  const item = medList.value[index];
  item.checked = !item.checked;
  if (item.checked) {
    uni.showToast({ title: '已完成服药打卡', icon: 'success' });
  }
};

const showToast = (msg) => {
  uni.showToast({ title: msg, icon: 'none' });
};

const toggleFamily = () => {
  uni.showActionSheet({
    itemList: ['我自己', '张爷爷', '李奶奶'],
    success: (res) => {
      const members = ['我自己', '张爷爷', '李奶奶'];
      currentMember.value = members[res.tapIndex];
      showToast('切换至: ' + currentMember.value);
    }
  });
};

const goMedsIndex = () => {
  uni.navigateTo({ url: '/pages/meds/index' });
};
const goBookingNew = () => {
  uni.navigateTo({ url: '/pages/booking/index' });
};

const handleGridNavigate = (key) => {
  const routes = {
    medsAdd: '/pages/meds/add',
    reportsNew: '/pages/reports/new',
    billingNew: '/pages/billing/new',
    filesClinic: '/pages/files/index?tab=' + encodeURIComponent('门诊病历')
  };
  if (routes[key]) {
    uni.navigateTo({ url: routes[key] });
  }
};

const nowMs = () => new Date().getTime();
const inThirtyMinutes = () => nowMs() + 30 * 60 * 1000;
const bookingTask = ref({
  hospital: '协和医院',
  department: '皮肤科',
  tag: '专家号 / 周三上午',
  openTime: inThirtyMinutes(),
  link: 'https://www.hospital.example.com/booking'
});

const reminderList = computed(() => {
  const list = [];
  
  // 1. Booking Task Reminder
  if (bookingTask.value && bookingTask.value.openTime > nowMs()) {
    list.push(`预约提醒: ${bookingTask.value.hospital} ${bookingTask.value.department}`);
  }

  // 2. Medication Reminders (Unchecked)
  medListAll.value.forEach(med => {
    if (!med.checked) {
       list.push(`用药提醒: ${med.name} (${med.desc})`);
    }
  });

  return list;
});

const handleNotificationClick = () => {
  uni.navigateTo({ url: '/pages/notifications/index' });
};

onMounted(() => {
  const h = new Date().getHours();
  if (h >= 5 && h < 11) selectedTab.value = 'morning';
  else if (h >= 11 && h < 15) selectedTab.value = 'noon';
  else selectedTab.value = 'evening';
});
</script>

<style lang="scss">
/* 变量已在 uni.scss 中引入 src/styles/theme.scss */

.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: $bg-body;
  font-family: -apple-system, BlinkMacSystemFont, "San Francisco", Helvetica, Arial, sans-serif;
  overflow: hidden;
}

.scroll-content {
  flex: 1;
  padding: 0 $spacing-lg;
  box-sizing: border-box;
  overflow-y: auto;
}

/* 快捷菜单 */
.section-title {
  @include flex-between-center;
  margin-bottom: $spacing-lg;
}

.title-text {
  font-size: $font-size-xl;
  font-weight: $font-weight-bold;
  color: $text-main;
}

.more-link {
  font-size: $font-size-sm;
  color: $primary-color;
  display: flex;
  align-items: center;
  gap: 4rpx;
}

.arrow-right {
  font-family: monospace;
  font-weight: bold;
}

.med-time-tabs {
  display: flex;
  gap: 12rpx;
  margin-bottom: $spacing-base;
}
.time-tab {
  flex: 1;
  height: 72rpx;
  border-radius: 999rpx;
  background: #fff;
  border: 2rpx solid #eee;
  @include flex-center;
  color: $text-main;
  font-size: $font-size-sm;
}
.time-tab.active {
  background: $primary-light;
  border-color: $primary-color;
  color: $primary-color;
  font-weight: 700;
}

/* 药品列表 */
.med-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-base;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 0;
  gap: $spacing-sm;
}

.empty-icon {
  width: 120rpx;
  height: 120rpx;
  background-color: #ddd;
}
.icon-bg-empty {
  background-color: #ccc;
  mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIvPjxsaW5lIHgxPSIxMiIgeTE9IjgiIHgyPSIxMiIgeTI9IjEyIi8+PGxpbmUgeDE9IjEyIiB5MT0iMTYiIHgyPSIxMi4wMSIgeTI9IjE2Ii8+PC9zdmc+");
  -webkit-mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIvPjxsaW5lIHgxPSIxMiIgeTE9IjgiIHgyPSIxMiIgeTI9IjEyIi8+PGxpbmUgeDE9IjEyIiB5MT0iMTYiIHgyPSIxMi4wMSIgeTI9IjE2Ii8+PC9zdmc+");
  mask-size: contain; -webkit-mask-size: contain; mask-repeat: no-repeat; -webkit-mask-repeat: no-repeat; mask-position: center; -webkit-mask-position: center;
}

.empty-text {
  font-size: $font-size-sm;
  color: $text-sub;
}

.add-btn-small {
  margin-top: $spacing-xs;
  padding: 12rpx 32rpx;
  background: $primary-light;
  color: $primary-color;
  font-size: $font-size-sm;
  border-radius: 999rpx;
  font-weight: 600;
}

.safe-area-spacer {
  height: 180rpx; 
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
