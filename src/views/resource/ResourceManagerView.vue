<script setup lang="ts">
import { Message, Modal } from "@arco-design/web-vue";
import {
  StudyResourceControllerService,
  StudyResourceRequest,
} from "@documentApi/index";
import { onMounted, ref } from "vue";
import type { FileListVO } from "../../../api/models/FileListVO";

import IconBook from "@arco-design/web-vue/es/icon/icon-book";
import IconDelete from "@arco-design/web-vue/es/icon/icon-delete";
import IconDragDot from "@arco-design/web-vue/es/icon/icon-drag-dot";
import IconDragDotVertical from "@arco-design/web-vue/es/icon/icon-drag-dot-vertical";
import IconEdit from "@arco-design/web-vue/es/icon/icon-edit";
import IconFile from "@arco-design/web-vue/es/icon/icon-file";
import IconFolder from "@arco-design/web-vue/es/icon/icon-folder";
import IconFolderAdd from "@arco-design/web-vue/es/icon/icon-folder-add";
import IconGlobe from "@arco-design/web-vue/es/icon/icon-public";
import IconHome from "@arco-design/web-vue/es/icon/icon-home";
import IconLink from "@arco-design/web-vue/es/icon/icon-link";
import IconMore from "@arco-design/web-vue/es/icon/icon-more";
import IconPlus from "@arco-design/web-vue/es/icon/icon-plus";
import IconStar from "@arco-design/web-vue/es/icon/icon-star";
import IconStarFill from "@arco-design/web-vue/es/icon/icon-star-fill";
import IconUp from "@arco-design/web-vue/es/icon/icon-up";
import IconUpload from "@arco-design/web-vue/es/icon/icon-upload";
import IconUser from "@arco-design/web-vue/es/icon/icon-user";
import { useRouter } from "vue-router";

interface CustomRequestOption {
  file: File;
  onSuccess: () => void;
  onError: (error: Error) => void;
}

// 新增视图选择状态
const viewMode = ref<"personal" | "public">("personal");

const currentPath = ref("/");
const files = ref<FileListVO[]>([]);
const loading = ref(false);
const createVisible = ref(false);
const createFolderVisible = ref(false);
const folderName = ref("");
const fileInput = ref<HTMLInputElement | null>(null);

// 创建资源的表单数据
const resourceForm = ref<StudyResourceRequest>({
  name: "",
  resourceType: StudyResourceRequest.resourceType.ARTICLE,
  parentPath: "/",
  content: "",
  resourceUrl: "",
});

// 重命名对话框状态
const renameVisible = ref(false);
const renameForm = ref({
  newName: "",
  id: "",
});

// 移动对话框状态
const moveVisible = ref(false);
const moveForm = ref({
  id: "",
  targetPath: "/",
});
const folders = ref<FileListVO[]>([]);

// 添加上传状态
const uploadLoading = ref(false);
const selectedFile = ref<File | null>(null);

// 添加收藏相关状态
const favoriteVisible = ref(false);
const favoriteForm = ref({
  id: "",
  targetPath: "/",
});

const router = useRouter();

// 获取文件列表
const fetchFiles = async (path = "/") => {
  try {
    loading.value = true;
    // 根据当前视图模式获取不同的文件列表
    const response =
      viewMode.value === "personal"
        ? await StudyResourceControllerService.listFiles(path)
        : await StudyResourceControllerService.getPublicResources();

    if (response.data) {
      files.value = response.data;
    }
  } catch (error) {
    Message.error("获取文件列表失败");
  } finally {
    loading.value = false;
  }
};

// 更改视图模式
const changeViewMode = (mode: "personal" | "public") => {
  viewMode.value = mode;
  // 在切换到公共视图时，将当前路径重置为根目录
  if (mode === "public") {
    currentPath.value = "/";
  }
  // 获取对应视图的文件列表
  fetchFiles(mode === "personal" ? currentPath.value : "/");
};

// 创建文件夹
const createFolder = async () => {
  if (!folderName.value.trim()) {
    Message.error("请输入文件夹名称");
    return;
  }
  try {
    await StudyResourceControllerService.createFolder(
      folderName.value,
      currentPath.value
    );
    Message.success("创建文件夹成功");
    createFolderVisible.value = false;
    folderName.value = "";
    fetchFiles(currentPath.value);
  } catch (error) {
    Message.error("创建文件夹失败");
  }
};

