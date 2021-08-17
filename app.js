const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const helmet = require('helmet');

const errorController = require('./controllers/error');
const User = require('./models/user');

const MONGO_DB_URI = 'mongodb://navnit_raj:lueZyC7reOIwz5KL@cluster0-shard-00-00.1lk5e.mongodb.net:27017,cluster0-shard-00-01.1lk5e.mongodb.net:27017,cluster0-shard-00-02.1lk5e.mongodb.net:27017/shop?authSource=admin&replicaSet=atlas-ylyss9-shard-0&w=majority&readPreference=primary&appname=MongoDB%20Compass&ssl=true';
const app = express();
const store = new MongoDBStore({
  uri: MONGO_DB_URI,
  collection: 'sessions'
});
const csrfProtection = csrf();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store: store
  })
);
app.use(csrfProtection);
app.use(flash());
app.use(helmet());
app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => console.log(err));
});

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  res.locals.errorMessage = req.flash('error');
  res.locals.infoMessage = req.flash('info');
  res.locals.warningMessage = req.flash('warning');
  next();
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

mongoose
  .connect(MONGO_DB_URI)
  .then(result => {
    app.listen(process.env.PORT || 3000);
  })
  .catch(err => {
    console.log(err);
  });
