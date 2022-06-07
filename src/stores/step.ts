import { defineStore } from "pinia";

export const useStepStore = defineStore('step', {
  state: () => ({
    currentStep: 1,
    maxStep: 0,
  }),
  actions: {
    setup(maxStep: number) {
      this.currentStep = 1;
      this.maxStep = maxStep;
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
