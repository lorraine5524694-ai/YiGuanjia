<template>
  <view class="container">
    <TopSafeArea />
    <view class="header">
      <text class="h1">家庭成员管理</text>
      <view class="add-btn-header" @click="openModal()">
        <text class="add-icon">+</text>
      </view>
    </view>
    
    <scroll-view scroll-y class="scroll-content">
      <view class="list">
        <view class="member-card" v-for="m in members" :key="m.id" @click="editMember(m)">
          <view class="card-main">
            <image class="avatar" :src="m.avatar" mode="aspectFill"></image>
            <view class="info">
              <view class="top-row">
                <text class="name">{{ m.name }}</text>
                <text class="relation-tag">{{ m.relation || '亲友' }}</text>
                <text v-if="m.id === activeId" class="current-tag">当前就诊人</text>
              </view>
              <view class="detail-row">
                <text class="detail-item">{{ getGenderText(m.gender) }}</text>
                <text class="divider" v-if="m.gender">|</text>
                <text class="detail-item">{{ getAge(m.birthday) }}</text>
                <text class="divider" v-if="m.birthday">|</text>
                <text class="detail-item" v-if="m.height">{{ m.height }}cm</text>
                <text class="divider" v-if="m.height">|</text>
                <text class="detail-item" v-if="m.weight">{{ m.weight }}kg</text>
              </view>
            </view>
            <view class="arrow-icon">></view>
          </view>
          
          <view class="health-tags" v-if="m.health && (m.health.allergies || m.health.chronic)">
            <view class="tag warning" v-if="m.health.allergies">
              <text class="tag-label">过敏:</text>
              <text class="tag-val">{{ m.health.allergies }}</text>
            </view>
            <view class="tag danger" v-if="m.health.chronic">
              <text class="tag-label">慢病:</text>
              <text class="tag-val">{{ m.health.chronic }}</text>
            </view>
          </view>
          
          <view class="card-actions" @click.stop>
             <button v-if="m.id !== activeId" class="action-btn primary" size="mini" @click="setActive(m.id)">设为当前</button>
             <button class="action-btn danger" size="mini" @click="removeMember(m.id)">删除</button>
          </view>
        </view>
        
        <!-- Empty State -->
        <view v-if="members.length === 0" class="empty-state" @click="openModal()">
          <text class="empty-text">暂无家庭成员，点击添加</text>
        </view>
      </view>
      <view class="safe-area-spacer"></view>
    </scroll-view>

    <!-- Floating Add Button (Optional, if header button is not enough) -->
    <view class="fab" @click="openModal()">
      <text class="fab-icon">+</text>
      <text class="fab-text">添加成员</text>
    </view>

    <!-- Edit/Add Modal -->
    <view class="modal-mask" v-if="showModal" @click="closeModal">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">{{ editingId ? '编辑成员' : '添加成员' }}</text>
          <text class="close-btn" @click="closeModal">×</text>
        </view>
        
        <scroll-view scroll-y class="modal-body">
          <view class="form-group">
            <text class="group-title">基本信息</text>
            <view class="form-row">
              <text class="label">姓名</text>
              <input class="input" v-model="form.name" placeholder="请输入姓名" placeholder-class="placeholder" />
            </view>
            <view class="form-row">
              <text class="label">关系</text>
              <picker :range="relations" @change="onPickRelation" class="picker-box">
                <view class="picker-text" :class="{ empty: !form.relation }">{{ form.relation || '请选择关系' }}</view>
              </picker>
            </view>
            <view class="form-row">
              <text class="label">性别</text>
              <view class="radio-group">
                <view class="radio-item" :class="{ active: form.gender === '1' }" @click="form.gender = '1'">男</view>
                <view class="radio-item" :class="{ active: form.gender === '2' }" @click="form.gender = '2'">女</view>
              </view>
            </view>
            <view class="form-row">
              <text class="label">出生日期</text>
              <picker mode="date" :value="form.birthday" @change="onPickBirthday" class="picker-box">
                <view class="picker-text" :class="{ empty: !form.birthday }">{{ form.birthday || '请选择出生日期' }}</view>
              </picker>
            </view>
          </view>

          <view class="form-group">
            <text class="group-title">身体指标</text>
            <view class="form-row-multi">
              <view class="half-row">
                <text class="label">身高(cm)</text>
                <input class="input" type="digit" v-model="form.height" placeholder="0" />
              </view>
              <view class="half-row">
                <text class="label">体重(kg)</text>
                <input class="input" type="digit" v-model="form.weight" placeholder="0" />
              </view>
            </view>
            <view class="form-row">
              <text class="label">血型</text>
              <picker :range="bloodTypes" @change="onPickBlood" class="picker-box">
                <view class="picker-text" :class="{ empty: !form.health.bloodType }">{{ form.health.bloodType || '请选择血型' }}</view>
              </picker>
            </view>
          </view>

          <view class="form-group">
            <text class="group-title">健康档案</text>
            <view class="form-col">
              <text class="label">过敏史</text>
              <input class="input full-width" v-model="form.health.allergies" placeholder="无过敏史可不填" />
            </view>
            <view class="form-col">
              <text class="label">慢病史</text>
              <input class="input full-width" v-model="form.health.chronic" placeholder="无慢病史可不填" />
            </view>
          </view>
        </scroll-view>

        <view class="modal-footer">
          <button class="submit-btn" @click="submit">保存</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import TopSafeArea from '@/components/TopSafeArea.vue';

