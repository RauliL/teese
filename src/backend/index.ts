import express from 'express';
import morgan from 'morgan';
import path from 'path';

import api from './api';

const app = express();
const index = path.resolve(__dirname, '..', 'public', 'index.html');

app.use('/api', api);
app.use(morgan('combined'));
app.use(express.static(path.resolve(__dirname, '..', 'public')));

app.use('/create', (req, res) => res.sendFile(index));
app.use('/edit/:id', (req, res) => res.sendFile(index));
app.use('/show/:id', (req, res) => res.sendFile(index));

app.listen(process.env.PORT || '3000');
