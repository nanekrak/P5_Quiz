const figlet = require('figlet');
const chalk = require ('chalk');

/**
 *Dar color a un string.
 *
 *@param msg El string que se quiere colorear
 *@param color El color con el que se quiere colorear
 *@returns {string} Devuelve el string coloreado
 */
const colorize = (msg, color) => {
  if (typeof color !== "undefined"){
    msg = chalk[color].bold(msg);
  }
  return msg;
};

/**
 *Escribe mensaje de log
 *
 *@param msg El string que se quiere colorear
 *@param color El color con el que se quiere colorear
 */
const log = (socket,msg, color) => {
  socket.write(colorize(msg,color) + "\n");
};

/**
 *Escribe mensaje de log grande
 *
 *@param msg Texto a escribir
 *@param color El color con el que se quiere colorear
 */
const biglog = (socket,msg, color) => {
  log(socket,figlet.textSync(msg, {horizontalLayout: 'full'}),color);
};

/**
 *Escribe mensaje de error
 *
 *@param emsg El mensaje de error
 */
const errorlog = (socket,emsg) => {
  socket.write(`${colorize("Error", "red")}: ${colorize(colorize(emsg, "red"),'bgYellowBright')}\n`);
};

exports = module.exports = {
  colorize,
  log,
  biglog,
  errorlog
}
