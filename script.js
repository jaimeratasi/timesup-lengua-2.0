import { db } from "./firebase.js";
import { DECKS } from "./cards.js";
import {
    doc,
    setDoc,
    getDoc,
    updateDoc,
    arrayUnion,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


// ==========================
// ESTADO LOCAL
// ==========================

let partidaId = null;
let jugadorId = null;


// ==========================
// INTERFAZ
// ==========================

const ui = {

    welcomeScreen: document.getElementById("welcomeScreen"),
    homeScreen: document.getElementById("homeScreen"),
    joinScreen: document.getElementById("joinScreen"),
    lobbyScreen: document.getElementById("lobbyScreen"),
    playScreen: document.getElementById("playScreen"),

    teacherBtn: document.getElementById("teacherBtn"),
    studentBtn: document.getElementById("studentBtn"),

    createGameBtn: document.getElementById("createGameBtn"),
    joinBtn: document.getElementById("joinBtn"),

    joinCode: document.getElementById("joinCode"),

    gameCodeBox: document.getElementById("gameCodeBox"),

    startGameBtn: document.getElementById("startGameBtn")

};


// ==========================
// PANTALLAS
// ==========================

function pantalla(nombre){

    document.querySelectorAll(".screen")
    .forEach(x => x.classList.add("hidden"));

    const pantalla = document.getElementById(nombre);

    if(!pantalla){
        console.error("No existe la pantalla:", nombre);
        return;
    }

    pantalla.classList.remove("hidden");

}


// ==========================
// EVENTOS
// ==========================

window.addEventListener("load",()=>{

ui.teacherBtn.onclick=()=>pantalla("homeScreen");
    
ui.studentBtn.onclick=()=>pantalla("joinScreen");
    
    ui.createGameBtn.onclick=crearPartida;

    ui.joinBtn.onclick=unirsePartida;

    ui.startGameBtn.onclick=iniciarJuego;

});



// ==========================
// CREAR PARTIDA
// ==========================

async function crearPartida(){

    partidaId = codigo();


    const mazoElegido = "figuras"; 
    // temporalmente usamos figuras para probar


    const cartas = [...DECKS[mazoElegido].cartas];


    await setDoc(
        doc(db,"partidas",partidaId),
        {

            estado:"lobby",

            jugadores:[],

            ronda:1,

            turno:0,

            jugadorActivo:0,

            cartas:cartas,

            cartaActual:null,

            tiempo:60

        }
    );


    ui.gameCodeBox.textContent = partidaId;


    escucharPartida();


    pantalla("lobbyScreen");


}



// ==========================
// UNIRSE
// ==========================

async function unirsePartida(){

    partidaId =
    ui.joinCode.value.trim().toUpperCase();


    const ref =
    doc(db,"partidas",partidaId);


    const partida =
    await getDoc(ref);


    if(!partida.exists()){

        alert("No existe la partida");

        return;

    }


    jugadorId =
    "Jugador-" + Math.floor(Math.random()*9999);


    await updateDoc(ref,{

        jugadores:
        arrayUnion(jugadorId)

    });


    escucharPartida();


    alert("Te has unido a la partida");

}


// ==========================
// ESCUCHAR PARTIDA
// ==========================

function escucharPartida(){

    console.log("Escuchando partida:", partidaId);


    onSnapshot(
        doc(db,"partidas",partidaId),
        (snap)=>{


            if(!snap.exists()){

                console.log("La partida no existe");

                return;

            }


            const datos=snap.data();


            console.log("Cambio recibido:", datos);



            if(datos.estado==="jugando"){

                pantalla("playScreen");

                mostrarCarta(datos);

            }


        }
    );

}
function mostrarCarta(datos){


    const carta =
    document.getElementById("gameCard");


    if(datos.jugadorActivo === 0 && jugadorId){

        carta.textContent =
        datos.cartaActual || "Esperando carta";

    }
    else{

        carta.textContent =
        "Esperando turno";

    }


}


// ==========================
// COMENZAR
// ==========================

async function iniciarJuego(){

    await updateDoc(
        doc(db,"partidas",partidaId),
        {
            estado:"jugando",
            cartaActual:"Metáfora"
        }
    );

}



// ==========================
// CODIGO
// ==========================

function codigo(){

    const letras="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    let r="";


    for(let i=0;i<8;i++){

        r+=letras[
            Math.floor(Math.random()*letras.length)
        ];

    }


    return r;

}

async function prepararPrimeraCarta(){

    const ref = doc(db,"partidas",partidaId);

    const partida = await getDoc(ref);

    const datos = partida.data();

    if(datos.cartaActual){
        return;
    }


    await updateDoc(ref,{

        cartaActual: datos.cartas[0]

    });

}
