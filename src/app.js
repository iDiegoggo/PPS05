const express = require('express');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3001;

// Seguridad básica
app.use(helmet());
app.disable('x-powered-by');

app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});

// Parsers
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// "Base de datos" en memoria
const tickets = [
  { id: 1, title: 'Error al iniciar sesión', description: 'No puedo acceder con mi usuario' },
  { id: 2, title: 'Fallo en el panel', description: 'El dashboard carga lentamente' }
];

const comments = [];

// Home
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head><title>Mini Secure Tickets App</title></head>
      <body>
        <h1>Mini Secure Tickets App</h1>

        <ul>
          <li><a href="/login">Login</a></li>
          <li><a href="/tickets">Ver tickets</a></li>
          <li><a href="/ticket/new">Crear ticket</a></li>
          <li><a href="/comments">Ver comentarios</a></li>
        </ul>

        <h2>Buscar tickets</h2>
        <form action="/search" method="GET">
          <input type="text" name="q" />
          <button type="submit">Buscar</button>
        </form>

        <h2>Comentario</h2>
        <form action="/comment" method="POST">
          <textarea name="comment"></textarea>
          <button type="submit">Enviar</button>
        </form>
      </body>
    </html>
  `);
});

// Login
app.get('/login', (req, res) => {
  res.send(`
    <html>
      <head><title>Login</title></head>
      <body>
        <h1>Login</h1>
        <form method="POST" action="/login">
          <input name="username" />
          <input name="password" type="password" />
          <button>Entrar</button>
        </form>
      </body>
    </html>
  `);
});

app.post('/login', (req, res) => {
  const { username } = req.body;

  res.send(`
    <h1>Bienvenido ${username || 'usuario'}</h1>
    <a href="/">Volver</a>
  `);
});

// Tickets
app.get('/tickets', (req, res) => {
  const items = tickets.map(t => `
    <li>
      <strong>${t.title}</strong><br/>
      ${t.description}
    </li>
  `).join('');

  res.send(`
    <h1>Tickets</h1>
    <ul>${items}</ul>
    <a href="/">Volver</a>
  `);
});

// Crear ticket (FIX DEL CI)
app.post('/ticket/new', (req, res) => {
  const { title, description } = req.body;

  tickets.push({
    id: tickets.length + 1,
    title: title || 'Sin título',
    description: description || 'Sin descripción'
  });

  res.send(`
    <h1>Ticket guardado correctamente</h1>
    <a href="/tickets">Ver tickets</a>
  `);
});

// Formulario ticket
app.get('/ticket/new', (req, res) => {
  res.send(`
    <h1>Crear ticket</h1>
    <form method="POST" action="/ticket/new">
      <input name="title" />
      <textarea name="description"></textarea>
      <button>Guardar</button>
    </form>
  `);
});

// Search
app.get('/search', (req, res) => {
  const q = req.query.q || '';

  const results = tickets.filter(t =>
    t.title.toLowerCase().includes(q.toLowerCase()) ||
    t.description.toLowerCase().includes(q.toLowerCase())
  );

  res.send(`
    <h1>Resultados: ${q}</h1>
    <ul>
      ${results.map(t => `<li>${t.title} - ${t.description}</li>`).join('')}
    </ul>
  `);
});

// Comments
app.post('/comment', (req, res) => {
  comments.push(req.body.comment || '');
  res.send('<h1>Comentario guardado</h1>');
});

app.get('/comments', (req, res) => {
  res.send(`
    <h1>Comentarios</h1>
    <ul>
      ${comments.map(c => `<li>${c}</li>`).join('')}
    </ul>
  `);
});

// Export para tests
module.exports = app;

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`App running on http://localhost:${PORT}`);
  });
}
