'use strict';

var app = angular.module('Container', ['ui.bootstrap', 'angularUtils.directives.dirPagination'])
app.service('sharedProperties', function () {
   var property = 'https://129.213.86.196:8443/Oracle_Storage-1/storage/'; //'http://10.159.236.228:8081/Oracle_Storage/storage/'; 

  return {
    getProperty: function () {
      return property;
    },
    setProperty: function (value) {
      property = value;
    }
  };
});
app.controller('ContainerController', ['$rootScope', '$scope', '$http', 'sharedProperties', '$location', '$uibModal',
  function ($rootScope, $scope, $http, sharedProperties, $location, $uibModal) {
    console.log('after container click');
    $rootScope.clickedContainer;
    $scope.checked_objects = [];
    $scope.$on('LOAD',function(){$scope.loading=true});
    $scope.$on('UNLOAD',function(){$scope.loading=false});
    // calls refresh method which fetches objects in the account
    var refresh = function () {
      $scope.$emit('LOAD');
      $scope.cc = $rootScope.clickedContainer;
      $http({
        method: 'POST',
        url: sharedProperties.getProperty() + 'listObjs',
        headers: {
          'Content-Type': 'application/json'
        },
        data: {
          "containerName": $scope.cc
        }
      }).then(function (response) {
        $scope.containerObjs = response;
        $scope.$emit('UNLOAD');
        console.log($scope.containerObjs.data.Objects);
      }, function (err) {
        console.log('ERR' + err);
      });

    };

    
    refresh(); //this call makes a call to refresh method whenever the page loads
   
    //downloads objects from containers
    $scope.download = function (downloadobjName) {
        $http({
          method: 'POST',
          url: sharedProperties.getProperty() + 'downloadObj',
          headers: {
            'Content-Type': 'application/json'
          },
          data: {
            "containerName": $scope.cc,
            "objectName": downloadobjName,
            "fileName": downloadobjName
          },
          responseType: 'arraybuffer'
        }).then(function (response) {

          var fileName = response.config.data.fileName;
          if (fileName.includes(".manifest")) {
            fileName = fileName.replace(".manifest", "");
          }
          console.log("new file name" + fileName);
          var contentType = "application/json";

          var linkElement = document.createElement('a');
          try {
            var blob = new Blob([response.data], {
              type: contentType
            });
            var url = window.URL.createObjectURL(blob);

            linkElement.setAttribute('href', url);
            linkElement.setAttribute("download", fileName);

            var clickEvent = new MouseEvent("click", {
              "view": window,
              "bubbles": true,
              "cancelable": false
            });
            linkElement.dispatchEvent(clickEvent);
          } catch (ex) {
            console.log(ex);
          }
        }).then(function (err) {
          console.log(err);
        });
      };

//deletes the containers
    var del = function () {
      var deleteUrl = '';
      var checked_objs = $scope.checked_objects;
     console.log($scope.cc);
      var textfile = "";
      $scope.loadMessage = "Deleting files ....";
      if (checked_objs.length > 10) {      
        deleteUrl = sharedProperties.getProperty() + 'bulkdeleteObj';
        for (var i = 0; i < checked_objs.length; i++) {
          textfile = textfile + $scope.cc + '/' + checked_objs[i] + '\n';
        }
        console.log("textfile is : " + textfile);
        var xhr = new XMLHttpRequest();      
        $http({
          method: 'POST',
          url: deleteUrl,
          headers: {
            'Content-Type': 'text/plain'
          },
          data: textfile
        }).then(function (response) {
          refresh();
          $scope.loadMessage = "Files Deleted!!.."
          $scope.checked_objects = [];
        }, function (err) {
          console.log('ERR' + err);
        });
      } else {
        deleteUrl = sharedProperties.getProperty() + 'deleteContainerObjs';
        for (var i = 0; i < checked_objs.length; i++) {
          console.log(checked_objs[i]);
          $http({
            method: 'POST',
            url: deleteUrl,
            headers: {
              'Content-Type': 'application/json'
            },
            data: {
              "objectName": checked_objs[i],
              "containerName": $scope.cc
            }
          }).then(function (response) {
            refresh();
            $scope.checked_objects = [];
          }, function (err) {
            console.log('ERR' + err);
          });
        }
      }
   }

    $scope.toggleAll = function () {
      var toggleStatus = $scope.selectall;
      var objectToggleStatus = $scope.checkall;
      if (toggleStatus || objectToggleStatus) {
        angular.forEach($scope.containerObjs.data.Objects, function (value) {
          $scope.checked_objects.push(value.objName);
        });
      } else {
        $scope.checked_objects = [];
      }
    }




    $scope.checkAll = function () {
      console.log("in Check  All");
      $scope.checkall = true;
      angular.forEach($scope.containerObjs.data.Objects, function (value) {
        $scope.checked_objects.push(value.objName);
      });
    }
    $scope.uncheckAll = function () {
      console.log("in UnCheck  All");

      $scope.checkall = false;
      $scope.checked_objects = [];
      console.log("In uncheck all method : " + $scope.checked_objects);
    }
   var uploadBulk = function () {
     var fileList =[];
      var fd = new FormData();
      fd.append("file", $scope.uploadFiles[0]);
      console.log("FileList: "+$scope.uploadFiles[0].length);
      fd.append("containerName", $scope.cc);
      fd.append("isFolder","false");
      var xhr = new XMLHttpRequest();
      xhr.upload.addEventListener("progress", uploadProgress, false);
      xhr.addEventListener("load", uploadComplete, false);
      xhr.addEventListener("error", uploadFailed, false);
      xhr.addEventListener("abort", uploadCanceled, false);
      xhr.open("POST", sharedProperties.getProperty() + "bulkuploadObj")
      $scope.progressVisible = true
      xhr.send(fd)
      $http.post(sharedProperties.getProperty() + 'bulkuploadObj', fd, {
        withCredentials: false,
        headers: {
          'Content-Type': undefined
        },
        transformRequest: angular.identity
      }).then(function (response) {
        console.log(response);
        refresh()
      }, function (err) {
        console.log('ERR' + err);
      }); 
      function uploadProgress(evt) {
        $scope.$apply(function () {
          if (evt.lengthComputable) {
            $scope.progress = Math.round(evt.loaded * 100 / evt.total)
            console.log("progress " + $scope.progress);
          } else {
            $scope.progress = 'unable to compute'
          }
        })
      }

      function uploadComplete(evt) {
        /* This event is raised when the server send back a response */
        alert($scope.uploadFiles[0].name + "Uploaded Successfully in " + $scope.cc)
      }

      function uploadFailed(evt) {
        alert("There was an error attempting to upload the file " + $scope.uploadFiles[0].name)
      }

      function uploadCanceled(evt) {
        $scope.$apply(function () {
          $scope.progressVisible = false
        })
        alert("The upload of " + $scope.uploadFiles[0].name + " has been canceled by the user or the browser dropped the connection.")
      }
    };

    var uploadNormal = function () {
      var fd = new FormData();
      $scope.fileName = "";
      $scope.index = 0;
      $scope.loadMessage = "Uploading files ....";
      // Take the first selected file
      console.log("FileList: "+$scope.uploadFiles[0].length);
      if($scope.isFolder){      
      for($scope.index = 0; $scope.index<$scope.uploadFiles[0].length;$scope.index++) {
          fd.append("file", $scope.uploadFiles[0][$scope.index]);  
      $scope.fileName += $scope.uploadFiles[0][$scope.index].name + ", ";      
      fd.append("containerName", $scope.cc);
      var xhr = new XMLHttpRequest();
      xhr.upload.addEventListener("progress", uploadProgress, false);
     
      xhr.addEventListener("error", uploadFailed, false);
      xhr.addEventListener("abort", uploadCanceled, false);
      xhr.open("POST", sharedProperties.getProperty() + "uploadObj")
      $scope.progressVisible = true
      xhr.send(fd);
      $http.post(sharedProperties.getProperty() + 'uploadObj', fd, {
        withCredentials: false,
        headers: {
          'Content-Type': undefined
        },
        transformRequest: angular.identity
      }).then(function (response) {
        
        console.log(response); 
        xhr.addEventListener("load", uploadComplete, false);        
        refresh();
        $scope.loadMessage = "Upload Completed!!!";
      }, function (err) {
         console.log('ERR' + err);
      }); //.success( '...success!...' ).error('..damn!... ');
    }
      function uploadProgress(evt) {
        $scope.$apply(function () {
          if (evt.lengthComputable) {
            $scope.progress = Math.round(evt.loaded * 100 / evt.total)
            console.log("progress " + $scope.progress);
          } else {
            $scope.progress = 'unable to compute'
          }
        })
      }

      function uploadComplete(evt) {
        /* This event is raised when the server send back a response */         
        alert( $scope.fileName+ " Uploaded Successfully in " + $scope.cc);
      
      }

      function uploadFailed(evt) {
        alert("There was an error attempting to upload the files " + $scope.fileName)
      }

      function uploadCanceled(evt) {
        $scope.$apply(function () {
          $scope.progressVisible = false
        })
        alert("The upload of files " + $scope.fileName + " has been canceled by the user or the browser dropped the connection.")
      }
    
  }
  else{
    fd.append("file", $scope.uploadFiles[0]);
    fd.append("containerName", $scope.cc);
      var xhr = new XMLHttpRequest();
      xhr.upload.addEventListener("progress", uploadProgress, false);
      xhr.addEventListener("load", uploadComplete, false);
      xhr.addEventListener("error", uploadFailed, false);
      xhr.addEventListener("abort", uploadCanceled, false);
      xhr.open("POST", sharedProperties.getProperty() + "uploadObj")
      $scope.progressVisible = true
      xhr.send(fd);
      $http.post(sharedProperties.getProperty() + 'uploadObj', fd, {
        withCredentials: false,
        headers: {
          'Content-Type': undefined
        },
        transformRequest: angular.identity
      }).then(function (response) {
        console.log(response);
        refresh();
        $scope.loadMessage = "Upload Completed!!!";
      }, function (err) {
        console.log('ERR' + err);
      }); //.success( '...success!...' ).error('..damn!... ');
    
      function uploadProgress(evt) {
        $scope.$apply(function () {
          if (evt.lengthComputable) {
            $scope.progress = Math.round(evt.loaded * 100 / evt.total)
            console.log("progress " + $scope.progress);
          } else {
            $scope.progress = 'unable to compute'
          }
        })
      }

      function uploadComplete(evt) {
        /* This event is raised when the server send back a response */
        alert($scope.uploadFiles[0].name + " Uploaded Successfully in " + $scope.cc)
      }

      function uploadFailed(evt) {
        alert("There was an error attempting to upload the file " + $scope.uploadFiles[0].name)
      }

      function uploadCanceled(evt) {
        $scope.$apply(function () {
          $scope.progressVisible = false
        })
        alert("The upload of file " + $scope.uploadFiles[0].name + " has been canceled by the user or the browser dropped the connection.")
      }  

  }
};

    var uploadLarge = function () {
      var fd = new FormData();
      // Take the first selected file
      $scope.loadMessage = "Uploading files ....";
      fd.append("file", $scope.uploadFiles[0]);
      fd.append("containerName", $scope.cc);
      fd.append("fileName", $scope.uploadFiles[0].name);
      var xhr = new XMLHttpRequest();
      xhr.upload.addEventListener("progress", uploadProgress, false);
      xhr.addEventListener("load", uploadComplete, false);
      xhr.addEventListener("error", uploadFailed, false);
      xhr.addEventListener("abort", uploadCanceled, false);
      xhr.open("POST", sharedProperties.getProperty() + "largeuploadObj")
      $scope.progressVisible = true
      xhr.send(fd)
      $http.post(sharedProperties.getProperty() + 'largeuploadObj', fd, {
        withCredentials: false,
        headers: {
          'Content-Type': undefined
        },
        transformRequest: angular.identity
      }).then(function (response) {
        console.log(response);
        refresh();
        $scope.loadMessage = "Upload Completed!!!";
      }, function (err) {
        console.log('ERR' + err);
      }); //.success( '...success!...' ).error('..damn!... ');
      function uploadProgress(evt) {
        $scope.$apply(function () {
          if (evt.lengthComputable) {
            $scope.progress = Math.round(evt.loaded * 100 / evt.total)
            console.log("progress " + $scope.progress);
          } else {
            $scope.progress = 'unable to compute'
          }
        })
      }

      function uploadComplete(evt) {
        /* This event is raised when the server send back a response */
        alert($scope.uploadFiles[0].name + "Uploaded Successfully in " + $scope.cc)
      }

      function uploadFailed(evt) {
        alert("There was an error attempting to upload the file " + $scope.uploadFiles[0].name)
      }

      function uploadCanceled(evt) {
        $scope.$apply(function () {
          $scope.progressVisible = false
        })
        alert("The upload of " + $scope.uploadFiles[0].name + " has been canceled by the user or the browser dropped the connection.")
      }
    };

   $scope.isBulk = false;
    $scope.isLarge = false;
    //deletes the containers popup
    $scope.delete = function (size) {
      console.log('setting for delete popup');
      $scope.totalObjects = $scope.containerObjs.data.totalbjs;
      var modalInstance = $uibModal.open({
        animation: true,
        ariaLabelledBy: 'modal-title',
        ariaDescribedBy: 'modal-body',
        templateUrl: 'deleteObjs.html',
        controller: 'DeleteObjsController',
        backdrop: true,
        windowClass: 'show',
        size: size,
        resolve: {
          checked_objects: function () {
            return $scope.checked_objects;
          }
        }
      });
      modalInstance.result.then(function (checked_objects) {
        console.log('objName to delete >>' + checked_objects);
        $scope.checked_objects = checked_objects;
        del();
      });
    };

    $scope.upload = function (size) {
      console.log('setting for upload popup');
      
      var modalInstance = $uibModal.open({
        animation: true,
        ariaLabelledBy: 'modal-title',
        ariaDescribedBy: 'modal-body',
        templateUrl: 'uploadObjs.html',
        controller: 'UploadObjsController',
        backdrop: true,
        windowClass: 'show',
        size: size,
        resolve: {
          files: function () {
            return $scope.files;
          }
        }
      });


      modalInstance.result.then(function (uploadFiles) {
        console.log('objName to upload >>' + uploadFiles);
        console.log('isBulk >>' + uploadFiles.isBulk);
        console.log('isLarge>>' + uploadFiles.isLarge);
        console.log('isFolder>>'+uploadFiles.isFolder);
        $scope.uploadFiles = uploadFiles.files;
        $scope.isBulk = uploadFiles.isBulk;
        $scope.isLarge = uploadFiles.isLarge;
        $scope.isFolder = uploadFiles.isFolder;
        if ($scope.isBulk == true) {
          uploadBulk();
        } else if ($scope.isLarge == true) {
          uploadLarge();
        } else {
          uploadNormal();
        }
      });
    };

    $scope.sort = function (keyname) {
      $scope.sortKey = keyname; //set the sortKey to the param passed
      $scope.reverse = !$scope.reverse; //if true make it false and vice versa
    }
  }
]);


