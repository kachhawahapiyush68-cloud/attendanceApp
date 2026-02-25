// services/employeeService.ts
import { api } from "./api";

export interface Employee {
  id: number;      // DB primary key
  code: string;    // login/user_id/userid string
  name: string;
}

interface EmployeeResponse {
  success?: boolean;
  employees?: any[];
}

export async function fetchEmployees(): Promise<Employee[]> {
  try {
    const res = await api.get<EmployeeResponse | any[]>("/employees");

    let employeesArray: any[] = [];

    if (Array.isArray(res.data)) {
      employeesArray = res.data;
    } else if (
      res.data &&
      res.data.success &&
      Array.isArray(res.data.employees)
    ) {
      employeesArray = res.data.employees;
    } else {
      return [];
    }

    return employeesArray
      .map((emp: any): Employee => ({
        id: Number(emp.id ?? emp._id ?? 0),
        // this is the real user code used for login / notifications
        code: String(emp.user_id ?? emp.userid ?? emp.code ?? ""),
        name: String(emp.name ?? emp.fullName ?? "Unknown Employee"),
      }))
      .filter((emp) => !!emp.code);
  } catch {
    return [];
  }
}
