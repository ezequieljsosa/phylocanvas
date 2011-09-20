function getY( oElement )
{
 var iReturnValue = 0;
 while( oElement != null ) {
	iReturnValue += oElement.offsetTop;
	oElement = oElement.offsetParent;
 }
 return iReturnValue;
}

function getX( oElement )
{
 var iReturnValue = 0;
 while( oElement != null ) {
	iReturnValue += oElement.offsetLeft;
	oElement = oElement.offsetParent;
 }
 return iReturnValue;
}

PhyloCanvas = 
{
	createHandler : function(obj, func)
	{
		return (function(e){return obj[func](e);})
	},
	//Non-static members
	Angles:{
		FORTYFIVE : Math.PI / 4,
		QUARTER : Math.PI / 2,
		HALF : Math.PI,
		FULL : 2 * Math.PI
	},	
	Branch : function()
	{
		this.id = "";
		this.children = [];	
		this.canvas;
		
		this.startx = 0;
		this.starty = 0;
		this.interx = 0;
		this.intery = 0;
		this.centerx = 0;
		this.centery = 0;
		this.childNo = 0;
		this.depth = 0;
		this.leaf = true;
		this.radius =  1.0;
		this.nodeShape = "circle";
		this.selected = false;
		this.color =  "rgba(0,0,0,1)";
		
		this.parent = null;
		this.tree = {};
		this.branchLength =  0;
		this.totalBranchLength = this.branchLength;
		this.angle;
		this.label = "";
		this.collapsed = false;
		//for circular drawing
		this.minChildAngle = PhyloCanvas.Angles.FULL;
		this.maxChildAngle = 0;
		
		//events
		this.onselected = null;
	},
	Loader : function(div)
	{
		this.div = div;
		this.cl = document.createElement('canvas');
		this.cl.id = div.id + 'Loader';
		this.cl.style.position = 'absolute';
		this.cl.style.backgroundColor = '#FFFFFF';
		this.cl.style.top = (div.offsetHeight/4) + "px";  
		this.cl.style.left = (div.offsetWidth/4) + "px";
		this.cl.height = div.offsetHeight/2;
		this.cl.width = div.offsetWidth/2;
		this.cl.style.zIndex = '1000';
		div.appendChild(this.cl);
		this.ctx = this.cl.getContext('2d');
		this.drawer;
		this.loader_radius;
		this.loader_step = (2 * Math.PI) / 360;    
  
        this.message = "Loading ...";
	},
	Navigator : function()
	{
		
	},
	Tree : function(div)
	{
		this.branches = {};
		this.leaves = [];
		this.loader = new PhyloCanvas.Loader(div);
		this.root = false;
		
		this.canvasEl = div;
		this.canvasEl.style.position = 'relative';
         var cl = document.createElement('canvas');
         cl.id = div.id + 'pCanvas';
         cl.style.position = 'relative';
         cl.style.backgroundColor = '#FFFFFF';
         cl.height = div.height;
         cl.width = div.width;
         cl.style.zIndex = '1';
         this.canvasEl.appendChild(cl);
      
         this.drawn = false;
	
		 this.selectedNodes = [];
		 
         this.zoom = 1;
         this.pickedup = false;
         this.dragging = false;
         this.startx; this.starty;
         this.pickedup = false;
         this.baseNodeSize = 1;
         this.curx;
         this.cury;
         this.origx;
         this.origy;
		 
         this.loader.run();
         this.navigator = new PhyloCanvas.Navigator(div);

         this.canvas = cl.getContext('2d');
         this.canvas.canvas.onselectstart = function () { return false; }
         this.canvas.fillStyle = "#000000";
         this.canvas.strokeStyle = "#000000";
         
         this.offsetx = this.canvas.canvas.width/2;
         this.offsety = this.canvas.canvas.height/2;
         this.selectedColor = "rgba(49,151,245,1)";
		 this.highlightColor = "rgba(49,151,245,1)";
		 this.highlightWidth = 3.0;
		 this.selectedNodeSizeIncrease = 0;
         this.branchColor = "rgba(0,0,0,1)";
         this.branchScalar = 1.0;
		 
         this.showLabels = true;
		 this.showBootstraps = false;
		 
         this.treeType = PhyloCanvas.TreeType.RECTANGULAR;
         this.maxBranchLength = 0;
         this.lineWidth = 1.0;
         this.textSize = 10;
      
         this.minX = Number.MAX_VALUE;
         this.maxX = -1.0 * Number.MAX_VALUE;
         this.minY = Number.MAX_VALUE;
         this.maxY = -1.0* Number.MAX_VALUE;
         
		 this.unselectOnClickAway = true;
		 this.rightClickZoom = false;
		 
         this.onselected = null;
		
		 //if(this.showControls) this.drawControls();
		this.canvas.canvas.oncontextmenu = PhyloCanvas.createHandler(this, "clicked");
		this.canvas.canvas.onclick = PhyloCanvas.createHandler(this, "clicked");
		this.canvas.canvas.ondblclick =  PhyloCanvas.createHandler(this, "dblclicked");
		this.canvas.canvas.onmousedown =  PhyloCanvas.createHandler(this, "pickup");
		this.canvas.canvas.onmouseup =  PhyloCanvas.createHandler(this, "drop");
		this.canvas.canvas.onmouseout =  PhyloCanvas.createHandler(this, "drop");
		this.canvas.canvas.onmousemove =  PhyloCanvas.createHandler(this, "drag");
	},
	TreeType:{
		RECTANGULAR : 0,
		RADIAL: 1,
		CIRCULAR: 2,
        DIAGONAL: 3,
        HIERARCHY: 4
        
	}
}

