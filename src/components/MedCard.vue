<template>
  <view 
    class="med-card" 
    :class="['slot-' + (item.slot || 'morning'), { checked: item.checked }]"
  >
    <view class="med-left">
      <view class="med-icon-bg">
        <view class="med-icon icon-bg-med"></view>
      </view>
      <view class="med-info">
        <text class="med-name">{{ item.name }}</text>
        <text class="med-desc">{{ item.desc }}</text>
      </view>
    </view>
    <view class="check-btn" @click.stop="handleCheck">
      <view v-if="item.checked" class="check-icon icon-bg-check"></view>
      <view v-else class="check-icon-placeholder icon-bg-check-gray"></view>
    </view>
  </view>
</template>

<script setup>
const props = defineProps({
  item: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['check']);

const handleCheck = () => {
  emit('check');
};
</script>

<style lang="scss" scoped>
.med-card {
  background: $bg-card;
  padding: $spacing-lg;
  border-radius: $radius-lg;
  @include flex-between-center;
  box-shadow: $shadow-sm;
  transition: transform 0.15s ease, background 0.2s ease, border-color 0.2s ease;
  border: 2rpx solid rgba(0,0,0,0.04);
  position: relative;
}

.med-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 8rpx;
  border-top-left-radius: $radius-lg;
  border-bottom-left-radius: $radius-lg;
  background: var(--accent-color, #0a84ff);
}

.med-card.checked {
  background: #F5F6F8;
  border-color: #E5E6EA;
  transform: translateY(-2rpx);
  --accent-color: #E5E5EA;
}

.med-card.checked .med-name,
.med-card.checked .med-desc {
  color: #9A9AA1;
}

.med-left {
  display: flex;
  gap: $spacing-lg;
  align-items: center;
}

.med-icon-bg {
  width: 80rpx;
  height: 80rpx;
  border-radius: 22rpx;
  @include flex-center;
  box-shadow: inset 0 0 0 2rpx rgba(0,0,0,0.03);
  background: var(--icon-bg, $primary-light);
}

.med-icon {
  width: 36rpx;
  height: 36rpx;
}
.icon-bg-med {
    background-color: $primary-color;
    mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiI+PHBhdGggZD0iTTEwLjUgMjAuNWwxMC0xMGE0Ljk1IDQuOTUgMCAxIDAtNy03bC0xMCAxMGE0Ljk1IDQuOTUgMCAxIDAtNyA3eiIvPjxwYXRoIGQ9Ik04LjUgOC41bDcgNyIvPjwvc3ZnPg==");
    -webkit-mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiI+PHBhdGggZD0iTTEwLjUgMjAuNWwxMC0xMGE0Ljk1IDQuOTUgMCAxIDAtNy03bC0xMCAxMGE0Ljk1IDQuOTUgMCAxIDAtNyA3eiIvPjxwYXRoIGQ9Ik04LjUgOC41bDcgNyIvPjwvc3ZnPg==");
    mask-size: contain; -webkit-mask-size: contain; mask-repeat: no-repeat; -webkit-mask-repeat: no-repeat; mask-position: center; -webkit-mask-position: center;
}

.med-info {
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;
}

.med-name {
  font-size: $font-size-lg;
  font-weight: 600;
  color: $text-main;
}

.med-desc {
  font-size: $font-size-sm;
  color: $text-sub;
}

.med-card.checked .med-icon-bg { --icon-bg: #F0F0F3; }
.med-card.checked .icon-bg-med { background-color: #B0B0B5; }

.check-btn {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  border: 4rpx solid #eee;
  @include flex-center;
  background: #fff;
  transition: background 0.2s ease, border-color 0.2s ease, transform 0.15s ease;
}

.check-btn:active {
  transform: scale(0.9);
}

.med-card.checked .check-btn {
  background: $success-color;
  border-color: $success-color;
  transform: scale(1.05);
}

.check-icon {
  width: 32rpx;
  height: 32rpx;
}
.icon-bg-check {
    background-color: #fff;
    mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMyI+PHBvbHlsaW5lIHBvaW50cz0iMjAgNiA5IDE3IDQgMTIiLz48L3N2Zz4=");
    -webkit-mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMyI+PHBvbHlsaW5lIHBvaW50cz0iMjAgNiA5IDE3IDQgMTIiLz48L3N2Zz4=");
    mask-size: contain; -webkit-mask-size: contain; mask-repeat: no-repeat; -webkit-mask-repeat: no-repeat; mask-position: center; -webkit-mask-position: center;
}

.check-icon-placeholder {
    width: 32rpx;
    height: 32rpx;
    opacity: 0;
}
.icon-bg-check-gray {
    background-color: #ddd;
    mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiI+PHBvbHlsaW5lIHBvaW50cz0iMjAgNiA5IDE3IDQgMTIiIG9wYWNpdHk9IjAiLz48L3N2Zz4=");
    -webkit-mask-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiI+PHBvbHlsaW5lIHBvaW50cz0iMjAgNiA5IDE3IDQgMTIiIG9wYWNpdHk9IjAiLz48L3N2Zz4=");
    mask-size: contain; -webkit-mask-size: contain; mask-repeat: no-repeat; -webkit-mask-repeat: no-repeat; mask-position: center; -webkit-mask-position: center;
}

/* 时段配色 */
.slot-morning { --accent-color: #FFCC00; }
.slot-noon { --accent-color: #0A84FF; }
.slot-evening { --accent-color: #AF52DE; }
.slot-morning::before { background: #FFCC00; }
.slot-noon::before { background: #0A84FF; }
.slot-evening::before { background: #AF52DE; }
.slot-morning .med-icon-bg { --icon-bg: #FFF5CC; }
.slot-noon .med-icon-bg { --icon-bg: #E6F2FF; }
.slot-evening .med-icon-bg { --icon-bg: #F3E8FF; }
</style>
