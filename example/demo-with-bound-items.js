(function() {
    "use strict";

    angular.module("uiMultiselectApp", ["ui.multiselect"]);

    angular
        .module("uiMultiselectApp")
        .controller("MultiselectCtrl", ["$scope",
            function($scope) {
                var vm = this;

                vm.items = [
                    { id: 1, display: "Option 1" },
                    { id: 2, display: "Option 2" },
                    { id: 3, display: "Option 3" },
                    { id: 4, display: "Option 4" },
                    { id: 5, display: "Option 5" },
                    { id: 6, display: "Option 6" },
                    { id: 7, display: "Option 7" },
                    { id: 8, display: "Option 8" },
                    { id: 9, display: "Option 9" },
                    { id: 10, display: "Option 10" },
                    { id: 11, display: "Option 11" },
                    { id: 12, display: "Option 12" },
                    { id: 13, display: "Option 13" },
                    { id: 14, display: "Option 14" },
                    { id: 15, display: "Option 15" }
                ];

                vm.options = {
                    idProp: "id",
                    displayProp: "display",
                    bindId: true,
                    showSearch: true,
                    showSelectAll: true,
                    showUnselectAll : true,
                    toggleClass: "btn btn-default dropdown-toggle multiselect-toggle",
                    dropdownClass: "dropdown-menu multiselect-dropdown"
                };

                vm.selectedItems = 3;
            }]);
})();