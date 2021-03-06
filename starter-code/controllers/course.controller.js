const User = require('../models/user.model');
const Course = require('../models/course.model');

module.exports.formCourses = (req, res, next) => {
  Course.find().sort({
      createdAt: -1
    })
    .then(courses => {
      res.render('course/show', {
        user: req.session.passport.user,
        courses: courses,
        role: "TA"
      });
    })
    .catch(error => next(error));
};

module.exports.createCourse = (req, res, next) => {
  const name = req.body.name;
  const startingDate = req.body.startingDate;
  const endDate = req.body.endDate;
  const level = req.body.level;
  const available = req.body.available;
  if (!name || !startingDate || !endDate || !level || !available) {
    res.render('course/show', {
        course: {
          name: name
        },
        error: {
          name: name ? '' : 'Name is required',
          startingDate: startingDate ? '' : 'startingDate is required',
          endDate: endDate ? '' : 'endDate is required',
          level: level ? '' : 'level is required',
          available: available ? '' : 'available is required'
        }
      })
      .catch(error => next(error));;
  } else {
    Course.findOne({
        username: req.body.name
      })
      .then(course => {
        if (course != null) {
          res.render('course/show', {
              course: course,
              error: {
                name: 'coursename already exists'
              }
            })
            .catch(error => next(error));
        } else {
          course = new Course(req.body);
          course.save()
            .then(() => {
              // req.flash('info', 'Successfully sign up, now you can login!');
              // res.send("GO TO LOGIN");
              Course.find().sort({
                  createdAt: -1
                })
                .then(courses => {
                  res.render('course/show', {
                    courses: courses,
                    user: req.session.passport.user,
                    role: "TA"
                  });
                })
                .catch(error => next(error));
              // res.redirect('/login');
            }).catch(error => {
              if (error instanceof mongoose.Error.ValidationError) {
                res.render('course/show', {
                    user: req.session.passport.user,
                    course: course,
                    error: error.errors
                  })
                  .catch(error => next(error));
              } else {
                next(error);
              }
            });
        }
      }).catch(error => next(error));
  }
};

module.exports.edit = (req, res, next) => {
  Course.findById(req.params.id).then(course => {
      res.render('course/form', {
        course: course
      });
    })
    .catch(error => next(error));;
};
module.exports.updateDeleteAdd = (req, res, next) => {
  if (req.body.action === "update") {
    Course.findById(req.body._id).then(course => {
        const courseUpd = new Course({
          _id: req.body._id,
          name: req.body.name,
          startingDate: req.body.startingDate,
          endDate: req.body.endDate,
          level: req.body.level,
          available: course.available
        });
        Course.findByIdAndUpdate(req.body._id, courseUpd)
          .then(course => {
            Course.find().sort({
                createdAt: -1
              })
              .then(courses => {
                res.render('course/show', {
                  user: req.session.passport.user,
                  courses: courses,
                  role: "TA"
                });
              })
              .catch(error => next(error));
          })
          .catch(error => next(error));
      })
      .catch(error => next(error));
  } else if (req.body.action === "delete") {
    Course.findByIdAndRemove(req.body._id).then(course => {
        Course.find().sort({
            createdAt: -1
          })
          .then(courses => {
            res.render('course/show', {
              user: req.session.passport.user,
              courses: courses,
              role: "TA"
            });
          })
          .catch(error => next(error));
      })
      .catch(error => next(error));
  } else {
    //Go to add students
    User.find({
        role: {
          $eq: "STUDENT"
        }
      }).sort({
        createdAt: -1
      }).then(users => {
        Course.findById(req.body._id).then(course => {
          res.render(`course/addstudents`, {
            role: "TA",
            users: users,
            course: course
          });
        });
      })
      .catch(error => next(error));
  }
};

module.exports.addOrDeleteStudents = (req, res, next) => {
  console.log(req.body.action + "  req.body.action");
  if (req.body.action === "add") {
    User.findById(req.body._id)
      .then(student => {
        if (!student) {
          next();
        } else {

          Course.findById(req.params.id)
            .then(currentCourse => {
              const criteria = currentCourse.students.some(f => f == student._id) ? {
                $pull: {
                  students: student._id
                }
              } : {
                $addToSet: {
                  students: student._id
                }
              };
              Course.findByIdAndUpdate(currentCourse._id, criteria, {
                  new: true
                })
                .then(currentCourse => {
                  User.find({
                      role: {
                        $eq: "STUDENT"
                      }
                    }).sort({
                      createdAt: -1
                    }).then(users => {
                      res.render(`course/addstudents`, {
                        role: "TA",
                        users: users,
                        course: currentCourse
                      });
                    })
                    .catch(error => next(error));
                })
                .catch(error => next(error));
            })
            .catch(error => next(error));
        }
      })
      .catch(error => next(error));
  } else if (req.body.action === "delete") {
    res.send("BORRANDO");
  }
};

module.exports.formCoursesStudent = (req, res, next) => {
  console.log("req.params.id" + req.params.id);
  console.log("req.params.id" + req.params.id);
  console.log("req.params.id" + req.params.id);
  console.log("req.params.id" + req.params.id);
  let coursesStudent = [];
  Course.find().sort({
      createdAt: -1
    })
    .then(courses => {
      courses.forEach(course => {
        course.students.forEach(student => {
          if (req.params.id.toString() === student.toString()) {
            coursesStudent.push(course);
          }
        });
      });
      console.log(coursesStudent);

    })
    .catch(error => next(error));
  Course.find({
      students: req.params.id
    }).sort({
      createdAt: -1
    })
    .then(courses => {
      res.render('course/show', {
        user: req.session.passport.user,
        courses: courses,
        role: "STUDENT",
        coursesStudent:coursesStudent
      });
    })
    .catch(error => next(error));
};