// 创建资源
const createResource = async () => {
  try {
    if (resourceForm.value.resourceType === "PDF") {
      if (!selectedFile.value) {
        Message.error("请选择要上传的PDF文件");
        return;
      }
      uploadLoading.value = true;
      const loadingTip = Message.loading({
        content: "正在上传PDF文件，请稍候...",
        duration: 0,
      });
      await StudyResourceControllerService.uploadFile({
        file: selectedFile.value,
      });
      loadingTip.close();
      Message.success("上传PDF成功");
    } else {
      // 设置正确的父路径
      resourceForm.value.parentPath = currentPath.value;
      await StudyResourceControllerService.createResource(resourceForm.value);
      Message.success("创建资源成功");
    }
    createVisible.value = false;
    fetchFiles(currentPath.value);
  } catch (error) {
    Message.error(
      resourceForm.value.resourceType === "PDF" ? "上传PDF失败" : "创建资源失败"
    );
  } finally {
    uploadLoading.value = false;
    selectedFile.value = null;
  }
};

// 上传文件
const handleFileUpload = (file: File) => {
  StudyResourceControllerService.uploadFile({ file })
    .then(() => {
      Message.success("上传文件成功");
      createVisible.value = false;
      fetchFiles(currentPath.value);
    })
    .catch((error: Error) => {
      Message.error("上传文件失败");
    });
};

// 处理文件选择
const handleFileSelect = (e: Event) => {
  const input = e.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    selectedFile.value = input.files[0];
    resourceForm.value.name = input.files[0].name.replace(/\.pdf$/i, "");
  }
};

// 进入文件夹或预览资源
const enterFolder = async (file: FileListVO) => {
  // 在公共资源视图中不允许导航到文件夹
  if (viewMode.value === "public") {
    if (file.id) {
      router.push({
        name: "resource-preview",
        query: { id: file.id, isPublic: "true" },
      });
    }
    return;
  }

  // 在个人资源视图中允许导航
  if (file.isFolder) {
    currentPath.value =
      currentPath.value === "/"
        ? `/${file.name}`
        : `${currentPath.value}/${file.name}`;
    fetchFiles(currentPath.value);
  } else if (file.id) {
    try {
      router.push({
        name: "resource-preview",
        query: { id: file.id },
      });
    } catch (error) {
      Message.error("打开资源失败");
    }
  }
};

// 返回上级目录
const goBack = () => {
  // 在公共资源视图中不允许导航
  if (viewMode.value === "public") return;

  if (currentPath.value === "/") return;
  const parentPath = currentPath.value.substring(
    0,
    currentPath.value.lastIndexOf("/")
  );
  currentPath.value = parentPath || "/";
  fetchFiles(currentPath.value);
};

const getResourceTypeText = (type: string | undefined) => {
  switch (type) {
    case "PDF":
      return "PDF文档";
    case "ARTICLE":
      return "文章";
    case "NOTE":
      return "笔记";
    case "URL":
      return "在线网页";
    default:
      return "文件";
  }
};

// 处理文件选择按钮点击
const handleUploadClick = () => {
  fileInput.value?.click();
};

// 重命名资源
const renameResource = async () => {
  if (!renameForm.value.newName.trim()) {
    Message.error("请输入新名称");
    return;
  }
  try {
    const response = await StudyResourceControllerService.updateResource({
      id: renameForm.value.id,
      name: renameForm.value.newName,
    });
    if (response.code === 200) {
      Message.success("重命名成功");
      renameVisible.value = false;
      fetchFiles(currentPath.value);
    } else {
      Message.error("重命名失败");
    }
  } catch (error) {
    Message.error("重命名失败");
  }
};

// 删除资源
const deleteResource = async (
  id: string | number | Record<string, any> | undefined
) => {
  if (typeof id !== "string") {
    Message.error("资源ID不存在或类型错误");
    return;
  }

  Modal.warning({
    title: "确认删除",
    content: "确定要删除这个资源吗？此操作不可恢复。",
    okText: "删除",
    cancelText: "取消",
    async onOk() {
      try {
        await StudyResourceControllerService.delete(id);
        Message.success("删除成功");
        fetchFiles(currentPath.value);
      } catch (error) {
        Message.error("删除失败");
      }
    },
  });
};

