import React, { useState, useEffect, useRef } from 'react';
import { fetchData, getDataBase } from './data/data.js';
import Chart from 'chart.js/auto';
import { CategoryScale } from 'chart.js';
import bootstrap from '../node_modules/bootstrap/dist/css/bootstrap.min.css'
import Navbar from '../src/components/Navbar.js'
Chart.register(CategoryScale);

 function App() {
   const [customers, setCustomers] = useState([]);
   const [transactions, setTransactions] = useState([]);
   const [transactionsId, setTransactionsId] = useState([]);
   const [transactionsAmount, setTransactionsAmount] = useState([]);
   const [filteredTransactions, setFilteredTransactions] = useState([]);
   const [selectedCustomer, setSelectedCustomer] = useState(null);
   const [searchQuery, setSearchQuery] = useState("");
   const chartContainerRef = useRef(null);
   const chartInstanceRef = useRef(null);

   useEffect(() => {
     const getData = async () => {
       const data = await getDataBase();
       setCustomers(data.customers);
       setTransactions(data.transactions);
       setTransactionsAmount(data.transactions);
       setTransactionsId(data.transactions);
       setFilteredTransactions(data.transactions);
     };
     getData();
   }, []);

   const handleFilterCustomerID = (customerId) => {
     let filtered = transactionsAmount;
     filtered = filtered.filter(transaction => transaction.customer_id === parseInt(customerId));
     setFilteredTransactions(filtered);
     setTransactionsId(transactions.filter(transaction => transaction.customer_id === parseInt(customerId)));
   };

   const handleFilterAmount = (amount) => {
     let filtered = transactionsId;
     filtered = filtered.filter(transaction => transaction.amount >= parseInt(amount));
     setFilteredTransactions(filtered);
     setTransactionsAmount(transactions.filter(transaction => transaction.amount >= parseInt(amount)));
   };

   const handleSelectCustomer = (customerId) => {
     setSelectedCustomer(customers.find(customer => customer.id === parseInt(customerId)));
   };

   const handleSearch = (query) => {
     setSearchQuery(query);
     const filtered = transactions.filter(transaction =>
       transaction.customer_id.toString().includes(query) ||
       customers.find(customer => customer.id === transaction.customer_id)?.name.toLowerCase().includes(query.toLowerCase())
     );
     setFilteredTransactions(filtered);
   };

   const chartData = () => {
     if (!selectedCustomer) return {};

     const customerTransactions = transactions.filter(transaction => transaction.customer_id === selectedCustomer.id);
     const dates = [...new Set(customerTransactions.map(transaction => transaction.date))];
     const amounts = dates.map(date => {
       return customerTransactions.filter(transaction => transaction.date === date).reduce((sum, transaction) => sum + transaction.amount, 0);
     });

     return {
       labels: dates,
       datasets: [{
         label: `Total amount per day for ${selectedCustomer.name}`,
         data: amounts,
         fill: false,
         borderColor: 'rgb(75, 192, 192)',
         tension: 0.1
       }]
     };
   };

   useEffect(() => {
     if (chartInstanceRef.current) {
       chartInstanceRef.current.destroy();
     }

     if (selectedCustomer && chartContainerRef.current) {
       chartInstanceRef.current = new Chart(chartContainerRef.current, {
         type: 'line',
         data: chartData(),
         options: {
           responsive: true,
         },
       });
     }
   }, [selectedCustomer]);

   return ( 
<>
    <Navbar/>
     <div className="container my-4">
       <h1 className="text-center text-primary mb-4">Data Viewer</h1>
       <div className="mb-4 p-4 bg-white shadow rounded-lg d-flex">
         <div className="w-50 p-4">
           <label className="form-label">Filter by customer:</label>
           <select className="form-select mb-3" onChange={(e) => handleFilterCustomerID(e.target.value)}>
             <option value="">All</option>
             {customers.map(customer => (
               <option key={customer.id} value={customer.id}>{customer.name}</option>
             ))}
           </select>
         </div>
         <div className="w-50 p-4">
           <label className="form-label">Filter by amount:</label>
           <input 
             type="number" 
             className="form-control mb-3" 
             onChange={(e) => handleFilterAmount(e.target.value)} 
           />
         </div>
       </div>
       <div className="mb-4 p-4 bg-white shadow rounded-lg">
         <label className="form-label">Search:</label>
         <input 
           type="text" 
           className="form-control" 
           value={searchQuery} 
           onChange={(e) => handleSearch(e.target.value)} 
         />
       </div>
       <table className="table table-bordered table-hover bg-white">
         <thead className="table-primary">
           <tr>
             <th>Customer</th>
             <th>Date</th>
             <th>Amount</th>
           </tr>
         </thead>
         <tbody>
           {filteredTransactions.map(transaction => (
             <tr key={transaction.id}>
               <td>{customers.find(customer => customer.id === transaction.customer_id)?.name}</td>
               <td>{transaction.date}</td>
               <td>{transaction.amount}</td>
             </tr>
           ))}
         </tbody>
       </table>
       <div className="mt-4 p-4 bg-info shadow rounded-lg">
         <label className="form-label">Select customer for chart:</label>
         <select 
           className="form-select" 
           onChange={(e) => handleSelectCustomer(e.target.value)}
         >
           <option value="">None</option>
           {customers.map(customer => (
             <option key={customer.id} value={customer.id}>{customer.name}</option>
           ))}
         </select>
       </div>
       {selectedCustomer && <div className="mt-4 p-4 bg-white shadow rounded-lg">
         <canvas ref={chartContainerRef}></canvas>
       </div>}
     </div> 
     </>
   );
 }


export default App;
