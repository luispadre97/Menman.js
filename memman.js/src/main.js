import { version } from '../package.json';

import { createElement, createComponent, renderMemmanComponent, updateState, useDynamicState } from './utils/createElement'
import {createApp} from './utils/createApp'
import {
    memmanCreateSignal,
    memmanUseEffect,
    memmanRef,
    memmanUse,
    memmanUseState,
    memmanUseCallback,
    memmanUseReducer,
    memmanUseMemo,
    memmanUseRef,
    memmanUseLayoutEffect,
} from './utils/Hooks';
export default function () {
    console.log('version ' + version);
}
export {
    createApp,
    createElement,
    createComponent,
    renderMemmanComponent,
    updateState,
    useDynamicState,
    memmanCreateSignal,
    memmanUseEffect,
    memmanRef,
    memmanUse,
    memmanUseState,
    memmanUseCallback,
    memmanUseReducer,
    memmanUseMemo,
    memmanUseRef,
    memmanUseLayoutEffect,
};