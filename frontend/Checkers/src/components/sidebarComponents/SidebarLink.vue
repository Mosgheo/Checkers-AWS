<template>
  <router-link @click="buttonClick" :to="to" class="self-center link rounded-lg flex" :class="{ active: isActive }">
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

var button_click = new Audio(require("@/assets/sounds/button-click.wav"))

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
  },
  methods: {
    buttonClick() {
      button_click.play()
    }
  }
}
</script>

<style scoped>
button {
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
  font-style: italic;
  font-weight: 700;
}
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