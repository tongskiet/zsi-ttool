 var bs = zsi.bs.ctrl;
var svn =  zsi.setValIfNull;
var tblName     = "tblRRolesMenu";
var modalWindow = 0;
var role_id =null;
var tblNameUser     = "tblUser";
var tblNameDashboard     = "tblRolesDashboard";
//var modalWindowUser = 0;
zsi.ready(function(){
    displayRecords();
    getTemplate();
    
});
function getTemplate(){
    $.get(base_url + "templates/bsDialogBox.txt",function(d){
        var template = Handlebars.compile(d);     
        
        var context = { id:"modalWindow"
                        , title: "Roles Menu" 
                        , sizeAttr: "modal-lg"
                        , footer:  ' <div class="pull-left"><button type="button" onclick="submitItems();" class="btn btn-primary"><span class="glyphicon glyphicon-floppy-disk"></span> Save</button></div>'
                        , body: 
                        
                        '<div class="modalGrid zContainer1"><div id="' + tblName + '" class="zGrid"></div></div>'
                      };
        var html    = template(context);     
        $("body").append(html);

        var contextUser = { id:"modalWindowUser"
                        , title: "User" 
                        , body: 
                        
                        '<div class="modalGrid zContainer1"><div id="' + tblNameUser + '" class="zGrid"></div></div>'
                      };
        var htmlUser    = template(contextUser);     
        $("body").append(htmlUser);
        
        var contextDashboard = { id:"modalWindowDashboards"
                        , title: "Roles Dashboards" 
                        , sizeAttr: "modal-xs"
                        , footer:  ' <div class="pull-left"><button type="button" onclick="submitItemsDashboard();" class="btn btn-primary"><span class="glyphicon glyphicon-floppy-disk"></span> Save</button></div>'
                        , body: 
                        
                        '<div class="modalGrid zContainer1"><div id="' + tblNameDashboard + '" class="zGrid"></div></div>'
                      };
        var htmlDashboard    = template(contextDashboard);     
        $("body").append(htmlDashboard);
    });
    
     

}
function manageItem(id,name){
    role_id =id;
    displayRRolesMenu(id);
    $(".modal-title").text("Role Menu for » " + name);
    $('#modalWindow').modal("show");
}
function manageItemDashboard(id,name){
    role_id =id;
    displayRolesDashboard(id);
    $(".modal-title").text("Role Dashboard for » " + name);
    $('#modalWindowDashboards').modal("show");
    if (modalWindow===0) {
        modalWindow=1;
        $("#modalWindowDashboards").on("hide.bs.modal", function () {
                if (confirm("You are about to close this window. Continue?")) return true;
                return false;
        });
    }    
    
  // clearGrid();
}
function clearGrid(){
    $("#" + tblName).clearGrid();
}
function manageItemUser(id,name){
    role_id =id;
    displayUsers(id);
    $(".modal-title").text("Users for » " + name);
    $('#modalWindowUser').modal("show");
    if (modalWindowUser===0) {
        modalWindowUser=1;
        $("#modalWindowUser").on("hide.bs.modal", function () {
                if (confirm("You are about to close this window. Continue?")) return true;
                return false;
        });
    }    
    
  // clearGrid();
    
}
function clearGrid(){
    $("#" + tblNameUser).clearGrid();
}
 $("#btnSave").click(function () {
    $("#grid").jsonSubmit({
            sqlCode: "R181"
            ,optionalItems: ["is_export_excel","is_export_pdf","is_import_excel","is_add","is_edit","is_delete"]
            , onComplete: function (data) {
                $("#grid").clearGrid();
                displayRecords();
            }
    });
     
});
function submitItems(){
         $("#frm_modalWindow").jsonSubmit({
             procedure  : "role_menus_upd"
            ,onComplete : function (data) {
                $("#" + tblName).clearGrid();
                if(data.isSuccess) zsi.form.showAlert("alert");
                displayRRolesMenu(role_id);
               
            }
        });
        
        
}
function displayRecords(){   
    var cb = bs({name:"cbFilter1",type:"checkbox"});
    $("#grid").dataBind({
         url   : procURL + "roles_sel"
        ,width          : $(document).width() - 100
	    ,height         : $(document).height() - 350
        ,blankRowsLimit:5
        ,dataRows       :[
    		 { text: cb             , width:25  , style:"text-align:left;"   
    		     ,onRender : function(d){
                                return     bs({name:"role_id",type:"hidden",value: svn(d,"role_id") })
                                        +  bs({name:"is_edited",type:"hidden"}) 
                                        +  (d !==null ? bs({name:"cb",type:"checkbox"}) : "" );
                            }             
    		 }	 
    		,{ text:"Role Name"     , width:200 , style:"text-align:center;"    ,type:"input"  ,name:"role_name"}	 
        //	,{text  : "Dashboard Page"          , name  : "page_id"             ,type  : "select"           , width : 300       , style : "text-align:left;"}
    		,{ text:"Export Excel?" , width:100 , style:"text-align:center;"    ,type:"yesno"  ,name:"is_export_excel"  ,defaultValue:"Y"}	 
    		,{ text:"Export Pdf?"   , width:100 , style:"text-align:center;"    ,type:"yesno"  ,name:"is_export_pdf"    ,defaultValue:"Y"}	 	 
    		,{ text:"Import Excel?" , width:100 , style:"text-align:center;"    ,type:"yesno"  ,name:"is_import_excel"  ,defaultValue:"Y"}
    		,{text  : "Add"         , name  : "is_add"          , type  : "yesno"         , width:60          , style : "text-align:center;"   ,defaultValue:"Y" }
    		,{text  : "Edit"        , name  : "is_edit"         , type  : "yesno"         , width:60          , style : "text-align:center;"   ,defaultValue:"Y" }
    		,{text  : "Delete"      , name  : "is_delete"       , type  : "yesno"         , width:60          , style : "text-align:center;"   ,defaultValue:"Y" }
    		,{ text:"Role Menu"     , width:80  , style:"text-align:center;"  
    		    ,onRender : function(d){ return "<a href='javascript:manageItem(" + svn(d,"role_id") + ",\"" +  svn(d,"role_name")  + "\");'><span class='badge'>" + svn(d,"countRoleMenus") + "</span></a>"; }
    		}	 
    		,{ text:"Users"         , width:81  , style:"text-align:center;" 
    		    ,onRender : function(d){ return "<a href='javascript:manageItemUser(" + svn(d,"role_id") + ",\"" + svn(d,"role_name")  + "\");'><span class='badge'>" + svn(d,"countUsers") + "</span></a>"; }
    		}	 	 
	        ,{text  : "Dashboards"   , width : 100 , style:"text-align:center;" 
                ,onRender : function(d){ return "<a href='javascript:manageItemDashboard(" + svn(d,"role_id") + ",\"" +  svn(d,"role_name")  + "\");'><span class='badge'>" + svn(d,"countRoleDashboards") + "</span></a>"; }
            }
        ]
        ,onComplete: function(){
            $("#cbFilter1").setCheckEvent("#grid input[name='cb']");
        //    $("select[name='page_id']").dataBind( "pages");
        /* s$("select[name='user_id']").dataBind({
                  url: base_url + "selectoption/code/notUsers"
                , isUniqueOptions:true
                , onComplete: function(){
                    $("select[name='user_id']").setUniqueOptions();
                }
            }); */ 
	               
             
        }
    });    
}
function displayRRolesMenu(id){   
    var cb = bs({name:"cbFilter2",type:"checkbox"});
    $("#" + tblName).dataBind({
         url   : execURL + "role_menus_sel @role_id=" + id 
        ,width          : 560
	    ,height         : 400
	    
        ,dataRows       :[
    		 { text: cb             , width:25  , style:"text-align:left;" 
    		     ,onRender : function(d){ 
                                return  bs({name:"role_menu_id",type:"hidden",value:svn (d,"role_menu_id")})  
                                        + bs({name:"role_id",type:"hidden",value: svn (d,"role_id") }) 
                                        + bs({name:"menu_id",type:"hidden",value:svn (d,"menu_id")})
                                        + bs({name:"cb",type:"checkbox",checked :(d.role_id!==""?true:false)}) ;
                                    //    +  (d !==null ? bs({name:"cb1",type:"checkbox"}) : "" );
                            }            

    		 }	 
    		,{ text:"Menu Name"     , width:200 , style:"text-align:left;"    ,name:"menu_name"  }	 
    		,{ text:"Is New?"       , width:110 , style:"text-align:center;"  ,type:"yesno"  ,name:"is_new"     ,defaultValue:"Y" }	 
    		,{ text:"Write?"        , width:93  , style:"text-align:left;"    ,type:"yesno"  ,name:"is_write"   ,defaultValue:"Y" }	 	 
    		,{ text:"Delete?"       , width:92  , style:"text-align:left;"    ,type:"yesno"  ,name:"is_delete"  ,defaultValue:"Y" }	 	 
 	    ]
       ,onComplete : function(){
            setToNullIfChecked(id);
            $("#cbFilter2").setCheckEvent("#" + tblName + " input[name='cb']");
        }
    });    
}
function setToNullIfChecked(id){
    $("#" + tblName + " input[name='cb']").change(function(){
            var td  = this.parentNode;
            var role_id = $(td).find("#role_id");
            if(this.checked) 
                role_id.val(id);
            else
                role_id.val('');
    });
}

