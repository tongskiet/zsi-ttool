var imgToBase64 = function (url, callback) {
        if (!window.FileReader) {
            callback(null);
            return;
        }
        var xhr = new XMLHttpRequest();
        xhr.responseType = 'blob';
        xhr.onload = function() {
            var reader = new FileReader();
            reader.onloadend = function() {
                callback(reader.result.replace('text/xml', 'image/jpeg'));
            };
            reader.readAsDataURL(xhr.response);
        };
        xhr.open('GET', url);
        xhr.send();
};    

var setBoxColor = function(doc,r,g,b){
            doc.setDrawColor(186, 184, 184);
            doc.setFillColor(r,g,b);
};

zsi.generatePdfReport = function(o){
    var __imgData = null
    ,totalPagesExp = "{total_pages_count_string}"
    ,getData = function(imgData){
        __imgData = imgData;
        if(o.data) 
            createReport(o.data);
        else 
            $.post(execURL + o.sqlParameter,createReport);   
        
    }
    ,createReport = function(dbData){
        //var doc = new jsPDF();
        //var doc = new jsPDF('p', 'mm', [335, 210]);   
        var doc = new jsPDF("p", "pt", "A4");
        var pageContent = function (data) {
                // HEADER
                doc.setFontSize(14);
                doc.setTextColor(40);
                doc.setFontStyle('normal');
            
                if(data.pageCount === 1){
                   var extraHeight = 65;
                    if (__imgData) {
                        doc.addImage(__imgData, 'JPEG', data.settings.margin.left,  data.settings.margin.top - extraHeight, 50, 50);
                    }
                    doc.text(o.reportTitle, data.settings.margin.left, data.settings.margin.top - 5);
                    data.settings.margin.top -= extraHeight;
                }
                
                // FOOTER
                var str = "Page " + data.pageCount;
                if (typeof doc.putTotalPages === 'function') {
                    str = str + " of " + totalPagesExp;
                }
                doc.setFontSize(10);
                doc.text(str, data.settings.margin.left, doc.internal.pageSize.height - 30);
        };
        
     
        doc.autoTable(
                      o.columnData
                    , dbData.rows
                    ,{
                        //tableLineWidth : 0.75
                        //showHeader:"firstPage"
                         tableWidth: 'wrap'
                        ,margin: {top: 85,left:20,right:20,bottom:30}
                        ,styles: {
                            font: 'courier'
                            ,fontSize: 8
                            ,lineWidth: 0.25
                            ,cellPadding: 3
                        }
                        ,addPageContent: pageContent
                    }
        
            );
         if (typeof doc.putTotalPages === 'function') {
            doc.putTotalPages(totalPagesExp);
        }
           
         
        if(o.isDisplay)
            document.getElementById("ifrmWindow").src = doc.output('datauristring');
        else 
            doc.save(o.reportTitle + '.pdf');
        
        }
        
    imgToBase64(o.logoURL, getData);
};       
zsi.createPdfReport = function(o){
    if( isUD(o.detailData) ) {
        if( ! isUD(o.columnHeader) ) o.masterColumn = o.columnHeader;
        if( ! isUD(o.data) ) o.masterData = o.data;

    }
     if( isUD(o.masterColumnStyle) ) o.masterColumnStyle = "table";
    
    if( isUD(o.fontSize) ) o.fontSize = 10;
        
    var  rowHeight      = o.rowHeight
        ,cml            = o.cellMargin.left //cell margin left
        ,mt             = 11 //minus top
        ,doc            = new jsPDF("p", "pt", "A4")
        ,left           = o.margin.left
        ,row            = o.margin.top
        ,h1             = o.masterColumn //header 1
        ,i              = 0
        ,pageNo         = 1
        ,totalPagesExp  = "{total_pages}"
        ,checkAddPage=  function(cr){
            if(cr > o.pageHeightLimit){
                pageNo+=1;
                doc.addPage();
                setFooterText(pageNo);
                cr = o.margin.top;
            }
            return cr;    
        }
        ,setFooterText=  function(pageNo){
                doc.text( o.margin.left-5, o.pageHeightLimit + o.rowHeight,  "Page " + pageNo + " of " + totalPagesExp);
        }
 
    ;
    
    if( ! isUD(o.onInit) ) {
         doc =  o.onInit();
    }
    
    if( ! isUD(o.onPrintHeader) ) {
        var r = o.onPrintHeader({ doc:doc, row:row, margin : o.margin});
        row = r.row;
    }
    doc.setFontSize(o.fontSize);
    setFooterText(pageNo);

    //check if detailData has no data, then print header columns
    if( isUD(o.detailData) ) {
        for(var x=0;x<h1.length;x++){
            h1[x].left = left;
            //print box
            setBoxColor(doc,138, 191, 252);
            doc.rect(left, row-mt, h1[x].width,rowHeight, 'FD'); 
            //print title 
            doc.text(left + cml, row, h1[x].title);
            left +=h1[x].width;
        }
        row +=rowHeight;
    }

    //print master  data
    var md = o.masterData;
    for(var y=0;y<md.length;y++){

       if( ! isUD(o.onMasterDataPrint) ){ 
            row=o.onMasterDataPrint({index:y,row:row,data:md[y],doc:doc,checkAddPage:checkAddPage});
       }
       else{    
            if(y>0) row +=rowHeight;
            left = o.margin.left;
            for(i=0;i<h1.length;i++){
                if( isUD(o.detailData)  ){    
                    row = checkAddPage(row);
                    if( y % 2 === 0  ) 
                        setBoxColor(doc,255, 255, 255); 
                    else 
                        setBoxColor(doc,207, 226, 247);
                    doc.rect(h1[i].left, row-mt, h1[i].width,rowHeight, 'FD');    
                    //print text
                    doc.text(h1[i].left  + cml, row, md[ y ][ h1[i].name ] + "");
                }
                else{//if detail data is NOT empty
                    if(o.masterColumnStyle !== "form"){
                        row = checkAddPage(row);
                        //print box
                        setBoxColor(doc,138, 191, 252);
                        doc.rect(left, row-mt, h1[i].width,rowHeight, 'FD'); 
                        //print title 
                        doc.text(left + cml, row, h1[i].title);

                        setBoxColor(doc,255, 255, 255);
                        doc.rect(left, (row+rowHeight)-mt, h1[i].width,rowHeight, 'FD');    
                        //print text
                        doc.text(left  + cml, row+rowHeight, md[ y ][ h1[i].name ] + "");                        
                        
                        left +=h1[i].width;
                    }
                    else{
                        //this is for "form" - ColumnStyle
                        if(left > o.widthLimit){
                            left = o.margin.left;
                            row +=rowHeight + 5 ;
                        }
        
                        row = checkAddPage(row);
                        
                            
                        h1[i].left = left;
                    
                        //print box
                        setBoxColor(doc,255, 255, 255);
                        doc.rect(h1[i].left, row-mt, h1[i].titleWidth,rowHeight +  2, 'FD');    
                        //print text
                        doc.text(h1[i].left  + cml, row, h1[i].title);
                    
                        left += h1[i].titleWidth;
                        h1[i].left = left;
                        
                    
                        //print box
                        setBoxColor(doc,255, 255, 255);
                        doc.rect(h1[i].left, row-mt, h1[i].width,rowHeight + 2, 'FD');    
                        //print text
                        doc.text(h1[i].left  + cml, row,  md[ y ][ h1[i].name ] + "");
                        
                        // titleWidth
                        left += h1[i].width;
                    }
                }
            }
       
            if(o.masterColumnStyle==="table" && h1.length)  row +=rowHeight;
       }


        //print detail data or sub table
        var dLeft = 60;
        var h2    = o.detailColumn; //header2
        var dd    = o.detailData;
        var ndd   = []; //new detail data 
        
        if( ! isUD(dd) ){
            row +=5;
            for(i=0;i<dd.length;i++){
                 if(md[y][o.masterKey] === dd[i][o.masterKey]  )  ndd.push(dd[i]);
            }      
    
            if(ndd.length >0 ){ 
                row +=rowHeight;
                //print detail column header
                for(var dx=0;dx<h2.length;dx++){
                    h2[dx].left = dLeft;
                    row = checkAddPage(row);
                    //print box
                    setBoxColor(doc,198, 204, 211);
                    doc.rect(dLeft, row-10, h2[dx].width,rowHeight, 'FD'); 
                    //print title
                    doc.text(dLeft  + cml, row, h2[dx].title);
                    dLeft +=h2[dx].width;
                }
                
                //print detail data
                for(var dy=0;dy<ndd.length;dy++){
                    row +=rowHeight;
                    row = checkAddPage(row);
                
                    for(i=0;i<h2.length;i++){
                        //display box
                        setBoxColor(doc,255, 255, 255);
                        doc.rect(h2[i].left, row-mt, h2[i].width,rowHeight, 'FD'); 
                        //display text
                         doc.text(h2[i].left  + cml, row, ndd[ dy ][ h2[i].name ] + "");
                    }
                }        
            }
            row +=rowHeight;
        }//end of isUndefined
    }
    
    if (typeof doc.putTotalPages === 'function') {
        doc.putTotalPages(totalPagesExp);
    }

    if(o.isDisplay)
        document.getElementById("ifrmWindow").src = doc.output('datauristring');
    else 
        doc.save(o.fileName);

};    

                         