
var datalayer = require("companydata");
var Department = require("companydata").Department;
var Employee = require("companydata").Employee;
var Timecard = require("companydata").Timecard;

const moment = require('moment');

const businessLayer = require('./businessLayer');
const express = require("express");
app = express();
bodyParser = require("body-parser"); //for the form data in post request
//when false,create object is array or object only

urlEncodedParser = bodyParser.urlencoded({ extended: false });


jsonParser = bodyParser.json();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

var router = express.Router();

app.use('/CompanyServices', router);//base url

server = app.listen(8080, () => {

    const host = server.address().address,
        port = server.address().port;
    console.log("App listening at http://%s:%s", host, port);
});

/*
API to deleteCompany which Deletes all Department, Employee and Timecard
 records in the database for the given company.
*/
router.delete('/company', (req, res) => {

    if (req.query.company) {
        const depts = datalayer.getAllDepartment(req.query.company);
        if (depts.length == 0) {
            return res.json({ error: 'There was a problem in deleting company' });
        } else {
            const numRows = datalayer.deleteCompany(company);
            return res.json({ sucess: `companyName's information deleted` });
        }
    } else {
        return res.json({ error: 'There was a problem in deleting company' });
    }

});//end delete company block

/*
APT to returns the requested Department as a JSON String.
*/
router.get('/department', (req, res) => {

    const dept = datalayer.getDepartment(req.query.company, req.query.dept_id);
    if (dept !== null) {
        return res.json(dept);
    } else {
        return res.json({ error: `There was problem in getting department` });
    }

});

/*
API that returns the requested list of Departments
*/
router.get('/departments', (req, res) => {
    const depts = datalayer.getAllDepartment(req.query.company);
    if ((depts === undefined) || (depts.length == 0)) {
        return res.json({ error: `Dept_id doesn't exist` });
    } else {
        return res.json(depts);
    }
});

/*
API to add the new department in database and Returns the new
department which added as a JSON String
*/
router.post('/department', (req, res) => {

    var arr = [];
    if (!req.body.company) {
        return res.json({ error: `Company name can't be empty` });
    }
    if (!req.body.dept_name) {
        return res.json({ error: `dept_name can't be empty` });
    }
    if (!req.body.location) {
        return res.json({ error: `location can't be empty` });
    }
    if (!req.body.dept_no) {
        return res.json({ error: `dept_no can't be empty` });
    }

    const allDept = datalayer.getAllDepartment(req.body.company);
    const deptExist = false;
    allDept.forEach(function (depart) {

        if (depart.dept_no === req.body.dept_no) {
            arr.push(depart.dept_no);
            return res.json({ error: `dept_no ${depart.dept_no} already exist` });
        }
    })

    if (arr[0] !== req.body.dept_no) { //check for the dept_no
        const depts = datalayer.insertDepartment(req.body);
        if (depts != null || depts > 0) {
            return res.json({ success: depts });
        } else {
            return res.json({ error: `Problem in getting department` });
        }
    }

});//end insert department block


/*
API that updates the department and Returns the updated
Department as a JSON String. Input is passed as FormParams:
*/
router.put('/department', (req, res) => {
    var ar = [];

    const depts = datalayer.getAllDepartment(req.body.company);
    depts.forEach(function (depart) {
        if (depart.dept_no === req.body.dept_no) {
            ar.push(depart.dept_no);
            return res.json({ error: `dept_no already exist` });
        }

    })

    if (ar[0] !== req.body.dept_no || req.body.dept_no == undefined) {

        const dept = datalayer.getDepartment(req.body.company, req.body.dept_id);

        if (dept != null) { //check for dept_id
            if (req.body.company) {
                dept.setCompany(req.body.company);
            }
            if (req.body.dept_name) {
                dept.setDeptName(req.body.dept_name);
            }

            if (req.body.dept_no) {
                dept.setDeptNo(req.body.dept_no);
            }
            if (req.body.location) {
                dept.setLocation(req.body.location);
            }

            const updDept = datalayer.updateDepartment(dept);// update the department
            return res.json(updDept);
        } else {
            return res.json({ error: `Dept_id doesn't exist` });
        }
    }
});//end update dept block

