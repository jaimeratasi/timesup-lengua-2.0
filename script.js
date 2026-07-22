import { db } from "./firebase.js";
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
    .forEach(x=>x.classList.add("hidden"));


    document.getElementById(nombre).classList.remove("hidden");

}



// ==========================
// EVENTOS
// ==========================

window.addEventListener("load",()=>{

ui.teacherBtn.onclick=()=>pantalla("homeScreen");
    
ui.studentBtn.onclick=()=>pantalla("join");
    
    ui.createGameBtn.onclick=crearPartida;

    ui.joinBtn.onclick=unirsePartida;

    ui.startGameBtn.onclick=iniciarJuego;

});



// ==========================
// CREAR PARTIDA
// ==========================

async function crearPartida(){

    partidaId = codigo();

    await setDoc(
        doc(db,"partidas",partidaId),
        {

            estado:"lobby",

            jugadores:[],

            ronda:1,

            turno:0

        }
    );


    ui.gameCodeBox.textContent=partidaId;


    escucharPartida();


    pantalla("lobby");


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
    "Jugador-"+Math.floor(Math.random()*9999);



    await updateDoc(ref,{

        jugadores:
        arrayUnion(jugadorId)

    });


    escucharPartida();


    alert("Unido a la partida");

}



// ==========================
// ESCUCHAR PARTIDA
// ==========================

function escucharPartida(){

    onSnapshot(
        doc(db,"partidas",partidaId),
        (snap)=>{


            if(!snap.exists())
                return;


            const datos=snap.data();


            console.log("Estado partida:",datos);



            if(datos.estado==="jugando"){

                pantalla("play");

            }


        }
    );

}



// ==========================
// COMENZAR
// ==========================

async function iniciarJuego(){


    await updateDoc(
        doc(db,"partidas",partidaId),
        {

            estado:"jugando"

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
