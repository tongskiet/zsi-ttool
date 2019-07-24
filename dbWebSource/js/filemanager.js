var editor = null
    ,fileName =""
    ,currentPath = ""
    ,modalFileUpload = "mdlFileUpload"
    ,contextFileUploadWindow = { 
                  id    : modalFileUpload
                , title : "File Upload "
                , footer: '<div class="pull-left"><button type="button" onclick="fileUpload();" class="btn btn-primary"><span class="glyphicon glyphicon-upload"></span> Upload</button>'
                           + '</div>' 

    }
;

$(window).bind('keydown', function (e) {
    var isCtrlS = (e.ctrlKey && e.which == 83);
    if (isCtrlS) {
        submit();
        e.preventDefault();
        return false;
    }
    //ESC
    if(e.which===27) {
        $("#editorPane").hide().find(".zPopup").remove();
        fileName ="";
        //currentPath ="";
    }
});

loadFoldersAndFiles("","");

$(document).ready(function(){

    $(this.body).prepend("<div id=\"editorPane\"> </div>");
    getTemplate();
});


function showUploadFileModal(){
    var _frm =  "<div class=\"form-horizontal\">"
                    +"<div class=\"form-group\">"  
                        +"<label class=\"col-xs-3  control-label\">File</label>"
                        +"<div class=\" col-xs-3\">"
                           +"<input name=\"root\" id=\"root\" type=\"hidden\" value=\""  + currentPath + "\" >"
                           +"<input name=\"file\" id=\"file\" type=\"file\"  class=\"browse btn btn-primary\" >"
                        +"</div>"
                    +"</div>"
                +"</div>";
                
    
    
            var m=$('#' + modalFileUpload);
            m.modal("show");
            m.find("form").attr("enctype","multipart/form-data");
            m.find('.modal-body').html(_frm);
    
}

function getTemplate(){
    $.get(base_url + "templates/bsDialogBox.txt",function(d){
        var template = Handlebars.compile(d);     
        $("body").append(template(contextFileUploadWindow));
    });    
}  

function loadFoldersAndFiles(path,pathName,obj){
    //display breadcrumbs or directories
    if(path!==""){
        if(typeof obj !== ud) { 
            var $ul = $(obj).closest("ul");
            if( $ul.attr("id") !== "locations" )
                $("#locations").append("<li><a href=\"javascript:void(0);\" onclick=\"loadFoldersAndFiles('"  + path + "','"  + pathName +  "',this);\" ><span class=\"glyphicon glyphicon-folder-close\"></span> " + pathName + "</a></li>");
            else 
                $(obj).closest("li").nextAll().remove();
        }
        
        path+=">";
    }else{
        var _ctrl =""
                + "<li><a href=\"javascript:void(0);\" onclick=\"showUploadFileModal();\" ><span class=\"glyphicon glyphicon-upload\"></span> Upload</a></li>";
        $("#locations").html(_ctrl + "<li><a href=\"javascript:loadFoldersAndFiles('','');\"><span class=\"glyphicon glyphicon-home\"></span> Root</a></li>");
        
    }
    currentPath =  path.replace(/>/g,"\\\\");
    displayFolders(path,pathName);
    displayFiles(path,pathName);

}

function displayFolders(path,pathName){
    $folders = $("#folders");
    $folders.empty();

    $.get(base_url + "file/getFolders?path=" + path.replace(/>/g,"\\\\")
        ,function(data){
          $.each(data.folders,function(){
            $folders.append("<li><a href=\"javascript:void(0);\" onclick=\"loadFoldersAndFiles('"  + path +  this + "','" + this + "',this);\" ><span class=\"glyphicon glyphicon-folder-close\"></span> " + this + "</a></li>");    
          });
        }    
    );     
}
 
