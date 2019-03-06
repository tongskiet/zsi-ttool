 var bs = zsi.bs.ctrl;
var tblName     = "tblusers";
var svn =  zsi.setValIfNull;
var modalImageUser      = "modalWindowImageUser";
var g_rankFilter = null
    ,g_roleFilter = null
    ,g_organizationFilter = null
    ,g_keywordFilter = "";

zsi.ready(function(){
    setInputs();
    //setSearch();
    loadRole();
    loadRank();
    loadOrganization();
    displayRecords();
    getTemplate();
});
function markUserMandatory(){
    zsi.form.markMandatory({       
      "groupNames":[
            {
                 "names" : ["logon","last_name","first_name"]
                ,"type":"M"
            }             
          
      ]      
      ,"groupTitles":[ 
             {"titles" : ["Logon","Last Name","First Name"]}
      ]
    });    
}
 
function setInputs(){
    logon_id_filter = $("#logon_id_filter");
    $roleFilter = $("#role_filter");
    $rankFilter = $("#rank_filter");
    $organizationFilter = $("#organization_filter");
    $keywordFilter = $("#organization_filter");
}   

$("#btnSave").click(function () {
    if( zsi.form.checkMandatory()!==true) return false;
    
    $("#grid").jsonSubmit({
         procedure  : "users_upd"
        ,onComplete : function (data) {
            if(data.isSuccess===true) zsi.form.showAlert("alert");
            displayRecords();
        }
    });
});

$("#btnGo").click(function () {
    g_roleFilter = ($roleFilter.val()!==""? $roleFilter.val() : null);
    g_rankFilter = ($rankFilter.val()!==""? $rankFilter.val() : null);
    g_organizationFilter = ($organizationFilter.val()!==""? $organizationFilter.val() : null);
    g_keywordFilter = $.trim($keywordFilter.val());
    
    displayRecords();
});

function loadRole(){
    $("select[name='role_filter']").dataBind({
        url:  getOptionsURL("roles")
        ,onComplete:function(){ }
    });
}

function loadRank(){
    $("select[name='rank_filter']").dataBind({
        url:  getOptionsURL("rank")
        ,onComplete:function(){ }
    });
}

function loadOrganization(){
    $("select[name='organization_filter']").dataBind({
        url:  getOptionsURL("organization")
        ,onComplete:function(){ }
    });
}

function clearGrid(){
    $("#" + tblName).clearGrid();
}

function initChangeEvent(){
    $("input[name='file_thumbnail']").change(function(){
        fileNameThumbNail= this.files[0].name;
        var fileSize1 =  this.files[0].size / 1000.00; //to kilobytes
        if(fileSize1 > 100){ 
            alert("Please make sure that file size must not exceed 100 KB.");
            this.value="";
        }
    });
    
    $("input[name='file']").change(function(){
        fileNameOrg=this.files[0].name;
        var fileSize2 =  this.files[0].size / 1000.00; //to kilobytes
        if(fileSize2 > 800){ //1mb
            alert("It is recommended that file size must not exceed 800 KB.");
            this.value="";
        }
    });
}
function submitItems(){    
  $("#frm_modalWindow").jsonSubmit({
             procedure  : "users_upd"
             ,optionalItems: ["is_active"]
            ,onComplete : function (data) {
                 if(data.isSuccess===true) zsi.form.showAlert("alert");
                 displayRecords();
                 displayInactiveUsers();
            }
    });    
}

