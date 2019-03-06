  $(document).ready(function(){
    var msg = zsi.getUrlParamValue("msg");
	if(msg=="invalid") {
	    if (msg) alert("Invalid old password.  Please try again.");
    }
    
    $.get(execURL + "select dbo.getLogonName(" + userId+ ") as username",function(data){
         $("#username").val(data.rows[0].username);
    });
     
    $('#frm').on('submit', function(e){
        var oldPassword = $.trim($("#old_password").val());
        var newpassword = $.trim($("#new_password").val());
        var retypePassword = $.trim($("#retype_password").val());
        
        if(oldPassword && newpassword && retypePassword){
            if(newpassword != retypePassword){
               alert("Passwords do not match!");
               e.preventDefault();
            }
        }else{
            alert("Please fill all fields.");
            e.preventDefault();
        }
    });
 });
 
 