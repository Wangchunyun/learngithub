<template>
  <div id="app">
    <el-button @click="show">按钮</el-button>
  </div>
</template>

<script>
export default {
  name: "App",
  methods: {
    show: function () {
      this.$message.success("element 提示");
    },
  },
};
</script>