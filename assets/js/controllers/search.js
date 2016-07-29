

angular.module('search.controllers', ['firebase', 'angularGeoFire'])


.controller('searchCtrl', function ($scope, $firebaseArray, $geofire, $log) {

    // URL para firebase e geofire das sugest�es de estabelecimentos
    const sugestaoURL = "https://sos-battery-test.firebaseio.com/estabelecimentosTemp/";
    const sugestaoCoordURL = "https://sos-battery-test.firebaseio.com/coordenadasTemp/";

   // URL para firebase e geofire principais
    const mainURL = "https://sos-battery-test.firebaseio.com/estabelecimentos/";
    const mainCoordURL = "https://sos-battery-test.firebaseio.com/coordenadas/";

   

    let FirebaseRef;
    let $GeofireRef;

    let coordURL;
    let URL;
   

    let coordenadas;

    $scope.searchTerm = "";

    $scope.onTyping = () => {

       

        if ($scope.searchTerm.length != 0)
            $("#btnSearch").prop("disabled", false);
        else
            $("#btnSearch").prop("disabled", true);

    }

 
    $scope.myFunct =  (keyEvent) => {
        if (keyEvent.which === 13) {

            if ($scope.searchTerm.length != 0)
                $scope.onSearch();
           
        }
            
    }

    

    $scope.onSearch = () => {


        $("#editavel").css('visibility', 'hidden');
        //move a tabela para dar espa�o ao item a ser modificado
        $("#tabela").css('width', '100%');

        

        waitingDialog.show('Buscando dados...',{ progressType: 'success'});
        
        $scope.isBDPrincipal = $('#toggle').prop('checked');


        if ($scope.isBDPrincipal){

            FirebaseRef = new Firebase(mainURL);

            $GeofireRef = $geofire(new Firebase(mainCoordURL));

            coordURL = mainCoordURL;
            URL = mainURL;
        }
        else{

            FirebaseRef = new Firebase(sugestaoURL);

            $GeofireRef = $geofire(new Firebase(sugestaoCoordURL));

            coordURL = sugestaoCoordURL;
            URL = sugestaoURL;

        }

       
        // parametros de busca
        let searchParam = new searchParameters($scope.caboAndroid, $scope.caboIphone, $scope.wifi, $scope.restaurante, $scope.loja, $scope.bar, radioType($scope));

        let paramCabo = fbQuery(searchParam.cabo);

        let paramCategoria = fbQuery(searchParam.categoria);

     
        searchTermQuery(FirebaseRef, $scope, $firebaseArray);
      
    }

    $scope.onSelectRemove = (est) => {

        $scope.toRemove = est;
    }

    $scope.onRemove = () => {

        $('#myModal').modal('hide');

       

        let lojaToRemove = $scope.toRemove;

        let FirebaseRefRemove = new Firebase(URL + lojaToRemove.id);


        let $GeofireRefRemove = $GeofireRef;


        let onCompleteRemoval = (error) => {
            if (error) {
                $log.error('Erro ao remover');
            } else {

                // Remove "some_key" location from forge
                $GeofireRefRemove.$remove(lojaToRemove.id)
                    .catch(function (err) {
                        $log.error(err);
                    });

            }
        };

        FirebaseRefRemove.remove(onCompleteRemoval);

      
      

    }


    $scope.onEdit = (est) => {

      

        //move a tabela para dar espa�o ao item a ser modificado
        $("#tabela").css('width', '40%');

        $("#editavel").css('visibility', 'visible');

        // pega a coordenada inicial
        coordenadas = est.coordenadas;

        $scope.nome = est.nome;
        $scope.tipo = est.tipo;
        $scope.end = est.end;
        $scope.bairro = est.bairro;
        $scope.cidade = est.cidade;
        $scope.estado = est.estado;
        $scope.imgURL = est.imgURL;
        $scope.id = est.id;
        $scope.coordX = est.coordenadas[0];
        $scope.coordY = est.coordenadas[1];
        $scope.criado = est.createdAt;
        $scope.modificado = est.modifiedAt;
        $scope.cbAndroidAlt = est.cabo.android;
        $scope.cbIphoneAlt = est.cabo.iphone;
        $scope.wifiAlt = est.wifi;
        $scope.wifiSSID = est.wifi_SSID;
        $scope.wifiSenha = est.wifi_senha;

      
                   $scope.seg = est.hr_open[0] + ' - ' + est.hr_close[0];
                    $scope.ter = est.hr_open[1] + ' - ' + est.hr_close[1];
                    $scope.qua = est.hr_open[2] + ' - ' + est.hr_close[2];
                     $scope.qui = est.hr_open[3] + ' - ' + est.hr_close[3];
                   $scope.sex = est.hr_open[4] + ' - ' + est.hr_close[4];                    
                    $scope.sab = est.hr_open[5] + ' - ' + est.hr_close[5];

                     $scope.dom = est.hr_open[6] + ' - ' + est.hr_close[6];

                 
                   if (est.hr_open[7].length > 0)
                       $scope.seg2 = est.hr_open[7] + ' - ' + est.hr_close[7];

                         if (est.hr_open[8].length > 0)
                       $scope.ter2 = est.hr_open[8] + ' - ' + est.hr_close[8];

                        if (est.hr_open[9].length > 0)
                       $scope.qua2 = est.hr_open[9] + ' - ' + est.hr_close[9];

                         if (est.hr_open[10].length > 0)
                       $scope.qui2 = est.hr_open[10] + ' - ' + est.hr_close[10];

                          if (est.hr_open[11].length > 0)
                       $scope.sex2 = est.hr_open[11] + ' - ' + est.hr_close[11];

                     if (est.hr_open[12].length > 0)
                       $scope.sab2 = est.hr_open[12] + ' - ' + est.hr_close[12];

                       if (est.hr_open[13].length > 0)
                       $scope.dom2 = est.hr_open[13] + ' - ' + est.hr_close[13];

    }

    $scope.onAlter = () => {

       

        //inicializa os campos que podem ter undefined
        if (testUndefined($scope.cbIphone))
            $scope.cbIphone = false;
        if (testUndefined($scope.cbAndroid))
            $scope.cbAndroid = false;
        if (testUndefined($scope.wifi) || !$scope.wifi) {
            $scope.wifi = false;
            $scope.wifiSSID = "";
            $scope.wifiSenha = "";
        }
        else {
            $scope.wifiSSID = $('#inputWifiSSID').val();
            $scope.wifiSenha = $('#inputWifiSenha').val();
        }



        let FirebaseRefMod = new Firebase(URL + $scope.id);

       
        let $GeofireRefMod = $geofire(new Firebase(coordURL + $scope.id));

       

        let coord = [Number($scope.coordX), Number($scope.coordY)];

        let cabo = {
            android: $scope.cbAndroidAlt,
            iphone: $scope.cbIphoneAlt
        };

       

        // hora de abertura padrão ( 00 - 00)
        // tem 6 campos pois alguns estabelecimentos abrem e fecham duas vezes ao dia
      let hr_open = new Array(hrAbre($scope.seg),hrAbre($scope.ter), hrAbre($scope.qua),
       hrAbre($scope.qui), hrAbre($scope.sex), hrAbre($scope.sab),
        hrAbre($scope.dom),hrAbre($scope.seg2), hrAbre($scope.ter2), hrAbre($scope.qua2), hrAbre($scope.qui2),
        hrAbre($scope.sex2) , hrAbre($scope.sab2), hrAbre($scope.dom2));

        // hora que fecha padrão ( 00 - 00)
      let hr_close = new Array(hrFecha($scope.seg),hrFecha($scope.ter), hrFecha($scope.qua),
       hrFecha($scope.qui), hrFecha($scope.sex), hrFecha($scope.sab),
        hrFecha($scope.dom),hrFecha($scope.seg2), hrFecha($scope.ter2), hrFecha($scope.qua2), hrFecha($scope.qui2),
        hrFecha($scope.sex2) , hrFecha($scope.sab2), hrFecha($scope.dom2));

        // cria uma data com a hora para saber a �ltima vez q foi modificada
         let d = new Date();
        let dataModificada = d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear() + ' - ' + d.getHours() + ':' + d.getMinutes();
        
        // construtor da classe com todos os elementos do banco de dados
        let dbInfo = new estFirebase($scope.nome, $scope.tipo, $scope.end, $scope.bairro, $scope.cidade,
            $scope.estado, $scope.imgURL, coord,
            $scope.criado, dataModificada, cabo,
            $scope.wifiAlt, $scope.wifiSSID, $scope.wifiSenha, $scope.id, hr_open, hr_close);
        
       

        let onCompleteUpdate = (error)  => {
            if (error) {
                $log.error('Synchronization failed');
            } else {
            
                // compara a coordenada inicial e se foi modificada para ent�o mudar no geofire tamb�m
                if (coordenadas[0] != coord[0] || coordenadas[1] != coord[1]) {

                    $GeofireRefMod.$set($scope.id, coord)
                        .catch(function (err) {
                            $log.error(err);
                        });

                }
            
            }
        };


        FirebaseRefMod.set(dbInfo, onCompleteUpdate);
   
       
    }




});





        //classe dos elementos do BD
