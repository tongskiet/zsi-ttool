  var bs     = zsi.bs.ctrl
    ,svn    = zsi.setValIfNull
 ;

$(document).ready(function(){
    displayRecords();
});

 $("#btnSave").click(function () {
    $("#grid").jsonSubmit({
            procedure: "master_pages_upd"
            , onComplete: function (data) {
                
                displayRecords();
            }
    });
     
});
    
 $("#btnDelete").click(function () {
    $("#grid").deleteData({
         code       : "sys-masterpage"
        ,onComplete : function(){
            displayRecords();
        }
    });  
});
     
function displayRecords(){   
    var cb = bs({name:"cbFilter1",type:"checkbox"});
    $("#grid").dataBind({
         url   : execURL + "master_pages_sel"
        ,width         : 500
	    ,height         : $(document).height() - 250
        ,blankRowsLimit:5
        ,dataRows       :[
    		 { text: cb             , width:25  , style:"text-align:left;"   
    		     ,onRender : function(d){
                return     bs({name:"master_page_id",type:"hidden",value: svn(d,"master_page_id")})
                        +  bs({name:"cb",type:"checkbox"});
                            }             
    		 }	 

    		,{ text:"Master Page Name"     , width:150  , style:"text-align:center;"  
    		    ,onRender : function(d){ return bs({name:"master_page_name",value: svn(d,"master_page_name")}); }
    		}	 
        ]
        ,onComplete: function(){
            $("#cbFilter1").setCheckEvent("#grid input[name='cb']");

        }
    });    
}


function displayBlankRows(){       
    var inputCls = "form-control input-sm";
    $("#grid").loadData({
         td_body: [ 
            function(){
                return     bs({name:"master_page_id",type:"hidden"})
                        +  bs({name:"cb",type:"checkbox"});
            }            
            ,function(){ return bs({name:"master_page_name" }); }
        ]
    });    
    
   
}
    
                        