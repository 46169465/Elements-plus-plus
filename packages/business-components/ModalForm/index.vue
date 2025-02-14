<!--
 * new page
 * @author: ZhangXusen
 * @since: 2022-08-09
 * index.vue
-->
<template>
  <div :class="{ scroll: isScroll }">
    <el-dialog v-model="dialogVisible" v-bind="$attrs">
      <template #default>
        <Form
          ref="form"
          :options="options"
          label-width="100px"
          @on-change="onChange"
          @before-upload="beforeUpload"
          @on-preview="onPreview"
          @on-remove="onRemove"
          @before-remove="beforeRemove"
          @on-success="onSuccess"
          @on-exceed="onExceed"
        >
          <template #uploadArea>
            <slot name="uploadArea"></slot>
          </template>
          <template #uploadTip>
            <slot name="uploadTip"></slot>
          </template>
        </Form>
      </template>
      <template #footer>
        <slot :form="form" name="footer"></slot>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { PropType, ref, watch } from "vue"
import { FormInstance, FormOptions } from "../Form/types"
import Form from "../Form/index.vue"

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  options: {
    type: Array as PropType<FormOptions[]>,
    required: true
  },
  onChange: {
    type: Function
  },
  beforeUpload: {
    type: Function
  },
  onPreview: {
    type: Function
  },
  onRemove: {
    type: Function
  },
  beforeRemove: {
    type: Function
  },
  onSuccess: {
    type: Function
  },
  onExceed: {
    type: Function
  },
  isScroll: {
    type: Boolean,
    default: true
  }
})

const emits = defineEmits(["update:visible"])
//Form组件实例
const form = ref<FormInstance | null>()
const dialogVisible = ref<boolean>(props.visible)
watch(
  () => props.visible,
  (newVal) => {
    dialogVisible.value = newVal
  }
)
watch(
  () => dialogVisible.value,
  (newVal) => {
    emits("update:visible", newVal)
  }
)
</script>

<style lang="scss" scoped>
.scroll:deep(.el-dialog__body) {
  height: 500px;
  overflow: scroll;
}

svg {
  width: 1em;
  height: 1em;
  margin-right: 4px;
}
</style>
