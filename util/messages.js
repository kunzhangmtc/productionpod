jQuery.sap.declare("zmclaren.util.messages");
jQuery.sap.require("sap.ca.ui.message.message");
jQuery.sap.require("zmclaren.prd.MyRouter");
/*global zmclaren */

zmclaren.util.messages = {
	
	/**
	 * Show an error dialog with information from the oData response object.
	 **/
	showErrorMessage : function(oError) {
		var errCode;
		var errMessage;
		var errDetails;
		
		// if (oError.response && oError.response.body !== "" && (oError.response.statusCode === "400" || oError.response.statusCode === "500")) {
		// 	var oMessage = JSON.parse(oError.response.body);
		// 	sMessage = oMessage.error.message.value;
		// }
		// if (sMessage === "") {
		// 	sMessage = oError.message;
		// 	sDetails = oError.response.body;
		// }
				
		try{
			if(oError.status === "error"){
				errCode = oError.statusCode;
				errMessage = oError.error;
				errDetails = oError.message;
			}
			else if (oError.status){
				errCode = oError.status;
				errMessage = oError.responseJSON.error.message.value;
				errDetails = oError.statusText;
			}
			else if (oError.statusCode && oError.statusText && oError.message)
			{
				errMessage = oError.statusCode + " " + oError.message;
				errDetails = oError.statusText;
			}
			else{
				errCode = oError.response.statusCode;
				var oMessage = JSON.parse(oError.response.body);
				errMessage = oMessage.error.message.value;
				errDetails = oError.response.body;
			}

			var oMsgBox = sap.ca.ui.message.showMessageBox({
				type: sap.ca.ui.message.Type.ERROR,
				message: errMessage,
				details: errDetails
			});	
		}
		catch(oError){
			location.reload();	
		}
		
		// if(errCode == "503"){
		// 	this.getRouter().navTo("home", {});
		// 	location.reload();
		// }

		if (!sap.ui.Device.support.touch) {
			oMsgBox.addStyleClass("sapUiSizeCompact");
		}
		
	},
	
	getRouter: function() {
		return sap.ui.core.UIComponent.getRouterFor(this);
	}
};