/**
 * Fetching Data from Local JSON Files
 * 
 * In this project, we use local JSON files to simulate API responses during development. 
 * These files are stored in the `/api/data` directory and its subdirectories.
 * 
 * Directory Structure:
 * 
 * /your-project
 *   /api/data
 *     customers.json
 *     employees.json
 *     orders.json
 *     ordersHistory.json
 *     sessions.json
 *     tables.json
 *     /Menu
 *       foodItems.json
 *       drinksItems.json
 *       dessertItems.json
 * 
 * How to Fetch Data:
 * 
 * Use the `fetch` API to get data from these local JSON files. Below is a simple example
 * demonstrating how to fetch data from `foodItems.json`.
 * 
 * Example: Fetching Food Items
 */

// Define a function to fetch data from the local JSON file
async function fetchFoodItems() {
  try {
    // Fetch the data from the local JSON file
    const response = await fetch('/api/data/Menu/foodItems.json');
    
    // Check if the response is OK (status code 200)
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // Parse the JSON data
    const data = await response.json();
    
    // Return the fetched data
    return data;
  } catch (error) {
    // Log errors, such as network issues or file not found
    console.error('Error fetching data:', error);
  }
}

// Call the function and use the data as needed
fetchFoodItems().then(foodItems => {
  console.log('Fetched Food Items:', foodItems);
  // You can now use the foodItems data in your application
});
