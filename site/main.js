// Menú móvil
const btn = document.querySelector('.menu-btn');
const menu = document.getElementById('menu');

function setMenu(open) {
  btn.setAttribute('aria-expanded', String(open));
  btn.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  menu.classList.toggle('open', open);
}

btn.addEventListener('click', () => setMenu(btn.getAttribute('aria-expanded') !== 'true'));
menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

// Año del pie de página
document.getElementById('year').textContent = new Date().getFullYear();

// Formulario: abre WhatsApp con el mensaje armado (sin backend ni almacenamiento)
const WHATSAPP = '56900000000'; // TODO: reemplazar por el número real

document.getElementById('contact-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const data = new FormData(e.target);
  const empresa = data.get('empresa') ? ` de ${data.get('empresa')}` : '';
  const text = `Hola, soy ${data.get('nombre')}${empresa}. ${data.get('mensaje')}`;
  window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
});