class estFirebase {

    constructor(nome, tipo, end, bairro, cidade, estado, imgURL, coord, criadoEm, modEm, cabo, wifi, wifiSSID, wifiSenha, id, hr_open, hr_close) {

        this.nome = nome;
        this.tipo = tipo;
        this.end = end;
        this.bairro = bairro;
        this.cidade = cidade;
        this.estado = estado;
        this.imgURL = imgURL;
        this.coordenadas = coord;
        this.createdAt = criadoEm;
        this.modifiedAt = modEm;
        this.cabo = cabo;
        this.wifi = wifi;
        this.wifi_SSID = wifiSSID;
        this.wifi_senha = wifiSenha;
        this.id = id;
        this.hr_open = hr_open;
        this.hr_close = hr_close;

       
    }
}
       //classe dos par�metros de busca
class searchParameters {

    constructor(cbAndroid, cbIphone, wifi, restaurante, loja, bar, radioBtn) {
        this.cabo = {
            android: cbAndroid,
            iphone: cbIphone
        };
        this.categoria = {
            restaurante: restaurante,
            loja: loja,
            bar: bar
        };
      
        this.wifi = wifi;
       
        this.radioBtn = radioBtn;
    }
   
}

function fbQuery(searchParam) {

    let param = [];
    let i = 0;

    for (var key in searchParam) {
        if (searchParam.hasOwnProperty(key)) {

            if (typeof (searchParam[key]) === "boolean") {
                // variable is a boolean           
                if (searchParam[key]) {
                    param[i] = key;
                    i++;
            }
            }
        }
    }

    return param;

}


