<template>
  <div>
    <h1>Pluto</h1>
    <div>
      <router-link to="/multisig">Create multisig wallet</router-link>
    </div>
    <div>
      <router-link to="/tx">Create / Sign tx</router-link>
    </div>
    <div>
      <router-link to="/combine-signatures">Combine signatures / broadcast tx</router-link>
    </div>
    <router-view></router-view>
  </div>
</template>

<script setup lang="ts">
</script>
