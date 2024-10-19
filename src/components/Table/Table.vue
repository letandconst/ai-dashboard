<template>
  <el-table :data="tableData.data" style="width: 100%">
    <el-table-column
      v-for="(header, index) in tableHeaders"
      :key="index"
      :prop="header.prop"
      :label="header.label"
    >
      <template v-if="header.prop === 'logo'" v-slot="scope">
        <img
          :src="scope.row.logo"
          alt="Logo"
          style="width: 50px; height: 50px; border-radius: 4px"
        />
      </template>

      <template v-else-if="header.prop === 'status'" v-slot="scope">
        <el-tag
          :type="scope.row.status === 'Active' ? 'success' : 'danger'"
          effect="dark"
          round
        >
          {{ scope.row.status === "Active" ? "Active" : "Inactive" }}
        </el-tag>
      </template>

      <template v-else v-slot="scope">
        {{ scope.row[header.prop] }}
      </template>
    </el-table-column>

    <el-table-column label="Action">
      <template v-slot:default="scope">
        <el-button @click="handleEdit(scope.row)" type="primary" size="small">
          Edit
        </el-button>
      </template>
    </el-table-column>

    <el-table-column v-if="!tableData.data.length">
      <template v-slot:default>
        <div style="text-align: center; color: #999">
          {{ noDataMessage }}
        </div>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
export default {
  name: "PageTable",
  props: {
    tableHeaders: {
      type: Array,
      required: true,
    },
    tableData: {
      type: Object,
      required: true,
    },
    handleEdit: {
      type: Function,
      required: true,
    },
  },
  computed: {
    noDataMessage() {
      return this.tableData.tableType === "users"
        ? "No users found"
        : "No companies found";
    },
  },
};
</script>
