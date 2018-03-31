const readline = require('readline');

const {models} = require('./model');
const {log,biglog,errorlog, colorize} = require('./out');

const Sequelize = require('sequelize');

//Devuelve una promesa si el id es valido
const validateId = id =>{

  return new Sequelize.Promise((resolve, reject) => {
    if (typeof id === "undefined"){
      reject(new Error(`Falta el parametro <id>.`));
    }else{
      id=parseInt(id);
      if(Number.isNaN(id)){
        reject(new Error(`El valor del parametro <id> no es un numero.`));
      }else{
        resolve(id);
      }
    }
  })
}

const makeQuestion =(rl, text) => {
  return new Sequelize.Promise ((resolve, reject) => {
    rl.question(colorize(` ¿${text}? `, 'red'), answer => {
      resolve(answer.trim());
    });
  });
};
/*
 *Muestra el comando de ayuda por pantalla.
 */
exports.helpCmd = (socket,rl) => {
  log(socket,'Comandos:');
  log(socket,'   h|help - Muestra esta ayuda.');
  log(socket,'   show <id> - Muestra la pregunta y la respuesta el quiz indicado.');
  log(socket,'   add - Añadir un nuevo quiz interactivamente.');
  log(socket,'   delete <id> - Borrar el quiz indicado.');
  log(socket,'   edit <id> - Editar el quiz indicado.');
  log(socket,'   test <id> - Probar el quiz indicado.');
  log(socket,'   p|play - Jugar a preguntar aleatoriamente todos los quizzes.');
  log(socket,'   credits - Créditos.');
  log(socket,'   q|quit - Quitar el programa.');
  rl.prompt();
}

/*
 *Termina el programa.
 */
exports.quitCmd = (socket,rl) => {
  rl.close();
  rl.prompt();
}

/*
 *Anade una nueva pregunta
 */


exports.addCmd = (socket,rl) => {

  makeQuestion(rl, 'Pregunta')
  .then(q => {
    return makeQuestion(rl, 'Respuesta')
    .then(a => {
      return {question: q, answer:a};
    });
  })
.then(quiz=>{
    return models.quiz.create(quiz);
})
.then((quiz) => {
    log(socket,`${colorize('Se ha añadido', 'magenta')}: ${quiz.question} ${colorize(' => ','magenta')} ${quiz.answer}`);
})
.catch(Sequelize.ValidationError, error => {
  errorlog (socket,'El quiz es erroneo:');
  error.errors.forEach(({message}) => errorlog(message));
})
.catch(error => {
  errorlog(socket,error.message);
})
.then(() => {
  rl.prompt();
});

};

/*
 *Saca todos los quizzes existentes
 */
exports.listCmd = (socket,rl) => {

  models.quiz.findAll()
  .each(quiz => {
      log(socket,`[${colorize(quiz.id, 'magenta')}]:  ¿${quiz.question}?`);
    })
  .catch(error =>{
    errorlog(socket,error.message);
  })
  .then(()=>{
    rl.prompt();
  })
}

/*
 *Muestra el quiz que se indica
 */
exports.showCmd = (socket,rl,id) => {

  validateId(id)
  .then(id => models.quiz.findById(id))
  .then(quiz => {
    if(!quiz){
      throw new Error (` No existe un quiz asociado al id=${id}.`);
    }
    log(socket,`  [${colorize(quiz.id,'magenta')}]: ${quiz.question} ${colorize('=>','magenta')} ${quiz.answer}`);
  })
  .catch(error => {
    errorlog(socket,error.message);
  })
  .then(() => {
    rl.prompt();
  });

};

/*
 *Prueba el quiz que se indica
 */
