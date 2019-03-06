 $(document).ready(function(){
     _tw = new zsi.easyJsTemplateWriter(".output")
            .bsFormGroup({id:"group1"}) 
                .bsInput({name:"first_name",type:"text"},"#group1")
                .bsInput({name:"last_name",type:"text"})
                .bsFormGroup({id:"group2"})
                    .li({id:"myli1" ,class:"my-class",value:"my li value"})
                    .in()
                    .div({id:"div1", value:"div-smager1"})
                    .div({id:"div2", value:"div-smager2"})
                        .in()
                        .div({id:"div21", value:"div-smager21"})
                            .in()
                            .div({id:"div211", value:"div-smager211"})
                            .div({id:"div212", value:"div-smager212"})
                        .out()
                        .div({id:"divout1", value:"div-divout1"})
                        .div({id:"divout2", value:"div-divout2"})
                        .in()
                        .custom(function(){
                            //you can add if statement here:
                             return this.div({id:"customGroup1"})
                                        .in()
                                        .div({id:"divCustom1", value:"div-divCustom1"})
                                        .div({id:"divCustom2", value:"div-divCustom2"});
                        })
                        .out()
                        .div({id:"divxx1", value:"div-xx1"})
                    .bsInput({name:"middle_name",type:"text"},"#group2")
                    .bsInput({name:"address",type:"text"})
                    .bsInput({name:"email",type:"text"})
                    .bsLabelInput({name:"my_date", labelText:"My Label", labelSize:"col-xs-2", divSize : "col-xs-3", placeHolder:"mm/dd/yyyy", type:"text"})
            .bsFormGroup({id:"group3"},".output")
            .bsInput({name:"test1",type:"text"})
            .bsInput({name:"test2",type:"text"})
            .smagerDiv({id:"id123",class:"other-class",value:"This is from local Templates",style:"background-color: blue;color: #fff;width: 171px;"})
            .bsModalBox({id:"modal1",title:"title 1", body:"body 1", footer:"footer 1"},"body")
            
    ;
    
 });
            