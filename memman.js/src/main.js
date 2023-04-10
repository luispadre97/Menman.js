import { version } from '../package.json';

import { createApp } from './utils/createApp.js';
import { createElement, createComponent, renderMemmanComponent, updateState, useDynamicState } from './utils/createElement.js'

export default function () {
    console.log('version ' + version);
}
export {
    createApp,
    createElement, createComponent, renderMemmanComponent, updateState, useDynamicState
};