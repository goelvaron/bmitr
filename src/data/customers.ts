// This file stores the customer data for analytics purposes

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  companyName: string;
  state: string;
  district: string;
  kilnType: string;
  additionalInfo?: string;
  interestedInExclusiveServices: boolean;
  joinedDate: string;
  status: "active" | "pending" | "inactive";
}

// Initial empty array of customers
export const customers: Customer[] = [];

// Function to add a new customer to the database
export const addCustomer = (
  customerData: Omit<Customer, "id" | "joinedDate" | "status">,
) => {
  const newCustomer: Customer = {
    ...customerData,
    id: generateCustomerId(),
    joinedDate: new Date().toISOString(),
    status: "pending",
  };

  customers.push(newCustomer);
  saveCustomersToStorage();
  return newCustomer;
};

// Function to get all customers
export const getAllCustomers = (): Customer[] => {
  loadCustomersFromStorage();
  return [...customers];
};

// Function to get customers by state
export const getCustomersByState = (state: string): Customer[] => {
  return customers.filter((customer) => customer.state === state);
};

// Function to get customers by kiln type
export const getCustomersByKilnType = (kilnType: string): Customer[] => {
  return customers.filter((customer) => customer.kilnType === kilnType);
};

// Function to get customers interested in exclusive services
export const getCustomersInterestedInExclusiveServices = (): Customer[] => {
  return customers.filter((customer) => customer.interestedInExclusiveServices);
};

// Helper function to generate a unique ID
const generateCustomerId = (): string => {
  return (
    "cust_" +
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};

// Save customers to localStorage for persistence
const saveCustomersToStorage = (): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("bhattaMitra_customers", JSON.stringify(customers));
  }
};

// Load customers from localStorage
const loadCustomersFromStorage = (): void => {
  if (typeof window !== "undefined") {
    const storedCustomers = localStorage.getItem("bhattaMitra_customers");
    if (storedCustomers) {
      // Clear the current array and add all stored customers
      customers.length = 0;
      customers.push(...JSON.parse(storedCustomers));
    }
  }
};

// Analytics functions
export const getCustomerAnalytics = () => {
  loadCustomersFromStorage();

  return {
    totalCustomers: customers.length,
    byState: getCustomerCountByField("state"),
    byKilnType: getCustomerCountByField("kilnType"),
    interestedInExclusiveCount: customers.filter(
      (c) => c.interestedInExclusiveServices,
    ).length,
    joinedByMonth: getCustomersJoinedByMonth(),
  };
};

// Helper function to count customers by a specific field
const getCustomerCountByField = (field: keyof Customer) => {
  const counts: Record<string, number> = {};

  customers.forEach((customer) => {
    const value = customer[field] as string;
    counts[value] = (counts[value] || 0) + 1;
  });

  return counts;
};

// Helper function to get customers joined by month
const getCustomersJoinedByMonth = () => {
  const monthCounts: Record<string, number> = {};

  customers.forEach((customer) => {
    const date = new Date(customer.joinedDate);
    const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

    monthCounts[monthYear] = (monthCounts[monthYear] || 0) + 1;
  });

  return monthCounts;
};