/*
API that deletes the department record with the requested
dept_id and Returns the dept_id deleted.In case of error returns the
appropriate error message
*/
router.delete('/department', (req, res) => {
    const dept = datalayer.getDepartment(req.query.company, req.query.dept_id);

    if (!req.query.dept_id) { //empty check for dept_Id
        return res.json({ error: `Dept_id can't be empty` });
    }

    if (dept !== null) { // dept_Id exist

        const allEmpl = datalayer.getAllEmployee(req.query.company);

        if (!(allEmpl === undefined) || !(allEmpl.length == 0)) { //check Employee empty condition

            allEmpl.forEach(function (emp) { //for each loop employee

                if (emp.dept_id === parseInt(req.query.dept_id)) {  // check for valid dept_id

                    const timecards = datalayer.getAllTimecard(emp.emp_id); //list of timecard

                    if (!(timecards === undefined) || !(timecards.length == 0)) { // timecard empty condition
                        timecards.forEach(function (timecard) { //loop timecard
                            datalayer.deleteTimecard(timecard.timecard_id); //delete timecards
                        })
                    }
                    datalayer.deleteEmployee(emp.emp_id); //delte employee
                }
            })
        }
        const del = datalayer.deleteDepartment(req.query.company, req.query.dept_id);//delete dept
        return res.json({ success: `Dept_id ${req.query.dept_id} deleted from the company` });
    } else {
        return res.json({ error: `Dept_id doesn't exist` });
    }
});//end of delete department block

/*API to returns the requested Employee as a JSON String and
 return the error message if there's a problem in getting employee*/
router.get('/employee', (req, res) => {
    const emp = datalayer.getEmployee(req.query.emp_id);
    if (emp == null) {
        return res.json({ error: `There was problem in getting Employee` });
    } else {
        return res.json(emp);
    }
}); //end of get employee block

/*
API returns the requested list of Employees. and the
default value is sk7684. Test cases are handled with the appropriate error
 message
*/
router.get('/employees', (req, res) => {

    const emps = datalayer.getAllEmployee(req.query.company);
    if (emps.length == 0) {
        return res.json({ error: `There was problem in getting Employee` });
    } else {
        return res.json(emps);
    }
});//end of get employees block

/*
API that adds the new employee details in the database and returns
the new Employee as a JSON String. empl takes the the input in the JSON
String. All the given validations are handled with appropriate error message
*/
router.post('/employee', (req, res) => {
    var arra = [];
    var arrEmpNo = [];
    var isValidHireDate = businessLayer.isValidDate(req.body.hire_date);

    if (isValidHireDate == false || req.body.hire_date.length > 10) {
        return res.json({ error: `Invalid Hire_date format` });
    }
    const ddept = datalayer.getDepartment('sk7684', req.body.dept_id);
    const allAddEmp = datalayer.getAllEmployee('sk7684');

    allAddEmp.forEach(function (addEmpp) {

        if ((addEmpp.emp_id === req.body.mng_id)) {
            arra.push(addEmpp.emp_id);
        }
        if (addEmpp.emp_no == req.body.emp_no) {
            arrEmpNo.push(addEmpp.emp_no);
        }

    })

    if (ddept != null) { // validate for Dept_id
        if (arra[0] === req.body.mng_id || req.body.mng_id == 0) { // validate for Mng_id

            var formatDate1 = businessLayer.validCurrentDate();

            if (moment(req.body.hire_date).isBefore(formatDate1) || moment(req.body.hire_date).isSame(formatDate1)) {
                var day = businessLayer.getDayOfWeek(req.body.hire_date);
                // check for hire_day is not Saturday or Sunday
                if (day != 6 && day != 0) {
                    if (arrEmpNo[0] !== req.body.emp_no) {

                        const newEmployee = datalayer.insertEmployee(req.body);// Insert an Employee in database
                        if (newEmployee != null) {
                            return res.json({ success: newEmployee });
                        } else {
                            return res.json({ error: 'There was a problem in inserting employee' });
                        }
                    } else {
                        return res.json({ error: 'emp_no must be unique amongst all employees in the database' });
                    }
                } else {
                    return res.json({ error: `hire_date can't be Saturday or Sunday` });
                }
            } else {
                return res.json({ error: `Not a valid hire_date` });
            }
        } else {
            return res.json({ error: `Mng_id doesn't exist in employee` });
        }
    } else {
        return res.json({ error: `Dept_id doesn't exist` });
    }
}); //end of add employee block

