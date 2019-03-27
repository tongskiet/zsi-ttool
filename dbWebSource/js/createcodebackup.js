var  gTw
    ,mdlUploadId              = "mdlUploadBackup"

;

$(document).ready(function(){
    gTw = new zsi.easyJsTemplateWriter();
    setUploadTemplate();
});

function btnUploadRestoreBackup(){
        var m=$('#' + mdlUploadId);
        m.modal("show");
}   

function setUploadTemplate(){
    var _tw = new zsi.easyJsTemplateWriter("body");
     _tw.bsModalBox({ 
                  id    : mdlUploadId
                , title : "Upload Code and Restore "
                , body : gTw.tmplUploadFile().html()
                , footer: '<div class="pull-left"><button type="button" onclick="onBackupFileUpload();" class="btn btn-primary"><span class="glyphicon glyphicon-upload"></span> Upload</button>'
                           + '</div>' 
        })
    ;

}  
function onBackupFileUpload(){
    var frm = $("#frm_" + mdlUploadId);
    var file=frm.find("#file").get(0);
    
    if( file.files.length<1 ) { 
         alert("Please select file.");
        return;
    }

    var formData = new FormData(frm.get(0));
    
    //fileNameOrg =fileOrg.files[0].name; //set current original image.
    
    $.ajax({
        url: base_url + 'file/uploadAppCodes',  //server script to process data
        type: 'POST',

        //Ajax events
        success: completeHandler = function(data) {
            if(data.isSuccess){
                zsi.form.showAlert("alert");
                $('#' + mdlUploadId).modal('toggle');
            }
            else
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
    

function btnCreateWebBackupSelf(){
    $.get( base_url + "javascript/selfBackup",function(){
    
      $.get( base_url + "pagetemplate/selfBackup",function(){
         alert("Web backup has been created");
      });
    
    });

}

function btnCreateWebBackupAll(){
    $.get( base_url + "javascript/allBackup",function(){
    
      $.get( base_url + "pagetemplate/allBackup",function(){
         alert("Web backup has been created");
      });
    
    });

}


function btnDownloadAppCodeWebOnly(){
    window.location.href =  base_url + "file/downloadAppCodes?isSelfBackup=Y";
}
function btnDownloadAppCodeAll(){
    window.location.href =  base_url + "file/downloadAppCodes?isSelfBackup=N";
}

function btnDownloadAppCodeAllWithDb(){
    window.location.href =  base_url + "file/downloadAppCodes?isSelfBackup=N&dbFolders=tables,views,procedures_functions,table_types";
}



function btnCreateTableBackup(){
    $.get( base_url + "sql/CreateBackupDbOjects?typename=tables",function(data){
     alert(data);
    }); 
}

function btnCreateTableTypesBackup(){
    $.get( base_url + "sql/CreateBackupDbOjects?typename=table_types",function(data){
     alert(data);
}); 
}

function btnCreateViewsBackup(){
    $.get( base_url + "sql/CreateBackupDbOjects?typename=views",function(data){
     alert(data);
}); 
}

function btnCreateProceduresBackup(){
    $.get( base_url + "sql/CreateBackupDbOjects?typename=procedures_functions",function(data){
     alert(data);
    }); 
}   


            