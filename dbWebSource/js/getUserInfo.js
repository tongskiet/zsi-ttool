 function getUserInfo(callBack){
    $.get(execURL + "user_info_sel @is_active='Y'"
    ,function(data){
        var i     = data.rows[0];
        user_id   = i.user_id;
        role_id   = i.role_id;
        
        if(callBack) callBack();
    });
}