/*
API that updates the employee details in database and return the
updated Employee as a JSON String.All the given validations are handles with
the appropriate error message
*/
router.put('/employee', (req, res) => {

    var arra = [];
    var arrEmpNo = [];
    // validate the hire_date
    if (req.body.hire_date) {
        var isValidHireDate = businessLayer.isValidDate(req.body.hire_date);

        if (isValidHireDate == false || req.body.hire_date.length > 10) {
            return res.json({ error: `Invalid Hire_date format` });
        }
    }

    const ddept = datalayer.getDepartment('sk7684', req.body.dept_id);
    const allAddEmp = datalayer.getAllEmployee('sk7684');
    allAddEmp.forEach(function (addEmpp) {

        if ((addEmpp.emp_id == req.body.mng_id)) {
            arra.push(addEmpp.emp_id);
        }

        if (addEmpp.emp_no == req.body.emp_no) {
            arrEmpNo.push(addEmpp.emp_no);
        }

    })

    if (ddept != null || req.body.dept_id == undefined) { // validate for Dept_id
        if (arra[0] == req.body.mng_id || req.body.mng_id == 0) { // validate for Mng_id

            var formatDate1 = businessLayer.validCurrentDate();

            if (moment(req.body.hire_date).isBefore(formatDate1) || moment(req.body.hire_date).isSame(formatDate1) || req.body.hire_date == undefined) {

                var day = businessLayer.getDayOfWeek(req.body.hire_date);
                // check for hire_day is not Saturday or Sunday
                if (day != 6 && day != 0) {
                    if (arrEmpNo[0] !== req.body.emp_no || req.body.emp_no == undefined) {
                        const updEmployee = datalayer.getEmployee(req.body.emp_id);
                        if (updEmployee != null) {  // check for emp_id
                            if (req.body.salary) {
                                updEmployee.setSalary(req.body.salary);
                            }
                            if (req.body.emp_name) {
                                updEmployee.setEmpName(req.body.emp_name);
                            }
                            if (req.body.hire_date) {
                                updEmployee.setHireDate(req.body.hire_date);
                            }
                            if (req.body.emp_no) {
                                updEmployee.setEmpNo(req.body.emp_no);
                            }
                            if (req.body.dept_id) {
                                updEmployee.setDeptId(req.body.dept_id);
                            }
                            if (req.body.job) {
                                updEmployee.setJob(req.body.job);
                            }

                            if (req.body.mng_id) {
                                updEmployee.setMngId(req.body.mng_id);
                            }
                            // update Employee in database
                            const updatedEmployee = datalayer.updateEmployee(updEmployee);
                            if (updatedEmployee != null) {
                                return res.json(updatedEmployee);
                            } else {
                                return res.json({ error: `There was problem in updating Employee` });
                            }

                        } else {
                            return res.json({ error: `Emp_Id doesn't exist in database` });
                        }
                    } else {
                        return res.json({ error: 'emp_no must be unique amongst all employees in the database' });
                    }
                } else {
                    return res.json({ error: `hire_date can't be Saturday or Sunday` });
                }
            } else {
                return res.json({ error: `Not a valid hire_date` });
            }
        } else {
            return res.json({ error: `Mng_id doesn't exist in employee` });
        }
    } else {
        return res.json({ error: `Dept_id doesn't exist` });
    }
}); //end of update an employee block

