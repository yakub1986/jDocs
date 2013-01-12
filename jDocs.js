//jDocs.js, made by ~yk~ at 1 Feb 2012
//version 0.1.0

(function($) {

function Documents($doc, opt) {
	me = this;

	me.$doc = $doc;
	me.opt = opt;
	me.data = [];
	me.$activePage = false;
	me.$activeItem = false;

	me.pageScale = 1;
	me.addPage = function (opt)
	{
		var $page = $('<div class="document_page" />');
		opt = $.extend(this.opt, opt);
		opt.size = paper_size(size_convert_full(opt.size));

		$page.css(opt.size).css({
			border: '1px solid black',
			margin: '0',
			position: 'relative',
			'box-shadow': '10px 10px 5px #888',
			backgroundColor: "#FFF"
		})
		this.$doc.append($page);
		this.pageCount ++;

		var i = this.$doc.find(".document_page").length;
		if (this.opt.show == 'vertical') {
			$page.css({top: 15 * i - 15, left: 0});
		} else {
			$page.css({top: 0, left: 15 * i - 15, 'float': 'left'});
			this.$doc.css({width: ($page.outerWidth() + 15) * i})
		}

		this.addBoxes($page, {
			margin: opt.margin,
			className: 'page_margin',
			movable: false,
			zIndex: 1,
			color: '#CCC',
			style: 'dotted'
		});

		// Add the newly created page to DATA property
		this.data.push({
			size: opt.size,
			margin: opt.margin,
			items: []
		})

		if ($page.siblings().length == 0) this.activePage($page);
		$page.click({me: me}, activateItem);
	}
	me.addItem = function (item, opt)
	{
		var $item = $(item),
			$docItem = $('<div class="document_item_box"/>'),
			itemCss = {resize: 'none', margin: 0, padding: 0, border: 'none'},
			docItemCss = {position: 'absolute', backgroundColor: '#ffffff'};
		$item.css(itemCss).addClass('document_item').css({overflow: 'hidden'});
		$docItem.append($item);

		opt = $.extend({}, opt);

		//Page
		if (typeof(opt.page) == 'undefined') {
			opt.page = this.activePage();
			this.$activePage.append($docItem);
		} else {
			// if opt.page(page number) is bigger than existing page, create new pages automatically
			var npage = this.$doc.find('.document_page').length;
			for (var i = npage; i <= opt.page; i++) {
				this.addPage();
			}
			// add the items
			this.$doc.find('.document_page:eq('+opt.page+')').append($docItem);
		}

		// Size
		var size = {w: $item.width(), h: $item.height()};
		if (size.w < 100) size.w = 100;if (size.h < 100) size.h = 100;
		if (typeof(opt.size) != 'undefined') {
			if (typeof(opt.size.w) != 'undefined') size.w = opt.size.w;
			if (typeof(opt.size.h) != 'undefined') size.h = opt.size.h;
		}

		// Position
		if (typeof(opt.pos) != 'undefined') {
			if (typeof(opt.pos.x) != 'undefined') docItemCss.left = opt.pos.x + 'px';
			if (typeof(opt.pos.y) != 'undefined') docItemCss.top = opt.pos.y + 'px';
		} else {
			opt.pos = {x: 0, y: 0};
		}

		$docItem.width(size.w).height(size.h).css(docItemCss);
		$item.width(size.w).height(size.h);

		// Add the newly created item to DATA property
		var data_length = this.data.length;
		$item.data({
			page: opt.page,
			index: data_length
		})
		this.data[opt.page].items.push({
			size: size,
			pos: opt.pos
		});

		this.addBoxes($docItem, {
			movable: true,
			zIndex: 21
		});

		return $item;
		//return $docItem;
	}
	me.activePage = function ($page)
	{
		if (typeof($page) == 'undefined') return this.$activePage;
		if (!isNaN($page)) $page = this.$doc.find('.document_page:eq('+$page+')');
		if (this.$activePage != false) {
			if (this.$activePage.is($page)) return false;
			this.$activePage.find('.page_margin').css({'borderColor': '#CCC'});
		}
		$page.find('.page_margin').css({'borderColor': '#0000FF'});
		this.$activePage = $page;
		return true;
	}

	me.activeItem = activeItem;
	me.deactivateItem = deactivateItem;
	me.moveStart = moveStart;
	me.addBoxes = addBoxes;
	me.pageCount = 0;
	me.scale = scalePage;



	//Initialization
	$doc.html('');
	if (typeof(opt.pages) == 'object' && opt.pages.length > 0)
	{
		$(opt.pages).each(function(k, v) {
			me.addPage({size: v.size, margin: v.margin});
			$(v.items).each(function(k2, i) {
				me.addItem('<textarea />', {page: k, size: i.size, pos: i.pos} );
			});
		});
	}
	else
	{
		this.addPage();
	}
}

function scalePage(scalepoint)
{
	if (typeof(scalepoint) == 'undefined') {
		return this.pageScale;
	}
	if (scalepoint == 0) scalepoint = 1;
	this.pageScale = scalepoint;
	this.$doc.css({
		'zoom': scalepoint,
		'-moz-transform': 'scale('+scalepoint+')',
		'-moz-transform-origin': '0 0'
	})
	return this;
}

function addBoxes($obj, opt)
{
	opt = $.extend({
		movable: false,
		className: 'page_move_handle',
		margin: {top: 0, right: 0, bottom: 0, left: 0},
		color: 'black',
		style: 'dashed'
	}, opt)


	var css = {
		position: 'absolute',
		'z-index': opt.zIndex,
		border: '1px dashes ' + opt.color,
		marginTop: opt.margin.top,
		marginRight: opt.margin.right,
		marginBottom: opt.margin.bottom,
		marginLeft: opt.margin.left
	}

	if (opt.movable) css.cursor = 'move';

	var $t = $("<div/>").addClass(opt.className);

	$t.css(css);
	$obj.append($t); // Needed so other unit will be converted to pixels

	opt.margin.top = parseFloat($t.css('marginTop'));
	opt.margin.right = parseFloat($t.css('marginRight'));
	opt.margin.bottom = parseFloat($t.css('marginBottom'));
	opt.margin.left = parseFloat($t.css('marginLeft'));
	$t.css({margin: 0}).remove();

	var pos = ['t','r','b','l'];
	for (var i in pos) {
		var mycss = {
			height: 4,
			width: 4,
			top: opt.margin.top,
			left: opt.margin.left
		}
		var myobj = $t.clone();

		if (pos[i] == 'b') mycss.top += $obj.innerHeight() - mycss.height - opt.margin.top - opt.margin.bottom;
		if (pos[i] == 'r') mycss.left += $obj.innerWidth() - mycss.width - opt.margin.left - opt.margin.right;

		if (pos[i] == 't' || pos[i] == 'b') {
			mycss.width = $obj.innerWidth() - opt.margin.left - opt.margin.right;
		} else if (pos[i] == 'l' || pos[i] == 'r') {
			mycss.height = $obj.innerHeight() - opt.margin.top - opt.margin.bottom;
		}

		switch(pos[i])
		{
			case 't':mycss.borderTop = '1px ' + opt.style + ' ' + opt.color;break;
			case 'r':mycss.borderRight = '1px ' + opt.style + ' ' + opt.color;mycss.left -= 1;break;
			case 'b':mycss.borderBottom = '1px ' + opt.style + ' ' + opt.color;mycss.top -= 1;break;
			case 'l':mycss.borderLeft = '1px ' + opt.style + ' ' + opt.color;break;
		}

		myobj.css(mycss).addClass('box_' + pos[i]);
		$obj.append(myobj);


		if (opt.movable) {
			myobj.mousedown({position: pos[i], me: this, grid: this.opt.grid}, moveStart);
		}
	}

	//return $me;
}

function addResizeHandle($obj, opt)
{
	opt = $.extend({
		resizeable: false,
		className: 'page_resize_handle'
	}, opt)

	var height = $obj.innerHeight(),
		width = $obj.innerWidth(),
		north = 0,
		west = 0,
		east = width + west,
		south = height + north,
		midvert = north + Math.round(height / 2),
		midhoriz = west + Math.round(width / 2),
		th = 6,
		tw = th;

	$t = $("<div/>").addClass(opt.className);

	var css = {
		position: 'absolute',
		width: tw,
		height: th,
		'z-index': 23,
		backgroundColor: 'yellow',
		border: '1px solid black',
		borderRadius: '10px'
	}
	$t.css(css);

	var pos = ['nw', 'n', 'ne', 'w', 'e', 'sw', 's', 'se'];
	for (var i in pos) {
		//addTrackerObj($t, pos[i]).appendTo($obj);
		var mycss = {}
		var $resizer = $t.clone();
		//Top
		switch (pos[i])
		{
			case 'n': case 'nw': case 'ne':
				mycss.top = north - (th / 2);break;
			case 'w': case 'e':
				mycss.top = midvert - (th / 2) - 1;break;
			case 's': case 'sw': case 'se':
				mycss.top = south - (th / 2) - 1;break;
		}

		//Left
		switch (pos[i])
		{
			case 'nw': case 'w': case 'sw':
				mycss.left = west - (tw / 2);break;
			case 'n': case 's':
				mycss.left = midhoriz - (tw / 2) - 1;break;
			case 'ne': case 'e': case 'se':
				mycss.left = east - (tw / 2) - 1;break;
		}
		mycss.cursor = pos[i] + '-resize';
		$resizer.css(mycss).addClass('resizer_' + pos[i]);
		$obj.append($resizer);

		if (opt.resizeable) {
			$resizer.mousedown({pos: pos[i], grid: opt.grid, me: opt.me}, resizeStart);
		}

	}

}

function activeItem($item)
{
	if (typeof($item)=='undefined') return this.$activeItem;

	if (this.$activeItem != false) this.deactivateItem();

	this.$activeItem = $item;
	//$activeItem.css({border: '3px solid red'});
	addResizeHandle(this.$activeItem, {
		me: this,
		resizeable: true,
		className: 'page_resize_handle',
		grid: this.opt.grid
	});

	return this.$activeItem;
}

function activateItem(e)
{
	//console.log($activeItem);
	var me = e.data.me;
	var $obj = $(e.target);
	if ($obj.attr('class') != 'document_page')
	{
		var $curPage = $obj.parents('.document_page');
		me.activePage($curPage);

		var $curItem = ($obj.attr('class') == 'document_item_box')
			? $obj
			: $obj.parents('.document_item_box');

		//if ($doc_items.index($activeItem) != $doc_items.index($curItem))
		if (me.$activeItem == false || !me.$activeItem.is($curItem))
		{
			me.activeItem($curItem);
		}
	}
	else
	{
		me.activePage($obj);
		if (me.$activeItem != false) me.deactivateItem();
	}
}

function deactivateItem()
{
	this.$activeItem.find('.page_resize_handle').remove();
	this.$activeItem = false;
}

var startPos = false, startOffset = false, startSize = false, startEvent = false, $changingObj = false;

function moveStart(e)
{
	//console.log(e);
	//return false;
	activateItem(e);

	$(document).css({cursor: 'move'});
	//obj.$item = $(this).parents('.pages_item_container:first')
	//obj.startPosition = obj.$item.position();
	//obj.mouseDownEvent = e;
	$changingObj = $(this).parent();
	startPos = $changingObj.position();
	startOffset = {left: Math.round($changingObj.offset().left), top: Math.round($changingObj.offset().top)};
	startSize = {w: $changingObj.innerWidth(), h: $changingObj.innerHeight()};
	startEvent = e;
	var me = e.data.me;
	var objx = startEvent.pageX - startOffset.left,
		objy = startEvent.pageY - startOffset.top;
	$(document).bind('mousemove.doc_track', e.data, onMove);
	$(document).bind('mouseup.doc_track', onRelease);
	e.stopPropagation();
	e.preventDefault();
}

function onMove(e)
{
	var me = e.data.me,
		grid = e.data.grid,
		dy = Math.floor( ((e.pageY - startEvent.pageY) / me.scale()) / grid ) * grid,
		dx = Math.floor( ((e.pageX - startEvent.pageX) / me.scale()) / grid ) * grid,
		ny = startPos.top + dy,
		nx = startPos.left + dx,
		maxy = $changingObj.parent().innerHeight() - $changingObj.innerHeight(),
		maxx = $changingObj.parent().innerWidth() - $changingObj.innerWidth();

	//ny = Math.floor(ny/grid) * grid; //8px grid
	//nx = Math.floor(nx/grid) * grid; //8px grid

	//Check surrounding margin
	me.$activePage.find('.page_margin').each(function() {
		var marginoff = $(this).offset();
		var pageoff = $(this).parents().offset();
		var margin = {x: marginoff.left - pageoff.left - 1, y: marginoff.top - pageoff.top - 1};

		if (Math.abs(nx - margin.x) < grid) {nx = margin.x;}
		if (Math.abs(ny - margin.y) < grid) {ny = margin.y;}
	})
	//console.log([nx, ny, grid]);

	//It shouldn't go out of box side
	if (ny < 0) ny = 0;
	if (nx < 0) nx = 0;
	if (ny > maxy) ny = maxy;
	if (nx > maxx) nx = maxx;

	nx = Math.round(nx);
	ny = Math.round(ny);

	$changingObj.css({top: ny, left: nx});

	var $newPage = ($(e.target).attr('class') == 'document_page')
		? $(e.target)
		: $(e.target).parents('.document_page');

	if ($newPage.length > 0 && !$changingObj.parent().is($newPage))
	{
		//FIXME: Scale problem when moving to another page
		var objx = startEvent.pageX - startOffset.left,
			objy = startEvent.pageY - startOffset.top,
			nol = Math.round($newPage.offset().left),
			not = Math.round($newPage.offset().top);
			nx = e.pageX - nol;
			ny = e.pageY - not;
		var info = 'StartEvent: ' + startEvent.pageX + ', ' + startEvent.pageY
			+ '<br/>' + 'StartOffset: ' + startOffset.left + ', ' + startOffset.top
			+ '<br/>' + 'Obj Pos: ' + objx + ', ' + objy
			+ '<br/>' + 'Event: ' + e.pageX + ', ' + e.pageY
			+ '<br/>' + 'newPageOffset: ' + nol + ', ' + not
			+ '<br/>' + 'New Pos: ' + nx + ', ' + ny
			;
		if (nx > objx && ny > objy)
		{
			$changingObj.appendTo($newPage);
			$changingObj.css({top: (ny - objy) - 1, left: (nx - objx) - 1});
			startPos = {top: ny - objy, left: nx - objx};
			startOffset = {top: Math.round($changingObj.offset().top), left: Math.round($changingObj.offset().left)};
			//startOffset = {left: $changingObj.offset().left - 1, top: $changingObj.offset().top - 1};
			startEvent = e;
			me.activePage($newPage);
			//FIXME: The cursor still at wrong position
			/*
			$(".info3").html('(' + (nx) + ', ' + (ny) + ')'
				+ ' - (' + (objx) + ', ' + (objx) + ')'
				+ ' - (' + (nx - objx) + ', ' + (ny - objx) + ')'
			);
			*/
		}
	}

	e.stopPropagation();
	e.preventDefault();
}

function onRelease(e)
{
	$(document).unbind('.doc_track');
	e.stopPropagation();
	e.preventDefault();

}

function resizeStart(e)
{
	//console.log(e.data);
	//return false;
	//activateItem(e);

	$(document).css({cursor: e.data.pos + '-resize'});
	//obj.$item = $(this).parents('.pages_item_container:first')
	//obj.startPosition = obj.$item.position();
	//obj.mouseDownEvent = e;
	$changingObj = $(this).parent();
	startPos = $changingObj.position();
	startSize = {w: $changingObj.innerWidth(), h: $changingObj.innerHeight()};
	startEvent = e;
	$(document).bind('mousemove.doc_track', e.data, onResize);
	$(document).bind('mouseup.doc_track', onRelease);
	e.stopPropagation();
	e.preventDefault();
}

function onResize(e)
{
	var me = e.data.me,
		grid = e.data.grid,
		dx = (e.pageX - startEvent.pageX) / me.scale(),
		dy = (e.pageY - startEvent.pageY) / me.scale(),
		w = startSize.w,
		h = startSize.h,
		nw = w,
		nh = h,
		minw = 40,
		minh = 32,
		maxw = $changingObj.parent().innerWidth(),
		maxh = $changingObj.parent().innerHeight();


	//Width change
	switch(startEvent.data.pos) {
		case 'nw': case 'w': case 'sw':
			dx = (Math.floor((startPos.left + dx) / grid) * grid) -startPos.left; //grid 8
			if (w - dx < minw) dx = w - minw;
			if (startPos.left + dx < 0) dx = -startPos.left;

			nw = w - dx;
			$changingObj.css({left: startPos.left + dx});
			break;
		case 'ne': case 'e': case 'se':
			dx = (Math.floor((startPos.left + startSize.w + dx) / grid) * grid) -startPos.left - startSize.w; //grid 8
			if (w + dx < minw) dx =  minw - w;
			if (startPos.left + dx > maxw - w) dx = maxw - startPos.left - w;

			nw = w + dx;
			// 1. Change item, content & box width
			// 2. Move resizer to the left as much as dx
			break;
	}
	$changingObj.css({width: nw});
	$changingObj.find('.document_item, .box_t, .box_b').css({width: nw})
	var box_r_size = parseFloat($changingObj.find('.box_r').css('width'));
	$changingObj.find('.box_r').css({left: nw - box_r_size - 1})
	var resizer_size = parseFloat($changingObj.find('.resizer_e').css('width'));
	$changingObj.find('.resizer_ne, .resizer_e, .resizer_se').css({left: nw - (resizer_size/2) - 1})
	$changingObj.find('.resizer_n, .resizer_s').css({left: (nw/2) - (resizer_size/2) - 1})


	//Height change
	switch(startEvent.data.pos) {
		case 'nw': case 'n': case 'ne':
			dy = (Math.floor((startPos.top + dy) / grid) * grid) -startPos.top; //grid 8
			if (h - dy < minh) dy = h - minh;
			if (startPos.top + dy < 0) dy = -startPos.top;

			nh = h - dy;
			$changingObj.css({top: startPos.top + dy});
			// 1. Change item, content & box width
			// 2. Move item & resizer to the left as much as dx
			break;
		case 'sw': case 's': case 'se':
			dy = (Math.floor((startPos.top + startSize.h + dy) / grid) * grid) -startPos.top - startSize.h; //grid 8
			if (h + dy < minh) dy = minh - h;
			if (startPos.top + dy > maxh - h) dy = maxh - startPos.top - h;

			nh = h + dy;
			// 1. Change item, content & box width
			// 2. Move resizer to the left as much as dx
			break;
	}
	$changingObj.css({height: nh});
	$changingObj.find('.document_item, .box_l, .box_r').css({height: nh})
	var box_b_size = parseFloat($changingObj.find('.box_b').css('height'));
	$changingObj.find('.box_b').css({top: nh - box_b_size - 1})
	$changingObj.find('.resizer_sw, .resizer_s, .resizer_se').css({top: nh - (resizer_size/2) - 1})
	$changingObj.find('.resizer_w, .resizer_e').css({top: (nh/2) - (resizer_size/2) - 1})

	e.stopPropagation();
	e.preventDefault();
}

// Utility Function
function paper_size(size)
{
	if (typeof(size) == 'string') {
		switch(size.toUpperCase()) {
			case 'A4':
				size = {width: '8.27in', height: '11.69in'};
				break;
			case 'LETTER':
			case 'QUARTO':
			case 'Q':
				size = {width: '8.5in', height: '11in'};
				break;
		}
	}
	return size;
}

function size_convert_easy(size)
{
	if (typeof(size.w) == 'undefined') size.w = 0;
	if (typeof(size.h) == 'undefined') size.h = 0;

	if (typeof(size.width) == 'undefined') size.width = size.w;
	if (typeof(size.height) == 'undefined') size.height = size.h;

	var mysize = {
		w: size.width,
		h: size.height
	};
	return mysize;
}

function size_convert_full(size)
{
	if (typeof(size.width) == 'undefined') size.width = 0;
	if (typeof(size.height) == 'undefined') size.height = 0;

	if (typeof(size.w) == 'undefined') size.w = size.width;
	if (typeof(size.h) == 'undefined') size.h = size.height;

	var mysize = {
		width: size.w,
		height: size.h
	};
	return mysize;
}

function unit_convert(unit, to)
{
	// 1/6in = 1em = 12pt = 16px
	// 1in = 6em = 72pt = 96px
	// 1pt = 1.25px
	if (typeof(to) == 'undefined') {to = 'px';}
	var ar = unit.toString().toLowerCase().match(/^(\d+(\.\d+)?)(in|cm|em|pt|px)?$/);
	if (ar != null)
	{
		var n = 0;
		if (typeof(ar[3]) == 'undefined') ar[3] = 'px';

		// Convert to px
		switch(ar[3])
		{
			case 'in':
				n = ar[1] * 96;
				break;
			case 'cm':
				n = ar[1] * 12 / 0.3175;
				break;
			case 'mm':
				n = ar[1] * 12 / 3.175;
				break;
			case 'em':
				n = ar[1] * 16;
				break;
			case 'pt':
				n = ar[1] / 0.75;
				break;
			default:
				n = ar[1];
		}

		// Convert to requested unit
		switch(to)
		{
			case 'in':
				return n / 96;
				break;
			case 'cm':
				return n * 0.3175 / 12;
				break;
			case 'mm':
				return n * 3.175 / 12;
				break;
			case 'em':
				return n / 16;
				break;
			case 'pt':
				return n * 0.75;
				break;
			default:
				return n;
		}
	}
	return 0;
}

$.fn.doc = function (opt)
{
	//Easy paper selection
	opt.size = paper_size(opt.size);

	opt = $.extend({
		show: 'horizontal',
		grid: 8,
		zIndex: 1
	}, opt);

	var mydoc = new Documents($(this), opt);

	return mydoc;
}

}(jQuery));



/*
*
* $Document.data is an array of pages
* Data structure of Document.data:
* [
*	{
*		size: {w: 200px, h: 200px},
*		margin: {t: 20px, r: 20px, b: 20px, l: 20px},
*		items: [
*			{
*				pos: {x: 20px, y: 20px},
*				size: {w: 100px, w: 100px},
*			}
*		]
*	}
* ]
*
 */