function displayFiles(path,pathName){
    $files = $("#files");
    $files.empty();
    $.get(base_url + "file/getFiles?path=" + path.replace(/>/g,"\\\\")
        ,function(data){
          $.each(data.files,function(){
                var _delete  = "<a href=\"javascript:void(0);\" title=\"Delete File\" onclick=\"deleteFile('" + this + "');\"><span class=\"glyphicon glyphicon-trash\"></span></a> ";
                var _edit  = "<a href=\"javascript:void(0);\" title=\"Edit File\" onclick=\"editFile('" + this + "');\"   ><span class=\"glyphicon glyphicon-edit\"></span></a> ";
                var _open  = "<a href=\"javascript:void(0);\" title=\"Open File\" onclick=\"loadFile('" + this + "');\"   ><span class=\"glyphicon glyphicon-download-alt\"></span></a> ";
                var _extract  = "<a href=\"javascript:void(0);\" title=\"Open File\" onclick=\"extractFile('" + this + "','"  + pathName + "');\"   ><span class=\"glyphicon glyphicon-compressed\"></span></a> ";
                $files.append("<li> " + _delete + _edit + _open + (this.indexOf(".zip") > -1 ?  _extract : "") + this + "</li>");    
            });
        }    
    );
}
  
function editFile( _fileName){
     fileName =_fileName;
    // currentPath =  _path.replace(/>/g,"\\\\");
    $.get(base_url + "file/readFile?filename=" + currentPath +  _fileName 
        ,function(data){
            initAceEditor(data);
        }    
    ); 
} 
 
function deleteFile(_fileName){
   // var _currentPath =  _path.replace(/>/g,"\\\\");
    if(confirm("Are you sure you want to delete this file: " + _fileName + "?") ){
        $.get(base_url + "file/deleteFile?filename=" + currentPath +  _fileName 
            ,function(data){
                displayFiles(currentPath);
            }    
        ); 
    }
}
 
 function loadFile(_fileName){
    window.location.href = base_url + "file/downLoadFile?filename=" + currentPath +  _fileName;
 }
 
 function extractFile(_fileName,pathName){
    $.get( base_url + "file/extractFile?filename=" + currentPath +  _fileName
        ,function(data){
             loadFoldersAndFiles(currentPath,pathName);
        }    
    );     
 }
 
 function getAceModeFile(fileName){
     var r ="",ext=  fileName.split('.').pop();
     
     switch(ext){
        case "css":     r="css";       break;
        case "json":    r="json";       break;
        case "js":      r="javascript"; break;
        case "htm": 
        case "cshtml": 
        case "html":    r="html";       break;
        case "xml":        
        case "config":  r="xml";        break;        
        case "cs":      r="csharp";     break;
        default:        r="text";       break;
     }
     return r;
 }
 
 function initAceEditor(data) {
    var $ep = $("#editorPane");
     
    $ep.show().showPopup({
         title : fileName
        ,body  : "<pre id=\"editor\"></pre>"
                + "<button type=\"button\"  onclick=\"submit();\"  class=\"btn btn-primary btn-sm\" >"
                + "<span class=\"glyphicon glyphicon-floppy-disk\"></span> Save"
                + "</button>"
        ,onClose : function(){
            $ep.hide();
            fileName ="";
        }

    });
    $("#editor").empty();//.removeAttr("class"); 
    $("#editor").html($('<div/>').text(data).html());
    editor=null;
    ace.require("ace/ext/language_tools");
    editor = ace.edit("editor");
    editor.setTheme("ace/theme/monokai");
    editor.session.setMode("ace/mode/" + getAceModeFile(fileName));
    editor.setAutoScrollEditorIntoView(true);

    editor.setOptions({
        enableBasicAutocompletion: true,
        enableSnippets: true,
        enableLiveAutocompletion: false,
        maxLines: Infinity,
        fontSize: "10pt"
    });

}

function submit() {
    if(fileName ==="") return;
    $.ajax({
        url  : base_url + "file/saveFile"
        ,data : {fileName: currentPath + fileName, content :  $('<div/>').text(  editor.getSession().getValue()  ).html()   }
        ,type : "POST"
        ,success:function(){
            zsi.form.showAlert("alert");
            
        } 
    });    
    
}


function fileUpload(){
var frm = $("#frm_" + modalFileUpload);
    var _file=frm.find("#file").get(0);
    if( _file.files.length<1 ) { 
         alert("Please select file.");
        return;
    }

    var formData = new FormData( frm.get(0));
    $.ajax({
        url: base_url + 'file/UploadFile'
        ,type: 'POST'
        //Ajax events
        ,success: completeHandler = function(data) {
            if(data.isSuccess){
                displayFiles(currentPath);
                $('#' + modalFileUpload).modal('toggle');

            }else
                alert(data.errMsg);
        }
        ,error: errorHandler = function() {
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



 
 
                 