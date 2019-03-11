CREATE PROCEDURE [dbo].[select_options_sel]
(
               @code AS varchar(50)=null
              ,@param AS varchar(1000)=null
)
AS
BEGIN
	IF @code IS NULL 
		select * from  select_options order by code asc;
	ELSE
		BEGIN				
			DECLARE @stmt		VARCHAR(max);
			DECLARE @table		VARCHAR(max);
			DECLARE @value		VARCHAR(max);
			DECLARE @text		VARCHAR(max);
			DECLARE @condition	VARCHAR(max);
			DECLARE @order		VARCHAR(max);
			DECLARE @param2		VARCHAR(max);
  
			SELECT @table = table_name
				  ,@value = value
				  ,@text  = text
				  ,@condition = condition_text
				  ,@order = order_by
			FROM dbo.select_options
			WHERE code=@code;
   
   
			SET @stmt = 'SELECT ' + @value + ' as value, ' +  @text + ' as text FROM ' + @table + ' WHERE 1=1 ';
			IF @condition <> '' 
				SET @stmt = @stmt + ' AND '+ @condition;
   
			IF @param <> ''
			BEGIN
				SET @param2 =  replace(@param, ',' , ' AND ');
				SET @stmt = @stmt + ' AND ' + @param2 ;
			END
   
			IF @order <> ''
				SET @stmt = @stmt + ' ORDER BY ' + @order;
				--print(@stmt);
			exec(@stmt);
		END
 END;
