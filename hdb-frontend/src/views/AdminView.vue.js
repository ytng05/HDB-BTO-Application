import { ref, computed } from 'vue';
import { store, runBallot } from '../store/index';
const balloting = ref(false);
const justRun = ref(false);
const apps = computed(() => [...store.applications].sort((a, b) => (a.queueNumber ?? 9999) - (b.queueNumber ?? 9999)));
const stats = computed(() => {
    const total = store.applications.length;
    const balloted = store.applications.filter((a) => a.status === 'balloted' || a.status === 'selected').length;
    const selected = store.applications.filter((a) => a.status === 'selected').length;
    const pending = store.applications.filter((a) => a.status === 'pending').length;
    const availableUnits = store.flats.filter((f) => f.status === 'available').length;
    return { total, balloted, selected, pending, availableUnits };
});
function handleRunBallot() {
    balloting.value = true;
    justRun.value = false;
    setTimeout(() => {
        runBallot();
        balloting.value = false;
        justRun.value = true;
        setTimeout(() => { justRun.value = false; }, 4000);
    }, 1800);
}
function statusBadge(status) {
    const map = {
        pending: 'badge badge-amber',
        balloted: 'badge badge-green',
        selected: 'badge badge-green',
        completed: 'badge badge-gray',
    };
    return map[status] ?? 'badge badge-gray';
}
function statusLabel(status) {
    const map = {
        pending: 'Pending',
        balloted: 'Balloted',
        selected: 'Flat selected',
        completed: 'Completed',
    };
    return map[status] ?? status;
}
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['bstep__dot']} */ ;
/** @type {__VLS_StyleScopedClasses['bstep']} */ ;
/** @type {__VLS_StyleScopedClasses['bstep']} */ ;
/** @type {__VLS_StyleScopedClasses['ballot-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['ballot-success']} */ ;
/** @type {__VLS_StyleScopedClasses['ballot-success']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-row']} */ ;
/** @type {__VLS_StyleScopedClasses['ballot-control']} */ ;
/** @type {__VLS_StyleScopedClasses['ballot-control__action']} */ ;
/** @type {__VLS_StyleScopedClasses['page-hero__inner']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-row']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "page" },
});
/** @type {__VLS_StyleScopedClasses['page']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "admin-banner" },
});
/** @type {__VLS_StyleScopedClasses['admin-banner']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "wrap admin-banner__inner" },
});
/** @type {__VLS_StyleScopedClasses['wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-banner__inner']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "admin-banner__tag" },
});
/** @type {__VLS_StyleScopedClasses['admin-banner__tag']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.circle)({
    cx: "7",
    cy: "7",
    r: "5.5",
    stroke: "currentColor",
    'stroke-width': "1.5",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.path)({
    d: "M7 4.5v3l2 1.5",
    stroke: "currentColor",
    'stroke-width': "1.5",
    'stroke-linecap': "round",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "page-hero" },
});
/** @type {__VLS_StyleScopedClasses['page-hero']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "wrap page-hero__inner" },
});
/** @type {__VLS_StyleScopedClasses['wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['page-hero__inner']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "eyebrow" },
});
/** @type {__VLS_StyleScopedClasses['eyebrow']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({
    ...{ class: "page-hero__title" },
});
/** @type {__VLS_StyleScopedClasses['page-hero__title']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "page-hero__meta" },
});
/** @type {__VLS_StyleScopedClasses['page-hero__meta']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "hero-date" },
});
/** @type {__VLS_StyleScopedClasses['hero-date']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "hero-date__label" },
});
/** @type {__VLS_StyleScopedClasses['hero-date__label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: (__VLS_ctx.store.ballotRun ? 'badge badge-green' : 'badge badge-amber') },
});
(__VLS_ctx.store.ballotRun ? 'Ballot completed' : 'Pending ballot');
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "wrap page-body" },
});
/** @type {__VLS_StyleScopedClasses['wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['page-body']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stats-row" },
});
/** @type {__VLS_StyleScopedClasses['stats-row']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-card card" },
});
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "stat-card__label" },
});
/** @type {__VLS_StyleScopedClasses['stat-card__label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({
    ...{ class: "stat-card__val" },
});
/** @type {__VLS_StyleScopedClasses['stat-card__val']} */ ;
(__VLS_ctx.stats.total);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-card card" },
});
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "stat-card__label" },
});
/** @type {__VLS_StyleScopedClasses['stat-card__label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({
    ...{ class: "stat-card__val stat-val--green" },
});
/** @type {__VLS_StyleScopedClasses['stat-card__val']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-val--green']} */ ;
(__VLS_ctx.stats.balloted);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-card card" },
});
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "stat-card__label" },
});
/** @type {__VLS_StyleScopedClasses['stat-card__label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({
    ...{ class: "stat-card__val" },
});
/** @type {__VLS_StyleScopedClasses['stat-card__val']} */ ;
(__VLS_ctx.stats.selected);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-card card" },
});
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "stat-card__label" },
});
/** @type {__VLS_StyleScopedClasses['stat-card__label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({
    ...{ class: "stat-card__val" },
});
/** @type {__VLS_StyleScopedClasses['stat-card__val']} */ ;
(__VLS_ctx.stats.availableUnits);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "ballot-control card" },
});
/** @type {__VLS_StyleScopedClasses['ballot-control']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "ballot-control__info" },
});
/** @type {__VLS_StyleScopedClasses['ballot-control__info']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
    ...{ class: "ballot-control__title" },
});
/** @type {__VLS_StyleScopedClasses['ballot-control__title']} */ ;
(__VLS_ctx.store.ballotRun ? 'Ballot has been run' : 'Run the ballot');
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "ballot-control__desc" },
});
/** @type {__VLS_StyleScopedClasses['ballot-control__desc']} */ ;
(__VLS_ctx.store.ballotRun
    ? 'The ballot was last run on 20 Feb 2026. Queue numbers are assigned. You may re-run to simulate a new random draw.'
    : 'Click the button to run the ballot. Each applicant will be assigned a random queue number, which determines their selection priority.');
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "ballot-control__steps" },
});
/** @type {__VLS_StyleScopedClasses['ballot-control__steps']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "bstep" },
    ...{ class: ({ 'bstep--done': true }) },
});
/** @type {__VLS_StyleScopedClasses['bstep']} */ ;
/** @type {__VLS_StyleScopedClasses['bstep--done']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "bstep__dot" },
});
/** @type {__VLS_StyleScopedClasses['bstep__dot']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
(__VLS_ctx.stats.total);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "bstep__line" },
});
/** @type {__VLS_StyleScopedClasses['bstep__line']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "bstep" },
    ...{ class: ({ 'bstep--done': __VLS_ctx.store.ballotRun }) },
});
/** @type {__VLS_StyleScopedClasses['bstep']} */ ;
/** @type {__VLS_StyleScopedClasses['bstep--done']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "bstep__dot" },
});
/** @type {__VLS_StyleScopedClasses['bstep__dot']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
(__VLS_ctx.store.ballotRun ? 'Complete' : 'Pending');
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "bstep__line" },
});
/** @type {__VLS_StyleScopedClasses['bstep__line']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "bstep" },
    ...{ class: ({ 'bstep--done': __VLS_ctx.stats.selected > 0 }) },
});
/** @type {__VLS_StyleScopedClasses['bstep']} */ ;
/** @type {__VLS_StyleScopedClasses['bstep--done']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "bstep__dot" },
});
/** @type {__VLS_StyleScopedClasses['bstep__dot']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
(__VLS_ctx.stats.selected > 0 ? `${__VLS_ctx.stats.selected} selected` : 'Not started');
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "ballot-control__action" },
});
/** @type {__VLS_StyleScopedClasses['ballot-control__action']} */ ;
let __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.Transition | typeof __VLS_components.Transition} */
Transition;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    name: "fade-msg",
    mode: "out-in",
}));
const __VLS_2 = __VLS_1({
    name: "fade-msg",
    mode: "out-in",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
const { default: __VLS_5 } = __VLS_3.slots;
if (__VLS_ctx.justRun) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        key: "success",
        ...{ class: "ballot-success" },
    });
    /** @type {__VLS_StyleScopedClasses['ballot-success']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "ballot-success__icon" },
    });
    /** @type {__VLS_StyleScopedClasses['ballot-success__icon']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        key: "btn",
        ...{ class: "ballot-btn-wrap" },
    });
    /** @type {__VLS_StyleScopedClasses['ballot-btn-wrap']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.handleRunBallot) },
        ...{ class: "btn btn-primary ballot-btn" },
        disabled: (__VLS_ctx.balloting),
    });
    /** @type {__VLS_StyleScopedClasses['btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
    /** @type {__VLS_StyleScopedClasses['ballot-btn']} */ ;
    if (__VLS_ctx.balloting) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "spinner" },
        });
        /** @type {__VLS_StyleScopedClasses['spinner']} */ ;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.balloting ? 'Running ballot…' : __VLS_ctx.store.ballotRun ? 'Re-run ballot' : 'Run ballot');
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "ballot-btn-note" },
    });
    /** @type {__VLS_StyleScopedClasses['ballot-btn-note']} */ ;
    (__VLS_ctx.store.ballotRun ? 'This will reassign all queue numbers.' : 'This action cannot be undone in a live system.');
}
// @ts-ignore
[store, store, store, store, store, store, store, store, stats, stats, stats, stats, stats, stats, stats, stats, justRun, handleRunBallot, balloting, balloting, balloting,];
var __VLS_3;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "table-section card" },
});
/** @type {__VLS_StyleScopedClasses['table-section']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "table-section__header" },
});
/** @type {__VLS_StyleScopedClasses['table-section__header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
    ...{ class: "table-section__title" },
});
/** @type {__VLS_StyleScopedClasses['table-section__title']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "table-section__count" },
});
/** @type {__VLS_StyleScopedClasses['table-section__count']} */ ;
(__VLS_ctx.apps.length);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "table-wrap" },
});
/** @type {__VLS_StyleScopedClasses['table-wrap']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.table, __VLS_intrinsics.table)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.thead, __VLS_intrinsics.thead)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.tr, __VLS_intrinsics.tr)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.tbody, __VLS_intrinsics.tbody)({});
for (const [app] of __VLS_vFor((__VLS_ctx.apps))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.tr, __VLS_intrinsics.tr)({
        key: (app.id),
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({});
    if (app.queueNumber) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "queue-num" },
        });
        /** @type {__VLS_StyleScopedClasses['queue-num']} */ ;
        (app.queueNumber);
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "text-muted" },
        });
        /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "name-cell" },
    });
    /** @type {__VLS_StyleScopedClasses['name-cell']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "name-avatar" },
    });
    /** @type {__VLS_StyleScopedClasses['name-avatar']} */ ;
    (app.name[0]);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (app.name);
    __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
        ...{ class: "mono text-muted" },
    });
    /** @type {__VLS_StyleScopedClasses['mono']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
    (app.nric);
    __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({});
    (app.flatType);
    __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
        ...{ class: "text-muted" },
    });
    /** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
    (app.appliedDate);
    __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: (__VLS_ctx.statusBadge(app.status)) },
    });
    (__VLS_ctx.statusLabel(app.status));
    // @ts-ignore
    [apps, apps, statusBadge, statusLabel,];
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
