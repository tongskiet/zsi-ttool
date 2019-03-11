CREATE PROCEDURE [dbo].[page_data_sel] 
(
   @user_id	   int
  ,@page_name  varchar(50)
  ,@is_public  char(1) = 'N'
)

AS
BEGIN
    declare 
		 @page_id int
		,@page_title varchar(100)
		,@pt_id int
		,@pt_content varchar(max)
		,@page_js_rev_no int
		,@zsi_lib_rev_no int
		,@app_start_js_rev_no int
		,@master_page_name varchar(50)
		,@db_is_public char(1);

	select 
		 @pt_content=pt.pt_content
		,@pt_id=pt.pt_id
		,@page_id=p.page_id
		,@page_title=p.page_title 
		,@master_page_name = p.master_page_name	
		,@db_is_public =p.is_public
	from dbo.pages_v p 
	left join dbo.page_templates pt on pt.page_id = p.page_id
	where lower(p.page_name) =lower(@page_name)

	if(@db_is_public='N' AND @is_public ='Y') 
	BEGIN
		 SET @page_id=0;
	END

	--get latest revision no. of Page js
	select @page_js_rev_no=js.rev_no from dbo.pages p inner join dbo.javascripts js on js.page_id = p.page_id
	 where lower(p.page_name) =lower(@page_name)


	--get latest revision no. of zsi_lib js
	 select @zsi_lib_rev_no=js.rev_no from dbo.javascripts js inner join dbo.pages p on js.page_id=p.page_id
	 where lower(p.page_name) = 'zsilib'

	--get latest revision no. of app_start js
	 select @app_start_js_rev_no=js.rev_no from dbo.javascripts js inner join dbo.pages p on js.page_id=p.page_id
	 where lower(p.page_name) = 'appstart'

	 
	--display result
	select	 @page_id as page_id
			,@page_title as page_title
			,@pt_id as pt_id
			,isnull(@pt_content,'') as pt_content
			,isnull(@page_js_rev_no,0) as page_js_rev_no 
			,isnull(@zsi_lib_rev_no,0) as zsi_lib_rev_no 
			,isnull(@app_start_js_rev_no,0) as app_start_js_rev_no
			,isnull(@master_page_name,'') as master_page_name
			,dbo.getUserRole(@user_id) as role		
END

 

 


