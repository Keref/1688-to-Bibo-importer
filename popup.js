// This callback function is called when the content script has been 
// injected and returned its results
function onPageDetailsReceived(pageDetails)  { 
	document.getElementById('bibo_token').value = bibo_token;
	$("#save").attr("disabled", true);
    document.getElementById('title').value = pageDetails.title; 

    //document.getElementById('url').value = pageDetails.url; 
    //document.getElementById('summary').innerText = pageDetails.summary; 
	document.getElementById('price').value = Math.round( pageDetails.price * 1.20 );
	//$('#summary').text(pageDetails.url);
	for (pic in pageDetails.coverpics){
		$('#coverpics').append("<img class='coverpic' src='"+pageDetails.coverpics[pic]+"' width='96px' />");
	}
	console.log(pageDetails.coverpics.length);
	$('#img_counter').text(pageDetails.coverpics.length);
	
	$('.coverpic').click(function(){
		$(this).remove();
		$('#img_counter').text( $('#img_counter').text() - 1 );
	});
	$('#save_coverpics').click(function(){
		//var coverUrl = $('#coverpics img').attr('src');
		$('#add_product_pic').empty();
		$('#coverpics img').each(function(index){
			$('#add_product_pic').append('<input type="hidden" id="album'+index+'" name="goods[album]['+index+']" value="3fac3cb7e03d40fbe877207ec80632e4" /> ');
		});
		var total_img = $('#coverpics img').length;
		$('#img_counter').text(total_img);
		$('#coverpics img').each(function(index){
			picUrl = $(this).attr('src');
			if (index ==0) {
				setCoverPic(picUrl, function(output){
					console.log(output);
					if (output.errno == 0){
						//add image url to the product form
						console.log(output.result.url);
						$('#cover').val(output.result.hash);
						$('#album0').val(output.result.hash);
						//put a marker on the picture that shows properly uploaded
						//for now we display it in the form
						total_img -= 1;
						$('#img_counter').text(total_img);
						if( total_img == 0 ) $("#save").attr("disabled", false);
					}
				});
			}
			else {
				setCoverPic(picUrl, function(output){
					console.log(output);
					if (output.errno == 0){
						//add image url to the product form
						console.log(output.result.url);
						$('#album'+index).val(output.result.hash);
						//put a marker on the picture that shows properly uploaded
						//for now we display it in the form
						total_img -= 1;
						$('#img_counter').text(total_img);
						if( total_img == 0 ) $("#save").attr("disabled", false);
					}
				});
			}
		});
		
	});
	var sortable = Sortable.create(document.getElementById('coverpics'));
	
	
	$('#add_param').click(function(){
		if ( ! $('#param_name').val() ) return false;
		var param_div = $('<div id="param_'+$('#param_name').val()+'" data-property="'+$('#param_name').val()+'">'+$('#param_name').val()+'</div>');
		param_div.append(' <a href="#" class="param_remove" style="color: red">(X)</a> : ');
		param_div.append('<input type="text" placeholder="property" size="6" />');
		
		var param_plus = $('<input type="submit" value="+" />');
		param_plus.click(function(){ $(this).before('<input type="text" placeholder="property" size="6" />') });
		param_div.append(param_plus);
		$('#param_table').append(param_div);
		$('.param_remove').click(function(){ $(this).parent().remove(); });
		$('#param_name').val('');
	});
	
	$('#generate').click(function(){
		console.log('generate baby!');
		var properties = $('#param_table div').map(  function(){
			return $(this).attr('data-property');
		}).get();
		console.log('properties', properties);
		var pp = [];
		$('#param_table div').each(  function(){
			var inner = $(this).find("input[type=text]").map(function(){
				var v = $(this).val();
				return  v ? v : null ;
			}).get();
			pp.push( inner);
		});
		console.log("matrix", pp);
		
		var cart = printCombos(pp);
		console.log("cartesian", cart);
		
		$('#property_list').empty();
		$('#add_product_prop').empty();
		for (var k = 0; k < cart.length; k++){
			$('#add_product_prop').append('<input type="hidden" name="goods[property]['+k+'][stocks]" value="'+$('#qty').val()+'" />');
			$('#property_list').append('goods[property]['+k+'][stocks] : '+$('#qty').val()+' <br/ >');
			
			$('#add_product_prop').append('<input type="hidden" name="goods[property]['+k+'][price]" value="'+$('#price').val()+'" />');
			$('#property_list').append('goods[property]['+k+'][price] : '+$('#price').val()+' <br/ >');
			
			for ( var n =0; n < properties.length; n++){
				$('#add_product_prop').append('<input type="hidden" name="goods[property]['+k+'][property]['+n+'][key]" value="'+ properties[n]+ '" />');
				$('#property_list').append('goods[property]['+k+'][property]['+n+'][key] : '+ properties[n]+ '<br/ >');
				
				$('#add_product_prop').append('<input type="hidden" name="goods[property]['+k+'][property]['+n+'][value]" value="'+ cart[k][n]+ '" />');
				$('#property_list').append('goods[property]['+k+'][property]['+n+'][value] : '+ cart[k][n]+ '<br/ >');
			}
		}
	});
	
	
	
	var frm = $('#add_product');
	frm.submit(function(e){
		$("#save").attr("disabled", true);
		
		e.preventDefault();
		
		
		var formData = frm.serializeArray();
		for (var value of formData.values()) { console.log(value); }
		$.post('https://api.bibo.market/webapi/shop/addgoods', formData).done(function (data) {
			console.log('Great Success');
			console.log(data);
			$('#save').attr('value', 'sent !');
			$('#status-display').append(' - <a href="https://bibo.market/?file=&file=#/productDetails?id=' + data.result.goods_id + '">New product</a> - ');
			$('#status-display').append('<a href="https://bibo.market/?file=&file=#/userCenter/goodsManagement/addGoods?isBusiness=true&goods_id=' + data.result.goods_id + '">Edit product</a>');
		});
		
		/*var values = {};
		var formData = new FormData();
		var token = 'bibo_5dc8d1505eadd';
		formData.append("token", token);
		formData.append("language", "zh");
		formData.append("goods[category_id]", "1001");
		
		$.each(frm.serializeArray(), function(i, field) {
			values[field.name] = field.value;
		});
		console.log(values);
		
		
		var data = $('form').serialize();
		console.log(data);
		
		$.ajax({
			type: 'POST',
			url: 'https://api.bibo.market/webapi/shop/addgoods',
			data: formData,
			contentType: false,
			processData: false,
			success: function(ret){
				
			}
		});*/
	});
} 


