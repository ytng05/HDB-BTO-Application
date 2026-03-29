const __VLS_props = defineProps();
const __VLS_ctx = {
    ...{},
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['launch-card']} */ ;
/** @type {__VLS_StyleScopedClasses['launch-card__chips']} */ ;
/** @type {__VLS_StyleScopedClasses['launch-card__footer']} */ ;
/** @type {__VLS_StyleScopedClasses['launch-card__footer']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['launches__grid']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
    ...{ class: "launches" },
    id: "launches",
});
/** @type {__VLS_StyleScopedClasses['launches']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "section-header" },
});
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "section-tag" },
});
/** @type {__VLS_StyleScopedClasses['section-tag']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "section-header__note" },
});
/** @type {__VLS_StyleScopedClasses['section-header__note']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "launches__grid" },
});
/** @type {__VLS_StyleScopedClasses['launches__grid']} */ ;
for (const [launch] of __VLS_vFor((__VLS_ctx.launches))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.article, __VLS_intrinsics.article)({
        key: (launch.id),
        ...{ class: "launch-card card-surface" },
    });
    /** @type {__VLS_StyleScopedClasses['launch-card']} */ ;
    /** @type {__VLS_StyleScopedClasses['card-surface']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "launch-card__header" },
    });
    /** @type {__VLS_StyleScopedClasses['launch-card__header']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "launch-card__month" },
    });
    /** @type {__VLS_StyleScopedClasses['launch-card__month']} */ ;
    (launch.month);
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
    (launch.project);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "launch-card__status" },
    });
    /** @type {__VLS_StyleScopedClasses['launch-card__status']} */ ;
    (launch.status);
    __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({
        ...{ class: "launch-card__town" },
    });
    /** @type {__VLS_StyleScopedClasses['launch-card__town']} */ ;
    (launch.town);
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "launch-card__summary" },
    });
    /** @type {__VLS_StyleScopedClasses['launch-card__summary']} */ ;
    (launch.summary);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "launch-card__chips" },
    });
    /** @type {__VLS_StyleScopedClasses['launch-card__chips']} */ ;
    for (const [flatType] of __VLS_vFor((launch.flatTypes))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            key: (flatType),
        });
        (flatType);
        // @ts-ignore
        [launches,];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "launch-card__footer" },
    });
    /** @type {__VLS_StyleScopedClasses['launch-card__footer']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
    (launch.window);
    // @ts-ignore
    [];
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    __typeProps: {},
});
export default {};
