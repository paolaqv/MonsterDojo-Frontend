<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import '@/assets/css/inicio.css'
import '@/assets/css/navbar.css'
import logo from '@/assets/images/logo.png'
import logoMd from '@/assets/images/logo_md.png'
import food1 from '@/assets/images/food1.jpg'
import food2 from '@/assets/images/food2.jpg'
import food3 from '@/assets/images/food3.jpg'
import food4 from '@/assets/images/food4.jpg'
import food5 from '@/assets/images/food5.jpg'
import food6 from '@/assets/images/food6.jpg'
import { getCurrentUser } from '@/services/users.service'

const router = useRouter()

const menuOpen = ref(false)
const user = ref(null)

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}

const closeMenu = () => {
  menuOpen.value = false
}

onMounted(async () => {
  try {
    user.value = await getCurrentUser()
  } catch (error) {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }
})
</script>

<template>
  <div class="container">
    <header>
      <div class="navbar">
        <div class="nav-logo">
          <img :src="logo" alt="Monster Dojo" />
        </div>

        <button class="menu-toggle" @click="toggleMenu">
          <span class="fas fa-bars"></span>
        </button>

        <div class="navbar-right" :class="{ active: menuOpen }">
          <RouterLink to="/inicio_usuario" @click="closeMenu">Home</RouterLink>
          <RouterLink to="/food-menu" @click="closeMenu">Menu</RouterLink>
          <RouterLink to="/game-menu" @click="closeMenu">Productos</RouterLink>
          <RouterLink to="/user_reservations" @click="closeMenu">Reservas</RouterLink>
          <RouterLink to="/ver_pedidos" @click="closeMenu">Pedidos</RouterLink>
          <RouterLink to="/perfil_user" @click="closeMenu"><i class="fas fa-user"></i></RouterLink>
        </div>
      </div>

      <div class="overlay">
        <section id="home">
          <h1 class="h-primary">Bienvenidos a Monster Dojo</h1>
          <br />
          <button class="btn">Ordena ahora 📲</button>
        </section>
      </div>
    </header>

    <div id="menu">
      <div class="heading">
        <h1>Un poco de nuestros productos 🍕🧋</h1>
      </div>

      <div class="card">
        <img :src="food1" alt="" />
        <div class="details">
          <center>
            <div class="details-sub">
              <h5>Bebidas preparadas</h5>
            </div>
          </center>
        </div>
      </div>

      <div class="card">
        <img :src="food2" alt="" />
        <div class="details">
          <div class="details-sub">
            <h5>Tiramisu</h5>
          </div>
        </div>
      </div>

      <div class="card">
        <img :src="food3" alt="" />
        <div class="details">
          <div class="details-sub">
            <h5>Fetuccine</h5>
          </div>
        </div>
      </div>

      <div class="card">
        <img :src="food4" alt="" />
        <div class="details">
          <div class="details-sub">
            <h5>Crispy chicken</h5>
          </div>
        </div>
      </div>

      <div class="card">
        <img :src="food5" alt="" />
        <div class="details">
          <div class="details-sub">
            <h5>Pizzas</h5>
          </div>
        </div>
      </div>

      <div class="card">
        <img :src="food6" alt="" />
        <div class="details">
          <div class="details-sub">
            <h5>Affogato</h5>
          </div>
        </div>
      </div>
    </div>

    <div id="about">
      <h1 class="title">Sobre Nosotros ✨</h1>
      <div class="about_row">
        <div class="about_column" style="text-align: justify;">
          <p>
            ¡Bienvenidos a Monster Dojo! Somos más que un restaurante: somos tu destino ideal para disfrutar de una experiencia única combinando deliciosas comidas y bebidas con entretenimiento sin igual.
            En Monster Dojo, te ofrecemos una variada selección de juegos de mesa que prometen horas de diversión y risas. Nuestro compromiso con una atención de primera y ambientes acogedores hacen de cada visita una ocasión especial. Además, facilitamos tu comodidad con servicios en línea para que puedas disfrutar de nuestra oferta gastronómica y de entretenimiento desde donde estés. Ven a descubrir por qué en Monster Dojo, cada momento es una aventura deliciosa y divertida.
          </p>
        </div>

        <div class="about_column">
          <img :src="logoMd" alt="" />
        </div>
      </div>
    </div>

    <div id="order">
      <h1 class="title1">Ubicación 📍</h1>

      <div class="map-container">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m24!1m12!1m3!1d2274.5309228395176!2d-68.12594440274187!3d-16.51146091685369!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m9!3e6!4m3!3m2!1d-16.511795199999998!2d-68.1377792!4m3!3m2!1d-16.5108396!2d-68.12407!5e0!3m2!1ses-419!2sbo!4v1713545376775!5m2!1ses-419!2sbo"
          width="600"
          height="450"
          style="border: 0"
          allowfullscreen=""
          loading="lazy"
        ></iframe>

        <div class="location-info">
          <h2>Encuéntranos en el centro única sucursal de la ciudad de La Paz, Bolivia.</h2>
          <p><span class="fa-solid fa-map-pin"></span> Pasaje Hermanos Manchego 2546 (Sopocachi), La Paz, Bolivia</p>
          <p><span class="fa-solid fa-mobile-button"></span> 69904327</p>
          <p><span class="fa-solid fa-envelope"></span> kaijumonsterdojo@gmail.com</p>
        </div>
      </div>

      <h1 class="title1">Síguenos en 📲</h1>
      <div class="social-icons">
        <a
          href="https://www.instagram.com/monster.dojo?fbclid=IwZXh0bgNhZW0CMTAAAR1WPIU3x90NBQ40AVuFg6nRMv3uV0D2tRU3_kk1DceRJQy2dNcvhWafPXk_aem_AfHvXe3uWEi0-WSkTUzAsET7HigHsubTugnFw8qfkt-5ryGH0I_tZHC0oK_-g85S9rMbhbA4jvjqi2PSFT2Amjb-"
          target="_blank"
        >
          <i class="fab fa-instagram"></i>
        </a>
        <a href="https://www.facebook.com/monsterdojoBO/" target="_blank">
          <i class="fab fa-facebook-f"></i>
        </a>
        <a href="https://www.tiktok.com/@monsterdojo" target="_blank">
          <i class="fab fa-tiktok"></i>
        </a>
      </div>
      <br />
    </div>

    <footer>
      <div>
        <p>Designed by Willy y la fábrica de software 💻</p>
      </div>
    </footer>
  </div>
</template>