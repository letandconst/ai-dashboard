<template>
  <el-dialog v-model="visible" @close="closeModal">
    <template #header>
      <h3>{{ title }}</h3>
    </template>
    <template #default>
      <slot></slot>
    </template>
    <template #footer>
      <el-button @click="closeModal">Cancel</el-button>
      <el-button type="primary" @click="confirm">Confirm</el-button>
    </template>
  </el-dialog>
</template>

<script>
export default {
  name: "PageModal",
  props: {
    title: {
      type: String,
      required: true,
    },
    modelValue: {
      type: Boolean,
      required: true,
    },
  },
  computed: {
    visible: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit("update:modelValue", value);
      },
    },
  },
  methods: {
    closeModal() {
      this.visible = false;
    },
    confirm() {
      this.$emit("confirm");
      this.closeModal();
    },
  },
};
</script>
