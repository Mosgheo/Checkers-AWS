<template>
  <router-link :to="to" class="self-center link rounded-lg flex" :class="{ active: isActive }">
    <i class="icon" :class="icon" />
    <button class="btn btn-ghost"><slot /></button> 
    <!--<transition name="fade">
      <span v-if="!collapsed">
        <slot />
      </span>
    </transition>-->
  </router-link>
</template>

<script>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { collapsed } from './state'

export default {
  props: {
    to: { type: String, required: true },
    icon: { type: String, required: true },
    click: { type: String, required: false }
  },
  setup(props) {
    const route = useRoute()
    const isActive = computed(() => route.path === props.to)
    return { isActive, collapsed }
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.1s;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
}

.link {
  align-items: center;
  color: #CDCBCB;
  text-decoration: none;
  transition: 0.2s;
}

button:hover {
  background-color: transparent;
}

.link:hover {
  background-color: var(--sidebar-item-hover);
}

.link.active {
  background-color: var(--sidebar-item-active);
}

.link .icon {
  width: 25px;
  margin-right: 10px;
}
</style>