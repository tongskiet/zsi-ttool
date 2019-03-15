var bs = zsi.bs.ctrl;
var svn =  zsi.setValIfNull;

zsi.ready(function(){
    displayRecords();
});


$("#btnSave").click(function () {
   $("#grid").jsonSubmit({
             procedure: "wire_gauge_references_upd"
            , onComplete: function (data) {
                $("#grid").clearGrid();
                if(data.isSuccess===true) zsi.form.showAlert("alert");
                displayRecords();
            }
    });
});
    
function displayRecords(){
     var rownum=0;
     $("#grid").dataBind({
	     url            : execURL + "wire_gauge_references_sel"
	    ,width          : 510
	    ,height         : $(document).height() - 200
	    ,selectorIndex  : 1
	    ,startGroupId   : 0
        ,blankRowsLimit : 5
        ,dataRows       : [
                            {  id:  1  ,groupId: 0      , text  : "<div class='centered'>Wire Gauge </div>"           , style :   "text-align:center;"}	 
            		        ,{ id:  2  ,groupId: 0      , text  : "<div class='centered'>Color</div>"                 , style :   "text-align:left;" }
            		        ,{ id:  3  ,groupId: 0      , text  : "<div class='centr'>JASO</div>"                     , style :   "text-align:center;" }	 
    		                ,{ id:  4  ,groupId: 0      , text  : "<div class='centr'>ISO</div>"                      , style :   "text-align:center;" }	 
    		                
    		                ,{  id          : 100
                                , groupId   : 1    		      
                                , text      : ""     
            		            , name      : "wire_gauge"  
            		            , type      : "input"           
            		            , width     : 150      
            		            , style     : "text-align:left;"  
            		            
            		        }
            		        ,{  id          : 101
                                , groupId   : 2    		      
                                , text      : ""     
            		            , name      : "color_id"  
            		            , type      : "select"           
            		            , width     : 117      
            		            , style     : "text-align:left;"  
            		        }
            		        
            		        ,{  id          : 102
                                , groupId   : 3    		      
                                , text      : "<div class='centr'>LL</div>"     
            		            , name      : "jaso_lower_limit"  
            		            , type      : "input"           
            		            , width     : 55      
            		            , style     : "text-align:center;"  
            		            , onRender  :   function(d){ 
    		                        return  bs({name:"jaso_lower_limit"      , class : "numeric text-center",   type    : "input"          ,   value: svn(d,"jaso_lower_limit")});
    		                        }
            		            
            		        }
            		        ,{  id          : 103
                                , groupId   : 3    		      
                                , text      : "<div class='centr'>UL</div>"     
            		            , name      : "jaso_upper_limit"  
            		            , type      : "input"           
            		            , width     : 55      
            		            , style     : "text-align:center;"  
            		            , onRender  :   function(d){ 
    		                        return  bs({name:"jaso_upper_limit"      , class : "numeric text-center",   type    : "input"          ,   value: svn(d,"jaso_upper_limit")});
    		                        }
            		            
            		        }
            		        ,{  id          : 104
                                , groupId   : 4    		      
                                , text      : "<div class='centr'>LL</div>"     
            		            , width     : 55      
            		            , style     : "text-align:center;"  
            		            , onRender  :   function(d){ 
    		                        return  bs({name:"iso_lower_limit"      , class : "numeric text-center",   type    : "input"          ,   value: svn(d,"iso_upper_limit")});
    		                        } 
            		        
            		            
            		        }
            		        ,{  id          : 105
                                , groupId   : 4  		      
                                , text      : "<div class='centr'>UL</div>"     
            		            , type      : "input"           
            		            , width     : 55      
            		            , style     : "text-align:center;"  
            		            , onRender  :   function(d){ 
    		                        return  bs({name:"iso_upper_limit"      , class : "numeric text-center",   type    : "input"          ,   value: svn(d,"iso_upper_limit")})
    		                                + bs({name:"is_edited" , type:"hidden" , value: svn(d,"is_edited")}) ;
    		                       } 
            		        }
    		    
            		        
	                    ]
    	    ,onComplete: function(){
        	    $("input, select").on("change keyup ", function(){
                        $(this).closest(".zRow").find("#is_edited").val("Y");
                });       
                $("select[name='color_id']").dataBind({
                    url: execURL + "color_references_sel"
                        ,text   : "color_name"
                        ,value  : "color_id"
                });    
                zsi.initInputTypesAndFormats();
        }  
    });    
}

   
/*
$("#btnDelete").click(function(){
    zsi.form.deleteData({
         code       : "ref-0001"
        ,onComplete : function(data){
                        displayRecords();
                      }
    });       
});
  */  
                                            