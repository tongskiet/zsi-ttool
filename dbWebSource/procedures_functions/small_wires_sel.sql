CREATE procedure [dbo].[small_wires_sel] (
  @wg_upper_limit decimal(4,2)=.5
 ,@wg_lower_limit decimal(4,2)=.2
)
AS
BEGIN
SET NOCOUNT ON
   DECLARE @stmt nvarchar(4000)
   SELECT distinct CONVERT(DECIMAL(4,2),wire_gauge) WIRE_GAUGE FROM dbo.cutsheets_v WHERE wire_gauge between @wg_lower_limit and @wg_upper_limit; 
END



