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
let jugadorNumero = null;
let intervaloTiempo = null;


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
    startGameBtn: document.getElementById("startGameBtn"),

    joinCode: document.getElementById("joinCode"),

    gameCodeBox: document.getElementById("gameCodeBox"),

    correctBtn: document.getElementById("correctBtn"),
    passBtn: document.getElementById("passBtn")

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
console.log("ENTRANDO EN LOAD");
    ui.teacherBtn.onclick = () => pantalla("homeScreen");

    ui.studentBtn.onclick = () => pantalla("joinScreen");

    ui.createGameBtn.onclick = crearPartida;

    ui.joinBtn.onclick = unirsePartida;

    ui.startGameBtn.onclick = iniciarJuego;

    ui.correctBtn.onclick = acierto;

ui.passBtn.onclick = pasar;
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

   jugadorId =
"Jugador-" + Math.floor(Math.random()*9999);


const jugadoresActuales = partida.data().jugadores || [];

jugadorNumero = jugadoresActuales.length;


await updateDoc(ref,{
    jugadores:
    arrayUnion(jugadorId)
});

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

    document.getElementById("timer").textContent = datos.tiempo;

    document.getElementById("remainingCards").textContent =
        "Quedan " + datos.cartas.length + " cartas";

}


        }
    );

}
function mostrarCarta(datos){

    const carta = document.getElementById("gameCard");

    const contador = document.getElementById("remainingCards");


    if(datos.jugadorActivo === 0 && jugadorId){

        carta.textContent =
        datos.cartaActual || "Esperando carta";

    }
    else{

        carta.textContent =
        "Esperando turno";

    }


    contador.textContent =
    "Quedan " + datos.cartas.length + " cartas";

}


// ==========================
// COMENZAR
// ==========================

async function iniciarJuego(){

    await updateDoc(
        doc(db,"partidas",partidaId),
        {
            estado:"jugando",
            cartaActual:"Metáfora",
            tiempo:60
        }
    );

    iniciarTemporizador();

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
async function acierto(){

    const ref = doc(db,"partidas",partidaId);

    const partida = await getDoc(ref);

    const datos = partida.data();

    const nuevasCartas = [...datos.cartas];

    nuevasCartas.shift();

    await updateDoc(ref,{
        cartas: nuevasCartas,
        cartaActual: nuevasCartas[0] || null
    });

}
async function pasar(){

    const ref = doc(db,"partidas",partidaId);

    const partida = await getDoc(ref);

    const datos = partida.data();

    const nuevasCartas = [...datos.cartas];

    const cartaPasada = nuevasCartas.shift();

    nuevasCartas.push(cartaPasada);


    await updateDoc(ref,{

        cartas: nuevasCartas,

        cartaActual: nuevasCartas[0]

    });

}
function iniciarTemporizador(){
    console.log("TEMPORIZADOR INICIADO");

    if(intervaloTiempo){
        clearInterval(intervaloTiempo);
    }


    intervaloTiempo = setInterval(async ()=>{

        const ref = doc(db,"partidas",partidaId);

        const partida = await getDoc(ref);

        const datos = partida.data();


      if(datos.tiempo <= 0){

    clearInterval(intervaloTiempo);


    await updateDoc(ref,{
        tiempo:60,
        jugadorActivo: datos.jugadorActivo + 1
    });


    return;

}

        await updateDoc(ref,{
            tiempo: datos.tiempo - 1
        });


    },1000);

}
