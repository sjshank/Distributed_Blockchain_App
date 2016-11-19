/*
**  controller for tracking shipment details and displaying result
*/

"use strict";

angular.module('searchModule')
    // searchController for tracking shipment details
    .controller('searchController', ['$state', 'appConstants', 'userModel', '$log', '$rootScope',
        '$scope', '$stateParams', 'userInfo', 'shipmentList', 'productModel',
        function($state, appConstants, userModel, $log, $rootScope,
            $scope, $stateParams, userInfo, shipmentList, productModel) {
            try {
                var vm = this;
                vm.searchQuery = '';
                vm.user = userModel.getUser();

                // Only for demo instance
                if (userInfo.user) {
                    vm.user = userInfo.user;
                    userModel.setUser(userInfo.user);
                }
                setUserProfile(vm, userModel);
                productModel.resetProduct();
                vm.product = productModel.getProduct();



                /***********QR CODE based search functionality *************************/
                //Capturing broadcasted event from qrCodeReader directive to retreive User info read from uploaded QR img.
                $scope.$on('readQR', function(event, qrCode) {
                    $rootScope.hasError = false;
                    $rootScope.ERROR_MSG = appConstants.UPLOAD_ERR;
                    if (qrCode) {
                        $state.go('home.result', { id: "", tokenInfo: null, qrCode: qrCode });
                    }
                });
                //Capturing broadcasted event from qrCodeReader directive to display error.
                $scope.$on('QRError', function(event) {
                    $rootScope.hasError = true;
                });



                /*********** TOKEN ID based search functionality *************************/
                vm.searchTrackID = function() {
                    $state.go('home.result', { id: vm.searchQuery, tokenInfo: null, qrCode: null });
                };




                /*********** Shipment List functionality on load *************************/
                //Populating shipment details on load based on shipmentDetails resolve
                //shipmentList will be 'null' for other than producer/manufacturer
                if (shipmentList) {
                    shipmentList
                        .$promise
                        .then(function(response) {
                            productModel.setProductList(response);
                            vm.list = productModel.getProductList();
                        }, function(err) {
                            $log.error(appConstants.FUNCTIONAL_ERR, err);
                        })
                        .catch(function(e) {
                            $log.error(appConstants.FUNCTIONAL_ERR, e);
                        });

                    vm.getShipmentDetails = function(data) {
                        if (data) {
                            $state.go('home.result', { id: vm.searchQuery, tokenInfo: data, qrCode: null });
                        }
                    };
                }

            } catch (e) {
                $log.error(appConstants.FUNCTIONAL_ERR, e);
            }
        }])

    // searchResultController for rendering shipment details
    .controller('searchResultController', ['$state', 'appConstants', '$log', 'shipmentDetails', 'productModel', '$stateParams',
        function($state, appConstants, $log, shipmentDetails, productModel, $stateParams) {
            try {
                var vm = this;
                productModel.resetProduct();
                vm.product = productModel.getProduct();
                

                /*********** Shipment Details functionality based on QR/TOKEN search *************************/
                //Populating shipment details on load based on shipmentDetails resolve
                if (!shipmentDetails.$promise) {
                    productModel.setProduct(shipmentDetails);
                    vm.product = productModel.getProduct();
                    //For demo. Need to replace with product.tokenID
                    vm.tokenID = vm.product.tokenId;
                } else {
                    //For demo. Need to replace with product.tokenID 
                    vm.tokenID = ($stateParams.id && $stateParams.id !== '') ? $stateParams.id : '';
                    shipmentDetails
                        .$promise
                        .then(function(response) {
                            productModel.setProduct(response);
                            vm.product = productModel.getProduct();
                        }, function(err) {
                            $log.error(appConstants.FUNCTIONAL_ERR, err);
                        })
                        .catch(function(e) {
                            $log.error(appConstants.FUNCTIONAL_ERR, e);
                        });
                }
            } catch (e) {
                $log.error(appConstants.FUNCTIONAL_ERR, e);
            }
        }]);


/****
 *  Utility function for populating userProfile 
 ***/
function setUserProfile(vm, userModel) {
    vm.isManufacturer = userModel.isManufacturer();
    vm.isProducer = userModel.isProducer();
    vm.isRetailer = userModel.isRetailer();
    vm.isAdmin = userModel.isAdmin();
};