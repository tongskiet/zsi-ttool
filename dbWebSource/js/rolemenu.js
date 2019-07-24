var bs = zsi.bs.ctrl;
var bs = zsi.bs.ctrl;
var svn =  zsi.setValIfNull;
$(document).ready(function(){
    displayRecords();
    
});

 $("#btnSave").click(function () {
    $("#frm").jsonSubmit({
             procedure: "role_menus_upd"
            ,onComplete: function (data) {
                displayRecords();
            }
    });
     
});
    
function displayRecords(){   
     var cb = bs({name:"cbFilter1",type:"checkbox"});
    $("#grid").dataBind({
         url   : execURL + "role_menus_sel"
        ,width          : $(document).width() - 35
	    ,height         : $(document).height() - 250
        ,blankRowsLimit:5
        ,dataRows       :[     
            { text: cb             , width:25  , style:"text-align:left;"   
    		     ,onRender : function(d){
                                return     bs({name:"role_menu_id",type:"hidden",value: svn(d,"role_menu_id") })
                                        +  (d !==null ? bs({name:"cb",type:"checkbox"}) : "" );
                            }             
    		 }
    		 
           	,{ text:"Role Name"     , width:200 , style:"text-align:center;" ,type:"select"  ,name:"role_id"}	             
            ,{ text:"Menu Name"     , width:200 , style:"text-align:center;" ,type:"select"  ,name:"menu_id"}
            ,{ text:"New?"     , width:100 , style:"text-align:center;" ,type:"yesno"  ,name:"is_new"}	             
            ,{ text:"Write?"     , width:100 , style:"text-align:center;" ,type:"yesno"  ,name:"is_write"}
            ,{ text:"Delete?"     , width:100 , style:"text-align:center;" ,type:"yesno"  ,name:"is_delete"}
        ]
        ,onComplete: function(){
            $("#cbFilter1").setCheckEvent("#grid input[name='cb']");
             $("select[name='role_id']").dataBind( "roles");
             $("select[name='menu_id']").dataBind( "menus");
               
          //  displayBlankRows();
        }
    });    
}