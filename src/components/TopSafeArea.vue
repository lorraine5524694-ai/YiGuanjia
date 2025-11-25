<template>
  <view class="top-safe-area" :style="style"></view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const heightPx = ref(0)

onMounted(() => {
  try {
    const sys = uni.getSystemInfoSync()
    const statusBarHeight = sys?.statusBarHeight || 0
    const rect = typeof uni.getMenuButtonBoundingClientRect === 'function' ? uni.getMenuButtonBoundingClientRect() : null
    if (rect && statusBarHeight) {
      const padding = rect.top - statusBarHeight
      heightPx.value = statusBarHeight + rect.height + padding * 2
    } else if (statusBarHeight) {
      heightPx.value = statusBarHeight
    }
    const isH5 = typeof window !== 'undefined'
    if (isH5 && import.meta.env.DEV && !heightPx.value) {
      heightPx.value = 24
    }
  } catch (e) {
    const isH5 = typeof window !== 'undefined'
    heightPx.value = isH5 && import.meta.env.DEV ? 24 : 0
  }
})

const style = computed(() => (heightPx.value > 0 ? { height: heightPx.value + 'px' } : {}))
</script>

<style lang="scss">
.top-safe-area {
  width: 100%;
  flex-shrink: 0;
  height: constant(safe-area-inset-top);
  height: env(safe-area-inset-top);
}
</style>
