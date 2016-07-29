
angular.module('insert.controllers', ['ngMap', 'google.places', 'angularGeoFire', 'firebase'])


.controller('insertCtrl', function ($scope, $geofire, $log, $filter, NgMap) {

    $scope.coordenadas = [-22.983600, -43.208040];
    $scope.zoom = 13;

    $scope.googleMapsUrl = "https://maps.googleapis.com/maps/api/js?key=AIzaSyBKV00aef6G4QnNPeKtypAE6w8b-rta7VQ&libraries=places&signed_in=true";
    
    // URL para firebase e geofire principais
    const mainURL = "https://sos-battery-test.firebaseio.com/estabelecimentos/";
    const mainCoordURL = "https://sos-battery-test.firebaseio.com/coordenadas/";

    
    $scope.onInsert = () => {

      let  FirebaseRef = new Firebase(mainURL);

      let $GeofireRef = $geofire(new Firebase(mainCoordURL));




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
      
        
      $scope.tipo = $('.search-panel span#search_concept').text();



      let coord = [Number($scope.coordX), Number($scope.coordY)];

      let cabo = {
          android: $scope.cbAndroid,
          iphone: $scope.cbIphone
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


      let dbRef = FirebaseRef.push();

        // construtor da classe com todos os elementos do banco de dados
      let dbInfo = new estFirebase($scope.nome, $scope.tipo, $scope.end, $scope.bairro, $scope.cidade,
          $scope.estado, $scope.imgURL, coord,
          $scope.criado, "", cabo,
          $scope.wifi, $scope.wifiSSID, $scope.wifiSenha, dbRef.key(), hr_open, hr_close);

      console.log(dbInfo);

      let onCompleteUpdate = (error) => {
          if (error) {
              console.log('Synchronization failed');
          } else {

              $GeofireRef.$set(dbRef.key(), coord)
                      .catch(function (err) {
                          $log.error(err);
                      });

              $('#myModal').modal('show');

          }
      };


         dbRef.set(dbInfo, onCompleteUpdate);


    }


    $scope.onPlaceTyped = () => {

        let placeInfoJSON = "";

        placeInfoJSON = $filter('json')($scope.autocomplete);

       

        if (placeInfoJSON.length > 0) {

           


           let placeInfoOBJ =  JSON.parse(placeInfoJSON);

            // coordenadas
           $scope.coordX = placeInfoOBJ.geometry.location.lat;
           $scope.coordY = placeInfoOBJ.geometry.location.lng;

           $scope.coordenadasLoja = [$scope.coordX, $scope.coordY];

           $scope.coordenadas = $scope.coordenadasLoja;

           $scope.zoom = 16;

           let endNum;

            // cidade, estado e bairro
           for (i = 0; i < placeInfoOBJ.address_components.length; ++i) {

               let component = placeInfoOBJ.address_components[i];

               

               if (component.types.indexOf("administrative_area_level_1") > -1) {
                   
                   $scope.estado = component.short_name;

                   
               }

               if (component.types.indexOf("route") > -1) {
                   
                   $scope.end = component.short_name;

                   
               }

                 if (component.types.indexOf("street_number") > -1) {
                   
                  endNum = component.short_name;

                   
               }

               else if (component.types.indexOf("sublocality") > -1) {
                   $scope.bairro = component.long_name;
               }

               else if (component.types.indexOf("locality") > -1) {
                   $scope.cidade = component.long_name;

               }
               

                
           }
            
         $scope.end += ", "+endNum;

           $scope.nome = placeInfoOBJ.name;

          

           

           let d = new Date();
           let data = d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear() + ' - ' + d.getHours() + ':' + d.getMinutes();

           let hr_open  = [];
           let hr_close = [];

           $scope.criado = data;


            // horário de funcionamento
           if (placeInfoOBJ.opening_hours != null) {


              

               for (let i = 0; i < 7; i++) {
                 

                

                   let diaSemana = placeInfoOBJ.opening_hours.weekday_text[i];

                   if (diaSemana.search(/fechado/i) != -1) {
                       hr_open[i] = "00:00";
                       hr_close[i] = "00:00";

                   }
                   else {

                      
                           if (diaSemana.indexOf(',') > -1) {
                               hr_open[i] = diaSemana
                               .substr(diaSemana.indexOf(':') + 2, 5);
                               hr_open[i + 7] = diaSemana
                               .substr(diaSemana.indexOf(',') + 2, 5);


                               hr_close[i] = diaSemana
                               .substr(diaSemana.indexOf(',') - 5, 5);
                               hr_close[i + 7] = diaSemana
                               .substr(diaSemana.length - 5, 5);

                           }
                           else {

                               hr_open[i] = diaSemana.substr(diaSemana.indexOf(':') + 2, 5);

                               hr_close[i] = diaSemana.substr(diaSemana.length - 5, 5);
                           }
                       
                        
                   }
               }
               
                
                   
                  
                  
                   $scope.seg = hr_open[0] + ' - ' + hr_close[0];
                    $scope.ter = hr_open[1] + ' - ' + hr_close[1];
                    $scope.qua = hr_open[2] + ' - ' + hr_close[2];
                     $scope.qui = hr_open[3] + ' - ' + hr_close[3];
                   $scope.sex = hr_open[4] + ' - ' + hr_close[4];                    
                    $scope.sab = hr_open[5] + ' - ' + hr_close[5];

                     $scope.dom = hr_open[6] + ' - ' + hr_close[6];

                 
                   if (!testUndefined(hr_open[7]))
                       $scope.seg2 = hr_open[7] + ' - ' + hr_close[7];

                        if (!testUndefined(hr_open[8]))
                       $scope.ter2 = hr_open[8] + ' - ' + hr_close[8];

                        if (!testUndefined(hr_open[9]))
                       $scope.qua2 = hr_open[9] + ' - ' + hr_close[9];

                        if (!testUndefined(hr_open[10]))
                       $scope.qui2 = hr_open[10] + ' - ' + hr_close[10];

                        if (!testUndefined(hr_open[11]))
                       $scope.sex2 = hr_open[11] + ' - ' + hr_close[11];

                   if (!testUndefined(hr_open[12]))
                       $scope.sab2 = hr_open[12] + ' - ' + hr_close[12];

                     if (!testUndefined(hr_open[13]))
                       $scope.dom2 = hr_open[13] + ' - ' + hr_close[13];
               


                 //  $scope.end = placeInfoOBJ.vicinity.substring(0, placeInfoOBJ.vicinity.indexOf('-') - 1);

               
           }
       
        }

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

//função que testa se a variavel é undefined
function testUndefined(variavel) {

    return typeof variavel === 'undefined';
}

//função que concatena o horario de abertura
function hrAbre(horario) {



    if (!testUndefined(horario))
        return horario.substr(0, 5);

    return "";

}

//função que concatena o horario de fechamento
function hrFecha(horario) {



    if (!testUndefined(horario))
        return horario.substr(horario.length - 5, horario.length);

    return "";
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

	});
});