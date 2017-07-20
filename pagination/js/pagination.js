/**
 *分页控件
 * html引入<div class="pagination"></div>
 * js引入jquery
 * css引入pagination.css
 */

function Pagination(settings) {

	var s = settings ? settings : {};
	/**
	 * @param pageSize 分页每页显示的个数
	 * @param pageNum 分页当前显示的第*页
	 * @param count 数据的总数
	 * @param showNum 分页展示个数
	 * @param isCurrent 是否只是当前pageNum数据
	 * @param pageLen 分页页码个数
     * @param showExt 分页扩展
	 */
	this.pageSize = s.pageSize ? s.pageSize : 10;
	this.pageNum = s.pageNum ? s.pageNum : 0;
	this.count = s.count ? s.count : 0;
    this.baseShowNum = s.showNum ? s.showNum : 10;
	this.showNum = this.baseShowNum;
	this.clickFun = s.clickFun ? s.clickFun : function(num) {alert(num);};
	this.pageLen = this.count ? Math.ceil(this.count/this.pageSize) : 0;
	this.showNum = this.pageLen > this.showNum ? this.showNum : this.pageLen; 
	this.ellipsisStr = this.ellipsisStr ? this.ellipsisStr : '...';
	this.$elem = s.$elem || $('.pagination');
    this.showExt = s.showExt || false;
    this.enterPageSizeFun = s.enterPageSizeFun || this.enterPageSizeFun;
    this.enterPageNumFun = s.enterPageNumFun || this.enterPageNumFun;
    
};
Pagination.prototype = {
	
//	$elem: $('.pagination'),

	tpl: '<ul><li class="first">首页</li><li class="prev">上页</li>'
	   + '{{pageNumList}}' 
	   + '<li class="next">下页</li><li class="end">末页</li></ul>',
		
	pageSizeTpl: '<li>{{pageNum}}</li>',
	
	pageEllipsisTpl: '<span>{{ellipsisStr}}</span>',
    
    tplExt: '<span class="enterPageSize">每页显示<input type="text" />条数据</span>'
        + '<span class="enterPageNum">跳转到第<input type="text" />页</span>',
		
	init: function() {
	
//		this.renderDom(this.bindDom(this.pageSize));

		this.drawDom(this.$elem, this.pageNum);
			
		this.active = 'active';
			
		this.disabled = 'disabled';

		this.bindAction();

		this.goToPage(0, this.clickFun, 'init');
	
	},
    
    resetSetting: function(s) {
        
        this.pageSize = s.pageSize ? s.pageSize : 10;
        this.pageNum = 0;
        this.count = s.count ? s.count : 0;
        this.showNum = s.baseShowNum ? s.baseShowNum : 10;
        this.pageLen = this.count ? Math.ceil(this.count/this.pageSize) : 0;
        this.showNum = this.pageLen > this.showNum ? this.showNum : this.pageLen; 
        
    },
		
	drawDom: function() {
		
		var $el = this.$elem,
			pageNum = this.pageNum,
			act = this.active,
			dis = this.disabled;
			
		if(pageNum === 0) {

			$el.find('.first').addClass(dis);
			$el.find('.prev').addClass(dis);
		
		}
			
		$el.find('li').not('.first').not('.prev').eq(pageNum).addClass(act);

		if(this.pageLen === 1) {
		
			$el.find('.next').addClass(dis);
			$el.find('.end').addClass(dis);
		
		}

	}, 
	//得到显示分页的首个和尾个数字
	getShowObj: function() {
		
		var n = Math.ceil(this.showNum/2),
			num = this.pageNum + 1,
			startNum = num <= n? 1 : num - n;

		endNum = startNum + this.showNum - 1;
		endNum = endNum > this.pageLen ? this.pageLen : endNum;
		startNum = endNum - this.showNum + 1;

		this.startNum = startNum,
		this.endNum = endNum

	},
	bindAction: function() {
			
		var self = this,
			$el = this.$elem;
			
		$el.on('click', 'li', function() {
				
			var $this = $(this),
				className = $this.attr('class'),
				className = className ? className : '', 
				dis = self.disabled,
				act = self.active,
				num = 0;
	
			if(className.indexOf(dis) !== -1 || className.indexOf(act) !== -1) {
					
				return ;
				
			}else {
				
				if(className.indexOf('first') !== -1) {
						
					num = 0;

				}else if(className.indexOf('prev') !== -1) {
					
					num = self.pageNum - 1;

				}else if(className.indexOf('next') !== -1) {
					
					num = self.pageNum + 1;

				}else if(className.indexOf('end') !== -1) {
					
					num = self.pageLen - 1;

				}else {
					
					num = parseInt($this.html(), 10) - 1;

				}
					
				self.goToPage(num, self.clickFun);

			}
			
		});
        
        $el.on('blur', '.enterPageSize input', function() {
            
            var val = $(this).val() - 0;
            
            if(val) {
                
                self.enterPageSizeFun(val);
                self.resetSetting(self);
                self.goToPage(0, self.clickFun);
                
            }
            
        }).on('blur', '.enterPageNum input', function() {
            
            var val = $(this).val() - 1;
            
            if(val) {
                
                val = val > self.pageLen ? self.pageLen : val;
                
                self.enterPageNumFun(val);
                self.goToPage(val, self.clickFun);
                
            }
            
        });
			
	},
	bindDom: function() {

		if(!this.count) {
	
			console.error('Count is null');
			return ;
		}

		var oNum = this.getShowObj(),
			startNum = this.startNum,
			endNum = this.endNum,
			i = startNum,
			len = endNum,
			tpl = this.tpl,
			pTpl = this.pageSizeTpl,
			arr = [];
		
		if(startNum > 1) {
			
			arr[0] = this.pageEllipsisTpl.replace('{{ellipsisStr}}', this.ellipsisStr);

		}

		for(; i <= len; i++) {
				
			arr[arr.length] = pTpl.replace('{{pageNum}}', i);

		}

		if(endNum < this.pageLen) {
			
			arr[arr.length] = this.pageEllipsisTpl.replace('{{ellipsisStr}}', this.ellipsisStr);

		}

		return tpl.replace('{{pageNumList}}', arr.join(''));
	
	},
		
	goToPage: function(num, callback, type) {
			
		var $el = this.$elem,
			act = this.active,
			dis = this.disabled;
		
		this.pageNum = num;

		this.renderDom(this.bindDom());
			
		$el.find('li').removeClass(act)
					 .removeClass(dis);
			
		$el.find('li').not('.first').not('.prev').eq(num - this.startNum + 1).addClass(act);
			
		if(num === 0) {
			
			$el.find('.first').addClass(dis);
			$el.find('.prev').addClass(dis)	
				
		}
			
		if(num === this.pageLen - 1) {
					
			$el.find('.next').addClass(dis);
			$el.find('.end').addClass(dis)	
		
		}
			
		if(type !== 'init') {
	
			if(callback) {
				callback(num);
			}
			
		}
		
	},
	
	getPageNum: function() {
		
		return this.$elem.find('.' + this.active).html() - 0;
			
	},
		
	renderDom: function(domStr) {
		
        if(this.showExt) {
            
            domStr += this.tplExt;
            
        }
        
		this.$elem.html(domStr);
	},
    
    enterPageSizeFun: function(newPageSize) {
        
        this.pageSize = newPageSize || this.pageSize;
        
    },
    
    enterPageNumFun: function(newPageNum) {
        
        this.pageNum = newPageNum || this.pageNum;
        
    }

};
