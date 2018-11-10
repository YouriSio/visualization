

function DroneAnimate(array,tarray, xarray, yarray, zarray, phiarray){
  var i;
   for (i=0; i < array.length; i++) {

      if (i == 0){
        xarr = 0;
        yarr = 0;
        zarr = 0;
      } else {
        xarr = xarray[i-1];
        yarr = yarray[i-1];
        zarr = zarray[i-1];
      }
      
      var tween = new TWEEN.Tween({x: xarr,y: yarr, z:zarr, rotationx:-1.57079632679}).to({rotationx:-1.57079632679, x: xarray[i], y: yarray[i], z:zarray[i]}, tarray[i]*1000).onUpdate( function(){
      drone.position.y = this.y;
      }).start();


    }

        /*var tween = new TWEEN.Tween({x: 0,y: -4.5, z:0, rotationx:-1.57079632679}).to({rotationx:-1.57079632679, x: 0, y: 10, z:0}, 10000).onUpdate( function(){
          drone.position.y = this.y;
        }).start();*/
  } 