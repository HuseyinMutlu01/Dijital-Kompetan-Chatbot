export interface Message {
  text: string;
  isUser: boolean;
  clickableCompanies?: string[];
}

export interface ConfirmationState {
  suggestedCompany: string | null;
  originalInput: string;
} | null;