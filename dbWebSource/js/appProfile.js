  //jquery objects events:
$(document).ready(function(){
    displayAppProfile();
    
        $("#theme_id").dataBind("theme");
   
}); 

function displayAppProfile(){
   $.get( execURL + "app_profile_sel"
    , function(data){
        if(data.rows.length===0) return;
        var i = data.rows[0];
        
        $("#app_title").val(  i.app_title );
        $("#d_format").val(  i.date_format );
        $("#excel_conn_str").val(  i.excel_conn_str );
        $("#excel_folder").val(  i.excel_folder );
        $("#image_folder").val( i.image_folder );
        $("#default_page").val( i.default_page );
        $("#network_group_folder").val( i.network_group_folder );
        $("#developer_key").val(  i.developer_key );
        $("#is_source_minified").val(  i.is_source_minified );
        
    });
    
}   

$("#btnSave").click(function(){
   $.post( execURL + "app_profile_upd"
        + " @app_title='" +             $("#app_title").val() + "'"
        + ",@date_format='" +           $("#d_format").val() + "'"
        + ",@excel_conn_str='" +        $("#excel_conn_str").val() + "'"
        + ",@excel_folder='" +          $("#excel_folder").val() + "'"
        + ",@image_folder='" +          $("#image_folder").val() + "'"
        + ",@default_page='" +          $("#default_page").val() + "'"
        + ",@network_group_folder='" +  $("#network_group_folder").val() + "'"
        + ",@developer_key='" + escape($("#developer_key").val()) + "'"
        + ",@is_source_minified='" + $("#is_source_minified").val() + "'"
        ,function(data){
              if(data.isSuccess===true) zsi.form.showAlert("alert");      
              
        }
    );
});          