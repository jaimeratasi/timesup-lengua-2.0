/* =======================================================
   PALABRA MAESTRA
   Motor del juego
======================================================= */
import { db } from "./firebase.js";

import {
    doc,
    setDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const game = {

    mode: "Time's Up",

    deckName: "",

    originalDeck: [],

    deck: [],

    currentCard: null,

    round: 1,

    timer: 60,

    secondsPerTurn: 60,

    cardsPerGame: 30,

    correctCards: [],

    currentTurnCorrect: 0,

    interval: null,

    seed: null

};



/* =======================================================
   INTERFAZ
======================================================= */

const ui = {

    homeScreen: document.getElementById("homeScreen"),

    playScreen: document.getElementById("playScreen"),

    turnScreen: document.getElementById("turnScreen"),

    roundScreen: document.getElementById("roundScreen"),

    finishScreen: document.getElementById("finishScreen"),

    deckSelect: document.getElementById("deckSelect"),

    cardsNumber: document.getElementById("cardsNumber"),

    roundTime: document.getElementById("roundTime"),

    gameMode: document.getElementById("gameMode"),

    createGameBtn: document.getElementById("createGameBtn"),

    timer: document.getElementById("timer"),

    gameCard: document.getElementById("gameCard"),

    remainingCards: document.getElementById("remainingCards"),

    correctBtn: document.getElementById("correctBtn"),

    passBtn: document.getElementById("passBtn"),

    roundLabel: document.getElementById("roundLabel")

};



/* =======================================================
   INICIO
======================================================= */

window.addEventListener("load", init);

function init(){

    cargarMazos();

    mostrarPantalla("home");

    registrarEventos();

}



/* =======================================================
   MAZOS
======================================================= */

function cargarMazos(){

    ui.deckSelect.innerHTML = "";

    for(const id in DECKS){

        const option = document.createElement("option");

        option.value = id;

        option.textContent = DECKS[id].nombre;

        ui.deckSelect.appendChild(option);

    }

}



/* =======================================================
   PANTALLAS
======================================================= */

function mostrarPantalla(nombre){

    ui.homeScreen.classList.add("hidden");

    ui.playScreen.classList.add("hidden");

    ui.turnScreen.classList.add("hidden");

    ui.roundScreen.classList.add("hidden");

    ui.finishScreen.classList.add("hidden");

    switch(nombre){

        case "home":

            ui.homeScreen.classList.remove("hidden");

        break;

        case "play":

            ui.playScreen.classList.remove("hidden");

        break;

        case "turn":

            ui.turnScreen.classList.remove("hidden");

        break;

        case "round":

            ui.roundScreen.classList.remove("hidden");

        break;

        case "finish":

            ui.finishScreen.classList.remove("hidden");

        break;

    }

}



/* =======================================================
   EVENTOS
======================================================= */

function registrarEventos(){

    ui.createGameBtn.addEventListener("click", crearPartida);

}



/* =======================================================
   PARTIDA
======================================================= */

async function crearPartida() {

    game.mode = ui.gameMode.value;
    game.deckName = ui.deckSelect.value;
    game.cardsPerGame = Number(ui.cardsNumber.value);
    game.secondsPerTurn = Number(ui.roundTime.value);

    const gameId = generarCodigo();

    await setDoc(doc(db, "partidas", gameId), {
        creada: new Date(),
        ronda: 1,
        mazo: game.deckName,
        modo: game.mode,
        cartas: game.cardsPerGame,
        segundos: game.secondsPerTurn
    });

    alert("Partida creada: " + gameId);

}
function generarCodigo(){

    const caracteres = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    let codigo = "";

    for(let i=0;i<8;i++){

        codigo += caracteres[Math.floor(Math.random()*caracteres.length)];

    }

    return codigo;

}
