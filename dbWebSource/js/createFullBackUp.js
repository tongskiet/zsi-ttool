

$("#btnCreateBackup").click(function(){
    
    $.post(procURL + "createFullBackup",function(){
        alert("Backup successfully created.");
    });    
});