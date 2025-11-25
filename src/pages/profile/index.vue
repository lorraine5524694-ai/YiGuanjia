<template>
  <view class="container" :class="{ elderly: elderlyMode }" :style="{ '--scale': fontScale }">
    <TopSafeArea />
    
  <view class="header"></view>

    <scroll-view scroll-y class="scroll-content">
      <scroll-view scroll-x class="member-scroll" show-scrollbar="false">
        <view class="member-row">
          <view class="member-card" v-for="m in members" :key="m.id" @click="setActive(m.id)">
            <view class="member-top">
              <image class="avatar-large" :src="m.avatar" mode="aspectFill"></image>
              <view class="member-meta">
                <text class="user-name">{{ m.name }}</text>
                <text class="user-sub">{{ m.relation || '本人' }}</text>
              </view>
              <view class="active-dot" v-if="m.id===activeId"></view>
            </view>
            <view class="member-todo">
              <text class="todo-text">今日待服药 {{ m.todayMeds || 0 }} 次</text>
            </view>
          </view>
          <view class="member-card add-card" @click="goFamilyManage">
            <view class="add-circle">+</view>
            <text class="add-text">添加成员</text>
          </view>
        </view>
      </scroll-view>

      <view class="section-card">
        <view class="section-header">
          <text class="section-title">健康基础档案</text>
          <view class="manage-btn" @click="goFamilyManage"><text>编辑</text></view>
        </view>
        <view class="health-grid">
          <view class="health-item">
            <text class="health-label">血型</text>
            <text class="health-value">{{ currentMember.health?.bloodType || '未填写' }}</text>
          </view>
          <view class="health-item">
            <text class="health-label">过敏史</text>
            <text class="health-value">{{ currentMember.health?.allergies || '未填写' }}</text>
          </view>
          <view class="health-item">
            <text class="health-label">慢病史</text>
            <text class="health-value">{{ currentMember.health?.chronic || '未填写' }}</text>
          </view>
        </view>
      </view>

      <view class="menu-list">
        <view class="menu-item">
          <view class="item-left">
            <view class="menu-icon-box box-orange"><view class="menu-icon icon-bg-eye"></view></view>
            <text class="item-text">长辈模式</text>
          </view>
          <switch :checked="elderlyMode" @change="toggleElderlyMode" color="#007AFF" style="transform:scale(0.8)"/>
        </view>
        <view class="menu-item">
          <view class="item-left">
            <view class="menu-icon-box box-blue"><view class="menu-icon icon-bg-heart"></view></view>
            <text class="item-text">字体大小</text>
          </view>
          <slider min="1" max="1.6" step="0.1" :value="fontScale" @change="onFontScale" style="width: 300rpx"/>
        </view>
        <view class="menu-item" @click="exportData">
          <view class="item-left">
            <view class="menu-icon-box box-green"><view class="menu-icon icon-bg-export"></view></view>
            <text class="item-text">数据导出</text>
          </view>
          <view class="arrow-right-gray">></view>
        </view>
        <view class="menu-item" @click="goNotifyManage">
          <view class="item-left">
            <view class="menu-icon-box box-purple"><view class="menu-icon icon-bg-bell"></view></view>
            <text class="item-text">消息通知管理</text>
          </view>
          <view class="arrow-right-gray">></view>
        </view>
      </view>

      <view class="menu-list">
        <view class="menu-item" @click="openPolicy('privacy')">
          <view class="item-left"><text class="item-text">隐私政策</text></view>
          <view class="arrow-right-gray">></view>
        </view>
        <view class="menu-item" @click="openPolicy('terms')">
          <view class="item-left"><text class="item-text">用户协议</text></view>
          <view class="arrow-right-gray">></view>
        </view>
        <view class="menu-item" @click="clearCache">
          <view class="item-left"><text class="item-text">清除本地缓存</text></view>
          <view class="arrow-right-gray">></view>
        </view>
      </view>

      <view class="version-info">
        <text>版本 1.0.0</text>
      </view>

      <!-- 底部安全区垫高 -->
      <view class="safe-area-spacer"></view>
    </scroll-view>

    <!-- 统一 TabBar -->
    <CustomTabBar active="profile" />
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import CustomTabBar from '@/components/CustomTabBar.vue';
import TopSafeArea from '@/components/TopSafeArea.vue';

