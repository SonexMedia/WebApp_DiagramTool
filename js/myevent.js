var MyEvents = function() {
	var self = this,
		eventList = {};
    
	this.addEventListener = function(eventName, callback) {
		if(!eventList[eventName]) {
			eventList[eventName] = [];
		}
		eventList[eventName].push(callback);
	};
 
	this.removeEventListener = function(eventName, callback) {
		var idx = -1;
		if(eventList[eventName]) {
			idx = eventList[eventName].indexOf(callback);
			if(idx != -1) {
				eventList[eventName].splice(idx, 1);
			}
		}
	};
 
	this.fireEvent = function(eventName, eventObject) {
		var i,
			eventFunction = "on" + eventName.charAt(0).toUpperCase() + eventName.slice(1);		
		if(eventList[eventName]) {
			for(i = 0; i < eventList[eventName].length; i++) {
				eventList[eventName][i](eventObject);
			}			
		}
		if(self[eventFunction]) {
			self[eventFunction](eventObject);
		}
	};
    
	//alias for fireEvent
	this.emit = function(eventName, eventObject) {
		this.fireEvent(eventName, eventObject);
	};
	
	//alias for addEventListener
	this.on = function(eventName, callback) {        
		this.addEventListener(eventName, callback);
	};
};

