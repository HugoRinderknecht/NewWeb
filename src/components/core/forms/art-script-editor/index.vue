<template>
  <div class="script-editor-wrapper">
    <!-- 工具栏 -->
    <div class="script-toolbar">
      <ElSpace>
        <ElTooltip content="场景标题 (Ctrl+1)">
          <ElButton size="small" text @click="insertSceneHeading">
            <ArtSvgIcon icon="ri:film-line" class="mr-1" />
            场景
          </ElButton>
        </ElTooltip>
        <ElTooltip content="角色名 (Ctrl+2)">
          <ElButton size="small" text @click="insertCharacter">
            <ArtSvgIcon icon="ri:user-line" class="mr-1" />
            角色
          </ElButton>
        </ElTooltip>
        <ElTooltip content="动作描述 (Ctrl+3)">
          <ElButton size="small" text @click="insertAction">
            <ArtSvgIcon icon="ri:run-line" class="mr-1" />
            动作
          </ElButton>
        </ElTooltip>
        <ElTooltip content="对白 (Ctrl+4)">
          <ElButton size="small" text @click="insertDialogue">
            <ArtSvgIcon icon="ri:chat-1-line" class="mr-1" />
            对白
          </ElButton>
        </ElTooltip>
        <ElTooltip content="内心独白 (Ctrl+5)">
          <ElButton size="small" text @click="insertInnerMonologue">
            <ArtSvgIcon icon="ri:mental-health-line" class="mr-1" />
            独白
          </ElButton>
        </ElTooltip>
        <ElDivider direction="vertical" />
        <ElTooltip content="撤销 (Ctrl+Z)">
          <ElButton size="small" text :disabled="!canUndo" @click="undo">
            <ArtSvgIcon icon="ri:arrow-go-back-line" />
          </ElButton>
        </ElTooltip>
        <ElTooltip content="重做 (Ctrl+Y)">
          <ElButton size="small" text :disabled="!canRedo" @click="redo">
            <ArtSvgIcon icon="ri:arrow-go-forward-line" />
          </ElButton>
        </ElTooltip>
        <ElDivider direction="vertical" />
        <ElTooltip content="格式化剧本">
          <ElButton size="small" text @click="formatScript">
            <ArtSvgIcon icon="ri:magic-line" class="mr-1" />
            格式化
          </ElButton>
        </ElTooltip>
        <ElTooltip content="预览">
          <ElButton size="small" text @click="togglePreview">
            <ArtSvgIcon icon="ri:eye-line" class="mr-1" />
            {{ showPreview ? '编辑' : '预览' }}
          </ElButton>
        </ElTooltip>
      </ElSpace>
    </div>

    <!-- 编辑器主体 -->
    <div class="script-editor-body">
      <!-- 编辑模式 -->
      <div v-show="!showPreview" class="editor-mode">
        <div
          ref="editorRef"
          class="script-content-editable"
          contenteditable="true"
          @input="handleInput"
          @keydown="handleKeydown"
          @paste="handlePaste"
        />
      </div>

      <!-- 预览模式 -->
      <div v-show="showPreview" class="preview-mode">
        <div class="script-preview-content">
          <div
            v-for="(block, index) in parsedBlocks"
            :key="index"
            :class="['script-block', block.type]"
          >
            <template v-if="block.type === 'scene'">
              <div class="scene-heading">{{ block.content }}</div>
            </template>
            <template v-else-if="block.type === 'character'">
              <div class="character-name">{{ block.content }}</div>
            </template>
            <template v-else-if="block.type === 'action'">
              <div class="action-text">{{ block.content }}</div>
            </template>
            <template v-else-if="block.type === 'dialogue'">
              <div class="dialogue-text">{{ block.content }}</div>
            </template>
            <template v-else-if="block.type === 'inner'">
              <div class="inner-monologue">{{ block.content }}</div>
            </template>
            <template v-else>
              <div class="normal-text">{{ block.content }}</div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- 状态栏 -->
    <div class="script-status-bar">
      <ElSpace>
        <span class="text-xs text-g-400">字数: {{ wordCount }}</span>
        <span class="text-xs text-g-400">行数: {{ lineCount }}</span>
        <span class="text-xs text-g-400">场景: {{ sceneCount }}</span>
        <span class="text-xs text-g-400">角色: {{ characterCount }}</span>
        <span class="text-xs text-g-400">预计时长: {{ estimatedDuration }}</span>
      </ElSpace>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, watch } from 'vue'

  defineOptions({ name: 'ArtScriptEditor' })

  interface ScriptBlock {
    type: 'scene' | 'character' | 'action' | 'dialogue' | 'inner' | 'normal'
    content: string
  }

  const props = defineProps<{
    modelValue: string
  }>()

  const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void
    (e: 'change', value: string): void
  }>()

  const editorRef = ref<HTMLDivElement>()
  const showPreview = ref(false)
  const historyStack = ref<string[]>([])
  const historyIndex = ref(-1)
  const maxHistorySize = 50

  // ---------- 计算属性 ----------
  const wordCount = computed(() => props.modelValue.replace(/\s/g, '').length)
  const lineCount = computed(() => props.modelValue.split('\n').length)

  const parsedBlocks = computed(() => parseScript(props.modelValue))

  const sceneCount = computed(() => parsedBlocks.value.filter((b) => b.type === 'scene').length)
  const characterCount = computed(
    () => new Set(parsedBlocks.value.filter((b) => b.type === 'character').map((b) => b.content))
      .size
  )

  const estimatedDuration = computed(() => {
    const minutes = Math.ceil(wordCount.value / 200)
    return `${minutes} 分钟`
  })

  const canUndo = computed(() => historyIndex.value > 0)
  const canRedo = computed(() => historyIndex.value < historyStack.value.length - 1)

  // ---------- 剧本解析 ----------
  function parseScript(content: string): ScriptBlock[] {
    const lines = content.split('\n')
    const blocks: ScriptBlock[] = []
    let currentBlock: ScriptBlock | null = null

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed) continue

      let type: ScriptBlock['type'] = 'normal'

      // 场景标题: 场景：xxx 或 场景: xxx 或 INT./EXT.
      if (/^(场景[：:]\s*|INT\.\s+|EXT\.\s+|内景\s+|外景\s+)/i.test(trimmed)) {
        type = 'scene'
      }
      // 角色名: 全大写或特定格式，后面跟括号是动作
      else if (/^[\u4e00-\u9fa5A-Z\s]{2,20}$/.test(trimmed) && !/[,，.。!！?？]/.test(trimmed)) {
        type = 'character'
      }
      // 动作描述: 括号包裹
      else if (/^[（(].*[）)]$/.test(trimmed)) {
        type = 'action'
      }
      // 内心独白: 【】包裹
      else if (/^[【\[].*[】\]]$/.test(trimmed)) {
        type = 'inner'
      }
      // 对白: 默认（在角色名之后）
      else if (
        blocks.length > 0 &&
        blocks[blocks.length - 1].type === 'character' &&
        currentBlock?.type !== 'dialogue'
      ) {
        type = 'dialogue'
      }

      if (currentBlock && currentBlock.type === type && type !== 'scene' && type !== 'character') {
        currentBlock.content += '\n' + trimmed
      } else {
        currentBlock = { type, content: trimmed }
        blocks.push(currentBlock)
      }
    }

    return blocks
  }

  // ---------- 编辑器操作 ----------
  function handleInput() {
    const content = editorRef.value?.innerText || ''
    emit('update:modelValue', content)
    emit('change', content)
    pushHistory(content)
  }

  function handleKeydown(e: KeyboardEvent) {
    // 快捷键
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'z':
          e.preventDefault()
          undo()
          return
        case 'y':
          e.preventDefault()
          redo()
          return
        case '1':
          e.preventDefault()
          insertSceneHeading()
          return
        case '2':
          e.preventDefault()
          insertCharacter()
          return
        case '3':
          e.preventDefault()
          insertAction()
          return
        case '4':
          e.preventDefault()
          insertDialogue()
          return
        case '5':
          e.preventDefault()
          insertInnerMonologue()
          return
      }
    }

    // Tab 键插入缩进
    if (e.key === 'Tab') {
      e.preventDefault()
      document.execCommand('insertText', false, '  ')
    }
  }

  function handlePaste(e: ClipboardEvent) {
    e.preventDefault()
    const text = e.clipboardData?.getData('text/plain') || ''
    document.execCommand('insertText', false, text)
  }

  // ---------- 插入格式化元素 ----------
  function insertAtCursor(text: string) {
    const editor = editorRef.value
    if (!editor) return

    editor.focus()
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    const range = selection.getRangeAt(0)
    range.deleteContents()

    const node = document.createTextNode(text)
    range.insertNode(node)
    range.setStartAfter(node)
    range.setEndAfter(node)
    selection.removeAllRanges()
    selection.addRange(range)

    // 触发 input 事件更新内容
    editor.dispatchEvent(new Event('input', { bubbles: true }))
  }

  function insertSceneHeading() {
    insertAtCursor('\n场景：')
  }

  function insertCharacter() {
    insertAtCursor('\n角色名\n')
  }

  function insertAction() {
    insertAtCursor('（动作描述）')
  }

  function insertDialogue() {
    insertAtCursor('对白内容')
  }

  function insertInnerMonologue() {
    insertAtCursor('【内心独白】')
  }

  // ---------- 撤销/重做 ----------
  function pushHistory(content: string) {
    // 如果当前不是在栈顶，删除当前位置之后的历史
    if (historyIndex.value < historyStack.value.length - 1) {
      historyStack.value = historyStack.value.slice(0, historyIndex.value + 1)
    }

    historyStack.value.push(content)
    if (historyStack.value.length > maxHistorySize) {
      historyStack.value.shift()
    } else {
      historyIndex.value++
    }
  }

  function undo() {
    if (!canUndo.value) return
    historyIndex.value--
    const content = historyStack.value[historyIndex.value]
    updateEditorContent(content)
  }

  function redo() {
    if (!canRedo.value) return
    historyIndex.value++
    const content = historyStack.value[historyIndex.value]
    updateEditorContent(content)
  }

  function updateEditorContent(content: string) {
    if (editorRef.value) {
      editorRef.value.innerText = content
      emit('update:modelValue', content)
      emit('change', content)
    }
  }

  // ---------- 格式化 ----------
  function formatScript() {
    const lines = props.modelValue.split('\n')
    const formatted: string[] = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      // 场景标题格式化
      if (/^(场景[：:]\s*)/i.test(line)) {
        if (formatted.length > 0) formatted.push('')
        formatted.push(line)
        formatted.push('')
      }
      // 角色名格式化
      else if (/^[\u4e00-\u9fa5A-Z\s]{2,20}$/.test(line) && !/[,，.。!！?？]/.test(line)) {
        formatted.push(line)
      }
      // 动作描述
      else if (/^[（(].*[）)]$/.test(line)) {
        formatted.push(line)
      }
      // 其他内容
      else {
        formatted.push(line)
      }
    }

    const formattedText = formatted.join('\n')
    updateEditorContent(formattedText)
    pushHistory(formattedText)
    ElMessage.success('格式化完成')
  }

  function togglePreview() {
    showPreview.value = !showPreview.value
  }

  // ---------- 生命周期 ----------
  onMounted(() => {
    if (editorRef.value) {
      editorRef.value.innerText = props.modelValue
      // 初始化历史记录
      historyStack.value = [props.modelValue]
      historyIndex.value = 0
    }
  })

  watch(
    () => props.modelValue,
    (newVal) => {
      if (editorRef.value && editorRef.value.innerText !== newVal) {
        editorRef.value.innerText = newVal
      }
    }
  )
