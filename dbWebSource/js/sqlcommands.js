$(document).ready(function() {
    var  _tw =  zsi.easyJsTemplateWriter
        ,$modal
        ,$is_procedure
        ,$id
        ,$code
        ,$is_public
        ,tbl = "#tblResult"
        ,modalTemplate = { 
                  id    : 'modalAdd'
                , title : 'Add SQL Command'
                , body : new _tw().sqlCmdMdlBody().html()
                , footer: '<button id="btnSave" type="button" class="btn btn-primary">Save</button><button id="btnRun" type="button" class="btn btn-primary">Run</button>' 

    };
    editor = null;
    
    getTemplate(function() {
        initAceEditor(false);
    });
    displaySqlCommands();
    
    $("#btnSync").click(function() {
        $.get(procURL + "sql_commands_sync", function() {
            displaySqlCommands(); 
        });
    });
    
    $('#modalAdd').on('show.bs.modal', function (e) {
        $code.val("");
        $is_public.val("N");
    });
    
    $(document).on("click", "#btnRun", function () {
        $(tbl).show();
        var text = editor.getSelectedText();
        if (text === "") { text = editor.getValue(); }
        if (text === "") { alert("Please enter an sql statement."); return; }
        $.post(
            base_url + "sql/exec?p=" + escape(text)
            , function(data) {
                var d = data.rows;
                if (d.length == 0) {
                    $(tbl).html("No Result.");
                    return;
                }
                var hInfo = d[0];
                var keys = Object.keys(hInfo);
                var colsLength = keys.length;
        
                var h = "<table class='fullWidth'><thead><tr>";
                for (var i = 0; i < colsLength; i++) {
                    h += "<th>" + keys[i] + "</th>";
                }
                h += "</tr></thead></table>"
                $(tbl).html(h);
        
                var trCls = "odd";
                for (var y = 0; y < d.length; y++) {
        
                    h = "<tr class='" + trCls + "'>";
                    if (trCls == "odd") trCls = "even"; else trCls = "odd";
        
                    for (var x = 0; x < colsLength; x++) {
                        var info = d[y];
                        var val = info[keys[x]];
                        var new_val = $('<div/>').text(val).html();
                        h += "<td>" + new_val + "</td>";
                    }
                    h += "</tr>";
                    $(tbl + " table").append(h);
                }
            }
        );
    });
    
    $(document).on("click", "#btnSave", saveSqlCommand);
    
    $(window).bind('keydown', function (e) {
        var isCtrlS = (e.ctrlKey && e.which == 83);
        if (isCtrlS) {
            saveSqlCommand();
            e.preventDefault();
            return false;
        }
    });
    
    function getTemplate(callBack) {
        $("#modalAdd").remove();
        $(".container-fluid.page").append( new _tw().bsModalBox( modalTemplate).html() );
        $modal = $("#modalAdd");
        $is_procedure = $modal.find('#is_procedure');
        $id = $modal.find('#sqlcmd_id');
        $code = $modal.find('#sqlcmd_code');
        $is_public = $modal.find('#is_public');
        $modal.find("#frm").append('<pre id="editor"></pre>');
        if (typeof callBack === "function") callBack();
    }
    
    function initAceEditor(readonly) {
        var options = {
            enableBasicAutocompletion: true,
            enableSnippets: true,
            enableLiveAutocompletion: false,
            maxLines: Infinity,
            fontSize: "10pt"
        };
        editor=null;
        ace.require("ace/ext/language_tools");
        editor = ace.edit("editor");
        editor.setTheme("ace/theme/monokai");
        editor.session.setMode("ace/mode/sql");
        editor.setAutoScrollEditorIntoView(true);
        
        if (readonly) {
            options.readOnly = true;
            options.highlightActiveLine = false;
            options.highlightGutterLine = false;
            editor.renderer.$cursorLayer.element.style.opacity = 0;
        }
        
        editor.setOptions(options);
    }
    
    function saveSqlCommand() {
        var _sqlcmd_id = $id.val();
        var _sqlcmd_code = $code.val();
        var _sqlcmd_text = editor.getValue();
        var _is_public = $is_public.val();
        
        if (_sqlcmd_code === "") { alert("Please enter code"); return }
        if (_sqlcmd_text === "") { alert("Please enter sql statement."); return }
        
        /*$.post(procURL + "sql_commands_upd @sqlcmd_id="+_sqlcmd_id+",@sqlcmd_code='"+_sqlcmd_code+"'"+($is_procedure.val() === 'N' ? ",@sqlcmd_text='"+_sqlcmd_text: "") + ",@is_public='"+_is_public+"'", function(d) {
            zsi.form.showAlert("savedWindow");
            displaySqlCommands();
        });*/
        
        $.post(procURL + "sql_commands_upd @sqlcmd_id="+_sqlcmd_id+",@sqlcmd_code='"+_sqlcmd_code+"',@sqlcmd_text='"+_sqlcmd_text+",@is_public='"+_is_public+"'", function(d) {
            zsi.form.showAlert("savedWindow");
            displaySqlCommands();
        });
    }
    
    function displaySqlCommands() {
        $("#grid-SqlCommands").dataBind({
            url : procURL + 'sql_commands_sel'
            ,width: $(window).width() - 10
            ,height: $(window).height()- 100
            ,isPaging : true
            ,rowsPerPage : 100
            ,dataRows : [
                            { text : "Code" , width : 200 , style : "text-align:center;"
                                ,onRender: function(d) {
                                    return bs({ type : 'hidden' , name : 'sqlcmd_id' })
                                        +  bs({ type : 'input' , name : 'sqlcmd_code' , value : svn(d,'sqlcmd_code') });
                                }
                            }
                            ,{ text : "Text" , width : 300 , style : "text-align:left;" ,name : 'sqlcmd_text'  }
                            ,{ text : "Is Proc?" , width : 80 , style : "text-align:left;" ,name : 'is_procedure' }
                            ,{ text : "Is Public?" , width : 80 , style : "text-align:left;" ,name : 'is_public' }
                            ,{ text : "Action" , width : 80 , style : "text-align:center;"
                                ,onRender : function(d) {
                                    return '<a href="#" class="edit-sqlcommand"><i class="fas fa-edit"></i></a>';
                                }
                            }
                        ]
            ,onComplete : function(d) {
                this
                .off('click','.edit-sqlcommand')
                .on('click','.edit-sqlcommand', function() {
                    var _rowInfo = d.data.rows[$(this).closest('.zRow').index()];
                    
                    getTemplate(function() {
                        $modal.modal('show');
                        
                        $is_procedure.val(_rowInfo.is_procedure);
                        $id.val(_rowInfo.sqlcmd_id);
                        $code.val(_rowInfo.sqlcmd_code);
                        $is_public.val(_rowInfo.is_public);
                        
                        $modal.find("#editor").empty();
                        $modal.find("#editor").html($('<div/>').text(_rowInfo.sqlcmd_text).html());
                        
                        initAceEditor((_rowInfo.is_procedure === 'N' ? false : true));
                    });
                });
            }
        });
    }
});   