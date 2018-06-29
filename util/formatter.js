jQuery.sap.declare("zmclaren.prd.util.formatter");
/*global zmclaren */
zmclaren.prd.util.formatter = {
	
	dateFormat : function (dValue) {
		var nDate = new Date(dValue);
        return nDate.getDate() + "/" + (nDate.getMonth()+1) + "/" + nDate.getFullYear();
    },
    
    iconDataCollectionColor : function (bHasDataCollection, bDataCollected){
    	if(bHasDataCollection === false){
    		return "transparent";
    	}
    	else{
    		if(bDataCollected){
    			return "green";
    		}
    		else{
    			// var item = this.getParent();
    			// item.$().css('background-color', 'red');
    			return "red";
    		}
    	}
    },
    
    iconOperationChangedColor : function (bValue){
    	if(bValue === true){
    		return "blue";
    	}
    	else{
    		return "transparent";	
    	}
    },
    
    bdrStatus :	function(bValue){
    	if(bValue){
    		return "Success";
    	}
    	else{
    		return "Error";
    	}
    },
    
    bdrText :	function(bValue){
    	if(bValue){
    		return "Confirmed";
    	}
    	else{
    		return "Not Confirmed";
    	}
    },

    dataCollectionState : function(actualValue, mask){
    	if(actualValue === ""){
    		return "None";
    	}
    	else// if(actualValue === mask){
    	{
    		return "Success";
    	}
    	// else{
    	// 	return "Error";
    	// }
    },
    
    dataCollectionStateIcon : function(actualValue, mask){
    	if(actualValue === ""){
    		return "transparent";
    	}
    	else
    	{
    		return "green";
    	}
    },
    
    deletedOperationColor : function (sOperation, sOpNumberText, bDeleted){
    	var item = this.getParent().getParent().getParent();
    	if(bDeleted){
    		item.addStyleClass("deletedOperations");
    		// item.$().css('background-color', 'red');
    	}
    	else
    	{
    		item.removeStyleClass("deletedOperations");
    	}
    	return sOperation + " " + sOpNumberText;
    }
};