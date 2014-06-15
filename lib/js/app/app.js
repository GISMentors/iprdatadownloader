app = {}

app.init = function(){
  app.setMap()
  app.getAppData()
  app.setDownloadBtn()
}

app.setMap = function(){






    var view = new ol.View2D({
      center: [1605604.4578887885, 6456813.951330511],
      zoom: 11
    });

    app.map = new ol.Map({
      layers: [
        new ol.layer.Tile({
          source: new ol.source.OSM()
        })
      ],
      target: 'map',
      view: view,
      controls: []
    });
}


app.getEnviroment = function(cb){
      $.getJSON(
            'config.json',
            function(data){
                cb(data);
            }
        );
}


app.openLayerModal = function(id,label){

  //set data attribute
  var modal = document.querySelector('#modal')
  data = modal.dataset;
  data.layerid = id

  //set title
  $("#mySmallModalLabel").text("Stažení dat vrstvy "+label)

  //show modal
  $("#modal").modal("show")

}

app.getDownloadIcon = function(id,label){

  iconStr = '<i class="fa fa-download right-item"></i>'
  iconHtml = $.parseHTML( iconStr )

  $(iconHtml).click(function(){app.openLayerModal(id,label)})

  return iconHtml

}

app.isLoaded = function(id){
var layers = app.map.getLayers().getArray()
var loaded = false
for(var i=0;i<layers.length;i++){
  var layerId = layers[i].get('id')
  if(layerId == id){
    loaded = true
  }
}
return loaded
}



app.newLayer = function(id,element){
var params = "layer="+id+"&format=json&srs=3857"
var url = app.apiUrl + params



  var source = new ol.source.GeoJSON({
    //projection: 'EPSG:4326',
    url: url
  });



  source.on("addfeature",function(){
      $(element).prop('disabled', false);
  })



  var style = new ol.style.Style({
    fill: new ol.style.Fill({
      color: 'rgba(255, 255, 255, 0.6)'
    }),
    stroke: new ol.style.Stroke({
      color: '#319FD3',
      width: 1
    }),
    image: new ol.style.Circle({
      radius: 5,
      fill: new ol.style.Fill({
        color: 'rgba(255, 255, 255, 0.6)'
      }),
      stroke: new ol.style.Stroke({
        color: '#319FD3',
        width: 1
      })
    })
  });

  var vectorLayer = new ol.layer.Vector({
    source: source,
    style: style
  });

vectorLayer.set("id",id)

app.map.addLayer(vectorLayer)

}

app.changeLayerVisibility = function(id,element){

  var layers = app.map.getLayers().getArray()
  var layer
  for(var i=0;i<layers.length;i++){
    var layerId = layers[i].get('id')
    if(layerId == id){
      layer = layers[i]
    }
  }
  var curVis = layer.getVisible()
  layer.setVisible(!curVis)
  $(element).prop('disabled', false);
}


app.layerVisibilityHandler = function(id,label,element){

  $(element).prop('disabled', true);
  var layerLoaded = app.isLoaded(id)

  if(layerLoaded){
    app.changeLayerVisibility(id,element)
  }else{
    app.newLayer(id,element)
  }

}


app.getLayerCheck = function(id,label){

  checkStr = '<input class="right-item" type="checkbox" value='+id+'></input>'

  checkHtml = $.parseHTML( checkStr )

  $(checkHtml).click(function(){
    app.layerVisibilityHandler(id,label,this)
    })

  return checkHtml

}

app.getLayerTmp = function(layer){

  var downloadIcon = app.getDownloadIcon(layer.id,layer.label)
  var layerCheck = app.getLayerCheck(layer.id,layer.label)


  var tmpLayer = '<li class="layer-item">'+
                    '<span class="layer-title">' + layer.label + '</span>'+
                  '</li>'

  tmpLayerHtml = $.parseHTML( tmpLayer )
  $(tmpLayerHtml).append(downloadIcon)
  $(tmpLayerHtml).append(layerCheck)

  return tmpLayerHtml
}


app.setLayers = function(data){
var layerswitcher = $("#layerswitcher ul")
  for(var i=0; i< data.length; i++){
    var tmpLayer = app.getLayerTmp(data[i])
    $(layerswitcher).append(tmpLayer)
  }

}

app.getAppData = function(){
  this.getEnviroment(this.setLayers)
}


app.setDownloadBtn = function(){

  $('#download').click(function () {
     //var btn = $(this)
     //btn.button('loading')

    var modal = document.querySelector('#modal')
    var data = modal.dataset;
    var layerId = data.layerid

    var formatEl = document.querySelector('#format')
    var format = formatEl.value

    var epsgEl = document.querySelector('#epsg')
    var epsg = epsgEl.value

    var params = "layer="+layerId+"&format="+format+"&srs="+epsg

    window.open(app.apiUrl + params,download)

   });
}

app.apiUrl = "http://ec2-54-76-120-114.eu-west-1.compute.amazonaws.com/cgi-bin/irpdata.cgi?"
