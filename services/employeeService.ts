// services/employeeService.ts
import { api } from "./api";

export interface Employee {
  id: string;
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
      .map((emp: any) => ({
        id: emp.user_id || emp.id || emp._id || "",
        name: emp.name || emp.fullName || "Unknown Employee",
      }))
      .filter((emp) => emp.id);
  } catch {
    return [];
  }
}
