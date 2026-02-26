<template>
  <div class="home">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>欢迎使用 ComicMaker</span>
            </div>
          </template>
          <div class="welcome-content">
            <p>ComicMaker 是一个强大的漫剧视频创作工具，助您轻松实现创意。</p>
            <el-button type="primary" @click="$router.push('/works')">开始创作</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-20">
      <el-col :span="8">
        <el-card shadow="hover" @click="$router.push('/materials')">
          <template #header>
            <div class="card-header">
              <span>素材管理</span>
            </div>
          </template>
          <div class="feature-desc">
            管理人物、场景、道具等素材库。
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" @click="$router.push('/styles')">
          <template #header>
            <div class="card-header">
              <span>风格管理</span>
            </div>
          </template>
          <div class="feature-desc">
            定制和管理独特的视觉风格。
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" @click="$router.push('/tools')">
          <template #header>
            <div class="card-header">
              <span>工具箱</span>
            </div>
          </template>
          <div class="feature-desc">
            各类 AI 辅助工具集合。
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.mt-20 {
  margin-top: 20px;
}
.welcome-content {
  text-align: center;
  padding: 40px 0;
}
.feature-desc {
  color: #666;
  font-size: 14px;
}
.el-card {
  cursor: pointer;
  height: 100%;
}
</style>
