// DATA CONTROLLER

var budgetController = (function(){

   var Expense = function(id, description, value){
       this.id = id;
       this.description = description;
       this.value = value;
       this.percentage = -1;
   };

   Expense.prototype.calcPercentage = function (totalIncome) {
       if(totalIncome > 0){
           this.percentage = Math.round((this.value / totalIncome) * 100);
       } else {
           this.percentage = -1;
       }
   };

   Expense.prototype.getPercentage = function () {
       return this.percentage;
   };

   var Income = function(id, description, value){
    this.id = id;
    this.description = description;
    this.value = value;
   };

   var calculateTotal = function(type){
    var sum = 0;
    data.allItems[type].forEach(function(cur){
        sum += cur.value;
    });
    data.totals[type] = sum;
   };

   var data = {
    allItems: {
        exp: [],
        inc: []
    },
    totals: {
        exp: 0,
        inc: 0
    },
    budget: 0,
    percentage: -1
   };

   return {
       addItem: function(type, des, val){
            var newItem;
            var ID;
            //CREATE NEW ID
           if (data.allItems[type].length > 0){
               ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
           } else {
               ID = 0;
           }

            //CREATE NEW ITEM
            if (type === 'exp'){
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc'){
                newItem = new Income(ID, des, val);
            }

            //PUSH TO DATA STRUCTURE
            data.allItems[type].push(newItem);

            //RETURN DATA
            return newItem;
       },

       deleteItem: function(type, id){
            var ids;
            var index;
            ids = data.allItems[type].map(function(curr){
                return curr.id;
            });
            index = ids.indexOf(id);

            if(index !== -1){
                data.allItems[type].splice(index, 1);
            };
       },

       calculateBudget: function(){
            // CALC INC AND EXP
            calculateTotal('exp');
            calculateTotal('inc');
            // CALC BUDGET 
            data.budget = data.totals.inc - data.totals.exp;
            // CALC PERCENTAGE 
            if(data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            };
       },

       calculatePercentages: function(){
            data.allItems.exp.forEach(function (cur) {
               cur.calcPercentage(data.totals.inc);
            });
       },

       getPercentages: function(){
           var allPerc = data.allItems.exp.map(function (cur) {
              return cur.getPercentage();
           });
           return allPerc;
       },

       getBudget: function(){
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
       },

       testing: function() {
           console.log(data);
       }
   }
 })();

 // UI CONTROLLER 

 var UIController = (function(){

    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputButton: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    var formatNumber = function(num, type){

         var numSplit;
         var int;

         num = Math.abs(num);
         num = num.toFixed(2);
         numSplit = num.split('.');
         int = numSplit[0];
         if(int.length > 3){
             int = int.substr(0,int.length - 3) + ',' + int.substr(int.length -3, int.length);
         }
         dec = numSplit[1];

         return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
     };

     var nodeListForEach = function(list, callback){
         for(var i = 0; i < list.length; i++){
             callback(list[i], i);
         }
     };

    return {

        getInput: function(){

            return {
                 type: document.querySelector(DOMstrings.inputType).value,
                 description: document.querySelector(DOMstrings.inputDescription).value,
                 value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };

        },

        addListItem: function(obj, type){

            // CREATE HTML WITH PLACEHOLDER
            var html;
            var newHTML;
            var element;

            if(type === 'inc'){
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            } else if (type === 'exp'){
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }

            // REPLACE PLACEHOLDER WITH DATA
            newHTML = html.replace('%id%', obj.id);
            newHTML = newHTML.replace('%description%', obj.description);
            newHTML = newHTML.replace('%value%', formatNumber(obj.value, type));

            // INSERT HTML INTO THE DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);
        },

        deleteListItem: function(selectorID){
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        clearFields: function(){
            var fields;
            var fieldsArr;

            fields = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue);
            fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(function(current, index, array) {
                current.value = "";
            });
            fieldsArr[0].focus();
        },

        displayBudget: function(obj) {
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
            
            if(obj.percentage > 0){
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '----';
            };
        },

        displayPercentages: function(percentages){
            console.log('go');
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

            nodeListForEach(fields, function(current, index) {
                if(percentages[index] > 0){
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
        },

        displayMonth: function(){
          var now = new Date();
          var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
          var month = now.getMonth();
          var year = now.getFullYear();
          document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
        },

        changedType: function(){
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue
            );
            nodeListForEach(fields, function (current) {
                current.classList.toggle('red-focus');
            });
            document.querySelector(DOMstrings.inputButton).classList.toggle('red');
        },

        getDOMstrings: function(){
            return DOMstrings;
        }
    };

 })();

 // APP CONTROLLER

 var controller = (function(budgetCtrl, UICtrl){

    var setupEventListeners = function(){

        var DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(e){
            if (e.key === "Enter"){
                ctrlAddItem();
            }
        });
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };
    
    var updateBudget = function(){
        // CALC BUDGET
        budgetCtrl.calculateBudget();
        // RETURN BUDGET
        var budget = budgetCtrl.getBudget();
        // DISPLAY BUDGET
        UICtrl.displayBudget(budget);
    };

    var updatePercentages = function(){
        // CALC PERCENTAGES
        budgetCtrl.calculatePercentages();
        // READ DATA
        var percentages = budgetCtrl.getPercentages();
        // UPDATE UI
        UICtrl.displayPercentages(percentages);
    };

    var ctrlAddItem = function(){
        var input;
        var newItem;
        // GET DATA
        input = UICtrl.getInput();

        if(input.description != "" && !isNaN(input.value) && input.value > 0){
            // ADD ITEM TO BUDGET CONTROLLER
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            // ADD ITEM TO UI
            UICtrl.addListItem(newItem, input.type);
            // CLEAR THE FIELDS
            UICtrl.clearFields();
            // CALCULATE BUDGET
            updateBudget();
            // CALCULATE PERCENTAGES
            updatePercentages()
        };
    };

    var ctrlDeleteItem = function(e){
        var itemID;
        var splitID;
        var type;
        var ID;
        itemID = e.target.parentNode.parentNode.parentNode.id;
        if(itemID){
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // DELETE FROM DATA
            budgetCtrl.deleteItem(type, ID);
            // DELETE FROM UI
            UICtrl.deleteListItem(itemID);
            // UPDATE AND SHOW NEW BUDGET
            updateBudget();
            // CALCULATE PERCENTAGES
            updatePercentages();
        }
    };

    return {
        init: function(){
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    }

 })(budgetController, UIController);

 controller.init();