//static members
PhyloCanvas.Loader.prototype = {
		
	           
         run : function() // ctx = Canvas 2d Context
         {
             var i = 0;
             this.cl.style.diangle = "block";
             this.initLoader();
             var loader = this;
             this.drawer = setInterval(function(){
                 loader.drawLoader(i);
                 i++;    
             }, 10);
         
         },
		 resize : function()
         {
            this.cl.style.top = "2px";  
            this.cl.style.left = "2px";
            this.cl.height = this.div.offsetHeight * .75;
            this.cl.width = this.div.offsetWidth  * .75;
            
            this.ctx.strokeStyle = 'rgba(180,180,255,1)';
            this.ctx.fillStyle = 'rgba(180,180,255,1)';
            this.ctx.lineWidth = 10.0;
             
            this.ctx.font = "24px sans-serif";
             
            this.ctx.shadowOffsetX = 2.0;
            this.ctx.shadowOffsetY = 2.0;

         },
		 initLoader : function()
         {
             this.ctx.strokeStyle = 'rgba(180,180,255,1)';
             this.ctx.fillStyle = 'rgba(180,180,255,1)';
             this.ctx.lineWidth = 10.0;
             
             this.ctx.font = "24px sans-serif";
             
             this.ctx.shadowOffsetX = 2.0;
             this.ctx.shadowOffsetY = 2.0;
         },
		 drawLoader : function (t)
         {   
             this.ctx.restore();
             
             this.ctx.translate(0,0); 
             this.loader_radius = Math.min(this.ctx.canvas.width/4, this.ctx.canvas.height/4)
            
             this.ctx.save()
             this.ctx.clearRect(0,0,this.ctx.canvas.width,this.ctx.canvas.height);
            this.ctx.translate(this.ctx.canvas.width/2, this.ctx.canvas.height/2);
             
             this.ctx.beginPath();
             this.ctx.arc(0,0, this.loader_radius, this.loader_step * t, this.loader_step * t + 2);
             this.ctx.stroke();
            
             this.ctx.beginPath();
             this.ctx.arc(0,0, this.loader_radius, this.loader_step * t + 3, this.loader_step * t + 5); 
             this.ctx.stroke();
             var txt = this.message;
             this.ctx.fillText(txt, -(this.ctx.measureText(txt).width / 2), this.loader_radius + 50, this.cl.width);
             
             
         },
		 stop : function(){
            clearInterval(this.drawer);
            this.cl.style.display = "none";
         },
		 fail : function(message)
		 {
			clearInterval(this.drawer);
			this.loader_radius = Math.min(this.ctx.canvas.width/4, this.ctx.canvas.height/4)
			 this.ctx.restore();
             
             this.ctx.translate(0,0); 
			 this.ctx.clearRect(0,0,this.ctx.canvas.width,this.ctx.canvas.height);
            //	this.ctx.translate(this.ctx.canvas.width/2, this.ctx.canvas.height/2);
             
             this.ctx.beginPath();
			
			this.ctx.strokeStyle = 'rgba(255,180,180,1)';
            this.ctx.fillStyle = 'rgba(255,180,180,1)';
			
			this.ctx.translate(this.ctx.canvas.width/2, this.ctx.canvas.height/2);
			
			this.ctx.beginPath();
			
			this.ctx.moveTo(0,0);
			this.ctx.lineTo(this.loader_radius, this.loader_radius);
			this.ctx.moveTo(0,0);
			this.ctx.lineTo(-this.loader_radius, this.loader_radius);
			this.ctx.moveTo(0,0);
			this.ctx.lineTo(-this.loader_radius, -this.loader_radius);
			this.ctx.moveTo(0,0);
			this.ctx.lineTo(this.loader_radius, -this.loader_radius);
			this.ctx.stroke();
			
			
			this.ctx.fillText(message, -(this.ctx.measureText(message).width / 2), this.loader_radius + 50, this.loader_radius * 2);
		 }
};
PhyloCanvas.Navigator.prototype = {};
PhyloCanvas.Branch.prototype = {
	addChild : function(node)
	{
		node.parent = this;
		node.childNo = this.children.length;
		node.depth = this.depth + 1;
		node.canvas = this.canvas;
		node.tree = this.tree;
		this.children.push(node);
	},
	clicked : function(x,y)
	{
		
		if(x < (this.maxx ) && x > (this.minx ))
		{
			if(y < (this.maxy ) && y > (this.miny ))
			{
				return this;	
			}
		}
		for(var i = this.children.length - 1; i >= 0; i--)
		{
			cld = this.children[i].clicked(x,y);
			if(cld) return cld;
		}
		return false;
	},
	drawLabel : function()
	{
	   // var  h = (/this.tree.zoom) ;
	    try{
		this.canvas.font = (this.tree.textSize/this.tree.zoom) + "px sans-serif"

		var lbl = this.id;
		
		var dim = this.canvas.measureText(lbl);
		var tx = this.centerx + (dim.width *(0.5 * Math.cos(this.angle) - 0.5 )) + ((5 + this.radius * 2)* Math.cos(this.angle));
		var ty = this.centery +(this.tree.textSize * (0.5 * Math.sin(this.angle)) + 0.5) +  ((5 + this.radius * 2)* Math.sin(this.angle));
		this.canvas.beginPath();
		this.canvas.fillStyle = (this.selected)?  this.tree.selectedColor : this.tree.branchColor;
		this.canvas.fillText(lbl, tx ,ty);
		this.canvas.closePath();
		}catch(e){alert(e);}
	},
	drawNode : function()
	{
		var  r = (this.radius * this.tree.baseNodeSize) + (this.selected ? this.tree.selectedNodeSizeIncrease : 0); //r = node radius
		var theta = this.radius * this.tree.baseNodeSize; //theta = translation to center of node... ensures that the node edge is at the end of the branch so the branches don't look shorter than  they should
		
		var cx = (theta * Math.cos(this.angle))+this.centerx;
		var cy = (theta * Math.sin(this.angle))+this.centery;
		
		this.canvas.beginPath();
		this.canvas.fillStyle = this.selected ? this.tree.selectedColor:this.color ;
		if((r * this.tree.zoom) < 5)
		{
		   var e =  (5 / this.tree.zoom)
		   this.minx = cx - e;
		   this.maxx = cx + e;
		   this.miny = cy - e;
		   this.maxy = cy + e;
		}
		else
		{
		   this.minx =  cx - r;
		   this.maxx = cx + r;
		   this.miny= cy - r;
		   this.maxy = cy + r;
		}
		if(this.collapsed)
		{
			var minx = this.radius * 5 * Math.cos(this.angle - PhyloCanvas.Angles.QUARTER);
			var miny = this.radius * 5 * Math.sin(this.angle - PhyloCanvas.Angles.QUARTER);
			var maxx = this.radius * 5 * Math.cos(this.angle);
			var maxy = this.radius * 5 * Math.sin(this.angle);
			this.canvas.moveTo((cx - minx), (cx - miny));
			this.canvas.lineTo((cx + minx), (cx + miny));
			this.canvas.lineTo((cx + maxx), (cx + maxy));
			this.canvas.lineTo((cx - minx), (cx - miny));
			this.canvas.fill();
		}
		else if(this.leaf)
		{
			this.tree.nodeRenderers[this.nodeShape](this);
			this.canvas.stroke();
			this.canvas.fill();
			if(this.tree.showLabels) this.drawLabel();
		}
	
		this.canvas.closePath();
		
		
		 if(this.highlighted)
		 {
		   var l = this.canvas.lineWidth;
		   this.canvas.strokeStyle = this.tree.highlightColor;
		   this.canvas.lineWidth = this.tree.highlightWidth / this.tree.zoom;
		   this.canvas.arc(cx, cy, r + ((5 + ( this.tree.highlightWidth/ 2)) / this.tree.zoom), 0, PhyloCanvas.Angles.FULL, false);
		   this.canvas.stroke();
		   this.canvas.lineWidth = l;
		   this.canvas.strokeStyle = this.tree.branchColor;
		 }
	},
	getChildCount : function()
	{
		if(this.leaf) return 1;
		var children = 0;
		for(var x = 0; x < this.children.length; x++)
		{
			children += this.children[x].getChildCount();
		}
		return children;
	},
	getChildYTotal : function()
	{
	 if(this.leaf) return this.centery;
	 
	 var y = 0;
	 for(var i = 0; i < this.children.length; i++)
	 {
		y += this.children[i].getChildYTotal();
	 }
	 return y;
	},
	setSelected : function(selected, applyToChildren)
	{
		var ids = this.id;
		this.selected = selected;
		if(applyToChildren){
			for(var i = 0; i < this.children.length; i++)
			{
			  ids = ids + "," + this.children[i].setSelected(selected, applyToChildren);
			}
		}
		return ids;
	},
	setHighlighted : function(highlighted)
	{
		//var ids = this.id;
		this.highlighted = highlighted;
		if(!highlighted){
			for(var i = 0; i < this.children.length; i++)
			{
			  this.children[i].setHighlighted(highlighted);
			}
		}
		//return ids;
	},
	reset : function()
	{
		this.startx = 0;
		this.starty = 0;
		this.centerx = 0;
		this.centery = 0;
		this.angle = null;
		//this.totalBranchLength = 0;
		this.minChildAngle = PhyloCanvas.Angles.FULL;
		this.maxChildAngle = 0;
		for(cld in this.children)
		{
			try{
				this.children[cld].pcReset();
			}catch(e){}
		}
	},
	parseNwk :function(nwk, idx)
	{
		idx = this.parseLabel(nwk,idx);
		if(nwk[idx] == ":")
		{
			idx = this.parseNodeLength(nwk, idx + 1);
		}
		else
		{
			this.branchLength = 0.01;
		}
		if(!this.id || this.id == "") this.id = this.tree.genId();
		return idx;
	},
	parseLabel : function(nwk, idx)
	{	 
		var lbl = "";
		for(idx; nwk[idx] != ":" && nwk[idx] != "," && nwk[idx] != ")" && idx < nwk.length; idx++)
		{
		   lbl += nwk[idx];
		}
		if(!lbl) return idx;
		if(lbl.match(/\*/))
		{
			var bits = lbl.split("**");
			this.id = bits[0];
			if(bits.length == 1 ) return idx;
			// if(pcdebug && Ext) Ext.get(pcdebug).update(pcdebug.innerText + '\nNode Colour is : ' + bits[b+1]); && Ext) Ext.get(pcdebug).update(pcdebug.innerHtml + '<br />label is : ' + bits[0]);
			bits = bits[1].split("*");
		
			for(var b = 0; b < bits.length; b += 2)
			{
			   switch (bits[b])
			   {
				  case "nsz" :
					  // if(pcdebug && Ext) Ext.get(pcdebug).update(pcdebug.innerText + '\nNode Colour is : ' + bits[b+1]); && Ext) Ext.get(pcdebug).update(pcdebug.innerHtml + '<br />Node Size is : ' + bits[b+1]);
					 this.radius = parseInt(bits[b+1]);
					 break;
				  case "nsh" : this.nodeShape = PhyloCanvas.Shapes[bits[b+1]];
					 // if(pcdebug && Ext) Ext.get(pcdebug).update(pcdebug.innerText + '\nNode Colour is : ' + bits[b+1]); && Ext) Ext.get(pcdebug).update(pcdebug.innerHtml + '<br />Node shape is : ' + bits[b+1]);
					 break;
				  case "ncol" : this.color = bits[b+1];
					 var hexRed = '0x' + this.color.substring(0,2);
					 var hexGreen = '0x' + this.color.substring(2,4);
					 var hexBlue = '0x' + this.color.substring(4,6);
					 this.color = 'rgba('+parseInt(hexRed, 16).toString()+','+parseInt(hexGreen, 16).toString()+','+parseInt(hexBlue, 16).toString()+',1)';
					 // if(pcdebug && Ext) Ext.get(pcdebug).update(pcdebug.innerText + '\nNode Colour is : ' + bits[b+1]); && Ext) Ext.get(pcdebug).update(pcdebug.innerHtml + '<br />Node Colour is : ' + bits[b+1]);
					 break;
			   }
			}
		}
		else
		{
			this.id = lbl;				
		}	
		return idx;
	},
	parseNodeLength : function(nwk, idx)
	{
		var str = "";
		for(idx; nwk[idx] != ")" && nwk[idx] != ","; idx++)
		{
		   str += nwk[idx];
		}
		 
		this.branchLength = parseFloat(str);
		return idx;
	},
	setNodeColourAndShape : function(nids, color, shape, size)
	{
		var re = new RegExp("(^|,)" + this.label + "(,|$)", "g");
		if( nids === true ||nids.match(re))
		{
		   if(nids !== true)nids.replace(re, "");
		   if(color)this.color = color;
		   if(PhyloCanvas.Shapes[shape])this.nodeShape = PhyloCanvas.Shapes[shape];
		   if(size > 1) this.radius = size;
		}
		for(var i = 0; i < this.children.length; i++)
		{
		   nids = this.children[i].setNodeColourAndShape(nids, color, shape, size);
		   if(nids == "") break;
		}
		return nids;
	},
	setTotalLength : function()
	{
		if(this.parent)
		{
			this.totalBranchLength = this.parent.totalBranchLength +  this.branchLength;
			if(this.totalBranchLength > this.tree.maxBranchLength) this.tree.maxBranchLength = this.totalBranchLength;
		}
		else
		{
			this.totalBranchLength = this.branchLength;
			
		}
		for(var c = 0; c < this.children.length ; c++)
		{
			this.children[c].setTotalLength();
		}
	}
};
PhyloCanvas.Tree.prototype = {
	draw : function()
	{
		this.selectedNodes = [];
				
		this.canvas.restore();
		this.canvas.clearRect(0,0,this.canvas.canvas.width,this.canvas.canvas.height);
		this.canvas.lineCap = "round";
		this.canvas.lineJoin = "round"
		
		this.canvas.strokeStyle = this.branchColor;
		this.canvas.save();
	
		var maxDim = (this.canvas.canvas.width < this.canvas.canvas.height ? this.canvas.canvas.width : this.canvas.canvas.height);
		
		if(!this.drawn)
		{
			this.root.setTotalLength();
			this.prerenderers[this.treeType](this);
		}
		this.canvas.translate(this.offsetx, this.offsety);
		this.canvas.scale(this.zoom, this.zoom);
		this.canvas.lineWidth = this.lineWidth / this.zoom;
		
		this.branchRenderers[this.treeType](this, this.root);
		
		for(var i = 0; i < this.selectedNodes.length; i++)
		{
			this.branchRenderers[this.treeType](this, this.selectedNodes[i]);
		}
		this.drawn = true;
		this.loader.stop();
	},
	genId : function()
	{
		var id = "pcn0";
		for(var i = 1; this.branches[id] ;i++)
		{
			id = "pcn" + i;
		}
		return id;
	},
	nodeRenderers : {
		circle : function (node) { 
			node.canvas.arc(node.centerx + node.radius * Math.cos(node.angle), node.centery + node.radius * Math.sin(node.angle), node.radius, 0, PhyloCanvas.Angles.FULL, false); 
		},
		square : function (x, y, s, data) 
		{ 
			var x1 = x - r;
			var x2 = x + r;
			var y1 = y - r;
			var y2 = y + r;
			this.canvas.moveTo(x1, y1);
			this.canvas.lineTo(x1, y2);
			this.canvas.lineTo(x2, y2);
			this.canvas.lineTo(x2, y1);
			this.canvas.lineTo(x1, y1);
		},
		star: function (x, y, s, data) 
		{ 
			this.canvas.moveTo(cx, cy + r);
			var alpha = (2 * Math.PI) / 10;
			var rb = r * 1.5;
			for(var i = 11; i != 0; i--)
			{
				var ra = i % 2 == 1 ? rb: r;
				var omega = alpha * i;
				this.canvas.lineTo(cx + (ra * Math.sin(omega)), cy + (ra * Math.cos(omega)));
			}
		},
		triangle : function (x, y, s, data) 
		{ 
			var x1 = cx - r;
			var x2 = cx + r;
			var y1 =cy - r;
			var y2 = cy + r;
			this.canvas.moveTo(cx, y1);
			this.canvas.lineTo(x2, y2);
			this.canvas.lineTo(x1, y2);
			this.canvas.lineTo(cx, y1);
		}
	},
	prerenderers : 
	{
		rectangular : function(tree)
		{
			tree.root.startx = 0;
			tree.root.starty = 0;
			tree.root.centerx = 0;
			tree.root.centery = 0;
			tree.branchScalar = 1000;
			tree.leaves[0].angle = 0;
			tree.leaves[0].centery = 0;
			for(var i = 1; i < tree.leaves.length; i++)
			{
				tree.leaves[i].angle = 0;
				tree.leaves[i].centery = tree.leaves[i-1].centery + (2 * tree.leaves[i].radius) + 10;
				tree.leaves[i].centerx = tree.leaves[i].totalBranchLength;
				
				for(var nd = tree.leaves[i]; nd.parent; nd = nd.parent)
				{
					if(nd.childNo == 0)
					{
						nd.parent.centery = nd.centery;
					}
					if(nd.childNo == nd.parent.children.length - 1)
					{
						nd.parent.centery = (nd.parent.centery + nd.centery )/2; // (nd.parent.children.length - 1);
					}
					else
					{
						break;
					}
				}
			}
			var miny = tree.leaves[0].centery - tree.leaves[0].radius;
			var maxy = tree.leaves[tree.leaves.length - 1].centery + tree.leaves[tree.leaves.length - 1].radius;
			
			var minx = 0;
			var maxx = tree.maxBranchLength + (tree.leaves[0].radius * 2);
			
			tree.root.startx = tree.root.centerx;
			tree.root.starty = tree.root.centery;
			
			tree.offsetx = tree.canvas.canvas.width/2 - (maxx - minx) /2;
			tree.offsety = miny + 20;
			
			tree.zoom = Math.min((tree.canvas.canvas.width - 20) / (maxx - minx), (tree.canvas.canvas.height - 20) / (maxy - miny));
		}, 
		circular : function(tree)
		{
			tree.root.startx = 0;
			tree.root.starty = 0;
			tree.root.centerx = 0;
			tree.root.centery = 0;
			tree.branchScalar = 1000;
			// work out radius of tree and the make branch scalar proportinal to the 
			var r = (tree.leaves.length * tree.leaves[0].radius * 2) /PhyloCanvas.Angles.FULL;
			if(r > tree.branchScalar * tree.maxBranchLength) 
			{
				tree.branchScaler = r / tree.maxBranchLength;
			}
			else
			{
				r = tree.branchScalar * tree.maxBranchLength;
			}
			
			var step = PhyloCanvas.Angles.FULL / tree.leaves.length;
			
			for(var i = 0; i < tree.leaves.length; i++)
			{
				tree.leaves[i].angle = step * i;
				tree.leaves[i].centery = r * Math.sin(tree.leaves[i].angle);
				tree.leaves[i].centerx = r * Math.cos(tree.leaves[i].angle);
				tree.leaves[i].starty = ((tree.leaves[i].parent.totalBranchLength * tree.branchScalar)) * Math.sin(tree.leaves[i].angle);
				tree.leaves[i].startx = ((tree.leaves[i].parent.totalBranchLength * tree.branchScalar)) * Math.cos(tree.leaves[i].angle);
				tree.leaves[i].intery = ((tree.leaves[i].totalBranchLength * tree.branchScalar)) * Math.sin(tree.leaves[i].angle);
				tree.leaves[i].interx = ((tree.leaves[i].totalBranchLength * tree.branchScalar)) * Math.cos(tree.leaves[i].angle);
				for(var nd = tree.leaves[i]; nd.parent; nd = nd.parent)
				{
					if(nd.childNo == 0)
					{
						nd.parent.angle = nd.angle;
						nd.parent.minChildAngle = nd.angle;
					}
					if(nd.childNo == nd.parent.children.length - 1)
					{
						nd.parent.maxChildAngle = nd.angle;
						nd.parent.angle = (nd.parent.minChildAngle + nd.parent.maxChildAngle) / 2;
						nd.parent.centery = (nd.parent.totalBranchLength * tree.branchScalar) * Math.sin(nd.parent.angle);
						nd.parent.centerx = (nd.parent.totalBranchLength * tree.branchScalar) * Math.cos(nd.parent.angle);
						nd.parent.starty = ((nd.parent.totalBranchLength - nd.parent.branchLength) * tree.branchScalar) * Math.sin(nd.parent.angle);
						nd.parent.startx = ((nd.parent.totalBranchLength - nd.parent.branchLength) * tree.branchScalar) * Math.cos(nd.parent.angle);
					}
					else
					{
						break;
					}
				
				}
			}
			tree.offsetx = tree.canvas.canvas.width / 2;
			tree.offsety = tree.canvas.canvas.height / 2;
			
			tree.zoom = (Math.min(tree.canvas.canvas.width, tree.canvas.canvas.height) - tree.leaves[0].radius - 50 ) / (r * 2);
		},
		radial : function(tree)
		{
			tree.branchScalar = 1000;
			//tree.root.setTotalLength();
			
			var step = PhyloCanvas.Angles.FULL / tree.leaves.length;
			tree.root.startx = 0;
			tree.root.starty = 0;
			tree.root.centerx = 0;
			tree.root.centery = 0;
			
			for(var i = 0.0; i < tree.leaves.length; i += 1.0)
			{
				tree.leaves[i].angle = step * i;
				tree.leaves[i].centerx = tree.leaves[i].totalBranchLength * tree.branchScalar * Math.cos(tree.leaves[i].angle);
				tree.leaves[i].centery = tree.leaves[i].totalBranchLength * tree.branchScalar * Math.sin(tree.leaves[i].angle);
	
				for(var nd = tree.leaves[i]; nd.parent; nd = nd.parent)
				{
					if(nd.childNo == 0)
					{	
						nd.parent.angle = 0;
					}
					nd.parent.angle += (nd.angle * nd.getChildCount());
					if(nd.childNo == nd.parent.children.length - 1)
					{
						nd.parent.angle = nd.parent.angle / nd.parent.getChildCount();
					}
					else
					{
						break;
					}
				}
			}
			
			tree.minx = Number.MAX_VALUE;
			tree.maxx = -Number.MAX_VALUE;
			tree.miny = Number.MAX_VALUE;
			tree.maxy = -Number.MAX_VALUE;
			
			tree.nodePrerenderers.radial(tree, tree.root);
					
			var sx = (tree.maxx - tree.minx);
			var sy = (tree.maxy - tree.miny);
			
			tree.zoom = Math.min((tree.canvas.canvas.width - 50) / sx, (tree.canvas.canvas.height - 50) / sy);
			tree.offsetx = (tree.canvas.canvas.width/2) - ((tree.minx + tree.maxx)/2) * widget.zoom;
			tree.offsety = (tree.canvas.canvas.height/2)- ((tree.miny + tree.maxy)/2) * widget.zoom;
			
		},
		diagonal : function(tree)
		{
			for(var i = 0; i < tree.leaves.length; i++)
			{
				tree.leaves[i].centerx = 0;
				tree.leaves[i].centery = (i > 0 ? tree.leaves[i-1].centery + (2 * tree.leaves[i].radius) + 10 : 0);
				tree.leaves[i].angle = 0;
				
				for(var nd = tree.leaves[i]; nd.parent; nd = nd.parent)
				{
					if(nd.childNo == nd.parent.children.length - 1)
					{
						nd.parent.centery = nd.parent.getChildYTotal() / nd.parent.getChildCount(); // (nd.parent.children.length - 1);
						nd.parent.centerx = nd.parent.children[0].centerx + ((nd.parent.children[0].centery - nd.parent.centery) * Math.tan(PhyloCanvas.Angles.FORTYFIVE));
						for(var j = 0; j < nd.parent.children.length; j++)
						{
							nd.parent.children[j].startx = nd.parent.centerx
							nd.parent.children[j].starty = nd.parent.centery
						}
					}
					else
					{
						break;
					}
				}
			}
			
			var miny = tree.leaves[0].centery - tree.leaves[0].radius;
			var maxy = tree.leaves[tree.leaves.length - 1].centery + tree.leaves[tree.leaves.length - 1].radius;
			
			var minx = 0;
			var maxx = tree.maxBranchLength + (tree.leaves[0].radius * 2);
			
			tree.root.startx = tree.root.centerx;
			tree.root.starty = tree.root.centery;
			
			tree.offsetx = tree.canvas.canvas.width/2 - (maxx - minx) /2;
			tree.offsety = miny + 20;
			
			tree.zoom = Math.min((tree.canvas.canvas.width -20) / (maxx - minx), (tree.canvas.canvas.height -20) / (maxy - miny));
			
		},
		hierarchy : function(tree)
		{
			tree.root.startx = 0;
			tree.root.starty = 0;
			tree.root.centerx = 0;
			tree.root.centery = 0;
			tree.branchScalar = 1000;
			tree.leaves[0].angle =PhyloCanvas.Angles.QUARTER;
			tree.leaves[0].centerx = 0;
			for(var i = 1; i < tree.leaves.length; i++)
			{
				tree.leaves[i].angle = PhyloCanvas.Angles.QUARTER;
				tree.leaves[i].centerx = tree.leaves[i-1].centerx + (2 * tree.leaves[i].radius) + 10;
				tree.leaves[i].centery = tree.leaves[i].totalBranchLength * tree.branchScalar;
				
				for(var nd = tree.leaves[i]; nd.parent; nd = nd.parent)
				{
					if(nd.childNo == 0)
					{
						nd.parent.centerx = nd.centerx;
					}
					
					if(nd.childNo == nd.parent.children.length - 1)
					{
						nd.parent.angle = PhyloCanvas.Angles.QUARTER;
						nd.parent.centerx = (nd.parent.centerx + nd.centerx )/2;
						nd.parent.centery = nd.parent.totalBranchLength * tree.branchScalar;
						for(var j = 0; j < nd.parent.children.length; j++)
						{
							nd.parent.children[j].startx = nd.parent.centerx;
							nd.parent.children[j].starty = nd.parent.centery;
						}
						
					}
					else
					{
						break;
					}
				}
			}
			var minx = tree.leaves[0].centerx - tree.leaves[0].radius;
			var maxx = tree.leaves[tree.leaves.length - 1].centerx + tree.leaves[tree.leaves.length - 1].radius;
			
			var miny = 0;
			var maxy = tree.maxBranchLength + (tree.leaves[0].radius * 2);
			
			tree.root.startx = tree.root.centerx;
			tree.root.starty = tree.root.centery;
			
			tree.offsety = tree.canvas.canvas.height/2 - (maxy - miny) /2;
			tree.offsetx = minx + 20;
			
			tree.zoom = Math.min((tree.canvas.canvas.width -20) / (maxx - minx), (tree.canvas.canvas.height -20) / (maxy - miny));
		}
	},
	nodePrerenderers : 
	{
		radial : function(tree, node)
		{
			if(node.parent)
			{
				node.startx = node.parent.centerx;
				node.starty = node.parent.centery;
			}
			else
			{
				node.startx = 0;
				node.starty = 0;
			}
			node.centerx = node.startx + (node.branchLength * tree.branchScalar * Math.cos(node.angle));
			node.centery = node.starty + (node.branchLength * tree.branchScalar * Math.sin(node.angle));
			
			tree.minx = Math.min(node.centerx, tree.minx);
			tree.maxx = Math.max(node.centerx, tree.maxx);
			tree.miny = Math.min(node.centery, tree.miny);
			tree.maxy = Math.max(node.centery, tree.maxy);
			
			
			for(var i = 0; i < node.children.length; i++)
			{
				this.radial(tree, node.children[i]);
			}
		}
	},
	branchRenderers : 
	{
		rectangular : function (tree, node, collapse){
			var  bl = node.branchLength * tree.branchScalar ;
			node.angle = 0;
			if(node.parent){
				node.centerx = node.startx +  bl;
			}
			if(node.selected)
			{
				node.canvas.strokeStyle = tree.selectedColor;//this.parent && this.parent.selected ? this.tree.selectedColor : this.tree.branchColor;
				node.canvas.fillStyle = tree.selectedColor;
			}
			else
			{
				node.canvas.strokeStyle = tree.branchColor;
				node.canvas.fillStyle = node.color;
			}
			
			node.canvas.beginPath();
			
			if(!collapse){
				node.canvas.moveTo(node.startx , node.starty);
				node.canvas.lineTo(node.startx, node.centery);
				node.canvas.lineTo(node.centerx, node.centery);
				node.canvas.stroke();
				node.canvas.closePath();
				node.drawNode();
			}

			node.canvas.closePath();
			
			for(var i = 0 ; i < node.children.length ;i++)
			{
				node.children[i].startx = node.centerx;
				node.children[i].starty = node.centery;
				if(node.children[i].selected)
				{
				 tree.selectedNodes.push(node.children[i]);
				}
				else
				{
				  tree.branchRenderers.rectangular(tree, node.children[i], node.collapsed || collapse);
				}
			}
		},
		circular : function(tree, node, collapse){
			var  bl = node.totalBranchLength * tree.branchScalar;

			if(node.selected){
				node.canvas.strokeStyle = node.tree.selectedColor;//this.parent && this.parent.selected ? this.tree.selectedColor : this.tree.branchColor;
				node.canvas.fillStyle = node.tree.selectedColor;
			}
			else
			{
				node.canvas.strokeStyle = node.tree.branchColor;
				node.canvas.fillStyle = node.color;
			}
			
			if(!collapse){
				node.canvas.beginPath();
				node.canvas.moveTo(node.startx, node.starty);
				if(node.leaf)
				{
					node.canvas.lineTo(node.interx, node.intery);
					node.canvas.stroke();
					var ss = node.canvas.strokeStyle;
					node.canvas.strokeStyle = node.selected ? node.tree.selectedColor :  "rgba(0,0,0,0.5)";
					node.canvas.lineTo(node.centerx, node.centery);
					node.canvas.stroke();
					node.canvas.strokeStyle = ss;
				}
				else
				{
					node.canvas.lineTo(node.centerx, node.centery);
					node.canvas.stroke();
				}
				
				if(node.selected)
				{
					node.canvas.strokeStyle = node.tree.selectedColor;
				}
				else
				{
					node.canvas.strokeStyle = node.tree.branchColor;
				}
				
				if(node.children.length > 1 && !node.collapsed )
				{
					node.canvas.beginPath();
					node.canvas.arc(0, 0, (bl) , node.minChildAngle, node.maxChildAngle,node.maxChildAngle < node.minChildAngle);
					node.canvas.stroke();
					node.canvas.closePath();
				}
				node.drawNode();
			}
			
			for(var i = 0 ; i < node.children.length; i++)
			{
				tree.branchRenderers.circular(tree, node.children[i], node.collapsed || collapse);
			}
		},
		radial : function(tree, node, collapse){
			if(node.selected){
				node.canvas.strokeStyle =  node.tree.selectedColor;//node.parent && node.parent.selected ? node.tree.selectedColor : node.tree.branchColor;
				node.canvas.fillStyle = node.tree.selectedColor;
			}
			else
			{
				node.canvas.strokeStyle = node.tree.branchColor;
				node.canvas.fillStyle = node.color;
			}
			if(node.parent && !collapse){
				
				node.canvas.beginPath();
				node.canvas.moveTo(node.startx , node.starty );
				node.canvas.lineTo(node.centerx ,  node.centery);
				node.canvas.stroke();
				node.canvas.closePath();
				node.drawNode();
			}
			for(var i = 0 ; i < node.children.length; i++)
			{
				if(node.children[i].selected)
				{
				  node.tree.selectedNodes.push(node.children[i]);
				}
				else
				{
				  tree.branchRenderers.radial(tree, node.children[i], node.collapsed || collapse);
				}
			}
		},
		diagonal: function(tree, node, collapse){
			node.angle = 0;
			if(node.selected)
			{
				node.canvas.strokeStyle = node.tree.selectedColor;//node.parent && node.parent.selected ? node.tree.selectedColor : node.tree.branchColor;
				node.canvas.fillStyle = node.tree.selectedColor;
			}
			else
			{
				node.canvas.strokeStyle = node.tree.branchColor;
				node.canvas.fillStyle = node.color;
			}
			
			node.canvas.beginPath();
			//alert(node.starty);
			
			if(!collapse){
				node.canvas.moveTo(node.startx , node.starty);
				node.canvas.lineTo(node.centerx, node.centery);
				node.canvas.stroke();
				node.canvas.closePath();
				node.drawNode();
			}

			node.canvas.closePath();
			
			for(var i = 0 ; i < node.children.length ;i++)
			{
				node.children[i].startx = node.centerx;
				node.children[i].starty = node.centery;
				if(node.children[i].selected)
				{
				  node.tree.selectedNodes.push(node.children[i]);
				}
				else
				{
				  tree.branchRenderers.diagonal(tree, node.children[i], node.collapsed || collapse);
				}
			}
		},
		hierarchy : function(tree,node,collapse) {
			if(node.selected)
			{
				node.canvas.strokeStyle = node.tree.selectedColor;//node.parent && node.parent.selected ? node.tree.selectedColor : node.tree.branchColor;
				node.canvas.fillStyle = node.tree.selectedColor;
			}
			else
			{
				node.canvas.strokeStyle = node.tree.branchColor;
				node.canvas.fillStyle = node.color;
			}
			
			
			//alert(node.starty);
			
			if(!collapse){
				node.canvas.beginPath();
				node.canvas.moveTo(node.startx , node.starty);
				node.canvas.lineTo(node.centerx, node.starty);
				node.canvas.lineTo(node.centerx, node.centery);
				node.canvas.stroke();
				
				node.drawNode();
			}
			node.canvas.closePath();
			
			for(var i = 0 ; i < node.children.length ;i++)
			{
				if(node.children[i].selected)
				{
				  node.tree.selectedNodes.push(node.children[i]);
				}
				else
				{
				  tree.branchRenderers.hierarchy(tree, node.children[i], node.collapsed || collapse);
				}
			}
		}
	},
	setZoom : function(z)
	{
		if(z > -100 && z < 100){
			this.zoom = Math.pow(10, z);
			this.draw();
		}
	},
	parseNwk : function(nwk)
	{		
		this.loader.run();
		this.loader.resize();
		this.root = false;
		this.leaves = [];
		this.drawn = false;
		var curNode = new PhyloCanvas.Branch();
		curNode.id = "root";
		this.branches.root = curNode;
		this.setRoot(curNode);

		for(var i = 0; i < nwk.length; i++)
		{
			switch(nwk[i])
			{
			  case '(': //new Child
				var nd = new PhyloCanvas.Branch();
				nd.id = this.genId();
				curNode.leaf = false;
				curNode.addChild(nd);
				this.branches[nd.id] = nd;
				curNode = nd;
				break;
			  case ')': //return to parent
				 if(curNode.leaf) this.leaves.push(curNode);
				 curNode = curNode.parent;
				 break;
			  case ',': //new sibiling
				 var nd = new PhyloCanvas.Branch();
				 nd.id = this.genId();
				 if(curNode.leaf) this.leaves.push(curNode);
				 this.branches[nd.id] = nd;
				 curNode.parent.addChild(nd);
				 curNode = nd;
				 break;
			  case ';':
				// this.root.setTotalLength();
				 for (var l = 0; l < this.leaves.length; l++)
				{
					if(this.leaves[l].totalBranchLength > this.maxBranchLength)
					{
						this.maxBranchLength = this.leaves[l].totalBranchLength;
					}
				}
				 return;
			  default:
				 	try
				 	{
						i = curNode.parseNwk(nwk, i);
						i--;
					}
					catch(e)
					{
						alert( "Error parsing nwk file" + e );
						return;
					}
				 break;
		   }
		}
		this.root.branchLength = 0;
		this.root.setTotalLength();
	},
	setSize: function(width, height)
	{
		this.canvas.canvas.width = width;
		 this.canvas.canvas.height = height;
		 if(this.drawn){
			this.drawn = false;
			this.draw();
		 }
		  this.loader.resize();
	},
	setRoot : function(node)
	{
		node.canvas = this.canvas;
		node.tree = this;
		this.root =node;
	},
	setTreeType : function(type)
	{
		this.drawn = false;
		this.treeType = type;
		this.draw();
	},
	clicked : function(e)
	{
		try{
			if(!this.root) return false;
			var nd = this.root.clicked((e.clientX - getX(this.canvas.canvas) - this.offsetx  + window.pageXOffset) / this.zoom, (e.clientY - getY(this.canvas.canvas) - this.offsety + window.pageYOffset) /this.zoom);

			if(nd)
			{
			   this.root.setSelected(false, true);
			   nd.setSelected(true, true);
			   if(this.onselected) this.onselected(nd.getLabel());
			}
			else if(this.unselectOnClickAway) 
			{
			   this.root.setSelected(false, true);
			   if(this.onselected) this.onselected("");
			}
			this.draw();
			if(!this.pickedup){
			   this.dragging = false;
			}
			return false;
		}catch(e){alert(e);}
	},	
	dblclicked : function(e)
	{
		if(!this.root) return false;
		var nd = this.root.clicked((e.clientX * 1.0 - getX(this.canvas.canvas) - this.offsetx  + window.pageXOffset) / this.zoom, (e.clientY *1.0 - getY(this.canvas.canvas) - this.offsety + window.pageYOffset) /this.zoom);
		if(nd) {
		   nd.setSelected(false, true);
		   nd.toggleCollapsed();
		}
		
		if(!this.pickedup){
			this.dragging = false;
		}
		this.draw();
	},
	pickup : function(event)
	{
	 if(!this.drawn) return false;
	 this.origx = this.offsetx;
	 this.origy = this.offsety;
	 
	 if(event.button == 0){
		this.pickedup = true;
	 }
	 if(event.button ==2 && this.rightClickZoom){
		this.zoomPickedUp = true;
		this.origZoom = Math.log(this.zoom)/Math.log(10);
		this.oz = this.zoom;
		// position in the diagram on which you clicked
		
		
	 }
	 this.startx = event.clientX ;
	 this.starty = event.clientY;
	
	},
	drop : function()
	{
	 if(!this.drawn) return false;
		this.pickedup = false;
		this.zoomPickedUp = false;
	},
	drag : function(event)
	{
		if(!this.drawn) return false;
		
		if(this.pickedup)
		{
			this.dragging = true;
			this.offsetx = this.origx + (event.clientX - this.startx);
			this.offsety = this.origy + (event.clientY - this.starty);
			this.draw();
		}
		else if(this.zoomPickedUp)
		{
		   
		   this.d =  ((this.starty - event.clientY) / 100);
		   this.setZoom(this.origZoom + this.d);
		   //this.offsetx = this.origx - (this.startx / this.oz + this.origx - this.startx / (this.oz * this.zoom));
		   //this.offsety = this.origy - (this.starty / this.oz + this.origy - this.starty / (this.oz * this.zoom));;
		}
		else
		{
		   e = event;
		   var nd = this.root.clicked((e.clientX * 1.0 - getX(this.canvas.canvas) - this.offsetx  + window.pageXOffset) / this.zoom, (e.clientY *1.0 - getY(this.canvas.canvas) - this.offsety + window.pageYOffset) /this.zoom);
		   if(nd)
		   {
			  this.root.setHighlighted(false);
			  nd.setHighlighted(true);
			 
		   }
		   else
		   {
			   this.root.setHighlighted(false);
		   }
		   this.draw();
		}
	}
};