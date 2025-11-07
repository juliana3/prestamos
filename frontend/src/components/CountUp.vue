<template>
  <span ref="countUpRef"></span>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { CountUp } from 'countup.js';

// Define las propiedades que el componente necesita
const props = defineProps({
  endVal: {
    type: Number,
    required: true
  },
  duration: {
    type: Number,
    default: 1.2
  }
});

const countUpRef = ref(null); // Referencia al elemento <span>
let countUpInstance = null; // Variable para guardar la instancia de la animación

const startCountUp = () => {
  if (countUpRef.value) {
    // Inicializa la animación con el elemento <span> y el valor final
    countUpInstance = new CountUp(countUpRef.value, props.endVal, {
      duration: props.duration,
      separator: '.', 
      decimal: ',',
    });

    if (!countUpInstance.error) {
      countUpInstance.start(); // Inicia la animación
    } else {
      console.error('Error en CountUp.js:', countUpInstance.error);
    }
  }
};

// 1. Cuando el componente se carga, inicia la animación
onMounted(() => {
  startCountUp();
});

// 2. Si el valor final cambia (ej: cuando la API trae los datos), actualiza la animación
watch(() => props.endVal, (newVal) => {
  if (countUpInstance) {
    countUpInstance.update(newVal); // Usa el método update para la nueva animación
  } else {
    startCountUp();
  }
});
</script>