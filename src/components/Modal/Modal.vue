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
      <el-button type="primary" @click="confirm">{{
        confirmText || "Submit"
      }}</el-button>
      <el-button
        v-if="isEditor && this.$route.path === '/all-media'"
        type="success"
        @click="publish"
      >
        Publish
      </el-button>
    </template>
  </el-dialog>
</template>

<script>
import { mapState } from "vuex";
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
    confirmText: {
      type: String,
      default: "Submit",
    },
  },
  computed: {
    ...mapState(["userDetails"]),
    visible: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit("update:modelValue", value);
      },
    },
    isEditor() {
      return this.userDetails?.type === "Editor";
    },
  },
  methods: {
    closeModal() {
      this.visible = false;
    },
    confirm() {
      this.$emit("confirm");
    },
    publish() {
      this.$emit("publish");
    },
  },
};
</script>
