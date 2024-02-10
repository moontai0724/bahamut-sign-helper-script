<script setup lang="ts">
import type { QuizContent } from "@common/types/animad";
import Button from "primevue/button";
import Chip from "primevue/chip";
import ProgressSpinner from "primevue/progressspinner";
import { computed, ref } from "vue";

const { question } = defineProps<{ question: QuizContent }>();
const loading = ref(false);
const options = computed(() => {
  return [question.a1, question.a2, question.a3, question.a4];
});
const emit = defineEmits<{
  (e: "answered", id: number): void;
}>();

function onAnswered(index: number) {
  emit("answered", index + 1);
  loading.value = true;
}
</script>

<template>
  <div class="text-3xl font-medium text-900 mb-1">
    <span>Ｑ：</span>
    <span v-text="question.question"></span>
  </div>
  <div class="flex flex-wrap flex-row align-items-center gap-2">
    <a
      :href="`https://home.gamer.com.tw/${question.userid}`"
      target="_blank"
      rel="noopener noreferrer"
      :aria-label="question.userid"
    >
      <Chip
        v-tooltip.top="'出題者'"
        :label="question.userid"
        icon="fa-solid fa-user"
      />
    </a>
    <Chip
      v-tooltip.top="'關聯動漫'"
      :label="question.game"
      icon="fa-solid fa-tv"
    />
    <div class="flex-auto flex justify-content-end gap-3">
      <a
        href="https://www.facebook.com/animategamer"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="到官方粉絲團找答案"
      >
        <Button
          v-tooltip.top="'到官方粉絲團找答案'"
          severity="secondary"
          icon="fa-regular fa-comments"
        ></Button>
      </a>
    </div>
  </div>
  <div
    class="my-3 text-500 flex flex-wrap flex-row align-items-stretch justify-content-center gap-3"
  >
    <Button
      v-for="(option, index) in options"
      :key="index"
      :loading="loading"
      type="button"
      class="flex-grow-1 flex justify-content-center gap-1"
      @click="onAnswered(index)"
    >
      <span>{{ index + 1 }}.</span>
      <span v-text="option"></span>
    </Button>
    <ProgressSpinner
      v-if="loading"
      :style="{ position: 'absolute' }"
      aria-label="Loading"
    />
  </div>
</template>

<style scoped>
Button {
  width: 45%;
}
</style>