angular.module('Container').controller('DeleteObjsController', function ($scope, $uibModalInstance, checked_objects) {
  console.log('running delete popup');

  $scope.checked_objects = checked_objects;

  $scope.ok = function () {
    // $scope.isBulkDelete = false;
    $uibModalInstance.close($scope.checked_objects);
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
   //$uibModalInstance.result.catch(function () { $uibModalInstance.close(); });
  };
});



var upldCrtl = angular.module('Container');
upldCrtl.controller('UploadObjsController', function ($scope, $uibModalInstance, files) {
  console.log('running upload popup');

  $scope.files = [];



 
  $scope.$on("fileSelected", function (event, args) {     
    $scope.$apply(function () {
      //add the file object to the scope's files collection
      $scope.files.push(args.file);
     
    });
  });

  $scope.upload = function () {
    $scope.isBulk = false;
    $scope.isLarge = false;
    if($scope.isFolder){
      let picker = document.getElementById('picker');
      let listing = document.getElementById('listing');
      console.log(picker.files);
      $scope.files.push(picker.files);
    console.log("scope.files:  "+$scope.files);
 
    $uibModalInstance.close({
      isBulk: $scope.isBulk,
      isFolder:$scope.isFolder,
      files: $scope.files
    });
      // $scope.filesPicked = function (files) {        
      //   console.log(files);
      //   for (let i = 0; i < files.length; i++) {
      //     const file = files[i];
      //     const path = file.webkitRelativePath.split('/');
      //     // upload file using path
      //     // ...
      //   }
      // };
    }
else{
    if($scope.files[0].type === "application/x-gzip"){
      $scope.isBulk = true;
    }
    if($scope.files[0].type!=="application/x-gzip" && $scope.files[0].size>=5000000){
      $scope.isLarge = true;
    }
    if($scope.isBulk===true && $scope.isLarge ===false){
    $uibModalInstance.close({
      isBulk: $scope.isBulk,
      files: $scope.files
    });
  }
  if($scope.isBulk===false && $scope.isLarge ===false){
    $uibModalInstance.close({
      isBulk: $scope.isBulk,
      files: $scope.files
    });
  }
  if($scope.isLarge===true && $scope.isBulk === false){
    $uibModalInstance.close({
      isLarge: $scope.isLarge,
      files: $scope.files
    });
  }
}
  };

  $scope.toggleFolder = function() {
    var toggleStatus = $scope.selectFolder; 
  $scope.isFolder = false;
    if(toggleStatus){
      $scope.isFolder = true;
    }      
  };
   

  $scope.filesPicked = function (files) {
    alert();
    console.log(files);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const path = file.webkitRelativePath.split('/');
      // upload file using path
      // ...
    }
  };
  $scope.cancel = function () {
   $uibModalInstance.dismiss('cancel');
  // $uibModalInstance.close();
  // $uibModalInstance.result.catch(function () { $uibModalInstance.close(); });
  };
});

