<template>
  <view class="container">
    <TopSafeArea />
    <view class="header">
      <text class="h1">家庭成员管理</text>
    </view>
    <scroll-view scroll-y class="scroll-content">
      <view class="section-card">
        <view class="list">
          <view class="item" v-for="m in members" :key="m.id">
            <image class="avatar" :src="m.avatar" mode="aspectFill"></image>
            <view class="meta">
              <view class="name-row">
                <text class="name">{{ m.name }}</text>
                <text v-if="m.id===activeId" class="tag">当前</text>
              </view>
              <text class="sub">{{ m.relation || '本人' }} · {{ m.age? m.age+'岁':'未填年龄' }}</text>
              <text class="sub">血型：{{ m.health?.bloodType || '未填写' }}</text>
            </view>
            <view class="ops">
              <button v-if="m.id!==activeId" size="mini" type="primary" plain @click="setActive(m.id)">设为当前</button>
              <button size="mini" @click="editMember(m)">编辑</button>
              <button size="mini" type="warn" plain @click="removeMember(m.id)">删除</button>
            </view>
          </view>
        </view>
      </view>

      <view class="section-card">
        <view class="form">
          <view class="row">
            <text class="label">姓名</text>
            <input class="input" v-model="form.name" placeholder="请输入" />
          </view>
          <view class="row">
            <text class="label">关系</text>
            <picker :range="relations" @change="onPickRelation">
              <view class="picker">{{ form.relation || '请选择' }}</view>
            </picker>
          </view>
          <view class="row">
            <text class="label">年龄</text>
            <input class="input" type="number" v-model="form.age" placeholder="请输入" />
          </view>
          <view class="row">
            <text class="label">血型</text>
            <picker :range="bloodTypes" @change="onPickBlood">
              <view class="picker">{{ form.health.bloodType || '请选择' }}</view>
            </picker>
          </view>
          <view class="row">
            <text class="label">过敏史</text>
            <input class="input" v-model="form.health.allergies" placeholder="如 青霉素" />
          </view>
          <view class="row">
            <text class="label">慢病史</text>
            <input class="input" v-model="form.health.chronic" placeholder="如 高血压" />
          </view>
          <view class="actions">
            <button type="primary" @click="submit">{{ editingId? '保存修改':'添加成员' }}</button>
          </view>
        </view>
      </view>
      <view class="safe-area-spacer"></view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import TopSafeArea from '@/components/TopSafeArea.vue';
const members = ref([]);
const activeId = ref('');
const relations = ['本人','父亲','母亲','爷爷','奶奶','配偶','子女'];
const bloodTypes = ['A','B','AB','O'];
const form = reactive({ id: '', name: '', relation: '', age: '', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100&h=100', health: { bloodType: '', allergies: '', chronic: '' } });
const editingId = ref('');
const load = () => {
  const saved = uni.getStorageSync('mm_family_members') || [];
  members.value = saved.length ? saved : [ { id:'self', name:'我自己', relation:'本人', age:'', avatar:'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100&h=100', health:{ bloodType:'', allergies:'', chronic:'' } } ];
  activeId.value = uni.getStorageSync('mm_active_member_id') || members.value[0].id;
};
const save = () => { uni.setStorageSync('mm_family_members', members.value); };
const setActive = id => { activeId.value = id; uni.setStorageSync('mm_active_member_id', id); uni.showToast({ title: '已切换', icon: 'none' }); };
const onPickRelation = e => { form.relation = relations[e.detail.value]; };
const onPickBlood = e => { form.health.bloodType = bloodTypes[e.detail.value]; };
const resetForm = () => { editingId.value=''; Object.assign(form, { id:'', name:'', relation:'', age:'', avatar: form.avatar, health:{ bloodType:'', allergies:'', chronic:'' } }); };
const submit = () => {
  if (!form.name) { uni.showToast({ title: '请输入姓名', icon: 'none' }); return; }
  if (editingId.value) {
    const idx = members.value.findIndex(i=>i.id===editingId.value);
    if (idx>-1) members.value[idx] = { ...members.value[idx], ...form };
    save(); resetForm(); uni.showToast({ title: '已保存', icon: 'none' });
  } else {
    const id = 'm_'+Date.now();
    members.value.push({ ...form, id });
    save(); resetForm(); uni.showToast({ title: '已添加', icon: 'none' });
  }
};
const editMember = m => { editingId.value = m.id; Object.assign(form, JSON.parse(JSON.stringify(m))); };
const removeMember = id => {
  members.value = members.value.filter(i=>i.id!==id);
  if (activeId.value===id && members.value.length) { activeId.value = members.value[0].id; uni.setStorageSync('mm_active_member_id', activeId.value); }
  save();
  uni.showToast({ title: '已删除', icon: 'none' });
};
onMounted(load);
</script>

<style lang="scss">
.container { display: flex; flex-direction: column; height: 100vh; background-color: $bg-body; font-family: -apple-system, BlinkMacSystemFont, "San Francisco", Helvetica, Arial, sans-serif; overflow: hidden; }
.status-bar-placeholder { height: var(--status-bar-height); height: constant(safe-area-inset-top); height: env(safe-area-inset-top); width: 100%; flex-shrink: 0; }
.header { padding: 20rpx 32rpx; background: $bg-body; position: sticky; top: 0; z-index: 10; flex-shrink: 0; }
.h1 { font-size: 40rpx; font-weight: 700; color: $text-main; }
.scroll-content { flex: 1; padding: 0 32rpx; box-sizing: border-box; overflow-y: auto; }
.section-card { background: #fff; border-radius: 32rpx; padding: 32rpx; margin-bottom: 32rpx; }
.list { display: flex; flex-direction: column; gap: 24rpx; }
.item { display: flex; align-items: center; gap: 24rpx; padding: 24rpx; background: #F9FAFB; border-radius: 24rpx; }
.avatar { width: 96rpx; height: 96rpx; border-radius: 50%; border: 4rpx solid #f0f0f0; }
.meta { flex: 1; display: flex; flex-direction: column; gap: 6rpx; }
.name-row { display: flex; align-items: center; gap: 12rpx; }
.name { font-size: 32rpx; font-weight: 600; color: $text-main; }
.tag { padding: 6rpx 12rpx; border-radius: 999rpx; font-size: 22rpx; color: #0A84FF; background: rgba(10,132,255,0.08); }
.sub { font-size: 26rpx; color: $text-sub; }
.ops { margin-left: auto; display: flex; gap: 12rpx; flex-wrap: wrap; align-items: center; }
.form { display: flex; flex-direction: column; gap: 16rpx; }
.row { display: flex; align-items: center; justify-content: space-between; gap: 24rpx; }
.label { width: 200rpx; font-size: 28rpx; color: $text-main; }
.input { flex: 1; background: #F2F2F7; border-radius: 16rpx; padding: 16rpx; font-size: 28rpx; }
.picker { flex: 1; background: #F2F2F7; border-radius: 16rpx; padding: 16rpx; font-size: 28rpx; }
.actions { margin-top: 8rpx; }
.safe-area-spacer { height: 180rpx; padding-bottom: env(safe-area-inset-bottom); }
</style>
