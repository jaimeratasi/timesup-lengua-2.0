/* =======================================================
   PALABRA MAESTRA
   Motor del juego
======================================================= */
import { getDoc } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
import { db } from "./firebase.js";
import { DECKS } from "./cards.js";
import {
    doc,
    setDoc,
    updateDoc,
    onSnapshot,
    arrayUnion
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

welcomeScreen: document.getElementById("welcomeScreen"),

teacherBtn: document.getElementById("teacherBtn"),

studentBtn: document.getElementById("studentBtn"),

joinScreen: document.getElementById("joinScreen"),

joinBtn: document.getElementById("joinBtn"),

joinCode: document.getElementById("joinCode"),
   
   homeScreen: document.getElementById("homeScreen"),

   lobbyScreen: document.getElementById("lobbyScreen"),

gameCodeBox: document.getElementById("gameCodeBox"),

copyGameCodeBtn: document.getElementById("copyGameCodeBtn"),

startGameBtn: document.getElementById("startGameBtn"),

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

    mostrarPantalla("welcome");

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
   ui.welcomeScreen.classList.add("hidden");
ui.joinScreen.classList.add("hidden");

    ui.homeScreen.classList.add("hidden");

    ui.playScreen.classList.add("hidden");

    ui.turnScreen.classList.add("hidden");

    ui.roundScreen.classList.add("hidden");

    ui.finishScreen.classList.add("hidden");
   
    ui.lobbyScreen.classList.add("hidden");

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

          case "lobby":
    ui.lobbyScreen.classList.remove("hidden");
break;
          case "welcome":
    ui.welcomeScreen.classList.remove("hidden");
break;

case "join":
    ui.joinScreen.classList.remove("hidden");
break;

    }

}



/* =======================================================
   EVENTOS
======================================================= */

function registrarEventos(){

    ui.createGameBtn.addEventListener("click", crearPartida);
   ui.teacherBtn.addEventListener("click", () => {
    mostrarPantalla("home");
});

ui.studentBtn.addEventListener("click", () => {
    mostrarPantalla("join");
});
   ui.joinBtn.addEventListener("click", unirsePartida);
   ui.startGameBtn.addEventListener("click", iniciarPartida);
ui.correctBtn.addEventListener("click", acierto);

ui.passBtn.addEventListener("click", pasar);
}



/* =======================================================
   PARTIDA
======================================================= */

async function crearPartida() {

    try {

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
            segundos: game.secondsPerTurn,
            jugadores: []
        });

        console.log("Partida creada:", gameId);

        game.id = gameId;

        ui.gameCodeBox.textContent = gameId;

        mostrarPantalla("lobby");

    } catch (error) {

        console.error(error);
        alert(error.message);

    }

}
function generarCodigo(){

    const caracteres = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    let codigo = "";

    for(let i=0;i<8;i++){

        codigo += caracteres[Math.floor(Math.random()*caracteres.length)];

    }

    return codigo;

}
async function unirsePartida() {

    const codigo = ui.joinCode.value.trim().toUpperCase();

    const partida = await getDoc(doc(db, "partidas", codigo));

    if (!partida.exists()) {
        alert("No existe esa partida");
        return;
    }
await updateDoc(doc(db, "partidas", codigo), {
    jugadores: arrayUnion("Alumno")
});
    alert("¡Te has unido a la partida!");
}


function iniciarPartida(){

    mostrarPantalla("play");

    prepararCartas();
   ui.remainingCards.textContent = 
    "Quedan " + game.deck.length + " cartas";

    mostrarCarta();

    iniciarTemporizador();

}
function iniciarTemporizador(){

    game.timer = game.secondsPerTurn;

    ui.timer.textContent = game.timer;

    game.interval = setInterval(() => {

        game.timer--;

        ui.timer.textContent = game.timer;

        if(game.timer <= 0){

            clearInterval(game.interval);

            alert("Turno terminado");

        }

    },1000);

}
function acierto(){

    game.currentTurnCorrect++;

    quitarCarta();

}


function pasar(){

    quitarCarta();

}


function quitarCarta(){

    const posicion = game.deck.indexOf(game.currentCard);

    if(posicion !== -1){

        game.deck.splice(posicion,1);

    }

    ui.remainingCards.textContent = 
        "Quedan " + game.deck.length + " cartas";

    mostrarCarta();

}

function prepararCartas(){

    game.deck = [...DECKS[game.deckName].cartas];

}


function mostrarCarta(){

    if(game.deck.length === 0){

        ui.gameCard.textContent = "FIN";

        return;

    }

    const indice = Math.floor(Math.random()*game.deck.length);

    game.currentCard = game.deck[indice];

    ui.gameCard.textContent = game.currentCard;

}