function getTemplate(){
    $.get(base_url + "templates/bsDialogBox.txt",function(d){
        var template = Handlebars.compile(d);     
                        
        var context = { id:"modalWindow"
                       
                        , title: "Users"
                        , footer:  ' <div class="pull-left"><button type="button" onclick="submitItems();" class="btn btn-primary"><span class="glyphicon glyphicon-floppy-disk"></span> Save</button></div>'
                        , body:'<div ><div id="' + tblName + '" class="zGrid"></div></div>'
                      };
        
        var html    = template(context);     
        $("body").append(html);
        
        var contextImageWindow = { 
                          id    : modalImageUser
                        , title : "Categories "
                        , footer: '<div class="pull-left"><button type="button" onclick="userImageUpload();" class="btn btn-primary"><span class="glyphicon glyphicon-upload"></span> Upload</button>'
                                   + '</div>' 
                    };
        
        var htmlImageWindow    = template(contextImageWindow);     
        $("body").append(htmlImageWindow);
        
    });    
}
//modal window//
function displayInactiveUsers(){   
    $("#" + tblName).dataBind({
        url   : procURL + "users_sel @is_active='N'" 
        ,width          : $(document).width() - 550
	    ,height         : $(document).height() - 250
        ,dataRows       :[
            { text:"Logon "   , width:220    , style:"text-align:center;"   
                 ,onRender : function(d){
                                return     bs({name:"user_id"       ,type:"hidden"  ,value: d.user_id})
                                         + bs({name:"logon"         ,type:"hidden"  ,value: d.logon}) 
                                         + bs({name:"last_name"     ,type:"hidden"  ,value: d.last_name}) 
                                         + bs({name:"first_name"    ,type:"hidden"  ,value: d.first_name}) 
                                         + bs({name:"middle_ini"    ,type:"hidden"  ,value: d.middle_ini})
                                         + bs({name:"is_requestor"  ,type:"hidden"  ,value: d.is_active})
                                         + bs({name:"plant_id"      ,type:"hidden"  ,value: d.plant_id})
                                         + bs({name:"role_id"       ,type:"hidden"  ,value: d.role_id})   
                                         + bs({name:"position"      ,type:"hidden"  ,value: d.position})
                                         + bs({name:"contact_nos"   ,type:"hidden"  ,value: d.contact_nos})
                                         + bs({name:"is_contact"    ,type:"hidden"  ,value: d.is_contact})  
                                         + d.logon;                          
                                
                            }             
             }	 
    		,{ text:"Users "            , width:230    , style:"text-align:center;"
                ,onRender : function(d){ return d.user_name; }
    		}	 
    		,{ text:"Active?"           , width:80     , style:"text-align:center;"   ,type:"yesno"   ,name:"is_active"   ,defaultValue:"Y" }	 
    	
            ]

    });  
}

function displayRecords(){   
    var rownum=0;
    $("#grid").dataBind({
	     //url   : procURL + "users2_sel @role_id="+ g_roleFilter+",@rank_id="+ g_rankFilter +",@organization_id="+ g_organizationFilter +",@keyword='"+ g_keywordFilter +"'"
	     url   : procURL + "users_sel" 
        ,width          : $(document).width() - 25
	    ,height         : $(document).height() - 250
	    ,selectorType   : "checkbox"
        ,blankRowsLimit :5
        ,isPaging       : true
        //,rowsPerPage    : 100
        ,dataRows       :[
            { text:"#"          , width:25     , style:"text-align:center;" 
                 , onRender      :  function(d) {
                    rownum++;
                    return (d!==null ? rownum : ""); 
                }    		     
     		 }	 
     		,{ text:"User"          , width:280     , style:"text-align:center;"      ,sortColNo: 0 
                 , onRender      :  function(d) {
                    return     bs({name:"user_id",type:"select",value: svn (d,"user_id")})
                             + bs({name:"is_edited",type:"hidden"}); 
                }    		     
     		 }	 
    		,{ text:"Role"          , width:200     , style:"text-align:left;"        ,type:"select"     ,name:"role_id"    }
    		,{ text:"Logon"          , width:180     , style:"text-align:left;"
    		    ,onRender: function(d){
    		        return "<input type='hidden' name='password' value='" + svn(d, "password") + "'>" + svn(d, "logon");
    		    }
    		}
    		,{ text:"Rank"          , width:200     , style:"text-align:left;"
    		    ,onRender: function(d){
    		        return svn(d, "rankDesc");
    		    }
    		}
    		,{ text:"Position"      , width:200     , style:"text-align:left;"
    		    ,onRender: function(d){
    		        return svn(d, "position");
    		    }
    		}
    		,{ text:"Organization"  , width:200     , style:"text-align:left;"
    		    ,onRender: function(d){
    		        return svn(d, "organizationName");
    		    }
    		}
	    ]
        ,onComplete: function(){
            rownum=0;
            $("select[name='user_id']").dataBind({
                  url: base_url + "selectoption/code/notUsers"
                , isUniqueOptions:true
                , onComplete: function(){
                    $("select[name='user_id']").setUniqueOptions();
                }
            }); 
            
            $("select[name='user_id']").change(function(){
                var o = $(this);
                var selVal =o.attr("selectedvalue");
                var zRow = o.parent().parent();
               
                if(typeof selVal==ud){
                    $.get(execURL + "select dbo.createUserLogon(" + o.val() + ") as username",function(data){
                        $.get(base_url + "account/getnewpassword?pwd=" +   data.rows[0].username,function(data){
                            zRow.find("[name='password']").val(data);
                        });
                   });
                }
             });

            $("select[name='plant_id']").dataBind( "plants");
            $("select[name='role_id']").dataBind({
                url:  getOptionsURL("roles")
                ,onComplete:function(){
                    //$("select[name='role_id']").change();
                }
            });
            
            
            markUserMandatory();
            $(".no-data input[name='logon']").checkValueExists({code:"adm-0002",colName:"logon"});
        }
    });    
}

