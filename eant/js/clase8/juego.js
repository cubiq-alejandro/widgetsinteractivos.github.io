
var credito_inicial = 20;
var valor_ficha = 10;
var valor_premio = 30;
var preload_image = "imagenes/loading.gif";

var elementos = [
    {
        id: 1,
        imagen: "imagenes/1.png"
    },
    {
        id: 2,
        imagen: "imagenes/2.png"
    },
    {
        id: 3,
        imagen: "imagenes/3.png"
    }        
]

var elementos_mezclados = [];

function spin(){    

    if(credito_inicial <= 0){
        return alert("Te quedaste sin credito")
    }

    show_loading(function (){                  
        restar_ficha()
        elementos_mezclados = [];
        for (var i = 1; i <= 3; i++) {
            var elemento = elementos[Math.floor(Math.random() * elementos.length)]
            document.getElementById("elemento" + i).src = elemento.imagen ;
            elementos_mezclados.push(elemento);            
        }    

        if(comprobar(elementos_mezclados)){
            sumar_premio();
            return alert("Ganaste")
        }
        
    });
}

function show_loading(cb){       
    var images = document.getElementsByClassName("loading");
    for (var i = 0; i < images.length; i+= 1) {
        images[i].src = preload_image;
    }
    setTimeout(function(){ 
        cb && cb();
    }, 500);    
}

function comprobar(elementos_mezclados){ 
    var primer_elemento;
    for (var i = 0; i < elementos_mezclados.length; i+= 1) {
        if(i == 0){
            primer_elemento = elementos_mezclados[i].id
        }
        if(elementos_mezclados[i].id != primer_elemento){
            return false;
        }
    } 
    return true;
}

function sumar_premio(){
    credito_inicial = credito_inicial + valor_premio;
    mostrar_credito();
}

function restar_ficha(){
    credito_inicial = credito_inicial - valor_ficha;
    mostrar_credito();
}

function mostrar_credito(){
    document.getElementById("credito").innerHTML = credito_inicial;
}

(function() {
    mostrar_credito()
    var boton = document.getElementById("spin");
    boton.addEventListener("click", spin);
})();