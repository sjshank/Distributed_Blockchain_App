/*
**  procure Controller for handling user based 
**  product/material acknowledgement business logic 
*/

"use strict";

angular.module('materialModule')

    //For acknowledging received product
    .controller('procureMaterialController', ['userModel', 'appConstants', '$state', '$rootScope',
        'procureMaterialService', '$log', 'materialList', 'ngDialog', '$scope',
        function (userModel, appConstants, $state, $rootScope,
            procureMaterialService, $log, materialList, ngDialog, $scope) {
            try {
                var vm = this;
                vm.user = userModel.getUser();
                setUserProfile(vm, userModel);
                vm.list = [];
                $scope.ifRow = {};
				$scope.parentSelectedRows =[];

                /****************** MATERIAL List to procure */
                //Populating list of Material on load based on materialList resolve
                materialList
                    .$promise
                    .then(function (response) {
                        vm.list = response;
                    }, function (err) {
                        $log.error(appConstants.FUNCTIONAL_ERR, err);
                    })
                    .catch(function (e) {
                        $log.error(appConstants.FUNCTIONAL_ERR, e);
                    });

                $scope.entity = 'materials';
                $scope.redirectUser = function (flag) {
                    if (!flag) {
                        ngDialog.close();
                        return;
                    }
                    if (flag && vm.isManufacturer) {
                        $state.go('productReg');
                    }
                };

                /******************* PROCURE List of product/material *************************/
                /*    TO-DO need to test with actual data and implementation */

                vm.procure = function (dataList) {

                    if($scope.ifRow.listOfSelectedRows.length <= 0){
                        $rootScope.hasError = true;
                        $rootScope.ERROR_MSG = "Please select atleast one record.";
                        return;
                    }
                    $rootScope.hasError = false;

                    procureMaterialService
                        .procureMaterial({}) // for demo instance
                        //.procureMaterial(dataList)
                        .then(function (response) {
                            if (response)
                                renderLineage(ngDialog, $scope, 'confirmationBox', '35%', false, 'ngdialog-theme-default confirmation-box');
                        }, function (err) {
                            $log.error(appConstants.FUNCTIONAL_ERR, err);
                        })
                        .catch(function (e) {
                            $log.error(appConstants.FUNCTIONAL_ERR, e);
                        });
                };

                vm.showLineage = function (data) {
                    procureMaterialService
                        .getAckLineageData(data)
                        .then(function (response) {
                            $scope.lineageData = response.data;
                            $scope.lineageSubData = $scope.lineageData.product.items[0];
                            $scope.lineageSubMaterialData = $scope.lineageData.product.items;
                            $scope.ifNegativeUsecase = false;
                            $scope.isShipped = true;
                            $scope.isShippedToRetailer = false;
                            renderProductLineage(ngDialog, $scope, 'productLineageBox', '82%', true, 'ngdialog-theme-default lineage-box');
                        }, function (err) {
                            $log.error(appConstants.FUNCTIONAL_ERR, err);
                        })
                        .catch(function (e) {
                            $log.error(appConstants.FUNCTIONAL_ERR, e);
                        });
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