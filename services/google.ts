
/**
 * Mock service for Google Integrations.
 * In a production environment, this would use gapi (Google API Client Library)
 * or the Google Identity Services SDK.
 */

export interface GoogleUser {
    id: string;
    name: string;
    email: string;
    picture: string;
}

export const googleAuth = {
    signIn: async (): Promise<GoogleUser> => {
        // Simulating OAuth popup
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    id: 'google-123',
                    name: 'Fozilbek Google',
                    email: 'fozilbek@example.com',
                    picture: 'https://lh3.googleusercontent.com/a/ACg8ocL...'
                });
            }, 1000);
        });
    }
};

export const googleCalendar = {
    syncTodo: async (todo: any) => {
        console.log(`Syncing "${todo.text}" to Google Calendar for Day ${todo.payDay}`);
        // Mocking event creation
        return `evt_${Math.random().toString(36).substr(2, 9)}`;
    },
    deleteTodo: async (eventId: string) => {
        console.log(`Deleting Google Calendar event: ${eventId}`);
        return true;
    }
};

export const googleSheets = {
    exportData: async (data: any) => {
        console.log("Exporting data to Google Sheets in 'Web Page' style table format...");
        // Mocking URL of the created sheet
        return "https://docs.google.com/spreadsheets/d/mock-id/edit";
    }
};

export const googleDrive = {
    saveBackup: async (jsonContent: string) => {
        console.log("Saving JSON backup to Google Drive AppData folder...");
        return true;
    }
};
