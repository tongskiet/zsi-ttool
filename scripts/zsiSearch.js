zsi.search =  function(info){
   if(!info.panel) info.panel = {id:"panel", class:"SearchPanel"};
   if(!info.grid) info.grid = {id:"grid", class:"SearchGrid"};       

   var __inputSearch = $(info.input);
   var __parameter =info.parameter;
   var __OnSelectedItem = info.onSelectedItem;
   var __url = info.url;
   var __columnIndexes = info.column_indexes; 
      
   zsi.search.data=null;      
   zsi.search.timer;   

   zsi.search.OnLoadComplete = info.onLoadComplete;
   zsi.search.OnRequestFailed = info.onRequestFailed;
   zsi.search._currentObject=null;
   zsi.search._gridHistory=[];

   if(!info.min_characters) 
      zsi.search.MinCharacters=1; 
   else
      zsi.search.MinCharacters=info.min_characters; 
   
   if( $("." + info.panel.class).length == 0){    
      var html = '<br />';
         html += '<div class="'+ info.panel.class + '" >';
         html +='<table id="' + info.grid.id + '"  class="table ' + info.grid.class + '">';
         html +='<thead>';
         html +='<tr>';      
         for(var i=0;i<info.column_names.length;i++){
         html +='<th>' + info.column_names[i] + '</th>';            
         }   
         html +='</tr>';            
         html +='</thead>';      
         html +='</table>';

         html +='</div>';
      $(html).appendTo('body');   
   }
   
   zsi.search.Panel = $("." + info.panel.class);   
   zsi.search.Grid = $("." + info.grid.class);
   
   
   zsi.search.Panel.show=function(isShow){
      setPanelPosition(zsi.search._currentObject);
      this.css("display",(isShow==true) ? "block":"none");
   }
   
   /* begin of __inputSearch.each */
   __inputSearch.each(function(){

      $(this).keyup(function(e){
            zsi.search._currentObject= this;
            var searchPanel = zsi.search.Panel;
            var searchGrid =  zsi.search.Grid;

            setPanelPosition(this);   

            switch(e.keyCode){
               case  9:break; //alt+tab
               case 17:break; //ctrl
               case 18:break; //alt
               case 39:break; //Right
               case 37:break; //Left
               case 40://Down
                  showBox(this);
                  var trActive =searchGrid.find('tbody > tr.active');        
                  var trs = searchGrid.find('tbody > tr');
                  trActive.each(function(){               
                        var _index=$(this).index();            
                     if(_index!= trs.length-1 ){
                        $(this).removeClass("active");
                        $(this).next().addClass("active");                  
                        __setDataIndex(this,_index + 1);

                        computeScroll($(this).next(), "down");
                     }

                  });

                  if(trActive.length==0 && trs.length>0){

                     $(searchGrid.find('tbody > tr')[0]).addClass("active");
                     __setDataIndex(this,0);
                     zsi.search.Panel.scrollTop(0);

                  }
                  break; 

               case 38: //Up
                  showBox(this);
                  var trActive =searchGrid.find('tbody > tr.active');            
                  trActive.each(function(){
                     var _index=$(this).index();   
                     if(_index!=0){
                        $(this).removeClass("active");
                        $(this).prev().addClass("active");                  
                        __setDataIndex(this,_index-1);                  

                        computeScroll($(this).prev(), "up");
                     }
                  });

                  break;
               case 13://enter
                  var trActive =searchGrid.find('tbody > tr.active');                   
                  __setDataIndex(this,trActive.index());
                  zsi.search.Panel.show(false);      
                  break; 

               default:
                  clearTimeout(zsi.search.timer);
                  var _value=this.value;
                  var _input = this;
                  if(_value.length>=zsi.search.MinCharacters){
                     zsi.search.timer = setTimeout(function(){       
                        $(_input).addClass("loadIconR" );
                        zsi.search.Panel.scrollTop(0);               
                        var l_params="?" + __parameter + "=" +  _value;                        
                        $.getJSON(__url + l_params
                        ,function(data){                                                         
                              var searchGrid = zsi.search.Grid;
                              searchGrid.clearGrid();
                              zsi.search.data=data;

                              if(zsi.search.OnLoadComplete) zsi.search.OnLoadComplete(data); 
                              if(data.rows.length>0) zsi.search.Panel.show(true);        

                              $.each(data.rows, function () {
                                     var _indexes= __columnIndexes;
                                     var r = '';
                                     r += '<tr>';                
                                     for(var i=0;i<_indexes.length;i++){
                                        this.data[_indexes[i]] = unescape(this.data[_indexes[i]]);               
                                        r += "<td>" + this.data[_indexes[i]] + "</td>";               
                                     }                
                                     r += '</tr>';
                                     searchGrid.append(r);               
                              });


                              addTableDisplayHistory(searchGrid[0].outerHTML, zsi.search._currentObject,data);
                              setTRClickEvent();
                           }                        
                        
                        ).fail(function() {
                            if(zsi.search.OnRequestFailed) zsi.search.OnRequestFailed(); 
                        }).always(function(){
                           $(_input).removeClass("loadIconR" );
                        });

                     }, 500);

                  }
                  else{
                      zsi.search.data=null;
                      zsi.search.Panel.show(false);                      
                      searchGrid.clearGrid();
                  }
               break;
            }
         }).on('click focus', function() { 
            zsi.search._currentObject=this;  
            if(recallTableDisplay(this)){
               zsi.search.Panel.html(recallTableDisplay(this).grid);
               zsi.search.Grid = $("." + info.grid.class);
               setTRClickEvent();
               zsi.search.Panel.show(true);
            }
            else{ 
               if(this.value) 
                  $(this).trigger("keyup");
            }
         });                 

   });
   /* end of __inputSearch.each */
   
   
   var __setDataIndex = function(currentObject,i){
      if(__OnSelectedItem){
         var history=recallTableDisplay(currentObject)
         var data=zsi.search.data;
         if(history) data  = history.data;
         if(data === 'undefined') { __OnSelectedItem(currentObject,null,i); return;}
         if(data.rows === 'undefined') { __OnSelectedItem(currentObject,null,i); return;}
         if(data.rows.length>0) __OnSelectedItem(currentObject,data.rows[i].data,i);      
      }
   }
   
   function setTRClickEvent(){
      zsi.search.Grid.find('tbody > tr').each(function(){
          $(this).click(function(){
             var trActive =zsi.search.Grid.find('tbody > tr.active'); 
             if(trActive.length>0){
                $(trActive[0]).removeClass("active");
             }

             $(this).addClass("active");
             __setDataIndex(zsi.search._currentObject,$(this).index());
             zsi.search.Panel.show(false);

          })
      });

   } 

};