const members = ref([]);
const activeId = ref('');
const showModal = ref(false);
const editingId = ref('');

const relations = ['本人', '父母', '配偶', '子女', '其他亲友'];
const bloodTypes = ['A型', 'B型', 'AB型', 'O型', '未知'];

// Form State
const form = reactive({
  id: '',
  name: '',
  relation: '',
  gender: '', // 1: Male, 2: Female
  birthday: '',
  height: '',
  weight: '',
  avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100&h=100',
  health: {
    bloodType: '',
    allergies: '',
    chronic: ''
  }
});

const load = () => {
  const saved = uni.getStorageSync('mm_family_members') || [];
  // Initialize with default data if empty
  if (saved.length === 0) {
    members.value = [{
      id: 'self',
      name: '我自己',
      relation: '本人',
      gender: '1',
      birthday: '1990-01-01',
      height: '175',
      weight: '70',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100&h=100',
      health: { bloodType: 'O型', allergies: '', chronic: '' }
    }];
    save();
  } else {
    members.value = saved;
  }
  
  activeId.value = uni.getStorageSync('mm_active_member_id') || members.value[0]?.id;
};

const save = () => {
  uni.setStorageSync('mm_family_members', members.value);
};

const setActive = (id) => {
  activeId.value = id;
  uni.setStorageSync('mm_active_member_id', id);
  uni.showToast({ title: '已切换当前就诊人', icon: 'none' });
};

// Helpers
const getGenderText = (val) => val === '1' ? '男' : (val === '2' ? '女' : '');
const getAge = (birthday) => {
  if (!birthday) return '年龄未知';
  const ageDifMs = Date.now() - new Date(birthday).getTime();
  const ageDate = new Date(ageDifMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970) + '岁';
};

// Modal & Form Handlers
const openModal = () => {
  resetForm();
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  setTimeout(resetForm, 200); // Clear after transition
};

const editMember = (m) => {
  editingId.value = m.id;
  // Deep copy to avoid direct mutation
  const data = JSON.parse(JSON.stringify(m));
  Object.assign(form, data);
  // Ensure health object exists
  if (!form.health) form.health = { bloodType: '', allergies: '', chronic: '' };
  showModal.value = true;
};

const resetForm = () => {
  editingId.value = '';
  Object.assign(form, {
    id: '',
    name: '',
    relation: '',
    gender: '',
    birthday: '',
    height: '',
    weight: '',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100&h=100',
    health: { bloodType: '', allergies: '', chronic: '' }
  });
};

const onPickRelation = (e) => { form.relation = relations[e.detail.value]; };
const onPickBlood = (e) => { form.health.bloodType = bloodTypes[e.detail.value]; };
const onPickBirthday = (e) => { form.birthday = e.detail.value; };

