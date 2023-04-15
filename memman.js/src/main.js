import { createElement, createComponent, renderMemmanComponent, updateState, useDynamicState } from './utils/createElement'
import {createApp} from './utils/createApp'
import {
   memmanCreateSignal,
   memmanUseEffect,
   triggerRerender,
   withCurrentComponent
} from './utils/Hooks';
import {withErrorBoundary} from './utils/withErrorBoundary'
import {createMemmaLive} from './utils/japg/liveHooks'

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
    withErrorBoundary,
    createMemmaLive
};