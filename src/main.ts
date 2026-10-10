import '@fontsource/press-start-2p/latin-400.css';
import '@fontsource/rubik/latin-400.css';
import './style.css';

const query = new URLSearchParams(window.location.search);
const timeoutMode = query.has('timeout');
const launch = query.has('prueba')
  ? import('./prueba').then(({ startPrueba }) => startPrueba(timeoutMode))
  : query.has('clasico')
    ? import('./campana').then(({ startCampaign }) => startCampaign(timeoutMode))
    : import('./mes/escena').then(({ startMonth }) => startMonth(query.has('demo') ? 'demo' : 'month', timeoutMode));

void launch.catch(() => {
  const message = document.createElement('p');
  message.setAttribute('role', 'alert');
  message.textContent = 'No se pudo cargar el juego. Recarga la página para intentarlo de nuevo.';
  document.getElementById('juego')?.replaceChildren(message);
});
