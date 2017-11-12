//function is called once all the DOM elements of the page are ready to be used.
$(function() {

    $('#ok').hide();
    $('#nope').hide();
    Webcam.attach('#my_camera');

    //part of a demo from the creator of webcamjs
     function take_snapshot() {
        // take snapshot and get image data
        Webcam.snap( function(data_uri) {
            // display results in page
            document.getElementById('results').innerHTML = 
                '<h2>Here is your image:</h2>' + 
                '<img src="'+data_uri+'"/>';
            $('#my_camera').hide();
            $('#results').show();
            $('#ok').text("Submit!");
            $('#nope').text("One more time...");
            $('#ok').show();
            $('#nope').show();
            getFaceInfo(dataURItoBlob(data_uri));
            $('#snapButton').hide();
            $('.result_div').hide(); //results from API
        } );
    }

    //take a picture when this button is clicked
    $("#snapButton").click(take_snapshot)

    $('#ok').on('click', function() {
        $(this).hide();
        $('#nope').hide();
        $('#snapButton').hide();
        $('.result_div').show();
    });

    //shows and hides the necessary components to retry a pic
    $('#nope').on('click', function() {
        $('#my_result').hide();
        $('#my_camera').show();
        $('#ok').hide();
        $(this).hide();
        $('#snapButton').show();
        $('#results').hide();
        $('.result_div').hide();
    });

    //This function was taken from an answer found here so large images do not crash the browser
    //https://stackoverflow.com/questions/4998908/convert-data-uri-to-file-then-append-to-formdata
    function dataURItoBlob(dataURI) {
        var byteString;
        if (dataURI.split(',')[0].indexOf('base64') >= 0) byteString = atob(dataURI.split(',')[1]);
        else byteString = unescape(dataURI.split(',')[1]);
        var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
        var ia = new Uint8Array(byteString.length);
        for (var i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ia], {
            type: mimeString
        });
    }

    // adopted code from https://blogs.msdn.microsoft.com/martinkearn/2016/03/07/using-the-project-oxford-emotion-api-in-c-and-javascript/
    var getFaceInfo = function(photo) {
        var subscriptionKey = "f0adfced8dd843c992f811f61c80dc50";
        var imageUrl = photo;
        var APIUrl = "https://westus.api.cognitive.microsoft.com/emotion/v1.0/recognize?";
        var resultDiv = $(".result_div");
        var articleDiv = $(".article");
        resultDiv.text("Analyzing...");
        $.ajax({
            type: "POST",
            url: APIUrl,
            processData: false,
            headers: {
                "Ocp-Apim-Subscription-Key": subscriptionKey
            },
            contentType: "application/octet-stream",
            data: photo
        }).done(function(data) {
            if (data.length > 0) {
                function floatFormat(number) {
                    return Math.round(number * Math.pow(10, 6)) / Math.pow(10, 6);
                }
                var faceScore = data[0].scores;
                var faceAnger = floatFormat(faceScore.anger);
                var faceContempt = floatFormat(faceScore.contempt);
                var faceDisgust = floatFormat(faceScore.disgust);
                var faceFear = floatFormat(faceScore.fear);
                var faceHappiness = floatFormat(faceScore.happiness);
                var faceNeutral = floatFormat(faceScore.neutral);
                var faceSadness = floatFormat(faceScore.sadness);
                var faceSurprise = floatFormat(faceScore.surprise);

                //Dictionary of outputs from the API
                var outputs = {
                    "angry": faceAnger,
                    "to be showing contempt": faceContempt,
                    "disgusted": faceDisgust,
                    "fearful": faceFear,
                    "happy": faceHappiness,
                    "neutral": faceNeutral,
                    "sad": faceSadness,
                    "surprised": faceSurprise
                };

                var newOutputs = [];

                //gets the value for each emotion
                for (var emotion in outputs) {
                    newOutputs.push(outputs[emotion])
                }

                //find the emotion with the highest probability
                var maxEmotion = Math.max.apply(Math, newOutputs);

                var outputText = "";
                    for (var emotion in outputs) {
                        if (outputs[emotion] == maxEmotion) {
                            outputText = "<h3>" + "You seem " +  emotion + "</h3>"
                        }
                    }
                resultDiv.html(outputText);
            } else {
                resultDiv.text("Something went wrong, try again!");
            }
        })
    };
});

