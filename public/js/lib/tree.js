$(function(){

	(function(){

	    $('.tree-controls-show-labels').on('click', function(){
	        // Get collection id
	        var collectionId = $(this).closest('.wgst-panel').attr('data-collection-id');

	        WGST.collection[collectionId].tree['CORE_TREE_RESULT'].canvas.displayLabels();
	    });

	    $('.tree-controls-hide-labels').on('click', function(){
	        // Get collection id
	        var collectionId = $(this).closest('.wgst-panel').attr('data-collection-id');

	        WGST.collection[collectionId].tree['CORE_TREE_RESULT'].canvas.hideLabels();
	    });

	    $('body').on('change', '.wgst-tree-control__change-node-label', function(){
	        var selectedOption = $(this),
	            collectionId = selectedOption.closest('.wgst-panel').attr('data-collection-id'),
	            collectionTreeType = selectedOption.closest('.wgst-panel').attr('data-collection-tree-type');

	        var treeCanvas = WGST.collection[collectionId].tree[collectionTreeType].canvas,
	            assemblies = WGST.collection[collectionId].assemblies,
	            assemblyId;

	        if (selectedOption.val() === '1') {

	            // Set user assembly id as node label
	            for (assemblyId in assemblies) {
	                if (assemblies.hasOwnProperty(assemblyId)) {
	                    // Set label only to leaf nodes, filtering out the root node
	                    if (treeCanvas.branches[assemblyId] && treeCanvas.branches[assemblyId].leaf) {
	                        treeCanvas.branches[assemblyId].label = assemblies[assemblyId].ASSEMBLY_METADATA.userAssemblyId;                 
	                    }
	                }
	            }
	            
	        } else if (selectedOption.val() === '2') {

	            // Set user assembly id as node label
	            for (assemblyId in assemblies) {
	                if (assemblies.hasOwnProperty(assemblyId)) {
	                    // Set label only to leaf nodes, filtering out the root node
	                    if (treeCanvas.branches[assemblyId] && treeCanvas.branches[assemblyId].leaf) {
	                        treeCanvas.branches[assemblyId].label = WGST.collection[collectionId].assemblies[assemblyId]['FP_COMP'].topScore.referenceId;              
	                    }
	                }
	            }

	        } else if (selectedOption.val() === '3') {

	            // Set user assembly id as node label
	            for (assemblyId in assemblies) {
	                if (assemblies.hasOwnProperty(assemblyId)) {
	                    // Set label only to leaf nodes, filtering out the root node
	                    if (treeCanvas.branches[assemblyId] && treeCanvas.branches[assemblyId].leaf) {
	                        treeCanvas.branches[assemblyId].label = (assemblies[assemblyId]['MLST_RESULT'].stType.length === 0 ? 'Not found': assemblies[assemblyId]['MLST_RESULT'].stType);               
	                    }
	                }
	            }

	        } else if (selectedOption.val() === '4') {

	            var assemblyResistanceProfile,
	                resistanceProfileString;

	            // Set user assembly id as node label
	            for (assemblyId in assemblies) {
	                if (assemblies.hasOwnProperty(assemblyId)) {

	                    assemblyResistanceProfile = assemblies[assemblyId].PAARSNP_RESULT.paarResult.resistanceProfile,
	                    resistanceProfileString = createAssemblyResistanceProfilePreviewString(assemblyResistanceProfile, WGST.antibiotics);

	                    // Set label only to leaf nodes, filtering out the root node
	                    if (treeCanvas.branches[assemblyId] && treeCanvas.branches[assemblyId].leaf) {
	                        treeCanvas.branches[assemblyId].label = resistanceProfileString;            
	                    }
	                }
	            }

	        } else if (selectedOption.val() === '5') {

	            // Set user assembly id as node label
	            for (assemblyId in assemblies) {
	                if (assemblies.hasOwnProperty(assemblyId)) {
	                    // Set label only to leaf nodes, filtering out the root node
	                    if (treeCanvas.branches[assemblyId] && treeCanvas.branches[assemblyId].leaf) {
	                        treeCanvas.branches[assemblyId].label = assemblies[assemblyId]['ASSEMBLY_METADATA'].geography.address;              
	                    }
	                }
	            }
	        }

	        treeCanvas.draw();
	    });

	    $('body').on('change', '.wgst-tree-control__change-node-colour', function(){
	        var selectedOption = $(this).find('option:selected'),
	            collectionId = selectedOption.closest('.wgst-panel').attr('data-collection-id'),
	            collectionTreeType = selectedOption.closest('.wgst-panel').attr('data-collection-tree-type');

	        var tree = WGST.collection[collectionId].tree[collectionTreeType].canvas,
	            assemblies = WGST.collection[collectionId].assemblies,
	            assemblyId;

	        if (selectedOption.val() === '0') {
	            // Colour assembly nodes according to default colour
	            for (assemblyId in assemblies) {
	                if (assemblies.hasOwnProperty(assemblyId)) {
	                    tree.setNodeColourAndShape(assemblyId, '#ffffff');
	                }
	            } // for
	        } else {
	            var ungroupedResistanceProfile,
	                antibioticResistance;

	            // Colour assembly nodes according to resistance profile of selected antibiotic
	            for (assemblyId in assemblies) {
	                if (assemblies.hasOwnProperty(assemblyId)) {

	                    ungroupedResistanceProfile = assemblies[assemblyId].PAARSNP_RESULT.paarResult.ungroupedResistanceProfile;
	                    antibioticResistance = ungroupedResistanceProfile[selectedOption.text()];

	                    // Check assembly has resistance profile for this antibiotic
	                    if (typeof antibioticResistance !== 'undefined') {
	                        if (tree.branches[assemblyId] && tree.branches[assemblyId].leaf) {
	                            if (antibioticResistance.resistanceState === 'RESISTANT') {
	                                // Red
	                                tree.setNodeColourAndShape(assemblyId, '#ff0000');                 
	                            } else if (antibioticResistance.resistanceState === 'SENSITIVE') {
	                                // Green
	                                tree.setNodeColourAndShape(assemblyId, '#4dbd33');                 
	                            } else if (antibioticResistance.resistanceState === 'UNKNOWN') {
	                                // White
	                                tree.setNodeColourAndShape(assemblyId, '#ffffff');
	                            }
	                        }                        
	                    } else {
	                    // Assembly has no resistance profile for this antibiotic
	                        if (tree.branches[assemblyId] && tree.branches[assemblyId].leaf) {
	                            // Black
	                            tree.setNodeColourAndShape(assemblyId, '#ffffff');
	                        }
	                    }
	                } // if
	            } // for
	        } // if
	    });

	    $('body').on('change', '.wgst-tree-control__change-tree-type', function(){
	        var selectedOption = $(this).find('option:selected'),
	            collectionId = selectedOption.closest('.wgst-panel').attr('data-collection-id'),
	            collectionTreeType = selectedOption.closest('.wgst-panel').attr('data-collection-tree-type'),
	            tree;

	        // if ($(this).closest('.wgst-panel').attr('data-panel-name') === 'mergedCollectionTree') {
	        //     tree = WGST.mergedCollectionTree[collectionId].tree.canvas;
	        // } else {
	        //     tree = WGST.collection[collectionId].tree.canvas;
	        // }

	        tree = WGST.collection[collectionId].tree[collectionTreeType].canvas;
	        tree.setTreeType(selectedOption.val());
	    });

	    window.WGST.socket.connection.on('collectionTreeMergeNotification', function(mergedCollectionTreeData) {
	        console.log('[WGST] Received merged tree notification');

	        if (WGST.speak) {
	            var message = new SpeechSynthesisUtterance('Merged collections');
	            window.speechSynthesis.speak(message);
	        }

	        console.debug('mergedCollectionTreeData:');
	        console.dir(mergedCollectionTreeData);

	        var collectionId = mergedCollectionTreeData.mergedCollectionTreeId,
	            collectionTree = mergedCollectionTreeData.tree,
	            assemblyIdsData = mergedCollectionTreeData.assemblies,
	            assemblyIds = [];

	        assemblyIds = assemblyIdsData.map(function(assembly){
	            return assembly.assemblyId;
	        });

	        // ------------------------------------------
	        // Get assemblies
	        // ------------------------------------------
	        console.log('[WGST] Getting merged collection assemblies');
	        console.dir(assemblyIds);

	        $.ajax({
	            type: 'POST',
	            url: '/api/assemblies/',
	            datatype: 'json', // http://stackoverflow.com/a/9155217
	            data: {
	                assemblyIds: assemblyIds
	            }
	        })
	        .done(function(assemblies, textStatus, jqXHR) {
	            console.log('[WGST] Got merged collection assemblies');
	            console.dir(assemblies);

                //
                // Set collection data
                //
                window.WGST.exports.setCollectionData(collectionId, assemblies, collectionTree);

	            //window.WGST.exports.initCollectionDataStructure(collectionId, assemblies, collectionTree);
	            window.WGST.exports.renderCollectionTrees(collectionId, {
	                // Show buttons
	                matchAssemblyListButton: true,
	                mergeWithButton: true
	            });

	            // ------------------------------------------
	            // Prepare nearest representative
	            // ------------------------------------------
	            var assemblyId,
	                assembly,
	                assemblyScores;

	            for (assemblyId in window.WGST.collection[collectionId].assemblies) {
	                if (WGST.collection[collectionId].assemblies.hasOwnProperty(assemblyId)) {
	                    assembly = window.WGST.collection[collectionId].assemblies[assemblyId];
	                    assemblyScores = assembly['FP_COMP'].scores;
	                    // Set top score
	                    window.WGST.collection[collectionId].assemblies[assemblyId]['FP_COMP'].topScore = window.WGST.exports.calculateAssemblyTopScore(assemblyScores);
	                } // if
	            } // for

	            //window.WGST.exports.addResistanceProfileToCollection(collectionId);
	            window.WGST.exports.addResistanceProfileDataToCollection(collectionId);
	            window.WGST.exports.populateListOfAntibiotics($('#select-tree-node-antibiotic-merged'));

	            // ------------------------------------------
	            // Enable Merge Collections button
	            // ------------------------------------------
	            (function() {
	                var mergeCollectionTreesButton = $('.wgst-tree-control__merge-collection-trees');
	                mergeCollectionTreesButton.find('.wgst-spinner').addClass('wgst--hide-this');
	                mergeCollectionTreesButton.find('.wgst-spinner-label').removeClass('wgst--hide-this');
	                mergeCollectionTreesButton.attr('disabled', false);
	            }());





	            //
	            // Show tree panel
	            //
	            var collectionTreeType = 'MERGED',
	                collectionTreePanelId = 'collection-tree' + '__' + collectionId + '__' + collectionTreeType;

	            window.WGST.exports.showPanel(collectionTreePanelId);
	            
	            //
	            // Bring to front
	            //
	            window.WGST.exports.bringPanelToFront(collectionTreePanelId);

	        })
	        .fail(function(jqXHR, textStatus, errorThrown) {
	            console.error('[WGST][Error] ✗ Failed to get assemblies');
	            console.error(textStatus);
	            console.error(errorThrown);
	            console.error(jqXHR);

	        });
	    });

	    $('body').on('click', '.wgst-tree-control__merge-collection-trees', function(){

	        var mergeButton = $(this);

	        mergeButton.attr('disabled', true);
	        mergeButton.find('.wgst-spinner-label').hide();
	        mergeButton.find('.wgst-spinner').show();

	        //-----------------------------
	        // Remove after demo
	        //
	        var mapCollectionIdToMergeTreeId = {
	            '5324c298-4cd0-4329-848b-30d7fe28a560': 'ab66c759-2242-42c2-a245-d364fcbc7c4f',
	            'c0ca8c57-11b9-4e27-93a5-6ffe841e7768': '2b3ad477-323c-4c54-b6f2-abc420ba0399'
	        };
	        var collectionId = $(this).closest('.wgst-panel').attr('data-collection-id');
	        if (mapCollectionIdToMergeTreeId.hasOwnProperty(collectionId)) {
	            demoMergeCollectionTrees(mapCollectionIdToMergeTreeId[collectionId]);
	            return;
	        }
	        //-----------------------------

	        var requestData = {
	            collectionId: mergeButton.closest('.wgst-panel').attr('data-collection-id'),
	            mergeWithCollectionId: 'b8d3aab1-625f-49aa-9857-a5e97f5d6be5', //'78cb7009-64ac-4f04-8428-d4089aae2a13',//'851054d9-86c2-452e-b9af-8cac1d8f0ef6',
	            collectionTreeType: mergeButton.attr('data-collection-tree-type'),
	            socketRoomId: WGST.socket.roomId
	        };

	        console.log('[WGST] Requesting to merge collection trees: ' + requestData.collectionId + ', ' + requestData.mergeWithCollectionId);

	        // Merge collection trees
	        $.ajax({
	            type: 'POST',
	            url: '/api/collection/tree/merge',
	            datatype: 'json', // http://stackoverflow.com/a/9155217
	            data: requestData
	        })
	        .done(function(mergeRequestSent, textStatus, jqXHR) {
	            console.log('[WGST] Requested to merge collection trees: ' + requestData.collectionId + ', ' + requestData.mergeWithCollectionId);
	        });

	    });

	})();
});