/*
API that delete the record in employee with requested emp_id and
return the emp_id deleted as a JSON string and also return error with the appropriate message
*/
router.delete('/employee', (req, res) => {
    const delEmpl = datalayer.getEmployee(req.query.emp_id);

    if (!req.query.emp_id) { //empty check for dept_Id
        return res.json({ error: `emp_id can't be empty` });
    }

    if (delEmpl !== null) { // emp_id exist
        const timecards = datalayer.getAllTimecard(delEmpl.emp_id); //list of timecard

        if (!(timecards === undefined) || !(timecards.length == 0)) { // timecard empty condition
            timecards.forEach(function (timecard) { //loop timecard
                datalayer.deleteTimecard(timecard.timecard_id); //delete timecards

            })
        }
        datalayer.deleteEmployee(delEmpl.emp_id); // Delete the given Employee
        return res.json({ success: `Employee ${req.query.emp_id} deleted` });
    } else {
        return res.json({ error: `emp_id doesn't exist` });
    }
});//delete employee block


/*
API that returns the requested Timecard as a JSON String. and
throws the exception in case of error
*/
router.get('/timecard', (req, res) => {

    const tc = datalayer.getTimecard(req.query.timecard_id);// Get the requested Timecard
    if (tc == null) {
        return res.json({ error: `There was problem in getting Employee` });
    } else {
        return res.json(tc);
    }
});//end of get timecard block

/*
API that returns the requested list of Timecards. emp_id is
passed as Input in QueryParam
*/
router.get('/timecards', (req, res) => {
    // Get all Timecards for a given Employee
    const allTimecard = datalayer.getAllTimecard(req.query.emp_id);

    if (allTimecard.length == 0 || allTimecard == null) {
        return res.json({ error: `There was problem in getting Timecard` });
    } else {
        return res.json(allTimecard);
    }
});//end of get timecards block

