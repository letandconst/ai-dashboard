<template>
  <el-button
    :type="text"
    :loading="loading"
    :disabled="disabled"
    @click="handleClick"
  >
    <div class="label-wrap"><slot /></div>
  </el-button>
</template>

<script>
export default {
  name: "PageButton",
  props: {
    text: {
      type: String,
      default: "primary",
    },
    loading: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    action: {
      type: String,
      default: "click",
    },
    modalId: {
      type: String,
      default: "",
    },
  },
  methods: {
    handleClick() {
      this.$emit("open-modal", this.modalId);
    },
  },
};
</script>

<style scoped>
.label-wrap {
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>
