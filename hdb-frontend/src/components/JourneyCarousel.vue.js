import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
const props = defineProps();
const activeIndex = ref(0);
let timer;
const activeSlide = computed(() => props.slides[activeIndex.value] ?? props.slides[0]);
function nextSlide() {
    activeIndex.value = (activeIndex.value + 1) % props.slides.length;
}
function previousSlide() {
    activeIndex.value = (activeIndex.value - 1 + props.slides.length) % props.slides.length;
}
function goToSlide(index) {
    activeIndex.value = index;
}
function startAutoplay() {
    stopAutoplay();
    timer = window.setInterval(() => {
        nextSlide();
    }, 6500);
}
function stopAutoplay() {
    if (timer) {
        window.clearInterval(timer);
    }
}
onMounted(() => {
    startAutoplay();
});
onBeforeUnmount(() => {
    stopAutoplay();
});
const __VLS_ctx = {
    ...{},
    ...{},
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['journey__head']} */ ;
/** @type {__VLS_StyleScopedClasses['journey__head']} */ ;
/** @type {__VLS_StyleScopedClasses['journey__metric']} */ ;
/** @type {__VLS_StyleScopedClasses['journey__metric']} */ ;
/** @type {__VLS_StyleScopedClasses['journey__metric']} */ ;
/** @type {__VLS_StyleScopedClasses['journey__grid']} */ ;
/** @type {__VLS_StyleScopedClasses['journey__grid']} */ ;
/** @type {__VLS_StyleScopedClasses['journey__grid']} */ ;
/** @type {__VLS_StyleScopedClasses['journey__grid']} */ ;
/** @type {__VLS_StyleScopedClasses['journey__grid']} */ ;
/** @type {__VLS_StyleScopedClasses['journey__grid']} */ ;
/** @type {__VLS_StyleScopedClasses['journey__bullets']} */ ;
/** @type {__VLS_StyleScopedClasses['journey__bullets']} */ ;
/** @type {__VLS_StyleScopedClasses['journey__dots']} */ ;
/** @type {__VLS_StyleScopedClasses['journey__dots']} */ ;
/** @type {__VLS_StyleScopedClasses['journey__head']} */ ;
/** @type {__VLS_StyleScopedClasses['journey__controls']} */ ;
/** @type {__VLS_StyleScopedClasses['journey__visual']} */ ;
/** @type {__VLS_StyleScopedClasses['journey__stage']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
    ...{ onMouseenter: (__VLS_ctx.stopAutoplay) },
    ...{ onMouseleave: (__VLS_ctx.startAutoplay) },
    ...{ class: "journey card-surface" },
    id: "journey",
});
/** @type {__VLS_StyleScopedClasses['journey']} */ ;
/** @type {__VLS_StyleScopedClasses['card-surface']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "section-tag" },
});
/** @type {__VLS_StyleScopedClasses['section-tag']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "journey__head" },
});
/** @type {__VLS_StyleScopedClasses['journey__head']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
(__VLS_ctx.activeSlide.title);
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
(__VLS_ctx.activeSlide.summary);
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "journey__stage" },
});
/** @type {__VLS_StyleScopedClasses['journey__stage']} */ ;
(__VLS_ctx.activeSlide.stage);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "journey__visual" },
});
/** @type {__VLS_StyleScopedClasses['journey__visual']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "journey__metric" },
});
/** @type {__VLS_StyleScopedClasses['journey__metric']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
(__VLS_ctx.activeSlide.metric);
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
(__VLS_ctx.activeSlide.metricLabel);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "journey__grid" },
});
/** @type {__VLS_StyleScopedClasses['journey__grid']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.ul, __VLS_intrinsics.ul)({
    ...{ class: "journey__bullets" },
});
/** @type {__VLS_StyleScopedClasses['journey__bullets']} */ ;
for (const [bullet] of __VLS_vFor((__VLS_ctx.activeSlide.bullets))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({
        key: (bullet),
    });
    (bullet);
    // @ts-ignore
    [stopAutoplay, startAutoplay, activeSlide, activeSlide, activeSlide, activeSlide, activeSlide, activeSlide,];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "journey__controls" },
});
/** @type {__VLS_StyleScopedClasses['journey__controls']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.previousSlide) },
    ...{ class: "button button--ghost" },
    type: "button",
});
/** @type {__VLS_StyleScopedClasses['button']} */ ;
/** @type {__VLS_StyleScopedClasses['button--ghost']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "journey__dots" },
});
/** @type {__VLS_StyleScopedClasses['journey__dots']} */ ;
for (const [slide, index] of __VLS_vFor((__VLS_ctx.slides))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.goToSlide(index);
                // @ts-ignore
                [previousSlide, slides, goToSlide,];
            } },
        key: (slide.id),
        type: "button",
        ...{ class: ({ 'is-active': index === __VLS_ctx.activeIndex }) },
        'aria-label': (`Show journey slide ${index + 1}`),
    });
    /** @type {__VLS_StyleScopedClasses['is-active']} */ ;
    // @ts-ignore
    [activeIndex,];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.nextSlide) },
    ...{ class: "button button--ghost" },
    type: "button",
});
/** @type {__VLS_StyleScopedClasses['button']} */ ;
/** @type {__VLS_StyleScopedClasses['button--ghost']} */ ;
// @ts-ignore
[nextSlide,];
const __VLS_export = (await import('vue')).defineComponent({
    __typeProps: {},
});
export default {};
