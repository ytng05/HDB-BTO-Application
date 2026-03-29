const __VLS_props = defineProps();
const __VLS_emit = defineEmits();
const __VLS_ctx = {
    ...{},
    ...{},
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['brandmark']} */ ;
/** @type {__VLS_StyleScopedClasses['topbar__nav']} */ ;
/** @type {__VLS_StyleScopedClasses['profile-button']} */ ;
/** @type {__VLS_StyleScopedClasses['profile-button__copy']} */ ;
/** @type {__VLS_StyleScopedClasses['profile-button__copy']} */ ;
/** @type {__VLS_StyleScopedClasses['topbar']} */ ;
/** @type {__VLS_StyleScopedClasses['topbar__nav']} */ ;
/** @type {__VLS_StyleScopedClasses['topbar__actions']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)({
    ...{ class: "topbar card-surface" },
});
/** @type {__VLS_StyleScopedClasses['topbar']} */ ;
/** @type {__VLS_StyleScopedClasses['card-surface']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "brandmark" },
});
/** @type {__VLS_StyleScopedClasses['brandmark']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "brandmark__crest" },
});
/** @type {__VLS_StyleScopedClasses['brandmark__crest']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "section-tag" },
});
/** @type {__VLS_StyleScopedClasses['section-tag']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.nav, __VLS_intrinsics.nav)({
    ...{ class: "topbar__nav" },
});
/** @type {__VLS_StyleScopedClasses['topbar__nav']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
    href: "#dashboard",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
    href: "#journey",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
    href: "#launches",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "topbar__actions" },
});
/** @type {__VLS_StyleScopedClasses['topbar__actions']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.$emit('apply');
            // @ts-ignore
            [$emit,];
        } },
    ...{ class: "button button--secondary" },
    type: "button",
});
/** @type {__VLS_StyleScopedClasses['button']} */ ;
/** @type {__VLS_StyleScopedClasses['button--secondary']} */ ;
(__VLS_ctx.isLoggedIn ? 'Continue application' : 'Apply now');
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.$emit('toggleProfile');
            // @ts-ignore
            [$emit, isLoggedIn,];
        } },
    ...{ class: "profile-button" },
    type: "button",
});
/** @type {__VLS_StyleScopedClasses['profile-button']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "profile-button__avatar" },
});
/** @type {__VLS_StyleScopedClasses['profile-button__avatar']} */ ;
(__VLS_ctx.displayName.slice(0, 1));
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "profile-button__copy" },
});
/** @type {__VLS_StyleScopedClasses['profile-button__copy']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
(__VLS_ctx.displayName);
__VLS_asFunctionalElement1(__VLS_intrinsics.small, __VLS_intrinsics.small)({});
(__VLS_ctx.isLoggedIn ? 'Open applicant details' : 'Sign in to continue');
// @ts-ignore
[isLoggedIn, displayName, displayName,];
const __VLS_export = (await import('vue')).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
export default {};
