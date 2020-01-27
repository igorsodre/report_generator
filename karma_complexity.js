'use strict';
const fs = require('fs');

const calculateKarmaComplexity = function (FILE_PATH) {
    let karma_file = fs.readFileSync(FILE_PATH, 'utf8');

    let quantity_of_test_cases = karma_file.split('it(').length - 1;

    let quantity_of_var = karma_file.split('var ').length - 1;
    let quantity_of_let = karma_file.split('let ').length - 1;
    let quantity_of_const = karma_file.split('const ').length - 1;

    let groups_of_5_variables = Math.floor((quantity_of_var + quantity_of_let + quantity_of_const) / 5);

    let quantity_of_get = karma_file.split('.whenGET(').length - 1;
    let quantity_of_post = karma_file.split('.whenPOST(').length - 1;

    let quantity_of_requests = quantity_of_get + quantity_of_post;




    if (quantity_of_test_cases > 60 || groups_of_5_variables > 60 || quantity_of_requests > 60) {
        return 'ALTA';
    }
    else if ((quantity_of_test_cases > 30 || groups_of_5_variables > 30 || quantity_of_requests > 30) && (quantity_of_test_cases < 60 || groups_of_5_variables < 60 || quantity_of_requests < 60)) {
        return 'MÉDIA';
    }
    else {
        return 'BAIXA';
    }
};

// it receives a path to a karma Jasmine file and calculate the file's complexity
exports.default = calculateKarmaComplexity;


