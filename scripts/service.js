angular.module("Container").factory("downloadService", function($interval, $timeout, $q, $cookieStore) {

  var iframe = document.createElement('iframe');
  var generateIframeDownload = function(filename) { 
    $cookieStore.put('download_file', filename);
    iframe.src = 'http://129.213.86.196:8080/Oracle_Storage-1/storage/downloadObj';
    iframe.style.display = "none";
    document.body.appendChild(iframe);
  }

  var manageIframeProgress = function() {
        var defer = $q.defer();
    // notify that the download is in progress every half a second / do this for a maximum of 50 intervals 
    var promise = $interval(function() {
      if (!$cookieStore.get('download_file')) {
        $interval.cancel(promise);
      }
    }, 500, 50);

    promise.then(defer.reject, defer.resolve, defer.notify);

    promise.finally(function() {
      $cookieStore.remove('download_file');
      document.body.removeChild(iframe);
    });

    return defer.promise;
  }

  return {
    validateBeforeDownload: function(config) {
      var defer = $q.defer();

      // notify that the download is in progress every half a second
      $interval(function(i) {
        defer.notify(i);
      }, 500);

      //mock response from server - this would typicaly be a $http request and response
      $timeout(function() {
        // in case of error: 
        //defer.reject("this file can not be dowloaded");
        defer.resolve(config);
      }, 3000);

      return defer.promise;
    },
    downloadFile: function(config) {
    console.log("config is : "+config);
    console.log("config.objname is " + config.objname);
    
      generateIframeDownload(config.objname);
      var promise = manageIframeProgress();

      //mock response from server - this would be automaticlly triggered by the file download compeletion
      $timeout(function() {
        $cookieStore.remove('download_file');
      }, 3000);

      return promise;
    }
  }
});