/*
API insert a Timecard and return the new Timecard as a JSON
String. TimeCard accepts the input as JSON string. All the input validations
are handled with the appropriate error messages.
*/
router.post('/timecard', (req, res) => {

    var arr_time = [];
    const empID = datalayer.getEmployee(req.body.emp_id);
    if (empID == null) {
        return res.json({ error: `Emp_Id doesn't exist` });
    }


    var isValidStartTime = businessLayer.isValidTimeStamp(req.body.start_time);
    var isValidEndTime = businessLayer.isValidTimeStamp(req.body.end_time);
    // validate start date and time
    if (isValidStartTime == false) {
        return res.json({ error: `Invalid start_time ${req.body.start_time} format` });
    }
    // validate end date and time
    if (isValidEndTime == false) {
        return res.json({ error: `Invalid end_time ${req.body.end_time} format` });
    }

    var startDate = businessLayer.getDateFormat(req.body.start_time);
    var endDate = businessLayer.getDateFormat(req.body.end_time);
    var currentDate = businessLayer.validCurrentDate();
    var dateFrom = businessLayer.getSevenDayBefore();// calculating one week before date
    var start_time_timeStamp = businessLayer.getValidTimeStamp(req.body.start_time);
    var end_time_timeStamp = businessLayer.getValidTimeStamp(req.body.end_time);
    var current_timeStamp = businessLayer.getCurrentTimeStamp();

    var startDay = businessLayer.getDayOfWeek(startDate);
    var endDay = businessLayer.getDayOfWeek(endDate);
    var startHour = businessLayer.getHMS(start_time_timeStamp, 'HH');
    var EndHour = businessLayer.getHMS(end_time_timeStamp, 'HH');
    var endMin = businessLayer.getHMS(end_time_timeStamp, 'mm');
    var endSec = businessLayer.getHMS(end_time_timeStamp, 'ss');
    var end_min = businessLayer.getHourMin(EndHour, endMin);
    var end_sec = businessLayer.getHourMin(EndHour, endSec);
    var diff = businessLayer.getDifference(start_time_timeStamp, end_time_timeStamp);

    if (empID.emp_id === req.body.emp_id) {  // check for emp_id

        if ((startDate === currentDate || moment(startDate).isAfter(dateFrom)) && start_time_timeStamp < current_timeStamp) {

            const allAddTim = datalayer.getAllTimecard(req.body.emp_id);
            allAddTim.forEach(function (addTim) {
                var timeStartDate = businessLayer.getDateFormat(addTim.start_time);

                if ((timeStartDate === startDate)) {
                    arr_time.push(timeStartDate);
                }
            })

            if ((diff >= 3.6e+6) && startDate === endDate) {

                if (startDay != 6 && startDay != 0 && endDay != 6 && endDay != 0) {

                    if (startHour >= 6 && EndHour <= 18 && end_min >= 0 && end_sec >= 0) {
                        // check the start_time for that employee
                        if (arr_time[0] !== startDate) {
                            const response = {
                                emp_id: req.body.emp_id,
                                start_time: start_time_timeStamp,
                                end_time: end_time_timeStamp
                            };
                            // Insert a Timecard in database
                            const addtimecard = datalayer.insertTimecard(response);
                            if (addtimecard != null) {
                                return res.json({ success: addtimecard });
                            } else {
                                return res.json({ error: 'There was problem in inserting timecard' });
                            }
                        } else {
                            return res.json({ error: 'start_time must not be on the same day as any other start_time for that employee' });
                        }
                    } else {
                        return res.json({ error: 'start_time and end_time must be between the 6AM to 6PM' });
                    }
                } else {
                    return res.json({ error: 'Start Day or End day cannot be Saturday or Sunday' });
                }
            } else {
                return res.json({ error: 'end_time must be at least 1 hour greater than the start_time and be on the same day as the start_time' });
            }
        } else {
            return res.json({ error: `start_time must be equal to the current date or up to 1 week ago from the current date.` });
        }
    }
});//end add timecard block

