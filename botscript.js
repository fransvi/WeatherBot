
let accessToken = '3b872c18a1774cbbad38a0a88ab2fdc2';
let weatherAccessToken = '43d0c499c77fb5a3f2c226f556b00483';
let weatherURL = 'https://api.openweathermap.org/data/2.5/weather?';
let baseUrl = 'https://api.dialogflow.com/v1/';
let botui = new BotUI('chatbot');


let currentLat;
let currentLng;


// Get the geolocation info for the user.
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    }
}

function showPosition(position) {
    currentLat = position.coords.latitude;
    currentLng = position.coords.longitude;
}
// Initialize the bot at the start
function initBot() {
    botui.message.add({
        content: 'Ask me about the weather...',
        delay: 1500,
      }).then(chatLoop);
}

// Chat loop for bot to keep talking.
function chatLoop() {
        botui.action.text({
          action: {
            placeholder: '...'},
        }
      ).then(function(res) {
          console.log(res.value);
          callForBotReply(res.value);
        }
    ).then(chatLoop);
}

// Display the bot answer.
function botAnswer(msg) {
    botui.message.add({
        content: msg,
        delay: 500,
      });
}

// Fetch bot reply from dialogflow and handle
// the weather call according given intent.

function callForBotReply(msg) {
    $.ajax({
        type: 'POST',
        url: baseUrl + 'query?v=20150910',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        headers: {

            'Authorization': 'Bearer ' + accessToken,
        },
        data: JSON.stringify({query: msg, lang: 'en',
         sessionId: 'som3434255gssss',
         originalRequest: {data: {'message': 'test'}}}),
        success: function(data) {
            if (data.result.action == 'weatherCheck') {
                let city = JSON.stringify(data.result.parameters['geo-city']);
                city = stripQuotes(city);
                if (city != '') {
                    fetchWeatherData(city);
                } else {
                    botAnswer(data.result.fulfillment.speech);
                }
            } else if (data.result.metadata.intentName == 'currentWeather') {
                console.log(currentLat+' _ '+currentLng);
                    if (currentLat != null && currentLng != null) {
                        fetchWeatherDataLatLng(currentLat, currentLng);
                    } else {
                        botAnswer(data.result.fulfillment.speech);
                    }
            } else {
                botAnswer(data.result.fulfillment.speech);
            }
        },
        error: function() {
            botAnswer('Error.');
        },
    });
}

// Helper function to clear Quotes from a string.
function stripQuotes(a) {
    if (a.charAt(0) === '"' && a.charAt(a.length-1) === '"') {
        return a.substr(1, a.length-2);
    }
    return a;
}

// Fetch the weather data from given city and display the bot answer.
function fetchWeatherData(city) {
    fetch(weatherURL+'q='+city+'&appid='+weatherAccessToken+'&units=metric')
    .then(
      function(response) {
        if (response.status !== 200) {
          return;
        }
        if (response.status == 400) {
            botAnswer('I couldnt find the city you entered.');
            return;
        }
        response.json().then(function(data) {
            let answer = 'The weather in '+data.name+' is '
            +data.weather[0].main+' with a temperature of '
            +data.main.temp+' celcius.';
            botAnswer(answer);
        });
      }

    );
}

// Fetch weather data according the users lat and lng coordinates.
function fetchWeatherDataLatLng(lat, lng) {
    fetch(weatherURL+'lat='
    +lat+'&lon='
    +lng+'&appid='
    +weatherAccessToken+'&units=metric')
    .then(
      function(response) {
        if (response.status !== 200) {
          return;
        }
        if (response.status == 400) {
            botAnswer('Your geolocation might be disabled, try asking by a city name.');
            return;
        }
        response.json().then(function(data) {
            let answer = 'The weather in '+data.name+' is '
            +data.weather[0].main+' with a temperature of '
            +data.main.temp+' celcius.';
            botAnswer(answer);
        });
      }

    );
}

getLocation();
initBot();
