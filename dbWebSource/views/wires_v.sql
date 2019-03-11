
CREATE VIEW [dbo].[wires_v]
AS
SELECT        dbo.projects_v.region_name, lear_bms03.dbo.cutsheets.PROJECT_ID, lear_bms03.dbo.cutsheets.PROJECT_NAME, lear_bms03.dbo.cutsheets.OEM_ID, lear_bms03.dbo.cutsheets.LINE_NO, 
                         lear_bms03.dbo.cutsheets.HARNESS_NAME, lear_bms03.dbo.cutsheets.DEVICE_NAME, lear_bms03.dbo.cutsheets.TO_DEVICE_NAME, lear_bms03.dbo.cutsheets.GSYSTEM, lear_bms03.dbo.cutsheets.GSUBSYSTEM, 
                         lear_bms03.dbo.cutsheets.GDEVICE, lear_bms03.dbo.cutsheets.TO_GSYSTEM, lear_bms03.dbo.cutsheets.TO_GSUBSYSTEM, lear_bms03.dbo.cutsheets.TO_GDEVICE, lear_bms03.dbo.cutsheets.CIRCUIT_NAME, 
                         lear_bms03.dbo.cutsheets.GROUND_CIRCUIT, lear_bms03.dbo.cutsheets.COLOR, lear_bms03.dbo.cutsheets.WIRE_TYPE, lear_bms03.dbo.cutsheets.WIRE_GAUGE, lear_bms03.dbo.cutsheets.OEM_STANDARD, 
                         lear_bms03.dbo.cutsheets.WIRE_LENGTH, lear_bms03.dbo.cutsheets.OPTION_CODE, lear_bms03.dbo.cutsheets.WIRE_FUNCTION, lear_bms03.dbo.cutsheets.CIRCUIT_SUBSYSTEM, 
                         lear_bms03.dbo.cutsheets.INTEGRATED_FUNCTIONS, lear_bms03.dbo.cutsheets.CONTROLLING_MODULES, lear_bms03.dbo.cutsheets.TWISTED_WIRES, lear_bms03.dbo.cutsheets.INHOUSE_SHIELDED_CABLES, 
                         lear_bms03.dbo.cutsheets.TWIST_NAME, lear_bms03.dbo.cutsheets.IMAGE_NAME, lear_bms03.dbo.cutsheets.INLINE_TO, lear_bms03.dbo.cutsheets.CTSGFR_CODE, lear_bms03.dbo.cutsheets.CTSGFRCODE_SUFFIX, 
                         lear_bms03.dbo.cutsheets.PINOUT, lear_bms03.dbo.cutsheets.CLASSIFICATION, lear_bms03.dbo.cutsheets.INLINE_CONN_COLOR, lear_bms03.dbo.cutsheets.INLINE_CONN_CAVITIES, 
                         lear_bms03.dbo.cutsheets.INLINE_CONN_DESIGN_OPPORTUNITY, lear_bms03.dbo.cutsheets.INLINE_CONNECTION_FIXING_METHOD, lear_bms03.dbo.cutsheets.GENDER, lear_bms03.dbo.cutsheets.FAKRA_ORIENTATION, 
                         lear_bms03.dbo.cutsheets.CONNECTOR_SEALING, lear_bms03.dbo.cutsheets.SEAL, lear_bms03.dbo.cutsheets.SEALING_CONFIGURATION, lear_bms03.dbo.cutsheets.CONNECTOR_TYPES, 
                         lear_bms03.dbo.cutsheets.NO_OF_CAVITIES, lear_bms03.dbo.cutsheets.TPA, lear_bms03.dbo.cutsheets.CPA, lear_bms03.dbo.cutsheets.ENGAGEMENT_METHOD, lear_bms03.dbo.cutsheets.GREASE_ON_CONNECTOR, 
                         lear_bms03.dbo.cutsheets.TPA_METHOD, lear_bms03.dbo.cutsheets.SHORTING_BAR_ON_CONNECTOR, lear_bms03.dbo.cutsheets.STRAIN_RELIEF_METHOD, lear_bms03.dbo.cutsheets.SPECIAL_CONNECTORS, 
                         lear_bms03.dbo.cutsheets.CONNECTOR_PART_NUMBER, lear_bms03.dbo.cutsheets.CONNECTOR_SUPPLIER, lear_bms03.dbo.cutsheets.MALE, lear_bms03.dbo.cutsheets.FEMALE, 
                         lear_bms03.dbo.cutsheets.TERMINAL_TAB_SIZE_BY_CONNECTOR, lear_bms03.dbo.cutsheets.RING_EYELET_TYPE, lear_bms03.dbo.cutsheets.RING_EYELET_SEALING, lear_bms03.dbo.cutsheets.BOOT_COVERING, 
                         lear_bms03.dbo.cutsheets.BATTERY_LUG, lear_bms03.dbo.cutsheets.CRIMPED_METHOD, lear_bms03.dbo.cutsheets.FIXATION, lear_bms03.dbo.cutsheets.ANTI_ROTATIONAL_EYELET, lear_bms03.dbo.cutsheets.HOLE_SIZE, 
                         lear_bms03.dbo.cutsheets.OUTER_DIAMETER, lear_bms03.dbo.cutsheets.LTYPE, lear_bms03.dbo.cutsheets.CASE_GROUND_MODULE, lear_bms03.dbo.cutsheets.PLATING, lear_bms03.dbo.cutsheets.PRIMARY_LOCKING, 
                         lear_bms03.dbo.cutsheets.SYMMETRICAL_DESIGN, lear_bms03.dbo.cutsheets.TERMINAL_PART_NUMBER, lear_bms03.dbo.cutsheets.TERMINAL_SUPPLIER, lear_bms03.dbo.cutsheets.SEALING, 
                         lear_bms03.dbo.cutsheets.SPLICE_METHOD, lear_bms03.dbo.cutsheets.COVERING, lear_bms03.dbo.cutsheets.SPLICE_CONFIGURATION, lear_bms03.dbo.cutsheets.INTERIOR, lear_bms03.dbo.cutsheets.EXTERIOR, 
                         lear_bms03.dbo.cutsheets.TO_IMAGE_NAME, lear_bms03.dbo.cutsheets.TO_INLINE_TO, lear_bms03.dbo.cutsheets.TO_CTSGFR_CODE, lear_bms03.dbo.cutsheets.TO_CTSGFRCODE_SUFFIX, 
                         lear_bms03.d