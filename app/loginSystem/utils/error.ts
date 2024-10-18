export const setError = (message: string | null, setErrorMessage: (message: string | null) => void, setCountdown: (count: number) => void) => {
    setErrorMessage(message);
    setCountdown(10);
};
