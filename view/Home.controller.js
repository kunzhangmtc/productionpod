jQuery.sap.require("zmclaren.prd.util.messages");

sap.ui.controller("zmclaren.prd.view.Home", { 

	/**
	 * Called when a controller is instantiated and its View controls (if available) are already created.
	 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
	 * @memberOf zmclaren.prd.view.Home
	 */
	onInit: function() {
		this._oView = this.getView();
		this._oComponent = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this._oView));
		this._oResourceBundle = this._oComponent.getModel("i18n").getResourceBundle();
		this._oRouter = this._oComponent.getRouter();
		var oModel =  new sap.ui.model.json.JSONModel();
		sap.ui.getCore().setModel(oModel, "Operators");
	},

	//Check for valid Work Centre and Number of Operators
	onWorkCentre : function(){
		// jQuery.sap.require("sap.m.MessageToast");
		// sap.m.MessageToast.show("WorkCentre");
		
		//Get Operators
		var sServiceUrl = this._oComponent.getMetadata().getConfig().serviceConfig.serviceUrl;
		var oModel =  new sap.ui.model.json.JSONModel();
		var workCentreInput = this.getView().byId("workcentreId");
		workCentreInput.setValue(workCentreInput.getValue().toUpperCase());
		if(workCentreInput.getValue().trim() !== "")
		{
			var that = this;
			$.ajax({  
			    url: sServiceUrl + "/WorkCentreCollection(PlantID='9000',WorkCentreID='" + workCentreInput.getValue() + "')",  
			    cache: false,
			    jsonpCallback: 'processJSON',  
			    dataType: 'json',  
			    success: function (oData) {  
			    	workCentreInput.setValueState("None");
					workCentreInput.setValueStateText("");
					// set the odata JSON as data of JSON model
					oModel.setData(oData);
					sap.ui.getCore().getModel("Operators").setProperty("/TotalOperators", oData.d.Operators);
					that.operatorsInput(oData.d.Operators);
					if(that._oView.byId("inOperator1").getEnabled())
					{
						that.oView.byId("inOperator1").focus();
					}
			    },  
			    error: function (oError) {
			    	workCentreInput.setValueState("Error");
					workCentreInput.setValueStateText("Please select a valid Work Centre!");
					that.getView().byId("SimpleFormOperators").setVisible(false);
			         // log error in browser  
			        console.log(oError.message);
			        if(oError.status != 404){
			        	zmclaren.prd.util.messages.showErrorMessage(oError);
			        }
			    }  
			});  	
		}
		else
		{
			workCentreInput.setValueState("Error");
			workCentreInput.setValueStateText("Please select a valid Work Centre!");
			this.getView().byId("SimpleFormOperators").setVisible(false);
			workCentreInput.focus();
		}
	},

	//Show Operators Input
	operatorsInput : function(nOperators){
		var oView = this.getView();
		oView.byId("SimpleFormOperators").setVisible(true);
		for (var i=1;i<=4;i++){
			if(i<=nOperators){
				oView.byId("inOperator"+i).setEnabled(true);
				oView.byId("inOperator"+i).setValue("");
			}
			else{
				oView.byId("inOperator"+i).setEnabled(false);
				oView.byId("inOperator"+i).setValue("");
			}
			oView.byId("inOperator"+i).setValueState("None");
			oView.byId("inOperator"+i).setValueStateText("");
		}
		// if(oView.byId("inOperator1").getEnabled())
		// {
		// 	oView.byId("inOperator1").focus();
		// }
		setTimeout(function(){ 
			if(oView.byId("inOperator1").getEnabled())
			{
				oView.byId("inOperator1").focus();
			}			 
		}, 1000);
	},
	
	onOperatorSwipe : function(oEvent){
		// if (oEvent.getSource().getValue().length > 0)
		// {
		// 	oEvent.getSource().setValueState("None");
		// 	oEvent.getSource().setValueStateText("");	
		// }
		if(oEvent.getSource().getValue().length < 10)
		{
			oEvent.getSource().setValueState("Error");
			oEvent.getSource().setValueStateText("Please fill the Operator!");	
			oEvent.getSource().focus();
		}
		// else
		// {
		// 	oEvent.getSource().setValueState("Error");
		// 	oEvent.getSource().setValueStateText("Please fill the Operator!");	
		// }
	},
	
	onOperatorSwipe2 : function(oEvent){
		if (oEvent.getSource().getValue().length === 10)
		{
			this.getOperatorName(oEvent.getSource());
		}
		else if (oEvent.getSource().getValue().length === 0)
		{
			oEvent.getSource().setValueState("Error");
			oEvent.getSource().setValueStateText("Please fill the Operator!");
			oEvent.getSource().focus();
		}
	},
	
	getOperatorName : function(oEvent){
		var sServiceUrl = this._oComponent.getMetadata().getConfig().serviceConfig.serviceUrl;
		var oModel =  new sap.ui.model.json.JSONModel();
		var that = this;
		$.ajax({  
		    url: sServiceUrl + "ValidateUser?CardData='" + oEvent.getValue() + "'",  
		    cache: false,
		    jsonpCallback: 'processJSON',  
		    dataType: 'json',  
		    success: function (oData) {  
		    	oEvent.setValueState("None");
				oEvent.setValueStateText("");
				oEvent.setEnabled(false);
				oEvent.setMaxLength(40);
				oEvent.setValue(oData.d.Uname);
				var nextOp = parseInt(oEvent.getId().split("-").slice(-1)[0].slice(-1))+1;
				if(oEvent.getId().slice(-1) <=4 && that.getView().byId(oEvent.getId().split("-").slice(-1)[0].slice(0,-1)+nextOp).getEnabled() === true)
				{
					that.getView().byId(oEvent.getId().split("-").slice(-1)[0].slice(0,-1)+nextOp).focus();
				}
				else
				{
					that.getView().byId("idHomeLogin").focus();
				}
		    },  
		    error: function (e) {
		    	// zmclaren.prd.util.messages.showErrorMessage(e);
		    	sap.m.MessageToast.show("Invalid Operator!");
		    	
		    	oEvent.setValueState("Error");
				oEvent.setValueStateText("Invalid Operator");
				oEvent.setValue("");
				oEvent.focus();
				// log error in browser  
		        console.log(e.message);
		    }  
		});  
	},

	//Validate data and move to Production Orders
	onLogin: function(oEvent) {
		try
		{
			if (this.validateOperators()){
				var workCentreInput = this.getView().byId("workcentreId");
	
				if (workCentreInput.getValue().trim() === "") {
					workCentreInput.setValueState("Error");
					workCentreInput.setValueStateText("Please select a valid Work Centre!");
				} else {
					workCentreInput.setValueState("None");
					workCentreInput.setValueStateText("");
	
					this.createOperatorsModel();
					
					this._oRouter.navTo("app", {
						from: "home",
						plant: "9000", //Fixed for now but will change in the future
						workcentre: this.getView().byId("workcentreId").getValue()
					});
				}	
			}
		}
		catch(oError)
		{
			zmclaren.prd.util.messages.showErrorMessage(oError);
		}
	},
	
	//Create the Operators Model for the app
	createOperatorsModel: function(){
		var oView = this.getView();
		var oModel = sap.ui.getCore().getModel("Operators");
		// sap.ui.getCore().getModel("operators").setProperty("/WorkCentre", workCentreInput.getValue());
		var TotalOperators = oModel.getData().TotalOperators;
		oModel.setProperty("/WorkCentre", this.getView().byId("workcentreId").getValue());
		oModel.setProperty("/Operators", [[],[],[],[]]);
		for(var i=0;i<4;i++)
		{
			if(i===0)
			{
				oModel.setProperty("/Operators/" + i + "/Icon", "sap-icon://employee");
				oModel.setProperty("/Operators/" + i + "/ButtonType", "Emphasized");
			}
			else
			{
				oModel.setProperty("/Operators/" + i + "/Icon", "");
				oModel.setProperty("/Operators/" + i + "/ButtonType", "Reject");
			}
			if(i<TotalOperators)
			{
				oModel.setProperty("/Operators/" + i + "/ButtonEnabled", true);
				oModel.setProperty("/Operators/" + i + "/UName", oView.byId("inOperator"+(i+1)).getValue());
			}
			else
			{
				oModel.setProperty("/Operators/" + i + "/ButtonEnabled", false);
				oModel.setProperty("/Operators/" + i + "/ButtonType", "Default");
			}
			// oModel.setProperty("/Operators/" + i + "/IconColor", "Error");
		}
	},
	
	//Check for duplicates (Not used for now because the same person can be 2 different operators)
	checkDuplicates: function(a){
		var oView = this.getView();
	    var map = {};  
	    for(var i = 0; i <= a.length; i++) 
	    {
	        if (map.hasOwnProperty(a[i]))
	        {
	            return true;
	        } else {
	            map[a[i]] = a[i];
	        }
	    }
	    return false;
	},
	
	//Validate Operators
	validateOperators : function(){
		// #############################################################################
// 		return true;
		// #############################################################################
		
		var totalOperators = sap.ui.getCore().getModel("Operators").getData().TotalOperators;
		var oView = this.getView();
		var aOp = [];
		if(totalOperators > 0)
		{
			for (var i=1;i<=totalOperators;i++){
				if(oView.byId("inOperator"+i).getEnabled() === true){
				// 	if(oView.byId("inOperator"+i).getValue().length > 0)
				// 	{
				// 		aOp.push(oView.byId("inOperator"+i).getValue());
				// 	}
				// 	else
				// 	{
						oView.byId("inOperator"+i).setValueState("Error");
						oView.byId("inOperator"+i).setValueStateText("Please fill the Operator!");
						oView.byId("inOperator"+i).focus();
				// 		return false;
				// 	}
					return false;
				}
				else{
					// return !(this.checkDuplicates(aOp));
					// return true;
					aOp.push(oView.byId("inOperator"+i).getValue());
				}
			}
			if(aOp.length > 0)
			{
				return true;	
			}
		}
		return false;
	},

	handleValueHelp: function(oEvent) {
		var sInputValue = oEvent.getSource().getValue();

		this.inputId = oEvent.getSource().getId();
		// create value help dialog
		if (!this._valueHelpDialog) {
			this._valueHelpDialog = sap.ui.xmlfragment(
				"zmclaren.prd.view.DialogWorkCentre",
				this
			);
			this.getView().addDependent(this._valueHelpDialog);
		}

		// create a filter for the binding
		if(sInputValue.trim() !== "")
		{
			this._valueHelpDialog.getBinding("items").filter([new sap.ui.model.Filter("WorkCentreID", sap.ui.model.FilterOperator.Contains, sInputValue)]);	
		}

		// open value help dialog filtered by the input value
		this._valueHelpDialog.open(sInputValue);
	},

	_handleValueHelpSearch: function(evt) {
		var sValue = evt.getParameter("value");
		var oFilter = new sap.ui.model.Filter("WorkCentreID", sap.ui.model.FilterOperator.Contains, sValue);
		evt.getSource().getBinding("items").filter([oFilter]);
	},

	_handleValueHelpClose: function(evt) {
		var oSelectedItem = evt.getParameter("selectedItem");
		if (oSelectedItem) {
			var workCentreInput = this.getView().byId(this.inputId);
			workCentreInput.setValue(oSelectedItem.getTitle());
			this.onWorkCentre();
		}
		evt.getSource().getBinding("items").filter([]);
	},
	
	handleConfirmLogOff : function(){
		location.reload();
	},
	
	handleCancelLogOff : function(){
		this._confirmLogOffDialog.close();
	},
	
	//Log Off Operators
	onLogOffOperators : function(){
		try {
    		// create value confirm dialog
			if (!this._confirmLogOffDialog) {
				this._confirmLogOffDialog = sap.ui.xmlfragment(
					"zmclaren.prd.view.DialogConfirmLogOff",
					this
				);
				this.getView().addDependent(this._confirmLogOffDialog);
			}
	
			// open value confirm
			this._confirmLogOffDialog.open();
		}
		catch(oError) {
		    zmclaren.prd.util.messages.showErrorMessage(oError);
		    var errCode;
		    if(oError.status){
		    	if(oError.status != "error"){
		    		errCode = oError.status;
		    	}
		    }
		    if(oError.response){
		    	errCode = oError.response.statusCode;
		    }
		    if (oError.statusCode){
		    	errCode = oError.statusCode;
		    }
		    if(errCode == "503")
		    {
				location.reload();		    	
		    }
		}
	}

	/**
	 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
	 * (NOT before the first rendering! onInit() is used for that one!).
	 * @memberOf zmclaren.prd.view.Home
	 */
	//	onBeforeRendering: function() {
	//
	//	},

	/**
	 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
	 * This hook is the same one that SAPUI5 controls get after being rendered.
	 * @memberOf zmclaren.prd.view.Home
	 */
		// onAfterRendering: function() {
		// 	// $("#prodOrdersShell").removeClass("sapMShellAppWidthLimited");
		// 	// sap.ui.getCore().byId("prodOrdersShell").setAppWidthLimited(false);
		// }

	/**
	 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
	 * @memberOf zmclaren.prd.view.Home
	 */
		// onExit: function() {
		// }

});