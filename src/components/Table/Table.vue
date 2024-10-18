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
          style="width: 50px; height: 50px"
        />
      </template>
      <template v-else v-slot="scope">
        {{ scope.row[header.prop] }}
      </template>
    </el-table-column>

    <el-table-column label="Actions">
      <template v-slot:default="scope">
        <el-button @click="handleEdit(scope.row)" type="primary" size="small">
          Edit
        </el-button>
        <el-button @click="handleDelete(scope.row)" type="danger" size="small">
          Delete
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
  },
  computed: {
    noDataMessage() {
      return this.tableData.tableType === "users"
        ? "No users found"
        : "No companies found";
    },
  },
  methods: {
    handleEdit(row) {
      console.log("Editing row:", row);
    },
    handleDelete(row) {
      console.log("Deleting row:", row);
    },
  },
};
</script>
