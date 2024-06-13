import telegramBot from "node-telegram-bot-api"
import dotenv from "dotenv"
// import fs from "fs"
// import util from "util"

dotenv.config()

// Reemplaza 'YOUR_TELEGRAM_BOT_TOKEN' con el token que te dio el BotFather
const token = '7430626312:AAEJpCjYbuKsdGs9ZHiEsrwrBWkvS4KDzvs';

// Crea una instancia del bot
const bot = new telegramBot(token, { polling: true });

// Preguntas del quiz
const questions = [
  { question: '¿Cuántos días tiene una semana?', answer: 7 },
  { question: '¿Cuántos planetas hay en el sistema solar?', answer: 8 },
  { question: '¿Cuántos minutos hay en una hora?', answer: 60 },
  { question: '¿Cuántas horas hay en un día?', answer: 24 },
  { question: '¿Cuántas semanas tiene un año?', answer: 52 },
  { question: '¿Cuántos meses tiene un año?', answer: 12 },
  { question: '¿Cuántos centímetros hay en un metro?', answer: 100 },
  { question: '¿Cuántos mililitros hay en un litro?', answer: 1000 },
  { question: '¿Cuántos años hay en una década?', answer: 10 },
  { question: '¿Cuántos huesos tiene el cuerpo humano adulto?', answer: 206 },
  { question: '¿Cuántos estados tiene Estados Unidos?', answer: 50 },
  { question: '¿Cuántos segundos hay en un minuto?', answer: 60 },
  { question: '¿Cuántos colores hay en el arcoíris?', answer: 7 },
  { question: '¿Cuántas patas tiene una araña?', answer: 8 },
  { question: '¿Cuántas teclas tiene un piano estándar?', answer: 88 },
  { question: '¿Cuántos elementos hay en la tabla periódica?', answer: 118 },
  { question: '¿Cuántos anillos olímpicos hay?', answer: 5 },
  { question: '¿Cuántos continentes hay en el mundo?', answer: 7 },
  { question: '¿Cuántas cartas hay en un mazo de cartas estándar sin contar los comodines?', answer: 52 },
  { question: '¿Cuántos jugadores hay en un equipo de fútbol en el campo?', answer: 11 }
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

// Manejar el comando de inicio
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, `¡Bienvenido al quiz! Aquí están las reglas:
1. Responde cada pregunta con un número.
2. Tienes 10 segundos para responder cada pregunta.
3. Si te equivocas o tardas más de 10 segundos, el quiz se reinicia.
4. Puedes detener el quiz en cualquier momento con /stop.
Para comenzar, escribe /quiz.`);
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

// Manejar mensajes de los usuarios
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!text.startsWith('/')) { // Ignorar comandos
    handleAnswer(chatId, text);
  }
});

console.log('El bot está en funcionamiento');