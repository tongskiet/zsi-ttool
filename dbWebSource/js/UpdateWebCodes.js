 var  gTw
    ,mdlUploadId              = "mdlUploadBackup"

;

$(document).ready(function(){
    gTw = new zsi.easyJsTemplateWriter();
    setUploadTemplate();
});

function btnUploadRestoreWebCodes(){
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
    



      