const __VLS_props = defineProps();
const __VLS_ctx = {
    ...{},
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['timeline__card']} */ ;
/** @type {__VLS_StyleScopedClasses['timeline__card']} */ ;
/** @type {__VLS_StyleScopedClasses['timeline']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
    ...{ class: "timeline" },
});
/** @type {__VLS_StyleScopedClasses['timeline']} */ ;
for (const [step] of __VLS_vFor((__VLS_ctx.steps))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.article, __VLS_intrinsics.article)({
        key: (step.id),
        ...{ class: "timeline__card card-surface" },
    });
    /** @type {__VLS_StyleScopedClasses['timeline__card']} */ ;
    /** @type {__VLS_StyleScopedClasses['card-surface']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "timeline__label" },
    });
    /** @type {__VLS_StyleScopedClasses['timeline__label']} */ ;
    (step.label);
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
    (step.title);
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
    (step.detail);
    // @ts-ignore
    [steps,];
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    __typeProps: {},
});
export default {};
