//-----Dependencies-------------------------------------------
var password = require("./password");
var mysql = require("mysql");
var inquirer = require("inquirer");


//---Create the connection information for the sql database---
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: password,
  database: "employee_trackerDB"
});

//---Connect to the mysql server and sql database--------------
connection.connect(function (err) {
  if (err) throw err;
  // run the start function after the connection is made to prompt the user
  start();
});


//--Start function prompts the user for what action they would like to take
function start() {
  inquirer.prompt({
    name: "action",
    type: "list",
    message: "What would you like to do?",
    choices: [
      "View all Employees",
      "View all Roles",
      "View all Departments",
      "View all Employees by Manager",
      "View all Employees by Department",
      "View Totalized Department Budget",
      "Add an Employee",
      "Add a new Role",
      "Add a new Department",
      // "Update Employee Role",
      // "Update Employee Manager",
      "Remove an Employee",
      "Remove a Role",
      "Remove a Department",
      "Exit"
    ]
  }).then(function (answer) {
    switch (answer.action) {
      case "View all Employees":
        allEmployees();
        break;

      case "View all Roles":
        allRoles();
        break;

      case "View all Departments":
        allDepartments();
        break;

      case "Add an Employee":
        addEmployee();
        break;

      case "Add a new Role":
        addRole();
        break;

      case "Add a new Department":
        addDepartment();
        break;

      case "Update Employee Role":
        updateEmployeeRole();
        break;

      case "Update Employee Manager":
        updateManager();
        break;

      case "Remove an Employee":
        removeEmployee();
        break;

      case "Remove a Role":
        removeRole();
        break;

      case "Remove a Department":
        removeDepartment();
        break;

      case "View all Employees by Manager":
        employeesByManager();
        break;

      case "View all Employees by Department":
        employeesByDept();
        break;

      case "View Totalized Department Budget":
        totDeptBudget();
        break;

      case "Exit":
        connection.end();
        break;
    }
  });
}


//-------View all Employees------------------------------------------
function allEmployees() {
  console.log("Selecting all employees...\n");
  connection.query(`SELECT employee.id,employee.first_name,employee.last_name,employee.manager_id, roles.title,roles.salary, roles.department_id 
                    FROM employee 
                    LEFT JOIN roles 
                    ON employee.role_id = roles.id`,
    function (err, res) {
      if (err) throw err;
      // Log all results of the SELECT statement
      console.table(res);
      start();
    });
};


//--------View all Roles---------------------------------------------
function allRoles() {
  console.log("Selecting all roles...\n");
  connection.query(`SELECT roles.id,roles.title,roles.department_id, department.id, department.dept_name
                    FROM roles
                    LEFT JOIN department
                    ON roles.department_id = department.id`,
    function (err, res) {
      if (err) throw err;
      // Log all results of the SELECT statement
      console.table(res);
      start();
    });
};


//---------View all Departments--------------------------------------
function allDepartments() {
  console.log("Selecting all departments...\n");
  connection.query("SELECT * FROM department", function (err, res) {
    if (err) throw err;
    // Log all results of the SELECT statement
    console.table(res);
    start();
  });
};


//---------Add an Employee---------------------------------------------
function addEmployee() {
  console.log("Adding a new employee...\n");
  var roles = [];
  connection.query(`SELECT roles.title, roles.id FROM roles`,
    function (err, res) {
      if (err) throw err;
      for (var i = 0; i < res.length; i++) {
        roles.push(res[i].title);
      }
      inquirer.prompt([
        {
          name: "first_name",
          type: "input",
          message: "What is the employee's first name?"
        },
        {
          name: "last_name",
          type: "input",
          message: "What is the employee's last name?"
        },
        {
          name: "role",
          type: "list",
          message: "What is the employee's role?",
          choices: roles
        },
        {
          name: "manager_id",
          type: "input",
          message: "What is the id of the employee manager?"
        },
      ]).then(function (answer) {
        var matchRole = res.find(function (currentRole) {
          if (answer.role == currentRole.title) {
            return currentRole;
          }
        });
        connection.query(
          "INSERT INTO employee SET ?",
          {
            first_name: answer.first_name,
            last_name: answer.last_name,
            role_id: matchRole.id,
            manager_id: answer.manager_id
          },
          function (err, res) {
            if (err) throw err;
            console.log("Your Employee was created successfully!");
            // re-prompt the user for if they want to make another action
            start();
          }
        );
      });
    })
};


