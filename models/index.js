
const Sequelize = require('sequelize');
const sequelize = new Sequelize("sqlite:quizzes.sqlite", {logging: false});
var path = require('path');

var Quiz = sequelize.import(path.join(__dirname, 'quiz'));

sequelize.sync()
.then(() => sequelize.models.quiz.count())
.then(count => {
    if (!count) {

        return sequelize.models.quiz.bulkCreate([
            { question: "Capital de Italia", answer: "Roma"},
            { question: "Capital de Francia", answer: "París"},
            { question: "Capital de España", answer: "Madrid"},
            { question: "Capital de Portugal", answer: "Lisboa"}
        ]);
    }
})
.catch(error => {
    console.log(error);
});

exports.Quiz=Quiz;
module.exports = sequelize;
