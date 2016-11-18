/*
**  ship Controller for handling user based 
**  product shipment business logic 
*/

"use strict";

angular.module('productModule')

    //For shipment of registered products
    .controller('productShipController', ['userModel', 'appConstants', '$state', '$rootScope', 'productServiceAPI',
        '$log', 'productModel', 'ngDialog', '$scope', 'userServiceAPI',
        function (userModel, appConstants, $state, $rootScope, productServiceAPI,
            $log, productModel, ngDialog, $scope, userServiceAPI) {
            try {
                var vm = this;
                productModel.resetProduct();
                vm.user = userModel.getUser();
                $rootScope.isLoggedIn = userModel.isLoggedIn();
                setUserProfile(vm, userModel);
                vm.product = productModel.getProduct();
                //hardcoded for demo
                vm.userQuantity = "";
                
                
                vm.openDatepicker = function () {
                    vm.datepickerObj.popup.opened = true;
                };
                
                
                /****************** Distributer/Retailer Multiselect functionality *******************/
                vm.settings = appConstants.MULTISELECT_SETTINGS;
                vm.exampleModel = [];
                if (vm.isManufacturer) {
                    vm.data = [{ id: 1, label: "Retailer1" }, { id: 2, label: "Retailer2" },{ id: 5, label: "Retailer3" }, { id: 6, label: "Distributer1" }, { id: 7, label: "Distributer2" }];
                }
                if (vm.isProducer) {
                    vm.data = [{ id: 1, label: "Manufacturer1" }, { id: 2, label: "Manufacturer2" }, { id: 3, label: "Manufacturer3" },
                        { id: 4, label: "Manufacturer4" }];
                }
                
                
                /****************** Confirmation box functionality *******************/
                $scope.redirectUser = function (flag) {
                    ngDialog.close();
                    var userReq = {
                        id: vm.isManufacturer ? 'retailer' : vm.isProducer ? 'manufacturer' : ''
                    }
                    userServiceAPI
                        .login(userReq)
                        .then(function (response) {
                            userModel.setUser(response.user);
                            $state.go('acknowledge');
                        }, function (err) {
                            $log.error(appConstants.FUNCTIONAL_ERR, err);
                        })
                        .catch(function (e) {
                            $log.error(appConstants.FUNCTIONAL_ERR, err);
                        });
                };
                
                
                /****************** Product Shipment functionality *******************/
                vm.doProductShipment = function () {

                    if (!(isNaN(parseInt(vm.userQuantity, 10)))) {
                        if (parseInt(vm.userQuantity) > parseInt(vm.product.quantity)) {
                            $scope.warningMsg = appConstants.QUANTITY_EXCEEDED;
                            showWarning(ngDialog, 'warningBox', '42%', false, 'ngdialog-theme-default warning-box', $scope);
                            return;
                        }
                    } else {
                        $scope.warningMsg = appConstants.QUANTITY_EXCEEDED;
                        showWarning(ngDialog, 'warningBox', '42%', false, 'ngdialog-theme-default warning-box', $scope);
                        return;
                    }
                    vm.product.quantity = vm.userQuantity;
                    // do Product/material shipment
                    productServiceAPI
                        .shipProduct(vm.product)
                        .then(function (response) {
                            //productModel.setProduct(response.shipmentDetails);
                            //vm.product = productModel.getProduct();
                            $rootScope.hasError = false;
                            /*$rootScope.isSuccess = true;
                            $rootScope.SUCCESS_MSG = "Product has been shipped successfully";
                            */
                            //displayModelDialog(ngDialog, $scope, '');
                            //Hardcoded. Need to remove
                            $scope.randomToken = 'LFG' + (Math.floor(Math.random() * 90000) + 10000) + '';
                            $scope.name = vm.isManufacturer ? response.productName : response.materialName;
                            $scope.quality = response.quality;
                            $scope.entity = vm.isManufacturer ? 'product' : 'material';
                            showConfirmation(ngDialog, 'confirmationBox', 600, false, 'ngdialog-theme-default', $scope);
                        }, function (err) {
                            $log.error(appConstants.FUNCTIONAL_ERR, err);
                        })
                        .catch(function (e) {
                            $log.error(appConstants.FUNCTIONAL_ERR, e);
                        });
                };




                /****************** Product Lineage functionality *******************/
                // isShipped value will be 'pending' for manufacturer
                //Hardcoded. Need to remove
                $scope.serviceData = { data: { product: { isShipped: 'pending', name: 'Handbag', mfgDate: '1/1/2016', receivedDate: '1/1/2016', items: [{ name: 'Leather', mfgDate: '3/1/2016', shipmentDate: '4/1/2016', receivedDate: '7/1/2016' }, { name: 'Buckel', mfgDate: '3/1/2016', shipmentDate: '4/1/2016', receivedDate: '7/1/2016' }] } } };
                $scope.lineageData = $scope.serviceData.data;
                $scope.lineageSubData = $scope.lineageData.product.items[0];
                $scope.lineageSubMaterialData = $scope.lineageData.product.items;

                vm.showProductLineage = function () {
                    if ($scope.lineageData.product.isShipped === 'yes') {
                        $scope.isShipped = true;
                        $scope.isShippedToRetailer = true;
                    } else if ($scope.lineageData.product.isShipped === 'no') {
                        $scope.isShipped = false;
                        $scope.isShippedToRetailer = false;
                    }
                    else {
                        $scope.isShipped = true;
                        $scope.isShippedToRetailer = false;
                    }
                    showConfirmation(ngDialog, 'productLineageBox', '60%', true, 'ngdialog-theme-default lineage-box', $scope);
                };

                /*************************************************************** */



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

/****
 *  Utility function for rendering warning message 
 ***/
function showWarning(ngDialog, templateID, width, showClose, className, scope) {
    ngDialog.open({
        scope: scope,
        width: width,
        template: templateID,
        showClose: showClose,
        className: className
    });
};

/****
 *  Utility function for rendering confirmation message 
 ***/
function showConfirmation(ngDialog, templateID, width, showClose, className, scope) {
    ngDialog.open({
        scope: scope,
        width: width,
        template: templateID,
        showClose: showClose,
        className: className
    });
}