//---------Add a Department----------------------------------------------
function addDepartment() {
  console.log("Adding a new Department...\n");
  var departments = [];
  inquirer
    .prompt([
      {
        name: "dept_name",
        type: "input",
        message: "What is the new Department you would like to add?"
      }
    ]).then(function (answer) {
      connection.query("INSERT INTO department SET ?",
        {
          dept_name: answer.dept_name,
        },
        function (err, res) {
          if (err) throw err;
          departments.push(answer.dept_name);
          console.log("Your new Department was created successfully!");
          start();
        });
    })
};


//------------Add a new Role-------------------------------------------------
function addRole() {
  console.log("Adding a new Role...\n");
  var roles = [];
  inquirer
    .prompt([
      {
        name: "title",
        type: "input",
        message: "What is the new role that you would like to create?"
      },
      {
        name: "salary",
        type: "input",
        message: "What is salary of this role?"
      },
      {
        name: "department",
        type: "input",
        message: "What is the department id of this role belong to?"
      }
    ]).then(function (answer) {
      connection.query("INSERT INTO roles SET ?",
        {
          title: answer.title,
          salary: answer.salary,
          department_id: answer.department
        },
        function (err, res) {
          if (err) throw err;
          roles.push(answer.title);
          console.log("Your new Role was created successfully!");
          start();
        });
    })
};


//--------Remove an Employee-----------------------------------------
function removeEmployee() {
  console.log("Remove an employee...\n");
  var employees = [];
  connection.query(`SELECT employee.first_name, employee.id FROM employee`,
    function (err, res) {
      if (err) throw err;
      for (var i = 0; i < res.length; i++) {
        employees.push(res[i].first_name);
      }
      inquirer.prompt([
        {
          name: "employee",
          type: "list",
          message: "Which employee needs to be removed?",
          choices: employees
        }
      ]).then(function (answer) {
        var matchEmployee = res.find(function (selectedEmployee) {
          if (answer.employee == selectedEmployee.first_name) {
            return selectedEmployee;
          }
        });
        connection.query("DELETE FROM employee WHERE id = ?", matchEmployee.id, function (err, res) {
          if (err) throw err;
          // Log all results of the SELECT statement
          start();
        });
      })
    })
}


//------View Employees by Manager------------------------------------
function employeesByManager() {
  console.log("Selecting all employees by Manager...\n");
  inquirer.prompt([
    {
      name: "managerID",
      type: "input",
      message: "What is the id of the employee manager?",
    }
  ]).then(function (answer) {
    connection.query(`SELECT employee.id,employee.first_name,employee.last_name,employee.manager_id, roles.title,roles.salary, roles.department_id 
                    FROM employee 
                    LEFT JOIN roles 
                    ON employee.role_id = roles.id
                    WHERE employee.manager_id = ?
                    `, [answer.managerID],

      function (err, res) {
        if (err) throw err;
        // Log all results of the SELECT statement
        console.table(res);
        start();
      });
  });
};


//------View Employees by Department---------------------------------
function employeesByDept() {
  console.log("Selecting all employees by Department...\n");
  var departments = [];
  connection.query(`SELECT department.dept_name, department.id FROM department`,
    function (err, res) {
      if (err) throw err;
      for (var i = 0; i < res.length; i++) {
        departments.push(res[i].dept_name);
      }
      inquirer.prompt([
        {
          name: "dept_ID",
          type: "list",
          message: "What is the department you would like to search?",
          choices: departments
        }
      ]).then(function (answer) {
        var matchId = res.find(function (selectedDept) {
          if (answer.dept_ID == selectedDept.dept_name) {
            return selectedDept;
          }
        })
        connection.query(`SELECT employee.id,employee.first_name,employee.last_name,employee.manager_id, roles.title,roles.salary, roles.department_id
                    FROM employee 
                    LEFT JOIN roles 
                    ON employee.role_id = roles.id
                    WHERE roles.department_id = ?
                    `, matchId.id,
          function (err, res) {
            if (err) throw err;
            // Log all results of the SELECT statement
            console.table(res);
            start();
          });
      })
    });
}


