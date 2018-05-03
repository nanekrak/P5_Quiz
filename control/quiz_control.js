var models = require("../models");
var Sequelize = require('sequelize');

exports.index = function(req, res, next){
  res.render('quizzes');
  /*models.Quiz.findAll()
  .then(function(quizzes){
    res.render('quizzes.ejs', {quizzes:quizzes});
  })
  .catch(function(error){
    next(error);
  })*/
}