const submit = () => {
  if (!form.name) { uni.showToast({ title: '请输入姓名', icon: 'none' }); return; }
  if (!form.relation) { uni.showToast({ title: '请选择关系', icon: 'none' }); return; }

  if (editingId.value) {
    const idx = members.value.findIndex(i => i.id === editingId.value);
    if (idx > -1) {
      members.value[idx] = JSON.parse(JSON.stringify(form));
    }
    uni.showToast({ title: '已保存', icon: 'none' });
  } else {
    const id = 'm_' + Date.now();
    members.value.push({ ...JSON.parse(JSON.stringify(form)), id });
    uni.showToast({ title: '已添加', icon: 'none' });
  }
  save();
  closeModal();
};

const removeMember = (id) => {
  uni.showModal({
    title: '确认删除',
    content: '删除后无法恢复，确认要删除该成员吗？',
    confirmColor: '#FF3B30',
    success: (res) => {
      if (res.confirm) {
        members.value = members.value.filter(i => i.id !== id);
        if (activeId.value === id && members.value.length) {
          activeId.value = members.value[0].id;
          uni.setStorageSync('mm_active_member_id', activeId.value);
        }
        save();
        uni.showToast({ title: '已删除', icon: 'none' });
      }
    }
  });
};

onMounted(load);
</script>

<style lang="scss">
$primary: #0A84FF;
$danger: #FF3B30;
$warning: #FF9500;
$bg: #F2F2F7;
$card-bg: #FFFFFF;
$text-main: #000000;
$text-sub: #8E8E93;
$border: #E5E5EA;

.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: $bg;
  font-family: -apple-system, BlinkMacSystemFont, "San Francisco", Helvetica, Arial, sans-serif;
}

.header {
  padding: 20rpx 32rpx;
  background: $bg;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.h1 {
  font-size: 48rpx;
  font-weight: 800;
  color: $text-main;
}

.add-btn-header {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.05);
  
  .add-icon {
    font-size: 40rpx;
    color: $primary;
    line-height: 1;
    margin-top: -4rpx;
  }
}

.scroll-content {
  flex: 1;
  padding: 0 32rpx;
  box-sizing: border-box;
  overflow-y: auto;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  padding-bottom: 200rpx; /* Space for FAB */
}

.member-card {
  background: $card-bg;
  border-radius: 32rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.02);
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  transition: transform 0.1s;
  
  &:active {
    transform: scale(0.99);
  }
}

.card-main {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.avatar {
  width: 112rpx;
  height: 112rpx;
  border-radius: 50%;
  border: 4rpx solid #fff;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1);
}

.info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.top-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12rpx;
}

.name {
  font-size: 36rpx;
  font-weight: 700;
  color: $text-main;
}

.relation-tag {
  font-size: 22rpx;
  padding: 4rpx 12rpx;
  background: #E5E5EA;
  color: $text-sub;
  border-radius: 8rpx;
  font-weight: 500;
}

.current-tag {
  font-size: 22rpx;
  padding: 4rpx 12rpx;
  background: rgba(10, 132, 255, 0.1);
  color: $primary;
  border-radius: 8rpx;
  font-weight: 600;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.detail-item {
  font-size: 26rpx;
  color: $text-sub;
}

.divider {
  font-size: 20rpx;
  color: #D1D1D6;
}

.arrow-icon {
  font-size: 32rpx;
  color: #C7C7CC;
}

.health-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  padding-top: 16rpx;
  border-top: 1rpx solid #F2F2F7;
}

.tag {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 8rpx 16rpx;
  border-radius: 12rpx;
  font-size: 24rpx;
  
  &.warning {
    background: rgba(255, 149, 0, 0.1);
    color: $warning;
  }
  
  &.danger {
    background: rgba(255, 59, 48, 0.1);
    color: $danger;
  }
  
  .tag-label {
    font-weight: 600;
    opacity: 0.8;
  }
}

.card-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16rpx;
  margin-top: 8rpx;
}

.action-btn {
  margin: 0;
  font-size: 24rpx;
  padding: 0 24rpx;
  height: 56rpx;
  line-height: 56rpx;
  border-radius: 28rpx;
  
  &.primary {
    background: $primary;
    color: #fff;
  }
  
  &.danger {
    background: #fff;
    color: $danger;
    border: 1rpx solid rgba(255, 59, 48, 0.3);
  }
}

