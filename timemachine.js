/**
 * Original Timemachine with DOM Elements by:
 *
 * Copyright (c) 2008 Kristian Thornley (thornleyk@cpit.ac.nz)
 * Licensed under a:
 * Creative Commons Attribution 3.0 New Zealand License { http://creativecommons.org/licenses/by/3.0/nz/ }.
 *
 * -------------
 *
 * Major rewrite of the Original Timemachine with Canvas
 *  - now modularized
 *  - contains image preloading
 * Copyright (c) 2009 Stefan Wehrmeyer (stefanwehrmeyer.com)
 * Creative Commons Attribution 3.0 Germany License { http://creativecommons.org/licenses/by/3.0/de/ }.
 */
 
var TimeMachine = (function(){
    var tmachine = {};    
    var preloadImages = function(imgs, cllbck, tobj){
        var images = [], 
            loadCount = 0, 
            failCount = 0,
            successCount = 0;
        
        var preloadImage = function(url, index){
                var img = new Image(),
                    check = function(){
                        if (successCount + failCount >= loadCount){
                            cllbck(images, successCount, failCount);
                        }
                    },
                    fail = function(){
                        failCount += 1;
                        check();
                    },
                    success = function(){
                        images[index] = img;
                        successCount += 1;
                        check();
                    };
                img.onload = success;
                img.onerror = fail;
                img.onabort = fail;
                img.src = url;
        };
        // init loadcount before preloading images
        for(var i=0;i<imgs.length;i++){
            if(typeof(imgs[i]) !== "object"){
                loadCount += 1;
            }
        };
        for(var i=0;i<imgs.length;i++){
            if(typeof(imgs[i]) == "object"){
                // assuming it's an image object
                images.push(imgs[i]);
            } else{
                images.push(null);
                preloadImage(imgs[i], i);
            }
        }
    };
    
    var createTimeMachinePanel = function(startId, element, timemachine){
        var panel = {},
            original_width,
            original_height,
            width,
            height,
            top = 0,
            opacity = 1,
            currentDeltaZ = 0,
            widthDelta = 0,
            heightDelta = 0,
            topDelta = 0;
            
        panel.id = startId;
        /* Could be more concise, but now it might make be easier to understand */
        if (element.width > timemachine.ctx.canvas.width || element.height > timemachine.ctx.canvas.height) {
            if (element.width > timemachine.ctx.canvas.width && element.height > timemachine.ctx.canvas.height){
                if (element.width < element.height) {
                    original_width = timemachine.ctx.canvas.width * timemachine.settings.size_ratio;
                    original_height = element.height / element.width * (timemachine.ctx.canvas.width * timemachine.settings.size_ratio);
                } else {
                    original_height = timemachine.ctx.canvas.height * timemachine.settings.size_ratio;
                    original_width = element.width / element.height * (timemachine.ctx.canvas.height * timemachine.settings.size_ratio);
                }
            }
            else {
                if (element.width > timemachine.ctx.canvas.width){
                    original_width = timemachine.ctx.canvas.width * timemachine.settings.size_ratio;
                    original_height = element.height / element.width * (timemachine.ctx.canvas.width * timemachine.settings.size_ratio);
                } else {
                    original_height = timemachine.ctx.canvas.height * timemachine.settings.size_ratio;
                    original_width = element.width / element.height * (timemachine.ctx.canvas.height * timemachine.settings.size_ratio);
                }
            }
        }
        else {
            original_width = element.width;
            original_height = element.height;
        }
        
        top =  timemachine.settings.offsetTop * Math.pow(1-timemachine.settings.decay_constant,panel.id);
        width =  original_width * Math.pow(1-timemachine.settings.decay_constant,panel.id);
        height =  original_height * Math.pow(1-timemachine.settings.decay_constant,panel.id);
        
        var fadeIn = function(){	
            if(panel.id == -1){
                opacity = (currentDeltaZ / timemachine.settings.delta_z);
            }
        };

        var fadeOut = function(){
          if (panel.id == 0 && currentDeltaZ == timemachine.settings.delta_z){
              opacity = 0;
            }
          else if (panel.id == 0){
            opacity = (timemachine.settings.delta_z-currentDeltaZ+1)/timemachine.settings.delta_z;
          }
        };
        
        var display = function(){
            if(opacity >= 0) {
                timemachine.ctx.globalAlpha = opacity;
                timemachine.ctx.fillStyle = "rgba(200, 200, 200, "+(opacity*0.8)+")";
                timemachine.ctx.fillRect (timemachine.ctx.canvas.width/2 - width/2, top, width, height);
                timemachine.ctx.drawImage(element, timemachine.ctx.canvas.width/2 - width/2, top, width, height);
            }
        };

        panel.expand = function(currentDZ){
            currentDeltaZ = currentDZ;
            topDelta = timemachine.settings.offsetTop * Math.pow(1-timemachine.settings.decay_constant,(panel.id -1)) - timemachine.settings.offsetTop * Math.pow(1-timemachine.settings.decay_constant,(panel.id));
            widthDelta = original_width * Math.pow(1-timemachine.settings.decay_constant,(panel.id -1)) - original_width * Math.pow(1-timemachine.settings.decay_constant,(panel.id));
            heightDelta = original_height * Math.pow(1-timemachine.settings.decay_constant,(panel.id -1)) - original_height * Math.pow(1-timemachine.settings.decay_constant,(panel.id));

            top += (topDelta/(timemachine.settings.delta_z+1));
            width  +=  (widthDelta/(timemachine.settings.delta_z+1));
            height  += (heightDelta/(timemachine.settings.delta_z+1));

            fadeOut();
            if(currentDeltaZ == timemachine.settings.delta_z){
                panel.id -= 1;
            }
            if(panel.id == 0){
                timemachine.setCurrentPanel(panel);
            }
            display();
        };

        panel.shrink = function(currentDZ){
            currentDeltaZ = currentDZ;
            topDelta = timemachine.settings.offsetTop * Math.pow(1-timemachine.settings.decay_constant,(panel.id )) - timemachine.settings.offsetTop * Math.pow(1-timemachine.settings.decay_constant,(panel.id +1));
            widthDelta = original_width * Math.pow(1-timemachine.settings.decay_constant,(panel.id )) - original_width * Math.pow(1-timemachine.settings.decay_constant,(panel.id +1));
            heightDelta = original_height * Math.pow(1-timemachine.settings.decay_constant,(panel.id )) - original_height * Math.pow(1-timemachine.settings.decay_constant,(panel.id +1 ));
            top -= (topDelta/(timemachine.settings.delta_z+1));
            width  -=  (widthDelta/(timemachine.settings.delta_z+1));
            height  -= (heightDelta/(timemachine.settings.delta_z+1));
            fadeIn();
            if(currentDeltaZ == timemachine.settings.delta_z){
               panel.id += 1;
            }
            if(panel.id == 0){
                timemachine.setCurrentPanel(panel);
            }
            display();
        };
        
        panel.refresh = function(){
            display();
        };

        panel.getTitle = function(){
            return element.title;
        };
        
        return panel;
    };
    
    tmachine.create = function(imagesInput, ctx, userSettings, callback){
        var that = {},
            images = [],
            panels = [],
            currentPanel,
            currentDeltaZ = 0,
            settings = {},
            defaultSettings = {
                speed: 0, //Delay of the transition
                offsetTop: 40, //How far down to start
                delta_z: 8, //frame rate of transition
                decay_constant: 0.5, //decay (shrink) of the boxes
                size_ratio : 0.75
            };
        userSettings = userSettings || {};
        for(var key in defaultSettings){
            if(typeof(userSettings[key])!=="undefined"){
                settings[key] = userSettings[key];
            } else {
                settings[key] = defaultSettings[key];
            }
        }
            
        that.settings = settings;
        that.ctx = ctx;
        
        that.registerPanels = function(images){
            console.log(images);
            for(var i=0;i<images.length;i++){
                if (images[i] != null){
                    panels.push(createTimeMachinePanel(images.length - i - 1, images[i], that));
                    panels[panels.length-1].refresh();
                }
            }
            that.setCurrentPanel(panels[panels.length-1]);
        };
        
        that.move = function(direction, action, callback){
            if(currentDeltaZ <= settings.delta_z){
                ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
                for(i=0;i<panels.length;i++){
                    panels[i][action](currentDeltaZ);
                }
                currentDeltaZ++;
                setTimeout(function(){
                    that.move(direction, action, callback);
                },settings.speed);
            }
            else{
                currentDeltaZ = 0;
                that.refreshControls();
                if(callback){
                    callback();
                }
            }
        };
        
        that.forward = function (callback){
            that.move("forward", "shrink", callback);
        };

        that.backward = function (callback){
            that.move("backwards", "expand", callback);
        };
        
        that.moveTo = function(index, callback){
            var toId = panels[index].id;
            if(toId < 0){
                //Big move Back
                for(r=0;r > toId; r--){
                    that.forward(callback);
                }
            }
            if(toId > 0){
                //Big move Forward

                for(r=0;r < toId; r++){	
                    that.backward(callback);
                }
            }
        };

        that.setCurrentPanel = function(cPanel){
            currentPanel = cPanel;
        };

        that.refreshControls = function(){
            // huh? may be point for a hook
        };

        
        var wrapCallback = function(images, successCount, failCount){
            if (typeof(callback) !== "undefined"){
                callback(that, successCount, failCount);
            }
            that.registerPanels(images);
        };
        
        preloadImages(imagesInput, wrapCallback, that);
        
        return that;
    };
    return tmachine;
}());