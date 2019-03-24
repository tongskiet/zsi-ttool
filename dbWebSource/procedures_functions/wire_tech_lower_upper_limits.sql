CREATE PROCEDURE [dbo].[wire_tech_lower_upper_limits] (
  @model_year		int=null
 ,@region_id		int=null
 ,@oem_id			int=null
 ,@vehicle_type_id	int=null
 ,@wire_gauge       nvarchar(1000)=null
)
AS
BEGIN
SET NOCOUNT ON
DECLARE @stmt  NVARCHAR(MAX)
DECLARE @stmt2 NVARCHAR(MAX)

CREATE TABLE #tbl_wire_gauge (
  wire_gauge DECIMAL(8,3)
)

CREATE TABLE #tbl_result (
  wire_gauge DECIMAL(8,3)
 ,wire_type  NVARCHAR(50)
 ,wire_ll    DECIMAL(18,10) 
 ,wire_ul    DECIMAL(18,10)
 ,no_wires   INT
 ,ttl_weight DECIMAL(18,10)
 ,avg_weight DECIMAL(18,10)
)

IF ISNULL(@wire_gauge,'') <> ''
   INSERT INTO #tbl_wire_gauge SELECT data FROM dbo.split(@wire_gauge,',') 

SET @stmt = ' SELECT OEM_NAME, MODEL_YEAR, WIRE_GAUGE, WIRE_TYPE, WIRE_LENGTH, CABLE_WEIGHT, CAST(CABLE_WEIGHT AS DECIMAL(30,25))/CAST(WIRE_LENGTH AS DECIMAL(30,25)) QWEIGHT ' +
			' FROM dbo.cutsheets_v '+
			' WHERE ISNULL(SPECIAL_WIRE_COMPONENT_ASSEMBLIES,'''')='''' '+
			' AND WIRE_TYPE <> ''DRAIN WIRE'' '+
			' AND CONDUCTOR_TYPE=''BARE COPPER'' '+
			' AND ISNULL(WIRE_GAUGE,'''')<>'''' '+
			' AND (ISNULL(CABLE_WEIGHT,'''')<>'''' OR ISNULL(WIRE_LENGTH,'''')<>'''') ' +
			' AND (ISNUMERIC(CABLE_WEIGHT)=1 AND ISNUMERIC(WIRE_LENGTH)=1) ' + 
			' AND (CAST(WIRE_LENGTH AS decimal(18,10))<>0) '

	IF ISNULL(@model_year,0) <> 0
		SET @stmt = @stmt + ' AND MODEL_YEAR = ' + CAST(@model_year AS VARCHAR(20))

	IF ISNULL(@region_id,0) <> 0
		SET @stmt = @stmt + ' AND region_id = ' + CAST(@region_id AS VARCHAR(20))

	IF ISNULL(@oem_id,0) <> 0
		SET @stmt = @stmt + ' AND oem_id = ' + CAST(@oem_id AS VARCHAR(20))

	IF ISNULL(@vehicle_type_id,0) <> 0
		SET @stmt = @stmt + ' AND vehicle_type_id = ' + CAST(@vehicle_type_id AS VARCHAR(20))

	IF ISNULL(@wire_gauge,'') <> ''
		SET @stmt = @stmt + ' AND wire_gauge IN (SELECT wire_gauge FROM #tbl_wire_gauge) '  

SET @stmt = 'SELECT WIRE_GAUGE, WIRE_TYPE, MIN(CABLE_WEIGHT) ll, MAX(CABLE_WEIGHT) ul, COUNT(wire_gauge) no_cables, sum(cast(CABLE_WEIGHT as DECIMAL(18,10))) ttl_weight, AVG(QWEIGHT) AVG_WEIGHT FROM (' + @stmt +
            ' ) X GROUP BY WIRE_GAUGE, WIRE_TYPE  '
INSERT INTO #tbl_result EXEC(@stmt);

UPDATE a SET wire_ll = min_ll
            ,wire_ul=max_ul 
      FROM #tbl_result a
	  INNER JOIN (select min(wire_ll) min_ll, max(wire_ul) max_ul, wire_gauge FROM #tbl_result GROUP BY wire_gauge) b ON a.wire_gauge = b.wire_gauge;

SELECT * FROM #tbl_result ORDER BY wire_gauge, wire_type

DROP TABLE #tbl_wire_gauge;
DROP TABLE #tbl_result;
END

--[wire_tech_lower_upper_limits] @model_year=2017,@wire_gauge='.5'

