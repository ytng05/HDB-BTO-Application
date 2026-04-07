<script setup lang="ts">
import { ArrowRight, CalendarDays, LayoutList, MapPin } from 'lucide-vue-next'
import type { UpcomingProject } from '@/data/projects'

defineProps<{
  project: UpcomingProject
}>()
</script>

<template>
  <article class="surface project-card">
    <img class="project-card__image" :src="project.image" :alt="project.title" loading="lazy" />

    <div class="project-card__body">
      <div>
        <h3>{{ project.title }}</h3>

        <div class="project-card__meta">
          <p>
            <MapPin :size="16" />
            <span>{{ project.town }}</span>
          </p>
          <p>
            <LayoutList :size="16" />
            <span>{{ project.flatTypes }}</span>
          </p>
          <p>
            <CalendarDays :size="16" />
            <span>{{ project.openDate }} to {{ project.closeDate }}</span>
          </p>
        </div>
      </div>

      <button class="btn btn-secondary project-card__button" type="button">
        <span>View Details</span>
        <ArrowRight :size="16" />
      </button>
    </div>
  </article>
</template>

<style scoped>
.project-card {
  display: grid;
  grid-template-rows: 220px 1fr;
  overflow: hidden;
}

.project-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.project-card__body {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 24px;
  padding: 24px;
}

.project-card h3 {
  margin: 0 0 14px;
  font-size: 1.3rem;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

.project-card__meta {
  display: grid;
  gap: 12px;
}

.project-card__meta p {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin: 0;
  color: rgba(29, 29, 31, 0.74);
}

.project-card__button {
  width: fit-content;
}

@media (max-width: 640px) {
  .project-card__button {
    width: 100%;
  }
}
</style>
