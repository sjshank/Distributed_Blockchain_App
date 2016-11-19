/*
**  register Controller for handling user based 
**  product/material registeration business logic 
*/

"use strict";

angular.module('productModule')

    //For new product/material resgistration
    .controller('productRegisterController', ['userModel', 'appConstants', '$state', '$rootScope',
        'productServiceAPI', '$log', 'productModel', 'productList', '$scope', 'ngDialog',
        function(userModel, appConstants, $state, $rootScope,
            productServiceAPI, $log, productModel, productList, $scope, ngDialog) {
            try {
                var vm = this;
                productModel.resetProduct();
                vm.user = userModel.getUser();
                $rootScope.isLoggedIn = userModel.isLoggedIn();
                vm.isReadonly = false;
                setUserProfile(vm, userModel);
                vm.header = vm.isManufacturer ? 'REGISTER NEW PRODUCT' : 'REGISTER NEW MATERIAL';
                vm.product = productModel.getProduct();
                vm.list = [];

                //For demo
                vm.userMaterial = vm.product.materialName;

                //Populating list of Products on load based on productList resolve
                productList
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

                vm.openDatepicker = function() {
                    vm.datepickerObj.popup.opened = true;
                };
                $scope.redirectUser = function(flag) {
                    ngDialog.close();
                    if (flag) {
                        $state.reload();
                    }
                    else {
                        $state.go('shipment', { tokenId: $scope.randomToken });
                    }
                };



                /******************* Register new Product/material *************************/
                vm.registerNewProduct = function() {

                    /*******For Demo instance. Needs to refactor */
                    if (vm.isManufacturer && (vm.userMaterial !== vm.product.materialName)) {
                        $scope.warningMsg = appConstants.MATERIAL_ADHERED;
                        showWarning(ngDialog, 'warningBox', '42%', false, 'ngdialog-theme-default warning-box');
                        return;
                    } else {
                        vm.product.materialName = vm.userMaterial;
                    }

                    var req = angular.copy(productModel.getProduct());
                    delete req['productList'];

                    productServiceAPI
                        .registerProduct(req)
                        .then(function(response) {
                            //vm.product.setData(response);
                            $rootScope.hasError = false;
                            $scope.entity = vm.isManufacturer ? 'product' : 'material';
                            $scope.randomToken = 'LFG' + (Math.floor(Math.random() * 90000) + 10000) + '';
                            $scope.name = vm.isManufacturer ? response.productName : response.materialName;
                            renderProductLineage(ngDialog, $scope, 'confirmationBox', 600, false, 'ngdialog-theme-default confirmation-box');
                        }, function(err) {
                            $log.error(appConstants.FUNCTIONAL_ERR, err);
                        })
                        .catch(function(e) {
                            $log.error(appConstants.FUNCTIONAL_ERR, e);
                        });
                };


                /******************* VIEW EDIT registered product *************************/
                vm.editProduct = function(data) {
                    productModel.setProduct(data);
                    vm.product = productModel.getProduct();
                    vm.isReadonly = false;
                };
                vm.viewProduct = function(data) {
                    productModel.setProduct(data);
                    vm.product = productModel.getProduct();
                    vm.isReadonly = true;
                };
                
                
                
                
                /******************* DELETE registered product *************************/
                vm.deleteProduct = function(data) {
                    $scope.data = data;
                    ngDialog.open({
                        scope: $scope,
                        template: 'deleteBox'
                    });
                    
                    
                    $scope.confirmDelete = function() {
                        ngDialog.close();
                        
                        /****** below needs to be change. Hardcoded for demo */
                        if (vm.isManufacturer) {
                            //Making delete service call
                            productServiceAPI
                                .productDelete({ productId: data.tokenId })
                                .then(function(response) {
                                    productModel.setProductList(response);
                                    vm.list = productModel.getProductList();
                                    $rootScope.hasError = false;
                                    $rootScope.isSuccess = true;
                                    $rootScope.SUCCESS_MSG = vm.isManufacturer ? appConstants.PROD_DELETED : appConstants.MATERIAL_DELETED;
                                }, function(err) {
                                    $log.error(appConstants.FUNCTIONAL_ERR, err);
                                })
                                .catch(function(e) {
                                    $log.error(appConstants.FUNCTIONAL_ERR, e);
                                });
                        }


                        /****** below needs to be change. Hardcoded for demo */
                        if (vm.isProducer) {
                            //Making delete service call
                            productServiceAPI
                                .materialDelete({ productId: data.id })
                                .then(function(response) {
                                    productModel.setProductList(response);
                                    vm.list = productModel.getProductList();
                                    $rootScope.hasError = false;
                                    $rootScope.isSuccess = true;
                                    $rootScope.SUCCESS_MSG = vm.isManufacturer ? appConstants.PROD_DELETED : appConstants.MATERIAL_DELETED;
                                }, function(err) {
                                    $log.error(appConstants.FUNCTIONAL_ERR, err);
                                })
                                .catch(function(e) {
                                    $log.error(appConstants.FUNCTIONAL_ERR, e);
                                });
                        }
                    };

                };



                /************** Product Lineage functionality *********************/
                // isShipped value will be 'no'  for manufacturer
                $scope.serviceData = { data: { product: { isShipped: 'no', name: 'Handbag', mfgDate: '1/1/2016', receivedDate: '1/1/2016', items: [{ name: 'Leather', mfgDate: '3/1/2016', shipmentDate: '4/1/2016', receivedDate: '7/1/2016' }, { name: 'Buckel', mfgDate: '3/1/2016', shipmentDate: '4/1/2016', receivedDate: '7/1/2016' }] } } };
                $scope.lineageData = $scope.serviceData.data;
                $scope.lineageSubData = $scope.lineageData.product.items[0];
                $scope.lineageSubMaterialData = $scope.lineageData.product.items;

                vm.showProductLineage = function() {
                    /****************Retailer************************/
                    if ($scope.lineageData.product.isShipped == 'yes') {
                        $scope.isShipped = true;
                        $scope.isShippedToRetailer = true;

                        /****************Manufacturer************************/
                    } else if ($scope.lineageData.product.isShipped == 'no') {
                        $scope.isShipped = false;
                        $scope.isShippedToRetailer = false;
                    }
                    else {
                        $scope.isShipped = true;
                        $scope.isShippedToRetailer = false;
                    }
                    renderProductLineage(ngDialog, $scope, 'productLineageBox', '60%', true, 'ngdialog-theme-default lineage-box');
                };


                /******************* MATERIAL Multiselect functionality *************************/
                //For material list
                vm.settings = appConstants.MULTISELECT_SETTINGS;
                vm.materialList = [];
                if (vm.isManufacturer) {
                    vm.dataList = [{ id: 1, label: "Leather - Full Grain" }, { id: 2, label: "Leather - Top Grain" }];
                }

                /*************************************************************** */

            } catch (e) {
                console.log(appConstants.FUNCTIONAL_ERR, e);
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
 *  Utility function for rendering product lineage 
 ***/
function renderProductLineage(ngDialog, scope, templateID, width, showClose, className) {
    return ngDialog.open({
        scope: scope,
        width: width,
        template: templateID,
        showClose: showClose,
        className: className
    });
};