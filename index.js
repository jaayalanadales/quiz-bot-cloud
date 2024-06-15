import telegramBot from "node-telegram-bot-api"
import dotenv from "dotenv"
// import fs from "fs"
// import util from "util"

dotenv.config()

import express from 'express'
const app = express()
const port = 49279;

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
})

// Reemplaza 'YOUR_TELEGRAM_BOT_TOKEN' con el token que te dio el BotFather
const token = '7430626312:AAEJpCjYbuKsdGs9ZHiEsrwrBWkvS4KDzvs';

// Crea una instancia del bot
const bot = new telegramBot(token, { polling: true });

// Preguntas del quiz
const questions = [
  { question: '¿En qué año se descubrió América?', answer: 1492 },
  { question: '¿Cuántos años tiene la cantante japonesa Ado? (Suponiendo que estamos en Junio de 2024)', answer: 21 },
  { question: '¿Cuántas veces ha ganado Antonio Martínez Ares, el Goku del carnaval, el primer premio de Comparsas del Carnaval de Cádiz? (Suponiendo que estamos en Junio de 2024)', answer: 10 },
  { question: '¿Cuántos elementos hay en la tabla periódica?', answer: 118 },
  { question: '¿Cuántas teclas tiene un piano estándar?', answer: 88 },
  { question: '¿Cuántos estados tiene Estados Unidos?', answer: 50 },
  { question: '¿Cuántos huesos tiene el cuerpo humano adulto?', answer: 206 },
  { question: '¿Cuántas cartas hay en un mazo de cartas estándar sin contar los comodines?', answer: 52 },
  { question: '¿Cuántos dedos tiene una rata en su pata trasera?', answer: 5 },
  { question: '¿Cuánto suman los pelos que tiene en la cabeza Ras, más los pelos que tiene en la cabeza Eusebio, más los pelos que tiene en la cabeza Antonio el peluso?', answer: 0 },
  { question: '¿Cuántos segundos hay en 2 horas y 24 minutos?', answer: 8640 },
  { question: '¿En qué año murió Juan Carlos Aragón Becerra, el Eterno Capitán Veneno?', answer: 2019 },
  { question: '¿En qué año empezó a publicarse el manga One Piece?', answer: 1997 },
  { question: '¿Cuántos capítulos tiene el anime Dragon Ball Z?', answer: 291 },
  { question: '¿Cuántos mundos visitas en Kingdom Hearts 1?', answer: 13 },
  { question: '¿Cuántos hijos tiene Heihachi Mishima (Tekken), contando ilegítimos y adoptados?', answer: 4 },
  { question: '¿Cuántos eones hay en Final Fantasy X?', answer: 8 },
  { question: '¿En qué año se lanzó el juego para PC League of Legends?', answer: 2009 },
  { question: '¿En qué año se descubrió la estructura del ADN?', answer: 1953 },
  { question: '¿En qué año terminó la Segunda Guerra Mundial?', answer: 1945 },
  { question: '¿Cuántas temporadas tiene la serie "Friends"?', answer: 10 },
  { question: '¿Cuántos libros componen la serie "Harry Potter"?', answer: 7 },
  { question: '¿Cuántos pares de cromosomas tiene el ser humano?', answer: 23 },
  { question: '¿En qué año se lanzó el primer juego de la serie "The Legend of Zelda"?', answer: 1986 },
  { question: '¿En qué año se lanzó el primer juego de la serie "Resident Evil"?', answer: 1996 },
  { question: '¿Cuántos volúmenes tiene el manga "Attack on Titan" (Shingeki no Kyojin)?', answer: 34 },
  { question: '¿Cuántos personajes jugables hay en "Super Smash Bros. Ultimate"?', answer: 89 },
  { question: '¿Cuántos finales diferentes tiene "Nier: Automata"?', answer: 26 },
  { question: '¿En qué año se lanzó el manga "My Hero Academia"?', answer: 2014 },
  { question: '¿Cuántos capítulos tiene el anime "Fullmetal Alchemist: Brotherhood"?', answer: 64 }
];