exports.testCmd = (socket,rl,id) => {
  validateId(id)
  .then(id => models.quiz.findById(id))
  .then(quiz => {
    if (!quiz){
      throw new Error(` No existe un quiz asociado al id=${id}.`)
    }
    return new Promise((resolve, reject) => {


    makeQuestion(rl, quiz.question)
    .then(answer => {
      if(answer.toLowerCase().trim() === quiz.answer.toLowerCase().trim()){
        log(socket,'Su respuesta es correcta');
        biglog(socket,'Correcta', 'green');
        resolve()
      }else{
        log(socket,'Su respuesta es incorrecta');
        biglog(socket,'Incorrecta', 'red');
        resolve()
      }
    })
  })
})
  .catch(error => {
    errorlog(socket,error.message);
  })
  .then(() => {
    rl.prompt();
  });

}


/*
 *Empieza el juego
 */
exports.playCmd = (socket,rl) => {

  		let score = 0; //acumulov el resultado
  		let toBePlayed = []; //array a rellenar con todas las preguntas de la BBDD. Como se consigue? Con una promesa

      for (i=0; i<models.quiz.count();i++){
        toBeResolved[i]=i;
      }

  		const playOne = () => {
        return new Promise ((resolve, reject) => {
  				if(toBePlayed.length === 0) {
            log(socket,' ¡No hay preguntas que responder!','yellow');
            log(socket,' Fin del examen. Aciertos: ');
  					resolve();
  					return;
  				}
  				let pos = Math.floor(Math.random()*toBePlayed.length);
  				let quiz = toBePlayed[pos];
  		    toBePlayed.splice(pos, 1); //lo borro porque ya no lo quiero más

  		    makeQuestion(rl, quiz.question)
  		    .then(answer => {
            if(answer.toLowerCase().trim() === quiz.answer.toLowerCase().trim()){
              score++;
  				    log(socket,`  CORRECTO - Lleva ${score} aciertos`);
  				    resolve(playOne());
            }else{
              log(socket,'  INCORRECTO ');
              log(socket,`  Fin del juego. Aciertos: ${score} `);
  				    resolve();
  			    }
  		    })
  	     })
  	  }
  		models.quiz.findAll({raw: true}) //el raw hace que enseñe un string solamente en lugar de todo el contenido
  		.then(quizzes => {
  			toBePlayed= quizzes;
      })
  		.then(() => {
  		 	return playOne(); //es necesario esperar a que la promesa acabe, por eso no es un return a secas
  		 })
  		.catch(e => {
  			errorlog(socket,"Error:" + e); //usar errorlog con colores
  		})
  		.then(() => {
  			biglog(socket,score, 'blue');
  			rl.prompt();
  		})
}

/*
 *Borra el quiz indicado
 */
exports.deleteCmd = (socket,rl,id) => {
validateId(id)
.then(id => models.quiz.destroy({where: {id}}))
.catch(error => {
  errorlog(socket,error.message);
})
.then(() => {
  rl.prompt();
});
};

/*
 *Edita el quiz indicado
 */
exports.editCmd = (socket,rl,id) => {
  validateId(id)
  .then(id => models.quiz.findById(id))
  .then(quiz => {
    if(!quiz){
      throw new Error(`No existe el parametro asociado ${id}.`);
    }

    process.stdout.isTTY && setTimeout(() => {rl.write(quiz.question)},0);
    return makeQuestion(rl, ' Introduzca la pregunta: ')
    .then(q => {
        process.stdout.isTTY && setTimeout(() => {rl.write(quiz.answer)},0);
        return makeQuestion(rl, 'Introduzca la respuesta ')
        .then(a => {
          quiz.question =q;
          quiz.answer =a;
          return quiz;
        });
    });
  })
.then(quiz => {
  return quiz.save();
})
.then(quiz => {
  log (socket,`Se ha cambiado el quiz ${colorize(quiz.id, 'magenta')} por: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`)
})
.catch(Sequelize.ValidationError, error => {
  errorlog(socket,'El quiz es erroneo:');
  error.errors.forEach(({message}) => errorlog(message));
})
.catch(error => {
  errorlog(socket,error.message);
})
.then(() => {
  rl.prompt();
});
}

/*
 *Muestra los creditos
 */
exports.creditsCmd = (socket,rl) => {
  log(socket,'Autores de la práctica:');
  log(socket,'Andres Jimenez', 'green');
  log(socket,'Javier Anton', 'green');
  rl.prompt();
}
