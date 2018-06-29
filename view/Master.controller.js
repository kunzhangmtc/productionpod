jQuery.sap.require("zmclaren.prd.util.messages");

sap.ui.core.mvc.Controller.extend("zmclaren.prd.view.Master", {

	onInit: function() {
        // if (sap.ui.Device.support.touch === false) {
        //     sap.ui.Device.support.touch = true;
        // }
		//Check if the model is defined
		if(sap.ui.getCore().getModel("Operators") === undefined)
		{
			this.getRouter().navTo("home", {});
			location.reload();
		}
		this._oView = this.getView();
		this._oComponent = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this._oView));
		this._oResourceBundle = this._oComponent.getModel("i18n").getResourceBundle();
		
		this.openBusyDialog();
		this.oInitialLoadFinishedDeferred = jQuery.Deferred();

		var oEventBus = this.getEventBus();
		oEventBus.subscribe("Detail", "TabChanged", this.onDetailTabChanged, this);
		oEventBus.subscribe("MasterOperations", "RefreshMaster", this.onRefreshMaster, this);

		var oList = this.getView().byId("list");
		oList.attachEvent("updateFinished", function() {
			this.oInitialLoadFinishedDeferred.resolve();
			oEventBus.publish("Master", "InitialLoadFinished");
		}, this);

		//On phone devices, there is nothing to select from the list. There is no need to attach events.
		if (sap.ui.Device.system.phone) {
			return;
		}

		this.getRouter().attachRoutePatternMatched(this.onRouteMatched, this);

		oEventBus.subscribe("Detail", "Changed", this.onDetailChanged, this);
		oEventBus.subscribe("Detail", "NotFound", this.onNotFound, this);
	},
	
	// onAfterRendering: function() {
	// 	$("#prodOrdersShell").removeClass("sapMShellAppWidthLimited");
	// },

	onRouteMatched: function(oEvent) {
		try{
			var plant;
			var workcentre;
			var sName = oEvent.getParameter("name");
			//Deal with refresh
			if(!oEvent.getParameter("arguments").plant)
			{
				if(oEvent.getParameter("arguments").entity)
				{
					plant = oEvent.getParameter("arguments").entity.split("'")[1];
					workcentre = oEvent.getParameter("arguments").entity.split("'")[3];	
				}
			}
			else
			{
				plant = oEvent.getParameter("arguments").plant;
				workcentre = oEvent.getParameter("arguments").workcentre;
			}
			var sObjectPath = "/WorkCentreCollection(PlantID='" + plant + "',WorkCentreID='" + workcentre + "')";
	
			if (sName !== "main") 
			{
				// if (sName !== "detail")
				// {
					return;	
				// }
			}
			this._bindView(sObjectPath);
			
	
			//Load the detail view in desktop
			this.loadDetailView();
	
			//Wait for the list to be loaded once
			this.waitForInitialListLoading(function() {
	
				//On the empty hash select the first item
				this.selectFirstItem();
	
			});
		}
		catch(oError)
		{
			zmclaren.prd.util.messages.showErrorMessage(oError);
		}
	},

	/**
	 * Binds the view to the object path. Makes sure that detail view displays
	 * a busy indicator while data for the corresponding element binding is loaded.
	 * @function
	 * @param {string} sObjectPath path to the object to be bound to the view.
	 * @private
	 */

	_bindView: function(sObjectPath) {
		// Set busy indicator during view binding
		var oViewModel = this.getView().getModel();
		// oViewModel.setDefaultOperationMode(sap.ui.model.odata.OperationMode.Client);
		// oViewModel.sDefaultOperationMode = "Client";

		// If the view was not bound yet its not busy, only if the binding requests data it is set to busy again
		oViewModel.setProperty("/busy", false);
		
		//Disable $count for performance
		// oViewModel.setCountSupported(false);
        var that = this;
		this.getView().bindElement({
			path: sObjectPath,
			events: {
				change: this._onBindingChange.bind(this),
				dataRequested: function() {
				// 	oViewModel.setProperty("/busy", true);
				    that.openBusyDialog();
				},
				dataReceived: function() {
				// 	oViewModel.setProperty("/busy", false);
				}
			}
		});
	},

	onDetailChanged: function(sChanel, sEvent, oData) {
		if(typeof sName !== 'undefined') 
		{
			if(sName === "detailoperations")
			{
				return;
			}
		}
		var sEntityPath = oData.sEntityPath;
		//Wait for the list to be loaded once
		this.waitForInitialListLoading(function() {
			var oList = this.getView().byId("list");

			var oSelectedItem = oList.getSelectedItem();
			// The correct item is already selected
			if (oSelectedItem && oSelectedItem.getBindingContext().getPath() === sEntityPath) {
				return;
			}

			var aItems = oList.getItems();

			for (var i = 0; i < aItems.length; i++) {
				if (aItems[i].getBindingContext().getPath() === sEntityPath) {
					oList.setSelectedItem(aItems[i], true);
					break;
				}
			}
		});
	},

	onDetailTabChanged: function(sChanel, sEvent, oData) {
		this.sTab = oData.sTabKey;
	},

	loadDetailView: function() {
		this.getRouter().myNavToWithoutHash({
			currentView: this.getView(),
			targetViewName: "zmclaren.prd.view.Detail",
			targetViewType: "XML"
		});
	},

	waitForInitialListLoading: function(fnToExecute) {
		jQuery.when(this.oInitialLoadFinishedDeferred).then(jQuery.proxy(fnToExecute, this));
	},

	onNotFound: function() {
		this.getView().byId("list").removeSelections();
	},

	selectFirstItem: function() {
		try{
			var oList = this.getView().byId("list");
			var aItems = oList.getItems();
			if (aItems.length) {
				oList.setSelectedItem(aItems[0], true);
				//Load the detail view in desktop
				this.loadDetailView();
				oList.fireSelect({
					"listItem": aItems[0]
				});
				this._updateListItemCount(aItems.length);
			} else {
				var sTitle = this._oResourceBundle.getText("masterTitle", [0]);
				this.getView().byId("masterPage").setTitle(sTitle);
				this.getRouter().myNavToWithoutHash({
					currentView: this.getView(),
					targetViewName: "zmclaren.prd.view.NotFound",
					targetViewType: "XML"
				});
			}
		}catch(oError){
			zmclaren.prd.util.messages.showErrorMessage(oError);
		}
	},

	_onBindingChange: function(){
		this.oInitialLoadFinishedDeferred = jQuery.Deferred();
		//Wait for the list to be reloaded
		this.waitForInitialListLoading(function() { 
			//On the empty hash select the first item
			this.selectFirstItem();
		});
	},
	
	/**
	 * Sets the item count on the master list header
	 * @param {integer} iTotalItems the total number of items in the list
	 * @private
	 */
	_updateListItemCount: function(iTotalItems) {
		var sTitle;
		// only update the counter if the length is final
		if (this.getView().byId("list").getBinding("items").isLengthFinal()) {
			sTitle = this._oResourceBundle.getText("masterTitle", [iTotalItems]);
			this.getView().byId("masterPage").setTitle(sTitle);
		}
	},
	
	onUpdateFinishedMasterPO : function(){
		if(this._busyDialog)
		{
			this._busyDialog.close();	
		}	    
	},

	onSearch: function(oEvent) {
		try
		{
			this.oInitialLoadFinishedDeferred = jQuery.Deferred();
			var searchString = oEvent.getSource().getValue();
			var sPath = this.getView().getBindingContext().getPath()+"/ToProdOrderHdr?search='"+searchString+"'";
			this.getView().byId("list").bindAggregation("items", sPath, this.getView().byId("mainListItem").clone());	
	
			//On phone devices, there is nothing to select from the list
			if (sap.ui.Device.system.phone) {
				return;
			}
	
			//Wait for the list to be reloaded
			this.waitForInitialListLoading(function() {
				//On the empty hash select the first item
				this.selectFirstItem();
			});
		}
		catch(oError)
		{
			zmclaren.prd.util.messages.showErrorMessage(oError);
		}
	},
	
	onSearch2 : function(oEvent) {
		var sValue;
		if(oEvent.getParameter("newValue") === undefined)
		{
			sValue = oEvent.getParameter("query");
		}
		else
	    {
	    	sValue = oEvent.getParameter("newValue");
	    }
	    
	    if (oEvent.getParameters().refreshButtonPressed) {
	        this.openBusyDialog();
			// Search field's 'refresh' button has been pressed.
			// This is visible if you select any master list item.
			// In this case no new search is triggered, we only
			// refresh the list binding.
			this.onRefreshMaster();
			return;
		}
	    
	    if (sValue && sValue.length > 0) {
			//create filters
			var oFilterModel = new sap.ui.model.Filter("Model", sap.ui.model.FilterOperator.Contains, sValue);
			var oFilterProdOrder = new sap.ui.model.Filter("OrderNumber", sap.ui.model.FilterOperator.Contains, sValue);
			var oFilterVIN = new sap.ui.model.Filter("Vin", sap.ui.model.FilterOperator.Contains, sValue);
			var oFilterCountry = new sap.ui.model.Filter("Country", sap.ui.model.FilterOperator.Contains, sValue);
			var oFilterBodyStyle = new sap.ui.model.Filter("Bodystyle", sap.ui.model.FilterOperator.Contains, sValue);
			var oFilterPaint = new sap.ui.model.Filter("Paint", sap.ui.model.FilterOperator.Contains, sValue);
			var filters = new sap.ui.model.Filter([oFilterModel, oFilterProdOrder, oFilterVIN, oFilterCountry, oFilterBodyStyle, oFilterPaint]);
			// var filters = new sap.ui.model.Filter([oFilterProdOrder]);
			// filters = [oFilterProdOrder];
	    }

		// Update list binding
		this.getView().byId("list").getBinding("items").filter(filters);
		
		//Wait for the list to be reloaded
		this.waitForInitialListLoading(function() {
			//On the empty hash select the first item
			this.selectFirstItem();
		});
	},
	
	// Busy Dialog Open
	openBusyDialog : function(){
		// create value confirm dialog
		if (!this._busyDialog) {
			this._busyDialog = sap.ui.xmlfragment("zmclaren.prd.view.busyDialog", this);
			this.getView().addDependent(this._busyDialog);
		}
		// open value confirm
		this._busyDialog.open();
	},

	onSelect: function(oEvent) {
		try{
			// Get the list item either from the listItem parameter or from the event's
			// source itself (will depend on the device-dependent mode)
			this.showDetail(oEvent.getParameter("listItem") || oEvent.getSource());
		}catch(oError){
			zmclaren.prd.util.messages.showErrorMessage(oError);
		}
	},
	
	// Refresh Master list
	onRefreshMaster : function(){
	    this.openBusyDialog();
		this.getEventBus().subscribe("Detail", "Changed", this.onDetailChanged, this);
		this.getView().getModel().refresh();
	},

	showDetail: function(oItem) {
		// If we're on a phone device, include nav in history
		var bReplace = jQuery.device.is.phone ? false : true;
		this.getRouter().navTo("detail", {
			from: "master",
			entity: oItem.getBindingContext().getPath().substr(1),
			tab: this.sTab
		}, bReplace);
	},

	getEventBus: function() {
		return sap.ui.getCore().getEventBus();
	},

	getRouter: function() {
		return sap.ui.core.UIComponent.getRouterFor(this);
	},
	
	onNavBack: function() {
		this.getRouter().navTo("home", {});
	},

	onExit: function(oEvent) {
		var oEventBus = this.getEventBus();
		oEventBus.unsubscribe("Detail", "TabChanged", this.onDetailTabChanged, this);
		oEventBus.unsubscribe("Detail", "Changed", this.onDetailChanged, this);
		oEventBus.unsubscribe("Detail", "NotFound", this.onNotFound, this);
		oEventBus.unsubscribe("MasterOperations", "RefreshMaster", this.onRefreshMaster, this);
	}
});