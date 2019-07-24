  var bs = zsi.bs.ctrl;
var svn =  zsi.setValIfNull;



zsi.ready(function(){
    displayRecords();
    getTemplate();
});

function getTemplate(){
    $.get(base_url + "templates/bsDialogBox.txt",function(d){
        var template = Handlebars.compile(d);     

        var context = { id:"modalWindow"
                        , sizeAttr: "fullWidth"
                        , title: "Status"
                        , footer:  ' <div class="pull-left"><button type="button" onclick="submitData();" class="btn btn-primary"><span class="glyphicon glyphicon-floppy-disk"></span> Save</button>'
                                +  ' <button type="button" onclick="deleteData();" class="btn btn-primary"><span class="glyphicon glyphicon-trash"></span> Delete</button></div>'
                        , body: '<div id="inActiveRecords" class="zGrid" ></div>'
                      };
        var html    = template(context);     
        $("body").append(html);
    });    
}

function deleteData(){
    zsi.form.deleteData({
         code       : "ref-0026"
        ,onComplete : function(data){
                $("#grid").trigger('refresh');
                displayInactive();
        }
    }); 
} 

function submitData(){    
  $("#frm_modalWindow").jsonSubmit({
            procedure  : "statuses_upd"
            ,optionalItems: ["is_item","is_aircraft","is_active","is_process","is_add","is_edit","is_delete"]
            //,notInclude: "#employee_name"
            ,onComplete : function (data) {
                 if(data.isSuccess===true) zsi.form.showAlert("alert");
                 $("#grid").trigger('refresh');
                 displayInactive();
            }
    });        
}

$("#btnInactive").click(function () {
    $(".modal-title").text("Inactive Status");
    $('#modalWindow').modal({ show: true, keyboard: false, backdrop: 'static' });
    //$('#modalWindow').setCloseModalConfirm(); 
    displayInactive();
}); 

$("#btnSave").click(function () {
  //  console.log("test");
   $("#grid").jsonSubmit({
             procedure: "statuses_upd"
            , optionalItems: ["is_item","is_aircraft","is_active","is_process","is_add","is_edit","is_delete"]
            , onComplete: function (data) {
                $("#grid").clearGrid();
                if(data.isSuccess===true) zsi.form.showAlert("alert");
                displayRecords();
            }
    });
});
    
function displayRecords(){
     var cb = bs({name:"cbFilter1",type:"checkbox"});
     $("#grid").dataBind({
	     url            : execURL + "statuses_sel"
	    ,width          : $(document).width() - 45
	    ,height         : 400
	    ,selectorType   : "checkbox"
        ,blankRowsLimit:5
        ,isPaging : false
        ,dataRows : [
                 {text  : cb                                                           , width : 25        , style : "text-align:left;"       
        		    , onRender      :  function(d){ 
                		                    return      bs({name:"status_id",type:"hidden",value: svn (d,"status_id")})
                		                              + bs({name:"is_edited",type:"hidden"})
                                                      + (d !==null ? bs({name:"cb",type:"checkbox"}) : "" );
                            }
            }	 
        		,{text  : "Code"        , name  : "status_code"     , type  : "input"         , width : 150       , style : "text-align:left;"}
        		,{text  : "Name"        , name  : "status_name"     , type  : "input"         , width : 200       , style : "text-align:left;"}
        		,{text  : "Color"       , name  : "status_color"    , type  : "input"         , width : 200       , style : "text-align:left;"}
        		,{text  : "Item?"       , name  : "is_item"         , type  : "yesno"         , width:75          , style : "text-align:left;"   ,defaultValue:"Y"                 }
        		,{text  : "Aircraft?"   , name  : "is_aircraft"     , type  : "yesno"         , width:80          , style : "text-align:left;"   ,defaultValue:"Y"                 }
        		,{text  : "Process?"    , name  : "is_process"      , type  : "yesno"         , width:80          , style : "text-align:left;"               }
        		,{text  : "Return?"     , name  : "is_returned"     , type  : "yesno"         , width:80          , style : "text-align:left;"               }
        		,{text  : "Add"         , name  : "is_add"          , type  : "yesno"         , width:75          , style : "text-align:left;"   ,defaultValue:"Y" }
        		,{text  : "Edit"        , name  : "is_edit"         , type  : "yesno"         , width:75          , style : "text-align:left;"   ,defaultValue:"Y" }
        		,{text  : "Delete"      , name  : "is_delete"       , type  : "yesno"         , width:75          , style : "text-align:left;"   ,defaultValue:"Y" }
        		,{text  : "Print"       , name  : "is_print"        , type  : "yesno"         , width:75          , style : "text-align:left;"   ,defaultValue:"N" }
        		,{text  : "Active?"     , name  : "is_active"       , type  : "yesno"         , width:75          , style : "text-align:left;"   ,defaultValue:"Y"                 }
	    ] 
    	     ,onComplete: function(){
                $("#cbFilter1").setCheckEvent("#grid input[name='cb']");
        }  
    });    
}
 
function displayInactive(){
     var cb = bs({name:"cbFilter2",type:"checkbox"});
     $("#inActiveRecords").dataBind({
	     url            : execURL + "statuses_sel @is_active='N'"
	    ,width          : 1220
	    ,height         : 400
	    ,selectorType   : "checkbox"
        ,blankRowsLimit:5
        ,isPaging : false
        ,dataRows : [
                 {text  : cb                                                           , width : 25        , style : "text-align:left;"       
        		    , onRender      :  function(d){ 
                		                    return      bs({name:"status_id",type:"hidden",value: svn (d,"status_id")})
                		                              + bs({name:"is_edited",type:"hidden"})
                                                      + (d !==null ? bs({name:"cb",type:"checkbox"}) : "" );
                            }
            }	 
        		,{text  : "Code"        , name  : "status_code"     , type  : "input"         , width : 150       , style : "text-align:left;"}
        		,{text  : "Name"        , name  : "status_name"     , type  : "input"         , width : 200       , style : "text-align:left;"}
        		,{text  : "Color"       , name  : "status_color"    , type  : "input"         , width : 200       , style : "text-align:left;"}
        		,{text  : "Item?"       , name  : "is_item"         , type  : "yesno"         , width:75          , style : "text-align:left;"   ,defaultValue:"Y"                 }
        		,{text  : "Aircraft?"   , name  : "is_aircraft"     , type  : "yesno"         , width:80          , style : "text-align:left;"   ,defaultValue:"Y"                 }
        		,{text  : "Process?"    , name  : "is_process"      , type  : "yesno"         , width:80          , style : "text-align:left;"               }
        		,{text  : "Return?"     , name  : "is_returned"     , type  : "yesno"         , width:80          , style : "text-align:left;"               }
        		,{text  : "Add"         , name  : "is_add"          , type  : "yesno"         , width:75          , style : "text-align:left;"   ,defaultValue:"Y" }
        		,{text  : "Edit"        , name  : "is_edit"         , type  : "yesno"         , width:75          , style : "text-align:left;"   ,defaultValue:"Y" }
        		,{text  : "Delete"      , name  : "is_delete"       , type  : "yesno"         , width:75          , style : "text-align:left;"   ,defaultValue:"Y" }
        		,{text  : "Active?"     , name  : "is_active"       , type  : "yesno"         , width:75          , style : "text-align:left;"   ,defaultValue:"Y"                 }
	    ] 
    	     ,onComplete: function(){
                $("#cbFilter2").setCheckEvent("#inActiveRecords input[name='cb']");
        }  
    });    
}    

    
                                                      