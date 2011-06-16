/*
 * Simplebox v1.00
 * published under the MIT - License
 * author: Artur Heinze
 */

(function($){

    var $this = null;
    
    $.simplebox = $this = {
        
        box: null,
        options: {},
        persist: false,
        
        show: function(content, options) {
            
            if(this.box) {this.clear();}
            
            this.options = $.extend({
                'title'     : false,
                'closeOnEsc': true,
                'theme'     : 'default',
                'height'    : 'auto',
                'width'     : 'auto',
                'speed'     : 500,
                'easing'    : 'swing',
				'buttons'   : false,
				'gallery'   : false,
				'gallery_current' : 0,

                //events
                'beforeShow'  : function(){},
                'beforeClose' : function(){},
				'onClose'     : function(){}
            },options);
			
            var tplDlg = '<div class="simplebox-window '+$this.options.theme+'">';
                tplDlg+=  '<div class="simplebox-closebutton"></div>';
                
				if(this.options.gallery && this.options.gallery[this.options.gallery_current+1]) {
					tplDlg +=  '<div class="simplebox-nextbutton"></div>';
				}

				if(this.options.gallery && this.options.gallery[this.options.gallery_current-1]) {
					tplDlg +=  '<div class="simplebox-prevbutton"></div>';
				}
				
                tplDlg+=  '<div class="simplebox-title" style="display:none;"></div>';
                tplDlg+=  '<div class="simplebox-content"><div class="simplebox-innercontent"></div></div>';
				tplDlg+=  '<div class="simplebox-buttonsbar"><div class="simplebox-buttons"></div></div>';
                tplDlg+= '</div>';
            
            this.box = $(tplDlg);
      
            this.box.find(".simplebox-closebutton").bind("click",function(){
                $this.close();
            });
			
            if(this.options.buttons){
                
                var btns = this.box.find(".simplebox-buttons");
                
                $.each(this.options.buttons, function(caption, fn){
                    
					$('<button type="button" class="simplebox-button">'+caption+'</button>').bind("click", function(e){
						e.preventDefault();
						fn.apply($this);
                    }).appendTo(btns);
                });
            }else{
               this.box.find(".simplebox-buttonsbar").hide(); 
            }
			
			if(this.options.gallery){

				this.box.find(".simplebox-nextbutton").one("click", function(){
					$($this.options.gallery.get($this.options.gallery_current+1)).click();
				});
				
				this.box.find(".simplebox-prevbutton").one("click", function(){
					$($this.options.gallery.get($this.options.gallery_current-1)).click();
				});
			}
            
            if($this.options.height != 'auto'){
                this.box.find(".simplebox-innercontent").css({
                  'height'    : $this.options.height,
                  'overflow-y': 'auto'
                });
            }
            
            if($this.options.width != 'auto'){
                this.box.find(".simplebox-innercontent").css({
                  'width'     : $this.options.width,
                  'overflow-x': 'auto'
                });
            }
			
            this.setContent(content).setTitle(this.options.title);
			
			this.options.beforeShow.apply(this);
			
            this.box.css({
                'opacity'   : 0,
                'visibility': 'hidden'
            })
            .appendTo("body")
            .css({
                'left' : ($(window).width()/2-$this.box.width()/2),
                'top'  : ($(window).height()/2-$this.box.height()/2)
            }).css({
                'visibility': 'visible'
            }).animate({
                opacity: 1
            }, this.options.speed, this.options.easing, function(){
            
                //focus
                if($this.box.find(":input:first").length) {
                    $this.box.find(":input:first").focus();
                }
            
            });
            
            $(window).bind('resize.simplebox', function(){
                $this.box.css({
                    'left': ($(window).width()/2-$this.box.width()/2),
					'top': ($(window).height()/2-$this.box.height()/2)
                });
				
				$this.overlay.hide().css({
                    width: $(document).width(),
                    height: $(document).height()
                }).show();
            });
            
            // bind esc
            if(this.options.closeOnEsc){
                $(document).bind('keydown.simplebox', function (e) {
                    if (e.keyCode === 27) { // ESC
                        e.preventDefault();
                        $this.close();
                    }
                });
            }
            
            this.showOverlay();
			
            return this;
        },
		
		'confirm': function(content, fn, options){
			
			var options = $.extend({
				title : "Please confirm",
				buttons: {
					Ok: function(){
						fn.apply($this);
					},
					
					Cancel: function(){
						this.close();
					}
				}
			}, options);
			
			this.show(content, options);
		
		},
		
		'alert': function(content, options){
			
			var options = $.extend({
				title : "Alert",
				buttons: {
					Ok: function(){
						this.close();
					}
				}
			}, options);
			
			this.show(content, options);
		},
		
		'gallery': function(name, options) {
			
			var items   = $("[data-gal="+name+"]"),
				options = options || {}, 
				$this   = this;
			
			items.each(function(i){
			
				var item   = $(this),
					target = item.attr("href");
				
				item.bind("click", function(e){
				
					e.preventDefault();
					
					$this.showOverlay();
					
					$('<img src="'+target+'" />').bind("load", function(){
					
						$this.show(this, $.extend({},options,{
							gallery: items,
							gallery_current: i 
						}));
					});
				});
			});
		},
        
        close: function(){
            
            if(!this.box) {return;}
            
            if(this.options.beforeClose.apply(this)===false){
                return this;
            }
            
            this.overlay.fadeOut();
            
            this.box.animate({
                'opacity': 0
            }, this.options.speed, this.options.easing, function(){
                $this.clear();
            });
			
			this.options.onClose.apply(this);

            return this;
        },
        
        clear: function(){
            
            if(!this.box) {return;}
            
            if (this.persist) {
                this.persist.appendTo(this.persist.data("sb-persist-parent"));
                this.persist = false;
            }
            
            this.box.remove();
            this.box = null;
            
            if(this.overlay){
                this.overlay.hide();
            }
            
            $(window).unbind('resize.simplebox');
            $(document).unbind('keydown.simplebox');
            
            return this;
        },
        
        setTitle: function(title){ 
          
          if(!this.box) {return;}
          
		  this.box.find(".simplebox-title").html(title)[title ? "show":"hide"]();

          return this;
        },

        setContent: function(content){ 
            
            if(!this.box) {return;}

            if (typeof content === 'object') {
				// convert DOM object to a jQuery object
				content = content instanceof jQuery ? content : $(content);
                
                if(content.parent().length) {
                    this.persist = content;
                    this.persist.data("sb-persist-parent", content.parent());
                }
			}
			else if (typeof content === 'string' || typeof content === 'number') {
				// just insert the data as innerHTML
				content = $('<div></div>').html(content);
			}
			else {
				// unsupported data type!
				content = $('<div></div>').html('Simplebox Error: Unsupported data type: ' + typeof content);
			}
          
            content.appendTo(this.box.find(".simplebox-innercontent").html(''));

            return this;
        },
        
        showOverlay: function(){
            
            if(!this.overlay && !$("#simplebox-overlay").length){
                
				$("<div>").attr('id','simplebox-overlay').css({
					top: 0,	left: 0, position: 'absolute'
				}).prependTo('body');
                
                this.overlay = $("#simplebox-overlay");
            }
            
            this.overlay.css({
                width: $(document).width(),
                height: $(document).height()
            }).show();
        }
    };

    $.fn.simplebox = function() {

        var args    = arguments;
        var options = args[0] ? args[0] : {};

        return this.each(function() {
            $.simplebox.show($(this), options);
        });
    };
})(jQuery);