// services/employeeService.ts
import api from "./api";

export interface Employee {
  id: number;
  user_id: string;
  name: string | null;
  email: string | null;
  mobile_no: string | null;
  address: string | null;
  role: "admin" | "employee";
  status: 0 | 1;
  salary_type: "hourly" | "fixed";
  fixed_monthly_salary: string | null;
  hourlyRate: string;
  overtimeHourlyRate: string;
}

export async function fetchEmployees(): Promise<Employee[]> {
  const res = await api.get("/employees");
  const raw = Array.isArray(res.data?.employees)
    ? res.data.employees
    : Array.isArray(res.data)
    ? res.data
    : [];
  return raw as Employee[];
}

export async function getEmployeeById(id: number): Promise<Employee> {
  const res = await api.get(`/employees/${id}`);
  return res.data.employee as Employee;
}

export async function updateEmployee(
  id: number,
  payload: Partial<Employee>
): Promise<Employee> {
  const res = await api.patch(`/users/${id}`, payload);
  return res.data.user as Employee;
}
