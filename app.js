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
      "Add an Employee",
      "Add a new Role",
      "Add a new Department",
      "Update Employee Role",
      "Exit"
      /* "View all Employees by Department",
       "View all Employees by Manager",
       "Add Employee",
       "Remove Employee",
       "Update Employee Manager",*/
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
        updateRole();
        break;

      case "Exit":
        connection.end();
        break;

      /* case "View all Employees by Department":
         employeesByDept();
         break;

        case "Remove Employee":
         removeEmployee();
         break;
 
        case "View all Employees by Manager":
         employeesByManager();
         break;

        case "Update Employee Manager":
         updateManager();
         break;*/
    }
  });
}


//-------View all Employees------------------------------------------
function allEmployees() {
  console.log("Selecting all employees...\n");
  connection.query("SELECT employee.id,employee.first_name,employee.last_name, roles.title,roles.salary, roles.department_id FROM employee LEFT JOIN roles ON employee.role_id = roles.id", function (err, res) {
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
  ON roles.department_id = department.id`, function (err, res) {
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
      choices: [
        "Sales Lead",
        "Salesperson",
        "Accountant",
        "Software Engineer",
        "Lead Engineer",
        "Lawyer",
        "Legal Team Lead"
      ]
    }
  ]).then(function (answer) {
    switch (answer.role) {
      case "Sales Lead":
        answer.role = 1;
        break;
      case "Salesperson":
        answer.role = 2;
        break;
      case "Accountant":
        answer.role = 3;
        break;
      case "Software Engineer":
        answer.role = 4;
        break;
      case "Lead Engineer":
        answer.role = 5;
        break;
      case "Lawyer":
        answer.role = 6;
        break;
      case "Legal Team Lead":
        answer.role = 7;
        break;
    }
    connection.query(
      "INSERT INTO employee SET ?",
      {
        first_name: answer.first_name,
        last_name: answer.last_name,
        role_id: answer.role,
      },

      function (err, res) {
        if (err) throw err;
        console.log("Your Employee was created successfully!");
        console.table(res);
        // re-prompt the user for if they want to make another action
        start();
      }
    );
  });
};

//---------Add a Department----------------------------------------------
function addDepartment() {
  console.log("Adding a new Department...\n");
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
          console.log("Your new Department was created successfully!");
          console.table(res);
          start();
        });
    })
};

//------------Add a new Role-------------------------------------------------
function addRole() {
  console.log("Adding a new Role...\n");
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
          console.log("Your new Role was created successfully!");
          console.table(res);
          start();
        });
    })
};

//---------Update an Employee's role-------------------------------------
function updateRole() {
  console.log("Update an employees Role...\n");
  inquirer.prompt([
    {
      name: "employeeID",
      type: "input",
      message: "What is the id of the employee that needs a role update?",
    },
    {
      name: "newRole",
      type: "list",
      message: "What is the employee's new role?",
      choices: [
        "Sales Lead",
        "Salesperson",
        "Accountant",
        "Software Engineer",
        "Lead Engineer",
        "Lawyer",
        "Legal Team Lead"
      ]
    }
  ]).then(function (answer) {
    switch (answer.newRole) {
      case "Sales Lead":
        answer.newRole = 1;
        break;
      case "Salesperson":
        answer.newRole = 2;
        break;
      case "Accountant":
        answer.newRole = 3;
        break;
      case "Software Engineer":
        answer.newRole = 4;
        break;
      case "Lead Engineer":
        answer.newRole = 5;
        break;
      case "Lawyer":
        answer.newRole = 6;
        break;
      case "Legal Team Lead":
        answer.newRole = 7;
        break;
    }
    connection.query("UPDATE employee SET ? WHERE ?",
      [
        {
          role_id: answer.newRole
        },
        {
          id: answer.employeeID
        }
      ],
      function (err, res) {
        if (err) throw err;
        console.log(res.affectedRows + " employee was updated successfully!");
        console.table(res);
        start();
      });
  })
};



















//BONUS==============================================================
/*
//--------Remove an Employee-----------------------------------------
function removeEmployee(answer) {

}


//------View Employees by Department---------------------------------
function employeesByDept() {

};

//------View Employees by Manager------------------------------------
function employeesByManager() {

};

//--------Update Employee Role---------------------------------------
function updateRole() {

};

//---------Update Employee Manager-----------------------------------
function updateManager() {

};

*/