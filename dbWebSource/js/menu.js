 var bs                          = zsi.bs.ctrl
    ,svn                        = zsi.setValIfNull
    ,modalProcess               = "modalWindowProcess"
    ,tmplPageProcess            = ""
    ,tmplPageProcessAction      = ""
    ,tmplPageProcessActionProc  = ""
    ,tmplPageProcessRoles       = ""
    ,tmplDialog                 = ""
    ,g_page_id                  
    ,modalProcessAction         = "modalWindowProcessAction"
    ,contextModalProcessAction  = {  id         : modalProcessAction
                                    ,sizeAttr   : "pageProcessActionWidth"
                                  }

    ,g_page_process_id
    ,modalProcessActionProc     = "modalWindowProcessActionProc"
    ,contextModalProcessActionProc = {  id          : modalProcessActionProc
                                        , sizeAttr  : "pageProcessActionProcWidth"
                                     }
    ,modalProcessRoles          = "modalWindowProcessActionRoles"
    ,contextModalProcessRoles   = {  id             : modalProcessRoles
                                        , sizeAttr  : "pageProcessRolesWidth"
                                  }
    
;

zsi.ready(function(){
    getTemplates();
    displayRecords();
 });

var contextModalProcess = { id : modalProcess
    , sizeAttr: "pageProcessWidth"
};
        
function getTemplates(){
    $.get(base_url + "templates/bsDialogBox.txt",function(d){
        tmplDialog = Handlebars.compile(d); 
        $("body").append(tmplDialog(contextModalProcess));
    });    
    $.get(base_url + 'page/name/tmplPageProcess', function(d){tmplPageProcess=d;});  
    $.get(base_url + 'page/name/tmplPageProcessAction', function(d){ tmplPageProcessAction =d; });
    $.get(base_url + 'page/name/tmplPageProcessActionProc', function(d){ tmplPageProcessActionProc=d;});  
    $.get(base_url + 'page/name/tmplPageProcessRoles', function(d){ tmplPageProcessRoles=d;});  
}  

function showModalPageProcess(id, title){
    page_id = id;
    var m = $("#" + modalProcess);
    $("#" + modalProcess + " .modal-title").text("Process for » " + title);
    m.modal("show");
    m.find('.modal-body').html(tmplPageProcess);
   // initPageProcessTemplate(page_id);
}
        
$("#btnSave").click(function () {
    $("#grid").jsonSubmit({
        procedure: "menus_upd"
        
        ,onComplete: function (data) {
            $("#grid").clearGrid(); 
            displayRecords();
        }
    });
    
});
    
function displayRecords(){   
    var cb = bs({name:"cbFilter1",type:"checkbox"});
         $("#grid").dataBind({
	     url            : execURL + "menus_sel"
	   // ,width          : $(document).width() - 200
	    ,height         : $(document).height() - 250
	    ,selectorType   : "checkbox"
        ,blankRowsLimit:5
        ,isPaging : false
        ,dataRows : [
                 {text  : cb                                                        , type  : "hidden"        , width    : 25        , style : "text-align:left;"       
        		    , onRender      :  function(d){ 
                		                   return     bs({name:"menu_id",type:"hidden",value: svn (d,"menu_id")})
                                                       +  (d !==null ? bs({name:"cb",type:"checkbox"}) : "" );
                            }
            }	 
        		,{text  : "Menu Name"                , name  : "pmenu_id"                   , type  : "select"        , width : 200       , style : "text-align:left;"}
        		,{text  : "Parent Menu"              , name  : "menu_name"                  , type  : "input"         , width : 220       , style : "text-align:left;"}
        		,{text  : "Page Name"                , name  : "page_id"                    , type  : "select"        , width : 220       , style : "text-align:left;"}
        		,{text  : "Parameters"               , name  : "parameters"                 , type  : "input"         , width : 220       , style : "text-align:left;"}
        		,{text  : "Seq #"                    , name  : "seq_no"                     , type  : "input"         , width : 80        , style : "text-align:left;"}
        		,{text  : "Default"                  , name  : "is_default"                 , type  : "yesno"         , width : 80        , style : "text-align:left;"}
        		,{text  : "Process"                  , width : 80                           , style : "text-align:center;"      
        		    ,onRender  : 
                        function(d){
                            if(d!==null && (d.page_id !=="") )
                                return "<a href='javascript:showModalPageProcess(" + d.page_id  + ",\"" +  d.menu_name  + "\");'><span class='badge'>" + d.ProcessCount + "</span></a>";
                            else 
                                return "";
                    }
                }
	    ]
	     ,onComplete: function(){
	         $("#cbFilter1").setCheckEvent("#grid input[name='cb']");
             $("select[name='pmenu_id']").dataBind("menus");
             $("select[name='page_id']").dataBind( "pages");
             $("select[name='page_process_id']").dataBind( "page_processes");
        }  
    });    
}

$("#btnDelete").click(function(){
    zsi.form.deleteData({
         code       : "sys-0002"
        ,onComplete : function(data){
                        displayRecords();
                      }
    });      
});
             