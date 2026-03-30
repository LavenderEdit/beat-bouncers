# 🎵 Beat Bouncers: Supervivencia Sónica 🥊

¡Hola! Bienvenido a **Beat Bouncers**, mi proyecto oficial para esta Hackathon.

Siempre he pensado que la música en los videojuegos es un acompañamiento increíble, pero...  
**¿qué pasaría si la música FUERA el campo de batalla?**

Con esa premisa en mente, desarrollé este **brawler de plataformas 2D estilo "Smash Bros"**, donde el escenario entero reacciona, se deforma y colapsa al ritmo de las frecuencias de la canción que estés escuchando.

---

## ✨ ¿Qué hace a Beat Bouncers especial?

Diseñé el juego para que sea **frenético, competitivo y completamente offline**.

### 🎹 Escenario Audio-Reactivo
Utilizando la **Web Audio API**, el motor del juego analiza las frecuencias en tiempo real:
- Frecuencias bajas → el escenario se aplana  
- Clímax / drops → el terreno se vuelve caótico y peligroso  

### ⚔️ Combate Dinámico (Daño Porcentual)
- Golpea con **Dashes (embestidas)** para aumentar el daño
- A mayor porcentaje, más lejos saldrá volando el rival
- Al llegar al **200% → Overkill (explosión)**

### ⏳ Battle Royale & Muerte Súbita
- La arena se reduce conforme avanza la canción  
- Al 90%:
  - Se activa **Muerte Súbita**
  - Cambia la música a alta tensión
  - Desaparece el suelo
  - Los jugadores obtienen **vuelo infinito**
  - Gana el último en caer  

### 🤖 Inteligencia Artificial Escalable
Bot con 3 niveles:
- Fácil  
- Normal  
- Difícil (predice caídas, busca curación y esquiva bombas)

### 🎒 Caos en Pantalla
- Power-ups: curas, alas, bombas  
- Durante el clímax:
  - Aparecen **Orbes de Disonancia** rebotando por el mapa  

### 🎮 Experiencia de Juego
- **Screen Shake** dinámico al impactar  
- Soporte nativo para **Gamepads (PlayStation/Xbox)**  

---

## 🏗️ Arquitectura y Tecnologías

Como ingeniero, el mayor reto fue mantener **60 FPS estables en navegador**.

### 🔹 Separación por Responsabilidad Única (SRP)

#### 🧩 Frontend / UI
- **React 18 + Tailwind v4**
- Renderiza:
  - Menús
  - HUD
  - Sala de espera
- Maneja:
  - Idiomas
  - LocalStorage  

#### ⚙️ Game Engine
- **Vanilla JS + HTML5 Canvas**
- Corre en su propio `requestAnimationFrame`
- React solo pasa referencias y no interfiere

💡 Resultado: rendimiento óptimo y base lista para portar a **Tauri (desktop)**

---

## 🚀 Instalación y Uso Local

El proyecto es **Offline-first**.

```bash
# Clonar repositorio
git clone <repo>

# Instalar dependencias
npm install

# Ejecutar entorno de desarrollo
npm run dev
````

Abrir en:

```
http://localhost:5173
```

---

## 🎶 Sobre las pistas de audio

* Puedes subir:

  * Archivos **MP3/WAV**
  * Usar el **micrófono en vivo** (sí, gritar funciona 😄)

* Incluye pistas oficiales creadas por:

  * 🎧 **[Riian](https://open.spotify.com/intl-es/artist/7wrNd8g64twWej7DcZEMKd?si=RSXlzXUiR_mtFJwmQllH8A) (productor musical)**
  * 🎧 **[KybaRap](https://www.youtube.com/@KybaRap/videos) (productor musical)**

---

## 🕹️ Controles

### 🎹 Teclado

| Acción         | Jugador 1 | Jugador 2 |
| -------------- | --------- | --------- |
| Moverse        | A / D     | ← / →     |
| Saltar / Volar | W         | ↑         |
| Dash           | F         | Shift     |

### 🎮 Gamepad

* Movimiento → Joystick
* Saltar → A / Cruz
* Dash → X / Cuadrado

---

## ⚙️ Funciones Adicionales

### 🌐 Internacionalización (i18n)

* Español 🇪🇸
* Inglés 🇬🇧
* Implementación sin librerías externas

### 💾 Persistencia

Configuraciones guardadas en `localStorage`:

* Volumen
* Temas visuales:

  * Neón
  * Matrix
  * Luna de Sangre
* Vidas
* Partículas

### 🌌 Screen Wrap

* Salir por un lado → apareces en el opuesto
* Caer → reapareces desde arriba (estilo Pac-Man)

---

## 💬 Nota del desarrollador

Desarrollar:

* Física personalizada
* Análisis de ondas de audio
* Máquina de estados del motor

...ha sido **exigente pero increíblemente gratificante**.

---

## ❤️ Créditos

Desarrollado con:

* Pasión
* Música
* Código puro

---

🔥 *Gracias por probar Beat Bouncers*
