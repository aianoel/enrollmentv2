// Sample data now managed via PostgreSQL database
// Firebase has been replaced with PostgreSQL

export const initializeSampleData = async () => {
  console.log("Sample data is now managed via PostgreSQL database");
  console.log("Admin users and content have been pre-loaded during database setup");
  return Promise.resolve();
};

export const resetSampleData = () => {
  console.log("Data reset functionality moved to PostgreSQL database management");
  return Promise.resolve();
};