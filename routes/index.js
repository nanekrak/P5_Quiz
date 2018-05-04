var express = require('express');
var router = express.Router();
const {models}=require("../models/index");
const Sequelize=require("sequelize");
//const sequelize =require("../models/index")

var quiz_control= require ('../control/quiz_control');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/credits', function(req,res,next){
  res.render('credits');
});

router.get('/quizzes', function(req,res,next){
  models.quiz.findAll()
  .then(quizzes=>{
    res.render("quizzes", {quizzes})
  })
  .catch(error => next(error));
});


module.exports = router;
