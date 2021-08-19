const Session = require('../models/session');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendGridTransport = require('nodemailer-sendgrid-transport');
const crypto = require('crypto');
const transporter = nodemailer.createTransport(sendGridTransport({
  auth: {
    api_key: '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',
  }
}));
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
  if(password === confirmPassword){
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
          return transporter.sendMail({
            to: email,
            from: 'nraj011994@outlook.com',
            subject: 'Signup Successfully',
            html: '<h1>You are Successfully signed up!</h1><br/><p>Your ID: '+email+'<br/> Your Password: '+password+'</p>'
          })
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
  }
  req.flash('error','Password not matched');
  res.redirect('/signup');
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/');
  });
};

exports.getReset = (req, res, next) => {
  res.render('auth/reset', {
    path: '/reset',
    pageTitle: 'Reset Password',
  });
}
exports.postReset = (req,res,next) => {
  const email = req.body.email;
  const host = req.headers.host
  crypto.randomBytes(32, (err, buffer) => {
    if(err){
      console.log(err)
      return res.redirect('/reset')
    }
    const token = buffer.toString('hex');
    User.findOne({email: req.body.email})
    .then(user => {
      if(!user){
        res.flash('error', 'No User Found');
        return res.redirect('/reset');
      }
      user.resetToken = token;
      user.resetTokenExpiry = Date.now() + 600000;
      return user.save();
    })
    .then(result => {
      res.redirect('/');
      return transporter.sendMail({
        to: req.body.email,
        from: 'nraj011994@outlook.com',
        subject: 'Reset Your Password',
        html: 
        `
        <p>You requested a password reset</p>
        <p><a href="http://${host}/reset/${token}/${email}">Click me to reset password</a><p>
        `
      })
    })
    .catch(err => {
      console.log(err)
    })
  })
}
exports.getNewPassword= (req, res, next) => {
  const token = req.params.token;
  const email = req.params.email;
  User.findOne({email:email, resetToken:token})
  .then(user => {
    if(!user){
      req.flash('error','Invalid Token');
      return res.redirect('/login');
    }
    if(user.resetTokenExpiry < Date.now()){
      req.flash('error','Ops! Token Expired');
      return res.redirect('/login');
    }
    res.render('auth/new-password',{
      path: '/reset',
      email: email,
      token: token,
      pageTitle: 'Reset Password',
    });
  })
  .catch(err=> console.log(err))
}
exports.postNewPassword = (req, res, next) => {
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  const email = req.body.email;
  if(password === confirmPassword){
    User.findOne({email:email, resetTokenExpiry: {$gt: Date.now()}})
    .then(user => {
      return bcrypt.hash(password, 12)
      .then(hashPassword => {
        user.password = hashPassword,
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;
        return user.save();
      })
      .then(result => {
        return transporter.sendMail({
          to: email,
          from: 'nraj011994@outlook.com',
          subject: 'Password Reset Successfully',
          html: '<h1>You are Successfully Reset your password!</h1>',
        })
      })
      .then(result => {
        req.flash('info','Password Reset Successfull');
        return res.redirect('/login');
      })
      .catch(err => {
        console.log(err);
      })
    })
    .catch(err => {
      console.log(err)
    })
  }
}