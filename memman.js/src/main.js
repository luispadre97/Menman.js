import { createElement, createComponent, renderMemmanComponent, updateState, useDynamicState } from './utils/createElement'
import {createApp} from './utils/createApp'
import {createMemmaLive} from './utils/japg/liveHooks'

import {
   memmanCreateSignal,
   memmanUseEffect,
   triggerRerender,
   withCurrentComponent
} from './utils/Hooks';
import {withErrorBoundary} from './utils/withErrorBoundary'
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
    triggerRerender,
    withCurrentComponent,
    createMemmaLive,
    withErrorBoundary
};