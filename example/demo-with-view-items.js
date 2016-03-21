(function() {
    "use strict";

    angular.module("uiMultiselectApp", ["ui.multiselect"]);

    angular
        .module("uiMultiselectApp")
        .controller("MultiselectCtrl", ["$scope",
            function($scope) {
                var vm = this;

                vm.options = {
                    idProp: "id",
                    displayProp: "display",
                    bindId: true,
                    showSearch: true,
                    showSelectAll: true,
                    showUnselectAll : true,
                    toggleClass: "btn btn-default dropdown-toggle multiselect-toggle",
                    dropdownClass: "dropdown-menu multiselect-dropdown",
                    formElement: "formElement"
                };
            }]);
})();