// 打开重命名对话框
const openRename = (item: FileListVO) => {
  if (!item.id) {
    Message.error("资源ID不存在");
    return;
  }
  renameForm.value.newName = item.name || "";
  renameForm.value.id = item.id;
  renameVisible.value = true;
};

// 获取所有文件夹
const fetchFolders = async () => {
  try {
    const response = await StudyResourceControllerService.listFiles("/");
    if (response.data) {
      folders.value = response.data.filter((item) => item.isFolder);
    }
  } catch (error) {
    Message.error("获取文件夹列表失败");
  }
};

// 移动资源
const moveResource = async () => {
  try {
    const response = await StudyResourceControllerService.updateResource({
      id: moveForm.value.id,
      parentPath: moveForm.value.targetPath,
    });
    if (response.code === 200) {
      Message.success("移动成功");
      moveVisible.value = false;
      fetchFiles(currentPath.value);
    } else {
      Message.error("移动失败");
    }
  } catch (error) {
    Message.error("移动失败");
  }
};

// 打开移动对话框
const openMove = (item: FileListVO) => {
  if (!item.id) {
    Message.error("资源ID不存在");
    return;
  }
  moveForm.value.id = item.id;
  moveForm.value.targetPath = "/";
  moveVisible.value = true;
  fetchFolders();
};

// 设置资源公开状态
const togglePublicStatus = async (item: FileListVO, isPublic: boolean) => {
  if (!item.id) {
    Message.error("资源ID不存在");
    return;
  }

  try {
    await StudyResourceControllerService.setResourcePublicStatus(
      item.id,
      isPublic
    );
    Message.success(isPublic ? "已设为公开资源" : "已取消公开状态");
    fetchFiles(currentPath.value);
  } catch (error) {
    Message.error(isPublic ? "设置公开失败" : "取消公开失败");
  }
};

// 收藏公开资源
const openFavorite = (item: FileListVO) => {
  if (!item.id) {
    Message.error("资源ID不存在");
    return;
  }
  favoriteForm.value.id = item.id;
  favoriteForm.value.targetPath = "/";
  favoriteVisible.value = true;
  fetchFolders();
};

// 执行收藏操作
const favoriteResource = async () => {
  try {
    const response =
      await StudyResourceControllerService.favoritePublicResource(
        favoriteForm.value.id,
        favoriteForm.value.targetPath
      );
    if (response.code === 200) {
      Message.success("收藏成功");
      favoriteVisible.value = false;
    } else {
      Message.error("收藏失败");
    }
  } catch (error) {
    Message.error("收藏失败");
  }
};

// 处理资源操作
const handleOperation = (operation: unknown, item: FileListVO) => {
  if (!item.id) {
    Message.error("资源ID不存在");
    return;
  }

  switch (operation) {
    case "rename":
      openRename(item);
      break;
    case "move":
      if (!item.isFolder) {
        openMove(item);
      }
      break;
    case "delete":
      deleteResource(item.id);
      break;
    case "setPublic":
      togglePublicStatus(item, true);
      break;
    case "setPrivate":
      togglePublicStatus(item, false);
      break;
    case "favorite":
      openFavorite(item);
      break;
  }
};

// 对话框关闭时清理状态
const handleCreateModalClose = () => {
  selectedFile.value = null;
  resourceForm.value.name = "";
  uploadLoading.value = false;
};

onMounted(() => {
  fetchFiles();
  fetchFolders();
});
</script>

