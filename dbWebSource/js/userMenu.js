var  svn                        = zsi.setValIfNull
    ,bs                         = zsi.bs.ctrl
    ,bsButton                   = zsi.bs.button
    ,proc_url                   = base_url + "common/executeproc/"
   
;
 
 
$(document).ready(function(){
 //displayUsersMenus();
 displayUserMenus();
});
//  function displayUsersMenus(){
//   var _tw =new zsi.easyJsTemplateWriter();    
//   var data=[
//           { image4_id:30,image3_id:31, link:"#",label:"VEHICLE ARCHITECTURE"}
//           ,{ image4_id:32,image3_id:33, link:"#",label:"WIRES AND CABLES" }
//           ,{ image4_id:34,image3_id:35, link:"#",label:"POWER DISTRIBUTION" }
//           ,{ image4_id:36,image3_id:37, link:"#",label:"GROUNDING DISTRIBUTION" }
//           ,{ image4_id:38,image3_id:39, link:"#",label:"SAFETY CRITICAL CIRCUITS" }
//           ,{ image4_id:40,image3_id:41, link:"#",label:"NETWORK TOPOLOGY" }
//       ];
 
//     $(".users-menu-content").html(function(){
         
//          $.each(data,function(){
//           _tw.usersMenu({
//                   link:this.link
//                 , imageId3: this.image3_id
//                 , imageId4: this.image4_id
//                 , label: this.label
//                 , labelBreakCSS:  "label-double"
//           });
//          });
//             return _tw.html();
//     });
    
// }

// this function uses a stored procedure action to get the "menus" for the users
function displayUserMenus(){

    var _tw = new zsi.easyJsTemplateWriter();    

    $.get(execURL + "trend_menus_sel", function(data){

        d = data.rows;
        
        $(".users-menu-content").html(function(){
            $.each(d, function(){
                _tw.usersMenu({
                      link      : "#"
                    , imageId3  : this.image4_id 
                    , imageId4  : this.image3_id
                    , label     : this.menu_name
                    , labelBreakCSS:  "label-double"
                    , event     : "onClick"
                    , onClick       : "displaySubCategory(this," + this.menu_id+","+this.specs_id+")"
                });
            });
            return _tw.html();
        });

    });
}

function displaySubCategory(menuId, specsId){
    // console.log(menuId);
    // console.log(specsId);
    var _tw = new zsi.easyJsTemplateWriter();    
    
    // $(".users-menu-content").html(menuId + specsId);
    
    $.get(execURL + "criterias_sel @trend_menu_id=" + menuId + ",@main_only='Y'", function(data){
        d = data.rows;
        if(d.length == 0)
        {
            displayUserMenus();
        }
        else{
            $(".users-menu-content").html(function(){
                $.each(d, function(){
                    _tw.usersMenu({
                          link      : "#"
                        , imageId3  : 33
                        , imageId4  : 32
                        , label     : this.criteria_title
                        , labelBreakCSS:  "label-double"
                    });
                });
                return _tw.html();
            });    
        }
        
    });
}       












