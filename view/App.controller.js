jQuery.sap.require("zmclaren.prd.util.TaktClock");
sap.ui.core.mvc.Controller.extend("zmclaren.prd.view.App", {
	
	onInit : function(){
//	var oEventBus = sap.ui.getCore().getEventBus();
//	oEventBus.subscribe("App","RemoveListener",this.onRemoveActionHandler,this);
	},
	 onRemoveActionHandler:function(){
    		/*global zmclaren*/
		 zmclaren.prd.util.TaktClock.onRemoveActionHandler();	
    }
});