app.directive('checkListobjs', function () {
  return {
    scope: {
      list: '=checkListobjs',
      value: '@'
    },
    link: function (scope, elem, attrs) {
      var handler = function (setup) {
        var checked = elem.prop('checked');
        var index = scope.list.indexOf(scope.value);

        if (checked && index == -1) {
          if (setup) elem.prop('checked', false);
          else scope.list.push(scope.value);
        } else if (!checked && index != -1) {
          if (setup) elem.prop('checked', true);
          else scope.list.splice(index, 1);
        }
      };

      var setupHandler = handler.bind(null, true);
      var changeHandler = handler.bind(null, false);

      elem.on('change', function () {
        scope.$apply(changeHandler);
      });
      scope.$watch('list', setupHandler, true);
    }
  };
});

upldCrtl.directive('fileUpload', function () {
  return {
    scope: true, //create a new scope
    link: function (scope, el, attrs) {
      el.bind('change', function (event) {
        var files = event.target.files;         
        //iterate files since 'multiple' may be specified on the element
        for (var i = 0; i < files.length; i++) {
          //emit event upward
          scope.$emit("fileSelected", {
            file: files[i]
          });
        }
      });
    }
  };
});
angular.module("Container").controller("downloadCtrl", function ($scope, $timeout, $q, downloadService) {
  $scope.downloadFile = function (downloadobjName) {
    var params = {
      'objname': downloadobjName
    };
    var loadingText = 'Loading Data';
    var options = ['.', '..', '...'];

    $scope.downloadFileText = loadingText + options[0];
    var promise = downloadService.validateBeforeDownload(params).then(null, function (reason) {
      alert(reason);
      // you can also throw the error
      // throw reason;
      return $q.reject(reason);
    }).then(downloadService.downloadFile).then(function () {
      $scope.downloadFileText = 'Loaded';
    }, function () {
      $scope.downloadFileText = 'Failed';
    }, function (i) {
      i = (i + 1) % 3;
      $scope.downloadFileText = loadingText + options[i];
    });

    promise.finally(function () {
      $timeout(function () {
        delete $scope.downloadFileText;
      }, 2000);
    });
  };
});

// function(){
//   $scope.containerObjs = ([ {             
//     objName : "objTestCon2"
//   }, {

//     objName : "objTestContainer"
//   }, {

//     objName : "obj_apaas"
//   }, {

//     objName : "obj_developer"
//   }, {

//     objName : "objdatabase"
//   }, {

//     objName : "objiot"
//   }, {

//     objName : "objiot2"
//   }, {

//     objName : "objiotContainer"
//   }, {

//     objName : "objjcs"
//   }, {

//     objName : "objtesting1"
//   }, {

//     objName : "objtesting5"
//   }, {

//     objName : "objtestingPhani"
//   }

//   ]);
// };