function setToNullIfChecked(id){
    $("#" + tblName + " input[name='cb']").change(function(){
            var td  = this.parentNode;
            var p_user_id = $(td).find("#user_id");
            if(this.checked) 
                p_user_id.val(id);
            else
                p_user_id.val('');
    });
}

function showModalUploadUserImage(UserId,title){
    user_id = UserId;
    var m=$('#' + modalImageUser);
    
    m.find(".modal-title").text("Image User for » " + title);
    m.modal("show");
    m.find("form").attr("enctype","multipart/form-data");
    
    
    $.get(base_url + 'page/name/tmplImageUpload'
        ,function(data){
            m.find('.modal-body').html(data);
            $("#frm_" + modalImageUser).find("#prefixKey").val("user.");
            initChangeEvent();
        }
    ); 
}

function userImageUpload(){
    var frm = $("#frm_" + modalImageUser);
    var fileOrg=frm.find("#file").get(0);

    if( fileOrg.files.length<1 ) { 
         alert("Please select image.");
        return;
    }
    var formData = new FormData( frm.get(0));
    $.ajax({
        url: base_url + 'file/UploadImage',  //server script to process data
        type: 'POST',

        //Ajax events
        success: completeHandler = function(data) {
            if(data.isSuccess){
                //submit filename to server
                $.get(execURL  + "dbo.image_file_users_upd @user_id=" + user_id
                                + ",@img_filename='user." +  fileOrg.files[0].name + "'"
                ,function(data){
                    zsi.form.showAlert("alert");
                    $('#' + modalImageUser).modal('toggle');
                    
                    //refresh latest records:
                    displayRecords();
                });

                    
            }else
                alert(data.errMsg);
            
        },
        error: errorHandler = function() {
            console.log("error");
        },
        // Form data
        data: formData,
        //Options to tell JQuery not to process data or worry about content-type
        cache: false,
        contentType: false,
        processData: false
    }, 'json');
}

function mouseover(fileName){
 $("#user-box").css("display","block");
 var $img = $("#user-box img");
 $img.attr("src",base_url + "file/viewImage?fileName=" +  fileName + "&isThumbNail=n");
 
 if(fileName!=="") 
    $img.attr("style","margin-left:0px;");
else
    $img.attr("style","margin-left:-106px;");
}

function mouseout(){
    $("#user-box").css("display","none");
}

function showModalUploadImage(filename){

        var m=$('#modalWindow');
        
        m.modal("show");
        var img = "<img src='"  + base_url + "file/viewImage?fileName=" +  filename + "'>";
        m.find('.modal-body').html(img); 
}

                                        