//Cartesian products array creation
function printCombos(array) {
	var results = [[]];
	for (var i = 0; i < array.length; i++) {
		var currentSubArray = array[i];
		var temp = [];
		for (var j = 0; j < results.length; j++) {
			for (var k = 0; k < currentSubArray.length; k++) {
				temp.push(results[j].concat(currentSubArray[k]));
			}
		}
		results = temp;
	}
	return results;
}




//sends first pic in the list to become cover pic
function setCoverPic(cover_url, callback_function){
	console.log('setting cover pic 1');
	var request = new XMLHttpRequest();
	request.open('GET', cover_url, true);
	request.responseType = 'blob';
	request.onload = function() {
		var reader = new FileReader();
		//reader.readAsDataURL(request.response);
		reader.readAsArrayBuffer(request.response);
		reader.onload =  function(e){
			console.log('DataURL:', e.target.result);
			sendImage(e.target.result, callback_function);
		};
	};
	request.send();
}

function sendImage(img_blob, callback_upload){
	const file = new File([img_blob], "cover.jpg", {
            type: 'image/jpg'
        });
	var formData = new FormData();
	var token = 'bibo_5dc8d1505eadd';
	formData.append("token", token);
	//formData.append('fname', 'ttoot.jpg')
	formData.append("file", file);
	$.ajax({
		type: 'POST',
		cache: false,
		url: 'https://api.bibo.market/webapi/file/upload',
		data: formData,
		contentType: false,
		processData: false,
		success: function(data){
			callback_upload(data);
		}/*,
		beforeSend: function (xhr){ 
			xhr.setRequestHeader("Authorization", "Bearer " + token); 
		}*/
	}).fail((e) => {
		console.log('whoopsie!', e);
	});
}



// When the popup HTML has loaded
window.addEventListener('load', function(evt) {
    // Cache a reference to the status display SPAN
    statusDisplay = document.getElementById('status-display');
    // Handle the bookmark form submit event with our addBookmark function
    //document.getElementById('addbookmark').addEventListener('submit', addBookmark);
    // Get the event page
    chrome.runtime.getBackgroundPage(function(eventPage) {
        // Call the getPageInfo function in the event page, passing in 
        // our onPageDetailsReceived function as the callback. This injects 
        // content.js into the current tab's HTML
        eventPage.getPageDetails(onPageDetailsReceived);
    });
	

});