function query(estArray, cabo, wifi, cat) {

    

    for (var i in cabo) {
        if (cabo.hasOwnProperty(i)) {
            for (var i in cabo) {
                if (cabo.hasOwnProperty(i)) {

                }
            }
        }
    }


}

function searchTermQuery(firebaseRef, $scope, $firebaseArray) {

    let criterio = $('.search-panel span#search_concept').text();
   

    let query;

   $scope.searchTerm = capitalizeFirstLetter($scope.searchTerm)

    console.log($scope.searchTerm)
  
    switch (criterio) {
        case "Estabelecimento":
            query = firebaseRef.orderByChild("nome").equalTo($scope.searchTerm);
            break;

        case "Bairro":
            query = firebaseRef.orderByChild("bairro").equalTo($scope.searchTerm);
            break;

        case "Cidade":
            query = firebaseRef.orderByChild("cidade").equalTo($scope.searchTerm);
            break;

        default:
            query = firebaseRef;


    }
    
    let fbQuery = $firebaseArray(query);

    fbQuery.$loaded()
       .then(function (x) {
           waitingDialog.hide();
           $("#tabela").css('visibility', 'visible');
           $scope.estabelecimentos = x;
       })
       .catch(function (error) {
           console.log("Error:", error);
       });

    

}
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

            //fun��o retorna 0 se for tudo, 1 se for ultimos criados, 2 se for ultimos modificados
function radioType($scope) {
    if ($scope.all)
        return 0;
    else if ($scope.lastCreated)
        return 1;

    else
        return 2;

}
        //fun��o que concatena o horario de abertura
function hrAbre(horario) {
    
    
  
    if (!testUndefined(horario))
        return horario.substr(0, 5);
    
    return "";

}

//fun��o que concatena o horario de fechamento
function hrFecha(horario) {

    

    if (!testUndefined(horario))
    return horario.substr(horario.length-5, horario.length);

    return "";
}

//fun��o que testa se a variavel � undefined
function testUndefined(variavel) {

    return typeof variavel === 'undefined';
}


// faz com que o tipo de filtro seja modificado
$(document).ready(function(e){
    $('.search-panel .dropdown-menu').find('a').click(function (e) {

        $("#searchTerm").val("");
        e.preventDefault();
        var param = $(this).attr("href").replace("#","");
        var concept = $(this).text();
        $('.search-panel span#search_concept').text(concept);
        $('.input-group #search_param').val(param);


        $("#btnSearch").css('visibility', 'visible');

        if ($('.search-panel span#search_concept').text().localeCompare("Tudo") == 0) {
            $("#searchTerm").css('visibility', 'visible');
            $("#searchTerm").prop("disabled", true);
            $("#btnSearch").prop("disabled", false);
        }
        else {
            $("#searchTerm").prop("disabled", false);
            $("#searchTerm").css('visibility', 'visible');
            $("#btnSearch").prop("disabled", true);
        }


	});
});
