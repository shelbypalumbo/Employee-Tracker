USE employee_trackerDB;


INSERT INTO employee(first_name,last_name, role_id)
VALUES('John', 'Doe', 1),
('Sally', 'Bob', 3),
('Loui', 'Gabino', 4);

INSERT INTO department(dept_name)
VALUES('Sales'),('Engineering'),('Finance'),('Legal');


INSERT INTO roles(title,salary,department_id)
VALUES('Sales_Lead', 90000,1),
('Salesperson', 120000,1),
('Accountant', 500000,3),
('Software_Engineer', 180000,2),
('Lead_Engineer', 600000,2),
('Lawyer', 200000,4),
('Legal_Team_Lead', 400000,4);


SELECT employee.first_name,employee.last_name,employee.role_id,roles.id, roles.title,roles.salary,roles.department_id
FROM employee 
LEFT JOIN roles 
ON employee.role_id = roles.id;


SELECT roles.id,roles.title,roles.department_id, department.id, department.dept_name
FROM roles
LEFT JOIN department
ON roles.department_id = department.id;

SELECT * FROM employee;

SELECT * FROM roles;

SELECT * FROM department;


