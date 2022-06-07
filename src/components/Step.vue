<template>
  <div v-show="store.currentStep === props.step">
    <div>
      <slot></slot>
    </div>
    <div>
      <button :disabled="props.step === 1" @click="store.goToPrevStep()">Prev</button>
      <button :disabled="props.step === store.maxStep" @click="store.goToNextStep()">Next</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useStepStore } from '@/stores';

const store = useStepStore();

const props = defineProps<{
  step: number
}>();
</script>
