require('dotenv').config()
const express = require ('express')
const cors = require('cors');
const path = require ('path')
const app = express ()
app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const express = require('express');

// // Importa o módulo do HTTP
// const http = require('http');
 
// // Cria um servidor e atribui uma callback de processamento da requisição
// const server = http.createServer((req, res) => {
//   res.statusCode = 200; // Retorno OK
//   res.setHeader('Content-Type', 'text/html');
//   res.end('Hello World');
// });
 
// // Define parâmetros (hostname e porta) e inicia o servidor
// const hostname = '127.0.0.1';
// const port = 3000;
// server.listen(port, hostname, () => {
//   console.log(` Servidor rodando http://${hostname}:${port}/`);
// });

// In-memory storage for flight checklists
let checklists = [];

// GET /checklists - Retrieve all checklists
app.get('/checklists', (req, res) => {
  res.json(checklists);
});

// POST /checklists - Create a new checklist
app.post('/checklists', (req, res) => {
  const checklist = req.body;
  checklists.push(checklist);
  res.status(201).json(checklist);
});

// GET /checklists/:id - Retrieve a specific checklist
app.get('/checklists/:id', (req, res) => {
  const checklistId = req.params.id;
  const checklist = checklists.find(item => item.id === checklistId);

  if (!checklist) {
    res.status(404).json({ error: 'Checklist not found' });
  } else {
    res.json(checklist);
  }
});

// PUT /checklists/:id - Update a specific checklist
app.put('/checklists/:id', (req, res) => {
  const checklistId = req.params.id;
  const updatedChecklist = req.body;
  const checklistIndex = checklists.findIndex(item => item.id === checklistId);

  if (checklistIndex === -1) {
    res.status(404).json({ error: 'Checklist not found' });
  } else {
    checklists[checklistIndex] = updatedChecklist;
    res.json(updatedChecklist);
  }
});

// DELETE /checklists/:id - Delete a specific checklist
app.delete('/checklists/:id', (req, res) => {
  const checklistId = req.params.id;
  const checklistIndex = checklists.findIndex(item => item.id === checklistId);

  if (checklistIndex === -1) {
    res.status(404).json({ error: 'Checklist not found' });
  } else {
    const deletedChecklist = checklists.splice(checklistIndex, 1);
    res.json(deletedChecklist[0]);
  }
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
