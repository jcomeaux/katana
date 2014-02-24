define(['jquery','helpers','popup','text!templates/builders.html','mustache'], function ($,helpers,popup,builders,Mustache) {
	 "use strict";
    var realtimePages;    
    var tbsorter = $('#tablesorterRt').dataTable();
    var stepList = $('#stepList > li');
    var currentstepJS = $('.current-step-js');

    realtimePages = {
        initRealtime: function (realTimeFunc) {
        	       		

            //Attempt to load our table immediately
            var json = getInstantJSON();
            if (json !== undefined)
            {
                console.log("Loaded from instant JSON");
                loadTable(json);
            }

        	// Creating a new websocket
	        window.sock = null; // Global
         	var wsURI = $('body').attr('data-realTimeServer');
            var sock;
         	console.log(wsURI);

	         if ("WebSocket" in window) {
	         	sock = new WebSocket(wsURI);
	         } else if ("MozWebSocket" in window) {
	         	sock = new MozWebSocket(wsURI);
	         } else {
	             log("Browser does not support WebSocket!");
	             window.location = "http://autobahn.ws/unsupportedbrowser";
	         }

	         // if the socket connection is success
	         if (sock) {
	             sock.onopen = function () {
                     $('#bowlG').remove();
                     // get the json url to parse
                     broadcast(helpers.getJsonUrl());
                 };

	             // when the connection closes
	             sock.onclose = function(e) {
	                 sock = null;
	             };

	             // when the client recieves a message
	             sock.onmessage = function(e) {
                     loadTable(e.data);
	             }
	         }

	        // send a message to the server
	         function broadcast(msg) {
	             if (sock) {
	             	sock.send(msg);
	             }
	         }

            function getInstantJSON () {
                var script = $('#instant-json');
                if (script.length) {
                    script.remove();
                    return instantJSON;
                }
                return undefined;
            }

            function loadTable(data) {
                if (typeof data === "string") {
                    data = JSON.parse(data);
                }
                realTimeFunc(data);
                console.log("Reloading data...")
            }
        },
        rtBuildDetail: function (data,el) {
            
            try {
                 $.each(data, function (key, value) {
                  	
                  	// update timing table
                  	var startTime = value.times[0];
                  	var endTime = value.times[1];
 					
                  	var resultTxt = value.text;	
            		    	
                  			// timetable
                  			helpers.startCounter($('#elapsedTimeJs'), startTime)
		                    

							if (endTime) { 
								// If the build is finished
								  
								// get the rest of the content
								if(!window.location.hash) {
							        window.location = window.location + '#finished';
							        window.location.reload();
									
								}
								sock.close();

							} 

							// build steps
		                    var i = 0;
		                    
		                  	$.each(value.steps, function (key, value) {
		                  		
		                  		 var isStarted = value.isStarted;
		                  		 var isFinished = value.isFinished === true;
		                  		 var isRunning = isStarted && !isFinished;
		                  		 var startTime = value.times[0];
		                  		 var endTime = value.times[1];
		                  		 var resultsClass = helpers.getResult(value.results[0]);
		                  		 var isHidden = value.hidden === true;

		                  		 if (isHidden != true) {
		                  		 	
		                  			i = ++i;
		                  			 
			                  		// update step list if it's not finished

		                  				if (isRunning) {
		                  					
		                  					// loop through the logs
		                  					
		                  					var hasLogs = value.logs.length > 0; 
		                  					var hasUrls = value.urls.length > 0; 
		                  					
		                  					if (hasLogs) {
		                  						
		                  						var logList = '';  
		                  						stepList.children('.logs-txt').eq(i-1).text('Logs');
					                  			$.each(value.logs, function (key, value) {
					                  				var logText = value[0];
					                  				var logUrl = value[1];
					                  				logList += '<li class="s-logs-js"><a href='+ logUrl +'>'+ logText +'</a></li>';	
					                  			});
					                  			stepList.children('.log-list-js').eq(i-1).html(logList);
				                  			}
											// loop through urls
											if (hasUrls) {
					                  			var urlList = '';  
												$.each(value.urls, function (key, value) {
													 urlList += '<li class="urls-mod log-list-'+ helpers.getResult(value.results) +'"><a href="'+ value.url +'">'+ key +'</a></li>'; 
												});				                  			
					                  			stepList.children('.log-list-js').eq(i-1).append(urlList);
				                  			}

				                  			//Running text
			                  				
			                  				stepList.children('.update-time-js').eq(i-1).html('Running');
			                  				

			                  				// update build text
		          							stepList.children('.s-text-js').eq(i-1).html(value.text.join(' '));
		          							// update result class
			          						stepList.children('.s-result-js').eq(i-1).removeClass().addClass('running result s-result-js');	
			          						stepList.eq(i-1).removeClass().addClass('status-running');
			          						
			          						currentstepJS.text(value.name);
			          						
			          						
			              				} else if (isFinished) {
			              					
			              					// Apply the updates from the finished state before applying finished class
			              					
			              					stepList.children('.update-time-js').eq(i-1).html(helpers.getTime(startTime, endTime));
			              					stepList.children('.s-result-js').eq(i-1).removeClass().addClass(resultsClass + ' result s-result-js');					              							              					
			              					stepList.eq(i-1).removeClass().addClass('finished status-'+resultsClass);
			              					
			              				}
		              			}
		              			
		                  	});

	                });
				
          		}
	            catch(err) {
	            	//console.log(err);
	            }
		           
        },
        buildersPage: function(data) {		  	
    		tbsorter.fnClearTable();        

        	try {
          		tbsorter.fnAddData(data.builders);
	        }
	           catch(err) {
	        	//console.log(err);
	        }
        }, rtBuildSlaves: function(data){        		
        		tbsorter.fnClearTable();        	
        	try {
          		$.each(data, function (key, value) {
          			var arObjData = [value];
					tbsorter.fnAddData(arObjData);
          		});
            }
            catch(err) {
            }
        }, rtBuildqueue: function(data){        		
        		tbsorter.fnClearTable();
        	try {
				tbsorter.fnAddData(data);
				

            }
            catch(err) {
            }
        }
    };

    return realtimePages
});