import { useRouter } from 'vue-router';
import { isLoggedIn, openLoginModal } from '../store/index';
import { upcomingLaunches } from '../data/home';
const router = useRouter();
function handleApply() {
    if (!isLoggedIn.value) {
        openLoginModal();
        return;
    }
    router.push('/my-application');
}
function statusBadge(s) {
    if (s === 'Upcoming')
        return 'badge badge-red';
    if (s === 'Preview soon')
        return 'badge badge-amber';
    return 'badge badge-gray';
}
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['stat']} */ ;
/** @type {__VLS_StyleScopedClasses['stat']} */ ;
/** @type {__VLS_StyleScopedClasses['hiw__step']} */ ;
/** @type {__VLS_StyleScopedClasses['hiw__step']} */ ;
/** @type {__VLS_StyleScopedClasses['hiw__step']} */ ;
/** @type {__VLS_StyleScopedClasses['hiw__step']} */ ;
/** @type {__VLS_StyleScopedClasses['lcard']} */ ;
/** @type {__VLS_StyleScopedClasses['site-footer__brand']} */ ;
/** @type {__VLS_StyleScopedClasses['site-footer__brand']} */ ;
/** @type {__VLS_StyleScopedClasses['site-footer__brand']} */ ;
/** @type {__VLS_StyleScopedClasses['site-footer__links']} */ ;
/** @type {__VLS_StyleScopedClasses['site-footer__links']} */ ;
/** @type {__VLS_StyleScopedClasses['site-footer__links']} */ ;
/** @type {__VLS_StyleScopedClasses['hiw__steps']} */ ;
/** @type {__VLS_StyleScopedClasses['hiw__step']} */ ;
/** @type {__VLS_StyleScopedClasses['hiw__step']} */ ;
/** @type {__VLS_StyleScopedClasses['hiw__step']} */ ;
/** @type {__VLS_StyleScopedClasses['launches__grid']} */ ;
/** @type {__VLS_StyleScopedClasses['launches__header']} */ ;
/** @type {__VLS_StyleScopedClasses['hero']} */ ;
/** @type {__VLS_StyleScopedClasses['hiw__steps']} */ ;
/** @type {__VLS_StyleScopedClasses['hiw__step']} */ ;
/** @type {__VLS_StyleScopedClasses['hiw__step']} */ ;
/** @type {__VLS_StyleScopedClasses['stat']} */ ;
/** @type {__VLS_StyleScopedClasses['cta-band__inner']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
    ...{ class: "hero" },
});
/** @type {__VLS_StyleScopedClasses['hero']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "wrap hero__inner" },
});
/** @type {__VLS_StyleScopedClasses['wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['hero__inner']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "eyebrow" },
});
/** @type {__VLS_StyleScopedClasses['eyebrow']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({
    ...{ class: "hero__title" },
});
/** @type {__VLS_StyleScopedClasses['hero__title']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.br)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "hero__sub" },
});
/** @type {__VLS_StyleScopedClasses['hero__sub']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "hero__ctas" },
});
/** @type {__VLS_StyleScopedClasses['hero__ctas']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.handleApply) },
    ...{ class: "btn btn-primary btn-lg" },
});
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-lg']} */ ;
(__VLS_ctx.isLoggedIn ? 'My application →' : 'Begin application');
__VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
    ...{ class: "btn btn-secondary btn-lg" },
    href: "#launches",
});
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-lg']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "hero__gradient" },
});
/** @type {__VLS_StyleScopedClasses['hero__gradient']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stats-strip" },
});
/** @type {__VLS_StyleScopedClasses['stats-strip']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "wrap stats-strip__inner" },
});
/** @type {__VLS_StyleScopedClasses['wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-strip__inner']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat" },
});
/** @type {__VLS_StyleScopedClasses['stat']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-sep" },
});
/** @type {__VLS_StyleScopedClasses['stat-sep']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat" },
});
/** @type {__VLS_StyleScopedClasses['stat']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-sep" },
});
/** @type {__VLS_StyleScopedClasses['stat-sep']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat" },
});
/** @type {__VLS_StyleScopedClasses['stat']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-sep" },
});
/** @type {__VLS_StyleScopedClasses['stat-sep']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat" },
});
/** @type {__VLS_StyleScopedClasses['stat']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({
    ...{ class: "stat--open" },
});
/** @type {__VLS_StyleScopedClasses['stat--open']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
    ...{ class: "hiw" },
});
/** @type {__VLS_StyleScopedClasses['hiw']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "wrap" },
});
/** @type {__VLS_StyleScopedClasses['wrap']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "hiw__header" },
});
/** @type {__VLS_StyleScopedClasses['hiw__header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "eyebrow" },
});
/** @type {__VLS_StyleScopedClasses['eyebrow']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
    ...{ class: "hiw__title" },
});
/** @type {__VLS_StyleScopedClasses['hiw__title']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "hiw__sub" },
});
/** @type {__VLS_StyleScopedClasses['hiw__sub']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "hiw__steps" },
});
/** @type {__VLS_StyleScopedClasses['hiw__steps']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "hiw__step" },
});
/** @type {__VLS_StyleScopedClasses['hiw__step']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "hiw__step-num" },
});
/** @type {__VLS_StyleScopedClasses['hiw__step-num']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "hiw__step-content" },
});
/** @type {__VLS_StyleScopedClasses['hiw__step-content']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "hiw__step" },
});
/** @type {__VLS_StyleScopedClasses['hiw__step']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "hiw__step-num" },
});
/** @type {__VLS_StyleScopedClasses['hiw__step-num']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "hiw__step-content" },
});
/** @type {__VLS_StyleScopedClasses['hiw__step-content']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "hiw__step" },
});
/** @type {__VLS_StyleScopedClasses['hiw__step']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "hiw__step-num" },
});
/** @type {__VLS_StyleScopedClasses['hiw__step-num']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "hiw__step-content" },
});
/** @type {__VLS_StyleScopedClasses['hiw__step-content']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "hiw__step" },
});
/** @type {__VLS_StyleScopedClasses['hiw__step']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "hiw__step-num" },
});
/** @type {__VLS_StyleScopedClasses['hiw__step-num']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "hiw__step-content" },
});
/** @type {__VLS_StyleScopedClasses['hiw__step-content']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
    ...{ class: "launches" },
    id: "launches",
});
/** @type {__VLS_StyleScopedClasses['launches']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "wrap" },
});
/** @type {__VLS_StyleScopedClasses['wrap']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "launches__header" },
});
/** @type {__VLS_StyleScopedClasses['launches__header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "eyebrow" },
});
/** @type {__VLS_StyleScopedClasses['eyebrow']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
    ...{ class: "launches__title" },
});
/** @type {__VLS_StyleScopedClasses['launches__title']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.handleApply) },
    ...{ class: "btn btn-outline" },
});
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-outline']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "launches__grid" },
});
/** @type {__VLS_StyleScopedClasses['launches__grid']} */ ;
for (const [launch] of __VLS_vFor((__VLS_ctx.upcomingLaunches))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.article, __VLS_intrinsics.article)({
        key: (launch.id),
        ...{ class: "lcard card" },
    });
    /** @type {__VLS_StyleScopedClasses['lcard']} */ ;
    /** @type {__VLS_StyleScopedClasses['card']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "lcard__head" },
    });
    /** @type {__VLS_StyleScopedClasses['lcard__head']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "lcard__meta" },
    });
    /** @type {__VLS_StyleScopedClasses['lcard__meta']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "lcard__month" },
    });
    /** @type {__VLS_StyleScopedClasses['lcard__month']} */ ;
    (launch.month);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: (__VLS_ctx.statusBadge(launch.status)) },
    });
    (launch.status);
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
        ...{ class: "lcard__project" },
    });
    /** @type {__VLS_StyleScopedClasses['lcard__project']} */ ;
    (launch.project);
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "lcard__town" },
    });
    /** @type {__VLS_StyleScopedClasses['lcard__town']} */ ;
    (launch.town);
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "lcard__summary" },
    });
    /** @type {__VLS_StyleScopedClasses['lcard__summary']} */ ;
    (launch.summary);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "lcard__chips" },
    });
    /** @type {__VLS_StyleScopedClasses['lcard__chips']} */ ;
    for (const [type] of __VLS_vFor((launch.flatTypes))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            key: (type),
            ...{ class: "chip" },
        });
        /** @type {__VLS_StyleScopedClasses['chip']} */ ;
        (type);
        // @ts-ignore
        [handleApply, handleApply, isLoggedIn, upcomingLaunches, statusBadge,];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "lcard__footer" },
    });
    /** @type {__VLS_StyleScopedClasses['lcard__footer']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "lcard__footer-label" },
    });
    /** @type {__VLS_StyleScopedClasses['lcard__footer-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "lcard__footer-val" },
    });
    /** @type {__VLS_StyleScopedClasses['lcard__footer-val']} */ ;
    (launch.window);
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.handleApply) },
        ...{ class: "btn btn-secondary btn-sm" },
    });
    /** @type {__VLS_StyleScopedClasses['btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-sm']} */ ;
    // @ts-ignore
    [handleApply,];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
    ...{ class: "cta-band" },
});
/** @type {__VLS_StyleScopedClasses['cta-band']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "wrap cta-band__inner" },
});
/** @type {__VLS_StyleScopedClasses['wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['cta-band__inner']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
    ...{ class: "cta-band__title" },
});
/** @type {__VLS_StyleScopedClasses['cta-band__title']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "cta-band__sub" },
});
/** @type {__VLS_StyleScopedClasses['cta-band__sub']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.handleApply) },
    ...{ class: "btn btn-primary btn-lg" },
});
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-lg']} */ ;
(__VLS_ctx.isLoggedIn ? 'Go to my application →' : 'Get started →');
__VLS_asFunctionalElement1(__VLS_intrinsics.footer, __VLS_intrinsics.footer)({
    ...{ class: "site-footer" },
});
/** @type {__VLS_StyleScopedClasses['site-footer']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "wrap site-footer__inner" },
});
/** @type {__VLS_StyleScopedClasses['wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['site-footer__inner']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "site-footer__brand" },
});
/** @type {__VLS_StyleScopedClasses['site-footer__brand']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "logo-crest-sm" },
});
/** @type {__VLS_StyleScopedClasses['logo-crest-sm']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.nav, __VLS_intrinsics.nav)({
    ...{ class: "site-footer__links" },
});
/** @type {__VLS_StyleScopedClasses['site-footer__links']} */ ;
let __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.RouterLink | typeof __VLS_components.RouterLink} */
RouterLink;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    to: "/",
}));
const __VLS_2 = __VLS_1({
    to: "/",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
const { default: __VLS_5 } = __VLS_3.slots;
// @ts-ignore
[handleApply, isLoggedIn,];
var __VLS_3;
__VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
    href: "#launches",
});
let __VLS_6;
/** @ts-ignore @type {typeof __VLS_components.RouterLink | typeof __VLS_components.RouterLink} */
RouterLink;
// @ts-ignore
const __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({
    to: "/my-application",
}));
const __VLS_8 = __VLS_7({
    to: "/my-application",
}, ...__VLS_functionalComponentArgsRest(__VLS_7));
const { default: __VLS_11 } = __VLS_9.slots;
// @ts-ignore
[];
var __VLS_9;
let __VLS_12;
/** @ts-ignore @type {typeof __VLS_components.RouterLink | typeof __VLS_components.RouterLink} */
RouterLink;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent1(__VLS_12, new __VLS_12({
    to: "/admin",
}));
const __VLS_14 = __VLS_13({
    to: "/admin",
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
const { default: __VLS_17 } = __VLS_15.slots;
// @ts-ignore
[];
var __VLS_15;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "site-footer__copy" },
});
/** @type {__VLS_StyleScopedClasses['site-footer__copy']} */ ;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
