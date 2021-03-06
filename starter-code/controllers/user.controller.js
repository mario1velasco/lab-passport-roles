const User = require('../models/user.model');

module.exports.profileId = (req, res, next) => {
  // if (req.params.id == req.session.passport.user) {
  User.findById(req.params.id).then(user => {
      res.render('user/profile', {
        user: user
      });
    })
    .catch(error => next(error));
  // } else {
  // res.redirect("/");
  // };
};

module.exports.update = (req, res, next) => {
  User.findById(req.session.passport.user).then(user => {
      if (req.body.username != user.username) {
        res.redirect("/");
      } else {
        const userUpd = new User({
          _id: req.session.passport.user,
          name: req.body.name,
          email: req.body.email,
          familyname: req.body.familyname,
          username: req.body.username,
          role: user.role
        });
        User.findByIdAndUpdate(userUpd._id, userUpd)
          .then(currentUser => {
            res.redirect(`/profile/${req.session.passport.user}`);
          })
          .catch(error => next(error));
      }
    })
    .catch(error => next(error));
};

module.exports.show = (req, res, next) => {
  User.findById(req.session.passport.user).then(user => {
      if (user.role === 'BOSS') {
        // res.send("BOSS");
        User.find().sort({
          createdAt: -1
        }).then(users => {
          res.render("user/show", {
            role: "BOSS",
            users: users,
            user:req.session.passport.user
          });
        });
      } else if (user.role === 'DEVELOPER') {
        res.send("DEVELOPER");
        User.find({
          role: {
            $ne: "BOSS"
          }
        }).sort({
          createdAt: -1
        }).then(users => {
          res.render("user/show", {
            role: "DEVELOPER",
            users: users
          });
        });
      } else if (user.role === 'TA') {
        // res.send("TA");
        User.find({
          role: {
            $ne: "BOSS"
          }
        }).sort({
          createdAt: -1
        }).then(users => {
          res.render("user/show", {
            role: "TA",
            users: users
          });
        });
      } else {
        //STUDENT      
        User.find({
          role: {
            $eq: "STUDENT"
          }
        }).sort({
          createdAt: -1
        }).then(users => {
          res.render("user/show", {
            role: "STUDENT",
            users: users
          });
        });
      }
    })
    .catch(error => next(error));
};

module.exports.createUser = (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;
  const role = req.body.role;
  if (!username || !password) {
    User.find().sort({
      createdAt: -1
    }).then(users => {
      res.render("user/show", {
        role: "BOSS",
        users: users,
        error: {
          username: username ? '' : 'Username is required',
          password: password ? '' : 'Password is required',
          role: role ? '' : 'Role is required'
        }
      });
    });
  } else {
    User.findOne({
        username: req.body.username
      })
      .then(user => {
        if (user != null) {
          User.find().sort({
            createdAt: -1
          }).then(users => {
            res.render("user/show", {
              role: "BOSS",
              users: users,
              error: {
                username: username ? '' : 'Username already exists'
              }
            });
          });
        } else {
          user = new User(req.body);
          user.save()
            .then(() => {
              // req.flash('info', 'Successfully sign up, now you can login!');
              // res.send("GO TO LOGIN");
              User.find().sort({
                createdAt: -1
              }).then(users => {
                res.render("user/show", {
                  role: "BOSS",
                  users: users
                });
              });
            }).catch(error => {
              if (error instanceof mongoose.Error.ValidationError) {
                User.find().sort({
                  createdAt: -1
                }).then(users => {
                  res.render("user/show", {
                    role: "BOSS",
                    users: users,
                    error: error.errors
                  });
                });
              } else {
                next(error);
              }
            });
        }
      }).catch(error => next(error));
  }
};

module.exports.delete = (req, res, next) => {
  console.log("req.body.username"+req.body.username);
  console.log("req.body.username"+req.body._id);
  console.log("req.params"+req.params.id);
  console.log("req.body.username"+req.body.username);
  console.log("req.body.username"+req.body.username);
  console.log("req.body.username"+req.body.username);
  
  User.findByIdAndRemove(req.params.id).then(user => {
    User.find().sort({
      createdAt: -1
    })
    .then(users => {
      res.render('user/show', {
        users: users,
        role: "BOSS"
      });
    })
    .catch(error => next(error));
  })
  .catch(error => next(error));
};