const elderlyMode = ref(false);
const fontScale = ref(1);
const members = ref([]);
const activeId = ref('');
const currentMember = computed(() => members.value.find(i=>i.id===activeId.value) || {});
const loadMembers = () => {
  const saved = uni.getStorageSync('mm_family_members') || [];
  members.value = saved.length ? saved : [
    { id: 'self', name: '我自己', relation: '本人', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100&h=100', todayMeds: 1, health: { bloodType: '', allergies: '', chronic: '' } },
    { id: 'grandma', name: '李奶奶', relation: '母亲', avatar: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=100&h=100', todayMeds: 2, health: { bloodType: 'A', allergies: '青霉素', chronic: '高血压' } }
  ];
  const act = uni.getStorageSync('mm_active_member_id') || members.value[0].id;
  activeId.value = act;
  const pref = uni.getStorageSync('mm_preferences') || {};
  elderlyMode.value = !!pref.elderlyMode;
  fontScale.value = pref.fontScale !== undefined ? pref.fontScale : (elderlyMode.value ? 1.3 : 1);
};
const savePreferences = () => {
  const pref = { elderlyMode: elderlyMode.value, fontScale: fontScale.value };
  uni.setStorageSync('mm_preferences', pref);
};
const toggleElderlyMode = e => {
  elderlyMode.value = e.detail.value;
  fontScale.value = elderlyMode.value ? 1.3 : 1;
  savePreferences();
  uni.showToast({ title: elderlyMode.value ? '已开启长辈模式' : '已关闭长辈模式', icon: 'none' });
};
const onFontScale = e => {
  fontScale.value = Number(e.detail.value);
  savePreferences();
  uni.showToast({ title: '已调整字体大小', icon: 'none' });
};
const setActive = id => {
  activeId.value = id;
  uni.setStorageSync('mm_active_member_id', id);
  uni.showToast({ title: '已切换', icon: 'none' });
};
const goFamilyManage = () => {
  uni.navigateTo({ url: '/pages/profile/family/manage' });
};
const exportData = () => {
  uni.showActionSheet({ itemList: ['导出为JSON','导出为CSV'], success: r => {
    const data = { member: currentMember.value, meds: uni.getStorageSync('mm_meds')||[], reports: uni.getStorageSync('mm_reports')||[], bills: uni.getStorageSync('mm_bills')||[] };
    const str = JSON.stringify(data);
    const blob = new Blob([str], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'medical_manager_export.json'; a.click(); URL.revokeObjectURL(url);
    uni.showToast({ title: '已导出', icon: 'none' });
  }});
};
const notifyStatus = ref(uni.getStorageSync('mm_notify_status') || { meds:false, booking:false });
const goNotifyManage = () => {
  uni.showActionSheet({ itemList: ['订阅服药提醒','订阅抢号提醒'], success: r => {
    if (r.tapIndex===0) requestSubscribe('meds');
    if (r.tapIndex===1) requestSubscribe('booking');
  }});
};
const requestSubscribe = type => {
  notifyStatus.value[type] = true;
  uni.setStorageSync('mm_notify_status', notifyStatus.value);
  uni.showToast({ title: '已记录授权', icon: 'none' });
};
const openPolicy = type => {
  uni.showToast({ title: type==='privacy'?'隐私政策':'用户协议', icon: 'none' });
};
const clearCache = () => {
  uni.clearStorageSync();
  loadMembers();
  uni.showToast({ title: '已清除缓存', icon: 'none' });
};
onMounted(loadMembers);
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

.elderly .menu-item { padding: calc(36rpx * var(--scale)); }

.status-bar-placeholder {
  height: var(--status-bar-height);
  height: constant(safe-area-inset-top);
  height: env(safe-area-inset-top);
  width: 100%;
  flex-shrink: 0;
}

.header { height: 40rpx; flex-shrink: 0; }

.scroll-content {
  flex: 1;
  padding: 0 32rpx;
  box-sizing: border-box;
  overflow-y: auto;
}

.member-scroll { margin-bottom: 24rpx; }
.member-row { display: flex; gap: 24rpx; }
.member-card { background: #fff; border-radius: 32rpx; padding: 24rpx; width: 520rpx; flex-shrink: 0; }
.member-top { display: flex; align-items: center; gap: 24rpx; }
.avatar-large {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  border: 4rpx solid #f0f0f0;
}
.member-meta { flex: 1; display: flex; flex-direction: column; gap: 8rpx; }
.user-name {
  font-size: calc(40rpx * var(--scale));
  font-weight: 700;
  color: $text-main;
}
.user-sub { font-size: calc(28rpx * var(--scale)); color: $text-sub; }
.active-dot { width: 16rpx; height: 16rpx; border-radius: 50%; background: $primary-color; }
.member-todo { margin-top: 16rpx; background: #F2F8FF; border-radius: 24rpx; padding: 16rpx; }
.todo-text { font-size: calc(28rpx * var(--scale)); color: $primary-color; }
.add-card { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12rpx; width: 300rpx; }
.add-text { font-size: 28rpx; color: $text-main; }

.arrow-right-gray {
  font-family: monospace;
  color: #C7C7CC;
  font-size: 32rpx;
  font-weight: bold;
}

/* 家庭列表 */
.section-card { background: #fff; border-radius: 32rpx; padding: 32rpx; margin-bottom: 32rpx; }

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 700;
  color: $text-main;
}

.manage-btn {
  font-size: 26rpx;
  color: $primary-color;
}

.add-circle { width: 88rpx; height: 88rpx; border-radius: 50%; background: #F2F2F7; display: flex; justify-content: center; align-items: center; color: #C7C7CC; font-size: 40rpx; font-weight: 300; }
.health-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24rpx; }
.health-item { background: #F9FAFB; border-radius: 24rpx; padding: 24rpx; }
.health-label { font-size: calc(26rpx * var(--scale)); color: $text-sub; }
.health-value { margin-top: 8rpx; font-size: calc(30rpx * var(--scale)); color: $text-main; }

/* 菜单列表 */
.menu-list {
  background: #fff;
  border-radius: 32rpx;
  overflow: hidden;
  margin-bottom: 32rpx;
}

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx;
  border-bottom: 1rpx solid #F2F2F7;
}

.menu-item:last-child {
  border-bottom: none;
}

.item-left {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.menu-icon-box {
  width: 64rpx;
  height: 64rpx;
  border-radius: 16rpx;
  display: flex;
  justify-content: center;
  align-items: center;
}

.box-blue { background: #E5F1FF; color: #007AFF; }
.box-orange { background: #FFF5E5; color: #FF9500; }
.box-green { background: #E8FCEF; color: #30D158; }
.box-purple { background: #F7E5FF; color: #AF52DE; }

.menu-icon {
  width: 32rpx;
  height: 32rpx;
}

.item-text { font-size: calc(30rpx * var(--scale)); color: $text-main; font-weight: 500; }

.version-info {
  text-align: center;
  font-size: 24rpx;
  color: #C7C7CC;
  margin-bottom: 40rpx;
}

/* Icons */
.icon-bg-heart {
    background-color: $primary-color;
    mask-image: url("/icons/heart.svg");
    -webkit-mask-image: url("/icons/heart.svg");
    mask-size: contain; -webkit-mask-size: contain; mask-repeat: no-repeat; -webkit-mask-repeat: no-repeat; mask-position: center; -webkit-mask-position: center;
}
.icon-bg-eye {
    background-color: #FF9500;
    mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiI+PHBhdGggZD0iTTEgMTJzNC04IDExLTggMTEgOCAxMSA4LTQtOC0xMS04LTExIDgtMTEgOHoiLz48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIzIi8+PC9zdmc+");
    -webkit-mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiI+PHBhdGggZD0iTTEgMTJzNC04IDExLTggMTEgOCAxMSA4LTQtOC0xMS04LTExIDgtMTEgOHoiLz48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIzIi8+PC9zdmc+");
    mask-size: contain; -webkit-mask-size: contain; mask-repeat: no-repeat; -webkit-mask-repeat: no-repeat; mask-position: center; -webkit-mask-position: center;
}
.icon-bg-export {
    background-color: #30D158;
    mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiI+PHBhdGggZD0iTTIxIDE1djRhMiAyIDAgMCAxLTIgMmgtNCIvPjxwb2x5bGluZSBwb2ludHM9IjcgMTAgMTIgMTUgMTcgMTAiLz48bGluZSB4MT0iMTIiIHkxPSIxNSIgeDI9IjEyIiB5Mj0iMyIvPjwvc3ZnPg==");
    -webkit-mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiI+PHBhdGggZD0iTTIxIDE1djRhMiAyIDAgMCAxLTIgMmgtNCIvPjxwb2x5bGluZSBwb2ludHM9IjcgMTAgMTIgMTUgMTcgMTAiLz48bGluZSB4MT0iMTIiIHkxPSIxNSIgeDI9IjEyIiB5Mj0iMyIvPjwvc3ZnPg==");
    mask-size: contain; -webkit-mask-size: contain; mask-repeat: no-repeat; -webkit-mask-repeat: no-repeat; mask-position: center; -webkit-mask-position: center;
}
.icon-bg-bell {
    background-color: #AF52DE;
    mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiI+PHBhdGggZD0iTTE4IDhBNiA2IDAgMCAwIDYgOGMwIDctMyA5LTMgOWgxOHMtMy0yLTMtOU0xMy43MyAyMWEyIDIgMCAwIDEtMy40NiAwIi8+PC9zdmc+");
    -webkit-mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiI+PHBhdGggZD0iTTE4IDhBNiA2IDAgMCAwIDYgOGMwIDctMyA5LTMgOWgxOHMtMy0yLTMtOU0xMy43MyAyMWEyIDIgMCAwIDEtMy40NiAwIi8+PC9zdmc+");
    mask-size: contain; -webkit-mask-size: contain; mask-repeat: no-repeat; -webkit-mask-repeat: no-repeat; mask-position: center; -webkit-mask-position: center;
}

.safe-area-spacer {
  height: 180rpx;
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