<template>
  <div class="resource-manager">
    <a-card class="resource-card" :bordered="false">
      <!-- 顶部操作栏 -->
      <div class="operation-bar">
        <div class="left-operations">
          <!-- 视图切换 -->
          <a-radio-group
            v-model="viewMode"
            type="button"
            @change="changeViewMode"
          >
            <a-radio value="personal">
              <template #radio><icon-user /></template>
              我的资源
            </a-radio>
            <a-radio value="public">
              <template #radio><icon-public /></template>
              公共资源
            </a-radio>
          </a-radio-group>

          <a-divider direction="vertical" />

          <!-- 面包屑导航 -->
          <a-breadcrumb>
            <a-breadcrumb-item><icon-home />根目录</a-breadcrumb-item>
            <template v-if="currentPath !== '/' && viewMode === 'personal'">
              <a-breadcrumb-item
                v-for="(path, index) in currentPath.split('/').filter(Boolean)"
                :key="index"
              >
                {{ path }}
              </a-breadcrumb-item>
            </template>
          </a-breadcrumb>

          <!-- 返回上级按钮 -->
          <a-button
            type="text"
            size="small"
            @click="goBack"
            :disabled="currentPath === '/' || viewMode === 'public'"
          >
            <template #icon><icon-up /></template>
            返回上级
          </a-button>
        </div>

        <!-- 操作按钮 -->
        <div class="right-operations">
          <a-space v-if="viewMode === 'personal'">
            <a-button type="outline" @click="createFolderVisible = true">
              <template #icon><icon-folder-add /></template>
              新建文件夹
            </a-button>
            <a-button type="primary" @click="createVisible = true">
              <template #icon><icon-plus /></template>
              新建资源
            </a-button>
          </a-space>
          <a-space v-else>
            <a-tooltip
              content="在公共资源视图中，您可以浏览并收藏公开的学习资源"
            >
              <icon-star-fill style="color: #f5ba18" />
              <span class="public-tip">您可以收藏感兴趣的公共资源</span>
            </a-tooltip>
          </a-space>
        </div>
      </div>

      <!-- 文件列表 -->
      <a-spin :loading="loading" class="full-height">
        <div class="resource-grid">
          <div
            v-for="item in files"
            :key="item.id || item.name"
            class="resource-item"
            @click="enterFolder(item)"
          >
            <!-- 操作下拉菜单 -->
            <div class="resource-operations">
              <!-- 个人资源的操作菜单 -->
              <a-dropdown
                v-if="viewMode === 'personal'"
                @select="(key) => handleOperation(key, item)"
              >
                <a-button type="text" size="mini" @click.stop>
                  <icon-more />
                </a-button>
                <template #content>
                  <a-doption value="rename"> <icon-edit />重命名 </a-doption>
                  <a-doption v-if="!item.isFolder" value="move">
                    <icon-drag-dot />移动到
                  </a-doption>
                  <a-doption
                    v-if="!item.isFolder"
                    :value="item.isPublic ? 'setPrivate' : 'setPublic'"
                  >
                    <icon-public v-if="!item.isPublic" />
                    <icon-user v-else />
                    {{ item.isPublic ? "设为私有" : "设为公开" }}
                  </a-doption>
                  <a-doption value="delete"> <icon-delete />删除 </a-doption>
                </template>
              </a-dropdown>

              <!-- 公共资源的收藏操作 -->
              <a-button
                v-else
                type="text"
                size="mini"
                @click.stop="openFavorite(item)"
                class="favorite-button"
              >
                <icon-star />收藏
              </a-button>
            </div>

            <!-- 资源图标 -->
            <div
              class="resource-icon"
              :class="[
                { 'is-folder': item.isFolder },
                item.resourceType?.toLowerCase(),
                { 'is-public': item.isPublic },
              ]"
            >
              <!-- 公开资源标记 -->
              <div
                v-if="item.isPublic && viewMode === 'personal'"
                class="public-badge"
              >
                <icon-public />
              </div>

              <icon-folder v-if="item.isFolder" :style="{ fontSize: '48px' }" />
              <template v-else>
                <icon-book
                  v-if="item.resourceType === 'PDF'"
                  :style="{ fontSize: '48px' }"
                />
                <icon-edit
                  v-else-if="item.resourceType === 'ARTICLE'"
                  :style="{ fontSize: '48px' }"
                />
                <icon-drag-dot-vertical
                  v-else-if="item.resourceType === 'NOTE'"
                  :style="{ fontSize: '48px' }"
                />
                <icon-link
                  v-else-if="item.resourceType === 'URL'"
                  :style="{ fontSize: '48px' }"
                />
                <icon-file v-else :style="{ fontSize: '48px' }" />
              </template>
            </div>

            <!-- 资源信息 -->
            <div class="resource-info">
              <div class="resource-name" :title="item.name">
                {{ item.name }}
              </div>
              <div class="resource-type">
                {{
                  item.isFolder
                    ? "文件夹"
                    : getResourceTypeText(item.resourceType)
                }}
              </div>
            </div>
          </div>

          <!-- 空状态提示 -->
          <div v-if="files.length === 0" class="empty-state">
            <icon-file :style="{ fontSize: '64px', opacity: 0.5 }" />
            <p>
              {{
                viewMode === "personal"
                  ? "没有资源，开始创建吧！"
                  : "当前没有公共资源可用"
              }}
            </p>
            <a-button
              v-if="viewMode === 'personal'"
              type="outline"
              @click="createVisible = true"
            >
              <template #icon><icon-plus /></template>
              新建资源
            </a-button>
          </div>
        </div>
      </a-spin>
    </a-card>

    <!-- 创建文件夹对话框 -->
    <a-modal
      v-model:visible="createFolderVisible"
      title="新建文件夹"
      @ok="createFolder"
      @cancel="createFolderVisible = false"
      :ok-button-props="{ type: 'primary' }"
    >
      <a-form :model="{ name: folderName }" layout="vertical">
        <a-form-item field="name" label="文件夹名称" required>
          <a-input
            v-model="folderName"
            placeholder="请输入文件夹名称"
            allow-clear
            @press-enter="createFolder"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 创建资源对话框 -->
    <a-modal
      v-model:visible="createVisible"
      title="创建资源"
      @ok="createResource"
      @cancel="createVisible = false"
      @close="handleCreateModalClose"
      :ok-button-props="{
        type: 'primary',
        loading: uploadLoading,
        disabled: resourceForm.resourceType === 'PDF' && !selectedFile,
      }"
      :mask-closable="!uploadLoading"
      :closable="!uploadLoading"
      :cancel-button-props="{ disabled: uploadLoading }"
    >
      <div v-if="uploadLoading" class="upload-loading-tip">
        <a-spin dot />
        <span>正在上传文件，请勿关闭窗口...</span>
      </div>

      <a-form :model="resourceForm" layout="vertical">
        <a-form-item field="resourceType" label="资源类型">
          <a-radio-group v-model="resourceForm.resourceType" type="button">
            <a-radio value="PDF">PDF</a-radio>
            <a-radio value="ARTICLE">文章</a-radio>
            <a-radio value="NOTE">笔记</a-radio>
            <a-radio value="URL">在线网页</a-radio>
          </a-radio-group>
        </a-form-item>

        <template v-if="resourceForm.resourceType === 'PDF'">
          <a-form-item field="file" label="选择PDF文件" required>
            <div class="upload-option">
              <input
                type="file"
                accept=".pdf"
                style="display: none"
                @change="handleFileSelect"
                ref="fileInput"
              />
              <a-button
                :type="selectedFile ? 'outline' : 'primary'"
                long
                @click="handleUploadClick"
              >
                <template #icon>
                  <icon-upload v-if="!selectedFile" />
                  <icon-file v-else />
                </template>
                {{ selectedFile ? selectedFile.name : "选择PDF文件" }}
              </a-button>
              <div v-if="selectedFile" class="selected-file">
                <a-button type="text" size="mini" @click="selectedFile = null">
                  <template #icon><icon-delete /></template>
                  重新选择
                </a-button>
              </div>
            </div>
          </a-form-item>
        </template>

        <template v-else>
          <a-form-item field="name" label="名称" required>
            <a-input
              v-model="resourceForm.name"
              placeholder="请输入资源名称"
              allow-clear
            />
          </a-form-item>
        </template>

        <template v-if="resourceForm.resourceType === 'ARTICLE'">
          <a-form-item field="content" label="文章内容" required>
            <a-textarea
              v-model="resourceForm.content"
              placeholder="请输入文章内容"
              :auto-size="{ minRows: 4, maxRows: 8 }"
            />
          </a-form-item>
        </template>
        <template v-if="resourceForm.resourceType === 'URL'">
          <a-form-item field="resourceUrl" label="网页地址" required>
            <a-input
              v-model="resourceForm.resourceUrl"
              placeholder="请输入网页地址"
              allow-clear
            >
              <template #prefix>
                <icon-link />
              </template>
            </a-input>
          </a-form-item>
        </template>
      </a-form>
    </a-modal>

    <!-- 重命名对话框 -->
    <a-modal
      v-model:visible="renameVisible"
      title="重命名"
      @ok="renameResource"
      @cancel="renameVisible = false"
      :ok-button-props="{ type: 'primary' }"
    >
      <a-form :model="renameForm" layout="vertical">
        <a-form-item field="newName" label="新名称" required>
          <a-input
            v-model="renameForm.newName"
            placeholder="请输入新名称"
            allow-clear
            @press-enter="renameResource"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 移动对话框 -->
    <a-modal
      v-model:visible="moveVisible"
      title="移动到文件夹"
      @ok="moveResource"
      @cancel="moveVisible = false"
      :ok-button-props="{ type: 'primary' }"
    >
      <a-form :model="moveForm" layout="vertical">
        <a-form-item field="targetPath" label="选择目标文件夹">
          <a-radio-group v-model="moveForm.targetPath" direction="vertical">
            <a-radio value="/">
              <icon-home style="margin-right: 4px" />根目录
            </a-radio>
            <a-radio
              v-for="folder in folders"
              :key="folder.name"
              :value="'/' + folder.name"
            >
              <icon-folder style="margin-right: 4px" />{{ folder.name }}
            </a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 收藏对话框 -->
    <a-modal
      v-model:visible="favoriteVisible"
      title="收藏到我的资源"
      @ok="favoriteResource"
      @cancel="favoriteVisible = false"
      :ok-button-props="{ type: 'primary' }"
    >
      <a-form :model="favoriteForm" layout="vertical">
        <a-form-item field="targetPath" label="选择收藏位置">
          <a-radio-group v-model="favoriteForm.targetPath" direction="vertical">
            <a-radio value="/">
              <icon-home style="margin-right: 4px" />根目录
            </a-radio>
            <a-radio
              v-for="folder in folders"
              :key="folder.name"
              :value="'/' + folder.name"
            >
              <icon-folder style="margin-right: 4px" />{{ folder.name }}
            </a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<style scoped>
