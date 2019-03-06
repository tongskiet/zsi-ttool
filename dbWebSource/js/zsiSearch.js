zsi.search =  function(info){
   if(!info.panel) info.panel = {id:"searchPanel", class:"SearchPanel"};
   if(!info.grid) info.grid = {id:"searchGrid", class:"SearchGrid"};       
       
   var __inputSearch = $(info.input);
   var __url = info.url;
   var __columnIndexes = info.column_indexes; 
   var __colNames = info.colNames; 

    var __parameter ="";
    for(var x=0;x< info.colNames.length;x++){
        if(__parameter!=="") __parameter +=",";
        __parameter += info.colNames[x];
    }

   zsi.search.data=null;      
   zsi.search.timer;   
   
   zsi.search._currentObject=null;
   zsi.search._gridHistory=[];

    __inputSearch.addClass("inputSearch");
    __inputSearch.attr("autocomplete","off");
   if(!info.min_characters) 
      zsi.search.MinCharacters=1; 
   else
      zsi.search.MinCharacters=info.min_characters; 
   
   if( $("." + info.panel.class).length === 0){    
      var html = '';
         html += '<div class="'+ info.panel.class + '" >';
         html +='<table style="margin-top:0;" id="' + info.grid.id + '"  class="zTable ' + info.grid.class + ' fullWidth">';
         
         if(info.displayNames.length>1){
             html +='<thead>';
             html +='<tr>';      
             for(var i=0;i<info.displayNames.length;i++){
                html +='<th>' + info.displayNames[i] + '</th>';            
             }   
             html +='</tr>';            
             html +='</thead>';   
         }
         
         html +='</table>';

         html +='</div>';
      $(html).appendTo('body');   
   }

   zsi.search.Panel = $("." + info.panel.class);   
   zsi.search.Grid = $("." + info.grid.class);
   
   
   zsi.search.Panel.show=function(isShow){
      setPanelPosition(zsi.search._currentObject);
      if(isShow) this.css("z-index",zsi.getHighestZindex()+1);
      this.css("display",(isShow===true) ? "block":"none");
   };
   
   /* begin of __inputSearch.each */
   __inputSearch.each(function(){

      $(this).keyup(function(e){
            zsi.search._currentObject= this;
            var searchPanel = zsi.search.Panel;
            var searchGrid =  zsi.search.Grid;
            var trActive=null;
            setPanelPosition(this); 
            
            if(typeof info.onChange !==ud) info.onChange(this.value,info); 

            switch(e.keyCode){
               case  9:break; //alt+tab
               case 17:break; //ctrl
               case 18:break; //alt
               case 39:break; //Right
               case 37:break; //Left
               case 40://Down
                  showBox(this);
                  trActive =searchGrid.find('tbody > tr.active');        
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

                  if(trActive.length===0 && trs.length>0){

                     $(searchGrid.find('tbody > tr')[0]).addClass("active");
                     __setDataIndex(this,0);
                     zsi.search.Panel.scrollTop(0);

                  }
                  break; 

               case 38: //Up
                  showBox(this);
                  trActive =searchGrid.find('tbody > tr.active');            
                  trActive.each(function(){
                     var _index=$(this).index();   
                     if(_index!==0){
                        $(this).removeClass("active");
                        $(this).prev().addClass("active");                  
                        __setDataIndex(this,_index-1);                  

                        computeScroll($(this).prev(), "up");
                     }
                  });

                  break;
               case 13://enter
                    trActive =searchGrid.find('tbody > tr.active');                   
    
                    var _data=zsi.search.data;
                    var _i = trActive.index();
                    if(_i>-1){
                        if(typeof _data !== ud) 
                            if(_data.rows.length>0) info.onSelectedItem(this,_data.rows[_i],_i);      
                    }
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
                        var _cond = (typeof info.condition===ud?"":"," +info.condition);

                        $.getJSON(__url + "'" + info.tableCode + "','"  + __parameter + "','" + info.searchColumn + "','" + _value + "'" + _cond
                        ,function(data){                                                         
                              var searchGrid = zsi.search.Grid;
                              searchGrid.clearGrid();
                              zsi.search.data=data;

                              if(info.onLoadComplete) info.onLoadComplete(_input,data); 
                              if(data.rows.length>0) {
                                  zsi.search.Panel.show(true);        
                              }

                              $.each(data.rows, function () {
                                     var r = '';
                                     r += '<tr>';                
                                     for(var i=0;i<info.displayNames.length;i++){
                                        this[__colNames[i]] = unescape(this[__colNames[i]]);               
                                        r += "<td>" + this[__colNames[i]]  + "</td>";               
                                     }                
                                     r += '</tr>';
                                     searchGrid.append(r);               
                              });


                              addTableDisplayHistory(searchGrid[0].outerHTML, zsi.search._currentObject,data);
                              setTRClickEvent();
                           }                        
                        
                        ).fail(function() {
                            if(info.onRequestFailed) info.onRequestFailed(); 
                        }).always(function(){
                           $(_input).removeClass("loadIconR" );
                           
                        }).success(function(data){
                            if(data.rows.length > 0){
                                $(_input).popover('destroy');
                                if(zsi.timer) clearTimeout(zsi.timer);
                            }
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
               if(this.value) zsi.search.Panel.show(true);
            }
            else{ 
               if(this.value) 
                  $(this).trigger("keyup");
            }
         });                 

   });
   /* end of __inputSearch.each */
   
   
   var __setDataIndex = function(currentObject,i){
      if(info.onKeyScroll){
         var history=recallTableDisplay(currentObject);
         var data=zsi.search.data;
         if(history) data  = history.data;
         if(data === 'undefined') { info.onKeyScroll(currentObject,null,i); return;}
         if(data.rows === 'undefined') { info.onKeyScroll(currentObject,null,i); return;}
         if(data.rows.length>0) info.onKeyScroll(currentObject,data.rows[i],i);      
      }
   };
   

   function setTRClickEvent(){
      zsi.search.Grid.find('tbody > tr').each(function(){
          $(this).click(function(){
              var _i = $(this).index();
             var trActive =zsi.search.Grid.find('tbody > tr.active'); 
             if(trActive.length>0){
                $(trActive[0]).removeClass("active");
             }

             $(this).addClass("active");
             __setDataIndex(zsi.search._currentObject,_i );
             if(zsi.search.data) info.onSelectedItem(zsi.search._currentObject,zsi.search.data.rows[_i ],_i );
             zsi.search.Panel.show(false);

          });
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
      if(zsi.search.data.rows.length>0) {
            zsi.search.Panel.show(true);
      }
   }               
}

$(document).click(function(event){
   var et=$(event.target);
   if(zsi.search.Panel){
        if( !et.hasClass("inputSearch")){    
            zsi.search.Panel.show(false);
        }
   }
});  

/*
$(document).on("keypress", 'form', function (e) {
   if (e.target.className.indexOf("allowEnter") == -1) {
       var code = e.keyCode || e.which;
       if (code == 13) {
           e.preventDefault();
           return false;
       }
   }
});
*/

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
   if(isfound===false){
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
      