/*
API that updated the timecard details in the database and
returns the updated Timecard as a JSON String. Inputs is passed as as
FormParams.All the validations are handled with the appropriate error messages.
*/
router.put('/timecard', (req, res) => {

    const tc1 = datalayer.getTimecard(req.body.timecard_id);
    if (tc1 == null) {
        return res.json({ error: `Timecard_id doesn't exist` });
    }
    var arr_time = [];
    if (req.body.emp_id) {
        var empID = datalayer.getEmployee(req.body.emp_id);
    } else {
        var empID = datalayer.getEmployee(tc1.emp_id);
    }

    if (empID == null) {
        return res.json({ error: `Emp_Id doesn't exist` });
    }

    var isValidStartTime = businessLayer.isValidTimeStamp(req.body.start_time);
    var isValidEndTime = businessLayer.isValidTimeStamp(req.body.end_time);
    // validate start date and time
    if (req.body.start_time) {
        if (isValidStartTime == false) {
            return res.json({ error: `Invalid start_time format` });
        }
    }
    // validate end date and time
    if (req.body.end_time) {
        if (isValidEndTime == false) {
            return res.json({ error: `Invalid end_time format` });
        }
    }
    if (req.body.start_time) {
        var startDate = businessLayer.getDateFormat(req.body.start_time);
        var start_time_timeStamp = businessLayer.getValidTimeStamp(req.body.start_time);
    } else {
        var startDate = businessLayer.getDateFormat(tc1.start_time);
        var start_time_timeStamp = businessLayer.getValidTimeStamp(tc1.start_time);
    }

    if (req.body.end_time) {
        var endDate = businessLayer.getDateFormat(req.body.end_time);
        var end_time_timeStamp = businessLayer.getValidTimeStamp(req.body.end_time);
    } else {
        var endDate = businessLayer.getDateFormat(tc1.end_time);
        var end_time_timeStamp = businessLayer.getValidTimeStamp(tc1.end_time);
    }

    var currentDate = businessLayer.validCurrentDate();
    var dateFrom = businessLayer.getSevenDayBefore(); // calculating one week before date
    var current_timeStamp = businessLayer.getCurrentTimeStamp();
    var startDay = businessLayer.getDayOfWeek(startDate);
    var endDay = businessLayer.getDayOfWeek(endDate);
    var startHour = businessLayer.getHMS(start_time_timeStamp, 'HH');
    var EndHour = businessLayer.getHMS(end_time_timeStamp, 'HH');
    var endMin = businessLayer.getHMS(end_time_timeStamp, 'mm');
    var endSec = businessLayer.getHMS(end_time_timeStamp, 'ss');
    var end_min = businessLayer.getHourMin(EndHour, endMin);
    var end_sec = businessLayer.getHourMin(EndHour, endSec);
    var diff = businessLayer.getDifference(start_time_timeStamp, end_time_timeStamp);

    if (empID.emp_id == req.body.emp_id || req.body.emp_id == undefined) { // emp_id exist in database

        if ((startDate === currentDate || moment(startDate).isAfter(dateFrom)) && start_time_timeStamp < current_timeStamp) {

            const allAddTim = datalayer.getAllTimecard(empID.emp_id);

            allAddTim.forEach(function (addTim) {

                var timeStartDate = businessLayer.getDateFormat(addTim.start_time);

                if ((timeStartDate === startDate)) {
                    arr_time.push(timeStartDate);
                }
            })

            if ((diff >= 3.6e+6) && startDate === endDate) {

                if (startDay != 6 && startDay != 0 && endDay != 6 && endDay != 0) {

                    if (startHour >= 6 && EndHour <= 18 && end_min >= 0 && end_sec >= 0) {
                        const tc = datalayer.getTimecard(req.body.timecard_id);
                        if (req.body.start_time) {
                            tc.setStartTime(start_time_timeStamp);
                        }
                        if (req.body.end_time) {
                            tc.setEndTime(end_time_timeStamp);
                        }
                        if (req.body.emp_id) {
                            tc.setEmpId(req.body.emp_id);
                        }
                        const updatedTimecard = datalayer.updateTimecard(tc);
                        if (updatedTimecard != null) {
                            return res.json(updatedTimecard);
                        } else {
                            return res.json({ error: `There was problem in updating timecard` });
                        }

                    } else {
                        return res.json({ error: 'start_time and end_time must be between the 6AM to 6PM' });
                    }
                } else {
                    return res.json({ error: 'Start Day or End day cannot be Saturday or Sunday' });
                }
            } else {
                return res.json({ error: 'end_time must be at least 1 hour greater than the start_time and be on the same day as the start_time' });
            }
        } else {
            return res.json({ error: `start_time must be equal to the current date or up to 1 week ago from the current date.` });
        }
    }
});//end update timecard block

/*
APT delete the given Timecard from the database and return
the timecard_id deleted. Throws exceptions in case of any error with the
appropriate error message
*/
router.delete('/timecard', (req, res) => {

    const delTimecard = datalayer.getTimecard(req.query.timecard_id);
    if (delTimecard == null) {
        return res.json({ error: `There was problem in deleting Timecard` });
    } else {
        datalayer.deleteTimecard(req.query.timecard_id); // Delete the given Timecard

        return res.json({ success: `Timecard with timecard_id: ${req.query.timecard_id} deleted from the company` });
    }
});//end delete Timecard block