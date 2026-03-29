import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { store, login, closeLoginModal } from '../store/index';
import { demoUsers } from '../data/home';
const router = useRouter();
const nric = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);
watch(() => store.showLoginModal, (open) => {
    if (open) {
        nric.value = '';
        password.value = '';
        error.value = '';
    }
});
function handleSubmit() {
    if (!nric.value || !password.value) {
        error.value = 'Please enter your NRIC and password.';
        return;
    }
    loading.value = true;
    error.value = '';
    // Simulate a brief network delay for realism
    setTimeout(() => {
        const user = demoUsers.find((u) => u.nric === nric.value.trim().toUpperCase() && u.password === password.value);
        if (!user) {
            error.value = 'NRIC or password is incorrect. Try one of the demo accounts below.';
            loading.value = false;
            return;
        }
        login(user);
        loading.value = false;
        if (user.role === 'admin') {
            router.push('/admin');
        }
        else {
            router.push('/my-application');
        }
    }, 600);
}
function fillDemo(n, p) {
    nric.value = n;
    password.value = p;
    error.value = '';
}
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['modal-close']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-submit']} */ ;
/** @type {__VLS_StyleScopedClasses['demo-pill']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-enter-active']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-card']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-enter-from']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-card']} */ ;
let __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.Transition | typeof __VLS_components.Transition} */
Transition;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    name: "modal",
}));
const __VLS_2 = __VLS_1({
    name: "modal",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
const { default: __VLS_5 } = __VLS_3.slots;
if (__VLS_ctx.store.showLoginModal) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: (__VLS_ctx.closeLoginModal) },
        ...{ class: "modal-backdrop" },
    });
    /** @type {__VLS_StyleScopedClasses['modal-backdrop']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "modal-card" },
        role: "dialog",
        'aria-modal': "true",
        'aria-labelledby': "modal-title",
    });
    /** @type {__VLS_StyleScopedClasses['modal-card']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.closeLoginModal) },
        ...{ class: "modal-close" },
        'aria-label': "Close",
    });
    /** @type {__VLS_StyleScopedClasses['modal-close']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
        width: "18",
        height: "18",
        viewBox: "0 0 18 18",
        fill: "none",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
        d: "M4 4l10 10M14 4L4 14",
        stroke: "currentColor",
        'stroke-width': "1.8",
        'stroke-linecap': "round",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "modal-logo" },
    });
    /** @type {__VLS_StyleScopedClasses['modal-logo']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "logo-crest-sm" },
    });
    /** @type {__VLS_StyleScopedClasses['logo-crest-sm']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
        id: "modal-title",
        ...{ class: "modal-title" },
    });
    /** @type {__VLS_StyleScopedClasses['modal-title']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "modal-sub" },
    });
    /** @type {__VLS_StyleScopedClasses['modal-sub']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.form, __VLS_intrinsics.form)({
        ...{ onSubmit: (__VLS_ctx.handleSubmit) },
        ...{ class: "modal-form" },
    });
    /** @type {__VLS_StyleScopedClasses['modal-form']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "field" },
    });
    /** @type {__VLS_StyleScopedClasses['field']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        for: "nric-input",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        id: "nric-input",
        value: (__VLS_ctx.nric),
        type: "text",
        placeholder: "e.g. S1234567A",
        autocomplete: "username",
        spellcheck: "false",
        ...{ style: {} },
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "field" },
    });
    /** @type {__VLS_StyleScopedClasses['field']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        for: "pw-input",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        id: "pw-input",
        type: "password",
        placeholder: "Enter your password",
        autocomplete: "current-password",
    });
    (__VLS_ctx.password);
    let __VLS_6;
    /** @ts-ignore @type {typeof __VLS_components.Transition | typeof __VLS_components.Transition} */
    Transition;
    // @ts-ignore
    const __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({
        name: "fade-msg",
    }));
    const __VLS_8 = __VLS_7({
        name: "fade-msg",
    }, ...__VLS_functionalComponentArgsRest(__VLS_7));
    const { default: __VLS_11 } = __VLS_9.slots;
    if (__VLS_ctx.error) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "modal-error" },
            role: "alert",
        });
        /** @type {__VLS_StyleScopedClasses['modal-error']} */ ;
        (__VLS_ctx.error);
    }
    // @ts-ignore
    [store, closeLoginModal, closeLoginModal, handleSubmit, nric, password, error, error,];
    var __VLS_9;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        type: "submit",
        ...{ class: "btn btn-primary btn-lg modal-submit" },
        disabled: (__VLS_ctx.loading),
    });
    /** @type {__VLS_StyleScopedClasses['btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['modal-submit']} */ ;
    if (__VLS_ctx.loading) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "spinner" },
        });
        /** @type {__VLS_StyleScopedClasses['spinner']} */ ;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.loading ? 'Signing in…' : 'Sign in');
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "modal-demo" },
    });
    /** @type {__VLS_StyleScopedClasses['modal-demo']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "modal-demo__label" },
    });
    /** @type {__VLS_StyleScopedClasses['modal-demo__label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "modal-demo__list" },
    });
    /** @type {__VLS_StyleScopedClasses['modal-demo__list']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.store.showLoginModal))
                    return;
                __VLS_ctx.fillDemo('S1234567A', 'apple123');
                // @ts-ignore
                [loading, loading, loading, fillDemo,];
            } },
        ...{ class: "demo-pill" },
    });
    /** @type {__VLS_StyleScopedClasses['demo-pill']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "demo-pill__name" },
    });
    /** @type {__VLS_StyleScopedClasses['demo-pill__name']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "demo-pill__cred" },
    });
    /** @type {__VLS_StyleScopedClasses['demo-pill__cred']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.store.showLoginModal))
                    return;
                __VLS_ctx.fillDemo('S7654321D', 'redhome');
                // @ts-ignore
                [fillDemo,];
            } },
        ...{ class: "demo-pill" },
    });
    /** @type {__VLS_StyleScopedClasses['demo-pill']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "demo-pill__name" },
    });
    /** @type {__VLS_StyleScopedClasses['demo-pill__name']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "demo-pill__cred" },
    });
    /** @type {__VLS_StyleScopedClasses['demo-pill__cred']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.store.showLoginModal))
                    return;
                __VLS_ctx.fillDemo('T0000001Z', 'admin2026');
                // @ts-ignore
                [fillDemo,];
            } },
        ...{ class: "demo-pill" },
    });
    /** @type {__VLS_StyleScopedClasses['demo-pill']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "demo-pill__name" },
    });
    /** @type {__VLS_StyleScopedClasses['demo-pill__name']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "demo-pill__cred" },
    });
    /** @type {__VLS_StyleScopedClasses['demo-pill__cred']} */ ;
}
// @ts-ignore
[];
var __VLS_3;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
