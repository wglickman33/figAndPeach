/** Keeps Netlify Dev alive while Vite runs separately (see dev-netlify.mjs). */
setInterval(() => {}, 2 ** 31 - 1);
