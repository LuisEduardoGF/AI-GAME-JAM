import '@fontsource/press-start-2p/latin-400.css';
import '@fontsource/rubik/latin-400.css';
import './style.css';
import { startMonth } from './mes/escena';

startMonth('demo', new URLSearchParams(window.location.search).has('timeout'), true);
