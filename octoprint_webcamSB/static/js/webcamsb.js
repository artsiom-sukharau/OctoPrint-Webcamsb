/*
 * View model for OctoPrint-Webcamsb
 *
 * Author: Luis Magar Brunner
 * License: AGPLv3
 */
$(function() {
    function WebcamSBViewModel(parameters) {
		var self = this;
		self.settings = parameters[0];	
		self.expanded_cam = 0; //Change suggested by jneilliii
		self.onBeforeBinding = function() {	
			var st = self.settings.settings.plugins.webcamSB;
			self.streams = [st.url(),st.url1(),st.url2(),st.url3()];
			self.names = [st.name(),st.name1(),st.name2(),st.name3()];
			self.flips = [st.f1x(),st.f1z(),st.f2x(),st.f2z()];
			self.rotates = [st.rot1(),st.rot2()];
			self.aspect = [st.asp1(),st.asp2()];
			self.selector = st.selector();
			var num_cams = 0;
			var def_cam = self.settings.settings.plugins.webcamSB.defaultCam();
			if (self.streams[0] == "") self.streams[0] = $('#settings-webcamStreamUrl').val();
			var botones = document.createElement("div");
			botones.setAttribute("id","webcsb_botones");
			if (self.selector == 0) {
				var selector = document.createElement("select");
				$(botones).append(selector);
				selector.setAttribute("data-bind", "event: { change: $root.wcsb_cargaCam }");
			}
			for (var x=0; x<=3; x++) {
				if (self.streams[x] != "") {
					if (self.selector == 1) { $(botones).append('<button class="btn" data-bind="click: wcsb_cargaCam.bind($data, '+x+')">'+self.names[x]+'</button>'); } else {
						$(selector).append('<option value='+x+'>'+self.names[x]+'</option>');
					}
					num_cams++;
				}
			}	
			
			if (num_cams > 1) $('#wcsb_bot').append(botones);
			if (num_cams == 0) {
				$('#webcamsb').html("<p style='font-size:0.9em;text-align:center'>Stream not set</p>"); return;
			}
			var x = 3;
			while (x >= 0) {
				if (def_cam == x+1 && self.streams[x] == "") {
					def_cam--; x--; continue; 
				} else {
					self.wcsb_cargaCam(def_cam-1);
					break;
				}
				x--;
			}
		};
		self.wcsb_cargaCam = function(cual) {
			var str = self.streams[cual];
			var lacam = $("#sidewebcam");
			str += "?" + new Date().getTime();
			lacam.attr("src", str);	
			var fx = 1; var fy = 1; var x = 0; 
			if (cual <= 1) {
				if (cual == 1) x = 2;
				if (self.flips[x+0] == 1) fx = -1;
				if (self.flips[x+1] == 1) fy = -1; 
			};
			var rotation = 0;
 			if (self.rotates[cual] != undefined) rotation = self.rotates[cual];
			$(lacam).css({"transform":"scale("+fx+","+fy+") rotate("+rotation+"deg)"});
			var max_h = 250; var imc_w = "auto"; var imc_h = "auto"; var is_rot = 0;
			if (rotation != 0) {
				imc_w = max_h+"px";
				if (self.aspect[cual] == 2) imc_h = Math.floor(max_h*(3/4))+"px";
				if (self.aspect[cual] == 1) imc_h = Math.floor(max_h*(9/16))+"px";	
				is_rot = self.aspect[cual];
			} 
			window.localStorage.setItem('wcsb_im_h', imc_h);
			window.localStorage.setItem('wcsb_im_w', imc_w);
			window.localStorage.setItem('wcsb_im_rot', is_rot);
			$("#sidewebcam").css({"width":imc_w,"height":imc_h});
			$("#wcsb_imc").css({"height":imc_w});
		}
		self.wcsbPOC = function() {
			var posl = 0; var post = 0;
			var tamw = '100%';
			var pos = 'relative';
			var tamh = 'auto';
			if (self.settings.settings.plugins.webcamSB.expand() == 1) {
				if (self.expanded_cam > 0) { 
					tamw = window.localStorage.getItem('wcsb_im_w'); tamh = window.localStorage.getItem('wcsb_im_h'); pos = 'relative'; posl= 0; post = 0;
					$('#wcsb_bk').remove();
					self.expanded_cam = 0;
				} else {
					
					tamw = 'auto'; tamh = ($(window).height()-20)+'px'; pos = 'fixed'; posl = 0; post = 10;
					var esrot = window.localStorage.getItem('wcsb_im_rot');
					$('#wcsb_imc').append('<div id="wcsb_bk"></div>');
					$('#wcsb_imc').css({"height":$(window).height()+'px'});
					$('#wcsb_bk').css({"display":"block","position":"fixed","background-color":"#000","left":0,"top":0,"width":"100%","height":"100%","z-index":9});
					$('#wcsb_bk').fadeTo("fast", 0.50);	
					self.expanded_cam = 1;
				}
				$('#wcsb_imc').css({"position":"relative"});
				$('#sidewebcam').css({"display":"block","position":pos,"z-index":10,"width":tamw,"height":tamh,"left":posl,"top":post});
				if (self.expanded_cam > 0) {
					posl=(($(window).width()-$('#sidewebcam').width())/2);
					$('#sidewebcam').css("left",posl);
				}
				$('#wcsb_imc').css({"height":tamw});
			}
		}
		self.onAfterBinding = function() {
			$('#sidebar_plugin_webcamSB_wrapper .accordion-heading a').prepend('<i class="fa icon-black fa-camera"/>');	
        };			
    };
    OCTOPRINT_VIEWMODELS.push({
        construct: WebcamSBViewModel,
        dependencies: ["settingsViewModel"],
        elements: ["#sidebar_plugin_webcamSB_wrapper"]
    });
});