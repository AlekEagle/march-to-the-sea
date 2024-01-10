// Import Vue (Our main library)
import { createApp } from 'vue';
// Import Pinia (Our state management library)
import { createPinia } from 'pinia';
// Import the global styles
import './styles/index.css';
// Import the root component
import App from './App.vue';
// Import vue-toastification (Our toast library)
import Toast from 'vue-toastification';
// Import vue-toastification's styles
import 'vue-toastification/dist/index.css';

const app = createApp(App);

// Use Pinia as the state management system
app.use(createPinia());

// Use vue-toastification as the toast library and configure it
app.use(Toast, {
  transition: 'Vue-Toastification__slideBlurred',
  maxToasts: 6,
  newestOnTop: true,
});

// Mount the app
app.mount('html body');
