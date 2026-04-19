<script setup>
import '@/assets/css/userforms.css'

const pregunta = ''
</script>

<template>
  <div class="center-wrapper">
    <div class="form-container">
      <form method="POST">
        <h3>Verificar Pregunta de Seguridad</h3>

        <div class="input-container">
          <label for="respuesta">{{ pregunta }}</label>
          <input id="respuesta" type="text" name="respuesta" required />
        </div>

        <div class="input-container">
          <button type="submit">Verificar</button>
        </div>
      </form>
    </div>
  </div>
</template>