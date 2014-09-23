$(function(){

	(function(){

	    window.WGST.exports.extractContigsFromFastaFileString = function(fastaFileString) {
	        var contigs = [];
	        //
	        // Trim, and split assembly string into array of individual contigs
	        // then filter that array by removing empty strings
	        //
	        contigs = fastaFileString.trim().split('>').filter(function(element) {
	            return (element.length > 0);
	        });

	        return contigs;
	    };

	    window.WGST.exports.splitContigIntoParts = function(contig) {
	        var contigParts = [];

	        // Split contig string into parts
	        contigParts = contig.split(/\n/)
	            // Filter out empty parts
	            .filter(function(part){
	                return (part.length > 0);
	            });

	        // Trim each contig part
	        contigParts.map(function(contigPart){
	            return contigPart.trim();
	        });

	        return contigParts;
	    };

	    window.WGST.exports.extractDnaStringIdFromContig = function(contig) {
	        var contigParts = window.WGST.exports.splitContigIntoParts(contig);

	        // Parse DNA string id
	        var dnaStringId = contigParts[0].trim().replace('>','');

	        return dnaStringId;
	    };

	    window.WGST.regex = WGST.regex || {};
	    window.WGST.regex.DNA_SEQUENCE = /^[CTAGNUX]+$/i;

	    window.WGST.exports.extractDnaStringFromContig = function(contig) {
	        var contigParts = window.WGST.exports.splitContigIntoParts(contig);
	        //
	        // DNA sequence can contain:
	        // 1) [CTAGNUX] characters.
	        // 2) White spaces (e.g.: new line characters).
	        //
	        // The first line of FASTA file contains id and description.
	        // The second line theoretically contains comments (starts with #).
	        //
	        // To parse FASTA file you need to:
	        // 1. Separate assembly into individual contigs by splitting file's content by > character.
	        //    Note: id and description can contain > character.
	        // 2. For each sequence: split it by a new line character, 
	        //    then convert resulting array to string ignoring the first (and rarely the second) element of that array.
	        //
	        // -----------------------------
	        // Parse DNA sequence string
	        // -----------------------------
	        //
	        // Create sub array of the contig parts array - cut the first element (id and description).
	        var contigPartsWithNoIdAndDescription = contigParts.splice(1, contigParts.length);
	        //
	        // Very rarely the second line can be a comment
	        // If the first element won't match regex then assume it is a comment
	        //
	        if (! WGST.regex.DNA_SEQUENCE.test(contigPartsWithNoIdAndDescription[0].trim())) {
	            // Remove comment element from the array
	            contigPartsWithNoIdAndDescription = contigPartsWithNoIdAndDescription.splice(1, contigPartsWithNoIdAndDescription.length);
	        }
	        //
	        // Contig string without id, description, comment is only left with DNA sequence string(s).
	        //
	        //
	        // Convert array of DNA sequence substrings into a single string
	        // Remove whitespace
	        //
	        var dnaString = contigPartsWithNoIdAndDescription.join('').replace(/\s/g, '');

	        return dnaString;
	    };

	    window.WGST.exports.extractDnaStringsFromContigs = function(contigs) {
	        var dnaStrings = [],
	            dnaString;
	        contigs.forEach(function(contig) {
	            dnaString = window.WGST.exports.extractDnaStringFromContig(contig);
	            dnaStrings.push(dnaString);
	        });
	        return dnaStrings;
	    };

	    window.WGST.exports.isValidDnaString = function(dnaString) {
	        return WGST.regex.DNA_SEQUENCE.test(dnaString);
	    };

	    window.WGST.exports.isValidContig = function(contig) {
	        var contigParts = window.WGST.exports.splitContigIntoParts(contig);
	        var dnaString = window.WGST.exports.extractDnaStringFromContig(contig);

	        return (contigParts.length > 1 && window.WGST.exports.isValidDnaString(dnaString));
	    };

	    window.WGST.exports.calculateN50 = function(dnaSequenceStrings) {
	        //
	        // Calculate N50
	        // http://www.nature.com/nrg/journal/v13/n5/box/nrg3174_BX1.html
	        //

	        // Order array by sequence length DESC
	        var sortedDnaSequenceStrings = dnaSequenceStrings.sort(function(a, b){
	            return b.length - a.length;
	        });

	        // Calculate sums of all nucleotides in this assembly by adding current contig's length to the sum of all previous contig lengths
	        // Contig length === number of nucleotides in this contig
	        var assemblyNucleotideSums = [],
	            // Count sorted dna sequence strings
	            sortedDnaSequenceStringCounter = 0;

	        for (; sortedDnaSequenceStringCounter < sortedDnaSequenceStrings.length; sortedDnaSequenceStringCounter++) {
	            if (assemblyNucleotideSums.length > 0) {
	                // Add current contig's length to the sum of all previous contig lengths
	                assemblyNucleotideSums.push(sortedDnaSequenceStrings[sortedDnaSequenceStringCounter].length + assemblyNucleotideSums[assemblyNucleotideSums.length - 1]);
	            } else {
	                // This is a "sum" of a single contig's length
	                assemblyNucleotideSums.push(sortedDnaSequenceStrings[sortedDnaSequenceStringCounter].length);
	            }
	        }

	        // Calculate one-half of the total sum of all nucleotides in the assembly
	        var assemblyNucleotidesHalfSum = Math.floor(assemblyNucleotideSums[assemblyNucleotideSums.length - 1] / 2);

	        //
	        // Sum lengths of every contig starting from the longest contig
	        // until this running sum equals one-half of the total length of all contigs in the assembly.
	        //

	        // Store nucleotides sum
	        var assemblyNucleotidesSum = 0,
	            // N50 object
	            assemblyN50 = {},
	            // Count again sorted dna sequence strings
	            sortedDnaSequenceStringCounter = 0;

	        for (; sortedDnaSequenceStringCounter < sortedDnaSequenceStrings.length; sortedDnaSequenceStringCounter++) {
	            // Update nucleotides sum
	            assemblyNucleotidesSum = assemblyNucleotidesSum + sortedDnaSequenceStrings[sortedDnaSequenceStringCounter].length;
	            // Contig N50 of an assembly is the length of the shortest contig in this list
	            // Check if current sum of nucleotides is greater or equals to half sum of nucleotides in this assembly
	            if (assemblyNucleotidesSum >= assemblyNucleotidesHalfSum) {
	                assemblyN50['sequenceNumber'] = sortedDnaSequenceStringCounter + 1;
	                assemblyN50['sum'] = assemblyNucleotidesSum;
	                assemblyN50['sequenceLength'] = sortedDnaSequenceStrings[sortedDnaSequenceStringCounter].length;
	                break;
	            }
	        }

	        return assemblyN50;
	    };

	    window.WGST.exports.calculateTotalNumberOfNucleotidesInDnaStrings = function(dnaStrings) {
	        var totalNumberOfNucleotidesInDnaStrings = 0;
	        dnaStrings.forEach(function(dnaString, index, array){
	            totalNumberOfNucleotidesInDnaStrings = totalNumberOfNucleotidesInDnaStrings + dnaString.length;
	        });
	        return totalNumberOfNucleotidesInDnaStrings;

	        //
	        // Reduce doesn't seem to work as expected
	        //
	        // var totalNumberOfNucleotidesInDnaStrings = dnaStrings.reduce(function(previousDnaString, currentDnaString, index, array) {
	        //     return previousDnaString.length + currentDnaString.length;
	        // }, '');
	        // return totalNumberOfNucleotidesInDnaStrings;
	    };

	    window.WGST.exports.calculateAverageNumberOfNucleotidesInDnaStrings = function(dnaStrings) {
	        var totalNumberOfNucleotidesInDnaStrings = window.WGST.exports.calculateTotalNumberOfNucleotidesInDnaStrings(dnaStrings);
	        var numberOfDnaStrings = dnaStrings.length;
	        var averageNumberOfNucleotidesInDnaStrings = Math.floor(totalNumberOfNucleotidesInDnaStrings / numberOfDnaStrings);
	        return averageNumberOfNucleotidesInDnaStrings;
	    };

	    window.WGST.exports.calculateSmallestNumberOfNucleotidesInDnaStrings = function(dnaStrings) {
	        var numberOfNucleotidesInDnaStrings = dnaStrings.map(function(dnaString){
	            return dnaString.length;
	        });
	        var smallestNumberOfNucleotidesInDnaStrings = numberOfNucleotidesInDnaStrings.reduce(function(previousNumberOfNucleotidesInDnaString, currentNumberOfNucleotidesInDnaString, index, array){
	            return Math.min(previousNumberOfNucleotidesInDnaString, currentNumberOfNucleotidesInDnaString);
	        });
	        return smallestNumberOfNucleotidesInDnaStrings;
	    };

	    window.WGST.exports.calculateBiggestNumberOfNucleotidesInDnaStrings = function(dnaStrings) {
	        var numberOfNucleotidesInDnaStrings = dnaStrings.map(function(dnaString){
	            return dnaString.length;
	        });
	        var biggestNumberOfNucleotidesInDnaStrings = numberOfNucleotidesInDnaStrings.reduce(function(previousNumberOfNucleotidesInDnaString, currentNumberOfNucleotidesInDnaString, index, array){
	            return Math.max(previousNumberOfNucleotidesInDnaString, currentNumberOfNucleotidesInDnaString);
	        });
	        return biggestNumberOfNucleotidesInDnaStrings;
	    };

	    window.WGST.exports.calculateSumsOfNucleotidesInDnaStrings = function(dnaStrings) {
	        //
	        // Get array of sums: [1, 2, 3, 6, 12, etc]
	        //

	        //
	        // Sort dna strings by their length
	        //
	        var sortedDnaStrings = dnaStrings.sort(function(a, b){
	            return b.length - a.length;
	        });

	        //
	        // Calculate sums of all nucleotides in this assembly by adding current contig's length to the sum of all previous contig lengths
	        //
	        var sumsOfNucleotidesInDnaStrings = [];
	        sortedDnaStrings.forEach(function(sortedDnaString, index, array){
	            if (sumsOfNucleotidesInDnaStrings.length === 0) {
	                sumsOfNucleotidesInDnaStrings.push(sortedDnaString.length);
	            } else {
	                sumsOfNucleotidesInDnaStrings.push(sortedDnaString.length + sumsOfNucleotidesInDnaStrings[sumsOfNucleotidesInDnaStrings.length - 1]);
	            }
	        });

	        return sumsOfNucleotidesInDnaStrings;

	        //
	        // Deprecated: previously working solution
	        //
	        // // Calculate sums of all nucleotides in this assembly by adding current contig's length to the sum of all previous contig lengths
	        // // Contig length === number of nucleotides in this contig
	        // var assemblyNucleotideSums = [],
	        //     // Count sorted dna sequence strings
	        //     sortedDnaStringCounter = 0;

	        // for (; sortedDnaStringCounter < sortedDnaStrings.length; sortedDnaStringCounter++) {
	        //     if (assemblyNucleotideSums.length > 0) {
	        //         // Add current contig's length to the sum of all previous contig lengths
	        //         assemblyNucleotideSums.push(sortedDnaStrings[sortedDnaStringCounter].length + assemblyNucleotideSums[assemblyNucleotideSums.length - 1]);
	        //     } else {
	        //         // This is a "sum" of a single contig's length
	        //         assemblyNucleotideSums.push(sortedDnaStrings[sortedDnaStringCounter].length);
	        //     }
	        // }
	        // return assemblyNucleotideSums;
	    };

	    //
	    // Once I will migrate to React.js this function will not be needed anymore
	    //
	    // var showDroppedAssembly = function(fileUid) {

	    //     var uid = '';
	    //     if (typeof fileUid === 'undefined') {
	    //         // Show first one
	    //         uid = WGST.dragAndDrop.loadedFiles[0].uid;
	    //         console.log('A: Showing this dropped assembly: ' + WGST.dragAndDrop.loadedFiles[0].uid);
	    //         //WGST.dragAndDrop.droppedFiles[0].uid
	    //     } else {
	    //         console.log('B: Showing this dropped assembly: ' + fileUid);
	    //         uid = fileUid;
	    //     }

	    //     $('.wgst-upload-assembly__analytics').hide();
	    //     $('.wgst-upload-assembly__analytics[data-file-uid="' + uid + '"]').show();
	    //     $('.wgst-upload-assembly__metadata').hide();
	    //     $('.wgst-upload-assembly__metadata[data-file-uid="' + uid + '"]').show();

	    //     //
	    //     // Quite an elegant way of finding object by it's property value in array
	    //     //
	    //     var loadedFile = WGST.dragAndDrop.loadedFiles.filter(function(loadedFile) {
	    //         return loadedFile.uid === uid; // filter out appropriate one
	    //     })[0];

	    //     // Set file name in metadata panel title
	    //     $('.wgst-panel__assembly-upload-metadata .header-title small').text(loadedFile.file.name);

	    //     // Set file name in analytics panel title
	    //     $('.wgst-panel__assembly-upload-analytics .header-title small').text(loadedFile.file.name);
	    
	    //     // Set file name in navigator
	    //     $('.assembly-file-name').text(loadedFile.file.name);
	    // };

	    window.WGST.exports.validateContigs = function(contigs) {

	        var validatedContigs = {
	            valid: [],
	            invalid: []
	        };

	        //
	        // Validate each contig
	        //
	        contigs.forEach(function(contig, index, contigs) {

	            var contigParts = window.WGST.exports.splitContigIntoParts(contig);
	            var dnaString = window.WGST.exports.extractDnaStringFromContig(contig);
	            var dnaStringId = window.WGST.exports.extractDnaStringIdFromContig(contig);

	            // Valid contig
	            if (window.WGST.exports.isValidContig(contig)) {
	                validatedContigs.valid.push({
	                    id: dnaStringId,
	                    dnaString: dnaString
	                });

	            // Invalid contig
	            } else {
	                validatedContigs.invalid.push({
	                    id: dnaStringId,
	                    dnaString: dnaString
	                });
	            }
	        });

	        return validatedContigs;
	    };

	    window.WGST.exports.drawN50Chart = function(chartData, assemblyN50, appendToClass) {

	        var chartWidth = 460,
	            chartHeight = 312;

	        // Extent
	        var xExtent = d3.extent(chartData, function(datum){
	            return datum.sequenceLength;
	        });

	        // Scales

	        // X
	        var xScale = d3.scale.linear()
	            .domain([0, chartData.length])
	            .range([40, chartWidth - 50]); // the pixels to map, i.e. the width of the diagram

	        // Y
	        var yScale = d3.scale.linear()
	            .domain([chartData[chartData.length - 1], 0])
	            .range([30, chartHeight - 52]);

	        // Axes

	        // X
	        var xAxis = d3.svg.axis()
	            .scale(xScale)
	            .orient('bottom')
	            .ticks(10);

	        // Y
	        var yAxis = d3.svg.axis()
	            .scale(yScale)
	            .orient('left')
	            // http://stackoverflow.com/a/18822793
	            .ticks(10);

	        // Append SVG to DOM
	        var svg = d3.select(appendToClass)
	            .append('svg')
	            .attr('width', chartWidth)
	            .attr('height', chartHeight);

	        // Append axis

	        // X
	        svg.append('g')
	            .attr('class', 'x axis')
	            .attr('transform', 'translate(20, 260)')
	            .call(xAxis);

	        // Y
	        svg.append('g')
	            .attr('class', 'y axis')
	            .attr('transform', 'translate(60, 0)')
	            .call(yAxis);

	        // Axis labels

	        // X
	        svg.select('.x.axis')
	            .append('text')
	            .text('Ordered contigs')
	            .attr('class', 'axis-label')
	            .attr('text-anchor', 'end')
	            .attr('x', (chartWidth / 2) + 49)
	            .attr('y', 45);

	        // Y
	        svg.select('.y.axis')
	            .append('text')
	            .text('Nucleotides sum')
	            .attr('class', 'axis-label')
	            .attr('transform', 'rotate(-90)')
	            .attr('x', -(chartHeight / 2) - 44)
	            .attr('y', 398);

	        // Circles
	        svg.selectAll('circle')
	            .data(chartData)
	            .enter()
	            .append('circle')
	            .attr('cx', function(datum, index){
	                return xScale(index + 1) + 20;
	            })
	            .attr('cy', function(datum){
	                return yScale(datum);
	            })
	            .attr('r', 5);

	        // Line
	        var line = d3.svg.line()
	           //.interpolate("basis")
	           .x(function(datum, index) {
	                return xScale(index + 1) + 20; 
	            })
	           .y(function(datum) { 
	                return yScale(datum); 
	            });

	        svg.append('path')
	            .attr('d', line(chartData));

	        // Draw line from (0,0) to d3.max(data)
	        var rootLineData = [{
	            'x': xScale(0) + 20,
	            'y': yScale(0)
	        },
	        {
	            'x': xScale(1) + 20,
	            'y': yScale(chartData[0])
	        }];

	        var rootLine = d3.svg.line()
	            .x(function(datum) {
	                return datum.x;
	            })
	            .y(function(datum) {
	                return datum.y;
	            })
	            .interpolate("linear");

	        var rootPath = svg.append('path')
	            .attr('d', rootLine(rootLineData));

	        // Draw N50

	/*          svg.selectAll('.n50-circle')
	            .data([n50])
	            .enter()
	            .append('circle')
	            .attr('cx', function(datum){
	                return xScale(datum.index) + 20;
	            })
	            .attr('cy', function(datum){
	                return yScale(datum.sum);
	            })
	            .attr('r', 6)
	            .attr('class', 'n50-circle')*/

	        // Group circle and text elements
	        var n50Group = svg.selectAll('.n50-circle')
	            .data([assemblyN50])
	            .enter()
	            .append('g')
	            .attr('class', 'n50-group');

	        // Append circle to group
	        var n50Circle = n50Group.append('circle')
	            .attr('cx', function(datum){
	                return xScale(datum.sequenceNumber) + 20;
	            })
	            .attr('cy', function(datum){
	                return yScale(datum.sum);
	            })
	            .attr('r', 6);
	            //.attr('class', 'n50-circle');
	        
	        // Append text to group
	        n50Group.append('text')
	            .attr('dx', function(datum){
	                return xScale(datum.sequenceNumber) + 20 + 9;
	            })
	            .attr('dy', function(datum){
	                return yScale(datum.sum) + 5;
	            })
	            .attr("text-anchor", 'right')
	            .text('N50');
	                //.attr('class', 'n50-text');

	        // Draw N50 lines
	        var d50LinesData = [{
	            'x': 54,
	            'y': yScale(assemblyN50.sum)
	        },
	        {
	            'x': xScale(assemblyN50.sequenceNumber) + 20,
	            'y': yScale(assemblyN50.sum)
	        },
	        {
	            'x': xScale(assemblyN50.sequenceNumber) + 20,
	            'y': chartHeight - 46
	        }];

	        var d50Line = d3.svg.line()
	            .x(function(datum) {
	                return datum.x;
	            })
	            .y(function(datum) {
	                return datum.y;
	            })
	            .interpolate("linear");

	        // N50 path
	        n50Group.append('path').attr('d', d50Line(d50LinesData));

	    };

	})();

});