/* FAB */
.fab {
  position: fixed;
  bottom: 64rpx;
  left: 50%;
  transform: translateX(-50%);
  background: $primary;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 24rpx 48rpx;
  border-radius: 100rpx;
  box-shadow: 0 8rpx 24rpx rgba(10, 132, 255, 0.3);
  z-index: 100;
  
  &:active {
    transform: translateX(-50%) scale(0.96);
  }
  
  .fab-icon {
    font-size: 40rpx;
    font-weight: 300;
    margin-top: -4rpx;
  }
  
  .fab-text {
    font-size: 32rpx;
    font-weight: 600;
  }
}

/* Modal */
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.4);
  z-index: 999;
  display: flex;
  align-items: flex-end;
  backdrop-filter: blur(4px);
}

.modal-content {
  width: 100%;
  height: 85vh;
  background: #fff;
  border-radius: 40rpx 40rpx 0 0;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease-out;
  overflow: hidden;
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.modal-header {
  padding: 32rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1rpx solid #F2F2F7;
  flex-shrink: 0;
}

.modal-title {
  font-size: 34rpx;
  font-weight: 700;
  color: $text-main;
}

.close-btn {
  font-size: 48rpx;
  color: $text-sub;
  padding: 10rpx;
  line-height: 0.8;
}

.modal-body {
  flex: 1;
  padding: 32rpx;
  box-sizing: border-box;
  min-height: 0;
  overflow-y: auto;
}

.form-group {
  margin-bottom: 48rpx;
}

.group-title {
  font-size: 28rpx;
  color: $text-sub;
  margin-bottom: 24rpx;
  display: block;
  font-weight: 600;
}

.form-row {
  display: flex;
  align-items: center;
  margin-bottom: 32rpx;
  
  .label {
    width: 160rpx;
    font-size: 30rpx;
    color: $text-main;
  }
}

.form-row-multi {
  display: flex;
  gap: 32rpx;
  margin-bottom: 32rpx;
  
  .half-row {
    flex: 1;
    display: flex;
    align-items: center;
    
    .label {
      font-size: 28rpx;
      margin-right: 16rpx;
      color: $text-main;
    }
    
    .input {
      flex: 1;
      min-width: 0;
    }
  }
}

.form-col {
  margin-bottom: 32rpx;
  
  .label {
    display: block;
    font-size: 30rpx;
    color: $text-main;
    margin-bottom: 16rpx;
  }
}

.input {
  flex: 1;
  height: 88rpx;
  background: #F2F2F7;
  border-radius: 20rpx;
  padding: 0 24rpx;
  font-size: 30rpx;
  color: $text-main;
  
  &.full-width {
    width: 100%;
    box-sizing: border-box;
  }
}

.picker-box {
  flex: 1;
}

.picker-text {
  height: 88rpx;
  line-height: 88rpx;
  background: #F2F2F7;
  border-radius: 20rpx;
  padding: 0 24rpx;
  font-size: 30rpx;
  color: $text-main;
  
  &.empty {
    color: #C7C7CC;
  }
}

.radio-group {
  flex: 1;
  display: flex;
  gap: 24rpx;
}

.radio-item {
  flex: 1;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F2F2F7;
  border-radius: 20rpx;
  font-size: 30rpx;
  color: $text-sub;
  font-weight: 500;
  border: 2rpx solid transparent;
  
  &.active {
    background: rgba(10, 132, 255, 0.1);
    color: $primary;
    border-color: $primary;
  }
}

.modal-footer {
  padding: 32rpx;
  border-top: 1rpx solid #F2F2F7;
  padding-bottom: calc(32rpx + env(safe-area-inset-bottom));
  flex-shrink: 0;
}

.submit-btn {
  background: $primary;
  color: #fff;
  height: 96rpx;
  line-height: 96rpx;
  border-radius: 48rpx;
  font-size: 34rpx;
  font-weight: 600;
  
  &:active {
    opacity: 0.9;
  }
}

.safe-area-spacer {
  height: 180rpx;
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
