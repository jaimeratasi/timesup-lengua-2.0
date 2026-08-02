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
    passBtn: document.getElementById("passBtn"),

    startTurnBtn: document.getElementById("startTurnBtn")

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

ui.startTurnBtn.onclick = iniciarTurno;

});

// ==========================
// CREAR PARTIDA
// ==========================

async function crearPartida(){

    partidaId = codigo();

    const mazoElegido = "figuras";

    const cartas = [...DECKS[mazoElegido].cartas];

    await setDoc(
        doc(db,"partidas",partidaId),
        {

            estado:"lobby",

            jugadores:[],

            ronda:1,

            turno:0,

            jugadorActivo:0,

            cartas:[...cartas],

            mazoOriginal:[...cartas],

            cartaActual:null,

            tiempo:60,

            turnoIniciado:false

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

    partidaId = ui.joinCode.value.trim().toUpperCase();


    const ref = doc(db,"partidas",partidaId);


    const partida = await getDoc(ref);


    if(!partida.exists()){

        alert("No existe la partida");

        return;

    }


    const datos = partida.data();


    const jugadoresActuales = datos.jugadores || [];


    jugadorNumero = jugadoresActuales.length;


    jugadorId =
    "Jugador-" + Math.floor(Math.random()*9999);


    await updateDoc(ref,{

        jugadores: arrayUnion(jugadorId)

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

            const datos = snap.data();

            console.log("Cambio recibido:", datos);

            if(datos.estado === "jugando"){

                pantalla("playScreen");

                mostrarCarta(datos);

                document.getElementById("timer").textContent =
                    datos.tiempo;

                document.getElementById("remainingCards").textContent =
                    "Quedan " + datos.cartas.length + " cartas";

                // Mostrar u ocultar el botón Iniciar turno
                const boton = document.getElementById("startTurnBtn");

                if(
                    datos.jugadorActivo === jugadorNumero &&
                    !datos.turnoIniciado
                ){
                    boton.style.display = "inline-block";
                }else{
                    boton.style.display = "none";
                }

            }

        }
    );

}
function mostrarCarta(datos){

    const carta = document.getElementById("gameCard");
    const contador = document.getElementById("remainingCards");
    const timer = document.getElementById("timer");

    contador.textContent =
        "Quedan " + datos.cartas.length + " cartas";

    timer.textContent = datos.tiempo;

    // No ha comenzado el turno
    if(!datos.turnoIniciado){

        if(datos.jugadorActivo === jugadorNumero){
            carta.textContent = "Pulsa INICIAR TURNO";
        }else{
            carta.textContent = "Esperando turno";
        }

        return;
    }

    // Turno iniciado
    if(datos.jugadorActivo === jugadorNumero){
        carta.textContent = datos.cartaActual;
    }else{
        carta.textContent = "Esperando turno";
    }

}

// ==========================
// COMENZAR
// ==========================

async function iniciarJuego(){

    const ref = doc(db,"partidas",partidaId);

    const snap = await getDoc(ref);

    if(!snap.exists()) return;

    const datos = snap.data();

    await updateDoc(ref,{
        estado: "jugando",
        cartaActual: datos.cartas[0] || null,
        tiempo: 60,
        jugadorActivo: 0,
        turnoIniciado: false
    });

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

        const snap = await getDoc(ref);

        if(!snap.exists()) return;

        const datos = snap.data();

        // Si ya no soy el jugador activo, dejo de contar
        if(datos.jugadorActivo !== jugadorNumero){

            clearInterval(intervaloTiempo);
            intervaloTiempo = null;
            return;

        }

        // Si el turno aún no ha empezado, no contar
        if(!datos.turnoIniciado){
            return;
        }

        // ¿Se acabó el mazo?
        if(datos.cartas.length === 0){

            clearInterval(intervaloTiempo);
            intervaloTiempo = null;

            // Fin de la partida
            if(datos.ronda >= 3){

                await updateDoc(ref,{
                    estado:"fin"
                });

                return;
            }

            // Nueva ronda
            await updateDoc(ref,{
                ronda: datos.ronda + 1,
                cartas:[...datos.mazoOriginal],
                cartaActual: datos.mazoOriginal[0],
                tiempo:60,
                jugadorActivo:0,
                turnoIniciado:false
            });

            return;

        }

        // ¿Se acabó el tiempo?
        if(datos.tiempo <= 0){

            clearInterval(intervaloTiempo);
            intervaloTiempo = null;

            const siguienteJugador =
                (datos.jugadorActivo + 1) % datos.jugadores.length;

            await updateDoc(ref,{
                tiempo:60,
                jugadorActivo:siguienteJugador,
                turnoIniciado:false
            });

            return;

        }

        // Sigue contando
        await updateDoc(ref,{
            tiempo: datos.tiempo - 1
        });

    },1000);

}
async function iniciarTurno(){

    const ref = doc(db,"partidas",partidaId);

    const snap = await getDoc(ref);

    if(!snap.exists()) return;

    const datos = snap.data();

    if(datos.jugadorActivo !== jugadorNumero) return;

    await updateDoc(ref,{
        turnoIniciado: true,
        tiempo: 60
    });

    iniciarTemporizador();

}
