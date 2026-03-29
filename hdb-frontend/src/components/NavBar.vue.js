import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { store, isLoggedIn, isAdmin, logout, openLoginModal } from '../store/index';
const router = useRouter();
const route = useRoute();
const scrolled = ref(false);
const dropdownOpen = ref(false);
const mobileMenuOpen = ref(false);
function onScroll() {
    scrolled.value = window.scrollY > 8;
}
onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }));
onUnmounted(() => window.removeEventListener('scroll', onScroll));
const firstName = computed(() => store.currentUser?.name.split(' ')[0] ?? '');
const initial = computed(() => store.currentUser?.name?.[0] ?? '?');
function handleSignIn() {
    openLoginModal();
    mobileMenuOpen.value = false;
}
function handleLogout() {
    logout();
    dropdownOpen.value = false;
    mobileMenuOpen.value = false;
    router.push('/');
}
function goTo(path) {
    if ((path === '/my-application' || path === '/select-flat') && !isLoggedIn.value) {
        openLoginModal();
        return;
    }
    router.push(path);
    dropdownOpen.value = false;
    mobileMenuOpen.value = false;
}
function isActive(path) {
    if (path === '/')
        return route.path === '/';
    return route.path.startsWith(path);
}
// Close dropdown on outside click
function onDocClick(e) {
    const target = e.target;
    if (!target.closest('.nav-user'))
        dropdownOpen.value = false;
}
onMounted(() => document.addEventListener('click', onDocClick));
onUnmounted(() => document.removeEventListener('click', onDocClick));
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['nav-link']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-user__trigger']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-dropdown__header']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-dropdown__header']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-dropdown__item']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-dropdown__item--danger']} */ ;
/** @type {__VLS_StyleScopedClasses['hamburger-line']} */ ;
/** @type {__VLS_StyleScopedClasses['hamburger-line']} */ ;
/** @type {__VLS_StyleScopedClasses['hamburger-line']} */ ;
/** @type {__VLS_StyleScopedClasses['hamburger-line']} */ ;
/** @type {__VLS_StyleScopedClasses['hamburger-line']} */ ;
/** @type {__VLS_StyleScopedClasses['hamburger-line']} */ ;
/** @type {__VLS_StyleScopedClasses['hamburger-line--open']} */ ;
/** @type {__VLS_StyleScopedClasses['hamburger-line--open']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-link']} */ ;
/** @type {__VLS_StyleScopedClasses['navbar__links']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-hamburger']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-user__name']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)({
    ...{ class: (['navbar', __VLS_ctx.scrolled && 'navbar--scrolled']) },
});
/** @type {__VLS_StyleScopedClasses['navbar']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "navbar__inner wrap" },
});
/** @type {__VLS_StyleScopedClasses['navbar__inner']} */ ;
/** @type {__VLS_StyleScopedClasses['wrap']} */ ;
let __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.RouterLink | typeof __VLS_components.RouterLink} */
RouterLink;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    ...{ 'onClick': {} },
    to: "/",
    ...{ class: "navbar__logo" },
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClick': {} },
    to: "/",
    ...{ class: "navbar__logo" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_5;
const __VLS_6 = ({ click: {} },
    { onClick: (...[$event]) => {
            __VLS_ctx.mobileMenuOpen = false;
            // @ts-ignore
            [scrolled, mobileMenuOpen,];
        } });
/** @type {__VLS_StyleScopedClasses['navbar__logo']} */ ;
const { default: __VLS_7 } = __VLS_3.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "logo-crest" },
});
/** @type {__VLS_StyleScopedClasses['logo-crest']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "logo-text" },
});
/** @type {__VLS_StyleScopedClasses['logo-text']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "logo-text__name" },
});
/** @type {__VLS_StyleScopedClasses['logo-text__name']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "logo-text__sub" },
});
/** @type {__VLS_StyleScopedClasses['logo-text__sub']} */ ;
// @ts-ignore
[];
var __VLS_3;
var __VLS_4;
__VLS_asFunctionalElement1(__VLS_intrinsics.nav, __VLS_intrinsics.nav)({
    ...{ class: "navbar__links" },
});
/** @type {__VLS_StyleScopedClasses['navbar__links']} */ ;
let __VLS_8;
/** @ts-ignore @type {typeof __VLS_components.RouterLink | typeof __VLS_components.RouterLink} */
RouterLink;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({
    to: "/",
    ...{ class: (['nav-link', __VLS_ctx.isActive('/') && 'nav-link--active']) },
}));
const __VLS_10 = __VLS_9({
    to: "/",
    ...{ class: (['nav-link', __VLS_ctx.isActive('/') && 'nav-link--active']) },
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
/** @type {__VLS_StyleScopedClasses['nav-link']} */ ;
const { default: __VLS_13 } = __VLS_11.slots;
// @ts-ignore
[isActive,];
var __VLS_11;
__VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
    href: "/#launches",
    ...{ class: "nav-link" },
});
/** @type {__VLS_StyleScopedClasses['nav-link']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.goTo('/my-application');
            // @ts-ignore
            [goTo,];
        } },
    ...{ class: "nav-link btn-ghost" },
    ...{ style: {} },
    ...{ class: ({ 'nav-link--active': __VLS_ctx.isActive('/my-application') }) },
});
/** @type {__VLS_StyleScopedClasses['nav-link']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-ghost']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-link--active']} */ ;
if (__VLS_ctx.isAdmin || !__VLS_ctx.isLoggedIn) {
    let __VLS_14;
    /** @ts-ignore @type {typeof __VLS_components.RouterLink | typeof __VLS_components.RouterLink} */
    RouterLink;
    // @ts-ignore
    const __VLS_15 = __VLS_asFunctionalComponent1(__VLS_14, new __VLS_14({
        to: "/admin",
        ...{ class: (['nav-link nav-link--muted', __VLS_ctx.isActive('/admin') && 'nav-link--active']) },
    }));
    const __VLS_16 = __VLS_15({
        to: "/admin",
        ...{ class: (['nav-link nav-link--muted', __VLS_ctx.isActive('/admin') && 'nav-link--active']) },
    }, ...__VLS_functionalComponentArgsRest(__VLS_15));
    /** @type {__VLS_StyleScopedClasses['nav-link']} */ ;
    /** @type {__VLS_StyleScopedClasses['nav-link--muted']} */ ;
    const { default: __VLS_19 } = __VLS_17.slots;
    // @ts-ignore
    [isActive, isActive, isAdmin, isLoggedIn,];
    var __VLS_17;
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "navbar__actions" },
});
/** @type {__VLS_StyleScopedClasses['navbar__actions']} */ ;
if (!__VLS_ctx.isLoggedIn) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.handleSignIn) },
        ...{ class: "btn btn-primary btn-sm" },
    });
    /** @type {__VLS_StyleScopedClasses['btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-sm']} */ ;
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "nav-user" },
    });
    /** @type {__VLS_StyleScopedClasses['nav-user']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!!(!__VLS_ctx.isLoggedIn))
                    return;
                __VLS_ctx.dropdownOpen = !__VLS_ctx.dropdownOpen;
                // @ts-ignore
                [isLoggedIn, handleSignIn, dropdownOpen, dropdownOpen,];
            } },
        ...{ class: "nav-user__trigger" },
    });
    /** @type {__VLS_StyleScopedClasses['nav-user__trigger']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "nav-user__avatar" },
    });
    /** @type {__VLS_StyleScopedClasses['nav-user__avatar']} */ ;
    (__VLS_ctx.initial);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "nav-user__name" },
    });
    /** @type {__VLS_StyleScopedClasses['nav-user__name']} */ ;
    (__VLS_ctx.firstName);
    __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
        width: "14",
        height: "14",
        viewBox: "0 0 14 14",
        fill: "none",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
        d: "M3 5l4 4 4-4",
        stroke: "currentColor",
        'stroke-width': "1.5",
        'stroke-linecap': "round",
    });
    let __VLS_20;
    /** @ts-ignore @type {typeof __VLS_components.Transition | typeof __VLS_components.Transition} */
    Transition;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20({
        name: "dropdown",
    }));
    const __VLS_22 = __VLS_21({
        name: "dropdown",
    }, ...__VLS_functionalComponentArgsRest(__VLS_21));
    const { default: __VLS_25 } = __VLS_23.slots;
    if (__VLS_ctx.dropdownOpen) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "nav-dropdown" },
        });
        /** @type {__VLS_StyleScopedClasses['nav-dropdown']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "nav-dropdown__header" },
        });
        /** @type {__VLS_StyleScopedClasses['nav-dropdown__header']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
        (__VLS_ctx.store.currentUser?.name);
        __VLS_asFunctionalElement1(__VLS_intrinsics.small, __VLS_intrinsics.small)({});
        (__VLS_ctx.store.currentUser?.nric);
        __VLS_asFunctionalElement1(__VLS_intrinsics.hr)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(!__VLS_ctx.isLoggedIn))
                        return;
                    if (!(__VLS_ctx.dropdownOpen))
                        return;
                    __VLS_ctx.goTo('/my-application');
                    // @ts-ignore
                    [goTo, dropdownOpen, initial, firstName, store, store,];
                } },
            ...{ class: "nav-dropdown__item" },
        });
        /** @type {__VLS_StyleScopedClasses['nav-dropdown__item']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
            width: "16",
            height: "16",
            viewBox: "0 0 16 16",
            fill: "none",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.rect)({
            x: "2",
            y: "2",
            width: "12",
            height: "12",
            rx: "2",
            stroke: "currentColor",
            'stroke-width': "1.5",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
            d: "M5 8h6M5 5.5h6M5 10.5h4",
            stroke: "currentColor",
            'stroke-width': "1.5",
            'stroke-linecap': "round",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(!__VLS_ctx.isLoggedIn))
                        return;
                    if (!(__VLS_ctx.dropdownOpen))
                        return;
                    __VLS_ctx.goTo('/select-flat');
                    // @ts-ignore
                    [goTo,];
                } },
            ...{ class: "nav-dropdown__item" },
        });
        /** @type {__VLS_StyleScopedClasses['nav-dropdown__item']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
            width: "16",
            height: "16",
            viewBox: "0 0 16 16",
            fill: "none",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
            d: "M8 2L2 7h2v7h4v-4h2v4h4V7h2L8 2z",
            stroke: "currentColor",
            'stroke-width': "1.5",
            'stroke-linejoin': "round",
        });
        if (__VLS_ctx.isAdmin) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (...[$event]) => {
                        if (!!(!__VLS_ctx.isLoggedIn))
                            return;
                        if (!(__VLS_ctx.dropdownOpen))
                            return;
                        if (!(__VLS_ctx.isAdmin))
                            return;
                        __VLS_ctx.goTo('/admin');
                        // @ts-ignore
                        [goTo, isAdmin,];
                    } },
                ...{ class: "nav-dropdown__item" },
            });
            /** @type {__VLS_StyleScopedClasses['nav-dropdown__item']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
                width: "16",
                height: "16",
                viewBox: "0 0 16 16",
                fill: "none",
            });
            __VLS_asFunctionalElement1(__VLS_intrinsics.circle)({
                cx: "8",
                cy: "8",
                r: "5.5",
                stroke: "currentColor",
                'stroke-width': "1.5",
            });
            __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
                d: "M8 5.5v2.5l2 1.5",
                stroke: "currentColor",
                'stroke-width': "1.5",
                'stroke-linecap': "round",
            });
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.hr)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (__VLS_ctx.handleLogout) },
            ...{ class: "nav-dropdown__item nav-dropdown__item--danger" },
        });
        /** @type {__VLS_StyleScopedClasses['nav-dropdown__item']} */ ;
        /** @type {__VLS_StyleScopedClasses['nav-dropdown__item--danger']} */ ;
    }
    // @ts-ignore
    [handleLogout,];
    var __VLS_23;
}
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.mobileMenuOpen = !__VLS_ctx.mobileMenuOpen;
            // @ts-ignore
            [mobileMenuOpen, mobileMenuOpen,];
        } },
    ...{ class: "nav-hamburger" },
    'aria-label': "Menu",
});
/** @type {__VLS_StyleScopedClasses['nav-hamburger']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: (['hamburger-line', __VLS_ctx.mobileMenuOpen && 'hamburger-line--open']) },
});
/** @type {__VLS_StyleScopedClasses['hamburger-line']} */ ;
let __VLS_26;
/** @ts-ignore @type {typeof __VLS_components.Transition | typeof __VLS_components.Transition} */
Transition;
// @ts-ignore
const __VLS_27 = __VLS_asFunctionalComponent1(__VLS_26, new __VLS_26({
    name: "mobile-menu",
}));
const __VLS_28 = __VLS_27({
    name: "mobile-menu",
}, ...__VLS_functionalComponentArgsRest(__VLS_27));
const { default: __VLS_31 } = __VLS_29.slots;
if (__VLS_ctx.mobileMenuOpen) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "navbar__mobile" },
    });
    /** @type {__VLS_StyleScopedClasses['navbar__mobile']} */ ;
    let __VLS_32;
    /** @ts-ignore @type {typeof __VLS_components.RouterLink | typeof __VLS_components.RouterLink} */
    RouterLink;
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent1(__VLS_32, new __VLS_32({
        ...{ 'onClick': {} },
        to: "/",
        ...{ class: "mobile-link" },
    }));
    const __VLS_34 = __VLS_33({
        ...{ 'onClick': {} },
        to: "/",
        ...{ class: "mobile-link" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    let __VLS_37;
    const __VLS_38 = ({ click: {} },
        { onClick: (...[$event]) => {
                if (!(__VLS_ctx.mobileMenuOpen))
                    return;
                __VLS_ctx.mobileMenuOpen = false;
                // @ts-ignore
                [mobileMenuOpen, mobileMenuOpen, mobileMenuOpen,];
            } });
    /** @type {__VLS_StyleScopedClasses['mobile-link']} */ ;
    const { default: __VLS_39 } = __VLS_35.slots;
    // @ts-ignore
    [];
    var __VLS_35;
    var __VLS_36;
    __VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.mobileMenuOpen))
                    return;
                __VLS_ctx.mobileMenuOpen = false;
                // @ts-ignore
                [mobileMenuOpen,];
            } },
        href: "/#launches",
        ...{ class: "mobile-link" },
    });
    /** @type {__VLS_StyleScopedClasses['mobile-link']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.mobileMenuOpen))
                    return;
                __VLS_ctx.goTo('/my-application');
                // @ts-ignore
                [goTo,];
            } },
        ...{ class: "mobile-link" },
    });
    /** @type {__VLS_StyleScopedClasses['mobile-link']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.mobileMenuOpen))
                    return;
                __VLS_ctx.goTo('/select-flat');
                // @ts-ignore
                [goTo,];
            } },
        ...{ class: "mobile-link" },
    });
    /** @type {__VLS_StyleScopedClasses['mobile-link']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.mobileMenuOpen))
                    return;
                __VLS_ctx.goTo('/admin');
                // @ts-ignore
                [goTo,];
            } },
        ...{ class: "mobile-link mobile-link--muted" },
    });
    /** @type {__VLS_StyleScopedClasses['mobile-link']} */ ;
    /** @type {__VLS_StyleScopedClasses['mobile-link--muted']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.hr)({
        ...{ class: "mobile-divider" },
    });
    /** @type {__VLS_StyleScopedClasses['mobile-divider']} */ ;
    if (!__VLS_ctx.isLoggedIn) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (__VLS_ctx.handleSignIn) },
            ...{ class: "btn btn-primary" },
            ...{ style: {} },
        });
        /** @type {__VLS_StyleScopedClasses['btn']} */ ;
        /** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (__VLS_ctx.handleLogout) },
            ...{ class: "btn btn-outline" },
            ...{ style: {} },
        });
        /** @type {__VLS_StyleScopedClasses['btn']} */ ;
        /** @type {__VLS_StyleScopedClasses['btn-outline']} */ ;
    }
}
// @ts-ignore
[isLoggedIn, handleSignIn, handleLogout,];
var __VLS_29;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
