import App from './App.svelte';
import { mount } from 'svelte';

Office.onReady(() => {
  mount(App, { target: document.getElementById('app') });
});