function displayUsers(id){   
    $("#" + tblNameUser).dataBind({
         url   : procURL + "users_sel @role_id=" + id 
        ,width          : 320
	    ,height         : 400
        ,dataRows       :[
    		 { text: "User Name"     , width:300  , style:"text-align:left, margin-left;" ,name:"logon" }
        ]
    });    
}

function displayRolesDashboard(id){   
    var cb = bs({name:"cbFilter3",type:"checkbox"});
    
    $("#" + tblNameDashboard).dataBind({
         url   : execURL + "role_dashboards_sel @role_id=" + id 
        ,width          : 560
	    ,height         : 400
	    
        ,dataRows       :[
    		 { text: cb             , width:25  , style:"text-align:left;" 
    		     ,onRender : function(d){ 
                                return  bs({name:"role_dashboard_id",type:"hidden",value:svn (d,"role_dashboard_id")})  
                                        + bs({name:"is_edited",type:"hidden",value: svn (d,"id_edited") }) 
                                        + bs({name:"role_id",type:"hidden",value: svn (d,"role_id") }) 
                                        //+ bs({name:"menu_id",type:"hidden",value:svn (d,"menu_id")})
                                        + bs({name:"cb",type:"checkbox",checked :(d.role_id!==""?true:false)}) ;
                                    //    +  (d !==null ? bs({name:"cb1",type:"checkbox"}) : "" );
                            }            

    		 }	 
    		,{ text:"Page"              , width:400     , style:"text-align:left;"    
    		    ,onRender : function(d){ 
                                return  bs({name:"page_id",type:"hidden",value:svn (d,"page_id")})  
                                        + svn(d, "page_title");
                                   
                            }            
                            
            }	 
    	//	,{ text:"Default?"          , width:110     , style:"text-align:center;"    ,type:"yesno"       ,name:"is_default"     ,defaultValue:"Y" }	 
    		,{ text:"Seq #"             , width:60      , style:"text-align:center;"     ,type:"input"      ,name:"seq_no"}	 
    	
 	    ]
       ,onComplete : function(){
           setToNullIfChecked1(id);
            $("#cbFilter3").setCheckEvent("#" + tblNameDashboard + " input[name='cb']");
            
            $("input[name='cb'], input").on("keyup change", function(){
                    var $zRow = $(this).closest(".zRow");
                    $zRow.find("#is_edited").val("Y");
                });  
            $("select[name='page_id']").dataBind( "pages");    
            $("select[name='page_id']").dataBind({
                url : procURL + "dd_dashboard_sel" 
                ,text: "page_title"
                ,value: "page_id"
            });
        }
    });    
}
function setToNullIfChecked1(id){
    $("#" + tblNameDashboard + " input[name='cb']").change(function(){
            var td  = this.parentNode;
            var role_id = $(td).find("#role_id");
            if(this.checked) 
                role_id.val(id);
            else
                role_id.val('');
    });
}
function submitItemsDashboard(){
         $("#frm_modalWindowDashboards").jsonSubmit({
             procedure  : "role_dashboards_upd"
            ,onComplete : function (data) {
                $("#" + tblNameDashboard).clearGrid();
                if(data.isSuccess) zsi.form.showAlert("alert");
                displayRolesDashboard(role_id);
               
            }
        });
        
        
}
$("#btnDelete").click(function(){
    zsi.form.deleteData({
         code       : "adm-0001"
        ,onComplete : function(data){
                        displayRecords();
                      }
    });   

});      

    
                                                                                                   