//--------------Totalized Department Budget--------------------------
function totDeptBudget() {
  console.log("Selecting totalized department budget...\n");
  inquirer.prompt([
    {
      name: "dept_ID",
      type: "input",
      message: "What is the department id?",
    }
  ]).then(function (answer) {
    connection.query(`SELECT SUM(roles.salary),roles.title FROM employee AS E
                    JOIN roles ON E.role_id = roles.id
                    JOIN department AS D ON roles.department_id = D.id
                    WHERE D.id = ?
                    GROUP BY roles.title`, answer.dept_ID,
      function (err, res) {
        if (err) throw err;
        console.table(res);
        start();
      });
  });
}


//--------Remove a Role-----------------------------------------
function removeRole() {
  console.log("Remove a role...\n");
  var roles = [];
  connection.query(`SELECT roles.title, roles.id FROM roles`,
    function (err, res) {
      if (err) throw err;
      for (var i = 0; i < res.length; i++) {
        roles.push(res[i].title);
      }
      inquirer.prompt([
        {
          name: "role",
          type: "list",
          message: "What is the role that needs to be removed?",
          choices: roles
        }
      ]).then(function (answer) {
        var matchId = res.find(function (currentRole) {
          if (answer.role == currentRole.title) {
            return currentRole;
          }
        });
        connection.query("DELETE FROM roles WHERE id = ?", matchId.id, function (err, res) {
          if (err) throw err;
          // Log all results of the SELECT statement
          start();
        });
      })
    });
}


//-----------Remove a Department-------------------------------------
function removeDepartment() {
  console.log("Remove a department...\n");
  var departments = [];
  connection.query(`SELECT dept_name, department.id FROM department`,
    function (err, res) {
      if (err) throw err;
      for (var i = 0; i < res.length; i++) {
        departments.push(res[i].dept_name);
      }
      inquirer.prompt([
        {
          name: "department",
          type: "list",
          message: "Which department would you like to remove?",
          choices: departments
        }
      ]).then(function (answer) {
        var matchDepartment = res.find(function (selectedDepartment) {
          if (answer.department == selectedDepartment.dept_name) {
            return selectedDepartment;
          }
        });
        connection.query("DELETE FROM department WHERE id = ?", matchDepartment.id, function (err, res) {
          if (err) throw err;
          // Log all results of the SELECT statement
          start();
        });
      })
    });
};








/*====================================================WORK IN PROGRESS=====================================

/*
//---------Update Employee Manager-----------------------------------
  function updateManager() {

  };


  //---------Update an Employee's role-------------------------------------
function updateEmployeeRole() {
  console.log("Updating an employees Role...\n");
  var roles = [];
  connection.query(`SELECT roles.title, roles.id FROM roles`,
    function (err, res) {
      if (err) throw err;
      for (var i = 0; i < res.length; i++) {
        roles.push(res[i].title);
      };
      var employees = [];
  connection.query(`SELECT employee.first_name, employee.id FROM employee`,
        function (err, res) {
          if (err) throw err;
          for (var i = 0; i < res.length; i++) {
            employees.push(res[i].first_name);
          }
      inquirer.prompt([
        {
          name: "employee",
          type: "list",
          message: "Which employee needs a role update?",
          choices: employees
        },
        {
          name: "newRole",
          type: "list",
          message: "What is the employee's new role?",
          choices: roles
        }
      ]).then(function (answer) {
        var matchId = res.find(function (currentRole) {
          if (answer.newRole == currentRole.title) {
            return currentRole;
          }
        });
        var matchEmployee = res.find(function (selectedEmployee) {
          if (answer.employee == selectedEmployee.first_name) {
            return selectedEmployee;
          }
        })
        connection.query("UPDATE employee SET ? WHERE ?",
          [
            {
              role_id: matchId.id
            },
            {
              first_name: matchEmployee.id
            }
          ],
          function (err, res) {
            if (err) throw err;
            console.log(res.affectedRows + " employee was updated successfully!");
            start();
          });
      })
    })
});
}

*/