.resource-manager {
  padding: 24px;
  background-color: var(--color-fill-2);
  min-height: 100vh;
}

.resource-card {
  min-height: calc(100vh - 48px);
  background-color: var(--color-bg-2);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.operation-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--color-border);
}

.left-operations {
  display: flex;
  align-items: center;
  gap: 16px;
}

.resource-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 24px;
  padding: 16px;
}

@media screen and (max-width: 1600px) {
  .resource-grid {
    grid-template-columns: repeat(5, 1fr);
  }
}

@media screen and (max-width: 1200px) {
  .resource-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media screen and (max-width: 900px) {
  .resource-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media screen and (max-width: 600px) {
  .resource-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.resource-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
  border-radius: 8px;
  background-color: var(--color-bg-2);
  border: 1px solid var(--color-border);
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 0;
}

.resource-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  border-color: var(--color-primary-light-3);
}

.resource-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 96px;
  height: 96px;
  border-radius: 12px;
  margin-bottom: 16px;
  color: var(--color-text-2);
  background-color: var(--color-fill-2);
}

.resource-icon.is-folder {
  color: #ffd666;
  background-color: #fff7e6;
}

.resource-icon.pdf {
  color: #ff4d4f;
  background-color: #fff1f0;
}

.resource-icon.article {
  color: #36cfc9;
  background-color: #e6fffb;
}

.resource-icon.note {
  color: #9254de;
  background-color: #f9f0ff;
}

.resource-icon.url {
  color: #40a9ff;
  background-color: #e6f7ff;
}

.resource-info {
  width: 100%;
  text-align: center;
}

.resource-name {
  font-size: 16px;
  font-weight: 500;
  color: var(--color-text-1);
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.resource-type {
  font-size: 14px;
  color: var(--color-text-3);
}

.full-height {
  height: 100%;
}

:deep(.arco-upload-list) {
  margin-top: 16px;
}

:deep(.arco-form-item-label) {
  font-weight: 500;
}

.upload-option {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
}

.selected-file {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 8px;
}

.right-operations {
  display: flex;
  gap: 8px;
}

.resource-operations {
  position: absolute;
  top: 8px;
  right: 8px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.resource-item:hover .resource-operations {
  opacity: 1;
}

:deep(.arco-radio) {
  padding: 8px;
  width: 100%;
  border-radius: 4px;
  transition: all 0.2s;
}

:deep(.arco-radio:hover) {
  background-color: var(--color-fill-2);
}

:deep(.arco-radio-checked) {
  background-color: var(--color-primary-light-1);
  color: var(--color-primary-6);
}

.upload-loading-tip {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 100;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