// Variables de estado del quiz
let currentQuestionIndex = 0;
let currentChatId = null;
let timeoutHandle = null;
let questionsOrder = [];
let quizActive = false;

// Función para iniciar el quiz
const startQuiz = (chatId) => {
  currentChatId = chatId;
  questionsOrder = questions.map((_, index) => index).sort(() => Math.random() - 0.5); // Aleatorizar el orden de las preguntas
  currentQuestionIndex = 0;
  quizActive = true;
  sendQuestion();
};

// Función para enviar la siguiente pregunta
const sendQuestion = () => {
  if (quizActive && currentQuestionIndex < questionsOrder.length) {
    const questionIndex = questionsOrder[currentQuestionIndex];
    const question = questions[questionIndex].question;
    bot.sendMessage(currentChatId, `Pregunta ${currentQuestionIndex + 1}: ${question}`);
    // Inicia un temporizador de 10 segundos para la respuesta
    timeoutHandle = setTimeout(() => {
      if (quizActive) {
        bot.sendMessage(currentChatId, '¡Tiempo agotado! El quiz se ha reiniciado.');
        startQuiz(currentChatId);
      }
    }, 10000);
  } else if (quizActive) {
    bot.sendMessage(currentChatId, '¡Felicidades! Has completado el quiz.');
    quizActive = false;
  }
};

// Función para manejar respuestas de los usuarios
const handleAnswer = (chatId, answer) => {
  if (quizActive && chatId === currentChatId) {
    clearTimeout(timeoutHandle); // Detener el temporizador actual
    const questionIndex = questionsOrder[currentQuestionIndex];
    const correctAnswer = questions[questionIndex].answer;
    if (parseInt(answer) === correctAnswer) {
      currentQuestionIndex++;
      sendQuestion();
    } else {
      bot.sendMessage(currentChatId, '¡Respuesta incorrecta! El quiz se ha reiniciado.');
      startQuiz(currentChatId);
    }
  }
};

// Función para detener el quiz
const stopQuiz = (chatId) => {
  if (quizActive && chatId === currentChatId) {
    quizActive = false;
    clearTimeout(timeoutHandle); // Detener el temporizador actual
    bot.sendMessage(chatId, 'El quiz se ha detenido. Para empezar de nuevo, escribe /quiz.');
  }
};

// Función para enviar las reglas del quiz
const sendRules = (chatId) => {
  const rulesMessage = `Lista de reglas (/rules para mostrar):
1. Hay un total de 30 preguntas.
2. TODAS las respuestas son un número.
3. El orden de las preguntas es completamente aleatorio, cambia cada vez que se empieza el quiz.
4. Tienes 10 segundos para responder cada pregunta.
5. Si te equivocas o tardas más de 10 segundos, el quiz se reinicia.
6. Puedes detener el quiz en cualquier momento con /stop.
7. Para comenzar, escribe /quiz.
8. Una vez respondidas las 30 preguntas seguidas se revelará el número.`;

  bot.sendMessage(chatId, rulesMessage);
};

// Manejar el comando de inicio
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  
  // Mensaje de introducción
  bot.sendMessage(chatId, `¡Hola! Soy Señor Numérico, tu compañero apasionado de los números. Estoy aquí para ponerte a prueba con un maravilloso quiz. ¡Vamos a divertirnos y a aprender juntos!`);
  
  // Mensaje con las reglas
  sendRules(chatId);
});

// Manejar el comando del quiz
bot.onText(/\/quiz/, (msg) => {
  const chatId = msg.chat.id;
  startQuiz(chatId);
});

// Manejar el comando para detener el quiz
bot.onText(/\/stop/, (msg) => {
  const chatId = msg.chat.id;
  stopQuiz(chatId);
});

// Manejar el comando /rules
bot.onText(/\/rules/, (msg) => {
  const chatId = msg.chat.id;
  sendQuestion(chatId)
});

// Manejar mensajes de los usuarios
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!text.startsWith('/')) { // Ignorar comandos
    handleAnswer(chatId, text);
  }
});

console.log('El bot está en funcionamiento');