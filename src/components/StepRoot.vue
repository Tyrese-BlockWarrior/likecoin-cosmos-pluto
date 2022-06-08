<template>
  <slot></slot>
</template>

<script setup lang="ts">
import { useStepStore } from '@/stores';

const store = useStepStore();
store.reset();
</script>
