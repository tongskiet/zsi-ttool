$(document).ready(function(){
    $("#tmpData").dataBind({ url : execURL + "excel_upload_sel"});
});

function excelFileUpload(){
    var frm      = $("#frmUploadFile");
    var formData = new FormData(frm.get(0));
    var files    = frm.find("input[name='file']").get(0).files; 

    if(files.length===0){
        alert("Please select excel file.");
        return;    
    }
    
    //disable button and file upload.
    frm.find("input[name='file']").attr("disabled","disabled");
    $("btnUploadFile").hide();
    $("#loadingStatus").html("<div class='loadingImg'></div> Uploading...");

    $.ajax({
        url: base_url + 'file/templateUpload',  //server script to process data
        type: 'POST',
        //Ajax events
        success: completeHandler = function(data) {
            if(data.isSuccess){
                 alert("Data has been successfully uploaded.");
            }
            else
                alert(data.errMsg);
        },
        error: errorHandler = function() {
            console.log("error")
        },
        // Form data
        data: formData,
        //Options to tell JQuery not to process data or worry about content-type
        cache: false,
        contentType: false,
        processData: false
    }, 'json');        
}         