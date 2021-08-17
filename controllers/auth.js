const Session = require('../models/session');
const User = require('../models/user');
const bcrypt = require('bcryptjs');

exports.getLogin = (req, res, next) => {
  if(req.session.isLoggedIn){
    return res.redirect('/');
  }
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
  });
};

exports.getSignup = (req, res, next) => {
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
  });
};

exports.postLogin = (req, res, next) => {
  let allSession = [];
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({ email: email })
    .then(user => {
      if (!user) {
        req.flash('error','Invalid mail or password');
        return res.redirect('/login');
      }
      return bcrypt.compare(password, user.password)
        .then(doMatch => {
          if(doMatch){
            return Session.find({ 'session.user._id': user._id })
            .then(session => {
              if (session.length == 0) {
                req.session.isLoggedIn = true;
                req.session.user = user;
                return req.session.save(err => {
                  console.log(err);
                  res.redirect('/');
                })
              } else {
                session.forEach(s =>{allSession.push(s._id);});
                Session.deleteMany({ '_id': { $in: allSession } })
                .then(result => {
                  req.session.isLoggedIn = true;
                  req.session.user = user;
                  return req.session.save(err => {
                    console.log(err);
                    res.redirect('/');
                  });
                })
                .catch(err => {
                  console.log(err)
                });
              }
            })
            .catch(err => {
              console.log(err);
            })
          }
          req.flash('error','Invalid mail or password');
          res.redirect('/login');
        })
    })
    .catch(err => console.log(err));
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  User.findOne({ 'email': email }).then(userDoc => {
    if (userDoc) {
      req.flash('info','Email Exists');
      return res.redirect('/signup');
    }
    return bcrypt.hash(password, 12)
      .then(hashPassword => {
        const user = new User({
          email: email,
          password: hashPassword,
          cart: { items: [] },
        });
        return user.save();
      })
      .then(result => {
        req.flash('info','Registered Successfully');
        return res.redirect('/login');
      })
      .catch(err => {
        console.log(err)
      });
  })
    .catch(err => {
      console.log(err)
    });

};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/');
  });
};
