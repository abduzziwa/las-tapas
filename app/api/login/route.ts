// // app/api/login/login.ts
// import { NextApiRequest, NextApiResponse } from 'next';
// import connectToDatabase from '../models/Connection';
//  // Adjust the path as needed

// export const POST = async (req: NextApiRequest, res: NextApiResponse) => {
//         const { employeeId } = req.body;
//         console.log('Received employeeId:', employeeId); // Debugging line

//         try {
//             const mongoose = await connectToDatabase();
//             // const database = mongoose.connection.db;
//             const employee = await Employees.findOne({ employeeId });
//             console.log('Employee found:', employee); // Debugging line

//             if (employee) {
//                 res.status(200).json({ role: employee.role });
//             } else {
//                 res.status(401).json({ message: 'Invalid employee ID' });
//             }
//         } catch (error) {
//             console.error('Error connecting to database:', error); // Debugging line
//             res.status(500).json({ message: 'Internal Server Error' });
//         }
// };

import { NextResponse } from 'next/server';
import connectToDatabase from '../models/Connection';
import { Employees } from '../models/employees';

export async function POST(req: Request) {
    try {
        await connectToDatabase();

        // Parse the request body
        const { employeeId } = await req.json();

        

        let result;
        if (employeeId) {
            // Find employee with a specific id
            result = await Employees.find({ employeeId });
            if (!result) {
                return NextResponse.json({ message: 'Employee not found' }, { status: 404 });
            }
        } else {
            // No id provided, fetch all employees
            result = await Employees.find();
        }

        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        console.error('Error fetching employees:', error);
        return NextResponse.json({ message: 'Error fetching employees' }, { status: 500 });
    }
}
