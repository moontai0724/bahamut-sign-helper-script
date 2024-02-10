<script setup lang="ts">
import { Logger, ScriptMessage } from "@common/index";
import { ScriptEvent } from "@common/script-message";
import { type QuizContent } from "@common/types/animad";
import Dialog from "primevue/dialog";
import { computed, onMounted, ref, watch } from "vue";

import Question from "./question.vue";

const title = computed(() => {
  const date = new Date().toLocaleDateString("zh-TW", {
    day: "2-digit",
    month: "2-digit",
  });

  return `${date} 動畫瘋手動作答`;
});

const question = ref<QuizContent>();

onMounted(() => {
  ScriptMessage.on(ScriptEvent.SystemInit, event => {
    Logger.info("View received initialize content", event.data.content);
    question.value = event.data.content.question;
  });

  ScriptMessage.send(ScriptEvent.ViewMounted, null);
});

const isDialogVisible = ref(true);

watch(isDialogVisible, value => {
  ScriptMessage.send(ScriptEvent.UserClosed, value);
});

const answered = ref(false);

const message = ref("Loading...");

function onAnswered(id: number) {
  ScriptMessage.on(ScriptEvent.SystemRepliedResult, event => {
    Logger.info("View received result", event.data.content);
    answered.value = true;
    message.value = event.data.content;
  });

  ScriptMessage.send(ScriptEvent.UserAnswered, id);
}
</script>

<template>
  <Dialog
    v-model:visible="isDialogVisible"
    :header="title"
    close-on-escape
    closable
    dismissable-mask
    modal
    class="m-5"
    :style="{ maxWidth: '75rem' }"
  >
    <Question
      v-if="question && !answered"
      :question="question"
      @answered="onAnswered"
    />
    <div v-else>
      <p v-text="message"></p>
    </div>
  </Dialog>
</template>

<style scoped></style>
