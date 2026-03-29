import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { store, isLoggedIn, getMyApplication, selectFlat, formatPrice, openLoginModal } from '../store/index';
const router = useRouter();
if (!isLoggedIn.value) {
    openLoginModal();
}
const activeType = ref('4-Room');
const selectedUnit = ref(null);
const confirming = ref(false);
const confirmed = ref(false);
const myApp = computed(() => getMyApplication());
const mySelectedUnitId = computed(() => myApp.value?.selectedUnitId);
const types = ['All', '2-Room Flexi', '3-Room', '4-Room', '5-Room'];
const filtered = computed(() => {
    const projectFlats = store.flats.filter((f) => f.projectId === 'garden-vista');
    if (activeType.value === 'All')
        return projectFlats;
    return projectFlats.filter((f) => f.type === activeType.value);
});
// Group by floor, descending
const byFloor = computed(() => {
    const map = new Map();
    for (const unit of filtered.value) {
        if (!map.has(unit.floor))
            map.set(unit.floor, []);
        map.get(unit.floor).push(unit);
    }
    return [...map.entries()]
        .sort(([a], [b]) => b - a)
        .map(([floor, units]) => ({ floor, units: units.sort((a, b) => a.unitNumber.localeCompare(b.unitNumber)) }));
});
const stats = computed(() => {
    const all = store.flats.filter((f) => f.projectId === 'garden-vista');
    const available = all.filter((f) => f.status === 'available').length;
    const reserved = all.filter((f) => f.status === 'reserved').length;
    return { total: all.length, available, reserved };
});
function unitClass(unit) {
    if (unit.id === mySelectedUnitId.value)
        return 'unit unit--mine';
    if (unit.status === 'reserved')
        return 'unit unit--reserved';
    if (unit.id === selectedUnit.value?.id)
        return 'unit unit--selected';
    return 'unit unit--available';
}
function pickUnit(unit) {
    if (unit.status === 'reserved' && unit.id !== mySelectedUnitId.value)
        return;
    selectedUnit.value = selectedUnit.value?.id === unit.id ? null : unit;
}
function handleConfirm() {
    if (!selectedUnit.value)
        return;
    confirming.value = true;
    setTimeout(() => {
        selectFlat(selectedUnit.value.id);
        confirming.value = false;
        confirmed.value = true;
        setTimeout(() => router.push('/my-application'), 2200);
    }, 1200);
}
const canSelect = computed(() => {
    const app = myApp.value;
    return app?.status === 'balloted' && (app?.queueNumber ?? 999) <= 300;
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['type-tab']} */ ;
/** @type {__VLS_StyleScopedClasses['floor-row']} */ ;
/** @type {__VLS_StyleScopedClasses['floor-row']} */ ;
/** @type {__VLS_StyleScopedClasses['unit--available']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-empty']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-confirm']} */ ;
/** @type {__VLS_StyleScopedClasses['confirm-card']} */ ;
/** @type {__VLS_StyleScopedClasses['confirm-card']} */ ;
/** @type {__VLS_StyleScopedClasses['floor-layout']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['page-hero__inner']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "page" },
});
/** @type {__VLS_StyleScopedClasses['page']} */ ;
if (!__VLS_ctx.isLoggedIn) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "not-auth wrap" },
    });
    /** @type {__VLS_StyleScopedClasses['not-auth']} */ ;
    /** @type {__VLS_StyleScopedClasses['wrap']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.openLoginModal) },
        ...{ class: "btn btn-primary" },
    });
    /** @type {__VLS_StyleScopedClasses['btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
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
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "meta-town" },
    });
    /** @type {__VLS_StyleScopedClasses['meta-town']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "meta-sep" },
    });
    /** @type {__VLS_StyleScopedClasses['meta-sep']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "meta-sep" },
    });
    /** @type {__VLS_StyleScopedClasses['meta-sep']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.stats.available);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "stat-badges" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-badges']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "stat-badge" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-badge']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "sb-dot sb-dot--green" },
    });
    /** @type {__VLS_StyleScopedClasses['sb-dot']} */ ;
    /** @type {__VLS_StyleScopedClasses['sb-dot--green']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.stats.available);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "stat-badge" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-badge']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "sb-dot sb-dot--gray" },
    });
    /** @type {__VLS_StyleScopedClasses['sb-dot']} */ ;
    /** @type {__VLS_StyleScopedClasses['sb-dot--gray']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.stats.reserved);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "wrap page-content-inner" },
    });
    /** @type {__VLS_StyleScopedClasses['wrap']} */ ;
    /** @type {__VLS_StyleScopedClasses['page-content-inner']} */ ;
    if (__VLS_ctx.canSelect) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "queue-notice" },
        });
        /** @type {__VLS_StyleScopedClasses['queue-notice']} */ ;
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
            stroke: "var(--green-text)",
            'stroke-width': "1.5",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
            d: "M7 10l2 2 4-4",
            stroke: "var(--green-text)",
            'stroke-width': "1.5",
            'stroke-linecap': "round",
            'stroke-linejoin': "round",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (__VLS_ctx.myApp?.queueNumber);
    }
    else if (__VLS_ctx.myApp?.status === 'selected') {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "queue-notice queue-notice--done" },
        });
        /** @type {__VLS_StyleScopedClasses['queue-notice']} */ ;
        /** @type {__VLS_StyleScopedClasses['queue-notice--done']} */ ;
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
    else if (__VLS_ctx.myApp) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "queue-notice queue-notice--wait" },
        });
        /** @type {__VLS_StyleScopedClasses['queue-notice']} */ ;
        /** @type {__VLS_StyleScopedClasses['queue-notice--wait']} */ ;
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
        (__VLS_ctx.myApp?.queueNumber);
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "floor-layout" },
    });
    /** @type {__VLS_StyleScopedClasses['floor-layout']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "floor-panel" },
    });
    /** @type {__VLS_StyleScopedClasses['floor-panel']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "type-tabs" },
    });
    /** @type {__VLS_StyleScopedClasses['type-tabs']} */ ;
    for (const [t] of __VLS_vFor((__VLS_ctx.types))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(!__VLS_ctx.isLoggedIn))
                        return;
                    __VLS_ctx.activeType = t;
                    // @ts-ignore
                    [isLoggedIn, openLoginModal, stats, stats, stats, canSelect, myApp, myApp, myApp, myApp, types, activeType,];
                } },
            key: (t),
            ...{ class: (['type-tab', __VLS_ctx.activeType === t && 'type-tab--active']) },
        });
        /** @type {__VLS_StyleScopedClasses['type-tab']} */ ;
        (t);
        // @ts-ignore
        [activeType,];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "floor-grid" },
    });
    /** @type {__VLS_StyleScopedClasses['floor-grid']} */ ;
    for (const [{ floor, units }] of __VLS_vFor((__VLS_ctx.byFloor))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            key: (floor),
            ...{ class: "floor-row" },
        });
        /** @type {__VLS_StyleScopedClasses['floor-row']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "floor-label" },
        });
        /** @type {__VLS_StyleScopedClasses['floor-label']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (floor);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "floor-units" },
        });
        /** @type {__VLS_StyleScopedClasses['floor-units']} */ ;
        for (const [unit] of __VLS_vFor((units))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (...[$event]) => {
                        if (!!(!__VLS_ctx.isLoggedIn))
                            return;
                        __VLS_ctx.pickUnit(unit);
                        // @ts-ignore
                        [byFloor, pickUnit,];
                    } },
                key: (unit.id),
                ...{ class: (__VLS_ctx.unitClass(unit)) },
                title: (`Unit ${unit.unitNumber} · ${unit.type} · ${__VLS_ctx.formatPrice(unit.price)} · ${unit.facing}-facing`),
            });
            (unit.unitNumber);
            // @ts-ignore
            [unitClass, formatPrice,];
        }
        // @ts-ignore
        [];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "legend" },
    });
    /** @type {__VLS_StyleScopedClasses['legend']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "legend-item" },
    });
    /** @type {__VLS_StyleScopedClasses['legend-item']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "legend-dot legend-dot--available" },
    });
    /** @type {__VLS_StyleScopedClasses['legend-dot']} */ ;
    /** @type {__VLS_StyleScopedClasses['legend-dot--available']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "legend-item" },
    });
    /** @type {__VLS_StyleScopedClasses['legend-item']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "legend-dot legend-dot--selected" },
    });
    /** @type {__VLS_StyleScopedClasses['legend-dot']} */ ;
    /** @type {__VLS_StyleScopedClasses['legend-dot--selected']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "legend-item" },
    });
    /** @type {__VLS_StyleScopedClasses['legend-item']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "legend-dot legend-dot--reserved" },
    });
    /** @type {__VLS_StyleScopedClasses['legend-dot']} */ ;
    /** @type {__VLS_StyleScopedClasses['legend-dot--reserved']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "legend-item" },
    });
    /** @type {__VLS_StyleScopedClasses['legend-item']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "legend-dot legend-dot--mine" },
    });
    /** @type {__VLS_StyleScopedClasses['legend-dot']} */ ;
    /** @type {__VLS_StyleScopedClasses['legend-dot--mine']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "detail-panel" },
    });
    /** @type {__VLS_StyleScopedClasses['detail-panel']} */ ;
    let __VLS_0;
    /** @ts-ignore @type {typeof __VLS_components.Transition | typeof __VLS_components.Transition} */
    Transition;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        name: "panel-fade",
        mode: "out-in",
    }));
    const __VLS_2 = __VLS_1({
        name: "panel-fade",
        mode: "out-in",
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    const { default: __VLS_5 } = __VLS_3.slots;
    if (!__VLS_ctx.selectedUnit) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "detail-empty" },
        });
        /** @type {__VLS_StyleScopedClasses['detail-empty']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "detail-empty__icon" },
        });
        /** @type {__VLS_StyleScopedClasses['detail-empty__icon']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
            width: "40",
            height: "40",
            viewBox: "0 0 40 40",
            fill: "none",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
            d: "M20 5L5 17.5V35h10V25h10v10h10V17.5L20 5z",
            stroke: "var(--text-3)",
            'stroke-width': "2",
            'stroke-linejoin': "round",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "detail-info card" },
        });
        /** @type {__VLS_StyleScopedClasses['detail-info']} */ ;
        /** @type {__VLS_StyleScopedClasses['card']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "detail-info__header" },
        });
        /** @type {__VLS_StyleScopedClasses['detail-info__header']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "detail-unit-num" },
        });
        /** @type {__VLS_StyleScopedClasses['detail-unit-num']} */ ;
        (__VLS_ctx.selectedUnit.unitNumber);
        __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
            ...{ class: "detail-project" },
        });
        /** @type {__VLS_StyleScopedClasses['detail-project']} */ ;
        (__VLS_ctx.selectedUnit.type);
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(!__VLS_ctx.isLoggedIn))
                        return;
                    if (!!(!__VLS_ctx.selectedUnit))
                        return;
                    __VLS_ctx.selectedUnit = null;
                    // @ts-ignore
                    [selectedUnit, selectedUnit, selectedUnit, selectedUnit,];
                } },
            ...{ class: "detail-close" },
            'aria-label': "Close",
        });
        /** @type {__VLS_StyleScopedClasses['detail-close']} */ ;
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
            ...{ class: "detail-specs" },
        });
        /** @type {__VLS_StyleScopedClasses['detail-specs']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "spec" },
        });
        /** @type {__VLS_StyleScopedClasses['spec']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "spec__label" },
        });
        /** @type {__VLS_StyleScopedClasses['spec__label']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "spec__val" },
        });
        /** @type {__VLS_StyleScopedClasses['spec__val']} */ ;
        (__VLS_ctx.selectedUnit.floor);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "spec" },
        });
        /** @type {__VLS_StyleScopedClasses['spec']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "spec__label" },
        });
        /** @type {__VLS_StyleScopedClasses['spec__label']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "spec__val" },
        });
        /** @type {__VLS_StyleScopedClasses['spec__val']} */ ;
        (__VLS_ctx.selectedUnit.area);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "spec" },
        });
        /** @type {__VLS_StyleScopedClasses['spec']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "spec__label" },
        });
        /** @type {__VLS_StyleScopedClasses['spec__label']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "spec__val" },
        });
        /** @type {__VLS_StyleScopedClasses['spec__val']} */ ;
        (__VLS_ctx.selectedUnit.facing);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "spec" },
        });
        /** @type {__VLS_StyleScopedClasses['spec']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "spec__label" },
        });
        /** @type {__VLS_StyleScopedClasses['spec__label']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "spec__val" },
            ...{ class: (__VLS_ctx.selectedUnit.status === 'available' ? 'text-green' : 'text-gray') },
        });
        /** @type {__VLS_StyleScopedClasses['spec__val']} */ ;
        (__VLS_ctx.selectedUnit.status === 'available' ? 'Available' : 'Reserved');
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "detail-price" },
        });
        /** @type {__VLS_StyleScopedClasses['detail-price']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "detail-price__label" },
        });
        /** @type {__VLS_StyleScopedClasses['detail-price__label']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "detail-price__val" },
        });
        /** @type {__VLS_StyleScopedClasses['detail-price__val']} */ ;
        (__VLS_ctx.formatPrice(__VLS_ctx.selectedUnit.price));
        if (__VLS_ctx.selectedUnit.status === 'available' && __VLS_ctx.canSelect) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "detail-actions" },
            });
            /** @type {__VLS_StyleScopedClasses['detail-actions']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (__VLS_ctx.handleConfirm) },
                ...{ class: "btn btn-primary btn-lg detail-confirm" },
                disabled: (__VLS_ctx.confirming),
            });
            /** @type {__VLS_StyleScopedClasses['btn']} */ ;
            /** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
            /** @type {__VLS_StyleScopedClasses['btn-lg']} */ ;
            /** @type {__VLS_StyleScopedClasses['detail-confirm']} */ ;
            if (__VLS_ctx.confirming) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "spinner" },
                });
                /** @type {__VLS_StyleScopedClasses['spinner']} */ ;
            }
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
            (__VLS_ctx.confirming ? 'Confirming…' : 'Confirm selection');
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "detail-disclaimer" },
            });
            /** @type {__VLS_StyleScopedClasses['detail-disclaimer']} */ ;
        }
        else if (!__VLS_ctx.canSelect && __VLS_ctx.selectedUnit.status === 'available') {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "detail-no-action" },
            });
            /** @type {__VLS_StyleScopedClasses['detail-no-action']} */ ;
        }
    }
    // @ts-ignore
    [canSelect, canSelect, formatPrice, selectedUnit, selectedUnit, selectedUnit, selectedUnit, selectedUnit, selectedUnit, selectedUnit, selectedUnit, handleConfirm, confirming, confirming, confirming,];
    var __VLS_3;
    let __VLS_6;
    /** @ts-ignore @type {typeof __VLS_components.Transition | typeof __VLS_components.Transition} */
    Transition;
    // @ts-ignore
    const __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({
        name: "confirm-pop",
    }));
    const __VLS_8 = __VLS_7({
        name: "confirm-pop",
    }, ...__VLS_functionalComponentArgsRest(__VLS_7));
    const { default: __VLS_11 } = __VLS_9.slots;
    if (__VLS_ctx.confirmed) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "confirm-overlay" },
        });
        /** @type {__VLS_StyleScopedClasses['confirm-overlay']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "confirm-card" },
        });
        /** @type {__VLS_StyleScopedClasses['confirm-card']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "confirm-icon" },
        });
        /** @type {__VLS_StyleScopedClasses['confirm-icon']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
    }
    // @ts-ignore
    [confirmed,];
    var __VLS_9;
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
