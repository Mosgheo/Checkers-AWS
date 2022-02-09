<template>
  <router-link @click="buttonClick" :to="to" class="this.to self-center link rounded-lg flex" :class="{ active: isActive }">
    <i class="icon" :class="icon" />
    <button class="btn btn-ghost"><slot /></button>
  </router-link>
</template>

<script>
import { computed, getCurrentInstance } from 'vue'
import { useRoute } from 'vue-router'

var appInstance = null

export default {
  props: {
    to: { type: String, required: true },
    icon: { type: String, required: true },
    click: { type: String, required: false }
  },
  setup(props) {
    appInstance = getCurrentInstance().appContext.config.globalProperties
    const route = useRoute()
    const isActive = computed(() => route.path === props.to)
    return { isActive }
  },
  methods: {
    buttonClick() {
      appInstance.$BUTTON_CLICK.play()
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

@media only screen and (max-width: 1200px) { 
  .btn {
    visibility: hidden;
    width: 0;
  }
  .icon {
    width: 1.3rem;
    height: 1.3rem;
  }
}

@media only screen and (max-width: 785px) {
  .btn {
    visibility: visible;
    width: auto;
  }
  .login button, .indicator button {
    display: none;
  }
  .icon {
    width: 2rem;
    height: 2rem;
  }
}
</style>