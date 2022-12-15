var locationURL = "https://api.tomtom.com/search/2/geocode/";
var locationURL2 = ".json?storeResult=false&view=Unified&key=5snW9WF4lm8Eo8Ui53jAilLgxYAAoZxd";
var weatherURL = "https://api.openweathermap.org/data/2.5/forecast?lat="
var weatherURL2 = "&units=imperial&appid=104392d9aee43dab1916f9553d7a9a45";
var lat;
var lon;
var locationSearchJSON;
var weatherSearchJSON;
var searchWords;
var searchRow;
var weatherData;
var dataCopy;
var locName;
var unix_timestamp;
var date;
var dateDayofWeek;
var dateDayofMonth;
var dateMonth;
var dateCheck;
var min; 
var max;
var humidityAvg;
var visibilityAvg;
var count;
var dayOfWeek;
var todayCheck;
var todayMax;
var todayMin;
var displayMonth;
var i;
var today;
$(document).ready(function() {
	
	$("#nav-placeholder").load("nav.html");

	
	$("#searchButton").click(function(){
		
		searchWords = $("#searchBar").val();
		if (searchWords == ""){
			alert("Please enter a search");
			return;
		}
		a=$.ajax({
			url: locationURL + searchWords + locationURL2,
			method: "GET"
		}).done(function(data){
			locationSearchJSON = data;
			$("locationName").html("");
			locName = data.results[0].address.municipality + ", " + data.results[0].address.countrySubdivision;
			$("#locationName").html(locName);
			lat = data.results[0].position.lat;
			lon = data.results[0].position.lon;
			displayWeather(lat,lon);
		}).fail(function(error){
			console.log("location search error", error.statusText);
		});
		
		$("#leftBox").show();
		$("#rightBox").show();
	});

	function displayWeather(lat, lon){
		
		a=$.ajax({
			url: weatherURL + lat + "&lon=" + lon + weatherURL2,
			method: "GET"
		}).done(function(data){
			var days = 0;
			weatherSearchJSON = data;
			weatherData = data;
			today;
			$("#forecast tbody").html("");
			$("#locationInfo").html("");
			for(i = 0; i < 40; i++){
				weatherCalculations(i);
				humidityAvg = humidityAvg / count;
				visibilityAvg = visibilityAvg / count / 1609;
				visibilityAvg = visibilityAvg.toFixed(2);
				$("#forecast tbody").append("<tr><td>" + dayOfWeek + " " + displayMonth + " " +  dateDayofMonth + "<img src=http://openweathermap.org/img/wn/" + data.list[i].weather[0].icon + "@2x.png alt='" + i + "dateImage' width='100' height='100'></td><td>" + Math.round(max) + " &#8457</td><td>" + Math.round(min) + " &#8457</td><td>" + data.list[i].weather[0].description + "</td><td>" + visibilityAvg + " miles</td><td>" + Math.round(humidityAvg) + " %</td></tr>");
				days = days + 1;
				if (days == 5){
					break;
				}
				
			}
			$("#forecastDate").html("");
			$("#forecastDate").html("Forecast for " + today + ":");
			$("#locationInfo").html("<p>High:" + Math.round(todayMax) + " &#8457</p><p>Low: " + Math.round(todayMin) + " &#8457</p><img src=http://openweathermap.org/img/wn/" + data.list[0].weather[0].icon + "@2x.png alt='todaysDateImage' width='200' height='200'> <img src='CBWeatherLogo.png' id='imageLogo' alt='myLogo' width='200' height='200'>");
		


			saveSearch(searchWords, locationSearchJSON, weatherSearchJSON);



		}).fail(function(error){
			console.log("weather search error", error.statusText);
		});
	}

	function computeDayofWeek(d2){
		if(d2==0){
			return "Sunday";
		} else if (d2==1){
			return "Monday";
		} else if (d2==2){
			return "Tuesday";
		} else if (d2==3){
			return "Wednesday";
		} else if (d2==4){
			return "Thursday";
		} else if (d2==5){
			return "Friday";
		} else {
			return "Saturday";
		}
	}

	function computeMonth(m2){
		if(m2==0){
			return "Jan";
		} else if (m2==1){
			return "Feb";
		} else if (m2==2){
			return "Mar";
		} else if (m2==3){
			return "Apr";
		} else if (m2==4){
			return "May";
		} else if (m2==5){
			return "June";
		} else if (m2==6){
			return "July";
		} else if (m2==7){
			return "Aug";
		} else if (m2==8){
			return "Sept";
		} else if (m2==9){
			return "Oct";
		} else if (m2==10){
			return "Nov";
		} else{
			return "Dec";
		}
	}

	function saveSearch(searchWords, locationSearchJSON, weatherSearchJSON){
		const locationStr = JSON.stringify(locationSearchJSON);
		const weatherStr= JSON.stringify(weatherSearchJSON);
		console.log(locationStr);
		a=$.ajax({
			url: 'final.php?method=setWeather',
			method: "POST",
			data: {theLocation: searchWords, mapJSON: locationStr, weatherJSON: weatherStr}
		}).done(function(data){
			console.log("successfully sent to php");
		}).fail(function(error){
			console.log("php setWeather request failed");
		});


	}

	$("#historySearchButton").click(function(){
		$("#weatherBodyHistory").hide();
		$("#historyResults tbody").html("");
                var historyRequest = $("#historyCalendar").val();
		var viewAll = $("#checkAll").is(':checked');
		console.log(viewAll);
		if (historyRequest == ""){
			alert("Please select a date");
			return;
		}
		var limit = $("#limitSearch").val();
		if (limit == "" && viewAll == false){
			alert("Please limit your search results");
			return;
		}
                a=$.ajax({
                        url: 'final.php?method=getWeather&date=' + historyRequest,
                        method: "POST"
                }).done(function(data){
                	console.log("success sent getWeather to php");
			let maxLimit = data.result.length;
			if (maxLimit == 0){
				alert("No searches made this day");
			}
			if (limit > maxLimit){
				limit = maxLimit;
			}
			if (viewAll == true){
				limit = maxLimit;
			}
			if (limit == ""){
				limit = maxLimit;
			}
			for(let i = 0; i < limit; i++){
				let mapData = JSON.parse(data.result[i].MapJson);
				dataCopy = data;
				var historyLat = mapData.results[0].position.lat;
				var historyLon = mapData.results[0].position.lon;
				searchRow = i;
				
				$("#historyResults tbody").append("<tr id=" + i + "><td>" + data.result[i].DateTime + "</td><td>" + data.result[i].Location + "</td><td>" + historyLat + ", " + historyLon + "</td><td><input type='radio' id='"+i+"'name='selectDay' value='"+i+"'></input>");

				}
		}).fail(function(error){
                        console.log("php getWeather request failed");
                });

        });

	$("#viewSearch").click(function(){
		let row = $('input[name="selectDay"]:checked').val();
		var days = 0;
			weatherData = JSON.parse(dataCopy.result[row].WeatherJson);
                        var map = JSON.parse(dataCopy.result[row].MapJson);
			locName = map.results[0].address.municipality + ", " + map.results[0].address.countrySubdivision;
			today;
                        $("#forecastHistory tbody").html("");
			$("#locationNameHistory").html("");
			$("#locationNameHistory").html(locName);
                        $("#locationInfoHistory").html("");
		for (i = 0; i < 40; i++){
                        weatherCalculations(i);        
				humidityAvg = humidityAvg / count;
                                visibilityAvg = visibilityAvg / count / 1609;
                                visibilityAvg = visibilityAvg.toFixed(2);
        	
				$("#forecastHistory tbody").append("<tr><td>" + dayOfWeek + " " + displayMonth + " " +  dateDayofMonth + "<img src=http://openweathermap.org/img/wn/" + weatherData.list[i].weather[0].icon + "@2x.png alt='" + i + "dateImage' width='100' height='100'></td><td>" + Math.round(max) + " &#8457</td><td>" + Math.round(min) + " &#8457</td><td>" + weatherData.list[i].weather[0].description + "</td><td>" + visibilityAvg + " miles </td><td>" + Math.round(humidityAvg) + " %</td></tr>");
                                days = days + 1;
                                if (days == 5){
                                        break;
                                }

                        }
                        $("#forecastDateHistory").html("");
                        $("#forecastDateHistory").html("Forecast for " + today + ":");
                        $("#locationInfoHistory").html("<p>High:" + Math.round(todayMax) + " &#8457</p><p>Low: " + Math.round(todayMin) + " &#8457</p><img src=http://openweathermap.org/img/wn/" + weatherData.list[0].weather[0].icon + "@2x.png alt='todaysDateImage' width='300' height='300'><br> <img src='CBWeatherLogo.png' id='imageLogo' alt='myLogo' width='200' height='200'>");



		$("#weatherBodyHistory").show();
	});

	function weatherCalculations(i){
		unix_timestamp = weatherData.list[i].dt;
                                date = new Date((unix_timestamp - 21600) * 1000);
                                dateDayofWeek = date.getDay();
                                dateDayofMonth = date.getDate();
                                dateMonth = date.getMonth();
                                dateCheck = dateDayofWeek;

                                min = weatherData.list[0].main.temp_min;
                                max = weatherData.list[0].main.temp_max;
                                humidityAvg = 0;
                                visibilityAvg = 0;
                                count = 0;

                                dayOfWeek = computeDayofWeek(dateDayofWeek);

                                todayCheck;
                                todayMax;
                                todayMin;

                                if (i==0){
                                        today = dayOfWeek + " " + computeMonth(date.getMonth()) + " "  +dateDayofMonth;
                                        todayCheck = dateDayofWeek;
                                }
                                while (dateDayofWeek == dateCheck){
                                displayMonth = computeMonth(dateMonth);
                                        if (weatherData.list[i].main.temp_min < min){
                                                min = weatherData.list[i].main.temp_min;
                                        }
                                        if (weatherData.list[i].main.temp_max > max){
                                                max = weatherData.list[i].main.temp_max;
                                        }
                                        if (dateDayofWeek == todayCheck){
                                                todayMax = max;
                                                todayMin = min;
                                        }
                                        humidityAvg = humidityAvg + weatherData.list[i].main.humidity;
                                        visibilityAvg = visibilityAvg + weatherData.list[i].visibility;
                                        count++;
                                        i++;
                                        if(i==39){
                                                break;
                                        }
                                        unix_timestamp = weatherData.list[i].dt;
                                        date = new Date((unix_timestamp - 21600) * 1000);
                                        dateDayofWeek = date.getDay();
                                        dateMonth = date.getMonth();
                                }
	};


});

