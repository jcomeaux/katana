define(['datatables-plugin','helpers','popup','text!templates/buildqueue.mustache','text!templates/buildslaves.mustache','text!templates/builders.mustache','mustache','moment'], function (dataTable,helpers,popup,buildqueue,buildslaves,builders,Mustache,moment) {
   
    "use strict";
    var dataTables;
      
    dataTables = {
        init: function (tablesorterEl) {
			
			// Select which columns not to sort
			tablesorterEl.each(function(i) {			    	
				
				var colList = [];								
				var optionTable = {				 			
					"bPaginate": false,
					"bLengthChange": false,
					"bFilter": false,
					"bSort": true,
					"bInfo": false,
					"bAutoWidth": false,
					"sDom": '<"table-wrapper"t>',
					"bRetrieve": true,
					"asSorting": true,
					"bServerSide": false,
					"bSearchable": true,
					"aaSorting": [],					
					"iDisplayLength": 50,
					"bStateSave": true					
				}
				
				// add only filter input nor pagination
				if ($(this).hasClass('input-js')) {										
					optionTable.bFilter = true;
					optionTable.oLanguage = {
					 	"sSearch": ""
					};
					optionTable.sDom = '<"top"flip><"table-wrapper"t><"bottom"pi>';
				}

				// remove sorting from selected columns

				$('> thead th', this).each(function(i){			        
			        if (!$(this).hasClass('no-tablesorter-js')) {
			            colList.push(null);			            
			        } else {
			            colList.push({'bSortable': false });
			        }
			    });

				// add specific for the buildqueue page
				if ($(this).hasClass('buildqueue-table')) {							
				      
					optionTable.aaSorting = [[ 2, "asc" ]]			
					optionTable.aoColumns = [
						{ "mData": "builderName" },	
			            { "mData": "sources" },
			            { "mData": "reason"},
			            { "mData": "slaves" },
			            { "mData": "brid",
			            'bSortable': false }
					]					

					optionTable.aoColumnDefs = [
						{
						"sClass": "txt-align-left",
						"aTargets": [ 0 ]
						},
						{
						"aTargets": [ 1 ],
						"sClass": "txt-align-left",
						"mRender": function (data,full,type)  {							
							var sourcesLength = type.sources.length
							var htmlnew = Mustache.render(buildqueue, {showsources:true,sources:type.sources,codebase:type.codebase,sourcesLength:sourcesLength})								
							return htmlnew;												
						},"fnCreatedCell": function (nTd, sData, oData, iRow, iCol) {	
							$(nTd).find('a.popup-btn-json-js').data({showCodebases:oData});							
						}
						},
						{
						"aTargets": [ 2 ],
						"sClass": "txt-align-left",						
						"mRender": function (data,full,type)  {		
							var requested = moment.unix(type.submittedAt).format('MMMM Do YYYY, H:mm:ss');																				
							var waiting = helpers.getTime(type.submittedAt, null);							
							var htmlnew = Mustache.render(buildqueue, {reason:type.reason,requested:requested,submittedAt:type.submittedAt});								
							return htmlnew;										
						},
						"fnCreatedCell": function (nTd, sData, oData, iRow, iCol) {									
							helpers.startCounter($(nTd).find('.waiting-time'),oData.submittedAt);													
					    }
						},
						{
						"aTargets": [ 3 ],
						"sClass": "txt-align-right",						
						"mRender": function (data,full,type)  {
							var slavelength = type.slaves.length	
							var htmlnew = Mustache.render(buildqueue, {showslaves:true,slaves:data,slavelength:slavelength})						
							return htmlnew; 						    						
					    },"fnCreatedCell": function (nTd, sData, oData, iRow, iCol) {	
							$(nTd).find('a.popup-btn-json-js').data({showcompatibleSlaves:oData});							
						}
						},
						{
						"aTargets": [ 4 ],
						"sClass": "select-input",				
						"mRender": function (data,full,type)  {								
							var inputHtml = Mustache.render(buildqueue, {input:'true',brid:type.brid})
							return inputHtml;							
							}
							
						}
					]
					  
				} // add specific for the builders page
				else if ($(this).hasClass('builders-table')) {	
        			

					optionTable.aoColumns = [
						{ "mData": null },	
			            { "mData": null },
			            { "mData": null },
			            { "mData": null },
			            { "mData": null,
			            'bSortable': false }
					]
					    
					optionTable.aoColumnDefs = [
						{					
						"aTargets": [ 0 ],
						"sClass": "txt-align-left",	
						"mRender": function (data,full,type)  {				
							var urlParams = helpers.codebasesFromURL({});
			                var ret = [];
			                for (var d in urlParams){
			                    ret.push(encodeURIComponent(d) + "=" + encodeURIComponent(urlParams[d]));
			                }
			                var paramsString = ret.join("&");
							var htmlnew = Mustache.render(builders, {name:type.name,builderParam:paramsString});
							return htmlnew;
						}
						},
						{
                            "aTargets": [ 1 ],
                            "sClass": "txt-align-left",
                            "mRender": function (data,full,type) {
                                var noJobs = type.pendingBuilds === undefined && type.currentBuilds === undefined;

                                var htmlnew = Mustache.render(builders, {showNoJobs:noJobs,pendingBuilds:type.pendingBuilds,currentBuilds:type.currentBuilds,builderName:type.name,projects:type.project});
                                return htmlnew;
                            },
                            "fnCreatedCell": function (nTd, sData, oData, iRow, iCol) {
                                if (oData.currentBuilds != undefined) {
                                    var bars = $(nTd).find('.percent-outer-js');
                                    $.each(bars, function(key, elem) {
                                        var obj = $(elem);
                                        helpers.progressBar(obj.attr('data-etatime'),obj,obj.attr('data-starttime'));
                                    });
                                }
                            }
						},
						{
						"aTargets": [ 2 ],
						"sClass": "txt-align-left last-build-js",
						"mRender": function (data,full,type) {
							var htmlnew = Mustache.render(builders, {showLatestBuild:true,latestBuild:type.latestBuild});
							return htmlnew;
						},
						"fnCreatedCell": function (nTd, sData, oData, iRow, iCol) {							
							if (oData.latestBuild != undefined) {																								
								helpers.startCounterTimeago($(nTd).find('.last-run'),oData.latestBuild.times[1]);
								var time = helpers.getTime(oData.latestBuild.times[0],oData.latestBuild.times[1]).trim();		             					             			
		             			$(nTd).find('.small-txt').html('('+ time +')');
		             			$(nTd).find('.hidden-date-js').html(oData.latestBuild.times[1]);			             			
							}
						}
						},
						{
						"aTargets": [ 3 ],
						"mRender": function (data,full,type) {							
							var lf = type.latestBuild							
							var htmlnew = Mustache.render(builders, {showStatus:true,latestBuild:type.latestBuild});
							return htmlnew;
						},"fnCreatedCell": function (nTd, sData, oData, iRow, iCol) {														
							var lb = oData.latestBuild === undefined? '' : oData.latestBuild;													
							$(nTd).removeClass().addClass(lb.results_text);
						}
						},
						{
						"aTargets": [ 4 ],
						"mRender": function (data,full,type) {
							var builderUrl = location.protocol + "//" + location.host							
							var htmlnew = Mustache.render(builders, {customBuild:true,builderUrlShow:builderUrl,project:type.project,builderName:type.name});
							return htmlnew;
						}							
						}						
					]			

				}
				else if ($(this).hasClass('buildslaves-table')) {	

					optionTable.aoColumns = [
						{ "mData": null },	
			            { "mData": null },
			            { "mData": null },
			            { "mData": null },
			            { "mData": null }
					]
					
					optionTable.aoColumnDefs = [
						{					
						"aTargets": [ 0 ],
						"sClass": "txt-align-left",	
						"mRender": function (data,full,type)  {												
							var htmlnew = Mustache.render(buildslaves, {showFriendlyName:true,friendly_name:type.friendly_name,host_name:type.name});
							return htmlnew;
						}
						},
						{
						"aTargets": [ 1 ],
						"sClass": "txt-align-left",	
						"mRender": function (data,full,type)  {												
							var htmlnew = Mustache.render(buildslaves, {buildersPopup:true});
							return htmlnew;
						},"fnCreatedCell": function (nTd, sData, oData, iRow, iCol) {							
							$(nTd).find('a.popup-btn-json-js').data({showBuilders:oData});
						}
						},
						{
						"aTargets": [ 2 ],
						"sClass": "txt-align-left",	
						"mRender": function (data,full,type)  {
							var name = type.name != undefined? type.name : 'Not Available';							
							return name;
						}
						},
						{
						"aTargets": [ 3 ],
						"mRender": function (data,full,type)  {
							var statusTxt;
							
							if (type.connected === undefined) {
								statusTxt = 'Offline';							
							} 
							else if (type.connected === true && type.runningBuilds === undefined) {
								statusTxt = 'Idle';								
							} else if (type.connected === true && type.runningBuilds.length > 0){															
								statusTxt = 'Running ' + type.runningBuilds.length + ' build(s)';								
								var spinIcon = true;
							}
							var htmlnew = Mustache.render(buildslaves, {showStatusTxt:statusTxt,showSpinIcon:spinIcon});
							return htmlnew;							
						}, "fnCreatedCell": function (nTd, sData, oData, iRow, iCol) {														
							if (oData.connected === undefined) {
								$(nTd).addClass('offline');
							} 
							else if (oData.connected === true && oData.runningBuilds === undefined) {
								$(nTd).addClass('idle');
							} else if (oData.connected === true && oData.runningBuilds.length > 0){															
								$(nTd).addClass('building');
							}											
					    }
					    
						},									
						{
						"aTargets": [ 4 ],
						"mRender": function (data,full,type)  {																					
							var showTimeago = type.lastMessage != undefined? true : null;																												
							var lastMessageDate = showTimeago? ' ('+ moment.unix(type.lastMessage).format('MMM Do YYYY, H:mm:ss') + ')' : '';							
							var htmlnew = Mustache.render(buildslaves, {showTimeago:showTimeago,showLastMessageDate:lastMessageDate});
							return htmlnew;
						},
						"fnCreatedCell": function (nTd, sData, oData, iRow, iCol) {
							helpers.startCounterTimeago($(nTd).find('.last-message-timemago'),oData.lastMessage);							
						}
							
						}
						
					]

				} else {

					// add no sorting 
					optionTable.aoColumns = colList;	
				}
				
				// add searchfilterinput, length change and pagination
				if ($(this).hasClass('tools-js')) {						
					optionTable.bPaginate = true;
					optionTable.bLengthChange = true;
					optionTable.bInfo = true;
					optionTable.bFilter = true;
					optionTable.oLanguage = {          			 	
					 	"sSearch": "",
					 	 "sLengthMenu": 'Entries per page<select>'+
				            '<option value="10">10</option>'+
				            '<option value="25">25</option>'+
				            '<option value="50">50</option>'+
				            '<option value="100">100</option>'+
				            '<option value="-1">All</option>'+
				            '</select>'
					};
					optionTable.sDom = '<"top"flip><"table-wrapper"t><"bottom"pi>';
				}			

			   	//initialize datatable with options
			  	var oTable = $(this).dataTable(optionTable);			  				  	

			  	// insert codebase and branch on the builders page
	        	if ($('#builders_page').length && window.location.search != '') {
	        		// Parse the url and insert current codebases and branches
	        		helpers.codeBaseBranchOverview();	
				}

			  	// for the codebases
			  	if ($(this).hasClass('branches-selectors-js')) {		
					$('.dataTables_wrapper .top').append('<div class="filter-table-input">'+
	    			'<input value="Show builders" class="blue-btn var-2" type="submit" />'+
	    			'<h4 class="help-txt">Select branch for each codebase before showing builders</h4>'+    
	  				'</div>');
				}			  	

			  
				
				// Set the marquee in the input field on load and listen for key event	
				$(this).parents('.dataTables_wrapper').find('.dataTables_filter input').attr('placeholder','Filter results').focus();				

			});
		}
	};

    return dataTables;
});