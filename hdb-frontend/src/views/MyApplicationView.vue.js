import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { store, isLoggedIn, getMyApplication, openLoginModal } from '../store/index';
const router = useRouter();
const user = computed(() => store.currentUser);
const app = computed(() => getMyApplication());
// Redirect if not logged in
if (!isLoggedIn.value) {
    openLoginModal();
}
const firstName = computed(() => user.value?.name.split(' ')[0] ?? '');
const statusConfig = computed(() => {
    const s = app.value?.status ?? 'pending';
    const map = {
        pending: { label: 'Application pending', badge: 'badge badge-amber', desc: 'Your application has been received. The ballot will be run shortly.', icon: '⏳' },
        balloted: { label: 'Ballot completed', badge: 'badge badge-green', desc: 'The ballot has been run. Your queue number is confirmed below.', icon: '🎲' },
        selected: { label: 'Flat selected', badge: 'badge badge-green', desc: 'You have selected a flat. Your booking appointment will be sent via email.', icon: '🏠' },
        completed: { label: 'Completed', badge: 'badge badge-gray', desc: 'Your flat selection is complete. Congratulations on your new home!', icon: '✅' },
    };
    return map[s] ?? map.pending;
});
const steps = computed(() => [
    { id: 'apply', label: 'Applied', done: true, date: app.value?.appliedDate ?? '' },
    { id: 'ballot', label: 'Ballot run', done: app.value?.status !== 'pending', date: store.ballotRun ? '2026-02-20' : '' },
    { id: 'select', label: 'Flat selected', done: ['selected', 'completed'].includes(app.value?.status ?? ''), date: '' },
    { id: 'complete', label: 'Booking confirmed', done: app.value?.status === 'completed', date: '' },
]);
function goToSelectFlat() {
    router.push('/select-flat');
}
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['not-signed-in__card']} */ ;
/** @type {__VLS_StyleScopedClasses['not-signed-in__card']} */ ;
/** @type {__VLS_StyleScopedClasses['page-hero__user-card']} */ ;
/** @type {__VLS_StyleScopedClasses['page-hero__user-card']} */ ;
/** @type {__VLS_StyleScopedClasses['page-hero__user-card']} */ ;
/** @type {__VLS_StyleScopedClasses['page-hero__user-card']} */ ;
/** @type {__VLS_StyleScopedClasses['no-app']} */ ;
/** @type {__VLS_StyleScopedClasses['no-app']} */ ;
/** @type {__VLS_StyleScopedClasses['tstep']} */ ;
/** @type {__VLS_StyleScopedClasses['tstep__connector']} */ ;
/** @type {__VLS_StyleScopedClasses['tstep--done']} */ ;
/** @type {__VLS_StyleScopedClasses['tstep__dot']} */ ;
/** @type {__VLS_StyleScopedClasses['tstep']} */ ;
/** @type {__VLS_StyleScopedClasses['tstep--done']} */ ;
/** @type {__VLS_StyleScopedClasses['tstep__label']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-row']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-row']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-row']} */ ;
/** @type {__VLS_StyleScopedClasses['date-row--highlight']} */ ;
/** @type {__VLS_StyleScopedClasses['date-row__label']} */ ;
/** @type {__VLS_StyleScopedClasses['date-row--highlight']} */ ;
/** @type {__VLS_StyleScopedClasses['date-row__val']} */ ;
/** @type {__VLS_StyleScopedClasses['page-body']} */ ;
/** @type {__VLS_StyleScopedClasses['page-hero__inner']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "page" },
});
/** @type {__VLS_StyleScopedClasses['page']} */ ;
if (!__VLS_ctx.user) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "not-signed-in wrap" },
    });
    /** @type {__VLS_StyleScopedClasses['not-signed-in']} */ ;
    /** @type {__VLS_StyleScopedClasses['wrap']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "not-signed-in__card" },
    });
    /** @type {__VLS_StyleScopedClasses['not-signed-in__card']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.openLoginModal) },
        ...{ class: "btn btn-primary btn-lg" },
    });
    /** @type {__VLS_StyleScopedClasses['btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-lg']} */ ;
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "page-hero" },
    });
    /** @type {__VLS_StyleScopedClasses['page-hero']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "wrap page-hero__inner" },
    });
    /** @type {__VLS_StyleScopedClasses['wrap']} */ ;
    /** @type {__VLS_StyleScopedClasses['page-hero__inner']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "page-hero__greeting" },
    });
    /** @type {__VLS_StyleScopedClasses['page-hero__greeting']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "eyebrow" },
    });
    /** @type {__VLS_StyleScopedClasses['eyebrow']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({
        ...{ class: "page-hero__name" },
    });
    /** @type {__VLS_StyleScopedClasses['page-hero__name']} */ ;
    (__VLS_ctx.firstName);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "page-hero__user-card" },
    });
    /** @type {__VLS_StyleScopedClasses['page-hero__user-card']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "user-avatar" },
    });
    /** @type {__VLS_StyleScopedClasses['user-avatar']} */ ;
    (__VLS_ctx.user?.name?.[0]);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
    (__VLS_ctx.user?.name);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.user?.nric);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "wrap page-body" },
    });
    /** @type {__VLS_StyleScopedClasses['wrap']} */ ;
    /** @type {__VLS_StyleScopedClasses['page-body']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "page-body__main" },
    });
    /** @type {__VLS_StyleScopedClasses['page-body__main']} */ ;
    if (__VLS_ctx.app) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "status-card card" },
        });
        /** @type {__VLS_StyleScopedClasses['status-card']} */ ;
        /** @type {__VLS_StyleScopedClasses['card']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "status-card__top" },
        });
        /** @type {__VLS_StyleScopedClasses['status-card__top']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "status-card__project-meta" },
        });
        /** @type {__VLS_StyleScopedClasses['status-card__project-meta']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "status-card__town" },
        });
        /** @type {__VLS_StyleScopedClasses['status-card__town']} */ ;
        (__VLS_ctx.app.town);
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "sep" },
        });
        /** @type {__VLS_StyleScopedClasses['sep']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "status-card__flat-type" },
        });
        /** @type {__VLS_StyleScopedClasses['status-card__flat-type']} */ ;
        (__VLS_ctx.app.flatType);
        __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
            ...{ class: "status-card__project" },
        });
        /** @type {__VLS_StyleScopedClasses['status-card__project']} */ ;
        (__VLS_ctx.app.projectName);
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: (__VLS_ctx.statusConfig.badge) },
        });
        (__VLS_ctx.statusConfig.label);
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "status-card__desc" },
        });
        /** @type {__VLS_StyleScopedClasses['status-card__desc']} */ ;
        (__VLS_ctx.statusConfig.desc);
        if (__VLS_ctx.app.queueNumber) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "queue-block" },
            });
            /** @type {__VLS_StyleScopedClasses['queue-block']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "queue-block__label" },
            });
            /** @type {__VLS_StyleScopedClasses['queue-block__label']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "queue-block__number" },
            });
            /** @type {__VLS_StyleScopedClasses['queue-block__number']} */ ;
            (__VLS_ctx.app.queueNumber);
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "queue-block__sub" },
            });
            /** @type {__VLS_StyleScopedClasses['queue-block__sub']} */ ;
        }
        if (__VLS_ctx.app.status === 'balloted') {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "status-card__action" },
            });
            /** @type {__VLS_StyleScopedClasses['status-card__action']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "action-info" },
            });
            /** @type {__VLS_StyleScopedClasses['action-info']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
                width: "20",
                height: "20",
                viewBox: "0 0 20 20",
                fill: "none",
            });
            __VLS_asFunctionalElement1(__VLS_intrinsics.circle)({
                cx: "10",
                cy: "10",
                r: "8.5",
                stroke: "currentColor",
                'stroke-width': "1.5",
            });
            __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
                d: "M10 9v4M10 6.5v.5",
                stroke: "currentColor",
                'stroke-width': "1.5",
                'stroke-linecap': "round",
            });
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (__VLS_ctx.goToSelectFlat) },
                ...{ class: "btn btn-primary" },
            });
            /** @type {__VLS_StyleScopedClasses['btn']} */ ;
            /** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
        }
        if (__VLS_ctx.app.status === 'selected') {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "status-card__action status-card__action--success" },
            });
            /** @type {__VLS_StyleScopedClasses['status-card__action']} */ ;
            /** @type {__VLS_StyleScopedClasses['status-card__action--success']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "action-info" },
            });
            /** @type {__VLS_StyleScopedClasses['action-info']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
                width: "20",
                height: "20",
                viewBox: "0 0 20 20",
                fill: "none",
            });
            __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
                d: "M5 10l4 4 6-7",
                stroke: "var(--green-text)",
                'stroke-width': "2",
                'stroke-linecap': "round",
                'stroke-linejoin': "round",
            });
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        }
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "no-app card" },
        });
        /** @type {__VLS_StyleScopedClasses['no-app']} */ ;
        /** @type {__VLS_StyleScopedClasses['card']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "no-app__icon" },
        });
        /** @type {__VLS_StyleScopedClasses['no-app__icon']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
        let __VLS_0;
        /** @ts-ignore @type {typeof __VLS_components.RouterLink | typeof __VLS_components.RouterLink} */
        RouterLink;
        // @ts-ignore
        const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
            to: "/#launches",
            ...{ class: "btn btn-primary" },
        }));
        const __VLS_2 = __VLS_1({
            to: "/#launches",
            ...{ class: "btn btn-primary" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_1));
        /** @type {__VLS_StyleScopedClasses['btn']} */ ;
        /** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
        const { default: __VLS_5 } = __VLS_3.slots;
        // @ts-ignore
        [user, user, user, user, openLoginModal, firstName, app, app, app, app, app, app, app, app, statusConfig, statusConfig, statusConfig, goToSelectFlat,];
        var __VLS_3;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "timeline card" },
    });
    /** @type {__VLS_StyleScopedClasses['timeline']} */ ;
    /** @type {__VLS_StyleScopedClasses['card']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
        ...{ class: "timeline__title" },
    });
    /** @type {__VLS_StyleScopedClasses['timeline__title']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "timeline__steps" },
    });
    /** @type {__VLS_StyleScopedClasses['timeline__steps']} */ ;
    for (const [step, i] of __VLS_vFor((__VLS_ctx.steps))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            key: (step.id),
            ...{ class: (['tstep', step.done && 'tstep--done']) },
        });
        /** @type {__VLS_StyleScopedClasses['tstep']} */ ;
        if (i > 0) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "tstep__connector" },
            });
            /** @type {__VLS_StyleScopedClasses['tstep__connector']} */ ;
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "tstep__dot" },
        });
        /** @type {__VLS_StyleScopedClasses['tstep__dot']} */ ;
        if (step.done) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
                width: "12",
                height: "12",
                viewBox: "0 0 12 12",
                fill: "none",
            });
            __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
                d: "M2.5 6l2.5 2.5 5-5",
                stroke: "white",
                'stroke-width': "1.5",
                'stroke-linecap': "round",
                'stroke-linejoin': "round",
            });
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "tstep__content" },
        });
        /** @type {__VLS_StyleScopedClasses['tstep__content']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "tstep__label" },
        });
        /** @type {__VLS_StyleScopedClasses['tstep__label']} */ ;
        (step.label);
        if (step.date) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "tstep__date" },
            });
            /** @type {__VLS_StyleScopedClasses['tstep__date']} */ ;
            (step.date);
        }
        // @ts-ignore
        [steps,];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.aside, __VLS_intrinsics.aside)({
        ...{ class: "page-body__aside" },
    });
    /** @type {__VLS_StyleScopedClasses['page-body__aside']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "detail-card card" },
    });
    /** @type {__VLS_StyleScopedClasses['detail-card']} */ ;
    /** @type {__VLS_StyleScopedClasses['card']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
        ...{ class: "detail-card__title" },
    });
    /** @type {__VLS_StyleScopedClasses['detail-card__title']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.dl, __VLS_intrinsics.dl)({
        ...{ class: "detail-list" },
    });
    /** @type {__VLS_StyleScopedClasses['detail-list']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "detail-row" },
    });
    /** @type {__VLS_StyleScopedClasses['detail-row']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.dt, __VLS_intrinsics.dt)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.dd, __VLS_intrinsics.dd)({});
    (__VLS_ctx.user?.name);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "detail-row" },
    });
    /** @type {__VLS_StyleScopedClasses['detail-row']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.dt, __VLS_intrinsics.dt)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.dd, __VLS_intrinsics.dd)({});
    (__VLS_ctx.user?.nric);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "detail-row" },
    });
    /** @type {__VLS_StyleScopedClasses['detail-row']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.dt, __VLS_intrinsics.dt)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.dd, __VLS_intrinsics.dd)({});
    (__VLS_ctx.user?.age);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "detail-row" },
    });
    /** @type {__VLS_StyleScopedClasses['detail-row']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.dt, __VLS_intrinsics.dt)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.dd, __VLS_intrinsics.dd)({});
    (__VLS_ctx.user?.household);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "detail-row" },
    });
    /** @type {__VLS_StyleScopedClasses['detail-row']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.dt, __VLS_intrinsics.dt)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.dd, __VLS_intrinsics.dd)({});
    (__VLS_ctx.user?.status);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "detail-row" },
    });
    /** @type {__VLS_StyleScopedClasses['detail-row']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.dt, __VLS_intrinsics.dt)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.dd, __VLS_intrinsics.dd)({});
    (__VLS_ctx.user?.preferredTown);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "dates-card card" },
    });
    /** @type {__VLS_StyleScopedClasses['dates-card']} */ ;
    /** @type {__VLS_StyleScopedClasses['card']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
        ...{ class: "dates-card__title" },
    });
    /** @type {__VLS_StyleScopedClasses['dates-card__title']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "dates-list" },
    });
    /** @type {__VLS_StyleScopedClasses['dates-list']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "date-row" },
    });
    /** @type {__VLS_StyleScopedClasses['date-row']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "date-row__label" },
    });
    /** @type {__VLS_StyleScopedClasses['date-row__label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "date-row__val" },
    });
    /** @type {__VLS_StyleScopedClasses['date-row__val']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "date-row" },
    });
    /** @type {__VLS_StyleScopedClasses['date-row']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "date-row__label" },
    });
    /** @type {__VLS_StyleScopedClasses['date-row__label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "date-row__val" },
    });
    /** @type {__VLS_StyleScopedClasses['date-row__val']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "date-row" },
    });
    /** @type {__VLS_StyleScopedClasses['date-row']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "date-row__label" },
    });
    /** @type {__VLS_StyleScopedClasses['date-row__label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "date-row__val" },
    });
    /** @type {__VLS_StyleScopedClasses['date-row__val']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "date-row date-row--highlight" },
    });
    /** @type {__VLS_StyleScopedClasses['date-row']} */ ;
    /** @type {__VLS_StyleScopedClasses['date-row--highlight']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "date-row__label" },
    });
    /** @type {__VLS_StyleScopedClasses['date-row__label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "date-row__val" },
    });
    /** @type {__VLS_StyleScopedClasses['date-row__val']} */ ;
}
// @ts-ignore
[user, user, user, user, user, user,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
