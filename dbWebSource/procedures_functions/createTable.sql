CREATE PROCEDURE [dbo].[createTable] 
    @id int
AS
BEGIN  
   SET NOCOUNT ON;

   DECLARE @create_table_stmt NVARCHAR(max) = '';
   DECLARE @create_tt_stmt NVARCHAR(max) = '';
   DECLARE @drop_tt_stmt NVARCHAR(max) = '';
   DECLARE @drop_stmt NVARCHAR(max) = '';
   DECLARE @drop_sel_stmt NVARCHAR(max) = '';
   DECLARE @drop_upd_stmt NVARCHAR(max) = '';
   DECLARE @create_proc_stmt NVARCHAR(max) = '';
   DECLARE @create_sel_proc_stmt NVARCHAR(max) = '';
   DECLARE @update_stmt NVARCHAR(max) = '';
   DECLARE @update_fr_stmt NVARCHAR(max) = '';
   DECLARE @update_set_stmt NVARCHAR(max) = '';
   DECLARE @update_and_stmt NVARCHAR(max) = '';
   DECLARE @insert_stmt NVARCHAR(max) = '';
   DECLARE @insert_col_stmt NVARCHAR(max) = '';
   DECLARE @where_stmt NVARCHAR(max) = '';
   DECLARE @and_ins_stmt NVARCHAR(max) = '';
   DECLARE @tableLayoutColId INT;
   DECLARE @count        VARCHAR(100);
   DECLARE @table_name   VARCHAR(100);
   DECLARE @colName      VARCHAR(50);
   DECLARE @isIdentity   VARCHAR(1);
   DECLARE @colDataType  VARCHAR(20);
   DECLARE @size         VARCHAR(20);
   DECLARE @isNullable   VARCHAR(1); 
   DECLARE @isNull       VARCHAR(10);  
   DECLARE @colIdentity  VARCHAR(20); 
   DECLARE @TypeIdentity VARCHAR(20)=''; 
   DECLARE @comma        VARCHAR(1) = '';
   DECLARE @or           VARCHAR(4) = '';
   DECLARE @NewLineChar AS CHAR(2) = CHAR(13) + CHAR(10)

   DECLARE @tblCol TABLE (
       tableLayoutColId INT
      ,colName     VARCHAR(50)
 	  ,isIdentity  VARCHAR(1)
	  ,colDataType VARCHAR(20)
	  ,colSize     VARCHAR(20)
	  ,isNullable  VARCHAR(1)
	  ,seqNo       INT     
	  
   )

   SELECT @table_name = tableName FROM dbo.table_layout where tableLayoutId = @id;
   
   INSERT INTO @tblCol (tableLayoutColId, colName, isIdentity, colDataType, colSize, isNullable, seqNo) 
      SELECT tableLayoutColId, name, isIdentity, colDataType, colSize, isNullable, seqNo FROM dbo.table_layout_cols WHERE tableLayoutId = @id AND isnull(width,0) <> 0  order by seqNo;

    SELECT @count = count(*) FROM @tblCol;

   SET @create_table_stmt = 'CREATE TABLE dbo.' + @table_name + ' ('
                     + @NewLineChar + 'created_by int NULL, '
                     + @NewLineChar + 'created_date datetime NULL,'
                     + @NewLineChar + 'updated_by int NULL, '
                     + @NewLineChar + 'updated_date datetime NULL, ';

   SET @create_tt_stmt = 'CREATE TYPE dbo.' + @table_name + '_tt AS TABLE (';
   SET @create_sel_proc_stmt = 'CREATE PROCEDURE dbo.' + @table_name + '_sel AS '
                              + @NewLineChar + 'BEGIN'
							  + @NewLineChar + 'SELECT * FROM ' + @table_name
							  + @NewLineChar + 'END'
   
   SET @create_proc_stmt = 'CREATE PROCEDURE dbo.' + @table_name + '_upd ' 
       + @NewLineChar + '(@tt ' +   @table_name + '_tt READONLY, @user_id INT) '
	   + @NewLineChar + ' AS' 
	   + @NewLineChar + 'SET NOCOUNT ON '

   SET @update_stmt = 'UPDATE a SET updated_by=dbo.getUserId(),updated_date = GETDATE()' 
   SET @insert_stmt = ' INSERT INTO ' + @table_name + '(created_by,created_date ';
       
    WHILE @count > 0
	   BEGIN
	       SELECT TOP 1  @tableLayoutColId = tableLayoutColId
		                ,@colName     = colName    
			    		,@isIdentity = isIdentity 
					    ,@colDataType= colDataType
					    ,@isNullable = isNullable 
						,@size       = colSize
                    FROM @tblCol order by seqNo;

		   IF @isNullable = 'Y'
		      SET @isNull = ' NULL ';
           ELSE
	          SET @isNull = ' NOT NULL ';
				 

           IF @isIdentity = 'Y' 
			   BEGIN
				  SET @colIdentity = @colName 
				  SET @size = ''
				  SET @TypeIdentity = ' IDENTITY(1,1) '
				  SET @isNull = ' NOT NULL ';
				  SET @update_fr_stmt = @update_fr_stmt + @NewLineChar + ' FROM ' + @table_name + ' a INNER JOIN @tt b  ON 
				      a. ' + @colName + ' = b.' + @colName + ' AND ( '
                  SET @where_stmt = @colName + ' IS NULL ';
			   END;
		   ELSE
			   BEGIN
			      SET @update_set_stmt = @update_set_stmt +  @NewLineChar + ',a.' + @colName + ' = b.' + @colName  
				  IF @colDataType = 'INT' OR @colDataType = 'DECIMAL' OR @colDataType='BIGINT'
				      SET @update_and_stmt = @update_and_stmt + @NewLineChar + + @or +' isnull(a.' + @colName + ',0) = isnull(b.' + @colName + ',0)'
                  ELSE
				     SET @update_and_stmt = @update_and_stmt + @NewLineChar + + @or +' isnull(a.' + @colName + ','''') = isnull(b.' + @colName + ','''')'

				  SET @insert_col_stmt = @insert_col_stmt + @NewLineChar + ',' + @colName
				  SET @or = ' OR ' 
			      SET @TypeIdentity = ''
				  IF ISNULL(@size,'') <> ''
					 SET @size = '(' + @size + ')';
				  ELSE 
					 SET @size = ''; 
                  
				  IF isnull(@isNullable,'N') = 'N'
                     SET @and_ins_stmt = ' AND ' + @colName + ' IS ' + @isNull
			   END
	       IF @colDataType = 'INT' OR @colDataType = 'BIGINT' 
		      SET @size='';
			  
		   SET @create_table_stmt = @create_table_stmt  + @comma + @colName + ' ' + @colDataType + @size + @TypeIdentity + @isNull 
		   SET @create_tt_stmt = @create_tt_stmt  + @comma + @colName + ' ' + @colDataType + @size + ' NULL';
		   SET @comma = ',' 
		   
		   
		   DELETE FROM @tblCol WHERE tableLayoutColId = @tableLayoutColId;
		   SET @count = @count -1;
        END; 

		IF @colIdentity IS NOT NULL
		     SET @create_table_stmt = @create_table_stmt + ' CONSTRAINT pk_' + @table_name + ' PRIMARY KEY CLUSTERED ( ' + @colIdentity  + ' ASC )'
                     + ' WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY] ) ON [PRIMARY];';
        

	    SET @create_tt_stmt =  @create_tt_stmt + ')';
		SET @update_stmt =    + @update_stmt 
							  + @update_set_stmt
							  + @update_fr_stmt
							  + @update_and_stmt + ')';

        
        SET @insert_stmt = @insert_stmt + @insert_col_stmt
		                  + ') SELECT dbo.getUserId(),GETDATE() ' + @insert_col_stmt 
						  + ' FROM @tt WHERE ' + @NewLineChar + @where_stmt + @NewLineChar + @and_ins_stmt; 

  
   SET @drop_stmt = 'DROP TABLE ' +  @table_name;
   SET @drop_upd_stmt = 'DROP PROCEDURE ' +  @table_name + '_upd ';
   SET @drop_sel_stmt = 'DROP PROCEDURE ' +  @table_name + '_sel ';
   SET @drop_tt_stmt = 'DROP TYPE ' +  @table_name + '_tt ';
   
   
   SET @create_proc_stmt=@create_proc_stmt + @NewLineChar + @update_stmt + @NewLineChar + @NewLineChar + @insert_stmt
	    
  IF NOT EXISTS (SELECT * FROM sys.objects WHERE type = 'U' AND name = @table_name)
	  BEGIN
		EXEC (@create_table_stmt);
		EXEC (@create_tt_stmt);
		EXEC (@create_proc_stmt);
	  END
  ELSE
	  BEGIN
		EXEC (@drop_stmt);
		EXEC (@drop_upd_stmt);
		EXEC (@drop_sel_stmt);
		EXEC (@drop_tt_stmt);
		EXEC (@create_table_stmt);
		EXEC (@create_tt_stmt);
		EXEC (@create_proc_stmt);
		EXEC (@create_sel_proc_stmt);
	  END

END
    
    
	   
	   
	   

	
	




