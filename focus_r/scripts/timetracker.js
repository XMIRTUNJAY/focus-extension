function TimeTracker(){this.today=new Object();this.pastDays=new Array();this.maxDaysToKeep=30;function a(d){var b=null;try{b=JSON.parse(localStorage.getItem(d))}catch(c){}return b}this._loadTrackingInfo=function(){var b=null;if(b=a("today")){this.today=b}if(b=a("TimeTrackerStartTime")){this.startTime=new Date(b)}else{this.startTime=new Date();this._saveNewStartTime()}if(b=a("pastDays")){this.pastDays=b}this.resetTime=getStartOfNextDay(this.startTime);if(DEBUG){window.console.log("Time tracker: Start time is "+this.startTime.toLocaleString()+" Next reset time would be "+this.resetTime.toLocaleString())}this.lastSaveTime=new Date().getTime()};this._saveNewStartTime=function(){if(DEBUG){window.console.log("Time tracker: save new start time to local storage")}localStorage.setItem("TimeTrackerStartTime",JSON.stringify(this.startTime.getTime()))};this._savePastDaysTrackingInfo=function(){if(DEBUG){window.console.log("Time tracker: save past days tracking info to local storage")}localStorage.setItem("pastDays",JSON.stringify(this.pastDays))};this._saveDayTrackingInfo=function(){if(DEBUG){window.console.log("Time tracker: save today's tracking info to local storage")}localStorage.setItem("today",JSON.stringify(this.today));this.lastSaveTime=new Date().getTime()};this.useSeconds=function(d,b){var c=getDomain(b);if(c in this.today){this.today[c]+=d}else{this.today[c]=d}this._houseKeeping()};this._addDayToPast=function(c){if(DEBUG){window.console.log("Time tracker: Add one day to past")}var b=this.pastDays.unshift(c);if(b>this.maxDaysToKeep){this.pastDays.pop()}};this._houseKeeping=function(){var b=new Date();if(b.getTime()>this.resetTime.getTime()){this._addDayToPast(this.today);this.today=new Object();extraDays=Math.floor((b.getTime()-this.resetTime.getTime())/millisecondsOfADay());for(var c=0;c<extraDays;c++){this._addDayToPast(null)}this.startTime=b;this.resetTime=getStartOfNextDay(this.startTime);if(DEBUG){window.console.log("Time tracker: New start time is "+this.startTime.toLocaleString()+" Next reset time would be "+this.resetTime.toLocaleString())}this._saveNewStartTime();this._saveDayTrackingInfo();this._savePastDaysTrackingInfo()}if(b.getTime()>this.lastSaveTime+30*1000){this._saveDayTrackingInfo()}};this.resetData=function(){this.today=new Object();this.pastDays=new Array();this._saveDayTrackingInfo();this._savePastDaysTrackingInfo()};this.getUsage=function(b,c){if(b==null){b="day"}else{b=b.toLowerCase()}var g=0;if(b=="week"){g=6}else{if(b=="month"){g=29}else{if(b=="day"){g=0}else{throw"getUsage(range): Unknown range specifier!"}}}var f=new Object();for(var j in this.today){f[j]=this.today[j]}for(var e=0;e<Math.min(this.pastDays.length,g);e++){if(null==this.pastDays[e]){continue}for(var j in this.pastDays[e]){if(j in f){f[j]+=this.pastDays[e][j]}else{f[j]=this.pastDays[e][j]}}}var h=[];for(var d in f){h.push([d,f[d]])}return h.sort(function(k,i){return k[1]<i[1]?1:(k[1]>i[1]?-1:0)}).slice(0,c)};this._loadTrackingInfo();this._houseKeeping()};