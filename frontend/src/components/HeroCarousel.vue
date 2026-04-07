<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { CalendarDays, MapPin } from 'lucide-vue-next'
import type { HeroSlide } from '@/data/projects'

const props = defineProps<{
  slides: HeroSlide[]
}>()

const activeIndex = ref(0)
let intervalId: ReturnType<typeof window.setInterval> | null = null

const currentSlide = computed<HeroSlide | null>(() => props.slides[activeIndex.value] ?? props.slides[0] ?? null)

function startCarousel() {
  if (props.slides.length <= 1) {
    return
  }

  intervalId = window.setInterval(() => {
    activeIndex.value = (activeIndex.value + 1) % props.slides.length
  }, 5000)
}

function stopCarousel() {
  if (intervalId !== null) {
    window.clearInterval(intervalId)
    intervalId = null
  }
}

function setSlide(index: number) {
  activeIndex.value = index
  stopCarousel()
  startCarousel()
}

onMounted(() => {
  startCarousel()
})

onBeforeUnmount(() => {
  stopCarousel()
})
</script>

<template>
  <div class="carousel-shell">
    <Transition v-if="currentSlide" name="carousel-fade" mode="out-in">
      <article
        :key="currentSlide.title"
        class="carousel-slide"
        :style="{ backgroundImage: `linear-gradient(rgba(29, 29, 31, 0.5), rgba(29, 29, 31, 0.5)), url(${currentSlide.image})` }"
      >
        <div class="carousel-copy">
          <p class="eyebrow carousel-eyebrow">Build-To-Order Launch</p>
          <h1>{{ currentSlide.title }}</h1>

          <div class="carousel-meta">
            <span>
              <MapPin :size="18" />
              {{ currentSlide.town }}
            </span>

            <span>
              <CalendarDays :size="18" />
              Est. TOP: {{ currentSlide.topDate }}
            </span>
          </div>
        </div>
      </article>
    </Transition>

    <div v-else class="carousel-empty">Upcoming launch details will be published soon.</div>

    <div class="carousel-indicators" aria-label="Carousel navigation">
      <button
        v-for="(slide, index) in slides"
        :key="slide.title"
        :class="['carousel-indicator', { 'carousel-indicator--active': index === activeIndex }]"
        type="button"
        :aria-label="`Show ${slide.title}`"
        @click="setSlide(index)"
      />
    </div>
  </div>
</template>

<style scoped>
.carousel-shell {
  position: relative;
}

.carousel-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 320px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-grey-bg);
  color: rgba(29, 29, 31, 0.72);
}

.carousel-slide {
  position: relative;
  min-height: 520px;
  border-radius: var(--radius-sm);
  background-position: center;
  background-size: cover;
  overflow: hidden;
}

.carousel-copy {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  min-height: 520px;
  padding: 40px;
  color: var(--color-white);
}

.carousel-eyebrow {
  color: rgba(255, 255, 255, 0.82);
}

.carousel-copy h1 {
  margin: 0;
  max-width: 560px;
  font-size: clamp(2.2rem, 4vw, 4rem);
  line-height: 1;
  letter-spacing: -0.04em;
}

.carousel-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  margin-top: 18px;
  font-size: 1rem;
  font-weight: 500;
}

.carousel-meta span {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.carousel-indicators {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 18px;
}

.carousel-indicator {
  width: 10px;
  height: 10px;
  padding: 0;
  border: 0;
  border-radius: 999px;
  background: rgba(29, 29, 31, 0.22);
}

.carousel-indicator--active {
  width: 28px;
  background: var(--color-red);
}

.carousel-fade-enter-active,
.carousel-fade-leave-active {
  transition: opacity 0.45s ease;
}

.carousel-fade-enter-from,
.carousel-fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .carousel-slide,
  .carousel-copy {
    min-height: 420px;
  }

  .carousel-copy {
    padding: 28px 24px;
  }

  .carousel-meta {
    flex-direction: column;
    gap: 12px;
  }
}
</style>