function setPanelPosition(obj){
   /*set panel position*/
   if(obj){
      var _offset = $(obj).offset();    
      var _outerWidth = $(obj).outerWidth();
      if(_outerWidth <300) _outerWidth = 300;
      zsi.search.Panel.css("left",_offset.left + "px");
      zsi.search.Panel.css("top",$(obj).outerHeight() + _offset.top + "px");
      zsi.search.Panel.css("width",_outerWidth + "px");    
   }
}
 
function showBox(input){
   var value=input.value;
   if(zsi.search.data && value.length>=zsi.search.MinCharacters){      
      if(zsi.search.data.rows.length>0) zsi.search.Panel.show(true);
   }               
}

$(document).click(function(event){
   var et=$(event.target); 
   var clsName = "." + zsi.search.Panel.attr("class");
   if(!et.is("input") && !et.is(clsName) && !et.parents(clsName).length>0 || et.val()=="" ){             
      zsi.search.Panel.show(false);
   }

});  

$(document).on("keypress", 'form', function (e) {
   if (e.target.className.indexOf("allowEnter") == -1) {
       var code = e.keyCode || e.which;
       if (code == 13) {
           e.preventDefault();
           return false;
       }
   }
});

function computeScroll(tr,direction){   
   var scrollHeight=zsi.search.Panel.prop("scrollHeight");
   var height=zsi.search.Panel.height();
   var trTop = tr.position().top;
   var trHeight = tr.height();

   if(direction=="down"){
      if (trTop > (height - trHeight)){
           zsi.search.Panel.scrollTop( zsi.search.Panel.scrollTop() + parseInt(trTop));
      }       

   }else if(direction=="up"){
      if (trTop < 0 ){
           zsi.search.Panel.scrollTop( zsi.search.Panel.scrollTop() - parseInt(height  - trHeight));
      }                         
   }
}

function addTableDisplayHistory(grid,obj,currentData){
   var h=zsi.search._gridHistory;
   var isfound=false;
   for(var x=0;x<h.length;x++){
      if(obj==h[x].input){
        h[x]=grid; 
        isfound=true;
        break;
      }        
   }           
   if(isfound==false){
      h.push( {grid : grid, input: obj,data:currentData});          
   }
}

function recallTableDisplay(obj){
   var history=null;
   var h=zsi.search._gridHistory;
   var isfound=false;
   for(var x=0;x<h.length;x++){
      if(obj==h[x].input){
        history=h[x];
        break;
      }        
   }
   return history;
}
