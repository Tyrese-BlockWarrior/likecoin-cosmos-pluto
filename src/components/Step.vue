<template>
  <div class="step-outer-container" v-show="store.currentStep === step">
    <div class="step-button-container">
      <button :disabled="step === 1" @click="store.goToPrevStep()">Prev</button>
      <button :disabled="step === store.maxStep" @click="store.goToNextStep()">Next</button>
    </div>
    <div class="step-inner-container">
      <slot></slot>
    </div>
    <div class="step-button-container">
      <button :disabled="step === 1" @click="store.goToPrevStep()">Prev</button>
      <button :disabled="step === store.maxStep" @click="store.goToNextStep()">Next</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useStepStore } from '@/stores';

const store = useStepStore();
const step = store.registerStep();
</script>

<style scoped>
.step-outer-container {
  border: 2px solid;
}

.step-inner-container {
  border: 1px solid;
}
</style>
