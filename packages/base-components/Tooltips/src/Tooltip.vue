<!--
 * @Description:
 * @Version: 1.0
 * @Author: 小国际
 * @Date: 2023-11-12 21:10:55
 * @LastEditors: 小国际
 * @LastEditTime: 2023-12-04 22:47:46
-->
<template>
  <div ref="tooltipRef" class="xs-tooltip">
    <div ref="triggerRef" class="xs-tooltip_trigger" v-on="events">
      <slot></slot>
    </div>
    <Transition :name="transition">
      <div v-if="isOpen" ref="popperRef" class="xs-tooltip__popper">
        <slot name="content">{{ content }}</slot>
        <div id="arrow" data-popper-arrow></div>
      </div>
    </Transition>
  </div>
</template>

<script lang="ts" setup>
import { createPopper, Instance } from "@popperjs/core"
import { debounce } from "lodash"
import { computed, onUnmounted, reactive, ref, watch } from "vue"
import type { ToolTipEmit, TooltipInstance, TooltipProps } from "./type"
import { useClickOutside } from "@element-plus-plus/utils"

defineOptions({
  name: "XsTooltip"
})
const props = withDefaults(defineProps<TooltipProps>(), {
  placement: "bottom",
  trigger: "hover",
  openDelay: 0,
  closeDelay: 0
})
const emit = defineEmits<ToolTipEmit>()
const triggerRef = ref<HTMLElement>()
const popperRef = ref<HTMLElement>()
const tooltipRef = ref<HTMLElement>()
const popperOptions = computed(() => {
  return {
    placement: props.placement,
    modifiers: [
      {
        name: "offset",
        options: {
          offset: [0, 9]
        }
      }
    ],
    ...props.popperOptions
  }
})
useClickOutside(tooltipRef, () => {
  if (props.trigger === "click" && isOpen.value && !props.manual) {
    close()
  }
  if (isOpen.value) {
    emit("click-outside", true)
  }
})
const isOpen = ref(false)

let popperInstance: Instance | null = null
/* 动态绑定事件 */
let events: Record<string, any> = reactive({})
/* 定义鼠标trigger事件所触发函数：
togglePopper:trigger为click时所触发的函数
open:hover时mouseenter,mouseleave所触发的函数
*/
const debounceOpen = debounce(() => {
  setTimeout(() => {
    isOpen.value = true
    emit("visible-change", true)
  }, props.openDelay)
}, props.openDelay)
const debounceClose = debounce(() => {
  setTimeout(() => {
    isOpen.value = false
    emit("visible-change", false)
  }, props.closeDelay)
}, props.closeDelay)

const open = () => {
  debounceClose.cancel()
  debounceOpen()
}
const close = () => {
  debounceOpen.cancel()
  debounceClose()
}
const togglePopper = () => {
  if (isOpen.value) {
    close()
  } else {
    open()
  }
}
const bindEvent = () => {
  if (props.trigger === "hover") {
    events["mouseenter"] = open
    events["mouseleave"] = close
  } else if (props.trigger === "click") {
    events["click"] = togglePopper
  }
}
bindEvent()

watch(
  isOpen,
  () => {
    if (triggerRef.value && popperRef.value) {
      popperInstance = createPopper(
        triggerRef.value,
        popperRef.value,
        popperOptions.value
      )
    } else {
      popperInstance?.destroy()
    }
  },
  { flush: "post" }
)
watch(
  () => props.trigger,
  (newVal, oldVal) => {
    if (newVal !== oldVal) {
      //清空对应的绑定事件
      events = {}
      bindEvent()
    }
  }
)

onUnmounted(() => {
  popperInstance?.destroy()
})

defineExpose<TooltipInstance>({
  show: open,
  hide: close
})
</script>

<style lang="scss" scoped>
.xs-tooltip {
  --xs-popover-bg-color: var(--xs-bg-color-overlay);
  --xs-popover-font-size: var(--xs-font-size-base);
  --xs-popover-border-color: var(--xs-border-color);
  --xs-popover-padding: 6px;
  --xs-popover-border-radius: 4px;

  display: inline-block;
}

.xs-tooltip {
  .xs-tooltip__popper {
    z-index: 1000;
    box-sizing: border-box;
    padding: var(--xs-popover-padding);
    font-size: var(--xs-popover-font-size);
    line-height: 1.4;
    color: var(--xs-text-color-regular);
    text-align: justify;
    word-break: break-all;
    background: var(--xs-popover-bg-color);
    border: 1px solid var(--xs-popover-border-color);
    border-radius: var(--xs-popover-border-radius);
    box-shadow: var(--xs-box-shadow-light);

    #arrow,
    #arrow::before {
      position: absolute;
      box-sizing: border-box;
      width: 8px;
      height: 8px;
      background: var(--xs-popover-bg-color);
    }

    #arrow {
      visibility: hidden;
    }

    #arrow::before {
      visibility: visible;
      content: "";
      transform: rotate(45deg);
    }

    &[data-popper-placement^="top"] > #arrow {
      bottom: -5px;
    }

    &[data-popper-placement^="bottom"] > #arrow {
      top: -5px;
    }

    &[data-popper-placement^="left"] > #arrow {
      right: -5px;
    }

    &[data-popper-placement^="right"] > #arrow {
      left: -5px;
    }

    &[data-popper-placement^="top"] > #arrow::before {
      border-right: 1px solid var(--xs-popover-border-color);
      border-bottom: 1px solid var(--xs-popover-border-color);
    }

    &[data-popper-placement^="bottom"] > #arrow::before {
      border-top: 1px solid var(--xs-popover-border-color);
      border-left: 1px solid var(--xs-popover-border-color);
    }

    &[data-popper-placement^="left"] > #arrow::before {
      border-top: 1px solid var(--xs-popover-border-color);
      border-right: 1px solid var(--xs-popover-border-color);
    }

    &[data-popper-placement^="right"] > #arrow::before {
      border-bottom: 1px solid var(--xs-popover-border-color);
      border-left: 1px solid var(--xs-popover-border-color);
    }
  }

  .fade-enter-active,
  .fade-leave-active {
    transition: opacity var(--xs-transition-duration);
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
}
</style>
