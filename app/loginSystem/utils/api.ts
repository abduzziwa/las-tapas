export const handleAction = async (action: string, payload: any, setError: (message: string | null) => void) => {
    console.log(`Action: ${action} with payload:`, payload);

    try {
        // Check if the employee exists
        const employeeResponse = await fetch(`/api/checkEmployee`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ employeeId: payload.employeeId }),
        });

        if (!employeeResponse.ok) {
            const errorData = await employeeResponse.json();
            setError(`Employee ID does not exist: ${errorData.error || 'Unknown error'}`);
            return;
        }

        const response = await fetch(`/api/${action}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                setError(null);
                return data; // Return the response data
            } else {
                setError(`Action failed: ${data.error || 'Unknown error'}`);
            }
        } else {
            const errorData = await response.json();
            setError(`Failed to perform action: ${errorData.error || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Error during fetch:', error);
        setError('An unexpected error occurred');
    }
};
