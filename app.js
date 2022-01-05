const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const productRouter = require('./routes/product');

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug')

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/', indexRouter);
app.use('/:products.svg', productRouter);
app.use('/:products', productRouter);

module.exports = app;
