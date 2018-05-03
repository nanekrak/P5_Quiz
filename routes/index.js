var express = require('express');
var router = express.Router();

var quiz_control= require ('../control/quiz_control');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/credits', function(req,res,next){
  res.render('credits');
});

router.get('/quizzes', quiz_control.index);


module.exports = router;
