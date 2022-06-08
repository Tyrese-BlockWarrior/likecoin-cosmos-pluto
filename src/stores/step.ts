import { defineStore } from "pinia";

export const useStepStore = defineStore('step', {
  state: () => ({
    currentStep: 1,
    maxStep: 0,
  }),
  actions: {
    reset() {
      this.currentStep = 1;
      this.maxStep = 0;
    },
    registerStep() {
      this.maxStep += 1;
      return this.maxStep;
    },
    goToPrevStep() {
      if (this.currentStep <= 1) {
        throw new Error('Already at first step');
      }
      this.currentStep -= 1;
    },
    goToNextStep() {
      if (this.currentStep >= this.maxStep) {
        throw new Error('Already at last step');
      }
      this.currentStep += 1;
    },
  }
});

export default useStepStore;