</script>

<style lang="scss" scoped>
  .script-editor-wrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: var(--custom-radius);
    overflow: hidden;
    background: var(--el-bg-color);
  }

  .script-toolbar {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    background: var(--el-fill-color-lighter);
    border-bottom: 1px solid var(--el-border-color-lighter);
    flex-wrap: wrap;
    gap: 4px;
  }

  .script-editor-body {
    flex: 1;
    overflow: hidden;
    position: relative;
  }

  .editor-mode,
  .preview-mode {
    height: 100%;
    overflow-y: auto;
  }

  .script-content-editable {
    width: 100%;
    min-height: 100%;
    padding: 20px;
    font-family: 'Courier New', 'Microsoft YaHei', monospace;
    font-size: 14px;
    line-height: 1.8;
    color: var(--el-text-color-primary);
    background: var(--el-bg-color);
    white-space: pre-wrap;
    word-wrap: break-word;
    outline: none;

    &:empty::before {
      content: '在此输入剧本内容...\n支持标准剧本格式：\n场景标题\n角色名\n（动作描述）\n对白内容';
      color: var(--el-text-color-placeholder);
      white-space: pre-wrap;
    }

    &:focus {
      background: var(--el-bg-color-page);
    }
  }

  .script-preview-content {
    padding: 20px;
    font-family: 'Courier New', 'Microsoft YaHei', monospace;
    font-size: 14px;
    line-height: 1.8;
  }

  .script-block {
    margin-bottom: 8px;

    &.scene {
      margin-top: 24px;
      margin-bottom: 16px;

      .scene-heading {
        font-weight: 600;
        font-size: 15px;
        color: var(--el-color-primary);
        background: var(--el-color-primary-light-9);
        padding: 8px 12px;
        border-radius: var(--custom-radius);
        border-left: 3px solid var(--el-color-primary);
      }
    }

    &.character {
      margin-top: 16px;
      margin-bottom: 4px;

      .character-name {
        font-weight: 600;
        font-size: 14px;
        color: var(--el-text-color-primary);
        text-align: center;
        max-width: 200px;
        margin: 0 auto;
      }
    }

    &.action {
      margin-bottom: 8px;

      .action-text {
        color: var(--el-text-color-regular);
        font-style: italic;
      }
    }

    &.dialogue {
      margin-bottom: 12px;

      .dialogue-text {
        color: var(--el-text-color-primary);
        max-width: 400px;
        margin: 0 auto;
        padding: 0 20px;
      }
    }

    &.inner {
      margin-bottom: 8px;

      .inner-monologue {
        color: var(--el-color-info);
        font-style: italic;
        max-width: 400px;
        margin: 0 auto;
        padding: 0 20px;
      }
    }

    &.normal {
      .normal-text {
        color: var(--el-text-color-regular);
      }
    }
  }

  .script-status-bar {
    display: flex;
    align-items: center;
    padding: 6px 16px;
    background: var(--el-fill-color-lighter);
    border-top: 1px solid var(--el-border-color-lighter);
  }
</style>
