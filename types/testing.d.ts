/* eslint-disable @typescript-eslint/no-explicit-any */
// This file adds the type definitions for jest-dom
import "@testing-library/jest-dom";

// Re-export screen and waitFor from testing-library
declare module "@testing-library/react" {
    export const screen: any;
    export const waitFor: any;
}

// Ensure userEvent is properly exported
declare module "@testing-library/user-event" {
    const userEvent: any;
    export default userEvent;
}
